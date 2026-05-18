/**
 * `/tex` コマンドで有効化する TeX(LaTeX) 拡張パッケージの一覧。
 *
 * MathJax v3 までは `AllPackages` を import すれば全拡張をまとめて読み込めたが、
 * v4 で `AllPackages` は廃止された。代わりに、利用する拡張の Configuration
 * モジュールを個別に import して登録したうえで、パッケージ名の配列を `TeX`
 * 入力 jax に渡す必要がある。
 *
 * 下記の副作用 import で各拡張を MathJax に登録し、`texPackages` でその名前を
 * 列挙する。内容は MathJax v3 の `AllPackages` と同じ拡張一式で、`/tex` の
 * 対応範囲を v3 から変えないために再現している。
 */
import "@mathjax/src/js/input/tex/base/BaseConfiguration.js";
import "@mathjax/src/js/input/tex/action/ActionConfiguration.js";
import "@mathjax/src/js/input/tex/ams/AmsConfiguration.js";
import "@mathjax/src/js/input/tex/amscd/AmsCdConfiguration.js";
import "@mathjax/src/js/input/tex/bbox/BboxConfiguration.js";
import "@mathjax/src/js/input/tex/boldsymbol/BoldsymbolConfiguration.js";
import "@mathjax/src/js/input/tex/braket/BraketConfiguration.js";
import "@mathjax/src/js/input/tex/bussproofs/BussproofsConfiguration.js";
import "@mathjax/src/js/input/tex/cancel/CancelConfiguration.js";
import "@mathjax/src/js/input/tex/cases/CasesConfiguration.js";
import "@mathjax/src/js/input/tex/centernot/CenternotConfiguration.js";
import "@mathjax/src/js/input/tex/color/ColorConfiguration.js";
import "@mathjax/src/js/input/tex/colortbl/ColortblConfiguration.js";
import "@mathjax/src/js/input/tex/configmacros/ConfigMacrosConfiguration.js";
import "@mathjax/src/js/input/tex/empheq/EmpheqConfiguration.js";
import "@mathjax/src/js/input/tex/enclose/EncloseConfiguration.js";
import "@mathjax/src/js/input/tex/extpfeil/ExtpfeilConfiguration.js";
import "@mathjax/src/js/input/tex/gensymb/GensymbConfiguration.js";
import "@mathjax/src/js/input/tex/html/HtmlConfiguration.js";
import "@mathjax/src/js/input/tex/mathtools/MathtoolsConfiguration.js";
import "@mathjax/src/js/input/tex/mhchem/MhchemConfiguration.js";
import "@mathjax/src/js/input/tex/newcommand/NewcommandConfiguration.js";
import "@mathjax/src/js/input/tex/noerrors/NoErrorsConfiguration.js";
import "@mathjax/src/js/input/tex/noundefined/NoUndefinedConfiguration.js";
import "@mathjax/src/js/input/tex/tagformat/TagFormatConfiguration.js";
import "@mathjax/src/js/input/tex/textcomp/TextcompConfiguration.js";
import "@mathjax/src/js/input/tex/textmacros/TextMacrosConfiguration.js";
import "@mathjax/src/js/input/tex/unicode/UnicodeConfiguration.js";
import "@mathjax/src/js/input/tex/upgreek/UpgreekConfiguration.js";
import "@mathjax/src/js/input/tex/verb/VerbConfiguration.js";

/** `TeX` 入力 jax の `packages` オプションに渡す拡張パッケージ名の一覧。 */
export const texPackages: string[] = [
  "base",
  "action",
  "ams",
  "amscd",
  "bbox",
  "boldsymbol",
  "braket",
  "bussproofs",
  "cancel",
  "cases",
  "centernot",
  "color",
  "colortbl",
  "empheq",
  "enclose",
  "extpfeil",
  "gensymb",
  "html",
  "mathtools",
  "mhchem",
  "newcommand",
  "noerrors",
  "noundefined",
  "upgreek",
  "unicode",
  "verb",
  "configmacros",
  "tagformat",
  "textcomp",
  "textmacros",
];
