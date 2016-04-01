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

const bringDown = (function(){
	
	const bootTime = new Date();
	let targetHour = 24;	
	let restartTime;
	let bringDownSet = false;
	
	function setTimeUntilBD(){
		
		if(bringDownSet){
			console.warn("The bring-down has already been set. You cannot reset it. This system will restart in %d seconds", restartTime);
			return;
		}
		
		// If the targetHour has already passed in the day, the next opportunity is the next day
		// So, here, figure out how long we have to wait until the same time tomorrow.
		if(targetHour < bootTime.getHours()){
			targetHour = 24 - (bootTime.getHours() - targetHour);
		}
		
		const hoursUntilTarget = ((targetHour - bootTime.getHours()) * 60 * 60) * 1000;
		const minutesFromNextHour = ((60 - bootTime.getMinutes()) * 60) * 1000;
		
		const millisecondsUntilEarliestPossibleRestart = hoursUntilTarget - minutesFromNextHour;
		const giveALittle = (60 * 60 * 1000) * Math.random() | 0;
		
		const restartIn = millisecondsUntilEarliestPossibleRestart + giveALittle;
		
		setTimeout(function(){
			
			chrome.runtime.restart();
					
		}, restartIn);
		
		bringDownSet = true;
		restartTime = Date.now() + restartIn;
		
		// The unix time that the Chrome OS device will be restarted at. 
		return restartTime;
		
	}
	
	function getTimeUntilBD(){
		
		return restartTime;
		
	}
	
	return {
		set : setTimeUntilBD,
		get : getTimeUntilBD
	};
	
})();

const view = document.querySelector('webview');

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
	});
	
	viewer.on('id-change', function () {
		updateIDs();
	});
	
	viewer.start();
	
	bringDown.set();
	
}