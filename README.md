# gulp-dev_EJS_flocss_SPtoPC

## 動作が確認できている環境
- Nodeバージョン v14.16.0
- Gulp 4系

## 使い方
- ダウンロードしたフォルダをvscodeで開く
- ターミナルを開き、「 cd gulp 」とコマンドを入力
- ターミナルを開き、「 npm i 」とコマンドを入力
- gulpフォルダ直下に、node_modulesとpackage-lock.jsonが生成されるのを確認する
- 「 npx gulp 」とコマンドを入力するとgulpが動き出す

## 作業ディレクトリ
- EJS、sassの記述はsrcフォルダの中で行う
- 画像はsrcフォルダのimagesの中に格納する
- コンパイルされたHTMLとCSS、圧縮された画像はdistフォルダの中に出力される
- jsはdist直下のjsファイルに直接記述する（圧縮なし）

## 備考
- CSS設計はFLOCSS(https://github.com/hiloki/flocss )を採用
- スマホファースト
- rem記述を前提# gulp-dev_EJS_FLOCSS_SPtoPC