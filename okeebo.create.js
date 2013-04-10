/* 
 * Okeebo Content Creation JavaScript
 * author: Ben Pedersen
 *
 */

var _drag = 0, _edit = 0;
var arrange_timer, scroll_timer;
var _delete = new Array();

function resize_writing_items() {
	$('button').not('.in,.out,.tangent,.preview_main,.preview_exit').css('margin-left',$('.inner').css('margin-left'));
	$('#bold,#italic,#underline,#ul,#ol').css('left',$('.inner,.outer').outerWidth()-29);
	//modify_arrange_buttons();
}

$(document).ready(function(event) {
	
	var _fadeIn = $.fn.fadeIn;
	var _show = $.fn.show;

	$.fn.fadeIn = function(){
    	_fadeIn.apply(this,arguments).trigger("fadeIn");
	};
	$.fn.show = function(){
    	_show.apply(this,arguments).trigger("show");
	};
	
	resize_writing_items();
	
	if (badIE) {
		$('#edit').width(38);
		$('#drag').width(43);
		$('#save').width(42);
	}
	
	$('.outer.inner').each(function(index) {
		$(this).append('<form class="linear"><input type="checkbox" name="linear" value="Allow">Allow Linear Reading</form>');
		var last_id = $(this).children('p[id]').last().attr('id');
		if (last_id) {
			var last_letter = last_id.charAt(0);
			var last_number = parseInt(last_id.substring(1,last_id.length),10);
			if ($('#' + last_letter + (last_number + 1)).html()) {
				$(this).children('form.linear').children('input').prop('checked',true);
			}
		}
		$(this).find('.linear input').on('click',function(event) {
			var parent_id = get_parent_tag($(this).parent().parent().attr('id'));
			var first_id = $('.' + parent_id).children('p[id]').first().attr('id');
			update_all_affected_links(first_id);
		});
	});
	
	toggle_edit();
		
	
	/// Document Events
	$(document).on('keydown','h3[contenteditable="true"],p[id] span:first-child[contenteditable="true"]',function(event) {
		if (event.which == 13) {
			$(this).blur();
			return false;
		}
	})
	.on('keydown','div[contenteditable]',function(event) {
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
					var index = $('.inner,.outer').index($(this).parent());
					$(this).remove();
					if ($('#sidebar').is(':visible')) {
						var current_page = $('.inner,.outer').filter(':visible');
						if (current_page.has('h3 + div[contenteditable]').html() || (current_page.has('h3 + p').html() && _drag)) {
							disable_sidebar_option($('#add_intro_text'));
						}
						else enable_sidebar_option($('#add_intro_text'));
					}
					setTimeout("size_buttons($('.inner,.outer').eq(" + index + "));",10);
					event.preventDefault();
					return false;
				}
			}
		}
		if (event.which == 9) {
			console.log('tab');
			document.execCommand('insertText',false,'\t');
			return false;
		}
	})
	.on('keyup','[contenteditable="true"]',function(event) {
		if ($(this).is('h3')) {
			// Title (page)
			if ($(this).parent().hasClass('inner')) {
				var id = $(this).parent().attr('id');
				var link_letter = String.fromCharCode(id.charCodeAt(0)-1);
				if (link_letter == '@') return false;
				var number = id.substring(1,id.length);
				$('#' + link_letter + number + ' span:first-child').html($(this).html());
			}
		}
		else if ($(this).is('p[id] span:first-child')) {
			// Title (link)
			var id = $(this).parent().attr('id');
			var child_letter = String.fromCharCode(id.charCodeAt(0)+1);
			var number = id.substring(1,id.length);
			$('.' + child_letter + number + ' h3').html($(this).html());
		}
		else if ($(this).is('p[id] span')) {
			// Summary
		}
		else {
			// Content
		}
		size_buttons($('.inner,.outer').filter(':visible'));
	})
	.on('cut paste','[contenteditable="true"]',function(event) {
		if (event.type == 'cut') _clip = document.getSelection().toString();
		if ($(this).is('h3')) {
			var index = $('h3').index($(this));
			setTimeout("$('h3').eq(" + index + ").keyup();",10);
		}
		else if ($(this).is('p[id] span:first-child')) {
			var index = $('p[id] span').index($(this));
			setTimeout("$('p[id] span').eq(" + index + ").keyup();",10);
			/// Handles 'paste into span' glitch in Firefox. Would prefer a better detection method.
			if (event.type == 'paste' && $.browser.mozilla) {
				if (typeof(_clip) !== 'undefined' && _clip) document.execCommand('insertText',false,_clip);
				return false;
			}
		}
		else if ($(this).is('p[id] span')) {
			var index = $('.inner,.outer').index($('.inner,.outer').filter(':visible'));
			setTimeout("size_buttons($('.inner,.outer').eq(" + index + "));",10);
			/// Handles 'paste into span' glitch in Firefox. Would prefer a better detection method.
			if (event.type == 'paste' && $.browser.mozilla) {
				if (typeof(_clip) !== 'undefined' && _clip) document.execCommand('insertText',false,_clip);
				return false;
			}
		}
	})
	.on('copy',function(event) {
		_clip = document.getSelection().toString();		/// Necessary for fix to 'paste into span' glitch in Firefox.
	});
	
	
	/// Window Events
	$(window).on('resize',function(event) {
		resize_writing_items();
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
			$('#bold,#italic,#underline,#ul,#ol').css('position','absolute');
			$('#bold').css('top',83);
			$('#italic').css('top',107);
			$('#underline').css('top',131);
			$('#ul').css('top',165);
			$('#ol').css('top',189);
		}
		else {
			$('#bold,#italic,#underline,#ul,#ol').css('position','fixed');
			$('#bold').css('top',3);
			$('#italic').css('top',27);
			$('#underline').css('top',51);
			$('#ul').css('top',85);
			$('#ol').css('top',109);
		}
	});
	
	
	/// Button Events
	$('#menu').on('click',function(event) {
		if ($('#sidebar').outerWidth()) delete_sidebar();
		else create_sidebar();
	});
	$('#bold').on('click',function(event) {
    	document.execCommand('bold', false, null);
		size_buttons($('.inner,.outer').filter(':visible'));
	});
	$('#italic').on('click',function(event) {
		document.execCommand('italic', false, null);
		size_buttons($('.inner,.outer').filter(':visible'));
	});
	$('#underline').on('click',function(event) {
		document.execCommand('underline', false, null);
	});
	$('#ul').on('click',function(event) {
		document.execCommand('insertUnorderedList', false, null);
	});
	$('#ol').on('click',function(event) {
		document.execCommand('insertOrderedList', false, null);
	});
	
});

