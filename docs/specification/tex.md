# texコマンド
## Description
texを受け取り, 画像を返します.
主に数式を描画することを想定しています.

## Argument
- tex: texを受け取ります

## Detail
1. texを受け取ると, Mathjax APIを用いて, SVGを生成します.
2. 生成したSVGを`sharp`を使用してpngに変換します.
3. `tex_png`ディレクトリに`tex_{timestamp}.png`という形式のファイル名で保存します.
4. 保存した画像をdiscordサーバーで返信します.