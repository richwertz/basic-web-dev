var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
      //lets components be fully modular; each module is preceded by an underscore in its filename.
    stylish = require('jshint-stylish'),
      //stylizes js errors and warnings
    jshint = require('gulp-jshint'),
      //detects errors in js
    w3cjs = require('gulp-w3cjs'),
      //validates html
    compass = require('gulp-compass'),
      //sourcemapping
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
      //minimizer for js
    minifyHTML = require('gulp-minify-html'),
      //minimizer for html
    concat = require('gulp-concat'),
      //concatenates js files
    path = require('path');
    webserver = require('gulp-webserver');
      //runs a local webserver for viewing real-time changes


var env,
    jsSources,
    sassSources,
    htmlSources,
    outputDir,
    sassStyle;

env = 'dev';
//When ready to build, change env to 'development'

if (env==='dev') {
  outputDir = 'builds/development/';
  sassStyle = 'expanded';
} else {
  outputDir = 'builds/production/';
  sassStyle = 'compressed';
}

jsSources = [
  'components/scripts/jqloader.js',
  'components/scripts/TweenMax.min.js',
  'components/scripts/jquery.scrollmagic.min.js',
  'components/scripts/script.js'
];
sassSources = ['components/sass/style.scss'];
htmlSources = [outputDir + '*.html'];

gulp.task('hello', function() {
  console.log('hey man... this dev environment works pretty well, huh!');
});

gulp.task('js', function() {
  'use strict';

  gulp.src('components/scripts/script.js')
    .pipe(jshint('./.jshintrc'))
    .pipe(jshint.reporter('jshint-stylish'));

  gulp.src(jsSources)
    .pipe(concat('script.js'))
    .pipe(browserify())
    .on('error', gutil.log)
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
});

gulp.task('compass', function() {
  'use strict';
  gulp.src(sassSources)
    .pipe(compass({
      sass: 'components/sass',
      css: outputDir + 'css',
      image: outputDir + 'images',
      style: sassStyle,
      sourcemap: true,
      require: ['susy', 'breakpoint']
    })
    .on('error', gutil.log))

});

gulp.task('watch', function() {
  'use strict';
  gulp.watch(jsSources, ['js']);
  gulp.watch(['components/sass/*.scss', 'components/sass/*/*.scss'], ['compass']);
  gulp.watch('builds/development/*.html', ['html']);
});

gulp.task('html', function() {
  'use strict';
  gulp.src('builds/development/*.html')
    .pipe(gulpif(env === 'production', minifyHTML()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir)))
});

// Copy images to production
gulp.task('move', function() {
  'use strict';
  gulp.src('builds/development/images/**/*.*')
  .pipe(gulpif(env === 'production', gulp.dest(outputDir+'images')));
});

gulp.task('webserver', function() {
    gulp.src('builds/development/')
        .pipe(webserver({
            livereload: true,
            open: true
        }));
});

gulp.task('default', ['watch', 'html', 'js', 'compass', 'move', 'webserver']);
