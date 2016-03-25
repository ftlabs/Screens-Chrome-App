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
const beacon = window.eddystone;
let registered_adv;

function registerBeacon(url){
	
	if(beacon.advertisements.length > 0){
		
		const registeredAdvertisments = beacon.advertisements.map(advertisement => {
			return advertisement.unregisterAdvertisement()
				.then(() => console.log('Unregistered successfully'))
				.catch(error => console.log('Couldn\'t unregister the advertisement: ' + error.message))
			;
		});
		Promise.all(registeredAdvertisments)
			.then(url => {
				registerBeacon(url);
			});
		;
	} else {
		
		beacon.registerAdvertisement({
			type: 'url',
			url: url,
			advertisedTxPower: -20
		}).then(advertisement => {
			registered_adv = advertisement;
			console.log('Advertising: ' + advertisement.url)
		}).catch(error => console.log(error.message));
			
	}

}

window.onload = function() {

	const Viewer = require('ftlabs-screens-viewer');
	const viewer = new Viewer('http://ftlabs-screens.herokuapp.com', chromeStorage);
		
	function updateIDs() {
		[].slice.call(document.querySelectorAll('.screen-id')).forEach(function(el) {
			el.innerHTML = viewer.getData('id');
		});
	}	
	
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
		
		console.log(viewer.host + "/" + viewer.data.id);
		
		registerBeacon(viewer.host + "/" + viewer.data.id);
		
	});
	
	viewer.on('id-change', function () {
		updateIDs();
		registerBeacon(viewer.host + "/" + viewer.data.id);
	});
	
	viewer.start();

}