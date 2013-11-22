// JavaScript Document

$(document).on('ready',function(event) {
	$('body').on('click','a',function(event) {
		var $url = $(this).attr('href');
		if ($url.substr(0,22) == "https://www.okeebo.com") {
			$.get($url,function(data) {
				var d = $('<html />').html(data);
				d.find('script,meta,link,title').remove();
				d = d.html();
				parent.$('body').html(d);
				
				if ($('.persona_expired').index() != -1) {
					Persona.login(true);
				}
				
				$('.edit').remove();
				if ($url.substr(22,11) == '/beta/edit/') $('script').last().after('<link rel="stylesheet" href="css/create.css" class="edit" />');
				
				$('.core').replaceWith('<script type="text/javascript" src="js/okeebo.js" class="core"></script>');
				
				if ($url.substr(22,11) == '/beta/edit/') $('link.edit').after('\n    <script type="text/javascript" src="js/okeebo.create.js" class="edit"></script>');
			});
			return false;
		}
		else if ($url == "javascript:navigator.id.request()") {
			Persona.login();		
			return false;
		}
		else if ($url == "javascript:navigator.id.logout()") {
			Persona.logout();		
			return false;
		}
		else if ($url == 'test.html') {
			
			// Start with Styling
			$('script').last().after('<link rel="stylesheet" href="css/create.css" class="edit" />');
			
			// Load Content
			$('body').append('<button class="writing top" id="bold" type="button" title="Bold"></button>\n    <button class="writing mid" id="italic" type="button" title="Italic"></button>\n    <button class="writing mid" id="underline" type="button" title="Underline"></button>\n    <button class="writing mid" id="sup" type="button" title="Superscript"></button>\n    <button class="writing bot" id="sub" type="button" title="Subscript"></button>\n\n    <button class="writing top" id="ul" type="button" title="Bullet list"></button>\n    <button class="writing mid" id="ol" type="button" title="Numbered list"></button>\n    <button class="writing bot" id="al" type="button" title="Lettered list"></button>\n\n    <button class="writing top" id="img" type="button" title="Insert image"></button>\n    <button class="writing mid" id="link" type="button" title="Insert link"></button>\n    <button class="writing mid" id="vid" type="button" title="Insert video"></button>\n	<button class="writing mid" id="table" type="button" title="Insert table"></button>\n    <button class="writing mid" id="equation" type="button" title="Insert equation"></button>\n    <button class="writing bot" id="new_page" type="button" title="Insert page"></button>');
			var $exit = $('.exit');
			$exit.after('<button id="menu" type="button" title="Show Sidebar"></button>\n\n	<form class="save" action="https://www.okeebo.com/beta/publish.php" method="post">\n		<input type="hidden" id="_save" name="text" value="">\n		<input type="hidden" id="_title" name="title" value="">\n		<input type="hidden" id="_publish" name="publish" value="false">\n	</form>');			
			$('#function').attr('href','index.html').html('Read');
			while (workspace.length > 0) $exit.click();
			$exit.remove();
			go_to($('.inner,.outer').filter(':visible').attr('id'),'Z1');
			
			// Finish with Scripts
			$('link.edit').after('\n    <script type="text/javascript" src="js/okeebo.create.js" class="edit"></script>');
			return false;
		}
		else if ($url == 'index.html') {
			
			$('.save').after('<button class="exit">&times;</button>');
			$('.edit,.writing,.save,#menu').remove();
			
			$('#function').attr('href','test.html').html('Edit');
			go_to($('.inner,.outer').filter(':visible').attr('id'),'Z1');
						
			return false;
			
			return true;
		}
		else {
			alert($url);
			return false;
		}
	});
});

var Persona = {
	login: function(auto) {
		var persona = window.open('https://login.persona.org/sign_in#NATIVE','_self','location=no,hidden=yes');
		if (!auto) persona.show();
		persona.addEventListener('loadstop',function(event) {
			
			var personaCode = "";
			personaCode += "BrowserID.internal.get('https://www.okeebo.com', function(assertion) {";
			personaCode += "	window.location = 'http://www.okeebo.com?assertion=' + assertion;";
			personaCode += "});";
			if (auto) personaCode += "setTimeout(\"$('#signInButton').click();\",1000);";
			
			persona.executeScript({code: personaCode});
			
		});
		persona.addEventListener('loadstart',function(event) {
			if (event.url.substr(0,21) == 'http://www.okeebo.com') {
				var assertion = event.url.substr(33);
				persona.close();
				$('body').append('<a style="display:none" href="https://www.okeebo.com/beta/?assertion=' + assertion + '" id="appLogin">Login</a>');
				$('#appLogin').click();
				$.post('https://verifier.login.persona.org/verify', { assertion: assertion, audience: 'https://www.okeebo.com:443' }).done(function(data) {
					window.localStorage.setItem('email',data.email);
				});
			}
		});
	},
	logout: function() {
		$('body').append('<a style="display:none" href="https://www.okeebo.com/beta/?logout=1" id="appLogout">Logout</a>');
		$('#appLogout').click();
	}
}