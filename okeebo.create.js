/* 
 * Okeebo Content Creation JavaScript
 * author: Ben Pedersen
 *
 */

var _drag = 0, _edit = 0;
var arrange_timer, scroll_timer;
var collab_timer = 0;
var line = 0;
var _delete = new Array();
var writing_buttons = '.writing';
var exclude_buttons = '.in,.out,.tangent,.preview_main,.preview_exit,.insert,.OkeeboMathTeX,.OkeeboMathML,.OkeeboMathDisplay,.sideboxToggle,#graphMode';
var localsave = false;
var caps = false;
var collab = {};
/*
	collab = {
		spkr: [current, history]
	}
	collab[spkr][1] = {0: event0, 1: event1, 2: event2, ... };
*/

var zoom_in = concept_zoom_in;
var zoom_out = concept_zoom_out;
function zoom_mod() {
	$('.cursor').remove();
}
concept_zoom_in = function() {
	zoom_in.apply(this,arguments);
	zoom_mod();
}
concept_zoom_out = function() {
	zoom_out.apply(this,arguments);
	zoom_mod();
}
window.history.replaceState = null;
window.history.pushState = null;


function resize_writing_items(buffer) {
	if (typeof(buffer) === 'undefined') buffer = 0;
	var sidebar_width = $('#sidebar').outerWidth();
	if (!sidebar_width) sidebar_width = 0;
	var base_width = Math.min(900,$(window).width()-sidebar_width)-buffer;
	$('button').not(exclude_buttons).css('margin-left',$('.outer').css('margin-left'));
	$(writing_buttons).css('left',base_width-26);
	//modify_arrange_buttons();
	$('.delete').css('margin-left',base_width-89-64);
	$('.OkeeboMath').each(function(index) { resizeMathLangButtons(index) });
}

function add_checkboxes_for_continuous_reading() {
	$('.outer.inner').each(function(index) {
		$(this).append('<form class="linear"><input type="checkbox" name="linear" value="Allow">Allow Linear Reading</form>');
		var last_id = $(this).children('p[id]').last().attr('id');
		if (last_id) {
			var last_letter = last_id.charAt(0);
			var last_number = parseInt(last_id.substring(1),10);
			if ($('#' + last_letter + (last_number + 1)).html()) {
				$(this).children('form.linear').children('input').prop('checked',true);
			}
		}
		$(this).find('.linear input').on('click',function(event) {
			var parent_id = get_parent_tag($(this).parent().parent().attr('id'));
			var first_id = $('.' + parent_id).children('p[id]').first().attr('id');
			update_all_affected_links(first_id);
			var old_pageKeys = [];
			$('.inner,.outer').each(function() { old_pageKeys.push($(this).attr('class')); });
			if (window.self !== window.top || typeof(nick) !== 'undefined') {
				var pageKeys = [];
				var pIDs = [];
				$('.inner,.outer').each(function() { pageKeys.push($(this).attr('class')); });
				$('.in + p[id]').each(function() { pIDs.push(this.id); });
				var msg = '["rearrange",' + JSON.stringify(pageKeys) + ',' + JSON.stringify(pIDs) + ',0,"' + $(this).parent().parent().attr('id') +'",' + JSON.stringify(old_pageKeys) + ']';
				collab_send(msg);
			}
		});
	});
}

