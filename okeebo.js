/*
 * Okeebo Engine JavaScript
 * author: Ben Pedersen
 * 
 */

var workspace = new Array();
var scrollbar_width;
var mobile = 0;
var info_timer, mobile_timer, status_timer;
var different = -1, _adjust = 0;
var badIE = false;
var IE = false;

function resize_windows(){
	var w1 = $(window).width();
	var main = $('.inner,.outer').filter(':visible');
	if ($(document).height() > $(window).height()) w1 += scrollbar_width;
	var left_margin = (w1-(900 + scrollbar_width))/2;
		
	var sidebar_width = $('#sidebar').outerWidth();
	if (sidebar_width) {
		left_margin += sidebar_width/2;
		if (left_margin < sidebar_width) left_margin = sidebar_width;
	}
	else sidebar_width = 0;
	if (left_margin < 0) left_margin = 0;
	
	$('.inner,.outer,.exit,.splitscreen,#meta-map').css('margin-left',left_margin);
			
	$('#map').css('left',Math.max((Math.min(w1-scrollbar_width,900+left_margin)),sidebar_width+Math.min(main.outerWidth(),228))-100);
	
	$('#nw,#n,#ne,#e,#se,#s,#sw,#w').remove();
	var max_img_width = w1 - scrollbar_width - 2 * parseInt(main.css('padding-left'),10);
	$('img,video,object').width(function(index) {
		var _this = $(this);
		if (IE) this.removeEventListener('DOMAttrModified',dom_attr_mod,false);
		var new_width = Math.min(max_img_width,_this.attr('width'))
		if (_this.attr('height')) _this.height(new_width/_this.attr('width') * _this.attr('height'));
		return new_width;
	});
	if (IE) $('img').each(function(index) {
		this.addEventListener('DOMAttrModified',dom_attr_mod,false);
    });
};

// Makes IE Resize images using Attributes instead of CSS.
function dom_attr_mod(ev) {
	var _this = $(this);
	_this.attr('width',_this.width());
	_this.attr('height',_this.height());
}

function get_scrollbar_width() {
	$('body').css('overflow','hidden');
	var window_width = $(window).width();
	$('body').append('<p id="scrollbar_width" style="position: absolute; top: ' + $(window).height() + 'px;"> </p>');
	$('body').css('overflow','auto');
	var scrollbar_width = window_width - $(window).width();
	$('#scrollbar_width').remove();
	return scrollbar_width;
}

