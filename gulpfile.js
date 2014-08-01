// Node modules
var fs = require('fs'), vm = require('vm'), merge = require('deeply'), chalk = require('chalk'), es = require('event-stream');

// Gulp and plugins
var gulp = require('gulp'), rjs = require('gulp-requirejs-bundler'), concat = require('gulp-concat'), clean = require('gulp-clean'),
    replace = require('gulp-replace'), minifyCSS = require('gulp-minify-css'), less = require("gulp-less"), imagemin = require('gulp-imagemin'),
	pngcrush = require('imagemin-pngcrush'), uglify = require('gulp-uglify'), htmlreplace = require('gulp-html-replace');
var streamqueue = require("streamqueue");

// Config
var requireJsRuntimeConfig = vm.runInNewContext(fs.readFileSync('src/app/require.config.js') + '; require;');
    requireJsOptimizerConfig = merge(requireJsRuntimeConfig, {
        out: 'scripts.js',
        baseUrl: './src',
        name: 'app/startup',
        paths: {
            requireLib: 'bower_modules/requirejs/require'
        },
        include: [
            'requireLib',
            'components/nav-bar/nav-bar',
            'components/home-page/home',
			'components/kingdom/kingdom'
        ],
        insertRequire: ['app/startup'],
        bundles: {
			'about-page' : ['text!components/about-page/about.html']
        }
    });

// Discovers all AMD dependencies, concatenates together all required .js files, minifies them
// turn off preserve comments
gulp.task('js', function () {
    return rjs(requireJsOptimizerConfig)
		.pipe(uglify())
        //.pipe(uglify({ preserveComments: 'some' }))
        .pipe(gulp.dest('./dist/'));
});

gulp.task('images', function () {
	return gulp.src('src/images/*')
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{removeViewBox: false}],
			use: [pngcrush()]
		}))
		.pipe(gulp.dest('dist/images'));
});



// Compiles less files then concatenates all CSS lib files, rewrites relative paths to Bootstrap fonts, copies Bootstrap fonts
gulp.task('css', ['compile-less'], function () {
	// switched to using sreamqueue for concatenating the bowerCss and appCss because the app css needs to be appended after the bootstrap styles
	var bowerCss = gulp.src('src/bower_modules/components-bootstrap/css/bootstrap.min.css')
            .pipe(replace(/url\((')?\.\.\/fonts\//g, 'url($1fonts/')),
        appCss = gulp.src('src/css/app.css'),
        combinedCss = streamqueue({ objectMode: true },
			bowerCss, appCss).pipe(concat('css.css')),
        fontFiles = gulp.src('./src/bower_modules/components-bootstrap/fonts/*', { base: './src/bower_modules/components-bootstrap/' });
    return es.concat(combinedCss, fontFiles)
        .pipe(gulp.dest('./dist/'));
});

gulp.task('compile-less', function () {
	gulp.src('src/less/app.less')
		.pipe(less())
		.pipe(minifyCSS())
		.pipe(gulp.dest('src/css'));
});

// Copies index.html, replacing <script> and <link> tags to reference production URLs
gulp.task('html', function() {
    return gulp.src('./src/index.html')
        .pipe(htmlreplace({
            'css': 'css.css',
            'js': 'scripts.js'
        }))
        .pipe(gulp.dest('./dist/'));
});

// Removes all files from ./dist/
gulp.task('clean', function() {
    return gulp.src('./dist/**/*', { read: false })
        .pipe(clean());
});

gulp.task('build', ['html', 'js', 'css', 'images'], function(callback) {
	callback();
	console.log('\nPlaced optimized files in ' + chalk.magenta('dist/\n'));
});

gulp.task('default', function() {
	// watch and compile less files
	gulp.watch('./src/*/**', ['compile-less'], function(callback) {
		callback();
	});
});
