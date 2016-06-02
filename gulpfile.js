const gulp = require('gulp');
const process = require('gulp-preprocess');
const argv = require('yargs').argv;

gulp.task('process', function() {
	
	var host = 'http://ftlabs-screens.herokuapp.com';

	if(argv.deploy === 'test'){
		host = 'http://ftlabs-screens-test.herokuapp.com';	
	}
	
	gulp.src(['./src/scripts/main.js'])
		.pipe( process( { context : {
				host : host
			}
		}) )
		.pipe( gulp.dest('./process/scripts/') )
	;
	
	gulp.src(['./src/manifest.json'])
		.pipe( process( { context : {
				test : "-TEST"
			}
		}) )
		.pipe( gulp.dest('./process') )
	;
	
});

gulp.task('default', ['process']);