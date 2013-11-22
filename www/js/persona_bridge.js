// JavaScript Document

BrowserID.internal.get('https://www.okeebo.com', function(assertion) {
	var event;
	if (document.createEvent) {
		event = document.createEvent('HTMLEvents');
		event.initEvent('relay', true, true);
	}
	else {
		event = document.createEventObject();
		event.eventType = 'relay';
	}
	event.data = assertion;
	document.dispatchEvent(event);
})


/*



persona.show();

*/