/// Fixes most of the execCommand discrepancies. Applied during toggle_edit() to maintain the undo stack as much as possible.
function improve_formatting() {
	$('div[contenteditable] > p > div').unwrap();
	var list = $('ol,ul');
	if (list.parent().is('p')) list.unwrap();
		
	var div_contenteditable = $('div[contenteditable]');
	var plainText = div_contenteditable.contents().filter(function() { return this.nodeType === 3; });
	plainText.wrap('<p />');
	div_contenteditable.children('br').remove();
	
	div_contenteditable.children('div').each(function() { 
		var string = '';
		if ($(this).html() != '<br>') string = '<p>' + $(this).html() + '</p>';
		$(this).replaceWith(string); 
	});
}

function toggle_edit() {
	$('.preview_window').remove();
	improve_formatting();
	$('.inner,.outer').each(function() {
		toggle_edit_one($(this));
	});
	if (!$('[contenteditable]').html()) {
		$('body').off('click','[contenteditable="true"]');
		$('#bold,#italic,#underline,#font,#ul,#ol').hide();
	}
	else {
		$('body').on('click','[contenteditable="true"]',function(event) { if (!$(this).is(':focus')) $(this).focus(); } );
		$('#bold,#italic,#underline,#font,#ul,#ol').show();
	}
}

