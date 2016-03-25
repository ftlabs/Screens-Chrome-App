'use strict';

/*global chrome*/

chrome.app.runtime.onLaunched.addListener(function(e) {

	console.log(e);

	chrome.app.window.create('window.html', {
			'outerBounds': {
				'width': 1024,
				'height': 768
			},
			'state' : 'fullscreen'
		}
	);
});

chrome.power.requestKeepAwake("display");