$(document).ready(function(event) {
		
	if (typeof(_fadeIn) === 'undefined') {
		_fadeIn = $.fn.fadeIn;
		$.fn.fadeIn = function(){
			_fadeIn.apply(this,arguments).trigger("fadeIn");
		};
	}
	if (typeof(_show) === 'undefined') {
		_show = $.fn.show;
		$.fn.show = function(){
			_show.apply(this,arguments).trigger("show");
		};
	}
	
	resize_writing_items();
	
	if (badIE) {
		$('#edit').width(38);
		$('#drag').width(43);
		$('#save').width(42);
	}
	
	add_checkboxes_for_continuous_reading()
	
	toggle_edit();
	
	/*// Table
	$(document).on('mousemove',function(event) {
		if (typeof(ns_resize_table) !== 'undefined' && typeof(ns_resize_table[1]) !== 'undefined') {
			clear_selected_text();
			var dif = event.pageY - ns_resize_table[1];
			var obj = ns_resize_table[0];
			var height = ns_resize_table[2];
			var new_height = height + dif;
			obj.attr('height',new_height);
		}
		if (typeof(ew_resize_table) !== 'undefined') {
			clear_selected_text();
			var dif = event.pageX - ew_resize_table[1];
			var obj = ew_resize_table[0];
			var width = ew_resize_table[2];
			obj.css('width','');

			obj.attr('width',width + dif);
		}
	});
	$(document).on('mousedown mousemove','td',function(event) {
		var $this = $(this);
		var left = $this.offset().left;
		var top = $this.offset().top;
		var width = $this.outerWidth();
		var height = $this.outerHeight();
		if (event.type == 'mousemove') {
			if (Math.ceil(left) == event.pageX || Math.floor(width + left) - 3 <= event.pageX) $this.css('cursor','ew-resize');
			else if (Math.ceil(top) + 1 >= event.pageY || Math.floor(height + top) - 3 <= event.pageY) $this.css('cursor','ns-resize');
			else $this.css('cursor','');
		}
		if (event.type == 'mousedown') {
			if ($this.css('cursor') == 'ew-resize') {
				if (Math.ceil(left) == event.pageX) $this = $('td').eq($('td').index($this)-1);
				ew_resize_table = [$this,event.pageX,$this.width()];
				$(document).one('mouseup',function(event) {
					delete ew_resize_table;
				});
			}
			if ($this.css('cursor') == 'ns-resize') {
				$this = $this.parent('tr');
				var table = $this.parents('table');
				console.log(table.css('border-width'));
				table.find('tr').each(function(index) {
					var tr = $(this);
					tr.attr('height',tr.height());
				});
				table.removeAttr('height');
				if (Math.ceil(top)+1>= event.pageY) $this = $('tr').eq($('tr').index($this)-1);
				ns_resize_table = [$this,event.pageY,$this.height()];
				$(document).one('mouseup',function(event) {
					delete ns_resize_table;
				});
			}
		}
	});*/
	
	/// Document Events
	$(document).on('keydown',function(event) {
		if (event.ctrlKey && $(event.target).is('[contenteditable="true"]')) {
			switch (event.which) {
				case 65:
					///// Slight Improvement to Select All for FireFox /////
					var sel = document.getSelection();
					var range = sel.getRangeAt(0);
					var node = $(range.startContainer).closest('[contenteditable]')[0];
					var last = node;
					while (node.nodeType != 3) {
						node = node.childNodes[0];
						if ($(node).is('table')) return true;
					}
					while (last.nodeType != 3) {
						last = last.childNodes[last.childNodes.length-1];
					}
					var clone = range.cloneRange();
					clone.setStart(node,0);
					clone.setEnd(last,last.textContent.length-1);
					range.setStart(last,last.textContent.length-1);
					range.setEnd(last,last.textContent.length);
					sel.removeAllRanges();
					sel.addRange(range);
					sel.addRange(clone);
					return false;
				case 66:
					$('#bold').click();
					return false;
				case 73:
					$('#italic').click();
					return false;
				case 85:
					$('#underline').click();
					return false;
				case 89:
					if (document.execCommand('redo')) {
						var range1 = getSenderRange();
						document.execCommand('undo');
						var range0 = getSenderRange();
						document.execCommand('redo');
						compare_ranges(range0,range1);
					}
					return false;
				case 90:
					if (document.execCommand('undo')) {
						var range1 = getSenderRange();
						document.execCommand('redo');
						var range0 = getSenderRange();
						document.execCommand('undo');
						compare_ranges(range0,range1);
					}
					return false;
				/**/
				case 8:
				case 46:
					var range0 = getSenderRange();
					setTimeout(function() {
						var range1 = getSenderRange();
						compare_ranges(range0,range1);
					},10);
					break;
				/**/
			}
		}
		if (event.which == 8 && !$(event.target).is('[contenteditable="true"],input')) return false;
		if ($('svg').is(':visible') && event.which == 40) return false;
	})
	.on('keydown','h3[contenteditable="true"],p[id] > span:first-child[contenteditable="true"]',function(event) {
		if (event.which == 13) {
			$(this).blur();
			return false;
		}
	})
	.on('keydown','.OkeeboMath span[contenteditable="true"]',function(event) {
		
		if (event.which == 65 && event.ctrlKey) {
			var range = document.createRange();
			var sel = window.getSelection();
			var children = this.childNodes;
			range.setStart(children[0], 0);
			range.setEnd(children[children.length-1], children[children.length-1].textContent.length)
			sel.removeAllRanges();
			sel.addRange(range);
			return false;
		}
		
		if (event.which == 13) {
			
			var string = crawl_back() + '\n' + crawl_forward();
			 string = string.replace(/ (?= *<)/g,'&nbsp;&nbsp;')
			 				.replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;')
							.replace(/</g,'&lt;')
							.replace(/>/g,'&gt;')
							.replace(/\n/g,'<br>');
			if (index == -1) {
				try {
					document.execCommand('insertHTML',false,'<br>');
				}
				catch (e) {
					var $this = $(this);
					var spans = $this.parent().children('span');
					spans.eq(0).append('<br id="hook">' + spans.eq(1).detach().html());
					
					spans.eq(0).focus();
					
					var range = document.createRange();
					var sel = window.getSelection();
					var target = $('#hook')[0].nextSibling;
					if (target instanceof HTMLBRElement) range.setStart(target.parentNode, [].indexOf.call(target.parentNode.childNodes,target));
					else range.setStart(target, 0);
					range.collapse(true);
					sel.removeAllRanges();
					sel.addRange(range);
		
					$('#hook').removeAttr('id');	
				}
			}
			else {
				$(this).html(string);
				
				var range = document.createRange();
				var sel = window.getSelection();
				var children = this.childNodes;
				index = Math.min(children.length-1,index);
				var target = children[index];
				if (target instanceof HTMLBRElement) range.setStart(target.parentNode, [].indexOf.call(target.parentNode.childNodes,target));
				else range.setStart(target, 0);
				range.collapse(true);
				sel.removeAllRanges();
				sel.addRange(range);
			}
			delete index;
			
			return false;
		}
	})
	.on('keyup',function(event) {
		if (event.which == 20) caps = !caps;
	})
	.on('focus','span[contenteditable="true"]:nth-of-type(2)',function(event) {
		if (['Response (400 Word Max)','Summary',''].indexOf(this.textContent) != -1) {
			if (!$(this).attr('data-content')) $(this).attr('data-content',this.textContent);
			this.innerHTML = '<br>';
			if ($(this).height() > 30) this.innerHTML = '';
			size_buttons($('.outer:visible'));
		}
	}).on('blur','span[contenteditable="true"]:nth-of-type(2)',function(event) {
		if (this.textContent == '') {
			this.innerHTML = $(this).attr('data-content') || '';
			size_buttons($('.outer:visible'));
		}
	})
	.on('keydown','[contenteditable="true"]',function(event) {
		if (event.which == 8 || event.which == 46) {
			// Prevents Firefox and Chrome from deleting the last <p> element in an .inner, preserving that page's formatting.
			if ((!$(this).parent().hasClass('outer')) && ($(this).html() == '<p><br></p>')) {
				event.preventDefault();
				return false;
			}
			// Makes sure <p> are properly removed from an .outer, preserving that page's formatting.
			if ($(this).parent().is('.outer')) {
				var p = $(this).children('p');
				if (((p.html() == '') || (p.html() == '<br>')) && (!p.eq(1).html())) {
					$(this).remove();
					if ($('#sidebar').is(':visible')) {
						var current_page = $('.inner,.outer').filter(':visible');
						if (current_page.has('h3 + div[contenteditable]').html() || (current_page.has('h3 + p').html() && _drag)) {
							disable_sidebar_option($('#add_intro_text'));
						}
						else enable_sidebar_option($('#add_intro_text'));
					}
					setTimeout(size_buttons,10,$('.outer').filter(':visible'));
					event.preventDefault();
					return false;
				}
			}
			// Makes Firefox behave like Chrome and IE when hitting backspace on first paragraph and delete on last paragraph.
			var sel = document.getSelection();
			var range = sel.getRangeAt(0);
			if (range.startContainer == range.endContainer && range.startOffset == range.endOffset) {
				if (event.which == 8 && $('div[contenteditable="true"]:visible').children('p').index(range.startContainer) == 0 && range.startOffset == 0) {
					event.preventDefault();
					return false;	
				}
				if (event.which == 46 && $('div[contenteditable="true"]:visible').children('p').last().is(range.endContainer) && range.endOffset == 0) {
					event.preventDefault();
					return false;
				}
			}
		}
		if (window.self !== window.top || typeof(nick) !== 'undefined') {
			if (!event.ctrlKey && !event.altKey) {
				var text = '';
				var sender_range = JSON.stringify(getSenderRange());
				
				if (event.which == 59) event.which = 186;
				if (event.which == 61) event.which = 187;
				if (event.which == 109 || event.which == 173) event.which = 189;
				
				if (event.which >= 65 && event.which <= 90) {
					if (caps) event.shiftKey = !event.shiftKey;
					text = String.fromCharCode((event.shiftKey ? 0 : 32) + event.which);
				}
				else if (event.which >= 48 && event.which <= 57) {
					text = event.which - 48;
					if (event.shiftKey) text = ')!@#$%^&*('.charAt(text);	
					else text += '';
				}
				else if (event.which >= 186 && event.which <= 192) {
					text = event.which - 186;
					if (event.shiftKey) text = ':+<_>?~'.charAt(text);
					else text = ';=,-.\/`'.charAt(text);	
				}
				else if (event.which >= 219 && event.which <= 222) {
					text = event.which - 219;
					if (event.shiftKey) text = '{|}"'.charAt(text);
					else text = '[\\]\''.charAt(text);
					if (text == '"') text = '\\"';
					if (text == '\\') text = '\\\\';
				}
				else if (event.which == 8) {
					var sel = document.getSelection();
					var deletedText = sel.toString();
					if (deletedText == '') {
						var range = sel.getRangeAt(0);
						var clone = range.cloneRange();
						if (range.startOffset != 0) {
							clone.setStart(clone.startContainer, clone.startOffset - 1);
							deletedText = clone.toString();
							if (deletedText.length > 1) deletedText = deletedText.substr(deletedText.length-1);
						}
						// Some corner cases need to be added to this section
						else {
							clone.setStart(clone.startContainer, 0);
							clone.setEnd(clone.startContainer, clone.startContainer.textContent.length);
							var needle = clone.cloneContents().textContent;
							var haystack = $(clone.startContainer.parentNode).closest('p').text();
							var spot = haystack.search(needle)-1;
							if (spot != -1) deletedText = haystack.substr(spot,1);
						}
					}
					var msg = '["backspace",' + sender_range + ',' + JSON.stringify(deletedText) + ']';
					collab_send(msg);
				}
				else if (event.which == 13) {
					var msg = '["enter",' + sender_range + ']';
					collab_send(msg);
				}
				else if (event.which == 46) {
					var sel = document.getSelection();
					var deletedText = sel.toString();
					if (deletedText == '') {
						var range = sel.getRangeAt(0);
						var clone = range.cloneRange();
						if (range.endOffset != range.endContainer.textContent.length) {
							clone.setEnd(clone.endContainer, clone.endOffset + 1);
							deletedText = clone.toString();
						}
						// Some corner cases may need to be added to this section
						else {
							var needle = clone.startContainer.textContent;
							var haystack = $(clone.startContainer.parentNode).closest('p').text();
							var spot = haystack.search(needle) + needle.length;
							deletedText = haystack.substr(spot,1);
						}
					}
					var msg = '["delete",' + sender_range + ',' + JSON.stringify(deletedText) + ']';
					collab_send(msg);	
				}
				else if (event.which == 32) {
					/// could be better to address this in function partner_insert
					var sel = document.getSelection();
					var range = sel.getRangeAt(0);
					var clone = range.cloneRange();
					var text = ' ';
					if (clone.startOffset > 0) {
						clone.collapse(true);
						clone.setStart(clone.startContainer,clone.startOffset - 1);
						if (clone.cloneContents().textContent.replace(/\s/g,' ') == ' ') {
							text = String.fromCharCode(160);
							sender_range = JSON.parse(sender_range);
							sender_range.spot -= 1;
							sender_range = JSON.stringify(sender_range);
						}
						else if (clone.endOffset < clone.endContainer.textContent.length) {
							clone.collapse(false);
							clone.setEnd(clone.endContainer,clone.endOffset + 1);
							if (clone.cloneContents().textContent.replace(/\s/g,' ') == ' ') text = String.fromCharCode(160);
						}
					}
					else {
						text = String.fromCharCode(160);
					}
				}
				//else console.log(event.which);
				if (text) {
					var msg = '["keydown","' + text + '",' + sender_range + ']';
					var sel = document.getSelection();
					var deletedText = sel.toString();
					if (deletedText != '') msg = msg.substr(0,msg.length-1) + ',' + JSON.stringify(deletedText) + ']';
					collab_send(msg);
				}
			}
			/*else if (event.ctrlKey) {
				if (event.which == 90) {
					function wacka() {
						var sel = document.getSelection();
						var range = sel.getRangeAt(0);
						console.log(range);
					}
					wacka();
					setTimeout(wacka,10);
				}
			}*/
		}
	})
	.on('keyup','[contenteditable="true"]',function(event) {
		if (window.self !== window.top || typeof(nick) !== 'undefined') {
			if ([37,38,39,40].indexOf(event.which) != -1 || typeof(nick) === 'undefined' || JSON.parse(collab[nick][1][collab[nick][0]][0])[0] != 'cursor') {
				var sender_range = JSON.stringify(getSenderRange());
				var msg = '["cursor",' + sender_range + ']';
				collab_send(msg);
			}
		}
		if ($(this).is('h3')) {
			// Title (page)
			if ($(this).parent().hasClass('inner')) {
				var classes = $(this).parent().attr('class').split(' ');
				for (var i in classes) {
					var link_letter = String.fromCharCode(classes[i].charCodeAt(0)-1);
					if (link_letter == '@') return false;
					var number = classes[i].substr(1);
					$('#' + link_letter + number + ' > span:first-child').html($(this).html());
				}
			}
		}
		else if ($(this).is('p[id] > span:first-child')) {
			// Title (link)
			var id = $(this).parent().attr('id');
			var child_letter = String.fromCharCode(id.charCodeAt(0)+1);
			var number = id.substr(1);
			var page = $('.' + child_letter + number);
			page.children('h3').html($(this).html());
			var classes = page.attr('class').split(' ');
			for (var i in classes) {
				var link_letter = String.fromCharCode(classes[i].charCodeAt(0)-1);
				if (link_letter == '@') return false;
				var number = classes[i].substr(1);
				if (link_letter + number != id) $('#' + link_letter + number + ' > span:first-child').html($(this).html());
			}
		}
		else if ($(this).is('p[id] > span')) {
			// Summary
		}
		else {
			// Content
			
		}
		$('body').css({'overflow-y':'auto','overflow-x':'hidden'});
		size_buttons($('.inner,.outer').filter(':visible'));
		resize_writing_items();
		if (document.getSelection) var anchorNode = document.getSelection().anchorNode;
		else if (document.selection.type == 'Text') var anchorNode = document.selection.createRange().parentElement().childNodes[0];
		if (anchorNode && anchorNode.parentNode && anchorNode.parentNode.tagName == 'TD') $('.active-img').click();
	})
	.on('cut paste','[contenteditable="true"]',function(event) {
		var title_paste;
		if (event.type == 'cut') _clip = document.getSelection().toString();	// Necessary for fix to 'paste into span' glitch in Firefox.
		if ($(this).is('h3')) {
			var index = $('h3').index($(this));
			setTimeout("$('h3').eq(" + index + ").keyup();",10);
			if (event.type == 'paste') title_paste = 1;
		}
		else if ($(this).is('p[id] > span')) {
			if ($(this).is('p[id] > span:first-child')) {
				var index = $('p[id] > span').index($(this));
				setTimeout("$('p[id] > span').eq(" + index + ").keyup();",10);
				if (event.type == 'paste') title_paste = 1;
			}
			else {
				var index = $('.inner,.outer').index($('.inner,.outer').filter(':visible'));
				setTimeout("size_buttons($('.inner,.outer').eq(" + index + "));",10);
				if (event.type == 'paste') {
					event.preventDefault();
					var clipboardData = '';
					if (window.clipboardData) clipboardData = window.clipboardData.getData('text');
					if (clipboardData == '') clipboardData = event.originalEvent.clipboardData.getData('text/html');
					if (clipboardData == '') clipboardData = event.originalEvent.clipboardData.getData('text/plain').replace(/\n/g, '<br />');
					var dummyDIV = $('<div id="dummy" />');
					dummyDIV.html(clipboardData);
					while (dummyDIV.find('*').not('br').index() != -1) {
						dummyDIV.find('*').each(function(index) {
							var $this = $(this);
							if ($this.is('p')) {
								if (index == 0) this.outerHTML = this.innerHTML;
								else this.outerHTML = '<br><br>' + this.innerHTML;
							}
							else if ($this.is('ol')) {
								$this.children('li').each(function(i) {
									this.outerHTML = ((i==0) ? '' : '<br>') + (i+1) + '. ' + this.innerHTML;
								});
								this.outerHTML = this.innerHTML;
							}
							else if ($this.is('ul')) {
								$this.children('li').each(function(i) {
									this.outerHTML = ((i==0) ? '' : '<br>') + '- ' + this.innerHTML;
								});
								this.outerHTML = this.innerHTML;
							}
							else if ($this.is('br')) {
								// leave alone
							}
							else if ($this.is('li')) {
								try {
									this.outerHTML = ((index==0) ? '' : '<br>') + '- ' + this.innerHTML;	
								}
								catch(e) {
									console.log(e);	
								}
							}
							else {
								try {
									this.outerHTML = this.innerHTML;
								}
								catch(e) {
									console.log(e);	
								}
							}
						});
					}
					if (window.top !== window.self || typeof(nick) !== 'undefined') {
						var msg = '["keydown","' + dummyDIV.html() + '",' + JSON.stringify(getSenderRange()) + ']';
						var sel = document.getSelection();
						var deletedText = sel.toString();
						if (deletedText != '') msg = msg.substr(0,msg.length-1) + ',"' + deletedText + '"]';
						collab_send(msg);	
					}
					if (document.selection) document.selection.createRange().pasteHTML(dummyDIV.html());		// IE is weird. Probably doesn't work in IE 11.
					else document.execCommand('insertHTML',false,dummyDIV.html());								// Normal way.
					
					setTimeout(handle_paste_glitch,10,$(this).parent());
				}
			}
		}
		else if ($(this).is('div')) {
			// Paste from Word to Chrome is being weird. There are random characters at the end.
			/**/
			if (event.type == 'paste') {
				var clipboardData = '';
				var cross_browser_paste;
				if (window.clipboardData) clipboardData = window.clipboardData.getData('text');
				if (clipboardData == '') clipboardData = event.originalEvent.clipboardData.getData('text/html');
				if (clipboardData == '') {
					clipboardData = event.originalEvent.clipboardData.getData('text/plain').replace(/\n/g, '<br />');
					cross_browser_paste = 1;
				}
				clipboardData = clipboardData.replace('<!--StartFragment-->','').replace('<!--EndFragment-->','');
				var dummyDIV = $('<div id="dummy" contenteditable="true"></div>');
				dummyDIV.html(clipboardData);
				if (cross_browser_paste && dummyDIV.find('br').index() != -1) {
					dummyDIV.wrap('<div>');
					improve_formatting(dummyDIV.parent());
				}
				dummyDIV.find('*').each(function() {
					var $this = $(this);
					$this.removeAttr('style class id');
					if ($this.html().replace(/\s/g,'') == '') $this.remove();
					if (['h1','h2','h3','h4','h5','h6'].indexOf(this.tagName.toLowerCase()) != -1) $this.replaceWith('<p><b>' + $this.html() + '</b></p>');
				});
				if (window.top !== window.self || typeof(nick) !== 'undefined') {
					var msg = '["keydown","' + dummyDIV.html() + '",' + JSON.stringify(getSenderRange()) + ']';
					var sel = document.getSelection();
					var deletedText = sel.toString();
					if (deletedText != '') msg = msg.substr(0,msg.length-1) + ',"' + deletedText + '"]';
					collab_send(msg);	
				}
				if (document.selection) document.selection.createRange().pasteHTML(dummyDIV.html());		// IE is weird. Probably doesn't work in IE 11.
				else document.execCommand('insertHTML',false,dummyDIV.html());								// Normal way.
				event.preventDefault();
			}
			/**/
		}
		if (title_paste) {
			var fluff = [ 'a', 'an', 'and', 'at', 'but', 'by', 'for', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet' ];
			var end_punctuation = [ ':', '.', '!', '?', ';' ];
			var clipboardData = '';
			if (window.clipboardData) clipboardData = window.clipboardData.getData('text');
			if (clipboardData == '') clipboardData = event.originalEvent.clipboardData.getData('text/plain');
			var words = clipboardData.toLowerCase().split(/\s+/);
			var start_of_title = 0;
			for (var i=0; i<words.length; ++i) {
				if (words[i] && (i == start_of_title || fluff.indexOf(words[i]) == -1 || i == words.length - 1)) {
					words[i] = words[i][0].toUpperCase() + words[i].substr(1);
				}
				if (end_punctuation.indexOf(words[i][words[i].length-1]) != -1) start_of_title = i+1;
			}
			var text = words.join(' ');
			if (window.top !== window.self || typeof(nick) !== 'undefined') {
				var msg = '["keydown","' + text + '",' + JSON.stringify(getSenderRange()) + ']';
				var sel = document.getSelection();
				var deletedText = sel.toString();
				if (deletedText != '') msg = msg.substr(0,msg.length-1) + ',"' + deletedText + '"]';
				collab_send(msg);	
			}
			document.execCommand('insertText',false,text);
			event.preventDefault();
		}
		if (event.type == 'cut' && _clip != '' && (window.top !== window.self || typeof(nick) !== 'undefined')) {
			var sender_range = JSON.stringify(getSenderRange());
			var msg = '["keydown","",' + sender_range + ',"' + _clip + '"]';
			collab_send(msg);
		}
		$('body').css({'overflow-y':'auto','overflow-x':'hidden'});
		resize_windows();
		size_buttons($('.inner,.outer').filter(':visible'));
		resize_writing_items();
		//if (event.type == 'paste') setTimeout("$('p,a,b,i,u,sup,sub').removeAttr('style');",0);
	})
	.on('copy',function(event) {
		_clip = document.getSelection().toString();		// Necessary for fix to 'paste into span' glitch in Firefox.
	})
	.on('mouseup','[contenteditable="true"]',function(event) {
		if (window.self !== window.top || typeof(nick) !== 'undefined') {
			//if ($(this).is('div[contenteditable]')) {
				var sender_range = JSON.stringify(getSenderRange());
				var msg = '["cursor",' + sender_range + ']';
				collab_send(msg);
			//}
		}
	})
	/**/// Disallow Multiple Ranges for Selection, like Google Docs
	.on('mousedown','[contenteditable="true"]',function(event) {
		if (event.ctrlKey) document.getSelection().removeAllRanges();
	})
	/**/
	.on('input','[contenteditable="true"]',function(event) {
		setTimeout(keyup,10,$(this));
	});
	// Resizable Images in Chrome, Opera, and Safari
	$(document).on('click','[contenteditable="true"] img,[contenteditable="true"] video,[contenteditable="true"] object,[contenteditable="true"] table',function(event) {
		if ($(this).attr('_moz_resizing') != 'true' && (!IE || !document.getSelection)) {
			var $this = $(this);
			$('.active-img').removeClass('active-img');
			$('.resize_handle').remove();
			$this.addClass('active-img');
			// Removes Blinking Caret (except for outer pages). Not sure if necessary.
			if (!$('.outer').is(':visible') && !$this.is('table')) {
				var sel = document.getSelection();
				if (sel.empty) sel.empty();  // Chrome
				else if (sel.removeAllRanges) sel.removeAllRanges();  // Firefox
				else if (document.selection) document.selection.empty(); // IE
			}
			$this.parents('div[contenteditable]').addClass('focus');
			
			$('body')
				.append('<div class="resize_handle" id="nw"> </div>')
				.append('<div class="resize_handle" id="n"> </div>')
				.append('<div class="resize_handle" id="ne"> </div>')
				.append('<div class="resize_handle" id="e"> </div>')
				.append('<div class="resize_handle" id="se"> </div>')
				.append('<div class="resize_handle" id="s"> </div>')
				.append('<div class="resize_handle" id="sw"> </div>')
				.append('<div class="resize_handle" id="w"> </div>');
				
			var _top = $this.offset().top;
			var _left = $this.offset().left;
			var _width = $this.width();
			var _height = $this.height();
			
			$('#nw,#n,#ne').css('top', _top - 3);
			$('#w,#e').css('top', _top + _height/2 - 3);
			$('#sw,#s,#se').css('top', _top + _height - 3);
			
			$('#nw,#w,#sw').css('left', _left - 3);
			$('#n,#s').css('left', _left + _width/2 - 3);
			$('#ne,#e,#se').css('left', _left + _width - 3);
			
			$('#nw,#n,#ne,#e,#se,#s,#sw,#w').on('mousedown',function(event) {
				$('body').append('<img id="clone" />');
				var clone = $('#clone');
				var act_img = $('.active-img');
				
				clone.attr('src',act_img.attr('src'));
				clone.attr('width',act_img.attr('width'));
				clone.attr('height',act_img.attr('height'));
				clone.css('position','absolute');
				clone.css('opacity',0.3);
				clone.css('left',act_img.offset().left);
				clone.css('top',act_img.offset().top);
				clone.css('outline','1px rgba(0,0,0,0.9) dashed');
				
				img_old_x = event.pageX;
				img_old_y = event.pageY;
				img_old_dir = event.target.id;
				$(document).on('mousemove',function(event) {
					var act_img = $('.active-img');
					var clone = $('#clone');
					var new_x = event.pageX;
					var new_y = event.pageY;
					
					var _width = act_img.width();
					var _height = act_img.height();
					var _top = act_img.offset().top;
					var _left = act_img.offset().left;
					
					if (img_old_dir == 'n') {
						clone.attr('height',_height - new_y + img_old_y);
						clone.attr('width',_width);
						clone.css('top',_top + new_y - img_old_y);
					}
					if (img_old_dir == 's') {
						clone.attr('height',_height + new_y - img_old_y);
						clone.attr('width',_width);
					}
					if (img_old_dir == 'e') {
						clone.attr('width',_width + new_x - img_old_x);
						clone.attr('height',_height);						
					}
					if (img_old_dir == 'w') {
						clone.attr('width',_width - new_x + img_old_x);
						clone.attr('height',_height);
						clone.css('left',_left + new_x - img_old_x);
					}
					var n_dif = - new_y + img_old_y;
					var w_dif = - new_x + img_old_x
					var s_dif = new_y - img_old_y;
					var e_dif = new_x - img_old_x;
					if (img_old_dir == 'nw') {
						if (n_dif > w_dif) {
							clone.attr('height',_height + n_dif);
							clone.attr('width',_width * (_height + n_dif)/_height);
							clone.css('top',_top - n_dif);
							clone.css('left',_left + (1 - (_height + n_dif)/_height)*_width);
						}
						else {
							clone.attr('width',_width + w_dif);
							clone.attr('height',_height * (_width + w_dif)/_width);
							clone.css('left',_left - w_dif);
							clone.css('top',_top + (1 - (_width + w_dif)/_width)*_height);
						}
					}
					if (img_old_dir == 'sw') {
						if (s_dif > w_dif) {
							clone.attr('height',_height + s_dif);
							clone.attr('width',_width * (_height + s_dif)/_height);
							clone.css('left',_left + (1 - (_height + s_dif)/_height)*_width);
						}
						else {
							clone.attr('width',_width + w_dif);
							clone.attr('height',_height * (_width + w_dif)/_width);
							clone.css('left',_left - w_dif);
						}
					}
					if (img_old_dir == 'ne') {
						if (n_dif > e_dif) {
							clone.attr('height',_height + n_dif);
							clone.attr('width',_width * (_height + n_dif)/_height);
							clone.css('top',_top - n_dif);
						}
						else {
							clone.attr('width',_width + e_dif);
							clone.attr('height',_height * (_width + e_dif)/_width);
							clone.css('top',_top + (1 - (_width + e_dif)/_width)*_height);
						}
					}
					if (img_old_dir == 'se') {
						if (s_dif > e_dif) {
							clone.attr('height',_height + s_dif);
							clone.attr('width',_width * (_height + s_dif)/_height);
						}
						else {
							clone.attr('width',_width + e_dif);
							clone.attr('height',_height * (_width + e_dif)/_width);
						}
					}
					
					_width = clone.width();
					_height = clone.height();
					_top = clone.offset().top;
					_left = clone.offset().left;
					
					$('#nw,#n,#ne').css('top', _top - 3);
					$('#w,#e').css('top', _top + _height/2 - 3);
					$('#sw,#s,#se').css('top', _top + _height - 3);
			
					$('#nw,#w,#sw').css('left', _left - 3);
					$('#n,#s').css('left', _left + _width/2 - 3);
					$('#ne,#e,#se').css('left', _left + _width - 3);
					
				});
				$(document).one('mouseup',function(event) {
					$(document).off('mousemove');
					
					var act_img = $('.active-img');
					var new_x = event.pageX;
					var new_y = event.pageY;
					
					var _width = act_img.width();
					var _height = act_img.height();
					
					if (img_old_dir == 'n') {
						act_img.attr('height',_height - new_y + img_old_y);
						act_img.attr('width',_width);
					}
					if (img_old_dir == 's') {
						act_img.attr('height',_height + new_y - img_old_y);
						act_img.attr('width',_width);
					}
					if (img_old_dir == 'e') {
						act_img.attr('width',_width + new_x - img_old_x);
						act_img.attr('height',_height);						
					}
					if (img_old_dir == 'w') {
						act_img.attr('width',_width - new_x + img_old_x);
						act_img.attr('height',_height);
					}
					var n_dif = - new_y + img_old_y;
					var w_dif = - new_x + img_old_x
					var s_dif = new_y - img_old_y;
					var e_dif = new_x - img_old_x;
					if (img_old_dir == 'nw') {
						if (n_dif > w_dif) {
							act_img.attr('height',_height + n_dif);
							act_img.attr('width',_width * (_height + n_dif)/_height);
						}
						else {
							act_img.attr('width',_width + w_dif);
							act_img.attr('height',_height * (_width + w_dif)/_width);
						}
					}
					if (img_old_dir == 'sw') {
						if (s_dif > w_dif) {
							act_img.attr('height',_height + s_dif);
							act_img.attr('width',_width * (_height + s_dif)/_height);
						}
						else {
							act_img.attr('width',_width + w_dif);
							act_img.attr('height',_height * (_width + w_dif)/_width);
						}
					}
					if (img_old_dir == 'ne') {
						if (n_dif > e_dif) {
							act_img.attr('height',_height + n_dif);
							act_img.attr('width',_width * (_height + n_dif)/_height);
						}
						else {
							act_img.attr('width',_width + e_dif);
							act_img.attr('height',_height * (_width + e_dif)/_width);
						}
					}
					if (img_old_dir == 'se') {
						if (s_dif > e_dif) {
							act_img.attr('height',_height + s_dif);
							act_img.attr('width',_width * (_height + s_dif)/_height);
						}
						else {
							act_img.attr('width',_width + e_dif);
							act_img.attr('height',_height * (_width + e_dif)/_width);
						}
					}
					
					act_img.css({'width':'','height':''});
					
					var _top = act_img.offset().top;
					var _left = act_img.offset().left;
					_width = act_img.width();
					_height = act_img.height();
					
					$('#nw,#n,#ne').css('top', _top - 3);
					$('#w,#e').css('top', _top + _height/2 - 3);
					$('#sw,#s,#se').css('top', _top + _height - 3);
			
					$('#nw,#w,#sw').css('left', _left - 3);
					$('#n,#s').css('left', _left + _width/2 - 3);
					$('#ne,#e,#se').css('left', _left + _width - 3);
					
					$('#clone').remove();
				});
				event.preventDefault();
				return false;
			});
				
			$(document).one('click',function(event) {
				$('.active-img').removeClass('active-img').parents('div[contenteditable]').removeClass('focus');
				$('.resize_handle').remove();
			});
			event.preventDefault();
			return false;
		}
	});
	
	
	/// Window Events
	$(window).on('resize',function(event) {
		resize_writing_items();
		resize_cursor();
	})
	.on('scroll',function(event) {
		var sidebar = $('#sidebar');
		if (sidebar.is(':visible')) {
			sidebar.css('left',-$(window).scrollLeft());
			if (sidebar.offset().left != 0 && !badIE) sidebar.css({'left':0,'top':$(window).scrollTop()});
			
			/// Idea for when Sidebar is too long for window
			/*
			if ($('#close').offset().top - $('#sidebar').offset().top + $('#close').outerHeight() > $(window).height()) {
				sidebar.css('top','');
				var to_bottom = ($(window).height() + $(window).scrollTop()) - ($('#close').offset().top + $('#close').outerHeight());
				sidebar.css({'top':Math.max(-$(window).scrollTop(),to_bottom)});
			}
			else sidebar.css('top','');
			*/
			
		}
		if ($(window).scrollTop() < 80) {
			$(writing_buttons).css({'position':'absolute','top':''});
		}
		else {
			$(writing_buttons).css('position','fixed');
			$('#bold').css('top',5);
			$('#italic').css('top',28);
			$('#underline').css('top',51);
			$('#sup').css('top',74);
			$('#sub').css('top',97);
			$('#ul').css('top',130);
			$('#ol').css('top',153);
			$('#al').css('top',176);
			$('#img').css('top',209);
			$('#link').css('top',232);
			$('#vid').css('top',255);
			$('#table').css('top',278);
			$('#equation').css('top',301);
			$('#new_page').css('top',324);
		}
	});
	
	/// Button Events
	$('#menu').on('click',function(event) {
		if ($('#sidebar').outerWidth()) delete_sidebar();
		else create_sidebar();
	});
	$('.writing').on('mousedown',function(event) {
		if (document.getSelection) $(document.getSelection().anchorNode).closest('[contenteditable="true"]').addClass('focus');
		else if (document.selection.type == 'Text') $(document.selection.createRange().parentElement()).closest('[contenteditable="true"]').addClass('focus');
		$(this).one('mouseleave click',function(event) {
			if (document.getSelection) $(document.getSelection().anchorNode).closest('[contenteditable="true"]').focus();
			else if (document.selection.type == 'Text') $(document.selection.createRange().parentElement()).closest('[contenteditable="true"]').focus();
			$('.focus').removeClass('focus');
		});
	})
	$('#bold').on('click',function(event) {
		if (window.top !== window.self || typeof(nick) !== 'undefined') {
			var msg = '["format_text","b",' + JSON.stringify(getSenderRange()) + ']';
			collab_send(msg);	
		}
    	document.execCommand('bold', false, null);
		$(document.getSelection().anchorNode).closest('p')[0].normalize();
		size_buttons($('.inner,.outer').filter(':visible'));
	});
	$('#italic').on('click',function(event) {
		if (window.top !== window.self || typeof(nick) !== 'undefined') {
			var msg = '["format_text","i",' + JSON.stringify(getSenderRange()) + ']';
			collab_send(msg);	
		}
		document.execCommand('italic', false, null);
		$(document.getSelection().anchorNode).closest('p')[0].normalize();
		size_buttons($('.inner,.outer').filter(':visible'));
	});
	$('#underline').on('click',function(event) {
		if (window.top !== window.self || typeof(nick) !== 'undefined') {
			var msg = '["format_text","u",' + JSON.stringify(getSenderRange()) + ']';
			collab_send(msg);	
		}
		$(document.getSelection().anchorNode).closest('p')[0].normalize();
		document.execCommand('underline', false, null);
	});
	$('#ul,#ol,#al').on('click',function(event) {
		if (typeof(ghost) === 'undefined' || !ghost) {
			var msg = '["list",' + JSON.stringify(getSenderRange()) + ',"' + event.target.id + '"]';
			collab_send(msg);
		}
		var sel = document.getSelection();
		/// make something in span that looks like a list
		/// currently using the kbd tag as a crutch. want to transition to just text
		if ($(sel.anchorNode).parents('p[id]').index() != -1) {
			var start = 'anchorNode';
			var finish = 'focusNode';
			if ($(sel[start]).index() > $(sel[finish]).index()) {
				start = 'focusNode';
				finish = 'anchorNode';	
			}
			var list = 1;
			for (var i=0; i<2; ++i) {
				var count = 0;
				if (!list) break;
				var node = sel[start];
				while (node) {

					/** /// using the kbd tag as a crutch
					var $node = $(node);
					if (!$node.is('br,kbd,p[id] > span,div')) {
						var type = ((event.target.id == 'ul') ? '-' : ((event.target.id == 'ol' ? ++count : String.fromCharCode(++count + 96)) + '.')) + ' ';
						if ($node.prev('kbd').index() == -1 || $node.prev('kbd').attr('type') != type) list = 0;
						$node.prev('kbd').remove();
						if (i == 0) $node.before('<kbd class="li" type="' + type + '"></kbd>');
					}
					if ($(sel[finish]).is($node)) break;
					node = node.nextSibling;
					/**/
					
					/// just using text
					var $node = $(node);
					if (!$node.is('br,kbd,p[id] > span,div')) {
						var type = { ul: '- ', ol: ++count + '. ', al: String.fromCharCode(count + 96) + '. ' };
						var pattern = /^\s*(-|[0-9]+\.|[a-z]\.)\s/g;
						var partial_pattern = { ul: /^\s*-\s/g, ol: /^\s*[0-9]+\.\s/g, al: /^\s*[a-z]\.\s/g };
						if (!$node.text().match(partial_pattern[event.target.id])) list = 0;
						node.textContent = $node.text().replace(pattern,'');
						if (i == 0) node.textContent = type[event.target.id] + $node.text();
					}
					if ($(sel[finish]).is($node)) break;
					node = node.nextSibling;
				}
			}
			$(sel.anchorNode).parents('p[id] > span').html(function() { return this.innerHTML; });
			clear_selected_text();
		}
		/// normal insert list functions
		else {
			switch (event.target.id) {
				case 'ul':
					document.execCommand('insertUnorderedList', false, null);
				break;
				case 'ol':
					document.execCommand('insertOrderedList', false, null);
				break;
				case 'al':
					document.execCommand('insertOrderedList', false, null);
					$(document.getSelection().anchorNode).parents('ol').attr('type','a');
				break;
			}
		}		
	});
	$('#img').on('click',function(event) {
		make_iframe();
	});
	$('#link').on('click',function(event) {
		var url = prompt('To what URL should this link go?');
		if (url) {
			var display = url;
			if (url == 'tangent') {
				make_tangent();
				return false;	
			}
			if (url.indexOf('https:') == -1 && url.indexOf('http:') == -1) url = 'http://' + url;
			if (document.getSelection().toString()) document.execCommand('createLink',false,url);
			else {
				try {
					document.execCommand('insertHTML',false,'<a href="' + url + '">' + display + '</a>');
				}
				catch(err) {
					var needle = '&lt;a href="' + url + '"&gt;' + display + '&lt;/a&gt;';
					var subject = '<a href="' + url + '">' + display + '</a>';
					handle_insert_glitch(needle, subject);
				}
			}
		}
		console.log(url == '', url === false);
	});
	$('#vid').on('click',function(event) {
		insert_video();
	});
	$('#new_page').on('click',function(event) {
		if ($('#new_page').hasClass('graph')) {
			toggle_graph();	
			insert_page();
			toggle_graph(1);
		}
		else {
			var page = $('<div class="inner"><button class="out">-</button><h3 contenteditable="true">Title</h3><div contenteditable="true"></div></div>');
			var string = getSelectionHtml();
			if (string == '') string = '<p>Content</p>';
			page.children('div').append(string);
			insert_page(0,page,0,0,1);
			improve_formatting();
		}
	});
	$('#table').on('click',function(event) {
		var row = parseInt(prompt('Number of Rows:'),10);
		var col = parseInt(prompt('Number of Columns:'),10);
		insertTable(row,col);
	});
	$('#sup').on('click',function(event) {
		document.execCommand('superscript',false,null);
	});
	$('#sub').on('click',function(event) {
		document.execCommand('subscript',false,null);
	});
	$('#equation').on('click',function(event) {
		insertEq();
	});
	create_handles();
	create_deletes();
	//create_inserts();
	
	var title = $('.Z1 h3').text();
	if (localsave && localStorage.getItem(title) && !save('compare')) {
		console.log('Recovery data found');
		if (confirm('Recovery data has been found.\n\nClick OK to restore.')) {
			$('.inner,.outer').remove();
			$('#map').after(localStorage.getItem(title));
			$('.in').html('+');
			$('.out').html('-');
			resize_windows();
			var $page = $('.inner,.outer').filter(':visible');
			size_buttons($page);
			redraw_node_map($page.attr('id'),0,1);
			loadVideos();
			add_checkboxes_for_continuous_reading()
			toggle_edit();
			create_handles();
			create_deletes();
			if (location.hash != '') hashChange(1);
		}
	}
	caps_detect();
	if (typeof(window.nick) !== 'undefined') collab_updates();
});

function caps_detect() {
	$(document).one('keypress',function(event) {
		if (event.which >= 65 && event.which <= 90) {
			if (!event.shiftKey) caps = true;
			else caps = false;
		}
		else if (event.which >= 97 && event.which <= 122) {
			if (event.shiftKey) caps = true;
			else caps = false;
		}
		else caps_detect();
	});
}

function handle_insert_glitch(needle, subject) {
	document.execCommand('undo',false,null);
	var element = $(document.getSelection().anchorNode.parentNode);
	document.execCommand('insertText',false,subject);
	element.html(element.html().replace(needle,subject));
	size_buttons(element.parents('.outer,.inner'));
	element.keyup();
}

function keyup(obj) {
	obj.keyup();
}

// Handles 'paste into span' glitch in Firefox.
function handle_paste_glitch(obj) {
	if (obj.children('span').eq(2).is(':visible')) {
		document.execCommand('undo',false,null);
		if (typeof(_clip) !== 'undefined') document.execCommand('insertText',false,_clip);
		console.log('glitch');
	}
}

/// Fixes most of the execCommand discrepancies. Applied during toggle_edit() to maintain the undo stack as much as possible.
function improve_formatting($obj) {
	if (typeof($obj) === 'undefined') $obj = $('body');
	$obj.find('p img').unwrap();
	$obj.find('div[contenteditable] > p > div').unwrap();
	var list = $obj.find('ol,ul');
	if (list.parent().is('p')) list.unwrap();
		
	var div_contenteditable = $obj.find('div[contenteditable]');
	var plainText = div_contenteditable.contents().filter(function() { return this.nodeType === 3; });
	plainText.wrap('<p />');
	
	// Plain-text cuts inline elements out of paragraphs. Fixing with this.
	$obj.find('div[contenteditable]').children('a,b,i,u,sub,sup,strong,em').each(function() { 
		var $this = $(this);
		var prev_p = $this.prev('p');
		if (prev_p.html()) $this.prev('p').append($this);
		else $this.wrap('<p>');
		var new_parent = $this.parent('p');
		new_parent.append(new_parent.next('p').detach().html());
	});
	
	div_contenteditable.children('br').remove();
	div_contenteditable.children('p').filter(function() { var html = $(this).html(); return (html == '\n' || html == '\n\t'); }).remove()
	
	div_contenteditable.children('div').each(function() { 
		var string = '';
		if ($(this).html() != '<br>') string = '<p>' + $(this).html() + '</p>';
		$(this).replaceWith(string); 
	});
}

function toggle_edit() {
	$('.preview_window').remove();
	mathPublish();
	improve_formatting();
	$('.inner,.outer').each(function() {
		toggle_edit_one($(this));
	});
	if (!$('[contenteditable]').html()) {
		$('body').off('click','[contenteditable="true"]');
		$(writing_buttons).hide();
	}
	else {
		$('body').on('click mousedown focus','[contenteditable="true"]',function(event) {
			var $this = $(this);
			if (document.getSelection) {
				var $focus = $(document.getSelection().anchorNode).closest('[contenteditable="true"]');
				if ($(':focus').index() != -1 && !$this.is(':focus') && !$focus.is(':focus') && $focus.index() != -1) {
					$(':focus').blur();
					$focus.focus();
				}
			}
		});
		$(writing_buttons).show();
		$('.OkeeboMath').each(function(index) { insertMathLangButtons(index) }).attr('contenteditable','false');
	}
}

function toggle_edit_one(obj) {
	if (obj.children('h3').attr('contenteditable') == 'true') {
		obj.children('h3').removeAttr('contenteditable');
		obj.children('h4').children('p[id]').children('span').removeAttr('contenteditable');	// Placeholder for Unlinked Page Summary 
		obj.children('p[id],.sidebox').children('span,.sum,.full').removeAttr('contenteditable');
		
		var h3 = obj.children('h3');
		var div = h3.next('div[contenteditable]');
		var data = div.html();
		improve_formatting(obj);
		if (div.html()) {
			var data = div.children();
			if (!data.html()) data = '<p>' + div.html() + '</p>';
		}
		else if (!obj.hasClass('outer') && !h3.next().is('.sidebox')) data = '<p>Content</p>';
		else if (data) data = '<p><br></p>';
		h3.after(data);
		
		div.remove();
		h3.removeAttr('contenteditable');
		obj.children('p[id],.sidebox').each(function(index) {
			var p = obj.children('p[id],.sidebox').eq(index);
			div = p.next('div[contenteditable]');
			if (div.html()) {
				var data = div.children();
				if (!data.html()) data = '<p>' + div.html() + '</p>';
				p.after(data);
			}
			div.remove();
			p.removeAttr('contenteditable');
		});
	}
	else {
		obj.children('h3').attr('contenteditable','true');
		obj.children('h4').children('p[id]').children('span').attr('contenteditable','true');	// Placeholder for Unlinked Page Summary
		obj.children('p[id],.sidebox').children('span,.sum,.full').attr('contenteditable','true');
		
		obj.children('img').wrap('<p>');
		
		var data = obj.children('h3').nextUntil('.in,.sidebox').not('form.linear');
		if (data.html()) {
			obj.children('h3').after('<div contenteditable="true"></div>');
			obj.children('div[contenteditable]').html(data);
		}
		obj.children('p[id],.sidebox').each(function(index) {
			var p = obj.children('p[id],.sidebox').eq(index);
			data = p.nextUntil('.in,.sidebox').not('form.linear,.insert');
			if (data.html()) {
				p.after('<div contenteditable="true"></div>');
				p.next('div[contenteditable]').html(data);
			}
		});
	}
}

/// Turns off edit for outer pages but leaves edit on for inner pages. Unsure if this would be expected behavior or if edit should be entirely off.
/// If edit should be entirely off, other areas in the code will also need changing.
function toggle_drag(singlePage) {
	var outer = $('.outer');
	if (singlePage) {
		if (singlePage instanceof jQuery) outer = outer.filter(singlePage);
		else outer = outer.filter(':visible');
	}
	var pID = outer.find('p[id]');
	if (!pID.attr('draggable')) {
		pID.attr({'draggable':'true','ondragstart':'drag(event)'});
		outer.on('selectstart','p[id]',function(event){ 
			_data = $(event.target).parent().attr('id');
			if (this.dragDrop) this.dragDrop();
			return false;
		}).attr({'ondrop':'drop(event)','ondragover':'allowDrop(event)'});
		pID.css('cursor','move').css('outline-color','');
		
	}
	else {
		pID.removeAttr('draggable').removeAttr('ondragstart');
		outer.add(singlePage ? '' : '.inner').removeAttr('ondrop').removeAttr('ondragover').off('selectstart');
		pID.css('cursor','auto');
		
		/// For Touch Devices
		$('#dragdrop').remove();
		//$('p[id]').off('touchstart');
	}
	if (!_drag) {
		_drag = 1;
		if ($('#bold').is(':visible')) {
			outer.each(function(event) {
				toggle_edit_one($(this));
			});
			_edit = 1;
		}
	}
	else {
		_drag = 0;
		if (_edit) {
			outer.each(function(event) {
				toggle_edit_one($(this));
			});
			_edit = 0;
		}
	}
}

function allowDrop(event) {

	/// Show when a drag is far enough to switch
	color_dragging(event,event.dataTransfer.getData("Text"));
	
	if (event.preventDefault) event.preventDefault();
	else event.returnValue = false;
}

function drag(event) {
	if (event.target) {
		event.dataTransfer.setData("Text",event.target.id);
		//event.dataTransfer.effectAllowed = "move";
	}
	$('#dragdrop').remove();
}

function drop(event) {
	$('p[id]').css('outline-color','');
	if (event.preventDefault) event.preventDefault();
	var data;
	if (event.type == 'drop') data = event.dataTransfer.getData("Text");
	if (!data && typeof(_data) !== 'undefined') data = _data;
	if (typeof(data) === 'undefined' || data.charCodeAt(1) > 57 || data == 'undefined' || !data) return false;
	var set_p = $('.inner,.outer').filter(':visible').children('p,ol,ul,.sidebox,table');
	var first_p = set_p.first();
	var first_id = set_p.filter('[id]').first().attr('id');
	var letter = first_id.charAt(0);
	var first_number = parseInt(first_id.substr(1),10);
	if (data.charAt(0) != first_id.charAt(0)) return false;
	if (window.self !== window.top || typeof(nick) !== 'undefined') {
		var old_pageKeys = [];
		$('.inner,.outer').each(function() { old_pageKeys.push($(this).attr('class')); });
	}
	var y = event.pageY;
	if (!y) y = event.clientY + $(window).scrollTop();
	//if (!y) y = event.originalEvent.changedTouches[0].pageY;
	if (!y) y = $('#dragdrop').offset().top + 25;
	if (y < first_p.offset().top + first_p.outerHeight()*0.5) {
		if (set_p.index($('#' + data)) != 0) {
			first_p.before($('#' + data));
			if (first_p.is('p[id]')) first_p.before($('.' + first_id));
			$('#' + data).before($('.' + data));
			
			arrange_links(':visible',letter,first_number);
			repair_links(':visible',letter,first_number);
			
			//// Wonder if this would actually be expected behavior
			update_all_affected_links(first_id);
		}
		if (window.self !== window.top || typeof(nick) !== 'undefined') {
			var pageKeys = [];
			var pIDs = [];
			$('.inner,.outer').each(function() { pageKeys.push($(this).attr('class')); });
			$('.in + p[id]').each(function() { pIDs.push(this.id); });
			var msg = '["rearrange",' + JSON.stringify(pageKeys) + ',' + JSON.stringify(pIDs) + ',"' + data + '",-1,' + JSON.stringify(old_pageKeys) + ']';
			collab_send(msg);
		}
		//modify_arrange_buttons();
		return true;
	}
	else for (var i = set_p.index(set_p.last()); i >= 0; --i) {
		var target_p = set_p.eq(i);
		if (y > target_p.offset().top + target_p.outerHeight()*0.5) {
			if (i != set_p.index($('#' + data))) {
				target_p.after($('#' + data));
				$('#' + data).before($('.' + data));
				
				arrange_links(':visible',letter,first_number);
				repair_links(':visible',letter,first_number);
				
				//// Wonder if this would actually be expected behavior
				update_all_affected_links(first_id);
			}
			if (window.self !== window.top || typeof(nick) !== 'undefined') {
				var pageKeys = [];
				var pIDs = [];
				$('.inner,.outer').each(function() { pageKeys.push($(this).attr('class')); });
				$('.in + p[id]').each(function() { pIDs.push(this.id); });
				var msg = '["rearrange",' + JSON.stringify(pageKeys) + ',' + JSON.stringify(pIDs) + ',"' + data + '",' + i + ',' + JSON.stringify(old_pageKeys) + ']';
				collab_send(msg);
			}
			//modify_arrange_buttons();
			return true;
		}
	}
	return false;
}

function arrange_links(filter,letter,first_number) {
	var child_letter = String.fromCharCode(letter.charCodeAt(0)+1);
	$('.in + p[id]').filter(filter).each(function(index) {
		var old_number = this.id.substr(1);
		var new_number = index + first_number;
		if ($(this).attr('id').charAt(0) == letter) {
			$(this).attr('id',letter+new_number);
			$('.' + letter + old_number).removeClass(letter+old_number).attr('id',letter+new_number);
			var page = $('.' + child_letter + old_number);
			var new_id = '_' + child_letter + new_number + '_';
			if (page.attr('id')) new_id = page.attr('id') + '_' + child_letter + new_number + '_';
			page.removeClass(child_letter+old_number).attr('id',new_id);
			var tangents = $('._' + child_letter + old_number);
			if (tangents.html()) tangents.removeClass('_' + child_letter + old_number).addClass('-' + child_letter + new_number);
		}
	});
	
	/*
	/// Potential rewrite using "list comprehension" instead of loop. Would eliminate need for repair_links function.
	/// Rewrite would also have to include entire layer in order to maintain the functionality of update_all_affected_links
	$('.in + p[id]').filter(filter).attr('id', function(index) {
		return letter + (index + first_number);
	});
	$('.in').filter(filter).attr('class', function(index) {
		return 'in ' + letter + $(this).next('p[id]').attr('id');
	});
	/// but how to handle page?
	*/
}

function repair_links(filter,letter,first_number) {
	var child_letter = String.fromCharCode(letter.charCodeAt(0)+1);
	$('.in').filter(filter).each(function(index) {
		var number = this.id.substr(1);
		if ($(this).attr('id')) {
			$(this).addClass(letter+number).attr('id','');
			var page = $('[id*="_' + child_letter + number + '_"]');
			page.addClass(child_letter+number).attr('id',page.attr('id').replace('_' + child_letter + number + '_',''));
			var tangents = $('.-' + child_letter + number);
			if (tangents.html()) tangents.addClass('_'+child_letter+number).removeClass('-' + child_letter + number);
		}
	});
}

function update_all_affected_links(first_id) {
	// Old Condition: $('.' + String.fromCharCode(j) + 1).html()
	for (var j = first_id.charCodeAt(0) + 2; $('.in').filter('[class*="' + String.fromCharCode(j) + '"]').html(); j+=2) {
		var parent_container_letter = String.fromCharCode(j - 3);
		if (parent_container_letter == '`') parent_container_letter = 'Z';
		var letter = String.fromCharCode(j);
		var container_letter = String.fromCharCode(j - 1);
		var stop_index = 0;
		for (var i=1; $('.' + parent_container_letter + i).html(); ++i) {
			stop_index += count_children($('.' + parent_container_letter + i));
			var parent_allow_linear_checked = $('.' + parent_container_letter + i).children('form.linear').children('input').prop('checked');
			if ((typeof(parent_allow_linear_checked) !== 'undefined') && !parent_allow_linear_checked) {
				++stop_index;
			}
			if (!$('.' + parent_container_letter + (i+1)).html()) ++i;
		}
		var first_number = 1;
		var list = [];
		for (var index = 1; index <= stop_index; ++index) {
			var obj = $('.' + container_letter + index);
			var skip = 0;
			// Prevents double counting a page summary
			for (var i = 0; i < list.length; ++i) if (obj.is(list[i])) { skip = 1; break; }
			if (skip) continue;
			list.push(obj);
			arrange_links(obj.children(),letter,first_number);
			if (obj.children('p[id*="' + letter + '"]').index() != -1) {
				first_number += count_children(obj);
				var allow_linear_checked = obj.children('form.linear').children('input').prop('checked');
				if ((typeof(allow_linear_checked) !== 'undefined') && !allow_linear_checked) {
					++first_number;
				}
			}
		}
		var list = [];
		for (var index = 1; index <= stop_index; ++index) {
			var obj = $('.' + container_letter + index);
			var skip = 0;
			// Prevents double counting a page summary
			for (var i = 0; i < list.length; ++i) if (obj.is(list[i])) { skip = 1; break; }
			if (skip) continue;
			list.push(obj);
			repair_links(obj.children(),letter,first_number);
		}
	}
}

/// summary and page are null for a new page
function insert_page(summary,page,exists,reinsert,cut,ghost) {
	var first_id, letter, number;
	var current_div = $('.outer,.inner').filter(':visible');
	if ((window.self !== window.top || typeof(nick) !== 'undefined') && !ghost) {
		if (summary) summary.find('.delete,.handle').remove();
		var data = {
			'pageID': current_div.attr('id'),
			'summary': summary && summary.html(),
			'page': page && page.selector,
			'exists': exists,
			'reinsert': reinsert,
			'cut': cut,
			'last': current_div.children('p[id]').last().attr('id')
		};
		var msg = '["insert_page",' + JSON.stringify(data) + ',' + ((cut) ? JSON.stringify(getSenderRange()) : '0') + ']';
		collab_send(msg);
	}
	if (!reinsert) {
		if (typeof(page) !== 'undefined' && page instanceof jQuery) {
			if (current_div.is(page)) {
				console.log('self');
				return 'self';
			}
			function redundant_test(current_div,page) {
				var classes = page.attr('class').split(' ');
				for (var i in classes) if (classes[i] != 'inner' && classes[i] != 'outer') 
					if (current_div.hasClass(get_parent_tag(classes[i]))) return true;
				return false;
			}
			if (redundant_test(current_div,page)) {
				console.log('redundant');
				return 'redundant';
			}
			function cyclical_test(id,page) {
				if (!id) return false;
				if (page.hasClass(id)) return true;
				var classes = $('.'+id).attr('class').split(' ');
				for (var i in classes) if (classes[i] != 'inner' && classes[i] != 'outer') 
					if (cyclical_test(get_parent_tag(classes[i]),page)) return true;
				return false;
			}
			if (cyclical_test(current_div.attr('id'),page)) {
				console.log('cyclical');
				return 'cyclical';
			}
		}
	}
	var current_div_id = current_div.attr('id');
	if (current_div_id.charAt(0) == 'z') return false;
	//$('.insert').remove();
	if (!current_div.hasClass('outer')) {
		current_div.attr('class','outer ' + current_div.attr('class'));
		letter = String.fromCharCode(current_div_id.charCodeAt(0) + 1);
		if ($('#' + letter + '1').html()) number = 0;
		else number = 1;
		first_id = letter + number;
		
		if (letter == 'Z') {
			current_div.removeClass('outer');
			return false;	
		}
		
		current_div.append('<form class="linear"><input type="checkbox" name="linear" value="Allow">Allow Linear Reading</form>');
		current_div.find('.linear input').on('click',function(event) {
			var parent_id = get_parent_tag($(this).parent().parent().attr('id'));
			var first_id = $('.' + parent_id).children('p[id]').first().attr('id');
			update_all_affected_links(first_id);
			if (window.self !== window.top || typeof(nick) !== 'undefined') {
				var pageKeys = [];
				var pIDs = [];
				$('.inner,.outer').each(function() { pageKeys.push($(this).attr('class')); });
				$('.in + p[id]').each(function() { pIDs.push(this.id); });
				var msg = '["rearrange",' + JSON.stringify(pageKeys) + ',' + JSON.stringify(pIDs) + ',0,"' + $(this).parent().parent().attr('id') +'"]';
				collab_send(msg);
			}
		});
		if (_drag) toggle_edit_one(current_div);
	}
	else {
		first_id = current_div.children('p[id]').first().attr('id');
		if (first_id) {
			letter = first_id.charAt(0);
			number = parseInt(first_id.substr(1),10);
		}
		else {
			letter = 'a';
			number = 1;
		}
	}
	var div_letter = String.fromCharCode(letter.charCodeAt(0) + 1);
	if (cut) {
		if (!ghost) {
			if (getSelectionHtml()) document.execCommand('delete',false,null);
		}
		else {
			// do stuff here for partner_insert_page(). Probably need sender_range
			var string;
			if (page) string = page.cloneContents();
			if (!string || string.textContent == '') string = '<p>Content</p>';
			else if (page) partner_delete(page);
			page = $('<div class="inner"><button class="out">-</button><h3 contenteditable="true">Title</h3><div contenteditable="true"></div></div>');
			page.children('div').append(string);
		}
	}
	current_div.append('<button type="button" class="in ' + letter + '0">+</button>');
	//children('h3').after
	if (summary) {
		summary.attr('id',letter + '0');
		summary.find('.delete,.handle').remove();
	}
	else if (exists) {
		summary = '<p id="' + letter + '0"><span class="italic">' + page.children('h3').html() + '</span><br /><span>Summary</span></p>';
	}
	else summary = '<p id="' + letter + '0"><span class="italic">Title</span><br /><span>Summary</span></p>';
	if (_drag) {
		toggle_drag();	// Turns off drag so new page summary will be in sync$('#' + letter + '0').html('');
		$('.in.' + letter + '0').after(summary);
		toggle_drag();	// Turns drag back on
	}
	else {
		$('.in.' + letter + '0').after(summary);
		$('#' + letter + '0').children('span').attr('contenteditable','true');
	}
	size_buttons(current_div);
	create_handles(letter+0);
	create_deletes(letter+0);
	
	if (!page) {
		$('.inner,.outer').last().after('<div class="inner ' + div_letter + '0"><h3>Title</h3><p>Content</p></div>');
		toggle_edit_one($('.' + div_letter + '0'));
		$('.' + div_letter + '0 h3').before('<button class="out" type="button">-</button>');
	}
	else {
		if (!exists) $('.inner,.outer').last().after(page.attr('class','inner ' + div_letter + '0'));
		else page.addClass(div_letter + '0');
	}
	
	if (!current_div.find('.linear input').prop('checked')) {
		arrange_links(':visible',letter,number);
		repair_links(':visible',letter,number);
	}
	// Could possibly be improved with more specific first_id
	if (letter.charCodeAt(0) >= 97) update_all_affected_links('a1');
	$('body').css('overflow','auto');
	get_map_width(current_div);
	resize_windows();
	resize_writing_items();
	current_div.attr('id',current_div_id);
	redraw_node_map(current_div_id);
	//create_inserts();
	
	/*if (!cut) */$(window).scrollTop($(document).height());
	/*else {
		toggle_edit_one(current_div);
		toggle_edit_one(current_div);
	}*/
}

/// Handles pages with multiple keys
function delete_page(target_id,quick,ghost) {
	var current_page = $('.inner,.outer').filter(':visible');
	if (typeof(target_id) !== 'undefined' && target_id) {
		var old_id = current_page.attr('id');
		go_to(old_id,target_id);
		return delete_page(null,quick,ghost);
	}
	if (!ghost) {
		if (window.self !== window.top || typeof(nick) !== 'undefined') {
			var msg = '["delete_page","' + current_page.attr('id') + '"]';
			collab_send(msg);
		}
	}
	if (current_page.hasClass('outer')) {
		//alert('"' + current_page.children('h3').html() + '" has subsections.\nYou will have to delete them before you can delete it.');
		//return false;
		/// Should this be allowed? Deleting pages gets computationally heavy and users probably don't actually want to delete multiple pages
		try { if (!confirm('"' + current_page.children('h3').html() + '" has subsections that will be deleted. Do you want to continue?')) {
			if (quick) {
				var pages = new Array();
				var key_spot = new Array();
				var id = current_page.attr('id');
				for (var i=0; id; ++i) {
					pages[i] = $('.'+id);
					var classes = pages[i].attr('class').split(' ');
					for (var j in classes) if (id == classes[j]) break;
					key_spot[i] = j;
					id = get_parent_tag(id);
				}
				update_all_affected_links('a1');
				for (var i in key_spot) pages[i].attr('id',pages[i].attr('class').split(' ')[key_spot[i]]);
			}
			return false;
		} }
		catch (e) { console.log(e); }
		var test = true;
		current_page.children('.in + p[id]').each(function(index) {
			var target_id = this.id;
			target_id = String.fromCharCode(target_id.charCodeAt(0)+1) + target_id.substr(1);
			test = delete_edge(target_id,1);
			if (!test) return false;
		});
		if (!test) return false;
	}
	var current_id = current_page.attr('id');
	var summaries = new Array();
	var parents = new Array();
	var current_keys = current_page.attr('class').split(' ');
	current_keys.shift();
	var active_parent, active_parent_id;
	current_page.removeAttr('id');
	for (var j=0; j < current_keys.length; ++j) {
		var current_letter = current_keys[j].charAt(0);
		var link_letter = String.fromCharCode(current_keys[j].charCodeAt(0)-1);
		var current_number = current_keys[j].substr(1);
		var page_summary = $('#' + link_letter + current_number);
		var parent_page = page_summary.parent();
		var parent_id = parent_page.attr('id');
		if (!parent_id) parent_id = parent_page.attr('class').split(' ').pop();
		var parent_page_first_id = parent_page.children('p[id]').first().attr('id');
		var arrange_letter = parent_page_first_id.charAt(0);
		var arrange_first_number = parseInt(parent_page_first_id.substr(1),10);
		
		/// Might want to record these tangents in the undo delete stack.
		var tangent = $('.tangent._' + current_keys[j]);
		tangent.each(function(index) {
			var $this = $(this);
			$this.before($this.html()).remove();
		});
	
		if ($('body').css('overflow-y')=='hidden') $('body').css('overflow-y','auto');
		parent_page.show();
		current_page.hide();
		if (current_keys[j] == current_id) {
			active_parent = parent_page;
			active_parent_id = parent_id;
		}
	
		/// Turns off edit to handle content split by a page summary
		if (!_drag) toggle_edit_one(parent_page);

		summaries.push(page_summary.detach());
		parents.push(parent_page);
		$('.in.' + link_letter + current_number).remove();
	
		/// Turns edit back on after "merging" content once separated by a page summary
		if (!_drag) toggle_edit_one(parent_page);
		
		if (parent_page.has('p[id]').is(':visible')) {
			if (!quick) {
				arrange_links(parent_page.children(),arrange_letter,arrange_first_number);
				repair_links(parent_page.children(),arrange_letter,arrange_first_number);
			}
		}
		else {
			if (_drag) toggle_edit_one(parent_page);
			if (parent_page.hasClass('inner')) {
				parent_page.removeClass('outer');
				parent_page.children('form.linear').remove();
			}
		}
		parent_page.hide();
	}
	active_parent.show();
	_delete.push({ page: current_page.detach(), summary: summaries, parent: parents });
	if (!quick) update_all_affected_links('a1');
	active_parent.attr('id',active_parent_id);
	if (!quick) {
		mapWidth = 100;
		get_map_width();
		resize_windows();
		size_buttons(active_parent);
		redraw_node_map(active_parent_id);
		enable_sidebar_option($('#undo_page_delete'));
	}
	return true;
}

function undo_page_delete(ghost) {
	if (_delete.length == 0) return false;
	var restore = _delete.pop();
	for (var i=0; i < restore.parent.length; ++i) {
		var current_page = $('.inner,.outer').filter(':visible');
		var restore_parent_id = restore.parent[i].attr('class').split(' ').pop();
		if (!current_page.hasClass(restore_parent_id)) go_to(current_page.attr('id'),restore_parent_id);
		insert_page(restore.summary[i],restore.page,i,true,false,true);
	}
	if ((window.self !== window.top || typeof(nick) !== 'undefined') && !ghost) {
		var msg = '["undo_page_delete","' + restore.page.attr('class').split(' ').pop() + '"]';
		collab_send(msg);
	}
}

function delete_edge(edge,quick) {
	var page = $('.' + edge);
	var prefix = 1;
	if (page.hasClass('outer')) ++prefix;
	var classes = page.attr('class').split(' ');
	// Multiply Keys
	if (classes.length > prefix + 1) {
		var link_letter = String.fromCharCode(edge.charCodeAt(0) - 1);
		var link_number = edge.substr(1);
		var link_paragraph = $('#' + link_letter + link_number);
		var parent_page = link_paragraph.parent();
		link_paragraph.remove();
		$('.in.' + link_letter + link_number).remove();
		page.removeClass(edge);
		
		if (!parent_page.has('.in + p[id]').html()) {	
			if (parent_page.hasClass('inner')) {
				parent_page.removeClass('outer');
				parent_page.children('form.linear').remove();
			}
		}
		if (page.hasClass('outer')) {
			var test = !page.filter('[class*="' + String.fromCharCode(page.children('.in + p[id]').attr('id').charCodeAt(0) - 1) + '"]').html();
			
			function slinky(page,recursion) {
				var classes = page.attr('class').split(' ');
				var id = classes.shift();
				if (id == 'outer') id = classes.shift();
				if (id == 'inner') id = classes.shift();
				var new_link_letter = String.fromCharCode(id.charCodeAt(0) + 1);
				var new_child_letter = String.fromCharCode(id.charCodeAt(0) + 2);
				/**/
				// Original Idea: Put at the end of layer
				var last_id = $('.in + p[id*="' + new_link_letter + '"]').last().attr('id');
				var new_number = 0;
				if (last_id) new_number = parseInt(last_id.substr(1),10);
				/**/
				/*
				// Alternate Idea: Make sure they're after EVERYTHING
				// Account for recursion as well.
				var new_number = $('.inner,.outer').index($('.inner,.outer').last());
				if (recursion) new_number = recursion;
				*/
				page.children('.in + p[id]').each(function(index) {
					var $this = $(this);
					var old_child_letter = String.fromCharCode(this.id.charCodeAt(0) + 1);
					var old_number = parseInt(this.id.substr(1));
					++new_number;
					// Avoid identity crises
					while ($('.' + new_child_letter + new_number).html()) ++new_number;
					$this.prev('.in').removeClass(this.id).addClass(new_link_letter + new_number);
					$this.attr('id',new_link_letter + new_number);
					var child_page = $('.' + old_child_letter + old_number);
					child_page.removeClass(old_child_letter + old_number).addClass(new_child_letter + new_number);
					if (child_page.hasClass('outer')) slinky(child_page,new_number);
				});
			};
			if (test) {
				slinky(page);
			}
			//$('.in + p[id*="c"]').last().attr('id')
		}
		
		arrange_links($('.Z1').children(),'a',1);
		repair_links($('.Z1').children(),'a',1);
		update_all_affected_links('a1');
		
		var visible_page = $('.inner,.outer').filter(':visible');
		var old_id = visible_page.attr('id');
		if (!visible_page.hasClass(old_id)) {
			var classes = visible_page.attr('class').split(' ');
			var new_id;
			for (var i = 0; i < classes.length; ++i) {
				new_id = classes[i];
				if (new_id != 'inner' && new_id != 'outer' && new_id.charAt(0) == old_id.charAt(0)) break;
			}
			visible_page.attr('id',new_id);
		}
		
		size_buttons(parent_page);
		redraw_node_map(visible_page.attr('id'));
		return true;
	}
	// Single Key
	else {
		//go_to($('.inner,.outer').filter(':visible').attr('id'),edge);
		return delete_page(edge,quick);
	}
}

function toggle_summary_title() {
	var _title = $('#' + document.getSelection().anchorNode.parentNode.parentNode.id).children('span.italic');
	if (_title.css('display') == 'inline-block') {
		_title.hide();
		_title.next('br').hide();
	}
	else {
		_title.show();
		_title.next('br').show();
	}
	size_buttons($('.inner,.outer').filter(':visible'));
}

function modify_arrange_buttons(create,not) {
	var visible_div = $('.inner,.outer').filter(':visible').not(not);
	visible_div.children('p[id]').not(':last').each(function(index) {
		var id = this.id;
		var $this = $(this);
		$thisLeft = $this.offset().left;
		$thisWidth = $this.outerWidth();
		
		if (create) $('body').append('<button class="switch">&nbsp;&darr;&nbsp;&uarr;&nbsp;</button>');
		var _switch = $('.switch').eq(index);
		var _in = visible_div.children('.in').eq(index);
		var _inNext = visible_div.children('.in').eq(index+1);
		var _inTop = _in.offset().top;
		var _inNextTop = _inNext.offset().top;
		
		_switch.css({	'background-color' : 'rgb(144, 89, 233)',
						'border-color' : 'rgb(144, 89, 233)',
						'font-family' : 'Optima, Corbel, sans-serif',
						'width' : 'auto',
						'padding-bottom' : 3,
						'line-height' : 1,
						'height' : 24,
						'position' : 'absolute'
		}).css({		'top' : (_inTop + _in.outerHeight() + _inNextTop - _switch.outerHeight())*0.5,
						'left': $thisLeft + $thisWidth - _switch.outerWidth()*2
		});
		
	});
	if (create) $('.switch').on('click',function(event) {
		var set_p_id = $('p[id]').filter(':visible');
		var first_id = set_p_id.eq(0).attr('id');
		var letter = first_id.charAt(0);
		var first_number = parseInt(first_id.substr(1),10);
		
		var index = $('.switch').index($(this));
		var _before = set_p_id.eq(index);
		var _beforeId = _before.attr('id');
		var _after = set_p_id.eq(index+1)
		
		_after.after(_before);
		_before.before($('.in.'+_beforeId));
		
		modify_arrange_buttons();
		
		arrange_links(':visible',letter,first_number);
		repair_links(':visible',letter,first_number);
		
		//// Wonder if this would actually be expected behavior
		update_all_affected_links(first_id);
	});
	
}

function disable_sidebar_option(sidebar_option) {
	sidebar_option.addClass('disabled');
}

function enable_sidebar_option(sidebar_option) {
	sidebar_option.removeClass('disabled');
}

function create_sidebar() {
	$('.inner,.outer').first().before('<div id="sidebar"></div>');
	$('#sidebar')
		.append('<p id="drag">' + (_drag ? 'Stop Dragging Summaries' : 'Start Dragging Summaries') + '</p>')
		.append('<p id="view_graph">View Graph of All Pages</p>')
		.append('<p id="add_intro_text">Add Introductory Text</p>')
		.append('<p id="insert_new_page">Insert New Page</p>')
		//.append('<p id="insert_existing_page">Insert Existing Page</p>')
		.append('<p id="delete_page">Delete Current Page</p>')
		.append('<p id="undo_page_delete">Undo Page Delete</p>')
		.append('<hr />')
		.append('<p id="publish">Save and Publish</p>')
		.append('<p id="save">Save without Publishing</p>')
		.append('<hr />')
		//.append('<p id="home">Return to Homepage</p>')
		.append('<p id="close">Close Sidebar</p>')
	;
	
	var current_page = $('.inner,.outer').filter(':visible');
	if (typeof(d3) === 'undefined' || typeof(Modernizr) === 'undefined' || !Modernizr.svg) disable_sidebar_option($('#view_graph'));
	if (!$('[class*="A"]').html()) disable_sidebar_option($('#toggle_view'));
	if (current_page.is('[class*="A"]')) {
		disable_sidebar_option($('#insert_new_page,#insert_existing_page,#unlink'));
		$('#toggle_view').html('View Linked Pages');	
	}
	if (current_page.hasClass('outer')) {
		disable_sidebar_option($('#unlink,#delete_page'));
	}
	if (current_page.has('h3 + div[contenteditable]').html()  || (current_page.has('h3 + p').html() && _drag)) {
		disable_sidebar_option($('#add_intro_text'));
	}
	$('body').on('drop',function(event) {
		var current_page = $('.inner,.outer').filter(':visible');
		if (current_page.has('h3 + div[contenteditable]').html() || (current_page.has('h3 + p').html() && _drag)) {
			disable_sidebar_option($('#add_intro_text'));
		}
		else enable_sidebar_option($('#add_intro_text'));
	});
	$('body').on('fadeIn show','.inner,.outer',function(event) {
		if ($(this).has('h3 + div[contenteditable]').html() || ($(this).has('h3 + p').html() && _drag)) {
			disable_sidebar_option($('#add_intro_text'));
		}
		else enable_sidebar_option($('#add_intro_text'));
		if ($(this).hasClass('outer')) disable_sidebar_option($('#unlink,#delete_page'));
		else if ($(this).hasClass('inner') && !$(this).is('[class*="A"]')) enable_sidebar_option($('#unlink,#delete_page'));
	});
	if (_delete.length == 0) disable_sidebar_option($('#undo_page_delete'));
	
	$('#drag').on('click',function(event) {
		toggle_drag();
		if (_drag) {
			$('#drag').html('Stop Dragging Summaries');
			$('body').append('<style id="hide_handles">.handle { display: none !important; }</style>');
		}
		else {
			$('#drag').html('Start Dragging Summaries');
			$('#hide_handles').remove();
		}
	});
	$('#insert_new_page').on('click',function(event) {
		if ($(this).hasClass('disabled')) return false;
		insert_page();
		disable_sidebar_option($('#unlink,#delete_page'));
	});
	$('#add_intro_text').on('click',function(event) {
		if ($(this).hasClass('disabled')) return false;
		var current_page = $('.inner,.outer').filter(':visible');
		if (_drag) current_page.children('h3').after('<p>Introduction</p>');
		else current_page.children('h3').after('<div contenteditable="true"><p>Introduction</p></div>');
		disable_sidebar_option($('#add_intro_text'));
	});
	$('#view_graph').on('click',function(event) {
		if ($(this).hasClass('disabled')) return false;
		$('#graphMode').html(mobile ? 'Info' : 'Collapse').attr('class',mobile ? 'info' : 'collapse');
		toggle_graph();
	});
	$('#insert_existing_page').on('click',function(event) {
		if ($(this).hasClass('disabled')) return false;
	});
	$('#delete_page').on('click',function(event) {
		if ($(this).hasClass('disabled')) return false;
		delete_page();
		var current_page = $('.inner,.outer').filter(':visible');
		if (!current_page.hasClass('outer')) enable_sidebar_option($('#delete_page'));
	});
	$('#undo_page_delete').on('click',function(event) {
		if ($(this).hasClass('disabled')) return false;
		undo_page_delete();
		if (_delete.length == 0) disable_sidebar_option($('#undo_page_delete'));
	});
	$('#publish,#save').on('click',function(event) {
		mathPublish();
		if (_drag) toggle_drag();
		if ($('#bold').is(':visible')) toggle_edit();
		var text = '';
		
		$('video').replaceWith(function(index) { return $(this).children('object'); });
		$('object').replaceWith(function(index) { return '<span class="youtube-embed">' + this.id + '</span>'; });
		
		$('.handle,.delete').remove();
		$('.inner,.outer').each(function(index) {
			var $this = $(this);
			$this.children('form.linear').remove();
			
			// Remove excess <br> from titles
			$this.find('h3 br').remove();
			$this.find('p[id] .italic br').remove();
			
			// To work with htmlPurifier
			$this.children('.in,.out').empty();
			$this.find('.tangent').replaceWith(function() { 
				return '<a class="' + $(this).attr('class') + '">' + $(this).text() + '</a>';
			});
			
			if ($this.hasClass('inner')) text += '<div class="' + $this.attr('class') + '">' + $this.html().replace(/\\/g,'\\\\') + '</div>';
			else text += '<div class="' + $this.attr('class') + '" id="Z1">' + $this.html().replace(/\\/g,'\\\\') + '</div>';
			
			// Illusion
			$this.children('.in').html('+');
			$this.children('.out').html('-');
			$this.find('a.tangent').replaceWith(function() { 
				return '<button class="' + $(this).attr('class') + '">' + $(this).text() + '</button>';
			});
		});
		// Illusion
		create_handles();
		create_deletes();
			
		$('#_save').val(text);
		$('#_title').val($('.Z1 h3').html());
		if (this.id == 'publish') $('#_publish').val('true');
		$('form.save').submit();
	});
	$('#home').on('click',function(event) {
		window.location = 'https://www.okeebo.com/beta/';
	});
	$('#close').on('click',function(event) {
		delete_sidebar();
	});
	
	var sidebar_width = $('#sidebar').width();
	//var calc_width = 'calc(100% - 48px - ' + sidebar_width + 'px)';
	//var inner_outer = $('.inner,.outer');
	//inner_outer.css('width',calc_width);
	//if (inner_outer.outerWidth != $(window).width() - 48 - sidebar_width) inner_outer.css('width','-webkit-' + calc_width);
	
	$('#menu').attr('title','Close Sidebar');
	
	$('body').css('overflow-y','auto');
	resize_windows();
	resize_writing_items();
	$('.left').css('left',sidebar_width);
	size_buttons($('.inner,.outer').filter(':visible'));
}

function delete_sidebar() {
	$('#sidebar').remove();
	$('body').off('fadeIn show','.inner,.outer');
	$('body').off('drop');
	var inner_outer = $('.inner,.outer');
	$('#menu').attr('title','Show Sidebar');
	inner_outer.css('width','');
	resize_windows();
	$('.left').css('left',0);
	size_buttons(inner_outer.filter(':visible'));
	resize_writing_items();
}

function make_tangent() {
	document.execCommand('createLink',false,'#tangent');
	toggle_graph();
	$('#graphMode').attr('class','make_tangent').html('Tangent');
}
function link_tangent(target_page) {
	$('a[href="#tangent"]').replaceWith(function() {
		return '<button class="tangent _' + target_page + '">' + $(this).text() + '</button>';
	});
}
function undo_tangent() {
	$('a[href="#tangent"]').replaceWith(function() {
		return $(this).text();
	});
}
function find_tangent() {
	return $(getSelectionHtml()).children('button.tangent');
}
function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}