function toggle_edit_one(obj) {
	if (obj.children('h3').attr('contenteditable') == 'true') {
		obj.children('h3').removeAttr('contenteditable');
		obj.children('h4').children('p[id]').children('span').removeAttr('contenteditable');	// Placeholder for Unlinked Page Summary 
		obj.children('p[id]').children('span').removeAttr('contenteditable');
		
		var h3 = obj.children('h3');
		var div = h3.next('div[contenteditable]');
		if (div.html()) {
			var data = div.children();
			if (!data.html()) data = '<p>' + div.html() + '</p>';
			h3.after(data);
		}
		else if (!obj.hasClass('outer')) {
			var data = '<p>Content</p>';
			h3.after(data);
		}
		div.remove();
		h3.removeAttr('contenteditable');
		obj.children('p[id]').each(function(index) {
			var p = obj.children('p[id]').eq(index);
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
		obj.children('p[id]').children('span').attr('contenteditable','true');
		
		var data = obj.children('h3').nextUntil('.in').not('form.linear');
		if (data.html()) {
			obj.children('h3').after('<div contenteditable="true"></div>');
			obj.children('div[contenteditable]').html(data);
		}
		obj.children('p[id]').each(function(index) {
			var p = obj.children('p[id]').eq(index);
			data = p.nextUntil('.in').not('form.linear');
			if (data.html()) {
				p.after('<div contenteditable="true"></div>');
				p.next('div[contenteditable]').html(data);
			}
		});
	}
}

/// Turns off edit for outer pages but leaves edit on for inner pages. Unsure if this would be expected behavior or if edit should be entirely off.
/// If edit should be entirely off, other areas in the code will also need changing.
function toggle_drag() {
	if (!$('.outer p[id]').attr('draggable')) {
		$('.outer p[id]').attr({'draggable':'true','ondragstart':'drag(event)'});
		$('.outer').attr({'ondrop':'drop(event)','ondragover':'allowDrop(event)'});
		
		$('.outer').on('selectstart','p[id]',function(event){ 
			_data = $(event.target).parent().attr('id');
			if (this.dragDrop) this.dragDrop();
			return false;
		});
		$('.outer p[id]').css('cursor','move');
		
	}
	else {
		$('p[id]').removeAttr('draggable').removeAttr('ondragstart');
		$('.inner,.outer').removeAttr('ondrop').removeAttr('ondragover');
		
		$('.inner,.outer').off('selectstart');
		$('.outer p[id]').css('cursor','auto');
		
		/// For Touch Devices
		$('#dragdrop').remove();
		//$('p[id]').off('touchstart');
	}
	if (!_drag) {
		_drag = 1;
		if ($('#bold').is(':visible')) {
			$('.outer').each(function(event) {
				toggle_edit_one($(this));
			});
			_edit = 1;
		}
	}
	else {
		_drag = 0;
		if (_edit) {
			$('.outer').each(function(event) {
				toggle_edit_one($(this));
			});
			_edit = 0;
		}
	}
}

function allowDrop(event) {
	if (event.preventDefault) event.preventDefault();
	else event.returnValue = false;
}

function drag(event) {
	if (event.target) event.dataTransfer.setData("Text",event.target.id);
	$('#dragdrop').remove();
}

function drop(event) {
	if (event.preventDefault) event.preventDefault();
	var data;
	if (event.type == 'drop') data = event.dataTransfer.getData("Text");
	if (!data && typeof(_data) !== 'undefined') data = _data;
	if (typeof(data) === 'undefined' || data.charCodeAt(1) > 57 || data == 'undefined' || !data) return false;
	var set_p = $('.inner,.outer').filter(':visible').children('p');
	var first_p = set_p.first();
	var first_id = set_p.filter('[id]').first().attr('id');
	var letter = first_id.charAt(0);
	var first_number = parseInt(first_id.substring(1,first_id.length),10);
	if (data.charAt(0) != first_id.charAt(0)) return false;
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
			//modify_arrange_buttons();
			return true;
		}
	}
	return false;
}

