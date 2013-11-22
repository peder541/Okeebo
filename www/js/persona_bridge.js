// JavaScript Document

var event;
if (document.createEvent) {
	event = document.createEvent('HTMLEvents');
	event.initEvent('relay', true, true);
}
else {
	event = document.createEventObject();
	event.eventType = 'relay';
}
BrowserID.internal.get('https://www.okeebo.com', function(assertion) {
	document.dispatchEvent(event);
})