function cleanSummaries() {
	$('.in + p[id]').each(function() { 
		var last = $(this).children('span').eq(1).children().last(); 
		while (last.is('br')) { 
			last.remove(); last = $(this).children('span').eq(1).children().last();
		}
	});
}

function insert_video() {
	var yt_url = prompt('Paste YouTube URL here:');
	var yt_id = yt_url.match(/[\/?&]v[\/=].{11}/g);
	if (yt_id) {
		yt_id = yt_id[0].substr(3);
		var id = "newVid" + String(Math.random()).replace(/\./g,'');
		insertAfter('<video id="' + id + '" width="640" height="360"></video>');
		$.get('https://www.okeebo.com/video/?id=' + yt_id + '&html5',function(data) {
			$('#' + id).replaceWith(data);
		}).fail(function(data) {
			$('#' + id).replaceWith('<object style="height: 360px; width: 640px;" id="' + yt_id + '" type="application/x-shockwave-flash" data="https://www.youtube.com/v/' + yt_id + '?hl=en_US&amp;version=3&amp;enablejsapi=1&amp;playerapiid=ytplayer&amp;rel=0" height="360" width="640">\n			<param name="movie" value="https://www.youtube.com/v/' + yt_id + '?hl=en_US&amp;version=3&amp;enablejsapi=1&amp;playerapiid=ytplayer&amp;rel=0">\n			<param name="allowFullScreen" value="true">\n			<param name="allowScriptAccess" value="always">\n		</object>');
		});
	}
	// Additional Support for Vimeo
	else if (yt_url.search('vimeo') != -1) {
		var vimeo = yt_url.match(/[0-9]{8}/)[0];	
		var id = "newVid" + String(Math.random()).replace(/\./g,'');
		insertAfter('<video id="' + id + '" width="640" height="360"></video>');
		$.get('https://www.okeebo.com/video/vimeo.php?id=' + vimeo + '&html5',function(data) {
			$('#' + id).replaceWith(data);
		}).fail(function(data) {
			var flash = 'https://vimeo.com/moogaloop.swf?clip_id=' + vimeo;			
			$('#' + id).replaceWith('<object id="' + vimeo + '" type="application/x-shockwave-flash" width="640" height="360" data="' + flash + '">\n			<param name="flashvars" value="clip_id=' + vimeo + '&amp;js_getConfig=getConfig&amp;js_setConfig=setConfig&amp;js_onLoad=onMoogaloopLoaded' + '&amp;api=1' + '&amp;moogaloop_type=moogaloop">' + '\n			<param name="movie" value="' + flash + '">\n			<param name="allowfullscreen" value="true">\n			<param name="allowscriptaccess" value="always">\n			<param name="wmode" value="opaque">\n			<param name="quality" value="high">\n			<param name="scalemode" value="noscale">\n		</object>');
		});
	}
}