function arrange_links(filter,letter,first_number) {
	var child_letter = String.fromCharCode(letter.charCodeAt(0)+1);
	$('.in + p[id]').filter(filter).each(function(index) {
		var old_number = this.id.substr(1,this.id.length-1);
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
		var number = this.id.substr(1,this.id.length-1);
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
		for (var index = 1; index <= stop_index; ++index) {
			var obj = $('.' + container_letter + index);
			arrange_links(obj.children(),letter,first_number);
			first_number += count_children(obj);
			var allow_linear_checked = obj.children('form.linear').children('input').prop('checked');
			if ((typeof(allow_linear_checked) !== 'undefined') && !allow_linear_checked) {
				++first_number;
			}
		}
		for (var index = 1; index <= stop_index; ++index) {
			var obj = $('.' + container_letter + index);
			repair_links(obj.children(),letter,first_number);
		}
	}
}

/// summary and page are null for a new page
function insert_page(summary,page,exists) {
	var first_id, letter, number;
	var current_div = $('.outer,.inner').filter(':visible');
	var current_div_id = current_div.attr('id');
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
		});
		if (_drag) toggle_edit_one(current_div);
	}
	else {
		first_id = current_div.children('p[id]').first().attr('id');
		if (first_id) {
			letter = first_id.charAt(0);
			number = parseInt(first_id.substring(1,first_id.length),10);
		}
		else {
			letter = 'a';
			number = 1;
		}
	}
	var div_letter = String.fromCharCode(letter.charCodeAt(0) + 1);
	current_div.append('<button type="button" class="in ' + letter + '0">+</button>');
	if (summary) summary.attr('id',letter + '0');
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
	resize_windows();
	resize_writing_items();
	current_div.attr('id',current_div_id);
	redraw_node_map(current_div_id);
	
	$(window).scrollTop($(document).height());
}

