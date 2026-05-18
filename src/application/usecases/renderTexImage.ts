// MathJax v4 ではフォントデータや一部の TeX 拡張が必要に応じて動的読み込みされる。
// この副作用 import で Node 環境向けの動的ローダ(ESM import ベース)を登録する。
import "@mathjax/src/js/util/asyncLoad/esm.js";
import { MathJaxMhchemFontExtension } from "@mathjax/mathjax-mhchem-font-extension/js/svg.js";
import { liteAdaptor } from "@mathjax/src/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "@mathjax/src/js/handlers/html.js";
import { TeX } from "@mathjax/src/js/input/tex.js";
import { mathjax } from "@mathjax/src/js/mathjax.js";
import { SVG } from "@mathjax/src/js/output/svg.js";
import sharp from "sharp";
import { texPackages } from "./texPackages";

/** 1ex あたりのピクセル数。数式画像の解像度(大きさ)を決める。 */
const PIXELS_PER_EX = 32;
/** 数式の周囲に付ける余白(px)。 */
const PADDING_PX = 24;
/** 出力画像の最大辺長(px)。巨大な数式によるメモリ枯渇を防ぐ。 */
const MAX_DIMENSION_PX = 4096;
/** 画像の背景色。Discord のテーマに依存せず視認できるよう白で固定する。 */
const BACKGROUND_COLOR = "#ffffff";

/**
 * TeX の構文エラーなど、ユーザー入力に起因する変換失敗を表すエラー。
 * 想定外の内部エラーと区別し、利用者向けのメッセージを返すために使う。
 */
export class InvalidTexError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidTexError";
  }
}

// MathJax はグローバルなハンドラ登録を伴うため、モジュール読み込み時に一度だけ初期化する。
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const svgOutput = new SVG({ fontCache: "local" });
// mhchem(化学式)用のグリフは v4 のフォント本体に含まれない。フォント拡張を
// 登録しないと `\ce{}` の結合矢印などが欠落するため、ここで追加する。
svgOutput.addExtension(MathJaxMhchemFontExtension);

const mathDocument = mathjax.document("", {
  InputJax: new TeX({
    packages: texPackages,
    // TeX の構文エラーを画像に埋め込まず、例外として扱う。
    formatError: (_jax: unknown, error: unknown) => {
      throw error;
    },
  }),
  OutputJax: svgOutput,
});

/**
 * TeX(LaTeX) の数式文字列を PNG 画像に変換する。
 *
 * @param tex ディスプレイ数式として描画する TeX 文字列
 * @returns PNG 画像のバッファ
 * @throws {InvalidTexError} TeX の構文が不正な場合
 */
export async function renderTexImage(tex: string): Promise<Buffer> {
  const svg = await convertTexToSvg(tex);
  return await convertSvgToPng(svg);
}

/** TeX 文字列を MathJax で SVG 文字列に変換する。 */
async function convertTexToSvg(tex: string): Promise<string> {
  try {
    // MathJax v4 ではフォントや拡張が非同期に読み込まれることがあるため、
    // 読み込み完了を待てる convertPromise を使う(同期版の convert では待てない)。
    const container = await mathDocument.convertPromise(tex, { display: true });
    return stripLatexAttributes(adaptor.innerHTML(container));
  } catch (error) {
    throw new InvalidTexError(extractErrorMessage(error));
  }
}

/**
 * SVG から `data-latex` / `data-latex-item` 属性を取り除く。
 * MathJax v4 は各ノードに元の TeX をこれらの属性として埋め込むが、`<` や `>`
 * を含む入力(例: mhchem の `<=>`)では属性値が不正な XML となり、sharp の
 * SVG 解析が失敗する。画像化には不要な属性なので除去する。
 */
function stripLatexAttributes(svg: string): string {
  return svg.replace(/\s+data-latex(?:-item)?="[^"]*"/g, "");
}

/**
 * エラー値から表示用のメッセージ文字列を取り出す。
 * MathJax の TeXError は Error を継承しないため、message プロパティを直接参照する。
 */
function extractErrorMessage(error: unknown): string {
  if (typeof error === "string") {
    return error;
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return String(error);
}

/** SVG 文字列を白背景の PNG 画像に変換する。 */
async function convertSvgToPng(svg: string): Promise<Buffer> {
  return await sharp(Buffer.from(applyPixelDimensions(svg)))
    // 透過部分を白で塗りつぶし、Discord のテーマに依存せず視認できるようにする。
    .flatten({ background: BACKGROUND_COLOR })
    .extend({
      top: PADDING_PX,
      bottom: PADDING_PX,
      left: PADDING_PX,
      right: PADDING_PX,
      background: BACKGROUND_COLOR,
    })
    .png()
    .toBuffer();
}

/**
 * MathJax が出力する SVG のルート要素の width/height を ex 単位から px に書き換える。
 * ex 単位のままだと描画ライブラリ依存で大きさが安定しないため、明示的に px を指定する。
 */
function applyPixelDimensions(svg: string): string {
  const widthMatch = svg.match(/width="([\d.]+)ex"/);
  const heightMatch = svg.match(/height="([\d.]+)ex"/);
  if (!widthMatch || !heightMatch) {
    // ex 指定が見つからない場合は書き換えず、描画ライブラリの既定に委ねる。
    return svg;
  }

  let width = Number.parseFloat(widthMatch[1]) * PIXELS_PER_EX;
  let height = Number.parseFloat(heightMatch[1]) * PIXELS_PER_EX;

  // 過大な数式は最大辺長に収まるよう、縦横比を保ったまま縮小する。
  const scale = Math.min(1, MAX_DIMENSION_PX / Math.max(width, height));
  width = Math.max(1, Math.ceil(width * scale));
  height = Math.max(1, Math.ceil(height * scale));

  return svg
    .replace(/width="[\d.]+ex"/, `width="${width}"`)
    .replace(/height="[\d.]+ex"/, `height="${height}"`);
}
