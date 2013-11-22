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

$.post('https://verifier.login.persona.org/verify', { assertion: assertion, audience: 'https://www.okeebo.com:443' }).done(function(data) {
	if (data.status == 'okay') window.localStorage.setItem('email',data.email);
	else {
		var persona = window.open('https://login.persona.org/sign_in#NATIVE','_self','location=no,hidden=yes');
		persona.addEventListener('loadstop',function(event) {
				
			var personaCode = "";
			personaCode += "BrowserID.internal.get('https://www.okeebo.com', function(assertion) {";
			personaCode += "	window.location = 'http://www.okeebo.com?assertion=' + assertion;";
			personaCode += "})";
			
			persona.executeScript({code: personaCode});
			
		});
		persona.addEventListener('loadstart',function(event) {
			if (event.url.substr(0,21) == 'http://www.okeebo.com') {
				window.localStorage.setItem('assertion',event.url.substr(33));
				persona.close();
				$('body').append('<a style="display:none" id="appLogin">Login</a>');
				$('#appLogin').attr('href','https://www.okeebo.com/beta/?assertion=' + window.loocalStorage.getItem('assertion')).click();
			}
		});
	}
});

*/