$(document).ready(function() {
	
	// To work with htmlPurifier
	$('.inner').children('h3').not('.out + h3').before('<button class="out" type="button"></button>');
	$('.outer').children('p[id]').not('.in + p[id]').before(function(index) { 
		return '<button class="in ' + this.id + '" type="button"></button>';
	});
	$('a.tangent').replaceWith(function() {
		return '<button class="' + $(this).attr('class') + '">' + $(this).text() + '</button>';
	});
	$('.in').html('+');
	$('.out').html('-');
	
	scrollbar_width = get_scrollbar_width();

	resize_windows();
	
	$('body').append('<div id="badIE"><!--[if lt IE 8]><script type="text/javascript">badIE = true;</script><![endif]--></div>');
	$('#badIE').remove();
	if (badIE) setTimeout("size_buttons($('.inner,.outer').eq(" + $('.inner,.outer').index($('.inner,.outer').filter(':visible')) + "));",100);
	$('body').append('<div id="IE"><!--[if IE]><script type="text/javascript">IE = true;</script><![endif]--></div>');
	$('#IE').remove();
	
	redraw_node_map($('.outer').filter(':visible').attr('id'));
	size_buttons($('.outer').filter(':visible'));
	use_math_plug_in();
	
	
	/// Window Events
	window.onmspointerdown = function(event) {
		if (event.pointerType != event.MSPOINTER_TYPE_MOUSE) {
			if (mobile_timer) clearTimeout(mobile_timer);
			mobile = 1;
		}
	};
	window.onmspointerup = function(event) {
		if (event.pointerType != event.MSPOINTER_TYPE_MOUSE) mobile_timer = setTimeout('mobile = 0;',400);
	};
	$(window).on('touchstart',function(event) {
		if (mobile_timer) clearTimeout(mobile_timer);
		mobile = 1;
	})
	.on('touchend',function(event) {
		mobile_timer = setTimeout('mobile = 0;',400);
	})
	.on('scroll',function(event) {
		var map = null;
		if ($('#large_map').html()) map = '#large_map';
		if ($('#large_meta').html()) map = '#large_meta';
		if (map) {
			if ($('.inner,.outer').filter(':visible').outerWidth() == $(map).width()) $(map).css({'left':0,'top':$(window).scrollTop()});
			else $(map).css({'left':$(window).scrollLeft(),'top':$(window).scrollTop()});
		}
	})
	.on('resize',function(event) {
		$('body').css('overflow-x','hidden');
		resize_windows();
		if ($('body').css('overflow-y')=='hidden') $('body').css('overflow-y','auto');
		
		var current = $('.inner,.outer').filter(':visible');
		size_buttons(current);
		
		if ($('#large_map').html()) modify_large_map(0,0);
		if ($('#large_meta').html()) modify_large_map(0,1);
		use_math_plug_in();
		
		if ($('#status').is(':visible')) {
			var current_div = $('.inner,.outer').filter(':visible');
			$('#status').css('left',parseInt(current_div.css('margin-left'),10)+current_div.outerWidth()*0.5-$('#status').outerWidth()*0.5);
		}
		if ($(document).width() > $(window).width()) $('body').css('overflow-x','auto');
	});
	
	
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
		var n1 = this.id.substr(3,this.id.length-3);
		var l0 = old.charCodeAt(2);
		var n0 = old.substr(3,old.length-3);
		
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
	
	
	/// Enable Swipe Gesture
	$('body').on('swipe',function(event) {
		if ($('#large_map').html() || $('#large_meta').html()) return false;
		// One Finger Swipe for Linear Move
		if (event.touches.length == 0) {							// The swipe gesture registers a single finger as 0
			if (event.direction == 'right') linear_move(37,1);		// Swiping to the right feels like pulling the left page onto the screen
			if (event.direction == 'left') linear_move(39,1);		// and vice versa
		}
	});
	
	
	/// Document Events
	$(document).keyup(function(event) {	
		//	Linear Move.  37 is Left.  39 is Right.
		if (event.which==37 || event.which==39) {
			if ($('.edit').is(':focus') || $(event.target).is('[contenteditable]')) return false;
			if (event.ctrlKey || event.altKey || event.shiftKey) {		// Which key should it be?
				var next_node = $('#meta-map div').index($('.meta-node'))-(38-event.which);
				if (next_node >= 0) switch_tab(next_node);
				return false;
			}
			linear_move(event.which,1);
		}
	})
	.on('click','.left',function(event) {
		linear_move(37,1);
	})
	.on('click','.right',function(event) {
		linear_move(39,1);
	})
	.on('click','.inner button,.outer button',function(event) {				
		var type = this.className.split(' ')[0];
		
		if (type == 'in') return concept_zoom_in(this.className.split(' ')[1]);
		if (type == 'out') return concept_zoom_out(1,0);
		
		// Essentially acts as a preview/link in the app and preserves the original functionality of <a>
		if (type == 'tangent') {
			var new_id = this.className.split(' ')[1].substr(1,this.className.split(' ')[1].length-1);
			// Code for Preview Text
			var content = $('#' + String.fromCharCode(new_id.charCodeAt(0)-1) + new_id.substr(1,new_id.length-1)).html();
			content = '<button class="preview_exit">&times;</button><p style="margin:0px 6px;">' + content + '</p>';
			content = '<button class="preview_main">*</button>' + /*'<button class="preview_split">&raquo;</button>' +*/ content;
			content = '<div id=_' + new_id +' class="preview_window">' + content + '</div>';
			
			$('.preview_window#_' + new_id).remove();
			$(this).parent().after(content);
			//size_preview_buttons();
			size_buttons($(this).closest('.inner,.outer'));
			
			var button_top = $(this).offset().top;
			var show_end = $('.preview_window#_' + new_id).offset().top + $('.preview_window#_' + new_id).height() - $(window).height() + 15;
			if (show_end < button_top) {
				if (show_end > $(window).scrollTop()) $('html,body').animate({'scrollTop':show_end});
			}
			else $('html,body').animate({'scrollTop':button_top});
	
			return false;
		}
		
		if (type == 'preview_main') {
			var new_id = $(this).parent().attr('id');
			new_id = new_id.substr(1,new_id.length-1);
			explore_tangent(new_id);
			$(this).parent().remove();
			return false;
		}
		
		if (type == 'preview_exit') {
			var preview_offset = $(this).parent().offset().top;
			if (preview_offset < $(window).scrollTop()) $(window).scrollTop(preview_offset);
			var obj = $(this).closest('.inner,.outer');
			$(this).parent().remove();
			size_buttons(obj);
		}
		
	});
	
	
	/// Other Events
	$('.exit').on('click',function() {
		var old_workspace = $('#meta-map div').index($('.meta-node'));
		var old_obj = $('.inner,.outer').filter(':visible');
		var old_id = old_obj.attr('id');
		for (var i=old_workspace; i < workspace.length-1; ++i) workspace[i] = workspace[i+1];
		workspace.pop();
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
	
});

function switch_tab(new_workspace) {
	if (new_workspace >= workspace.length) return false;
	var old_obj = $('.inner,.outer').filter(':visible');
	var old_workspace = $('#meta-map div').index($('#meta-map .meta-node'));
	if (workspace.length == old_workspace) workspace.push(old_obj.attr('id'));
	else workspace[old_workspace] = old_obj.attr('id');
	$('.meta-node').attr('class','_node');
	$('#meta-map div').eq(new_workspace).attr('class','meta-node');
		
	go_to(workspace[old_workspace],workspace[new_workspace]);	
}

function explore_tangent(new_id) {
		
	var old_obj = $('.inner,.outer').filter(':visible');
	
	if (workspace.length == 0) workspace.push(old_obj.attr('id'));
	else workspace[$('#meta-map div').index($('.meta-node'))] = old_obj.attr('id');
	workspace.push(new_id);
	
	$('#meta-map').eq(0).empty();
	for (var i=0; i < workspace.length; ++i) $('#meta-map').eq(0).append('<div class="_node"> </div>');
	
	$('.exit').show();
	$('#meta-map').show();
	$('._node').eq(i-1).attr('class','meta-node');
	
	$(window).scrollTop(0);
	go_to(old_obj.attr('id'),new_id);
}

function clear_selected_text() {
	if (document.selection) document.selection.empty();
	else if (window.getSelection) window.getSelection().removeAllRanges();
}

function clean_transition(new_obj,old_obj) {
	if ($('[contenteditable]').is(':visible')) {
		resize_writing_items();
		setTimeout("resize_writing_items();",450);
	}
	$('body').css('overflow-y','hidden');
	var top_margin = new_obj.css('margin-top');
	top_margin = parseInt(top_margin.substr(0,top_margin.length-2),10);
	if (new_obj.height()-$(window).height() > -top_margin) {
		$('body').css('overflow-y','auto');
		if (($(window).width() < 900)) {
			var x = 900 - $(window).width();
			if (x < scrollbar_width) old_obj.css({'padding-right':24-x,'max-width':876-(24-x)});
			else old_obj.css({'padding-right':24-scrollbar_width,'max-width':876-(24-scrollbar_width)});
			if (old_obj.height()-$(window).height() > -top_margin) old_obj.css({'padding-right':24,'max-width':852});
			else setTimeout("$('."+old_obj.attr('class').replace(/\s/g,'.')+"').css({'padding-right':24,'max-width':852});",400);
		}
	}
	else {
		if ((old_obj.height()-$(window).height() > -top_margin) && ($(window).width() < 900 + scrollbar_width)) {
			var x = 900 + scrollbar_width - $(window).width();
			if (x < scrollbar_width) old_obj.css({'padding-right':24+x,'margin-right':scrollbar_width-x});
			else old_obj.css({'padding-right':24+scrollbar_width});
			setTimeout("$('."+old_obj.attr('class').replace(/\s/g,'.')+"').css({'padding-right':24,'margin-right':0});",400);
		}
	}
}

function go_to(old_id,new_id) {
	old_obj = $('.'+old_id);
	new_obj = $('.'+new_id);
	if (new_obj.html() && !new_obj.hasClass(old_id)) {
		if ($('#status').filter(':visible').html()) $('#status').fadeOut();
		if (status_timer) clearTimeout(status_timer);
		$(window).scrollTop(0);
		/*		
		// More consistent feel?
		new_obj.fadeIn();
		old_obj.fadeOut();
		clean_transition(new_obj,old_obj);
		*/
		/**/
		// Doesn't break with rapid Ctrl+Arrow
		if ($('body').css('overflow-y')=='hidden') $('body').css('overflow-y','auto');
		new_obj.show();
		old_obj.hide();
		/**/
		new_obj.attr('id',new_id);
				
		if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = new_id;
		if ($('#info').is(':visible')) $('#map .node').mouseleave();
		
		$(window).scrollTop(0);
		redraw_node_map(new_id);
		size_buttons(new_obj);
		use_math_plug_in();
	}
}

// The redraw parameter is optional
function linear_move(direction, redraw) {
	var id = $('.inner,.outer').filter(':visible').attr('id');
	if ($('.'+ id).css('opacity') != 1) return false;
	var number = id.substr(1,id.length-1) - (38 - direction);
	var letter = id.substr(0,1);
	if ($('.' + letter + number).html()) {
		if ($('#status').filter(':visible').html()) $('#status').fadeOut();
		if (status_timer) clearTimeout(status_timer);
		$(window).scrollTop(0);
		if ($('body').css('overflow-y')=='hidden') $('body').css('overflow-y','auto');
		
		if (!$('.'+id).hasClass(letter+number)) {
			$('.' + letter + number).show();
			$('.'+id).hide();
		}
			
		if (tab_is_unique($('.'+id))) $('.'+id).attr('id','');
		$('.' + letter + number).attr('id',letter+number);
		
		if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = letter+number;
		if ($('#info').is(':visible')) $('#map .node').mouseleave();
		
		if (redraw) redraw_node_map(letter+number);		
		else {
			clear_selected_text();
			var t = $('#' + String.fromCharCode(id.charCodeAt(0)-1) + number).parents('.outer');
			var b;
			if (t.html()) {
				b = t.children('.in + p').first().attr('id');
				b = b.substr(1,b.length-1);
				b = number - b + 1;
			}
			else b = number;
			var old_node = $('.node').filter(function() { 
				return ( $(this).css('background-color') == 'rgb(85, 85, 85)' || $(this).css('background-color') == '#555' ); 
			});
			old_node.css({'background-color':'#FFF','border-color':'#555','cursor':'pointer'});
			var row = old_node.attr('id').charCodeAt(2);
			$('#m_' + String.fromCharCode(row) + b).css({'background-color':'#555','border-color':'#2A2A2A','cursor':'default'});
			update_last_node_line($('#' + letter + number),row+1);
		}
		size_buttons($('#' + letter + number));
		use_math_plug_in();
		return true;
	}
	if (status_timer) clearTimeout(status_timer);
	if (direction == 39) $('#status').html('End of Section');
	else $('#status').html('Beginning of Section');
	var current_div = $('.inner,.outer').filter(':visible');
	$('#status').css('left',parseInt(current_div.css('margin-left'),10)+current_div.outerWidth()*0.5-$('#status').outerWidth()*0.5);
	$('#status').fadeIn();
	status_timer = setTimeout("$('#status').fadeOut();",1400);
	
	var status_top = $(window).scrollTop()+$(window).height()*0.9-$('#status').outerHeight();
	if (Math.abs(status_top-$('#status').offset().top) > 1) $('#status').css({'bottom':'auto','top':status_top});
	
	size_linear_buttons($('.outer,.inner').filter(':visible'));
	
	return false;
}

// Color parameter is optional
function redraw_node_map(id,color) {
	clear_selected_text();
	$('#map').empty();
	if (id.charCodeAt(0) < 90) return false;
	var a_color = '#555', a_brdr = '#2A2A2A', p_color = '#00F', p_brdr = '#008';
	if (color == 1) a_color = '#888', p_color = '#66F';
	var line = new Array();
	for (i=0; id; ++i) {
		line[i] = id;
		id = get_parent_tag(id);
	}
	var alpha = 96 + i;
	$('#map').append('<div class="row" id="m_a"></div>');
	$('#m_a').css('width','10px');
	$('#m_a').append('<div class="node" id="m_a1"> </div>');
	if (line[0]!='Z1') $('#m_a1').css({'background-color':p_color,'border-color':p_brdr});
	else $('#m_a1').css({'background-color':a_color,'border-color':a_brdr,'cursor':'default'});
	for (j=i-1; j>=0; --j) {					
		update_last_node_line($('.'+line[j]),alpha-j+1);
		if (line[j+1]) {
			var b = $('.'+line[j+1]+' .in + p').first().attr('id');
			var n = line[j].substr(1,line[j].length-1);
			b = b.substr(1,b.length-1);
			n = n - b + 1;
			if (j==0) $('#m_'+String.fromCharCode(alpha-j)+n).css({'background-color':a_color,'border-color':a_brdr,'cursor':'default'});
			else $('#m_'+String.fromCharCode(alpha-j)+n).css({'background-color':p_color,'border-color':p_brdr});
		}
	}
}

function tab_is_unique(obj) {
	var test_index = $('#meta-map > div').index($('.meta-node'));
	for (var i=0; i <= workspace.length; ++i) if ((i != test_index) && (workspace[i] == obj.attr('id'))) return false;
	return true;
}

function concept_zoom_out(dif,adj) {
	if ($('#status').is(':visible')) $('#status').fadeOut();
	if (status_timer) clearTimeout(status_timer);
	$(window).scrollTop(0);
	var id = $('.inner').filter(':visible').attr('id');
	var old_obj = $('#' + id);
	var target = id;
	for (i=0; i<dif; ++i) target = get_parent_tag(target);
	if (!target) return false;	
	if (adj) {
		var parent_tag = get_parent_tag(target);
		if (parent_tag) {
			y = $('.' + parent_tag + ' > .in + p').first().attr('id');
			y = y.substr(1,y.length-1);
			d = y - (1 - adj);
			target = target.substr(0,1) + d;
		}
	}
	var target_obj = $('.' + target);
	target_obj.fadeIn();
	old_obj.fadeOut();
	clean_transition(target_obj,old_obj);
	// target_obj.show();
	// old_obj.hide();
	if (tab_is_unique(old_obj)) old_obj.attr('id','');
	
	target_obj.attr('id',target);
	size_buttons(target_obj);
	if (badIE) setTimeout("size_buttons($('.inner,.outer').eq(" + $('.inner,.outer').index(target_obj) + "));",100);
	use_math_plug_in();
	
	if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = target;
	if ($('#info').is(':visible')) $('#map .node').mouseleave();
	
	redraw_node_map(target);
	return true;
}

function concept_zoom_in(id) {	
	var letter = String.fromCharCode(id.charCodeAt(0)+1);
	var number = id.substr(1,id.length-1);
	if ($('.' + letter + number).html()) {
		if ($('#status').is(':visible')) $('#status').fadeOut();
		if (status_timer) clearTimeout(status_timer);
		$(window).scrollTop(0);
		var old_obj = $('.outer').filter(':visible');
		var a = old_obj.children('.in + p').first().attr('id');
		a = a.substr(1,a.length-1);
		var b = number - a + 1;
		
		$('.' + letter + number).fadeIn();
		old_obj.fadeOut();
		clean_transition($('.' + letter + number),old_obj);
		//$('.' + letter + number).show();
		//$('.outer').hide();
		$('.' + letter + number).attr('id',letter+number);
		
		redraw_node_map(letter+number);
		size_buttons($('.' + letter + number));
		use_math_plug_in();
		
		if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = letter+number;
		if ($('#info').is(':visible')) $('#map .node').mouseleave();
		
		return true;
	}
	return false;
}

function size_preview_buttons() {
	if ($('.preview_window').html()) for (var i=0; i<=$('.preview_window').index($('.preview_window').last()); ++i) {
		var preview_buttons_height = $('.preview_window p').eq(i).height() / 1;
		$('.preview_main').eq(i).css({'height':preview_buttons_height});
		//$('.preview_split').eq(i).css({'height':preview_buttons_height,'margin-top':preview_buttons_height+5});
	}
}

function size_linear_buttons(obj) {
	$('.left,.right').height(obj.height());
	var _width = parseInt(obj.css('margin-left'),10)+12;
	var sidebar_width = $('#sidebar').outerWidth();
	if (sidebar_width) _width -= sidebar_width;
	$('.left,.right').width(_width);
	$('.right').css('left',obj.outerWidth()+obj.offset().left-12);
	$('.left').css('background-position',_width/2-6);
	$('.right').css('background-position',$('.right').offset().left+_width/2-6);
	var l = obj.attr('id').charAt(0);
	var n = parseInt(obj.attr('id').substr(1,obj.attr('id').length-1),10);
	if (!$('.'+l+(n-1)).html()) $('.left').css({'cursor':'default','background-image':'none'});
	else $('.left').css({'cursor':'pointer','background-image':''});
	if (!$('.'+l+(n+1)).html()) $('.right').css({'cursor':'default','background-image':'none'});
	else $('.right').css({'cursor':'pointer','background-image':''});
	if (mobile == 1) {
		linear_buttons = $('.left,.right').css('background-image','none').detach();
		setTimeout("$('body').append(linear_buttons.css('background-image','')); delete window.linear_buttons;",10);
	}
}

function size_buttons(obj) {
	if (!obj.html()) return false;
	size_preview_buttons();
	var dots = count_children(obj);
	
	for (var i=0; i<dots; ++i) obj.children('.in').eq(i).css('height',obj.children('.in + p').eq(i).outerHeight());
	
	size_linear_buttons(obj);
}

function count_children(obj) {
	return obj.children('.in + p').index(obj.children('.in + p').last()) + 1;
}

function get_parent_tag(id) {
	var test_l = String.fromCharCode(id.charCodeAt(0)-2);
	if (!id || test_l=='?' || test_l=='X') return false;
	if (test_l=='`') test_l='Z';
	var hit_l = String.fromCharCode(id.charCodeAt(0)-1);
	var hit_n = id.substr(1,id.length-1);
	
	var parent = $('#'+hit_l+hit_n).parent();
	var parent_id = parent.attr('id');
	if (parent_id) return parent_id;
	else {
		var parent_class = parent.attr('class').split(' ');
		for (var i=0; i<parent_class.length; ++i) {
			if ((parent_class[i] != 'outer') && (parent_class[i] != 'inner') && (parent_class[i].charAt(0) == test_l)) return parent_class[i];
		}
		return false;
	}
}

function update_last_node_line(obj,row) {
	var row = String.fromCharCode(row);
	if (dots = count_children(obj)) {
		if (!$('#m_' + row).html()) $('#map').append('<div class="row" id="m_' + row + '"></div>');
		else $('#m_' + row).empty();
		$('#m_' + row).css('width',dots*10+'px');
		for (i=1; i<=dots; ++i) $('#m_' + row).append('<div class="node" id="m_' + row + i + '"> </div>');
	}
	else {
		$('#m_' + row).remove();
	}
	return false;
}

function pivot() {
	var current = $('.inner').filter(':visible');
	if (!current.html()) return;
	var current_keys = current.attr('class').split(' ');
	if (current_keys.shift() == 'outer') current_keys.shift();
	var next_key = current_keys.indexOf(current.attr('id')) + 1;
	if (next_key >= current_keys.length) next_key = 0;
	current.attr('id',current_keys[next_key]);
	redraw_node_map(current_keys[next_key]);
}

function modify_large_map(create,meta) {
	var map = '#large_map';
	if (meta) map = '#large_meta';
	if (create && $(map).html()) return true;
	if (!create && !$(map).html()) return false;
	if (create) different = -1;
	if (create) $('body').append('<div id="' + map.substr(1,map.length-1) + '"></div>');
	if (window.innerHeight) $(map).height(window.innerHeight);
	else $(map).height($(window).height());
	if (window.innerWidth && window.innerWidth < $(window).width()) $(map).width(window.innerWidth);
	else $(map).width($(window).width());
	if (create) $(map).css({'position':'absolute','background-color':'rgba(170,170,170,0.9)'});
	if ($('.inner,.outer').filter(':visible').outerWidth() == $(map).width()) $(map).css({'left':0,'top':$(window).scrollTop()});
	else $(map).css({'left':$(window).scrollLeft(),'top':$(window).scrollTop()});
	
	var resize_workaround_test = (($(window).scrollLeft() > 2) && ($(map).css('left') == '0px') && create);
	if (resize_workaround_test) resize_workaround_test = (!window.innerWidth || window.innerWidth >= $(document).width());
	if (resize_workaround_test) resize_workaround_test = (!window.innerHeight || window.innerHeight >= $(window).height());
	if (resize_workaround_test) {
		$('meta[name="viewport"]').attr('content','width=device-width, minimum-scale=1, maximum-scale=1');
	}
		
	var portrait = ($(map).height()/$(map).width() > 1);
	
	if (create) {
		$(map).append('<button id="lm_ok">&#x2713;</button><button id="lm_cancel">&#x2717;</button>');
		$(map + ' button').css({'position':'absolute','border-width':1});
		$('#lm_ok').css({'background-color':'#00D700','border-color':'#006C00'});
		$('#lm_cancel').css({'background-color':'#D70000','border-color':'#6C0000','z-index':'900'});
		$('#lm_ok').on('tap',function(event) {
			if (meta) {
				if (different == -1) return false;
				$(map).remove();
				switch_tab(different);
				return true;
			}
			var _old = $('.node').filter(function() { return ( $(this).css('background-color') == 'rgb(85, 85, 85)' ); }).attr('id');
			if (different == -1) return false;
			var _new = $(map + ' .node').eq(different).attr('id');
			var l1 = _new.charCodeAt(2);
			var n1 = _new.substr(3,_new.length-3);
			var l0 = _old.charCodeAt(2);
			var n0 = _old.substr(3,_old.length-3);
			
			$(map).remove();
					
			if (l1>l0) return concept_zoom_in($('.outer').filter(':visible').children('.in + p').eq(n1-1).attr('id'));
			else if (l1<l0) return concept_zoom_out(l0-l1,n1);
			else if (n1!=n0) return linear_move(38-(n0-n1));
			
		});
		$('#lm_cancel').on('tap',function(event) {
			$(map).remove();
		});
	}
	if (portrait) {
		$(map + ' button').width($(map).width()/8*3);
		$(map + ' button').height(Math.min($('#lm_ok').width()/1.61803398875,$(map).height()*0.167));
		$(map + ' button').css({'bottom':$(map).height()/20});
	
		$('#lm_ok').css({'top':'auto','left':($(map).width()-2*$('#lm_ok').width())/3});
		$('#lm_cancel').css({'right':($(map).width()-2*$('#lm_ok').width())/3});
	}
	else {
		$(map + ' button').height($(map).height()/8*3);
		$(map + ' button').width(Math.min($('#lm_ok').height()/1.61803398875,$(map).width()*0.167));
		$(map + ' button').css({'right':$(map).width()/20});
	
		$('#lm_ok').css({'left':'auto','top':($(map).height()-2*$('#lm_ok').height())/3});
		$('#lm_cancel').css({'bottom':($(map).height()-2*$('#lm_ok').height())/3});
	}
	
	if (!meta) {
		var longest_row = 0;
		var nodes = new Array($('#map .row').index($('#map .row').last())+1);
		for (var i=0; i < nodes.length; ++i) {
			if ($('#map .row').eq(i).width() > $('#map .row').eq(longest_row).width()) longest_row = i;
			nodes[i] = $('#map > .row').eq(i).children('.node').index($('#map > .row').eq(i).children('.node').last()) + 1;
		}
		var max_nodes = nodes[longest_row];
		var multiplier = Math.min(((0.9*$(map).width()/max_nodes)-2)*0.125,((0.6*$(map).height()/nodes.length)-2)*0.125);
		if (!portrait) multiplier=Math.min(((0.9*$('#lm_ok').offset().left/max_nodes)-2)*0.125,((0.7*$(map).height()/nodes.length)-2)*0.125);
		if (create) {
			$(map).append($('#map').html());
			$(map + ' .node').css({'-webkit-tap-highlight-color':'rgba(0, 0, 0, 0)','outline':'none'});
		}
		$(map + ' .node').css({'padding':multiplier*3,'margin':multiplier,'border-radius':multiplier*4});
		$(map + ' .row').height(8*multiplier+2);
		for (var i=0; i < nodes.length; ++i) $(map + ' > .row').eq(i).width(Math.ceil(nodes[i] * (8*multiplier+2))+1);
		
		var ok_button_top = $(map).height();
		if (portrait) ok_button_top = $('#lm_ok').offset().top-$(map).offset().top;
		var vertical_position = ok_button_top-nodes.length*$(map + ' .row').height()-6*multiplier;
		vertical_position = Math.max(vertical_position,ok_button_top*0.67-nodes.length*$(map + ' .row').height()*0.67);
		vertical_position = Math.min(vertical_position,ok_button_top-nodes.length*$(map + ' .row').height());
		
		$(map + ' .row').css({'position':'relative','top':vertical_position});
		if (!portrait) $(map + ' .row').css({'padding-right':$(map).width()-$('#lm_ok').offset().left});
		else $(map + ' .row').css({'padding-right':0});
	}
	else {
		var nodes = $('#meta-map div').index($('#meta-map div').last()) + 1;
		var multiplier = Math.min(((0.9*$(map).width()/nodes)-2)*0.125,((0.5*$(map).height())-2)*0.125);
		if (!portrait) multiplier=Math.min(((0.9*$('#lm_ok').offset().left/nodes)-2)*0.125,((0.5*$(map).height())-2)*0.125);
		if (create) {
			$(map).append('<div id="meta" style="margin:0 auto;">' + $('#meta-map').html() + '</div>');
			$(map + ' > #meta > div').css({'-webkit-tap-highlight-color':'rgba(0, 0, 0, 0)','outline':'none'});
		}
		$(map + ' > #meta > div').css({'padding':multiplier*3,'margin':multiplier,'border-radius':multiplier*4});
		$(map + ' > #meta').height(8*multiplier+2);
		$(map + ' > #meta').width(Math.ceil(nodes*(8*multiplier+2))+1);
		
		var ok_button_top = $(map).height();
		if (portrait) ok_button_top = $('#lm_ok').offset().top-$(map).offset().top;
		var vertical_position = ok_button_top*0.75-$(map + ' > #meta').height()*0.75;
		vertical_position = Math.min(vertical_position,ok_button_top-$(map + ' > #meta').height());
		
		$(map + ' > #meta').css({'position':'relative','top':vertical_position});
		if (!portrait) $(map + ' > #meta').css({'padding-right':$(map).width()-$('#lm_ok').offset().left});
		else $(map + ' > #meta').css({'padding-right':0});
	}
	
	if (create) {
		$(map).append('<p id="lm_info"></p>');
		$('#lm_info').css({'position':'absolute','top':0,'margin':'0 5px','color':'#eee'});
	}
	if (!portrait) $('#lm_info').width($('#lm_ok').offset().left-20);
	else $('#lm_info').width('auto');
	
	if (create) $(map).on('touchstart',function(event) {
		event.preventDefault();
	});
	
	if (create && !meta) $(map + ' .node').on('tap',function(event) {
		$(map + ' .node').css('box-shadow','none');
		$(map + ' .node').css('-webkit-box-shadow','none');
		different = $(map + ' .node').index($(this));
		$(this).css('box-shadow','0 0 ' + 1.5*multiplier + 'px ' + 0.75*multiplier + 'px #eee');
		$(this).css('-webkit-box-shadow','0 0 ' + 1.5*multiplier + 'px ' + 0.75*multiplier + 'px #eee');
		
		var old = $('.node').filter(function() { return ( $(this).css('background-color') == 'rgb(85, 85, 85)' ); }).attr('id');
		var l1 = this.id.charCodeAt(2);
		var n1 = this.id.substr(3,this.id.length-3);
		var l0 = old.charCodeAt(2);
		var n0 = old.substr(3,old.length-3);
		if (l1>l0) {
			$('#lm_info').html($('.outer').filter(':visible').children('.in + p').eq(n1-1).children('span').html());
		}
		else {
			t = $('.inner').filter(':visible').attr('id');
			if (!t) t = $('.outer').filter(':visible').attr('id');
			for (i=0; i<l0-l1; ++i) t = get_parent_tag(t);
			if (s = get_parent_tag(t)) $('#lm_info').html($('.'+s+' p').eq(n1-1).children('span').html());
			else $('#lm_info').html($('.'+t+' h3').html());
		}
		size_lm_info(map);
	});
	
	if (create && meta) $(map + ' > #meta > div').on('tap',function(event) {
		$(map + ' > #meta > div').css('box-shadow','none');
		$(map + ' > #meta > div').css('-webkit-box-shadow','none');
		different = $(map + ' > #meta > div').index($(this));
		$(this).css('box-shadow','0 0 ' + 1.5*multiplier + 'px ' + 0.75*multiplier + 'px #eee');
		$(this).css('-webkit-box-shadow','0 0 ' + 1.5*multiplier + 'px ' + 0.75*multiplier + 'px #eee');
		
		$('#lm_info').html($('.' + workspace[$(map + ' > #meta > div').index($(this))] + ' h3').html());
		
		size_lm_info(map);
	});
	
	if (!create && $('#lm_info').html()) {
		size_lm_info(map);
	}
}

function size_lm_info(map) {
	var font_size = 2.5;
	$('#lm_info').css('font-size',font_size + 'em');
	var _child = ' .row';
	if (map == '#large_meta') _child = ' #meta';
	var first_row_top = $(map + _child).eq(0).offset().top - $(map).offset().top;
	while (($('#lm_info').outerHeight() > first_row_top || $('#lm_info').outerHeight() > 0.33*$(map).height() || $('#lm_info').outerWidth(true) > $(map).width()) && (font_size > 0.1)) {
		font_size -= 0.1;
		$('#lm_info').css('font-size',font_size + 'em');
	}
	$('#lm_info').css('text-shadow','0 ' + font_size + 'px ' + 2*font_size + 'px #7F7F7F');
}

function use_math_plug_in() {
	if (typeof window['align_fractions'] === 'function') {
		align_fractions();
		align_summations();
		align_limits();
	}
}
