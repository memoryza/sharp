chrome.app.runtime.onLaunched.addListener(function(intentData) {
    chrome.app.window.create('chrome.html', {
        width: 1000,
	    height: 600,
	    minWidth: 1000,
	    minHeight: 600,
	    type: 'shell'
    });
});



