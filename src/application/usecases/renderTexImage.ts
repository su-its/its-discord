import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { mathjax } from "mathjax-full/js/mathjax.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import sharp from "sharp";

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
const mathDocument = mathjax.document("", {
  InputJax: new TeX({
    packages: AllPackages,
    // TeX の構文エラーを画像に埋め込まず、例外として扱う。
    formatError: (_jax: unknown, error: unknown) => {
      throw error;
    },
  }),
  OutputJax: new SVG({ fontCache: "local" }),
});

/**
 * TeX(LaTeX) の数式文字列を PNG 画像に変換する。
 *
 * @param tex ディスプレイ数式として描画する TeX 文字列
 * @returns PNG 画像のバッファ
 * @throws {InvalidTexError} TeX の構文が不正な場合
 */
export async function renderTexImage(tex: string): Promise<Buffer> {
  const svg = convertTexToSvg(tex);
  return await convertSvgToPng(svg);
}

/** TeX 文字列を MathJax で SVG 文字列に変換する。 */
function convertTexToSvg(tex: string): string {
  try {
    const container = mathDocument.convert(tex, { display: true });
    return adaptor.innerHTML(container);
  } catch (error) {
    throw new InvalidTexError(extractErrorMessage(error));
  }
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