/// Handles pages with multiple keys
function delete_page() {
	var current_page = $('.inner,.outer').filter(':visible');
	if (!current_page.hasClass('outer')) {
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
			var current_number = current_keys[j].substr(1,current_keys[j].length);
			var page_summary = $('#' + link_letter + current_number);
			var parent_page = page_summary.parent();
			var parent_id = parent_page.attr('id');
			if (!parent_id) parent_id = parent_page.attr('class').split(' ').pop();
			var parent_page_first_id = parent_page.children('p[id]').first().attr('id');
			var arrange_letter = parent_page_first_id.charAt(0);
			var arrange_first_number = parseInt(parent_page_first_id.substring(1,parent_page_first_id.length),10);
			
			/// Might want to record these tangents in the undo delete stack.
			var tangent = $('.tangent._' + current_keys[j]);
			tangent.each(function(index) {
				var _this = $(this);
				_this.before(_this.html()).remove();
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
				arrange_links(parent_page.children(),arrange_letter,arrange_first_number);
				repair_links(parent_page.children(),arrange_letter,arrange_first_number);
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
		update_all_affected_links('a1');
		active_parent.attr('id',active_parent_id);
		size_buttons(active_parent);
		redraw_node_map(active_parent_id);
		return true;
	}
	else return false;
}

function undo_page_delete() {
	if (_delete.length == 0) return false;
	var restore = _delete.pop();
	for (var i=0; i < restore.parent.length; ++i) {
		var current_page = $('.inner,.outer').filter(':visible');
		var restore_parent_id = restore.parent[i].attr('class').split(' ').pop();
		if (!current_page.hasClass(restore_parent_id)) go_to(current_page.attr('id'),restore_parent_id);
		insert_page(restore.summary[i],restore.page,i);
	}
}

function delete_edge(edge) {
	var page = $('.' + edge);
	var prefix = 1;
	if (page.hasClass('outer')) ++prefix;
	var classes = page.attr('class').split(' ');
	// Multiply Keys
	if (classes.length > prefix + 1) {
		var link_letter = String.fromCharCode(edge.charCodeAt(0) - 1);
		var link_number = edge.substring(1,edge.length);
		$('#' + link_letter + link_number).remove();
		$('.in.' + link_letter + link_number).remove();
		page.removeClass(edge);
		arrange_links($('.Z1').children(),'a',1);
		repair_links($('.Z1').children(),'a',1);
		update_all_affected_links('a1');
	}
	// Single Key
	else {
		go_to($('.inner,.outer').filter(':visible').attr('id'),edge);
		delete_page();
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
		var _this = $(this);
		_thisLeft = _this.offset().left;
		_thisWidth = _this.outerWidth();
		
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
						'left': _thisLeft + _thisWidth - _switch.outerWidth()*2
		});
		
	});
	if (create) $('.switch').on('click',function(event) {
		var set_p_id = $('p[id]').filter(':visible');
		var first_id = set_p_id.eq(0).attr('id');
		var letter = first_id.charAt(0);
		var first_number = parseInt(first_id.substring(1,first_id.length),10);
		
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
		.append('<p id="insert_new_page">Insert New Page</p>')
		.append('<p id="add_intro_text">Add Introductory Text</p>')
		.append('<p id="view_graph">View Graph of All Pages</p>')
		//.append('<p id="insert_existing_page">Insert Existing Page</p>')
		.append('<p id="delete_page">Delete Current Page</p>')
		.append('<p id="undo_page_delete">Undo Page Delete</p>')
		.append('<hr />')
		.append('<p id="publish">Save and Publish</p>')
		.append('<p id="save">Save without Publishing</p>')
		.append('<hr />')
		.append('<p id="close">Close Sidebar</p>')
	;
	
	var current_page = $('.inner,.outer').filter(':visible');
	if (typeof(d3) === 'undefined' || !Modernizr.svg) disable_sidebar_option($('#view_graph'));
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
		if (_drag) $('#drag').html('Stop Dragging Summaries');
		else $('#drag').html('Start Dragging Summaries');
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
		toggle_graph();
	});
	$('#insert_existing_page').on('click',function(event) {
		if ($(this).hasClass('disabled')) return false;
	});
	$('#delete_page').on('click',function(event) {
		if ($(this).hasClass('disabled')) return false;
		delete_page();
		enable_sidebar_option($('#undo_page_delete'));
		var current_page = $('.inner,.outer').filter(':visible');
		if (!current_page.hasClass('outer')) enable_sidebar_option($('#delete_page'));
	});
	$('#undo_page_delete').on('click',function(event) {
		if ($(this).hasClass('disabled')) return false;
		undo_page_delete();
		if (_delete.length == 0) disable_sidebar_option($('#undo_page_delete'));
	});
	$('#publish,#save').on('click',function(event) {
		if (_drag) toggle_drag();
		if ($('#bold').is(':visible')) toggle_edit();
		var text = '';
		$('.inner,.outer').each(function(index) {
			$(this).children('form.linear').remove(); 
			if ($(this).hasClass('inner')) text += '<div class="' + $(this).attr('class') + '">' + $(this).html() + '</div>';
			else text += '<div class="' + $(this).attr('class') + '" id="Z1">' + $(this).html() + '</div>';
		});
		$('#_save').val(text);
		$('#_title').val($('.Z1 h3').html());
		if (this.id == 'publish') $('#_publish').val('true');
		$('form.save').submit();
	});
	$('#close').on('click',function(event) {
		delete_sidebar();
	});
	
	var sidebar_width = $('#sidebar').width();
	//var calc_width = 'calc(100% - 48px - ' + sidebar_width + 'px)';
	//var inner_outer = $('.inner,.outer');
	//inner_outer.css('width',calc_width);
	//if (inner_outer.outerWidth != $(window).width() - 48 - sidebar_width) inner_outer.css('width','-webkit-' + calc_width);
	
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
	inner_outer.css('width','');
	resize_windows();
	resize_writing_items();
	$('.left').css('left',0);
	size_buttons(inner_outer.filter(':visible'));
}
