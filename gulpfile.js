const gulp = require('gulp');
const obt = require('origami-build-tools');

gulp.task('build', function() {
	
	return obt.build.js({
		js: './src/scripts/main.js',
		buildJs: 'main.js',
		buildFolder: './build/scripts/',
		sourcemaps : false
	});

});

gulp.task('default', ['build']);