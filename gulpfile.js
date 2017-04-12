const gulp = require('gulp');
const process = require('gulp-preprocess');
const argv = require('yargs').argv;

gulp.task('process', function() {
	
	var host = 'http://ftlabs-screens.herokuapp.com';

	if(argv.build === 'test'){
		host = 'http://ftlabs-screens-test.herokuapp.com';	
	}
	
	gulp.src('./src/scripts/main.js')
		.pipe( process( { context : {
				host : host
			}
		} ) )
		.pipe( gulp.dest('./process/scripts/') )
	;
	
});

gulp.task('default', ['process']);