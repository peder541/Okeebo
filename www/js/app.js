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
				
				$('.inner').children('h3').not('.out + h3').before('<button class="out" type="button"></button>');
				$('.outer').children('p[id]').not('.in + p[id]').before(function(index) { 
					return '<button class="in ' + this.id + '" type="button"></button>';
				});
				$('a.tangent').replaceWith(function() {
					return '<button class="' + $(this).attr('class') + '">' + $(this).text() + '</button>';
				});
				$('.in').html('+');
				$('.out').html('-');
				$(window).resize();
				///// MATHJAX HERE
				
				redraw_node_map($('.outer').filter(':visible').attr('id'));
				
				/// Map Events
				$('#map').on('touchstart', function(event) {
					event.preventDefault();
				})
				.on('tap', function(event) {
					if (mobile) modify_large_map(1,0);
				})
				.on('mouseenter click','.node',function(event) {
					if (mobile) return true;
					var old = $('.node').filter(function() { 
						return ( $(this).css('background-color') == 'rgb(85, 85, 85)' || $(this).css('background-color') == '#555' ); 
					}).attr('id');
					var l1 = this.id.charCodeAt(2);
					var n1 = this.id.substr(3);
					var l0 = old.charCodeAt(2);
					var n0 = old.substr(3);
					
					if (event.type == 'mouseenter') {
						var visible_page = $('.inner,.outer').filter(':visible');
						if (l1>l0) $('#info').html(visible_page.children('.in + p').eq(n1-1).children('span').html());
						else {
							var target = visible_page.attr('id');
							for (i=0; i<l0-l1; ++i) target = get_parent_tag(target);
							var _target = get_parent_tag(target);
							if (_target) $('#info').html($('.' + _target + ' > .in + p').eq(n1-1).children('span').html());
							else if (target) $('#info').html($('.' + target + ' > h3').html());
						}
						$('#info').css({'top':7,'left':'auto','right':10});
						info_timer = setTimeout("$('#info').show()",500);
						if ($('#info').height() + 7 > $(this).offset().top) $('#info').css('top',$(this).offset().top + 24);
					}
					else {
						$('.node').mouseleave();						// Clear Tooltip
						setTimeout("$('.node').mouseleave()",250);		// Keep it clear
						
						if (l1>l0) return concept_zoom_in($('.outer').filter(':visible').children('.in + p').eq(n1-1).attr('id'));
						else if (l1<l0) return concept_zoom_out(l0-l1,n1);	
						else if (n1!=n0) return linear_move(38-(n0-n1));
					}
				})
				.on('mouseleave','div',function(event) {
					if (info_timer) clearTimeout(info_timer);
					$('#info').hide();
				});
				
				
				/// Meta-Map Events
				$('#meta-map').on('touchstart', function(event) {
					event.preventDefault();
				})
				.on('tap', function(event) {
					if (mobile) modify_large_map(1,1);
				})
				.on('mouseenter','div',function(event) {
					if (mobile) return true;
					$('#info').html($('.' + workspace[$('#meta-map div').index($(this))] + ' h3').html());
					$('#info').css({'right':'auto','left':10});
					$('#info').css('top',7);
					info_timer = setTimeout("$('#info').show()",500);
				})
				.on('click','._node',function(event) {
					if (mobile) return true;
					switch_tab($(this).parent().children('div').index($(this)));
				})
				.on('mouseleave','div',function(event) {
					if (info_timer) clearTimeout(info_timer);
					$('#info').hide();
				});
				
				/// Other Events
				$('.exit').on('click',function() {
					var old_workspace = $('#meta-map div').index($('.meta-node'));
					var old_id = workspace.splice(old_workspace,1);
					var new_id = workspace[old_workspace];
					if (!new_id) new_id = workspace[--old_workspace];
					$('.meta-node').remove();
					
					$('#meta-map div').eq(old_workspace).attr('class','meta-node');
					go_to(old_id,new_id);
					if (workspace.length == 1) {
						$('.exit').hide();
						$('.splitscreen').hide();
						$('#meta-map').hide();
					}
				});
				$('#map_helper').on('mouseenter',function(event) {
					if (mobile != 1) {
						$('#map').css({'overflow':'visible','z-index':'100'});
						$('#info').css('z-index','200');
						$('form.linear').hide();
					}
				}).on('mouseleave',function(event) {
					if (document.elementFromPoint(event.pageX,event.pageY).id == 'map') {
						$('#map').one('mouseleave',function(event) {
							$('#map').css({'overflow':'','z-index':''});
							$('#info').css('z-index','');
							$('form.linear').show();
						});
					}
					else {
						$('#map').css({'overflow':'','z-index':''});
						$('#info').css('z-index','');
						$('form.linear').show();
					}
				});
				$('#search').on('click',function(event) {
					var word = prompt('Search this book:');
					if (word) createIndex(word);
				});
				
				flashToHTML5();
				loadVideos();
				
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