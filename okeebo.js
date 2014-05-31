/*
 * Okeebo Engine JavaScript
 * author: Ben Pedersen
 * 
 */

var workspace = new Array();
var scrollbar_width;
var mobile = 0;
var trackHistory = false;
var info_timer, mobile_timer, status_timer;
var different = -1, _adjust = 0;
var badIE = false;
var IE = false;
var mapWidth = 100;

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
	
	var forum = $('#forum');
	if (forum.index() < 0) {
		$('body').append('<p id="forum"></p>');
		forum = $('#forum');
	}
	$('.inner,.outer').css('margin-left',left_margin);
	if (main.parent().css('position') == 'static') {
		left_margin = main.offset().left;
	}
	else {
		left_margin = parseInt(main.css('margin-left'),10) || left_margin;
	}
	$('.exit,.splitscreen,#meta-map,#forum,#home,#catalog,#function').css('margin-left',left_margin);
	forum.width($('#map').offset().left - forum.offset().left);
	forum.css('top',75-Math.max(forum.height(),19));
			
	$('#map,#map_helper').css('left',Math.max((Math.min(w1-scrollbar_width,(main.outerWidth()||900)+left_margin)),sidebar_width+Math.min(main.outerWidth(),228))-mapWidth);
	var map_left = $('#map').offset().left;
	$('#search').css('left',map_left+72);
	/*$('#search').css('left',0.88*(map_left-left_margin)+left_margin);
	$('#notes').css('left',0.55*(map_left-left_margin)+left_margin);
	$('#home').css('left',0.22*(map_left-left_margin)+left_margin);*/
	if (main.offset()) {
		var map_top_dif = main.offset().top - 67 - $('#map').offset().top;
		if (Math.round(map_top_dif) != 0) {
			main.prepend($('#map').css({
				'position': 'relative',
				'top': 0,
				'left': 0,
				'float': 'right'
			}));
		}
	}
	
	$('#nw,#n,#ne,#e,#se,#s,#sw,#w').remove();
	var max_img_width = main.width();
	var max_img_height = window.innerHeight;
	$('img,video,object,table').width(function(index) {
		var $this = $(this);
		if (IE && this.removeEventListener) this.removeEventListener('DOMAttrModified',dom_attr_mod,false);
		_mod = ($this.parents('p').prev('.in').html()) ? 50 : 0;
		var new_width = Math.min(max_img_width - _mod,$this.attr('width'))
		if ($this.attr('height')) {
			$this.height(new_width/$this.attr('width') * $this.attr('height'));
			if ($this.height() > max_img_height) {
				new_width = max_img_height/$this.height() * new_width;
				$this.height(max_img_height);
			}
		}
		return new_width;
	});
	if (IE) $('img').each(function(index) {
		if (this.addEventListener) this.addEventListener('DOMAttrModified',dom_attr_mod,false);
		else return false;
    });
};

function get_map_width(obj) {
	var pages = $('.outer');
	if (obj instanceof jQuery) pages = pages.filter(jQuery);
	pages.each(function() {
		var $this = $(this);
		var count = count_children($this);
		if ((count+1)*10 > mapWidth) mapWidth = (count+1)*10;
	});
	$('#map,#map_helper').css('width',mapWidth);
}

