'use strict';

/*global window*/

window.onload = function() {

	window.addEventListener('keypress', function(e){
		if(e.keyCode === 27){
			window.close();
		}
	}, false);

}