function insertEq() {
	insertAfter('<span class="OkeeboMath" id="newMath">\\[ \\sin^2 \\theta + \\cos^2 \\theta = 1 \\]</span>');
	var math = $('#newMath');
	MathJax.Hub.Queue(['Typeset',MathJax.Hub,math[0]]);
	insertMathLangButtons($('.OkeeboMath').index(math.removeAttr('id').attr('contenteditable','false')));
}

function insertTable(row,col) {
	if (typeof(row) === 'number' && typeof(col) === 'number') {
		var html = '<table border=1>';
		for (var i=0; i<row; ++i) {
			html += '<tr>';
			for (var j=0; j<col; ++j) html += '<td><br></td>';
			html += '</tr>';
		}
		insertAfter(html);
	}
}

function insertCol(place) {
	var td = $(document.getSelection().anchorNode.parentNode);
	var i = td.parent('tr').children('td').index(td);
	var col = $('table').find('tr').children('td:nth-child(' + (i+1) + ')');
	if (place == 'before') col.before('<td></td>');
	else col.after('<td></td>');
}

function insertRow(place) {
	var td = $(document.getSelection().anchorNode.parentNode);
	var row = td.parent('tr');
	var num = row.children('td').index(row.children('td').last()) + 1;
	var html = '<tr>';
	for (var i=0; i<num; ++i) html += '<td><br></td>';
	html += '</tr>';
	if (place == 'before') row.before(html);
	else row.after(html);
}

