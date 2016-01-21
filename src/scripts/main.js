'use strict';

/*global window, document*/

window.onload = function() {

	window.addEventListener('keypress', function(e){
		if(e.keyCode === 27){
			window.close();
		}
	}, false);

}