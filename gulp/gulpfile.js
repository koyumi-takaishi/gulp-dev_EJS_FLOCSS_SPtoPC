// gulpのメソッド呼び出し
// src：参照元指定、dest：出力先指定、watch：ファイル監視、series：直列処理、parallel：並列処理
const { src, dest, watch, series, parallel } = require("gulp");

// 入出力先指定
const srcBase = '../src';
const distBase = '../dist';
const srcPath = {
  css: srcBase + '/sass/**/*.scss',
  img: srcBase + '/images/**/*',
  ejs: srcBase + '/ejs/**/!(_)*.ejs',
  ejs_json: srcBase + '/ejs/data/metaData.json',
  ejs_watch: [srcBase + '/ejs/**/*.ejs',srcBase + '/ejs/**/*.json'],
}
const distPath = {
  css: distBase + '/css/',
  img: distBase + '/images/',
  ejs: distBase + '/',
  js: distBase + '/js/**/*.js'
}

// ローカルサーバー立ち上げ
const browserSync = require("browser-sync");
const browserSyncOption = {
    server: distBase // dist直下をルートとする
}
const browserSyncFunc = () => {
    browserSync.init(browserSyncOption);
}
const browserSyncReload = (done) => {
    browserSync.reload();
    done();
}

// Sassコンパイル
const sass = require('gulp-sass')(require('sass')); // sassコンパイル（DartSass対応）
const sassGlob = require('gulp-sass-glob-use-forward'); // globパターンを使用可にする
const plumber = require("gulp-plumber"); // エラーが発生しても強制終了させない
const notify = require("gulp-notify"); // エラー発生時のアラート出力
const postcss = require("gulp-postcss"); // PostCSS利用
const cssnext = require("postcss-cssnext"); // 最新CSS使用を先取り
const sourcemaps = require("gulp-sourcemaps"); // ソースマップ生成
const browsers = [ // 対応ブラウザの指定
  'last 2 versions',
  '> 5%',
  'ie = 11',
  'not ie <= 10',
  'ios >= 8',
  'and_chr >= 5',
  'Android >= 5',
]
const cssSass = () => {
  return src(srcPath.css)
    .pipe(sourcemaps.init()) // ソースマップの初期化
    .pipe(
      plumber({ // エラーが出ても処理を止めない
          errorHandler: notify.onError('Error:<%= error.message %>')
      }))
    .pipe(sassGlob()) // globパターンを使用可にする
    .pipe(sass.sync({ // sassコンパイル
      includePaths: ['src/sass'], // 相対パス省略
      outputStyle: 'expanded' // 出力形式をCSSの一般的な記法にする
    }))
    .pipe(postcss([cssnext({
      features: {
        rem: false // rem単位をpxに変換しない
      }
    },browsers)])) // 最新CSS使用を先取り
    .pipe(sourcemaps.write('./')) // ソースマップの出力先をcssファイルから見たパスに指定
    .pipe(dest(distPath.css)) // 
    .pipe(notify({ // エラー発生時のアラート出力
      message: 'Sassをコンパイルしました！',
      onLast: true
    }))
}

const ejs = require("gulp-ejs");
const rename = require("gulp-rename");
const replace = require("gulp-replace");
const htmlbeautify = require("gulp-html-beautify");
const fs = require("fs"); //JSONファイル操作用

const ejsCompile = (done) => {

  const json = JSON.parse(fs.readFileSync(srcPath.ejs_json));

  src(srcPath.ejs)
    .pipe(
      //エラーが出ても処理を止めない
      plumber({
        errorHandler: notify.onError('Error:<%= error.message %>')
      }))
    .pipe(ejs({
      json: json,
    }))
    .pipe(
      htmlbeautify({
        indent_size: 2, //インデントサイズ
        indent_char: " ", // インデントに使う文字列。\tにするとタブでインデント
        max_preserve_newlines: 0, // 許容する連続改行数。0にすると改行を全て削除してコンパイル
        preserve_newlines: true, // コンパイル前のコードの改行を維持する。改行を無視して整形したいならfalseにする
        indent_inner_html: false, //// <head>と<body>をインデントする
        extra_liners: [], // 終了タグの前に改行を入れるタグ。配列で指定。<head>, <body>, <html>の前で改行したくない場合は[]を指定
      })
    )
    .pipe(rename({
      extname: ".html"
    })) //拡張子をhtmlに
    .pipe(replace(/[\s\S]*?(<!DOCTYPE)/, "$1"))
    .pipe(dest(distPath.ejs))
    .pipe(browserSync.stream())
    .pipe(notify({
      message: 'EJSをコンパイルしました！',
      onLast: true
    }));
    // 完了を通知
  done();
};

// 画像圧縮
const imagemin = require("gulp-imagemin"); // 画像圧縮
const imageminMozjpeg = require("imagemin-mozjpeg"); // jpgの高圧縮に必要
const imageminPngquant = require("imagemin-pngquant"); // pngの高圧縮に必要
const imageminSvgo = require("imagemin-svgo");  // svgの高圧縮に必要
const imgImagemin = () => {
  return src(srcPath.img)
  .pipe(imagemin([
    imageminMozjpeg({
      quality: 80
    }),
    imageminPngquant(),
    imageminSvgo({
      plugins: [{
        removeViewbox: false // viewBox属性を削除しない
      }]
    })],
    {
      verbose: true // コンソールに圧縮率などを出力する
    }
  ))
  .pipe(dest(distPath.img))
}

// ファイルの変更を検知
const watchFiles = () => {
  watch(srcPath.css, series(cssSass, browserSyncReload))
  watch(srcPath.ejs_watch, series(ejsCompile, browserSyncReload))
  watch(srcPath.img, series(imgImagemin, browserSyncReload))
  watch(distPath.js, series(browserSyncReload))
}

// clean
const del = require('del');
const delPath = {
	css: distBase + '/css/styles.css',
	cssMap: distBase + '/css/styles.css.map',
  img: distBase + '/images/',
  ejs: distBase + '/**/*.html'
}
const clean = (done) => {
  del(delPath.css, { force: true });
  del(delPath.cssMap, { force: true });
  del(delPath.ejs, { force: true });
  del(delPath.img, { force: true });
  done();
};

// 実行
exports.default = series(series(clean, imgImagemin, cssSass, ejsCompile), parallel(watchFiles, browserSyncFunc));