function deleteCol(table,colNum) {
	if (table instanceof jQuery && table.is('table')) {
		var col = table.find('tr').children('td:nth-child(' + (colNum) + ')');
		col.remove();
	}
}
function deleteRow(table,rowNum) {
	if (table instanceof jQuery && table.is('table')) {
		var row = $('table').find('tr').eq(rowNum - 1);
		row.remove();
	}
	else if (typeof(rowNum) === 'undefined') {
		if (typeof(table) === 'number') {
			rowNum = table;
			var td = $(document.getSelection().anchorNode.parentNode);
			var table = td.parents('table');
			deleteRow(table,rowNum);
		}
		else if (typeof(table) === 'undefined') {
			var td = $(document.getSelection().anchorNode.parentNode);
			var row = td.parent('tr');
			row.remove();
		}
	}
}

function insertAfter(html) {
	var element = document.getSelection().anchorNode;
	var closest_p = $(element).closest('p');
	var current_div = $('.inner,.outer').filter(':visible');
	if (closest_p.html()) {
		if (closest_p.is('.outer [id]')) closest_p.children('span').not(':first-child').append(html);
		else closest_p.after(html);
	}
	else {
		if (!current_div.hasClass('outer')) current_div.find('p').eq(0).before(html);
		else current_div.find('h3').after(html);
	}
	size_buttons(current_div);
}

function make_iframe() {
	insertAfter('<iframe src="https://www.okeebo.com/img" />');
	iframe_trigger();
}
function iframe_trigger() {
	$('iframe').load(function() {
		var $this = parent.$(this);
		$this.height($this.contents().find('html').height());
		iframe_to_image($this);
	});
}
function iframe_to_image(iframe) {
	if (!iframe) iframe = parent.$('iframe');
	var img = iframe.contents().find('img');
	if (img.index() != -1) iframe.replaceWith(img);
	parent.$('title').html('Okeebo');
	image_wrap();
}
function image_wrap() {
	var _img = $('img,video').filter(function() { return !$(this).parents('[contenteditable="true"]').html(); });
	_img.wrap('<div contenteditable="true">');
}

function create_handles(id) {
	if (typeof(id) === 'undefined') $('.outer > p[id]').append('<div class="handle"></div>');
	else if (typeof(id) === 'string') $('.outer > p[id="' + id + '"]').append('<div class="handle"></div>');
	else if (typeof(id) === 'object') for (var i in id) $('.outer > p[id="' + id[i] + '"]').append('<div class="handle"></div>');	
	else return false;
	
	$('.handle')
		.off('mousedown').off('mouseenter').off('mouseleave')
		.on('mousedown',function(event) {
			clear_selected_text();
			$('p[id]').css('outline','');
			toggle_drag(1);
			$(document).on('mouseout mouseup',function(event) {
				toggle_drag(1);
				$(document).off('mouseout mouseup');
				if (event.type == 'mouseup') $(event.target).parent('p[id]').css({'outline':'dashed 1px #ccc','outline-offset':'-2px'});
			});
			//$('.inner p').css('outline','dashed 1px #ccc'); 
			$('.outer').attr('ondrop','drop(event); toggle_drag(1); $(document).off("mouseout mouseup");');
			
			color_dragging(event,$(this).parent('p[id]').attr('id'));
		})
		.on('mouseenter',function(event) { 
			$(this).parent('p[id]').css({'outline':'dashed 1px #ccc','outline-offset':'-2px'}); 
		})
		.on('mouseleave',function(event) {
			$(this).parent('p[id]').css({'outline':'','outline-offset':''});
		});	
}

function color_dragging(event,data) {
	var y = event.pageY;
	if (!y) y = event.clientY + $(window).scrollTop();
	if (!y) y = $('#dragdrop').offset().top + 25;
	var set_p = $('.outer').filter(':visible').children('p');
	set_p.each(function(index) {
		var $this = $(this);
		if (this.id != data) {
			if (y < $this.offset().top + $this.height()/2) $this.css('outline-color','#00FF80');
			else $this.css('outline-color','#FF8000');
		}
	});
}

function create_deletes(id) {
	if (typeof(id) === 'undefined') $('.outer > p[id]').append('<div class="delete"></div>');
	else if (typeof(id) === 'string') $('.outer > p[id="' + id + '"]').append('<div class="delete"></div>');
	else if (typeof(id) === 'object') for (var i in id) $('.outer > p[id="' + id[i] + '"]').append('<div class="delete"></div>');	
	else return false;
	$('.delete')
		.off('click').off('mouseenter').off('mouseleave')
		.on('click',function(event) {
			var parent_p = $(this).parent('p[id]');
			parent_p.css({'outline':'','outline-offset':''});
			var target_id = parent_p.attr('id');
			target_id = String.fromCharCode(target_id.charCodeAt(0)+1) + target_id.substr(1);
			delete_edge(target_id);
			$('.delete').remove();
			create_deletes();
		})
		.on('mouseenter',function(event) { 
			$(this).parent('p[id]').css({'outline':'dashed 1px #ccc','outline-offset':'-2px'}); 
		})
		.on('mouseleave',function(event) {
			$(this).parent('p[id]').css({'outline':'','outline-offset':''});
		});
	resize_writing_items();
}
/*
function create_inserts(id) {
	if (typeof(id) === 'undefined') $('.outer,.inner').append('<button class="insert">Insert New Page</button>');
	else if (typeof(id) === 'string') 
		$('.outer,.inner').filter('[class*="' + id + '"]').append('<button class="insert">Insert New Page</button>');
	else if (typeof(id) === 'object') for (var i in id) 
		$('.outer,.inner').filter('[class*="' + id[i] + '"]').append('<button class="insert">Insert New Page</button>');	
	else return false;
	$('.insert')
		.off('click')
		.on('click',function(event) {
			insert_page();
		});
}
*/

function DisplayToCode(index,type) {
	var container = $('.OkeeboMath');
	if (typeof(index) === 'number') container = container.eq(index);
	else {
		if (typeof(type) === 'undefined') type = index;
		container.each(function(i) { DisplayToCode(i,type); });
		return;
	}
	var math = MathJax.Hub.getJaxFor(container.children('script')[0]);
	if (math) {
		if (type != 'mml' && math.inputJax == "TeX") {
			var originalTeX = math.originalText;
			var formattedTeX;
			if (math.root.display == 'block') formattedTeX = '\\[ ' + originalTeX + ' \\]';
			else formattedTeX = '\\( ' + originalTeX + ' \\)';
			container.html('<span class="lang" contenteditable="true">' + formattedTeX + '</span>').removeClass('center')/*.attr('contenteditable','true')*/;
		}
		else {
			var originalMathML = math.root.toMathML().replace('<math xmlns="http://www.w3.org/1998/Math/MathML"','<math');
			var formattedMathML = originalMathML.replace(/ (?= *<)/g,'&nbsp;&nbsp;')
												.replace(/</g,'&lt;')
												.replace(/>/g,'&gt;')
												.replace(/\n/g,'<br>');
			container.html('<span class="lang" contenteditable="true">' + formattedMathML + '</span>').removeClass('center')/*.attr('contenteditable','true')*/;
			if (type == 'tex') MathMLtoTeX(index);
		}
	}
	else return false;
	return;
}

function CodeToDisplay(index,callback) {
	var container = $('.OkeeboMath');
	if (typeof(index) === 'number') container = container.eq(index);
	else {
		container.each(function(i) { CodeToDisplay(i); });
		return;	
	}
	container.children('br').remove();
	if (container.children('script').index() == -1) {
		var html = $('<div/>').html(container.html()).text();
		var formattedHTML = html.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ');
		container.html(formattedHTML).addClass('center').attr('contenteditable','false');
		MathJax.Hub.Queue(['Typeset',MathJax.Hub,container[0]]);
	}
	return;
}

function TeXtoMathML(index) {
	if (typeof(index) !== 'number') {
		$('.OkeeboMath').each(function(i) { TeXtoMathML(i); });
		return;	
	}
	MathJax.Hub.Queue(function() { CodeToDisplay(index); });
	MathJax.Hub.Queue(function() { DisplayToCode(index,'mml'); });
}

function MathMLtoTeX(index,change) {
	var container = $('.OkeeboMath');
	if (typeof(index) === 'number') container = container.eq(index);
	else if (index instanceof jQuery) {
		if (change) container = index;
		else container = index.clone();
	}
	else if (typeof(HTMLElement) !== 'undefined' && index instanceof HTMLElement) {
		MathMLtoTeX($().add(index),change);
		return;	
	}
	else if (typeof(HTMLCollection) !== 'undefined' && index instanceof HTMLCollection) {
		var length = index.length;
		for (var i=0; i<length; ++i) MathMLtoTeX(index[i],change);
		return;	
	}
	else if (typeof(index) === 'string') {
		container = $('<div />');
		container.text(index);
	}
	else {
		container.each(function(i) { MathMLtoTeX(i); });
		return;	
	}
	if (container.children('script').index() == -1) {
		container.children('button').remove();
		var math = container.children('math');
		if (math.length == 0) container.html($('<div/>').html(container.html()).text().replace(/\s(?=\s*<)/g,''));
		math = container.children('math');
		if (math.length > 0) container.html(processMathML(math,''));
		if (typeof(index) === 'string' || (index instanceof jQuery && !change)) console.log(container.html());
		else if (typeof(index) === 'number') container.html('<span class="lang" contenteditable="true">' + container.html() + '</span>');
	}
}

