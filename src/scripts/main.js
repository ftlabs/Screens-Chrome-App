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

function updateIDs() {
	[].slice.call(document.querySelectorAll('.screen-id')).forEach(function(el) {
		el.innerHTML = viewer.getData('id');
	});
}

const view = document.querySelector('webview');

window.onload = function() {
	
	const Viewer = require('ftlabs-screens-viewer');
	const viewer = new Viewer('http://ftlabs-screens.herokuapp.com', chromeStorage);
		
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
		document.body.classList.add('network-issue');
	});
	
	viewer.on('ready', e => {
		console.log("Viewer ready");
		view.src = e;
	});
	
	viewer.on('id-change', function () {
		updateIDs();
	});
	
	viewer.start();
	
}