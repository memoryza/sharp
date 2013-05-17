chrome.app.runtime.onLaunched.addListener(function(intentData) {
    chrome.app.window.create('www/index.html', {
        width     : 640,
	    height    : 720,
	    minWidth  : 640,
	    minHeight : 720,
	    maxWidth  : 640,
	    maxHeight : 720,
	    type: 'shell'
    });
});