function processMathML(tag,string) {
	var tagName = tag[0].tagName.toLowerCase();
	if (tagName == 'math') {
		if (tag.attr('display') == 'block') string += '\\[';
		else string += '\\(';
	}
	if (tagName == 'msqrt') string += '\\sqrt{';
	if (tagName == 'mtable') {
		if (typeof(tag.attr('columnalign')) === 'undefined') string += '\\begin{array}{c}';
		else string += '\\begin{array}{' + tag.attr('columnalign').replace(/right/g,'r').replace(/left/g,'l').replace(/center/g,'c') + '}';
	}
	if (tagName == 'menclose') {
		var enclose = (MathJax.Hub.config.TeX.extensions.indexOf('enclose.js') != -1);
		var cancel = (MathJax.Hub.config.TeX.extensions.indexOf('cancel.js') != -1);
		switch(tag.attr('notation')) {
			case 'box':
				string += '\\boxed{';
				break;
			case 'updiagonalstrike':
				string += cancel ? '\\cancel{' : '{';
				break;
			case 'downdiagonalstrike':
				string += cancel ? '\\bcancel{' : '{';
				break;
			case 'updiagonalstrike downdiagonalstrike':
				string += cancel ? '\\xcancel{' : '{';
				break;
			case undefined:
				string += enclose ? '\\enclose{longdiv}{' : '{';
				break;
			default:
				// \enclose is a non-standard macro
				string += enclose ? '\\enclose{' + tag.attr('notation').replace(/ /g,',') + '}{' : '{';
		}
	}
	//string = string.replace(/\|\\begin{array}{c}$/,'\\begin{vmatrix}');
	tag.children().each(function(index) {
		var $this = $(this);
		if (tagName == 'mfrac' && index == 0) string += '\\frac{';
		if (tagName == 'mfrac' && index == 1) string += '}{';
		if (tagName == 'msub' && index == 1) string += '_';
		if (tagName == 'msup' && index == 1) string += '^';
		if (tagName == 'msubsup' && index == 1) string += '_';
		if (tagName == 'msubsup' && index == 2) string += '^';
		if (tagName == 'mroot' && index == 0) {
			string += '\\sqrt[';
			var root = tag.children().eq(1);
			if (root.children().length == 0) string += root.text();
			string = processMathML(root,string);
			string += ']{';
		}
		if (tagName == 'munder' && index == 0) {
			string += '\\underset{';
			var below = tag.children().eq(1);
			if (below.children().length == 0) string += below.text();
			string = processMathML(below,string);
			string += '}{';
		}
		if (tagName == 'mover' && index == 0) {
			string += '\\overset{';
			var above = tag.children().eq(1);
			if (above.children().length == 0) string += above.text();
			string = processMathML(above,string);
			string += '}{';
			if (above.attr('stretchy') == 'false') string = string.replace(/overset{\^}{$/,'hat{');
			else string = string.replace(/overset{\^}{$/,'widehat{');
			if (above.attr('accent') == 'false') string = string.replace(/overset{→}{$/,'overrightarrow{')
																.replace(/overset{¯}{$/,'overline{');
		}
		if (tagName == 'munderover' && index == 0) string += '\\mathop ';
		if (tagName == 'munderover' && index == 1) string += '\\limits_{';
		if (tagName == 'munderover' && index == 2) string += '}^{';
		if (this.tagName.toLowerCase() == 'mo') {
			// Special operators
			if ($this.text() == 'lim') string += '\\';
			if ($this.attr('linebreak') == 'newline') string += '\\\\';
			if ($this.text() == '(' || $this.text() == '[' || $this.text() == '{') string += '\\left';
			if ($this.text() == ')' || $this.text() == ']' || $this.text() == '}') string += '\\right';
			if ($this.text() == String.fromCharCode(10216)) {
				string += '\\left';
				$this.text('<');
			}
			if ($this.text() == String.fromCharCode(10217)) {
				string += '\\right';
				$this.text('>');
			}
			if ($this.text() == "|") {
				count = string.match(/\|/g);
				if (count && count.length % 2 == 1) string += '\\right';
				else string += '\\left';
			}
		}
		if (this.tagName == 'mrow' && (tagName == 'msup' || tagName == 'msub' || tagName == 'msubsup')) string += '{';
		if (tagName == 'mtr') {
			if (index != 0) string += '\&';
			string += '{';	
		}
		if (tagName == 'mtable' && index != 0) string += '\\\\';
		if ($this.attr('mathvariant') == 'bold') string += '\\mathbf{';
		if (this.tagName.toLowerCase() == 'mtext') string += '\\text{';
		if (this.tagName.toLowerCase() == 'mspace') string += '\\quad ';
		if (['sin','cos','tan'].indexOf($this.text()) != -1) string += '\\';
		if (tagName == 'mfenced') {
			if (index == 0) string += /*tag.attr('open') || */'(';
			else {
				var s = tag.attr('separators');
				if (s) s = s[Math.min(index,s.length)-1];
				string += s || ',';
			}
		}
		
		if ($this.children().length == 0) string += $this.text();
		else string = processMathML($this,string);
		
		if (this.tagName.toLowerCase() == 'mtext') string += '}';
		if ($this.attr('mathvariant') == 'bold') string += '}';
		if (tagName == 'mfrac' && index == 1) string += '}';
		if (this.tagName == 'mrow' && (tagName == 'msup' || tagName == 'msub' || tagName == 'msubsup')) string += '}';
		if (tagName == 'munderover' && index == 2) string += '}';
		if ((tagName == 'munder' || tagName == 'mover' || tagName == 'mroot') && index == 0) {
			string += '}';
			return false;
		}
		if (tagName == 'mtr') string += '}';
	});
	if (tagName == 'math') {
		string = string.replace(/\u2061/g,'');
		if (tag.attr('display') == 'block') string += '\\]';
		else string += '\\)';
	}
	if (tagName == 'msqrt' || tagName == 'menclose') string += '}';
	if (tagName == 'mtable') string += '\\end{array}';
	if (tagName == 'mfenced') string += tag.attr('close') || ')';
	//string = string.replace(/end{array}\|/g,'end{vmatrix}');
	return string;
}

function insertMathLangButtons(index) {
	var container = $('.OkeeboMath').eq(index);
	container.append('<button type="button" class="OkeeboMathTeX" contenteditable="false">LaTeX</button>');
	container.append('<button type="button" class="OkeeboMathML" contenteditable="false">MathML</button>')
	container.append('<button type="button" class="OkeeboMathDisplay" contenteditable="false">Display</button>');
	
	resizeMathLangButtons(index);
	
	container.children('.OkeeboMathTeX').on('click',function(event) {
		container.children('.OkeeboMathTeX,.OkeeboMathML,.OkeeboMathDisplay').remove();
		if (container.children('script').length > 0) DisplayToCode(index,'tex');
		else MathMLtoTeX(index);
		MathJax.Hub.Queue(function() { insertMathLangButtons(index) });
	});
	container.children('.OkeeboMathML').on('click',function(event) {
		container.children('.OkeeboMathTeX,.OkeeboMathML,.OkeeboMathDisplay').remove();
		if (container.children('script').length > 0) DisplayToCode(index,'mml');
		else TeXtoMathML(index);
		MathJax.Hub.Queue(function() { insertMathLangButtons(index) });
	});
	container.children('.OkeeboMathDisplay').on('click',function(event) {
		container.children('.OkeeboMathTeX,.OkeeboMathML,.OkeeboMathDisplay').remove();
		CodeToDisplay(index);
		MathJax.Hub.Queue(function() { insertMathLangButtons(index) });
	});
}

function resizeMathLangButtons(index) {
	var container = $('.OkeeboMath').eq(index);
	var base = container.closest('.inner,.outer');
	var top = container.offset().top + container.outerHeight() - base.offset().top;
	var left = container.offset().left - base.offset().left;
	var LaTeX = container.children('.OkeeboMathTeX');
	var MathML = container.children('.OkeeboMathML');
	var Display = container.children('.OkeeboMathDisplay');
	LaTeX.css({'top':top,'left':left});
	MathML.css({'top':top,'left':left+LaTeX.outerWidth()});
	Display.css({'top':top,'left':left+LaTeX.outerWidth()+MathML.outerWidth()});
}

function crawl_back() {
	var sel = document.getSelection();
	var node = sel.anchorNode;
	var string = node.textContent.substr(0,sel.anchorOffset);
	if (node instanceof HTMLBRElement) string = '\n' + string;
	if (node instanceof HTMLSpanElement) index = -1;
	else index = 0;
	node = node.previousSibling;
	while (node) {
		if (node instanceof HTMLBRElement) string = '\n' + string;
		else string = node.textContent + string;
		node = node.previousSibling;
		if (index != -1) ++index;
	}
	if (index != -1) {
		if (sel.anchorOffset != 0) index += 2;
		else index += 1;
	}
	return string;
}

function crawl_forward() {
	var sel = document.getSelection();
	var node = sel.focusNode;
	var string = node.textContent.substr(sel.focusOffset);
	node = node.nextSibling;
	while (node) {
		if (node instanceof HTMLBRElement) string += '\n';
		else string += node.textContent; 
		node = node.nextSibling;
	}
	return string;
}

function align(alignment) {
	var sel = document.getSelection();
	var node = sel.anchorNode;
	while (node) {
		if (node instanceof HTMLParagraphElement) {
			var el = $(node);
			if (el.attr('id')) return false;
			if (alignment == 'right') el.removeClass('center').addClass('right-text');
			else if (alignment == 'center') el.removeClass('right-text').addClass('center');
			else el.removeClass('right-text').removeClass('center');
			return true;	
		}
		node = node.parentNode;
	}
	return false;
}

function mathPublish() {
	DisplayToCode();
	MathMLtoTeX();
	$('.OkeeboMath').each(function(index) {
		var $this = $(this);
		var _class = 'center';
		if ($this.parents('p').is('[id]')) _class = '';
		$this.html($this.children('.lang').html()).removeAttr('contenteditable').addClass(_class);
	});
}

function save(role) {
	var text = '';
	var code = new Array();
	var okeeboMath = $('.OkeeboMath').each(function(index) { 
		code.push(DisplayToCode(index)); 
	});
	var $body = $('body').clone();
	okeeboMath.each(function(index) { 
		if (code[index] !== false) CodeToDisplay(index);
		insertMathLangButtons(index) 
	});
	
	$body.find('.OkeeboMath').each(function(index) {
		var $this = $(this);
		MathMLtoTeX($this,1);
		var _class = 'center';
		if ($this.parents('p').is('[id]')) _class = '';
		$this.html($this.children('.lang').html()).removeAttr('contenteditable').addClass(_class);
	});
	
	improve_formatting($body);
	
	$body.find('*').removeAttr('style');
	$body.find('video').replaceWith(function(index) { return $(this).children('object'); });
	$body.find('object').replaceWith(function(index) { return '<span class="youtube-embed">' + this.id + '</span>'; });
	
	$body.find('.handle,.delete').remove();
	$body.find('.inner,.outer').each(function(index) {
		var $this = $(this);
		toggle_edit_one($this);
		$this.children('form.linear').remove();
		
		// Remove excess <br> from titles
		$this.find('h3 br').remove();
		$this.find('p[id] .italic br').remove();
		
		// To work with htmlPurifier
		$this.children('.in,.out').empty();
		$this.find('.tangent').replaceWith(function() { 
			return '<a class="' + $(this).attr('class') + '">' + $(this).text() + '</a>';
		});
		
		if ($this.hasClass('inner')) text += '<div class="' + $this.attr('class') + '">' + $this.html().replace(/\\/g,'\\\\') + '</div>';
		else text += '<div class="' + $this.attr('class') + '" id="Z1">' + $this.html().replace(/\\/g,'\\\\') + '</div>';
	});
	
	if (role == 'autosave') {
		$body.find('#_save').val(text);
		$body.find('#_title').val($('.Z1 h3').text());
		$body.find('#_publish').val('autosave');
		if (window.location.host)
			$.post('https://www.okeebo.com/beta/publish.php',$body.find('form.save').serialize(),function(data) { console.log('Cloud Save at ' + Date()); });
		$body.find('#_publish').val('');
		if (localsave) {
			localStorage.setItem($('.Z1 h3').text(),text);
			console.log('Local Save at ' + Date());
		}
	}
	else if (role == 'compare') {
		if (localStorage.getItem($('.Z1 h3').text()) == text) return true;
		else return false;
	}
	else {
		$('#_save').val(text);
		$('#_title').val($('.Z1 h3').html());
		if (role == 'publish') $('#_publish').val('true');
		$('form.save').submit();
	}
}

setInterval('save("autosave");',60000);

function flocka(event) {
	var button = $(event.target);
	var sidebox = button.parent('.sidebox');
	if (button.html() == '+') {
		sidebox.children('.sum').hide();
		sidebox.children('.full').show();
		button.html('-');
	}
	else {
		sidebox.children('.sum').show();
		sidebox.children('.full').hide();
		button.html('+');
	}
}

function mobile_drag() {
	$('.handle').on('click',function(event) {
		var handle = $(this);
		var parentP = handle.parent('p[id]');
		var outer = parentP.parent('.outer');
		var p_set = outer.children('p[id]');
		var first_p = p_set.first();
		var last_p = p_set.last();
		$('.upp,.dwn').remove();
		if (!parentP.is(first_p)) {
			handle.before('<div class="upp">&uArr;</div>');
			$('.upp').on('click',function(event) {
				var id = parentP.attr('id');
				var letter = id.charAt(0);
				var number = id.substr(1);
				$('.' + letter + (number-1)).before(parentP);
				parentP.before($('.'+id));
				$('.upp,.dwn').remove();
				arrange_links(':visible','a',1);
				repair_links(':visible','a',1);
				update_all_affected_links('a1');
			}).css('top',handle.offset().top-99);//-99
		}
		if (!parentP.is(last_p)) {
			handle.after('<div class="dwn">&dArr;</div>');
			$('.dwn').on('click',function(event) {
				var id = parentP.attr('id');
				var letter = id.charAt(0);
				var number = id.substr(1);
				$('#' + letter + (++number)).after(parentP);
				parentP.before($('.'+id));
				$('.upp,.dwn').remove();
				arrange_links(':visible','a',1);
				repair_links(':visible','a',1);
				update_all_affected_links('a1');
			}).css('top',handle.offset().top-57);//-57
		}
		up_down();
	});
}

function up_down() {
	$(document).one('click',function(event) {
		if ($(event.target).is('.upp,.dwn,.handle')) up_down();
		else $('.upp,.dwn').remove();
	});
}

/*	Theory for collaborative editing:
	- get selection with "sel = document.getSelection();"
	- get range with "range = sel.getRangeAt(0);"
	
	- sender is the computer that just made edit
	- receiver is the computer that is getting the edit applied
	
	- send sender_range to receiver
	- save receiver_range
	- "sel.removeAllRanges();"
	- "sel.addRange(sender_range);"
	- "document.execCommand('insertText',false,sender_text);"
	- "sel.removeAllRanges();"
	- "sel.addRange(receiver_range);"
	
	- look into websockets and long polling
	
	- will need to deconstruct sender_range into components before sending and rebuild on receiver
	
	- Use "rect = range.getBoundingClientRect();" to get coordinates for sender's cursor
	
*/
function partner_cursor(range_data,spkr) {
	//spkr = spkr.split(':')[0];
	var sender_range = deriveRange(range_data);
	var endRange;
	if (sender_range) endRange = sender_range.cloneRange();
	sender_range.collapse(true);
	endRange.collapse(false);
	$('.cursor[title="' + spkr + '"]').remove();
	// change "i < 1" to "i < 2" to also show the end of a range
	for (var i = 0; i < 1; ++i) {
		var rect = sender_range.getBoundingClientRect();
		if (rect.top == 0 && rect.left == 0 && rect.height == 0) {
			try {
				sender_range.setStart(sender_range.startContainer,sender_range.startOffset-1);
				rect = sender_range.getBoundingClientRect();
				rect = { 'left': rect.right, 'top': rect.top, 'height': rect.height };
			}
			catch(e) {
				try {
					sender_range.setEnd(sender_range.startContainer,sender_range.startOffset+1);
					rect = sender_range.getBoundingClientRect();
				}
				catch(e) {
					console.log(e);
				}
			}
		}
		$('body').append('<p class="cursor" title="' + spkr + '"> </p>');
		$('.cursor[title="' + spkr + '"]').eq(i).css({
			'top': rect.top + $(window).scrollTop(),
			'left': rect.left,
			'height': rect.height
		}).on('mousedown',function(event) {
			var $page = $('.inner,.outer').filter(':visible');
			if (range_data.h3) $page.children('h3').focus();
			else if (range_data.span >= 0) $page.children('p[id]').children('span[contenteditable="true"]').eq(range_data.span).focus();
			else node = $page.children('div[contenteditable="true"]').eq(range_data.div || 0).focus();
			var sel = document.getSelection();
			sel.removeAllRanges();
			sel.addRange(sender_range);
			event.preventDefault();
		});
		sender_range = endRange;
	}
	//cursor_show();
}
function cursor_show() {
	$('.cursor').show();
	if (typeof(cursor_timeout)!=='undefined' && cursor_timeout) clearTimeout(cursor_timeout);
	cursor_timeout = setTimeout(cursor_hide,500);	
}
function cursor_hide() {
	$('.cursor').hide();
	if (typeof(cursor_timeout)!=='undefined' && cursor_timeout) clearTimeout(cursor_timeout);
	cursor_timeout = setTimeout(cursor_show,500);	
}
function partner_list(sender_range,list_type) {
	var sel = document.getSelection();
	if (sel.rangeCount) var range = sel.getRangeAt(0);
	sel.removeAllRanges();
	sel.addRange(sender_range);
	ghost = 1;
	$('#' + list_type).click();
	sel.removeAllRanges();
	if (typeof(range) !== 'undefined') sel.addRange(range);
	delete ghost;
}
///// Needs more work.
function partner_format_text(el,sender_range) {
	// Method 1. 10% done and have to esentially rebuild execCommand
	/*var $parent = $(sender_range.startContainer.parentNode).closest(el);
	if ($parent.index() != -1) {
		$parent.replaceWith(function() { return this.innerHTML; });
		console.log(el);
	}
	else sender_range.surroundContents(document.createElement(el));
	var $p = $parent.closest('p')
	if ($p.index() != -1) $p[0].normalize();*/
	
	// Method 2 using execCommand and swapping cursor focus. Issue with undo history.
	var sel = document.getSelection();
	var swap = 0;
	if (sel.rangeCount > 0) {
		var range = sel.getRangeAt(0);
		sel.removeAllRanges();
		swap = 1;
	}
	sel.addRange(sender_range);
	var command = {
		'b': 'bold',
		'i': 'italic',
		'u': 'underline'
	};
	document.execCommand(command[el],false,null);
	$(sel.anchorNode).closest('p')[0].normalize();
	size_buttons($('.inner,.outer').filter(':visible'));
	sel.removeAllRanges();
	if (swap) sel.addRange(range);
}
function partner_insert(sender_range,sender_text,keyup) {
	// Original Idea. Involves swapping cursor focus and using execCommand
	/** /
	var sel = document.getSelection();
	var receiver_range = sel.getRangeAt(0);
	sel.removeAllRanges();
	sel.addRange(sender_range);
	//document.execCommand('insertText',false,sender_text);			// Puts sender text into receiver's undo history. Probably not desirable.
	sender_range
	sel.removeAllRanges();
	sel.addRange(receiver_range);
	/**//**/
	// Idea 2. Inserts a text node at the sender's range.
	var startElement = $(sender_range.startContainer).closest('p,li,h3');
	var endElement = $(sender_range.endContainer).closest('p,li,h3');
	if (startElement.is(endElement) || startElement.length == 0) {
		sender_range.deleteContents();
		sender_range.insertNode(document.createTextNode(sender_text));
		sender_range.startContainer.parentNode.normalize();
	}
	// Handles when text is inserted into a multi-element selection.
	else {
		var sel = document.getSelection();
		// Calculates what the new caret position will be.
		if (sel.rangeCount) {
			var range = sel.getRangeAt(0);
			if ($(range.startContainer).closest('p,li').is(endElement)) {
				
				var displace = range.compareBoundaryPoints(Range.END_TO_START, sender_range);
				var endCompare = range.compareBoundaryPoints(Range.END_TO_END, sender_range);
				//if (displace >= 0) {
						
						var node = sender_range.startContainer;
						var new_node = node;
						var senderMiniDOM = [];
						do {
							node = new_node;
							senderMiniDOM.push($(node.parentNode.childNodes).index(node));
							new_node = node.parentNode;
						} while (!$(node.parentNode).is(startElement));
						senderMiniDOM.reverse();
						
						var node = range.startContainer;
						var new_node = node;
						var startMiniDOM = [];
						do {
							node = new_node;
							startMiniDOM.push($(node.parentNode.childNodes).index(node));
							new_node = node.parentNode;
						} while (!$(node.parentNode).is(endElement));
						startMiniDOM.reverse();
						startMiniDOM[0] += senderMiniDOM[0];
						
						var startOffset = range.startOffset;
						if ($(range.startContainer).is(sender_range.endContainer)) {
							startOffset -= sender_range.endOffset;
						}
						if (startMiniDOM[0] == 0) {
							if (startOffset < 0) startOffset = -1;
							startOffset += sender_range.startOffset + sender_text.length;
						}
						if (startOffset < 0) startOffset = 0;
						
						var node = range.endContainer;
						var new_node = node;
						var endMiniDOM = [];
						do {
							node = new_node;
							endMiniDOM.push($(node.parentNode.childNodes).index(node));
							new_node = node.parentNode;
						} while (!$(node.parentNode).is(endElement));
						endMiniDOM.reverse();
						endMiniDOM[0] += senderMiniDOM[0];
						
						var endOffset = range.endOffset;
						if ($(range.endContainer).is(sender_range.endContainer)) {
							endOffset -= sender_range.endOffset;
						}
						if (endMiniDOM[0] == 0) {
							if (endOffset < 0) endOffset = -1;
							endOffset += sender_range.startOffset + sender_text.length;
						}
						if (endOffset < 0) endOffset = 0;
						
					//}
					//else displace = range.startOffset - sender_range.endOffset;
				//}
				if (displace < 0) {
					sel.removeAllRanges();
					range = sender_range.cloneRange();
					range.collapse(true);
					sel.addRange(range);
				}
			}
		}
		// Apply Changes
		sender_range.deleteContents();
		startElement.append(sender_text);
		var $page = $('.inner,.outer').filter(':visible');
		var elements = $page.find('p,li');
		for (var start = elements.index(startElement), i = start + 1, end = elements.index(endElement); i <= end; ++i) {
			//console.log(elements.eq(i).html(),i);
			startElement.append(elements.eq(i).detach().html());
		}
		sender_range.startContainer.parentNode.normalize();
		if (sel.rangeCount) {
			// Apply Caret Position
			if (typeof(startMiniDOM) === 'undefined') {
				if (displace >= 0) range.setStart(range.startContainer, range.startOffset + displace + sender_text.length);
			}
			else {
				var node = startElement[0];
				for (var i in startMiniDOM) {
					node = node.childNodes[startMiniDOM[i]];
					if (typeof(node) === 'undefined') break;
				}
				if (typeof(node) !== 'undefined' && displace >= 0) {
					range.setStart(node, startOffset);
					sel.removeAllRanges();
					sel.addRange(range);
				}
				
				node = startElement[0];
				for (var i in endMiniDOM) {
					node = node.childNodes[endMiniDOM[i]];
					if (typeof(node) === 'undefined') break;
				}
				if (typeof(node) !== 'undefined' && endCompare >= 0) {
					range.setEnd(node, endOffset);
					sel.removeAllRanges();
					sel.addRange(range);
				}
			}
		}
	}
	if (keyup) $(sender_range.startContainer.parentNode).closest('[contenteditable="true"]').keyup();
	size_linear_buttons($('.inner,.outer').filter(':visible'));
	//partner_cursor(sender_range);*/
}

// This and partner_delete are similar enough that they should probably be combined somehow.
function partner_backspace(sender_range,keyup) {
	var startElement = $(sender_range.startContainer).closest('p,li,h3');
	var endElement = $(sender_range.endContainer).closest('p,li,h3');
	if (startElement.is(endElement) || startElement.length == 0) {
		var node = sender_range.startContainer;
		var $node = $(node);
		if ($node.is(sender_range.endContainer) && sender_range.startOffset == sender_range.endOffset) {
			if (sender_range.startOffset > 0) {
				var index = sender_range.startOffset - 1;
				if ($node.is('p')) {
					node = node.childNodes[index];
					sender_range.setStart(node,node.textContent.length-1);
					sender_range.setEnd(node,node.textContent.length);
					sender_range.deleteContents();
				}
				else {
					if (node.nodeType == 3) {
						sender_range.setStart(node,index);
						sender_range.deleteContents();
					}
					else {
						while (node.textContent.length == 0) node = node.previousSibling;
						while (node.childNodes.length) {
							node = node.childNodes[node.childNodes.length - 1];
							while (node.textContent.length == 0) node = node.previousSibling;
						}
						sender_range.setStart(node, node.textContent.length - 1);
						sender_range.setEnd(node, node.textContent.length);
						sender_range.deleteContents();
					}
				}
			}
			else {
				var range_data = getSenderRange(sender_range);
				var DOM = range_data.miniDOM;
				DOM.shift();
				var test = true;
				for (var i in DOM) {
					if (DOM[i] != 0) {
						test = false;
						break;
					}
				}
				if (test) {
					var $el = $node.closest('p');
					$prev = $el.prev('p');
					$last = $el.children('*').last();
					if ($last.is('br')) $last.remove();
					$last = $prev.children('*').last();
					if ($last.is('br')) $last.remove();
					if ($prev.index() != -1) {
						$prev.append($el.detach().html());
						$prev[0].normalize();
					}
					if ($prev.html() == '') $prev.html('<br>');
				}
				else {
					node = node.previousSibling;
					while (node.textContent.length == 0) node = node.previousSibling;
					while (node.childNodes.length) {
						node = node.childNodes[node.childNodes.length - 1];	
						while (node.textContent.length == 0) node = node.previousSibling;
					}
					sender_range.setStart(node,node.textContent.length-1);
					sender_range.setEnd(node,node.textContent.length);
					sender_range.deleteContents();
				}
			}
		}
		else sender_range.deleteContents();
		if (keyup) $(sender_range.startContainer.parentNode).closest('[contenteditable="true"]').keyup();
	}
	else partner_insert(sender_range, '', keyup);
}

// This and partner_backspace are similar enough that they should probably be combined somehow.
function partner_delete(sender_range,keyup,old_text) {
	var startElement = $(sender_range.startContainer).closest('p,li,h3');
	var endElement = $(sender_range.endContainer).closest('p,li,h3');
	if (startElement.is(endElement) || startElement.length == 0) {
		var node = sender_range.startContainer;
		var $node = $(node);
		if ($node.is(sender_range.endContainer) && sender_range.startOffset == sender_range.endOffset) {
			var index = sender_range.endOffset + 1;
			try {
				if ($node.is('p')) {
					node = node.childNodes[sender_range.endOffset];
					sender_range.setStart(node,0);
					sender_range.setEnd(node,1);
				}
				else {
					if (node.nodeType == 3) {
						sender_range.setEnd(node,index);
					}
					else {
						while (node.textContent.length == 0) node = node.nextSibling;
						while (node.childNodes.length) {
							console.log(node.textContent,node.nodeType);
							node = node.childNodes[0];
							while (node.textContent.length == 0) node = node.nextSibling;
						}
						sender_range.setStart(node,0);
						sender_range.setEnd(node,1);
					}
				}
				if (sender_range.cloneContents().textContent.replace(/\s/g,' ') == old_text.replace(/\s/g,' ')) sender_range.deleteContents();
			}
			catch(e) {
				var range_data = getSenderRange(sender_range);
				var DOM = range_data.miniDOM;
				DOM.shift();
				var test = true;
				if (sender_range.startOffset != sender_range.startContainer.textContent.length) test = false;
				else {
					var testNode = $(node.parentNode).closest('p')[0];
					for (var i in DOM) {
						var testLength = testNode.childNodes.length - 1;
						if (DOM[i] != testLength) {
							test = false;
							break;
						}
						testNode = testNode.childNodes[testLength];
					}
				}
				if (test) {
					var $el = $node.closest('p');
					$next = $el.next('p');
					$last = $el.children('*').last();
					if ($last.is('br')) $last.remove();
					$last = $next.children('*').last();
					if ($last.is('br')) $last.remove();
					if ($next.index() != -1) {
						$next.prepend($el.detach().html());
						$next[0].normalize();
					}
					if ($next.html() == '') $next.html('<br>');
				}
				else {
					if (node.nextSibling) {
						node = node.nextSibling;
						while (node.textContent.length == 0) node = node.nextSibling;
						while (node.childNodes.length) {
							node = node.childNodes[0];	
							while (node.textContent.length == 0) node = node.nextSibling;
						}
						sender_range.setStart(node,0);
						sender_range.setEnd(node,1);
					}
					else {
						if (sender_range.endOffset < node.textContent.length) {
							sender_range.setStart(node,sender_range.endOffset);
							sender_range.setEnd(node,sender_range.endOffset + 1);
						}
						else {
							var finalExceptionNode = $(sender_range.startContainer).closest('b,i,u')[0].nextSibling;
							while (finalExceptionNode.nodeType != 3) finalExceptionNode = finalExceptionNode.childNodes[0];
							sender_range.setStart(finalExceptionNode,0);
							sender_range.setEnd(finalExceptionNode,1);
						}
					}
					if (sender_range.cloneContents().textContent == old_text) sender_range.deleteContents();
				}
			}
		}
		else {
			if (sender_range.cloneContents().textContent == old_text) sender_range.deleteContents();
		}
		if (keyup) $(sender_range.startContainer.parentNode).closest('[contenteditable="true"]').keyup();
	}
	else partner_insert(sender_range, '', keyup);
}
function partner_enter(sender_range,keyup) {
	if (keyup) {
		if (!$(sender_range.startContainer).closest('[contenteditable="true"]').is('p[id] > span:first-child,h3')) {
			sender_range.insertNode(document.createElement('br'));
		}
	}
	else {
		sender_range.deleteContents();
		var element = $(sender_range.startContainer).closest('p,li');
		var tagName = element[0].tagName;
		if (element.is('li') && element.html() == '<br>') {
			element.parent().after('<p><br></p>');
			element.remove();
			return true;	
		}
		var p = document.createElement(tagName);
		/*var el = $(sender_range.startContainer).closest('p,li,b,u,i');
		if (el.is('b,i,u')) el.before(p);
		else */sender_range.insertNode(p);
		var node = p.nextSibling;
		while (node) {
			new_node = node.nextSibling;
			if (!node.textContent == '') $(p).append(node);
			node = new_node;
		}
		if (p.innerHTML == '') p.innerHTML = '<br>';
		var $parent = $(p).parents('p,li');
		if ($parent.index() != -1) {
			$parent.after(p);
			if ($parent.html() == '') $parent.html('<br>');	
		}
	}
}
function partner_insert_page(data,range_data) {
	var $currentPage = $('.inner,.outer').filter(':visible');
	var currentPage_key_index = $currentPage.attr('class').split(' ').indexOf($currentPage.attr('id'));
	if ($currentPage.is(page)) {
		// Possibly add something to get a more accurate value of currentPage_key_index	in this case
	}
	var _top = $(window).scrollTop();
	var sel = document.getSelection();
	var range = false;
	if (sel.rangeCount) range = sel.getRangeAt(0);
	go_to($currentPage.attr('id'),data.pageID);
	var summary = false;
	if (data.summary) {
		summary = $('<p></p>');
		summary.html(data.summary);
	}
	var page = false;
	if (data.page) page = $(data.page);
	if (data.cut && range_data) page = deriveRange(range_data);
	insert_page(summary, page, data.exists, data.reinsert, data.cut, true);
	if (data.cut) improve_formatting();
	go_to(data.pageID,$currentPage.attr('class').split(' ')[currentPage_key_index]);
	sel.removeAllRanges();
	if (range) sel.addRange(range);
	$(window).scrollTop(_top);
}
function partner_delete_page(pageID) {
	var $currentPage = $('.inner,.outer').filter(':visible');
	var currentPage_key_index = $currentPage.attr('class').split(' ').indexOf($currentPage.attr('id'));
	if ($currentPage.is('.' + pageID)) {
		// Possibly add something to get a more accurate value of currentPage_key_index	in this case
	}
	delete_page(pageID,0,1);
	go_to($('.inner,.outer').filter(':visible').attr('id'),$currentPage.attr('class').split(' ')[currentPage_key_index]);
}
function partner_undo_page_delete() {
	var currentID = $('.inner,.outer').filter(':visible').attr('id');
	undo_page_delete(1);
	go_to($('.inner,.outer').filter(':visible').attr('id'),currentID);
}
function partner_rearrange(pageKeys,pIDs,movedID,destination) {
	if (movedID) {
		var $moved = $('#' + movedID);
		
		// toggle drag and consistent cursor position
		var sel = document.getSelection();
		var range = sel.rangeCount && sel.getRangeAt(0);
		var $pageWithMoved = $moved.parents('.outer');
		var temp_drag = 0;
		var range_swap = 0;
		if ($pageWithMoved.is(':visible')) {
			range_swap = 1;
			range = getSenderRange();
		}
		if ($pageWithMoved.has('[contenteditable="true"]')) {
			temp_drag = 1;
			toggle_drag($pageWithMoved);	
		}
		
		var $dest = $('#' + movedID).parent().children('p');
		if (destination == -1) {
			$dest = $dest.eq(0);
			$dest.before($moved);
		}
		else {
			$dest = $dest.eq(destination);
			$dest.after($moved);
		}
		$moved.before($('.' + movedID));
		$dest.before($('.' + $dest.attr('id')));
	}
	else {
		var checkbox = $('.' + destination).find('.linear input');
		checkbox.prop('checked',!checkbox.prop('checked'));
	}
	var $pages = $('.inner,.outer');
	if (pageKeys) {
		$pages.each(function(i) {
			var $this = $(this);
			var spot = $this.attr('class').split(' ').indexOf(this.id);
			$this.attr('class',pageKeys[i]);
			if (this.id) this.id = pageKeys[i].split(' ')[spot];
		});
		$('.in').each(function(i) {
			$(this).attr('class','in ' + pIDs[i]);
		});
		$('.in + p[id]').each(function(i) {
			this.id = pIDs[i];
		});
	}
	else {
		arrange_links($('.Z1').children(),'a',1);
		repair_links($('.Z1').children(),'a',1);
		update_all_affected_links('a1');
	}
	if (temp_drag) toggle_drag($pageWithMoved);
	
	redraw_node_map($pages.filter(':visible').attr('id'));
	
	// consistent cursor position
	if (range) {
		if (range_swap) {
			var index = 0;
			if (range.div) index = range.div;
			// handles 1 div to 2 div. need to make more robust.
			if (destination < range.miniDOM[0]) {
				++index;
				range.miniDOM[0] -= destination + 1;	
				console.log(destination,range.miniDOM[0]);
			}
			range = deriveRange(range,index);
			$pages.filter(':visible').children('div[contenteditable]').eq(index).focus();
			sel = document.getSelection();
			sel.removeAllRanges();	
		}
		sel.addRange(range);
	}
}

function ghost_type() {
	$(document).on('keydown',function(event) {
		//sender_range = deriveRange(getSenderRange());
		partner_insert(sender_range,String.fromCharCode(event.which));
	});
}

function getSenderRange(range) {
	if (!range) {
		var sel = document.getSelection();	
		if (sel.rangeCount < 1) return false;
		var range = sel.getRangeAt(0);
	}
	range.startContainer.parentNode.normalize();
	var senderRange = {};
	var $page = $('.inner,.outer').filter(':visible');
	var pageID = $page.attr('id');
	var miniDOM = [];
	var node = range.startContainer;
	while (node && !$(node).is('[contenteditable="true"]') && $(node).closest('[contenteditable="true"]').index() != -1) {
		miniDOM.push($(node.parentNode.childNodes).index(node));
		node = node.parentNode;
	}
	var index = $page.children('div[contenteditable]').index(node);
	if (index > 0) senderRange.div = index;
	else if (index < 0) {
		index = $page.find('p[id] > span').index(node);
		if (index != -1) {
			senderRange.span = index;
		}
		else senderRange.h3 = 1;
	}
	miniDOM.reverse();
	senderRange.pageID = pageID;
	senderRange.miniDOM = miniDOM;
	senderRange.spot = range.startOffset;
	senderRange.size = range.startContainer.textContent.length;
	senderRange.others = node.childNodes.length;
	
	// Code for Selections
	if (range.startContainer != range.endContainer) {
		miniDOM = [];
		node = range.endContainer;
		while (node && !$(node).is('[contenteditable="true"]')) {
			miniDOM.push($(node.parentNode.childNodes).index(node));
			node = node.parentNode;
		}
		miniDOM.reverse();	
		senderRange.endDOM = miniDOM;
		senderRange.end = range.endOffset;
	}
	else if (range.startOffset != range.endOffset) senderRange.end = range.endOffset;
	//
	
	if (range.startContainer.nodeType != 3) {
		var spot = senderRange.spot;
		var node = range.startContainer.childNodes[spot];
		while (node && node.nodeType != 3 && spot > 0) node = range.startContainer.childNodes[--spot];
		senderRange.special = (node && node.textContent.length) || true;
	}
	
	return senderRange;
}

function deriveRange(senderRange,div) {
	if (!div) {
		if (senderRange.div) div = senderRange.div;
		else div = 0;
	}
	var range = document.createRange();
	var node;
	if (senderRange.h3) node = $('.' + senderRange.pageID + ' h3')[0];
	else if (senderRange.span >= 0) node = $('.' + senderRange.pageID + ' > p[id] > span')[senderRange.span];
	else node = $('.' + senderRange.pageID + ' div[contenteditable]')[div];
	var DOM = senderRange.miniDOM;
	for (var i in DOM) {
		node = node.childNodes[DOM[i]];
	}
	if ($(node).is('p')) {
		$(document).one('keyup keydown',function(event) {
			var sel = document.getSelection();
			if (sel.rangeCount) {
				var range = sel.getRangeAt(0);
				var node = range.startContainer;
				if ($(node).is('p')) node.normalize();
				else node.parentNode.normalize();
			}
		});
	}
	range.setStart(node,senderRange.spot);
	range.collapse(true);
	if (senderRange.end) {
		if (senderRange.endDOM) {
			if (senderRange.h3) node = $('.' + senderRange.pageID + ' h3')[0];
			else if (senderRange.span >= 0) node = $('.' + senderRange.pageID + ' p[id]')[senderRange.span];
			else node = $('.' + senderRange.pageID + ' div[contenteditable]')[div];
			DOM = senderRange.endDOM;
			for (var i in DOM) node = node.childNodes[DOM[i]];
			if ($(node).is('p')) {
				$(document).one('keyup keydown',function(event) {
					var sel = document.getSelection();
					var range = sel.getRangeAt(0);
					var node = range.endContainer;
					if ($(node).is('p')) node.normalize();
					else node.parentNode.normalize();
				});
			}
		}
		range.setEnd(node,senderRange.end);
	}
	return range;
}

//// How important is it for sender_range.size and sender_range.others to be accurate here? ////
function partner_conjugate(msg) {
	var data = JSON.parse(msg);
	switch (data[0]) {
		case 'list':
			break;
		case 'compare_ranges':
			break;
		case 'keydown':
			var text = data[1];
			var sender_range = data[2];
			if (data[3]) {
				sender_range.size += text.length - data[3].length;
				sender_range.end = sender_range.spot + text.length;
				delete sender_range.endDOM;
				var conjugate_msg = '["keydown","' + data[3] + '",' + JSON.stringify(sender_range) + ',"' + text + '"]';
			}
			else {
				if (text.length == 1) {
					sender_range.spot += 1;
					sender_range.size += 1;
				}
				else {
					sender_range.size += text.length;
					sender_range.end = sender_range.spot + text.length;
				}
				var conjugate_msg = '["backspace",' + JSON.stringify(sender_range) + ',"' + text + '"]';
			}
			break;
		case 'backspace':
			var text = data[2];
			var sender_range = data[1];
			if (text) {
				if (text.length == 1) sender_range.spot -= 1;
				else delete sender_range.end;
				if (sender_range.spot < 0) sender_range.spot = 0;
				sender_range.size -= text.length;
				var conjugate_msg = '["keydown","' + text + '",' + JSON.stringify(sender_range) + ']';
			}
			else if (sender_range.miniDOM[0] > 0) {
				sender_range.miniDOM[0] -= 1;
				var range = deriveRange(sender_range);
				var node = $(range.startContainer).closest('p')[0];
				var i = 0;
				while (node.childNodes.length > 0) {
					sender_range.miniDOM[++i] = node.childNodes.length - 1;
					node = node.childNodes[node.childNodes.length - 1];
				}
				var newSize = node.textContent.length;
				sender_range.spot = newSize - sender_range.size;
				sender_range.size = newSize;
				sender_range.others -= 1;
				var conjugate_msg = '["enter",' + JSON. stringify(sender_range) + ']';
			}
			else conjugate_msg = msg;
			break;
		case 'delete':
			var text = data[2];
			var sender_range = data[1];
			if (text) {
				sender_range.size -= text.length;
				if (text.length != 1) delete sender_range.end;
				var conjugate_msg = '["keydown","' + text + '",' + JSON.stringify(sender_range) + ']';
			}
			else if (sender_range.miniDOM[0] < sender_range.others - 1) {
				var range = deriveRange(sender_range);
				sender_range.size = range.startContainer.textContent.length;
				sender_range.others -= 1;
				var conjugate_msg = '["enter",' + JSON. stringify(sender_range) + ']';
			}
			else conjugate_msg = msg;
			break;
		case 'enter':
			var sender_range = data[1];
			sender_range.miniDOM[0] += 1;
			for (var i=1, l = sender_range.miniDOM.length; i<l; ++i) sender_range.miniDOM[i] = 0;
			sender_range.size -= sender_range.spot;
			sender_range.spot = 0;
			sender_range.others += 1;
			var conjugate_msg = '["backspace",' + JSON.stringify(sender_range) + ',""]';
			break;			
		case 'format_text':
			var sender_range = data[2];
			var sel = document.getSelection().toString();
			if (sender_range.endDOM) {
				delete sender_range.endDOM;
				sender_range.end = sender_range.spot + sel.length;
				console.log(sender_range.toSource());
				var range = deriveRange(sender_range);
				sender_range.size = range.startContainer.textContent.length;
			}
			else {
				sender_range.size = sender_range.spot;
				sender_range.endDOM = [];
				for (var i in sender_range.miniDOM) sender_range.endDOM[i] = sender_range.miniDOM[i];
				sender_range.endDOM[1] += 1;
				sender_range.endDOM[2] = 0;
				sender_range.end = sel.length	
			}
			var conjugate_msg = '["format_text","' + data[1] + '",' + JSON.stringify(sender_range) + ']';
			break;
		case 'rearrange':
			var conjugate_msg = JSON.stringify([data[0],data[5],data[2],data[3],data[4],data[1]]);
			break;
		case 'insert_page':
			var sender_range = data[1];
			var link_to_page_to_delete = $('.' + sender_range.pageID).children('.in + p[id]').last().attr('id');
			var letter = String.fromCharCode(link_to_page_to_delete.charCodeAt(0) + 1);
			var number = link_to_page_to_delete.substr(1);
			var conjugate_msg = '["delete_page","' + letter + number + '"]';
			break;
		// case 'delete_edge':		// Add this above too
		case 'delete_page':
			var conjugate_msg = '["undo_page_delete","' + data[1] + '"]';
			break;
		case 'undo_page_delete':
			var conjugate_msg = '["delete_page","' + data[1] + '"]';
			break;
		case 'none':
			var conjugate_msg = msg;
	}
	collab_execute(conjugate_msg);
	return conjugate_msg;
}

function compare_ranges(rangeA,rangeB,ghost) {
	var range0 = deriveRange(rangeA);
	var range1 = deriveRange(rangeB);
	var dif = [ range1.compareBoundaryPoints(Range.START_TO_START,range0),range1.compareBoundaryPoints(Range.END_TO_END,range0) ];
	if (dif.indexOf(-1) != -1) {
		console.log('undo typing');
		// The undo action was an undoing of inserting text. In order to mirror, we have to delete text.
		// Figure out what this text is on receiver.
		if (ghost) {
			var range = document.createRange();
			range.setStart(range1.startContainer,range1.startOffset);
			range.setEnd(range0.endContainer,range0.endOffset);
			partner_insert(range, '');
		}
		else {
			msg = '["compare_ranges",' + JSON.stringify(rangeA) + ',' + JSON.stringify(rangeB) + ']';
			collab_send(msg);
		}
	}
	if (dif.indexOf(1) != -1) {
		console.log('undo backspace');
		// The undo action was an undoing of backspacing. In order to mirror, we have to reinsert deleted text.
		// Figure out what this text is on sender.
		if (range1.startOffset != range1.endOffset) {
			var contents = range1.cloneContents();
		}
		else {
			var range = document.createRange();
			range.setStart(range0.startContainer,range0.startOffset);
			range.setEnd(range1.endContainer,range1.endOffset);
			var contents = range.cloneContents();
		}
		var text = contents.textContent;
		var sel = document.getSelection();
		var old_range = sel.getRangeAt(0);
		if (typeof(range) === 'undefined') range = old_range.cloneRange();
		range.collapse(true);
		sel.removeAllRanges();
		sel.addRange(range);
		var sender_range = JSON.stringify(getSenderRange());
		sel.removeAllRanges();
		sel.addRange(old_range);
		if (contents.childNodes.length > 1) {
			for (var i = 0, l = contents.childNodes.length; i < l; ++i) {
				var msg = '["keydown","' + contents.childNodes[l-i-1].textContent + '",' + sender_range + ']';
				collab_send(msg);
				if (i != l - 1) {
					var msg = '["enter",' + sender_range + ']';
					collab_send(msg);
				}
			}
		}
		else {
			var msg = '["keydown","' + text + '",' + sender_range + ']';
			if (text == '') msg = '["enter",' + sender_range + ']';
			collab_send(msg);
		}
	}
	if (dif[0] == 0 && dif[1] == 0) {
		console.log('Number of Other Elements: ',rangeA.others,rangeB.others);
		console.log('Size of Container: ',rangeA.size,rangeB.size);
		if (rangeA.others < rangeB.others) {
			// Most likely an undo of a "paragraph merging" delete. Need to check if anything else fits this heuristic.
			var sender_range = JSON.stringify(getSenderRange());
			var msg = '["enter",' + sender_range + ']';
			collab_send(msg);
		}
		else if (rangeA.others > rangeB.others) {
			// Most likely a redo of a "paragaph merging" delete. Need to check if anything else fits this heuristic.
			var sender_range = JSON.stringify(getSenderRange());
			var msg = '["delete",' + sender_range + ']';
			collab_send(msg);
		}
		else if (rangeA.size < rangeB.size) {
			// Most likely an undo of a regular delete. Need to check if anything else fits this heuristic.
			var dif = rangeB.size - rangeA.size;
			var sel = document.getSelection();
			var old_range = sel.getRangeAt(0);
			var range = old_range.cloneRange();
			range.setEnd(range.endContainer, range.endOffset + dif);
			text = range.cloneContents().textContent;
			var sender_range = JSON.stringify(getSenderRange());
			var msg = '["keydown","' + text + '",' + sender_range + ']';
			collab_send(msg);	
		}
		else if (rangeA.size > rangeB.size) {
			// Most likely a redo of a regular delete. Need to check if anything else fits this heuristic.
			var dif = rangeA.size - rangeB.size;
			var sender_range = getSenderRange();
			sender_range.end = sender_range.spot + dif;
			sender_range = JSON.stringify(sender_range);
			var msg = '["delete",' + sender_range + ']';
			collab_send(msg);
		}
	}
}

function collab_updates() {
	if (collab_timer != 0) {
		clearTimeout(collab_timer);
		collab_timer = 0;
	}
	var ajax_data = 'book=' + $('.Z1 h3').html() + '&line=' + line;
	$.ajax({url:'https://www.okeebo.com/test/collab/update.php',
			dataType:'json',
			type:'GET',
			data:ajax_data,
			success:function(result) {
				var row = result.msg.split('\n');
				for (var i=0; row[i]; ++i) {
					var val = JSON.parse(row[i]);
					if (val.spkr != nick || line == 0) {
						collab_dispatch(val);
					}
				}
				line = result.line;
				collab_updates();
			},
			error:function() {
				console.log('Timeout. Reconnecting in 5 seconds.');
				collab_timer = setTimeout('collab_updates()',5000);
			}
	});
}

function getBetterRange(range_data,mode) {
	var sender_range = $.extend(true, {}, range_data);
	var spot = sender_range.spot;
	var range = deriveRange(sender_range);
	var node = range.startContainer.childNodes[spot];
	while (node.nodeType != 3 && spot > 0) node = range.startContainer.childNodes[--spot];
	if (spot != sender_range.spot) {
		spot = sender_range.special;
	}
	else {
		spot = 0;
	}
	range.setStart(node,spot);
	if (!sender_range.end) range.collapse(true);
	return getSenderRange(range);
}

// The goal of this function is to correct concurrency issue when multiple users edit the same paragraph. It needs some work still.
cursor_test = { order: {}, spot: null };
function fix_collab(val) {
	var main_data = JSON.parse(val.msg);
	if (main_data[0] == 'keydown') sender_range = main_data[2];
	else sender_range = main_data[1];
	
	if (sender_range.special) sender_range = getBetterRange(sender_range);
	
	var instructions = [];
	
	for (var spkr in collab) {
		for (var j = collab[spkr][0]; j > (val.order[spkr] || -1); --j) {
			var data = collab[spkr][1][j];
			var instruct = [data[0],data[1],data[2],spkr,j];
			data = JSON.parse(data[0]);
			if (data[0] != 'cursor') {
				instructions.push(instruct);
			}
		}
	}
	
	if (typeof(instructions) !== 'undefined' && instructions.length != 0) {
		// Sort based on timestamps
		instructions.sort(function(a,b) { return a[2] - b[2] || a[1] - b[1]; });
		var dif = 0;
		
		outerloop:		// this is a label name
		for (var j = 0, l = instructions.length; j < l; ++j) {
			var msg = instructions[j][0];
			var data = JSON.parse(msg);
			if (data[0] == 'keydown') {
				var range_data = data[2];
				if (!$('.' + sender_range.pageID).hasClass(range_data.pageID) || main_data[0] == 'insert_page') continue;
				if (range_data.special) range_data = getBetterRange(range_data);
				if (range_data.miniDOM.length != sender_range.miniDOM.length) continue;
				for (var i in range_data.miniDOM) if (range_data.miniDOM[i] != sender_range.miniDOM[i]) continue outerloop;
				if (range_data.spot <= sender_range.spot + dif) {
					
					// Special Case for Cursor in the Same Spot //
					if (sender_range.spot == cursor_test.spot) {
						var test = true;
						for (var p in val.order) {
							if (p == val.spkr) continue;
							if (val.order[p] != cursor_test.order[p]) {
								test = false;
								cursor_test = { order: {}, spot: null };
								continue;	
							}
						}
						if (test) {
							if (typeof(main_data[1]) === 'string') cursor_test.spot = sender_range.spot + main_data[1].length;
							continue;
						}
					}
					else if (val.time < instructions[j][1] && range_data.spot == sender_range.spot + dif) {
						for (var p in val.order) cursor_test.order[p] = val.order[p];
						cursor_test.spot = sender_range.spot + main_data[1].length;
						continue;
					}
					// end //
					
					if (range_data.end) dif -= range_data.end - range_data.spot;
					dif += data[1].length;
				}
				else if (range_data.spot > sender_range.spot) {
					if (typeof(main_data[1]) === 'string') range_data.spot += main_data[1].length;
					data[2] = range_data;
					collab[instructions[j][3]][1][instructions[j][4]][0] = JSON.stringify(data);
					collab[instructions[j][3]][1][instructions[j][4]][2] = 
						Math.max( collab[instructions[j][3]][1][instructions[j][4]][2] , collab[val.spkr][1][val.order[val.spkr]][2] + 1 );
				}
			}
			else {
				var range_data = data[1];
				if (data[0] == 'delete' || data[0] == 'backspace') {
					if (!$('.' + sender_range.pageID).hasClass(range_data.pageID)) continue;
					if (range_data.miniDOM.length != sender_range.miniDOM.length) continue;
					for (var i in range_data.miniDOM) if (range_data.miniDOM[i] != sender_range.miniDOM[i]) continue outerloop;
					if (range_data.spot <= sender_range.spot + dif) {
						if (range_data.end) dif -= range_data.end - range_data.spot;
						else dif -= 1;
					}
					else {
						if (typeof(main_data[1]) === 'string') range_data.spot += main_data[1].length;
						data[2] = range_data;
						collab[instructions[j][3]][1][instructions[j][4]][0] = JSON.stringify(data);	
					}
				}
				else if (data[0] == 'enter') {
					if (!$('.' + sender_range.pageID).hasClass(range_data.pageID)) continue;
					var test = true;
					var l1 = range_data.miniDOM.length, l2 = sender_range.miniDOM.length;
					if (l1 != l2) test = false;
					for (var i=0; i < l1 && i < l2; ++i) {
						if (range_data.miniDOM[i] > sender_range.miniDOM[i]) continue outerloop;
						else if (range_data.miniDOM[i] != sender_range.miniDOM[i]) test = false;
					}
					if (test) dif -= range_data.spot;
					sender_range.miniDOM[0] += 1;	
				}
				else if (data[0] == 'rearrange') {
					if (main_data[0] == 'rearrange' || main_data[0] == 'none') {
						if (val.order[instructions[j][3]] || instructions[j][3] != val.spkr) {
							if (val.time < instructions[j][1]) {
								partner_conjugate(instructions[j][0]);
								instructions[j][0] = '["none"]';	
							}
							else main_data[0] = 'none';
						}
					}
					// update page id
					var pageKeys = data[1];
					var old_pageKeys = data[5];
					var index_alpha = -1;
					var index_beta = -1;
					var old_page_id = sender_range.pageID || sender_range;
					for (var alpha=0; alpha < old_pageKeys.length; ++alpha) {
						var keys = old_pageKeys[alpha].split(' ');
						index_beta = keys.indexOf(old_page_id);
						if (index_beta != -1) {
							index_alpha = alpha;
							break;	
						}
					}
					if (index_alpha != -1 && index_beta != -1) {
						var new_page_id = pageKeys[index_alpha].split(' ')[index_beta];
						sender_range.pageID = new_page_id;
						if (main_data[0] == 'delete_page') {
							sender_range = new_page_id;
						}
					}
					if (main_data[0] == 'insert_page') {
						if (sender_range.page) {
							var old_page = sender_range.page.substr(1);
						}
						else continue;
						for (var alpha=0; alpha < old_pageKeys.length; ++alpha) {
							var keys = old_pageKeys[alpha].split(' ');
							index_beta = keys.indexOf(old_page);
							if (index_beta != -1) {
								index_alpha = alpha;
								break;	
							}
						}
						if (index_alpha != -1 && index_beta != -1) {
							var new_page = pageKeys[index_alpha].split(' ')[index_beta];
							sender_range.page = '.' + new_page;
						}
					}
				}
				else if (data[0] == 'insert_page') {
					
					if (instructions[j][3] == val.spkr) continue;
					var compare = sender_range.pageID || sender_range;
					if (main_data[0] == 'rearrange') {
						compare = String.fromCharCode(main_data[3].charCodeAt(0) + 1) + main_data[3].substr(1);
					}
					var page = range_data.last;
					if (!page) continue;
					page = $('.' + String.fromCharCode(page.charCodeAt(0) + 1) + page.substr(1));
					var keys = page.attr('class').split(' ');
					if (keys.shift() == 'outer') keys.shift();
					var main_letter = compare.charAt(0);
					var main_number = parseInt(compare.substr(1),10);
					var times = 0;
					for (var i=0; i < keys.length; ++i) {
						var key_letter = keys[i].charAt(0);
						var key_num = parseInt(keys[i].substr(1),10);
						if (key_letter == main_letter) {
							if (key_num < main_number) ++times;
							else if (key_num == main_number) return '["none"]';
						}
					}
					main_number += times;
					sender_range.pageID = main_letter + main_number;
					
					if (main_data[0] == 'rearrange') {
						main_data[3] = String.fromCharCode(main_letter.charCodeAt(0) - 1) + main_number;
						// Optimization tip: Look at code from 2/18/14 and earlier for ways to alter sender_range rather than relying on recalculating.
						sender_range = false;
					}
					
					else if (main_data[0] == 'insert_page') {
						if (sender_range.page) {
							compare = sender_range.page.substr(1);
						}
						else continue;
						var main_letter = compare.charAt(0);
						var main_number = parseInt(compare.substr(1),10);
						var times = 0;
						for (var i=0; i < keys.length; ++i) {
							var key_letter = keys[i].charAt(0);
							var key_num = parseInt(keys[i].substr(1),10);
							if (key_letter == main_letter) {
								if (key_num < main_number) ++times;
								else if (key_num == main_number) return '["none"]';
							}
						}
						main_number += times;
						sender_range.page = '.' + main_letter + main_number;
					}
					
					else if (main_data[0] == 'delete_page') {
						sender_range = main_letter + main_number;
					}
				}
				else if (data[0] == 'delete_page') {
					if (instructions[j][3] == val.spkr) continue;
					var compare = sender_range.pageID || sender_range;
					if (main_data[0] == 'rearrange') {
						compare = String.fromCharCode(main_data[3].charCodeAt(0) + 1) + main_data[3].substr(1);
					}
					var page = _delete[_delete.length-1];
					if (!page) continue;
					page = page.page;
					var keys = page.attr('class').split(' ');
					if (keys.shift() == 'outer') keys.shift();
					var main_letter = compare.charAt(0);
					var main_number = parseInt(compare.substr(1),10);
					var times = 0;
					for (var i=0; i < keys.length; ++i) {
						var key_letter = keys[i].charAt(0);
						var key_num = parseInt(keys[i].substr(1),10);
						if (key_letter == main_letter) {
							if (key_num < main_number) ++times;
							else if (key_num == main_number) return '["none"]';
						}
					}
					main_number -= times;
					sender_range.pageID = main_letter + main_number;
					
					if (main_data[0] == 'rearrange') {
						main_data[3] = String.fromCharCode(main_letter.charCodeAt(0) - 1) + main_number;
						
						sender_range = false;	
					}
					else if (main_data[0] == 'insert_page') {
						if (sender_range.page) {
							compare = sender_range.page.substr(1);
						}
						else continue;
						var main_letter = compare.charAt(0);
						var main_number = parseInt(compare.substr(1),10);
						var times = 0;
						for (var i=0; i < keys.length; ++i) {
							var key_letter = keys[i].charAt(0);
							var key_num = parseInt(keys[i].substr(1),10);
							if (key_letter == main_letter) {
								if (key_num < main_number) ++times;
								else if (key_num == main_number) return '["none"]';
							}
						}
						main_number -= times;
						sender_range.page = '.' + main_letter + main_number;
					}
					else if (main_data[0] == 'delete_page') {
						sender_range = main_letter + main_number;
					}
				}
			}
		}
		sender_range.spot += dif;
		if (sender_range.end) sender_range.end += dif;
		if (main_data[0] == 'keydown') main_data[2] = sender_range;
		else main_data[1] = sender_range;
	}
	return JSON.stringify(main_data);
}

function collab_send(msg) {
	if (typeof(window.nick) === 'undefined') {
		if (window.top.frames[0] == window.self)
			var nick = 'ben@okeebo.com';
		else if (window.top.frames[1] == window.self)
			var nick = 'peder541@umn.edu';
		else if (window.top.frames[2] == window.self)
			var nick = '8bpedersen@gmail.com';
		else if (window.top.frames[3] == window.self)
			var nick = 'ben.j.pedersen@facebook.com';
		else {
			var frames = window.top.frames;
			for (var i = 4; i < frames.length; i++) { 
				if (window.self == frames[i]) {
					var nick = 'greg' + i + '@yahoo.com';
				}
			}
		}
	}
	else nick = window.nick;
	var order = 0;
	var t = new Date();
	t = t.valueOf();
	if (collab[nick]) {
		order = collab[nick][0] + 1;
		collab[nick][0] = order;
		collab[nick][1][order] = [msg,t,t];
	}
	else {
		collab[nick] = [order, {0: [msg,t,t]}];
	}
	order = {};
	for (var i in collab) order[i] = collab[i][0];
	var val = {spkr: nick, msg: msg, order: order, time: t};
	
	if (typeof(window.nick) !== 'undefined') {
		var ajax_data = 'val=' + encodeURIComponent(JSON.stringify(val));
		var url = 'https://www.okeebo.com/test/collab/?book=' + $('.Z1 h3').html();
		$.post(url,ajax_data);
	}
	else {
		window.parent.postMessage(JSON.stringify(val),'*');
	}
}

function collab_dispatch(val) {	
	var order = 0;
	if (collab[val.spkr]) order = collab[val.spkr][0] + 1;
	else collab[val.spkr] = [order, {}];
	var t = new Date();
	t = t.valueOf();
	collab[val.spkr][1][val.order[val.spkr]] = [val.msg,val.time,t,val.order];
	if (order == val.order[val.spkr]) {
		// Do the current task
		var msg = JSON.parse(val.msg);
		if (msg[0] == 'cursor') msg.push(val.spkr);
		
		val.msg = JSON.stringify(msg);
		
		collab[val.spkr][0] = order;
		
		msg = fix_collab(val);					// Apply fix before posting
		
		collab[val.spkr][1][order][0] = msg;	// Update with fixed message to keep synch for 3+ users
		collab_execute(msg);
		
		// Do any directly following tasks that may be queued
		while (collab[val.spkr][1][++order]) {
			var t = new Date();
			t = t.valueOf();
			collab[val.spkr][1][order][2] = t;
			var msg = JSON.parse(collab[val.spkr][1][order][0]);
			if (msg[0] == 'cursor') msg.push(val.spkr);
			msg = JSON.stringify(msg);
			
			val.msg = msg;								// Need to update the val object before its passed to fix_collab
			val.time = collab[val.spkr][1][order][1];
			val.order = collab[val.spkr][1][order][3];
			
			collab[val.spkr][0] = order;
			
			msg = fix_collab(val);						// Apply fix before posting
			
			collab[val.spkr][1][order][0] = msg;		// Update with fixed message to keep synch for 3+ users
			collab_execute(msg);
		}
	}
}

function collab_execute(msg) {
	try {
		var data = JSON.parse(msg.replace(/\n/g,''));
	}
	catch(e) {
		console.log(e.toString(),msg);	
	}
	if (window.self !== window.top && data[0] != 'cursor') {
		if (window.self == window.frames[0]) console.log('0:',msg);
		else console.log('1:',msg);
	}
	if ($('svg').is(':visible')) {
		var _graph = 1;
		toggle_graph();
	}
	if (data[0] == 'list') {
		var sender_range = deriveRange(data[1]);
		var list_type = data[2];
		partner_list(sender_range,list_type);	
	}
	else if (data[0] == 'compare_ranges') {
		compare_ranges(data[1],data[2],true);	
	}
	else if (data[0] == 'keydown') {
		var sender_range = deriveRange(data[2]);
		var sender_text = data[1];
		var keyup = data[2].span >= 0 || data[2].h3;
		partner_insert(sender_range,sender_text,keyup);
	}
	else if (data[0] == 'backspace') {
		var sender_range = deriveRange(data[1]);
		var keyup = data[1].span >= 0 || data[1].h3;
		partner_backspace(sender_range,keyup);
		$('body').find('b,i,u').filter(function() { return !this.innerHTML || this.innerHTML == ''; }).remove();
	}
	else if (data[0] == 'delete') {
		var sender_range = deriveRange(data[1]);
		var keyup = data[1].span >= 0 || data[1].h3;
		partner_delete(sender_range,keyup,data[2]);
		$('body').find('b,i,u').filter(function() { return !this.innerHTML || this.innerHTML == ''; }).remove();
	}
	else if (data[0] == 'enter') {
		var sender_range = deriveRange(data[1]);
		var keyup = data[1].span >= 0 || data[1].h3;
		partner_enter(sender_range,keyup);	
	}
	else if (data[0] == 'cursor') {
		//var sender_range = deriveRange(data[1]);
		if ($('.'+data[1].pageID).is(':visible') && (typeof(_graph) === 'undefined' || !_graph)) partner_cursor(data[1],data[2]);
		else $('.cursor').remove();
	}
	else if (data[0] == 'insert_page') {
		partner_insert_page(data[1],data[2]);
	}
	else if (data[0] == 'delete_page') {
		partner_delete_page(data[1]);	
	}
	else if (data[0] == 'undo_page_delete') {
		partner_undo_page_delete();
	}
	else if (data[0] == 'rearrange') {
		partner_rearrange(data[1],data[2],data[3],data[4]);	
	}
	else if (data[0] == 'format_text') {
		partner_format_text(data[1],deriveRange(data[2]));	
	}
	if (data[0] != 'cursor') {
		var sender_range = JSON.stringify(getSenderRange());
		if (sender_range != 'false') {
			var msg = '["cursor",' + sender_range + ']';
			collab_send(msg);
		}
	}
	if (typeof(_graph) !== 'undefined' && _graph) {
		toggle_graph(1);
		/*if (data[0] == 'cursor') {
			// depict which page/node the other person is modifying
			var circle = d3.selectAll('circle');
			circle.classed('cursor',false);
			circle.filter(function(d,i) { return 1+d.indexOf(data[1].pageID); }).classed('cursor',true);
		}*/
	}
}

function resize_cursor() {
	$('.cursor').each(function() {
		var $this = $(this);
		var spkr = $this.attr('title');
		var index = collab[spkr][0];
		var msg = collab[spkr][1][index][0];
		var data = JSON.parse(msg);
		while (data[0] != 'cursor' && index > 0) {
			msg = collab[spkr][1][--index][0];
			data = JSON.parse(msg);
		}
		if (data[0] == 'cursor') partner_cursor(data[1],spkr);
		else $this.remove();
	});
}
