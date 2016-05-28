'use strict';

/*global window, chrome, document*/

const visibleEvt = new Event('carousel-content-visible');

const chromeStorage = {
	setItem : function(storageKey, data, callback){
		const storageObj = {};
		storageObj[storageKey] = JSON.stringify(data);

		chrome.storage.local.set( storageObj, callback );
	},
	getItem : function(storageKey, callback){
		chrome.storage.local.get(storageKey, function(d){
			if(Object.keys(d).length === 0){
				callback(null);
			} else {
				d = JSON.parse(d[storageKey]);
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

}());

const views = [].slice.call(document.querySelectorAll('webview'));

function webViewLoaded() {
	const currentActive = document.querySelector('webView.active');
	if (currentActive) kickOutIframe(currentActive);
	this.classList.remove('buffering');
	this.classList.add('active');
	this.removeEventListener('load', webViewLoaded);
	window.dispatchEvent(visibleEvt);
}

function kickOutIframe(webView) {
	webView.classList.remove('active');
	webView.classList.remove('buffering');
	webView.classList.add('done');
	setTimeout(() => webView.src = 'about:blank', 500);
	webView.removeEventListener('contentload', webViewLoaded);

	// remove self from the list
	usedViews.splice(usedViews.indexOf(webView), 1);
}

function prepareIframetoLoad(webView, url) {
	usedViews.push(webView);
	webView.classList.add('buffering');
	webView.classList.remove('done');
	webView.src = url;
	webView.addEventListener('contentload', webViewLoaded);
}

const usedViews = [];
function updateUrl(url) {
	if (!url) {
		return;
	}

	// another url has been added
	if (usedViews.length < views.length) {
		const nextIframe = views.filter(webView => usedViews.indexOf(webView) === -1)[0];
		prepareIframetoLoad(nextIframe, url);
		return;
	}

	// a third has been added kick up the first one so the next one can load
	if (usedViews.length === views.length) {
		const next = usedViews[0];
		kickOutIframe(next);
		prepareIframetoLoad(next, url);

		console.log('Forced Load');

		// load the next webView regardless
		webViewLoaded.bind(usedViews[0])();
		return;
	}
}

window.onload = function() {

	const Viewer = require('ftlabs-screens-viewer');
	const Carousel = require('ftlabs-screens-carousel');
	const carouselCountdown = document.querySelector('#carousel-countdown');

	let carousel;
	const viewer = new Viewer('http://ftlabs-screens.herokuapp.com', chromeStorage);

	function updateIDs() {
		[].slice.call(document.querySelectorAll('.screen-id')).forEach(function(el) {
			el.innerHTML = viewer.getData('id');
		});
	}

	function onCarouselVisibleShowCountdown () {
		carouselCountdown.style.transition = 'none';
		carouselCountdown.style.transform = 'scaleX(1)';
		setTimeout(function(){
			let duration = carousel.timeUntilNext();
			carouselCountdown.style.transition = `transform ${duration}ms linear`;
			carouselCountdown.style.transform = 'scaleX(0)';
		}, 50);
	}

	viewer.on('change', url => {
		console.log('change', url);

		// Reset carousel countdown
		window.removeEventListener('carousel-content-visible', onCarouselVisibleShowCountdown);
		carouselCountdown.style.transform = 'scaleX(0)';
		carouselCountdown.style.transition = 'none';
		carouselCountdown.style.offsetHeight;

		if (carousel) {

			// stop timers
			carousel.destroy();
			carousel = null;
		}

		if (Carousel.isCarousel(url)) {
			carousel = new Carousel(url, 'http://ftlabs-screens.herokuapp.com');
			carousel.on('change', function (url) {
				updateUrl(url);
				window.addEventListener('carousel-content-visible', onCarouselVisibleShowCountdown, false);
			});

			updateUrl(carousel.getCurrentURL());
		} else {
			updateUrl(url);
		}
	});

	// A reload has been forced
	viewer.on('reload', e => {
		console.log('reload', e);
		views.forEach(view => view.reload());
	});

	// E.g. The viewer has started but cannot connected to the server.
	viewer.on('not-connected', e => {
		console.log('n-connected', e);
		document.body.classList.add('network-issue');
	});

	viewer.on('ready', e => {
		console.log("Viewer ready");
		updateUrl(e);
	});

	viewer.on('id-change', function () {
		updateIDs();
	});

	viewer.start();
	bringDown.set();

};
