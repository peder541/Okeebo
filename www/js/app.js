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
			});
			return false;
		}
		else if ($url == "javascript:navigator.id.request()") {
			$.get('https://login.persona.org/sign_in#NATIVE',function(data) {
				var d = $('<html />').html(data);
				d.find('script,meta,link,title').remove();
				d = d.html();
				parent.$('body').html(d);
			});
			return false;
			BrowserID.internal.get('https://www.okeebo.com', function(assertion) { window.location = 'https://www.okeebo.com/beta/'; });
			return false;
		}
		else {
			alert($url);
			return false;
			BrowserID.internal.get('https://www.okeebo.com', function(assertion) { window.location = 'https://www.okeebo.com/beta/'; });
		}
	});
});