// Makes IE Resize images using Attributes instead of CSS.
function dom_attr_mod(ev) {
	var $this = $(this);
	$this.attr('width',$this.width());
	$this.attr('height',$this.height());
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

	get_map_width();
	resize_windows();
	
	$('body').append('<div id="badIE"><!--[if lt IE 8]><script type="text/javascript">badIE = true;</script><![endif]--></div>');
	$('#badIE').remove();
	if (badIE) setTimeout("size_buttons($('.inner,.outer').eq(" + $('.inner,.outer').index($('.inner,.outer').filter(':visible')) + "));",100);
	$('body').append('<div id="IE"><!--[if IE]><script type="text/javascript">IE = true;</script><![endif]--></div>');
	$('#IE').remove();
	
	var $page = $('.inner,.outer').filter(':visible');
	redraw_node_map($page.attr('id'),0,1);
	load_notes();
	size_buttons($page);
	use_math_plug_in();
	
	
	/// Window Events
	window.onmspointerdown = function(event) {
		if (event.pointerType != event.MSPOINTER_TYPE_MOUSE && event.pointerType != 'mouse') {
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
		if (!$('svg').is(':visible') && $('body').css('overflow-y')=='hidden') $('body').css('overflow-y','auto');
		
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
	})
	.on('beforeunload',function(event) {
		save_notes();
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
			$('#info').css({'top':7,'left':'auto','padding-right':10,'right':0});
			info_timer = setTimeout("$('#info').show()",500);
			var scrollTop = $(window).scrollTop();
			var pos = $(this).offset();
			var $info = $('#info');
			$info.show();
			var $info_left = $info.offset().left;
			$info.hide();
			var left_test = pos.left + 12 > $info_left || $info_left == 0;
			if ($('#info').height() + 7 + scrollTop > pos.top && left_test) $('#info').css('top',pos.top + 24 - scrollTop);
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
			if ($('#guided_tour').is(':visible')) {
				// Might want a better detection method. For now, refer to okeebo.tour.js for what the string values should be.
				if (['You can also use the right and left arrow keys.','Otherwise we\'re done!'].indexOf($('#guided_tour > p').html()) != -1) return false;
			}
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
			var new_id = this.className.split(' ')[1].substr(1);
			// Code for Preview Text
			var obj = $('#' + String.fromCharCode(new_id.charCodeAt(0)-1) + new_id.substr(1)).clone();
			obj.children('.delete,.handle').remove();
			var content = obj.html();
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
			new_id = new_id.substr(1);
			var test = $('.outer').filter(':visible').hasClass('Z3');
			explore_tangent(new_id);
			if (!test) $(this).parent().remove();
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
		if ($(this).css('pointer-events') == 'none') return false;
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
	
	if (typeof(_hide) === 'undefined') {
		_hide = $.fn.hide;
		$.fn.hide = function(){
			return _hide.apply(this,arguments).trigger("hide");
		};
	}
	$('body').on('hide','.inner,.outer',function(event) {
		// Reset effects from clean_transition()
		$('.inner,.outer').css('top','').filter(':visible').prepend($('.inner,.outer').children('#map'));
		$(this).css({'padding-right':'','margin-right':'','width':''}).children('.map').remove();
	});
	
	flashToHTML5();
	loadVideos();
	
	if (location.hash != '') hashChange(1);
	
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
	
	$(window).scrollTop(old_obj.offset().top - 80);
	go_to(old_obj.attr('id'),new_id);
}

function clear_selected_text() {
	if (document.selection) document.selection.empty();
	else if (window.getSelection) window.getSelection().removeAllRanges();
}

function clean_transition(new_obj,old_obj) {
	/*if ($('[contenteditable]').is(':visible')) {
		$('.left,.right,#bold,#italic,#underline,#ul,#ol,#img,#link').hide();
	}*/
	new_obj.prepend(old_obj.children('#map').attr('class','map').attr('id','').clone(true));
	new_obj.children('.map').attr('class','').attr('id','map');
	old_obj.children('.map').find('*').attr('id','');
	var new_top = new_obj.offset().top;
	var old_top = old_obj.offset().top;
	if (new_top > old_top) new_obj.css('top', (old_top - new_top) + 'px');
	if (old_top > new_top) old_obj.css('top', (new_top - old_top) + 'px');
	
	if (new_obj.parent().is('body')) {
		$('body').css('overflow-y','hidden');
		var top_margin = new_obj.css('margin-top');
		top_margin = parseInt(top_margin.substr(0,top_margin.length-2),10);
		var _window = $(window);
		//console.log(_window.height(),$(document).height(),new_obj.height(),old_obj.height());
		if (new_obj.height()-_window.height() > -top_margin) {
			$('body').css('overflow-y','auto');
			if ((_window.width() < 900)) {
				var x = 900 - _window.width();
				if (x < scrollbar_width) old_obj.css({'padding-right':24-x,'width':852});
				else old_obj.css({'padding-right':24-scrollbar_width,'width':852-x+scrollbar_width});
				if (old_obj.height()-_window.height() > -top_margin) old_obj.css({'padding-right':'','width':''});
			}
		}
		else {
			if ((old_obj.height()-_window.height() > -top_margin) && (_window.width() < 900 + scrollbar_width)) {
				var x = 900 + scrollbar_width - _window.width();
				if (x < scrollbar_width) old_obj.css({'padding-right':24+x,'margin-right':scrollbar_width-x,'width':'auto'});
				else old_obj.css({'padding-right':24+scrollbar_width,'width':'auto'});
			}
		}
	}
	if ($('[contenteditable]').is(':visible')) {
		resize_writing_items(Math.min(scrollbar_width,x)-scrollbar_width);
		setTimeout("resize_writing_items()",0);
	}
}

function go_to(old_id,new_id) {
	old_obj = $('.'+old_id);
	new_obj = $('.'+new_id);
	if (new_obj.html() && !new_obj.hasClass(old_id)) {
		if ($('#status').filter(':visible').html()) $('#status').fadeOut();
		if (status_timer) clearTimeout(status_timer);
		if (old_obj.offset()) $(window).scrollTop(old_obj.offset().top - 80);
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
		redraw_node_map(new_id);
		old_obj.hide();
		/**/
		new_obj.attr('id',new_id);
				
		if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = new_id;
		if ($('#info').is(':visible')) $('#map .node').mouseleave();
		
		$(window).scrollTop(new_obj.offset().top - 80);
		size_buttons(new_obj);
		if ($('[contenteditable]').is(':visible')) resize_writing_items()
		use_math_plug_in();
	}
}

// The redraw parameter is optional
function linear_move(direction, redraw) {
	var id = $('.inner,.outer').filter(':visible').attr('id');
	if ($('.'+ id).css('opacity') != 1) return false;
	var number = id.substr(1) - (38 - direction);
	var letter = id.charAt(0);
	if ($('.' + letter + number).html()) {
		// Skip Hidden Pages
		if ($('.' + letter + number).hasClass('hidden')) {
			linear_move(direction + ((direction > 38) ? 1 : -1), redraw);
			return false;
		}
		if ($('#status').filter(':visible').html()) $('#status').fadeOut();
		if (status_timer) clearTimeout(status_timer);
		$(window).scrollTop($('.'+id).offset().top - 80);
		if ($('body').css('overflow-y')=='hidden') $('body').css('overflow-y','auto');
		
		if (!$('.'+id).hasClass(letter+number)) {
			$('object[data*="youtube"]').css('visibility','');
			$('.' + letter + number).show();
			$('.'+id).hide();
		}
			
		if (tab_is_unique($('.'+id))) $('.'+id).attr('id','');
		$('.' + letter + number).attr('id',letter+number);
		
		if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = letter+number;
		if ($('#info').is(':visible')) $('#map .node').mouseleave();
		
		redraw_node_map(letter+number);		
		
		size_buttons($('#' + letter + number));
		use_math_plug_in();
		if ($('[contenteditable]').is(':visible')) resize_writing_items()
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

function onYouTubePlayerReady(playerid) {
	$('object[data*="youtube"]').each(function(index) {
		if (this.getCurrentTime) {
			var t0 = this.getCurrentTime();
			var t1 = Number($(this).attr('time'));
			if (t0 == 0 && t0 != t1) {
				this.seekTo(t1);
				this.pauseVideo();
			}
		}
	});
}

// Color parameter is optional
function redraw_node_map(id,color,initial) {
	if (typeof(id) === 'undefined') return false;
	clear_selected_text();
	$('object[data*="youtube"]').each(function(index) {
		if (this.getCurrentTime) $(this).attr('time',this.getCurrentTime());
	});
	$('.'+id).find('video').each(function(index) { 
		if (this.currentTime == 0) this.play();
		/*var i = $('video').index($(this));
		setTimeout("v = $('video').eq("+i+"); if (badVideo(v)) updateVideo($(v).children('object').attr('id'));",10);*/
		// check readyState
		// if (this.readyState == 0) $(this).children('object').unwrap();
	});
	setTimeout("pauseVideo();",0);
	$('#map').empty();
	if (id == 'Z3') return false;
	if (id.charCodeAt(0) < 90) return false;
	
	/////  trackHistory code  ///  could go here, or combined with okeebo.stats.js  /////
	if (trackHistory && !initial) {
		var method = 'pushState';
		if (typeof(window.initial) !== 'undefined' && window.initial) {
			delete window.initial;
			method = 'replaceState';
		}
		if (workspace.length > 1) {
			var hash = '#';
			var $node = $('#meta-map > div');
			for (var i=0; i < workspace.length; ++i) {
					if (i != 0) hash += ',';
					if ($node.eq(i).is('.meta-node')) hash += '*';
					hash += workspace[i];
			}
			history[method](null,null,hash);
		}
		else if (id == 'Z1') {
			if (location.href.search('#') != -1) history[method](null,null,' ');
		}
		else history[method](null,null,'#' + id);
		$('title').html($('.'+id+' h3').text());
	}
	else if (trackHistory) $('title').html($('.'+id+' h3').text());
	/////     /////
	
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
	
	var forum = $('#forum');
	forum.empty();
	
	for (j=i-1; j>=0; --j) {					
		update_last_node_line($('.'+line[j]),alpha-j+1);
		if (line[j+1]) {
			
			if (forum.html()) forum.append(' &nbsp; > &nbsp; ');
			forum.append('<u onclick="concept_zoom_out(' + (j+1) + ',0)">' + $('.'+line[j+1]+' h3').html() + '</u>');
			
			var b = $('.'+line[j+1]+' .in + p').first().attr('id');
			var n = line[j].substr(1);
			b = b.substr(1);
			n = n - b + 1;
			if (j==0) $('#m_'+String.fromCharCode(alpha-j)+n).css({'background-color':a_color,'border-color':a_brdr,'cursor':'default'});
			else $('#m_'+String.fromCharCode(alpha-j)+n).css({'background-color':p_color,'border-color':p_brdr});
		}
	}
	forum.width($('#map').offset().left - forum.offset().left);
	forum.css('top',75-Math.max(forum.height(),19));
	var map = $('#map');
	map.scrollTop(0);
	map.scrollTop(map.children('.row').last().offset().top);
	var rows = map.scrollTop()/12;
	$('#map_helper').empty();
	if (rows > 0) for (var i = 0; i < rows; ++i) $('#map_helper').append('*');
}

function tab_is_unique(obj) {
	var test_index = $('#meta-map > div').index($('.meta-node'));
	for (var i=0; i <= workspace.length; ++i) if ((i != test_index) && (workspace[i] == obj.attr('id'))) return false;
	return true;
}

function concept_zoom_out(dif,adj) {
	if ($('#status').is(':visible')) $('#status').fadeOut();
	if (status_timer) clearTimeout(status_timer);
	var id = $('.inner').filter(':visible').attr('id');
	var old_obj = $('#' + id);
	if (old_obj.css('opacity') != 1 && !old_obj.parent().is('body')) {
		/*$('body').one('hide','.inner,.outer',function(event) {	
			concept_zoom_out(dif,adj);
		});*/
		return false;
	}
	$(window).scrollTop(old_obj.offset().top - 80);
	var target = id;
	for (i=0; i<dif; ++i) target = get_parent_tag(target);
	if (!target) return false;	
	if (adj) {
		var parent_tag = get_parent_tag(target);
		if (parent_tag) {
			y = $('.' + parent_tag + ' > .in + p').first().attr('id');
			y = y.substr(1);
			d = y - (1 - adj);
			target = target.charAt(0) + d;
		}
	}
	var target_obj = $('.' + target);
	
	target_obj.fadeIn();
	old_obj.fadeOut();
	$('object[data*="youtube"]').css('visibility','hidden').filter('.' + target + ' object').css('visibility','');
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
	var number = id.substr(1);
	if ($('.' + letter + number).html()) {
		if ($('#status').is(':visible')) $('#status').fadeOut();
		if (status_timer) clearTimeout(status_timer);
		var old_obj = $('.' + id).parent('.outer');
		if (old_obj.css('opacity') != 1 && !old_obj.parent().is('body')) {
			/*$('body').one('hide','.inner,.outer',function(event) {	
				concept_zoom_in(id);
			});*/
			return false;
		}
		$(window).scrollTop(old_obj.offset().top - 80);
		
		$('.' + letter + number).fadeIn();
		old_obj.fadeOut();
		$('object[data*="youtube"]').css('visibility','hidden').filter('.' + letter + number + ' object').css('visibility','');		
		clean_transition($('.' + letter + number),old_obj);
		//$('.' + letter + number).show();
		//$('.outer').hide();
		$('.' + letter + number).attr('id',letter+number);
		
		size_buttons($('.' + letter + number));
		use_math_plug_in();
		
		if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = letter+number;
		if ($('#info').is(':visible')) $('#map .node').mouseleave();
		
		redraw_node_map(letter+number);
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
	var displace = 0;
	$('.left,.right').height(obj.height());
	var _width = parseInt(obj.css('margin-left'),10)+displace;
	var sidebar_width = $('#sidebar').outerWidth();
	if (sidebar_width) _width -= sidebar_width;
	$('.left,.right').width(_width);
	var pos = obj.outerWidth()+obj.offset().left-displace;
	$('.right').css('left',pos);
	$('.left').css('background-position',(_width - displace)/2);
	$('.right').css('background-position',pos + (_width - displace)/2);
	if (!obj.attr('id')) return false;
	var l = obj.attr('id').charAt(0);
	var n = parseInt(obj.attr('id').substr(1),10);
	if (!$('.'+l+(n-1)).html()) $('.left').css({'cursor':'default','background-image':'none'});
	else $('.left').css({'cursor':'pointer','background-image':''});
	if (!$('.'+l+(n+1)).html()) $('.right').css({'cursor':'default','background-image':'none'});
	else $('.right').css({'cursor':'pointer','background-image':''});
	if (mobile == 1) {
		var linear_buttons = $('.left,.right').css('background-image','none').detach();
		$('body').append(linear_buttons.css('background-image',''));
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
	var hit_n = id.substr(1);
	
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
	
	if ($('#m_' + row).html()) $('#m_' + row).empty();
	else $('#map').append('<div class="row" id="m_' + row + '"></div>');
		
	if (dots = count_children(obj)) {
		$('#m_' + row).css('width',dots*10+'px');
		for (i=1; i<=dots; ++i) $('#m_' + row).append('<div class="node" id="m_' + row + i + '"> </div>');
	}
	else $('#m_' + row).addClass('empty');
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
	if (create) $('body').append('<div id="' + map.substr(1) + '"></div>');
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
			var n1 = _new.substr(3);
			var l0 = _old.charCodeAt(2);
			var n0 = _old.substr(3);
			
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
		var nodes = new Array($('#map .row').index($('#map .row').not('.empty').last())+1);
		for (var i=0; i < nodes.length; ++i) {
			if ($('#map .row').eq(i).width() > $('#map .row').eq(longest_row).width()) longest_row = i;
			nodes[i] = $('#map > .row').eq(i).children('.node').index($('#map > .row').eq(i).children('.node').last()) + 1;
		}
		var max_nodes = nodes[longest_row];
		var multiplier = Math.min(((0.9*$(map).width()/max_nodes)-2)*0.125,((0.6*$(map).height()/nodes.length)-2)*0.125);
		if (!portrait) multiplier=Math.min(((0.9*$('#lm_ok').offset().left/max_nodes)-2)*0.125,((0.7*$(map).height()/nodes.length)-2)*0.125);
		if (create) {
			$(map).append($('#map').html());
			$(map).find('.empty').remove();
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
		var n1 = this.id.substr(3);
		var l0 = old.charCodeAt(2);
		var n0 = old.substr(3);
		var visible_page = $('.inner,.outer').filter(':visible');
		if (l1>l0) $('#lm_info').html(visible_page.children('.in + p').eq(n1-1).children('span').html());
		else {
			var target = visible_page.attr('id');
			for (i=0; i<l0-l1; ++i) target = get_parent_tag(target);
			var _target = get_parent_tag(target);
			if (_target) $('#lm_info').html($('.' + _target + ' > .in + p').eq(n1-1).children('span').html());
			else if (target) $('#lm_info').html($('.' + target + ' > h3').html());
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

function playVideo(index) {
	if (typeof(index) === 'undefined') $('video,object[data*="youtube"]').each(function(index) { playVideo(index); });
	else if (typeof(index) === 'number') {
		var video_html5 = $('video').eq(index)[0];
		var video_flash = $('object[data*="youtube"]').eq(index)[0];
		if (video_html5 && video_html5.play) video_html5.play();
		if (video_flash && video_flash.playVideo) video_flash.playVideo();
	}
}

function pauseVideo(index) {
	if (typeof(index) === 'undefined') $('video,object[data*="youtube"]').each(function(index) { pauseVideo(index); });
	else if (typeof(index) === 'number') {
		var video_html5 = $('video').eq(index)[0];
		var video_flash = $('object[data*="youtube"]').eq(index)[0];
		if (video_html5 && video_html5.pause) video_html5.pause();
		if (video_flash && video_flash.pauseVideo) video_flash.pauseVideo();	
	}
}

function loadVideos() {
	var yt = $('.youtube-embed');
	yt.each(function(i,e) {
		var yt_id = e.id || e.innerHTML;
		$.get('https://www.okeebo.com/video/?id=' + yt_id + '&html5',function(data) {
			yt.eq(i).replaceWith(data);
		}).fail(function() {
			yt.eq(i).replaceWith('<object style="height: 360px; width: 640px;" id="' + yt_id + '" type="application/x-shockwave-flash" data="https://www.youtube.com/v/' + yt_id + '?hl=en_US&amp;version=3&amp;enablejsapi=1&amp;playerapiid=ytplayer&amp;rel=0" height="360" width="640">\n			<param name="movie" value="https://www.youtube.com/v/' + yt_id + '?hl=en_US&amp;version=3&amp;enablejsapi=1&amp;playerapiid=ytplayer&amp;rel=0">\n			<param name="allowFullScreen" value="true">\n			<param name="allowScriptAccess" value="always">\n		</object>');
		});
	});
}
function flashToHTML5() {
	$('object[data*="youtube"]').not('video object').each(function(i,e) {
		$.get('https://www.okeebo.com/video/?id=' + e.id + '&html5',function(data) {
			$('object[data*="youtube"]').eq(i).replaceWith(data);
		});	
	});
}
function degradeToFlash() {
	$('video').each(function(i,v) {
		var $v = $(v);
		if (v.error) $v.replaceWith($v.children('object')[0].outerHTML);
	});
}

function badVideo(video) {
	if (video.readyState == 0 || video.ended && video.currentTime < video.duration) return true;
	else return false;
}

function updateVideo(video_id) {
	$('video').each(function(i,e) {
		var id = $(e).children('object').attr('id');
		if (typeof(video_id) === 'undefined' || video_id == id) $.get('https://www.okeebo.com/video?id=' + id + '&html5',function(data) {
			var vid = jQuery('video').eq(i);
			var spot = vid[0].currentTime;
			if (spot != 0) {
				data = data.replace(/\" type=\"video/g,'#t=' + spot + '" type="video');
				var paused = vid[0].paused;
				vid.replaceWith(data);
				var new_vid = jQuery('#'+id).parent('video');
				new_vid[0].play();
				if (paused) setTimeout('jQuery("video").eq(' + jQuery('video').index(new_vid) + ')[0].pause()',10);
			}
			else vid.replaceWith(data);
		});
	});
}
// if src links are expired *.currentSrc will return undefined


function createIndex(word,times,and) {	
	// Handle word as an array
	if (typeof(word) === 'object') {
		var info = [];
		$.each(word,function(index,value) {			
			var new_info = createIndex(value.toLowerCase(),times);
			if (info.length == 0) info = new_info;
			else {
				var l1 = new_info.length;
				loop1:
				for (var i=0; i<l1; ++i) {
					var new_id = new_info[i].ID;
					var l0 = info.length;
					for (var j=0; j<l0; ++j) {
						if (info[j].ID == new_id) {
							if (and) info[j].hits = Math.min(info[j].hits,new_info[i].hits);
							else info[j].hits += new_info[i].hits;
							continue loop1;
						}
					}
					if (!and) info.push(new_info[i]);
				}
			}
		});
		// Create Index page
		$('.Z3').remove();
		$('body').append('<div class="outer Z3"></div>');
		var Z3 = $('.Z3');
		var title = 'Index: Sections containing "' + word + '"';
		if (typeof(times) === 'number' && times) {
			title += ' ' + times + ' times';
			if (!and) title += ' at least one of them';
		}
		else {
			if (and) title += ' (gcf)';
			else title += ' (sum)';
		}
		Z3.append('<h3>' + title + '</h3>');
	}
	else {
		word = word.toLowerCase();
		// Create Index page
		$('.Z3').remove();
		$('body').append('<div class="outer Z3"></div>');
		var Z3 = $('.Z3');
		var title = 'Index: Sections containing "' + word + '"';
		if (typeof(times) === 'number' && times) title += ' ' + times + ' times';
		else times = 1;
		Z3.append('<h3>' + title + '</h3>');
		
		var info = [];
		// Find pages containing word
		$('.inner')/*.not('.outer')*/.each(function(i) {
			var string = this.innerHTML.toLowerCase();
			var test = string.indexOf(word);
			// Count how many times word appears on page
			for (var j=0; test != -1; ++j) {
				string = string.substr(test+1);
				if (typeof(word) === 'object') {
					$.each(word,function(index,value) {
						var spot = string.indexOf(value);
						if (test == -1 || (spot != -1 && spot < test)) test = spot;
					});
				}
				else test = string.indexOf(word);
			}
			if (j >= times) test = 0;
			if (test != -1) {
				var classes = this.className.split(/\s/);
				var new_id = classes[classes.length-1];
				info.push({ 'ID': new_id, 'hits': j });
			}
		});
	}
	// Sort pages by how many times they contain word
	info.sort(function(a,b) { return b.hits - a.hits; });
	var length = info.length;
	// Put page summaries in index page
	for (var k=0; k < length; ++k) {
		var new_id = info[k].ID;
		if (new_id) {
			// Code for Preview Text
			var obj = $('#' + String.fromCharCode(new_id.charCodeAt(0)-1) + new_id.substr(1)).clone();
			obj.children('.delete,.handle').remove();
			var content = obj.html();
			content = /*'<button class="preview_exit">&times;</button>*/'<p style="margin:0px 6px;">' + content + '</p>';
			content = '<button class="preview_main">*<br/><span>' + info[k].hits + '</span></button>' + /*'<button class="preview_split">&raquo;</button>' +*/ content;
			content = '<div id=_' + new_id +' class="preview_window">' + content + '</div>';
			
			$('.preview_window#_' + new_id).remove();
			Z3.append(content);
		}
	}
	// Go to index page
	var index = workspace.indexOf('Z3');
	if (index != -1) {
		Z3.attr('id','Z3');
		switch_tab(index);
	}
	else explore_tangent('Z3');
	$(window).resize();
	return info;
}

function mathResize() {
	var f = $(window).width() - 24;
	$('.OkeeboMath').each(function(index) {
		var $this = $(this);
		var l = $this.offset().left;
		var s = 1.05;
		do {
			s -= 0.05;
			$this.css('font-size',s+'em');
			var m = 0;
			$this.find('span').each(function(index) { 
				var w = $(this).width(); 
				if (w > m) m = w; 
			}); 
		} while (m > f - l);
	});
}

function spanTable() {
	$('.span-td').replaceWith(function() { return '<td height>' + $(this).html() + '</td>'; });
	$('.span-tr').replaceWith(function() { return '<tr>' + $(this).html() + '</tr>'; });
	$('.span-table').replaceWith(function() { return '<table border="1">' + $(this).html() + '</table>'; });	
}
function tableSpan() {
	$('td').replaceWith(function() { return '<span class="span-td">' + $(this).html() + '</span>' });
	$('tr').replaceWith(function() { return '<span class="span-tr">' + $(this).html() + '</span>' });
	$('table').replaceWith(function() { return '<span class="span-table">' + $(this).html() + '</span>' });	
}

$(document).ready(function(event) {
	$(document).on('keydown',function(event) {
		// F2
		if (event.which == 113) {
			hilite();
			return false;	
		}
		// F7
		if (event.which == 118) {
			alert('Word Count: ' + CountWords());
			return false;
		}
		// F8
		if (event.which == 119) {
			unhilite();	
		}
	});
});

function hilite() {
	// IE doesn't support 'hiliteColor' so have to test for feature and utilize <strong> instead.
	if (document.selection) {
		$('strong').replaceWith(function() { return '<b>' + this.innerHTML + '</b>'; });
		document.execCommand('bold',false,null);
		$('strong').replaceWith(function() { return '<span class="note">' + this.innerHTML + '</span>'; });
		document.selection.empty();
	}
	else {
		var page = $('.inner,.outer').filter(':visible');
		page.attr('contenteditable','true')
		document.execCommand('hiliteColor',false,'#ff8')
		page.removeAttr('contenteditable');
		var sel = document.getSelection();
		if (sel.empty) sel.empty();  // Chrome
		else if (sel.removeAllRanges) sel.removeAllRanges();  // Firefox
	}
	$('span[style*="background-color"]')
		.filter('[style*="rgb(255, 255, 136)"],[style*="rgb(255,255,136)"],[style*="#ff8"],[style*="#FF8"],[style*="#ffff88"],[style*="#FFFF88"]')
		.addClass('note').removeAttr('style');
		
	$('.in > .note').replaceWith(function() { return this.innerHTML; });
	$('.note > .in').unwrap();
	for (var i=0; i<3; ++i) {
		$('.note').filter(':visible').each(function() { 
			var $next = $(this.nextSibling);
			if ($next.is('.note')) $(this).append($next);
		});
		$('.note > .note').replaceWith(function() { return this.innerHTML; });
	}
	
	$('p,.note').filter(':visible').each(function() { $(this).html($(this).html()) });
}

function unhilite() {
	// IE doesn't support 'hiliteColor' so have to test for feature and utilize <strong> instead.
	if (document.selection) {
		$('strong').replaceWith(function() { return '<b>' + this.innerHTML + '</b>'; });
		document.execCommand('bold',false,null);
		$('strong').replaceWith(function() { return '<span class="blank">' + this.innerHTML + '</span>'; });
		document.selection.empty();
	}
	else {
		var page = $('.inner,.outer').filter(':visible');
		page.attr('contenteditable','true')
		document.execCommand('hiliteColor',false,'#fcfcfc')
		page.removeAttr('contenteditable');
		var sel = document.getSelection();
		if (sel.empty) sel.empty();  // Chrome
		else if (sel.removeAllRanges) sel.removeAllRanges();  // Firefox
	}
	$('span[style*="background-color"]')
		.filter('[style*="rgb(252, 252, 252)"],[style*="rgb(252,252,252)"],[style*="#fcfcfc"],[style*="#FCFCFC"]')
		.addClass('blank');
		
	$('.blank .note').replaceWith(function() { return this.innerHTML; });
	$('.note .blank').each(function() {
		var $this = $(this);
		var $prev = $(this.previousSibling);
		var $next = $(this.nextSibling);
		$prev.wrap('<span class="note"></span>');
		$next.wrap('<span class="note"></span>');
		$this.unwrap();
	});
	$('.blank').replaceWith(function() { return this.innerHTML; });
	
	$('p,.note').filter(':visible').each(function() { $(this).html($(this).html()) });
}

function load_next(id) {
	var $id = $('.' + id);
	$id.children('.in + p[id]').each(function() {
			var new_id = String.fromCharCode(this.id.charCodeAt(0) + 1) + this.id.substr(1);
			grab_page(new_id);
		});
	if ($id.is('.inner')) grab_page(get_parent_tag(id));
}
function grab_page(id) {
	var $id = $('.' + id);
	if ($id.has('h3').index() != -1) return false;
	var url = 'https://www.okeebo.com' + window.location.pathname + '?show=' + id;
	$.get(url,function(data) {
		var d = $('<html />').html(data);
		$id.html(d.find('.inner,.outer').html());
		$('.inner').children('h3').not('.out + h3').before('<button class=\'out\' type=\'button\'></button>');
		$('.outer').children('p[id]').not('.in + p[id]').before(function(index) {
			return '<button class=\'in ' + this.id + '\' type=\'button\'></button>';
		});
		$('a.tangent').replaceWith(function() {
			return '<button class=\'' + $(this).attr('class') + '\'>' + $(this).text() + '</button>';
		});
		$('.in').html('+');
		$('.out').html('-');
		
		scrollbar_width = get_scrollbar_width();
		
		resize_windows();
		size_buttons($('.' + id).filter(':visible'));
		
		load_next(id);
	});
}

function cache_note($page) {
	if (!$page) $page = $('.inner,.outer').filter(':visible');
	$page.find('*').removeAttr('style');
	var multiple = false;
	var $node = $page.find('.note');
	if ($node.index() == -1) return false;
	if ($($node[0].parentNode.nextSibling).is('.note')) multiple = true;
	var start = $node.is('.otherNote') ? -1 : $page.html().search($node[0].outerHTML);			// Condition discriminates on notes not from user
	var length = $node.eq(0).replaceWith(function() { return this.innerHTML; }).html().length;
	var array = [start,length];
	if (multiple) for (var i=0; i<2; ++i) $.merge(array,cache_note());
	if (start == -1) return false;
	return array;
}

function cache_specific_note(index, $page) {
	var notes = [];
	var result = cache_note($page);
	while (result) {
		notes.push(result);
		result = cache_note($page);
	}
	result = notes.splice(index,1)[0];
	for (var j = notes.length - 1; j >= 0; --j) make_note_from_cache(notes[j],$page);
	return result;
}

//// non-uniqueness of text values has the potential to make indexOf inaccurate. requires more testing. "else return false;" covers many test cases that would appear from actual UI highlighting.
function make_note_from_cache(cache,$page) {
	var start = Number(cache[0]);
	var length = Number(cache[1]);
	if (!$page) $page = $('.inner,.outer').filter(':visible');
	$page.find('*').removeAttr('style');
	var html = $page.html();
	$page.find('.note').each(function() {
		var spot = html.indexOf(this.outerHTML);
		var len = this.outerHTML.length;
		var displace = len - this.innerHTML.length;
		if (spot == -1) return false;
		if (spot < start + length) {
			if (spot < start && spot + len < start + displace) start += displace;
			else {
				this.outerHTML = this.innerHTML;
				html = $page.html();
				len = this.innerHTML.length;
				length = Math.max(start + length,spot + len);
				start = Math.min(spot,start);
				length -= start;
			}
		}
		else return false;
	});
	if (length != 0) $page.html(html.substr(0,start) + '<span class="note">' + html.substr(start,length) + '</span>' + html.substr(start+length));
	if (cache.length > 2) make_note_from_cache(cache.slice(2), $page);
}

function save_notes() {
	if (!window.localStorage || !window.localStorage.getItem) return false;
	var notes = ($('.note').index() == -1) ? false : {};
	var $body = $('body').clone();
	$body.find('.inner,.outer').has('.note').each(function() {
		var $this = $(this);
		var key = $this.attr('class').split(' ').pop();
		if ($this.find('.note').index() != -1) {
			notes[key] = [];
			$this.find('.note').each(function() {
			//while ($this.find('.note').index() != -1) {
				notes[key].push(cache_note($this));	
			});
		}
	});
	var note_file = window.localStorage.getItem('notes');
	if (note_file) note_file = JSON.parse(note_file);
	else if (!notes) return false;
	else note_file = {};
	if (notes) note_file[window.location.pathname] = notes;
	else delete note_file[window.location.pathname];
	window.localStorage.setItem('notes',JSON.stringify(note_file));
}

function load_notes() {
	if (!window.localStorage || !window.localStorage.getItem) return false;
	var note_file = window.localStorage.getItem('notes');
	if (note_file) {
		note_file = JSON.parse(note_file);
		var notes = note_file[window.location.pathname];
		for (var i in notes) {
			var $page = $('.' + i);
			while (notes[i].length) make_note_from_cache(notes[i].shift(), $page);
		}
	}
}

window.onhashchange = hashChange;

function hashChange(initial) {
	$('.note').replaceWith(function() { return this.innerHTML; });
	if (initial) window.initial = true;
	go_and_note(location.hash.substr(1));
	$('.note').addClass('otherNote');	// Distinguish these notes as not from the user
	load_notes();
	size_buttons($('.inner,.outer').filter(':visible'));
}

function go_and_note(data) {
	if (!data) data = 'Z1';
	if (data == 'Z1' && typeof(window.initial) !== 'undefined' && window.initial) {
		delete window.initial;
		history.replaceState(null, null, ' ');	
	}
	var errorChars = /[^a-zA-Z0-9-_]/g;
	data = data.split('.');
	var new_id = data.shift();
	if (new_id.search(',') != -1) {
		workspace = new_id.split(',');
		$mm = $('#meta-map').eq(0).empty();
		for (var i=0; i < workspace.length; ++i) {
			$mm.append('<div class="_node"> </div>');
			if (workspace[i].charAt(0) == '*') {
				workspace[i] = workspace[i].substr(1);
				var node = i;	
			}
		}
		$mm.add('.exit').show();
		if (typeof(node) === 'undefined') $('._node').last().click();
		else $('._node').eq(node).click();
	}
	else {
		if (workspace.length > 0) {
			$('#meta-map').empty();
			$('.exit').hide();
			while (workspace.length > 0) workspace.pop();
		}
		new_id = new_id.replace(errorChars,'');
		if ($('.' + new_id).index() != -1) go_to($('.inner,.outer').filter(':visible').attr('id'),new_id);
	}
	if (data.length > 0) {
		for (var i in data) make_note_from_cache(data[i].split(','));
		$(window).scrollTop($('.note').eq(0).offset().top - 80);
	}
	delete window.initial;
}

function woop() {

	$(window).on('blur',function() {
		history.replaceState(null,null,'#' + $('.inner,.outer').filter(':visible').attr('id'));
	}).on('focus',function() { 
		history.replaceState(null,null,' ');
	});
	
}

function twitterLink(index) {
	var webpage = 'https://twitter.com/intent/tweet';
	var $page = $('.inner,.outer').filter(':visible').clone();
	var hash = cache_specific_note(index, $page);
	var url = location.href + '#' + $page.attr('id') + '.' + hash;
	var data = {
		screen_name: 'Ben_Pedersen',
		url: url,
		text: 'Comment or question here'
	}
	for (var i in data) webpage += '&' + i + '=' + encodeURIComponent(data[i]);
	console.log(url);
	return webpage.replace('&','?');
	//return 'javascript:window.open(&quot;' + webpage.replace('&','?') + '&quot;, &quot;NewWindow&quot;, &quot;width=100,height=100&quot;);';
}

function tweet(index) {
	if (typeof(twttr) === 'undefined') $('head').append('<script type="text/javascript" src="https://platform.twitter.com/widgets.js"></script>');
	$page = $('.inner,.outer').filter(':visible');
	$page.append('<a href="' + twitterLink(index) + '" id="tweet">Tweet</a>');
	$('#tweet').on('click',function() {
		$(this).remove();
	});
}

function share() {
	if (typeof(twttr) === 'undefined') $('head').append('<script type="text/javascript" src="https://platform.twitter.com/widgets.js"></script>');
	$page = $('.inner,.outer').filter(':visible');
	$page.append('<a href="https://twitter.com/share" class="twitter-share-button" data-lang="en" data-count="none">Tweet</a>');
	if (typeof(twttr) !== 'undefined') twttr.widgets.load();
}

function CountWords(node) {
	var total = 0;
	if (typeof(node) === 'undefined' || node === true) {
		var selected_text = document.getSelection().toString();
		if (selected_text) node = document.createTextNode(selected_text);
		else {
			var new_node = $('.inner,.outer').filter(':visible');
			if (!node) total -= CountWords(new_node.find('h3'));
			node = new_node;
		}
	}
	if (node instanceof jQuery) node = node[0];
	if (node.nodeType == 3) {
		var words = node.textContent.match(/\S+/g);
		if (words) total = words.length;
	}
	else {
		if (node.nodeType == 1 && $(node).is('.in,.out,form')) return 0;
		for (var i in node.childNodes) {
			total += CountWords(node.childNodes[i]);
		}
	}
	return total;
}
