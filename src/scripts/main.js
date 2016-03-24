'use strict';

/*global window, chrome, document*/

const chromeStorage = {
	setItem : function(storageKey, data, callback){
		const storageObj = {};
		storageObj[storageKey] = JSON.stringify(data);
		
		chrome.storage.local.set( storageObj, callback )
	},
	getItem : function(storageKey, callback){
		chrome.storage.local.get(storageKey, function(d){
			if(Object.keys(d).length === 0){
				callback(null);
			} else {
				d = JSON.parse(d[storageKey])
				callback(d);
			}
		});
	}
};

const view = document.querySelector('webview');

window.onload = function() {
	
	setTimeout(function(){
		
		const Viewer = require('ftlabs-screens-viewer');
		const viewer = new Viewer('http://ftlabs-screens.herokuapp.com', chromeStorage);
		// const viewer = new Viewer('http://local.ft.com:8080', chromeStorage);
		viewer.start();
		
		viewer.on('change', e => {
			console.log('change', e);
			view.src = e;
		});

		// A reload has been forced
		viewer.on('reload', e => {
			console.log('reload', e);
			view.reload();
		});

		// E.g. The viewer has started but cannot connected to the server.
		viewer.on('not-connected', e => {
			console.log('n-connected', e);
		});
		
		viewer.on('ready', e => {
			console.log("Viewer ready");
			view.src = e;
		})
		
	}, 3000);

}