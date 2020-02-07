const path = require('path');
const exec = require('child_process').exec;
const {lstatSync, readdirSync} = require('fs');

const del = require('del');
const gulp = require('gulp');
const gulpRen = require('gulp-rename');
const gulpSeq = require('gulp-sequence');
const htmlmin = require('gulp-htmlmin');
const gulpif = require('gulp-if');
const jsonmin = require('gulp-jsonmin');

const targetEnv = process.env.TARGET_ENV || 'firefox';
const isProduction = process.env.NODE_ENV === 'production';
const distFolder = process.env.DIST_FOLDER || 'dist';

function clean() {
  return del([`${distFolder}`]);
}

function js(done) {
  exec('webpack --display-error-details --colors', function(
    err,
    stdout,
    stderr
  ) {
    console.log(stdout);
    console.log(stderr);
    done(err);
  });
}

function html() {
  return gulp
    .src('src/**/*.html', {base: '.'})
    .pipe(gulpif(isProduction, htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest(`${distFolder}`));
}

function locale(done) {
  const localesRootDir = path.join(__dirname, 'src/_locales');
  const localeDirs = readdirSync(localesRootDir).filter(function(file) {
    return lstatSync(path.join(localesRootDir, file)).isDirectory();
  });
  localeDirs.forEach(function(localeDir) {
    const localePath = path.join(localesRootDir, localeDir);
    gulp
      .src([
        path.join(localePath, 'messages.json'),
      ])
      .pipe(gulpif(isProduction, jsonmin()))
      .pipe(gulp.dest(path.join(`${distFolder}/_locales`, localeDir)));
  });
  done();
}

function manifest() {
  return gulp
    .src(`src/manifest_${targetEnv}.json`)
    .pipe(gulpif(isProduction, jsonmin()))
    .pipe(gulpRen('manifest.json'))
    .pipe(gulp.dest(`${distFolder}`));
}

function copy(done) {
  gulp
    .src('src/icons/*')
    .pipe(gulp.dest(`${distFolder}/src/assets`));
  gulp
    .src('src/fonts/*')
    .pipe(gulp.dest(`${distFolder}/src/assets`));
  gulp
    .src('node_modules/material-design-icons-iconfont/dist/fonts/*.+(woff2)')
    .pipe(gulp.dest(`${distFolder}/src/assets/files`));
  gulp
    .src('node_modules/typeface-noto-sans/files/noto-sans-latin-400.+(woff2)')
    .pipe(gulp.dest(`${distFolder}/src/assets/files`));
  gulp
    .src('LICENSE')
    .pipe(gulp.dest(`${distFolder}`));
  done();
}

const build = gulp.series(clean, gulp.parallel(js, html, locale, manifest, copy));

exports.default = build;
exports.clean = clean;
