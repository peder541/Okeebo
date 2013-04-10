/*
 * Okeebo Engine JavaScript
 * author: Ben Pedersen
 * 
 */

var ctrl_down=0;
var mouse=0;
var workspace = new Array();
var mouseX;
var scrollbar_width;
var mobile = 0;
var info_timer;
var mobile_timer;
var status_timer;
var different = -1;
var _adjust = 0;
var badIE = false;

function resize_windows(){
	if (!$('#screen2').html()) {
		var w1 = $(window).width();
		var main = $('.inner,.outer').filter(':visible');
		if ($(document).height() > $(window).height()) w1 += scrollbar_width;
		var left_margin = (w1-(900 + scrollbar_width))/2;
		//var _zero = 0;
		var sidebar_width = $('#sidebar').outerWidth();
		if (sidebar_width) {
			left_margin += sidebar_width/2;
			if (left_margin < sidebar_width) left_margin = sidebar_width;
		}
		else sidebar_width = 0;
		if (left_margin < 0) left_margin = 0;
		//if (left_margin > _zero) {
			$('.inner,.outer,.exit,.splitscreen,#meta-map').css('margin-left',left_margin);
			
			//$('.inner').css('margin-left',left_margin);
			//$('.outer').css('margin-left',left_margin);
			
			//$('.exit').css('margin-left',left_margin);
			//$('.splitscreen').css('margin-left',left_margin);
			//$('#meta-map').css('margin-left',left_margin);
				
			$('#map').css('left',Math.max((Math.min(w1-scrollbar_width,900+left_margin)),sidebar_width+Math.min(main.outerWidth(),228))-100);
		//}
		/*
		else {
			$('.inner').css('margin-left',_zero);
			$('.outer').css('margin-left',_zero);
			
			$('.exit').css('margin-left',_zero);
			$('.splitscreen').css('margin-left',_zero);
			$('#meta-map').css('margin-left',_zero);
			
			$('#map').css('left',Math.min(w1-scrollbar_width,900+_zero)-100);
		}
		*/
		/*
		for (var i=0; i<=$('img').index($('img').last()); ++i) {
			var padding = main.css('padding-left');
			padding = parseInt(padding.substr(0,padding.length-2),10);
			var img_width = (w1-scrollbar_width)-2*padding;

			if (img_width < $('img').eq(i).attr('width')) $('img').eq(i).width(img_width);
			else $('img').eq(i).width($('img').eq(i).attr('width'));

		}
		*/
		var max_img_width = w1 - scrollbar_width - 2 * parseInt(main.css('padding-left'),10);
		$('img').width(function(index) { 
			return Math.min(max_img_width,$(this).attr('width'));
		});
	}
	else {
		var height = $(window).height();
		var width = $(window).width();
		if ($(document).height()-height) {
			width += scrollbar_width;
			height += scrollbar_width;
		}
		/*
		if ($(window).height() > $(window).width()) {
			height /= 2;
			$('#screen2').css('left',0);
			$('#screen2').css('top',height);
		}
		else {
			*/
			width /= 2;
			$('#screen2').css({'left':width});
			$('#screen2').css('top',0);
		//}
		$('#screen1').width(width);
		$('#screen2').width(width);		
		$('#screen1').height(height);
		$('#screen2').height(height);
		$('#screen1 > #map').css('left', width - (100 + scrollbar_width));
		$('#screen2 > #map').css('left', width - (100 + scrollbar_width));
	}
};

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
	
	scrollbar_width = get_scrollbar_width();

	resize_windows();
	
	$('body').append('<!--[if lt IE 8]><script type="text/javascript">badIE = true;</script><![endif]-->');
	if (badIE) {
		setTimeout("size_buttons($('.inner,.outer').eq(" + $('.inner,.outer').index($('.inner,.outer').filter(':visible')) + "));",100);
	}
	
	redraw_node_map(0,$('.outer').filter(':visible').attr('id'),0);
	
	/**/
	$(window).mousemove(function(event) {
		mouseX = event.pageX;
	});
	/**/
	
	$(window).on('touchstart',function(event) {
		if (mobile_timer) clearTimeout(mobile_timer);
		mobile = 1;
	});
	/*
	$(document).click(function(event) {
		if (mobile) {
			var top = $('#map').offset().top - 12;
			var left = $('#map').offset().left;
			var height = $('#map').height() + 24;
			var width = 0;
			for (var i=0; i <= $('#map .row').index($('#map .row').last()); ++i) {
				if (width < $('#map .row').eq(i).width()) width = $('#map .row').eq(i).width();
			}
			left += (100-width)/2 - 12;
			width += 24;
			if ((top < event.pageY) && (event.pageY < top + height) && (left < event.pageX) && (event.pageX < left + width)) {
				modify_large_map(1,0);
				return true;
			}
			top = $('#meta-map').offset().top - 10;
			left = $('#meta-map').offset().left - 10;
			height = $('#meta-map').height() + 20;
			width = $('#meta-map').width() + 20;
			if ((top < event.pageY) && (event.pageY < top + height) && (left < event.pageX) && (event.pageX < left + width)) {
				$('#hud span').eq(0).html('meta zone');
				setTimeout("$('#hud span').eq(0).html(' ');",1000);
				return true;
			}
		}
	});
	*/
	$('#map').on('touchstart', function(event) {
		event.preventDefault();
	});
	$('#meta-map').on('touchstart', function(event) {
		event.preventDefault();
	});
	$('#map').on('tap', function(event) {
		if (mobile) {
			//console.log(event.originalEvent.touches[0].pageX);
			//_scale = ($(document).width() + event.originalEvent.touches[0].pageX - 2*$(window).scrollLeft())*0.5/$(document).width();
			modify_large_map(1,0);
			return true;
		}
	});
	$('#meta-map').on('tap', function(event) {
		if (mobile) {
			// Create fullscreen selection
			modify_large_map(1,1);
			
			// Cycles Through Tabs
			//var next_node = $('#meta-map div').index($('#meta-map .meta-node'));
			//if (next_node > $('#meta-map div').index($('#meta-map ._node').last())) next_node = 0;
			//$('#meta-map ._node').eq(next_node).click();
		}
	});
	/**/
	$(window).on('touchend',function(event) {
		mobile_timer = setTimeout('mobile = 0;',400);
	});
	$(window).scroll(function(event) {
		var map = null;
		if ($('#large_map').html()) map = '#large_map';
		if ($('#large_meta').html()) map = '#large_meta';
		if (map) {
			if ($('.inner,.outer').filter(':visible').outerWidth() == $(map).width()) $(map).css({'left':0,'top':$(window).scrollTop()});
			else $(map).css({'left':$(window).scrollLeft(),'top':$(window).scrollTop()});
			//if ($('#large_map').height() != $(window).height() && $('#large_map').height() != window.innerHeight) modify_large_map(0,0);
			//if ($('#large_meta').height() != $(window).height() && $('#large_meta').height() != window.innerHeight) modify_large_map(0,1);
		}
	});
	
	$('.fcs').css('left',$(window).width()-180);
	
	update_last_node_line(0,$('.outer').filter(':visible'),98);
	size_buttons($('.outer').filter(':visible'));
	use_math_plug_in();
	
	$(window).resize(function(event) {
		$('body').css('overflow-x','hidden');
		resize_windows();
		if ($('body').css('overflow-y')=='hidden') $('body').css('overflow-y','auto');
		
		if ($('#screen2').html()) {
			size_buttons($('#screen1 > div'));
			size_buttons($('#screen2 > div'));
		}
		else {
			current = $('.inner').filter(':visible');
			if (!current.html()) current = $('.outer').filter(':visible');
			size_buttons(current);
		}
		if ($('#large_map').html()) modify_large_map(0,0);
		if ($('#large_meta').html()) modify_large_map(0,1);
		use_math_plug_in();
		
		if ($('#status').is(':visible')) {
			var current_div = $('.inner,.outer').filter(':visible');
			$('#status').css('left',parseInt(current_div.css('margin-left'),10)+current_div.outerWidth()*0.5-$('#status').outerWidth()*0.5);
		}
		if ($(document).width() > $(window).width()) $('body').css('overflow-x','auto');
	});
	
	// Meta Tooltip
	$('#meta-map').on('mouseenter','div',function(event) {
		if (mobile) return true;
		$('#info').html($('.' + workspace[$('#meta-map div').index($(this))] + ' h3').html());
		$('#info').css({'right':'auto','left':10});
		$('#info').css('top',7);
		info_timer = setTimeout("$('#info').show()",500);
	});	
	// Tooltip
	$('#map').on('mouseenter','.node',function(event) {
		if (mobile) return true;
		var mode = 0;
		if ($(this).parent().parent().parent().attr('id') == 'screen1') mode = 1;
		if ($(this).parent().parent().parent().attr('id') == 'screen2') mode = 2;
		var prefix = '';
		if (mode > 0) prefix = '#screen' + mode + ' ';
		var old = $(prefix + '.node').filter(function() { 
			return ( $(this).css('background-color') == 'rgb(85, 85, 85)' || $(this).css('background-color') == '#555' ); 
		}).attr('id');
		var l1 = this.id.charCodeAt(2);
		var n1 = this.id.substr(3,this.id.length-3);
		var l0 = old.charCodeAt(2);
		var n0 = old.substr(3,old.length-3);
		if (l1>l0) {
			$('#info').html($(prefix + '.outer').filter(':visible').children('.in + p').eq(n1-1).children('span').html());
		}
		else {
			t = $(prefix + '.inner').filter(':visible').attr('id');
			if (!t) t = $(prefix + '.outer').filter(':visible').attr('id');
			for (i=0; i<l0-l1; ++i) t = get_parent_tag(t);
			if (s = get_parent_tag(t)) $('#info').html($('.'+s+' p').eq(n1-1).children('span').html());
			else $('#info').html($('.'+t+' h3').html());
		}
		//pos=$(this).position();
		//l=$('#map').position().left;
		//w=$('#info').width();
		if (mode == 0) $('#info').css({'left':'auto','right':10});
		if (mode == 1) $('#info').css({'left':'auto','right':$('#screen2').width()+27});
		if (mode == 2) $('#info').css({'left':'auto','right':27});
		$('#info').css('top',7);
		info_timer = setTimeout("$('#info').show()",500);
		
		//$('#info').show();
	});

	$('#map,#meta-map').on('mouseleave','div',function(event) {
		if (info_timer) clearTimeout(info_timer);
		$('#info').hide();
	});

	// Making Node Map Interactive
	$('#map').on('click','.node',function(event) {
		if (mobile) return true;
		var mode = 0;
		var prefix = '';
		if ($(this).parent().parent().parent().attr('id') == 'screen1') mode = 1;
		if ($(this).parent().parent().parent().attr('id') == 'screen2') mode = 2;
		if (mode > 0) prefix = '#screen' + mode + ' ';
		var old = $(prefix + '.node').filter(function() { 
			return ( $(this).css('background-color') == 'rgb(85, 85, 85)' || $(this).css('background-color') == '#555' ); 
		}).attr('id');
		var l1 = this.id.charCodeAt(2);
		var n1 = this.id.substr(3,this.id.length-3);
		var l0 = old.charCodeAt(2);
		var n0 = old.substr(3,old.length-3);
		
		$('.node').mouseleave();						// Clear Tooltip
		setTimeout("$('.node').mouseleave()",250);		// Keep it clear
		
		// zoom in		
		if (l1>l0) return concept_zoom_in(mode,$(prefix + '.outer').filter(':visible').children('.in + p').eq(n1-1).attr('id'));
		
		else {
			// zoom out
			if (l1<l0) return concept_zoom_out(mode,l0-l1,n1);
			
			// linear move
			else if (n1!=n0) return linear_move(mode,$(prefix + '.inner').filter(':visible').attr('id'),38-(n0-n1),mode);
		}
	
	});
	/**/
	
	/*
	$('.outer p').mouseenter(function(event) {
		//if (ctrl_down) $(this).css('border','thin solid #000');
		if (ctrl_down) $(this).css('border-color','#AAA');
		mouse=this;
	});
	
	$('.outer p').mouseleave(function(event) {
		//$(this).css('border','none');
		$(this).css('border-color','#DDD');
		mouse=0;
	});
	
	$(document).keydown(function(event) {
		// Ctrl Key
		if (event.which==17 && ctrl_down==0) {
			ctrl_down = 1;
			//$('.outer p').css('border-top','1px solid #DDD');
			//$('.outer p').css('padding-top','4px');
			//$('.outer p').css('box-shadow','0px 0px 6px #000');
			if (mouse) $(mouse).mouseenter();
		}
	});
	*/
	
	$(document).keyup(function(event) {	
	
		// Spacebar
		if (event.which==32) {
			//pivot();
			//return;
			//return false;
			//alert('Child = ' + $('.inner').filter(':visible').attr('id') + '\nParent = ' + get_parent_tag($('.inner').filter(':visible').attr('id')));
			
			/*
			// Find Class Link of All Ancestors	
			var r = new Array();
			var id = new Array();
			var target = $('.inner').filter(':visible');
			if (!target.html()) target = $('.outer').filter(':visible');
			
			//use_math_plug_in();
			
			// return false;
			
			//go_to(0,target.attr('id'),prompt('Where would you like to go?',target.attr('id')));
			
			//return false;
			
			r = ancestors(target.attr('id'),'',2);
			alert(r);
			id = r.split(',');
			var msg = '';
			var path = new Array();
			for (i=0; i<id.length; ++i) {
				/*		Just Tags		*//*
				if (id[i]=='Z1') msg = msg + '\n' + id[i];
				else msg = msg + ' ' +id[i]		*/
				/*		Headings		*//*
				if (id[i]=='Z1') {
					if (msg) alert(msg);
					msg = '';
				}
				msg = msg + '\n' + $('.'+id[i]+' h3').html();
				/**/
			//}
			//alert(msg);
		}
		
		// Ctrl Key
		//if (event.which==17 && ctrl_down==1) {
			//ctrl_down=0;
			//$('.outer p').css('border-top','none');
			//$('.outer p').css('padding-top','5px');
			//$('.outer p').css('box-shadow','none');
			//if (mouse) $(mouse).css('border','none');
			//if (mouse) $(mouse).css('border-left-color','#DDD');
		//}
	
		//	Linear Move.  37 is Left.  39 is Right.
		if (event.which==37 || event.which==39) {
			if ($('.edit').is(':focus') || $('[contenteditable]').is(':focus')) return false;
			var mode = 0;
			if ($('#screen2').html()) {
				if (mouseX < $(window).width()/2) mode = 1;
				else mode = 2;
			}
			if (event.ctrlKey || event.altKey || event.shiftKey) {		// Which key should it be?
				var prefix = '';
				var type = 'meta-node';
				if (mode > 0) prefix = '#screen' + mode + ' ';
				if (mode == 2) type = 'split-node';
				var next_node = $(prefix + '#meta-map div').index($(prefix + '.' + type))-(38-event.which);
				if (next_node >= 0) switch_tab(mode,next_node);
				return false;
			}
			if (mode == 0) linear_move(0,$('.inner,.outer').filter(':visible').attr('id'),event.which,1);
			else linear_move(mode,$('#screen' + mode + ' > div').attr('id'),event.which,1);
		}
		
	});
	
	//  Enable Swipe Gesture
	$('body').on('swipe',function(event) {
		if ($('#large_map').html() || $('#large_meta').html()) return false;
		/**/
		var mode = 0;
		if ($('#screen2').html()) {
			if (event.position.x < $(window).width()/2) {
				if (event.position.x - event.distanceX < $(window).width()/2) mode = 1;
				else return false;
			}
			else if (event.position.x - event.distanceX > $(window).width()/2) mode = 2;
			else return false;
		}
		var prefix = '';
		if (mode > 0) prefix = '#screen' + mode + ' ';
		// One Finger Swipe for Linear Move
		if (event.touches.length == 0) {				// For some reason the swipe gesture registers a single finger as 0
			var current_id = $(prefix + '.inner,' + prefix + '.outer').filter(':visible').attr('id');
			if (event.direction == 'right') linear_move(mode,current_id,37,1);
			if (event.direction == 'left') linear_move(mode,current_id,39,1);
		}
		// Two Finger Swipe for Changing Tabs
		//if (event.touches.length == 1) {				// For some reason the swipe gesture registers two fingers as 1
		//	var type = 'meta-node';	
		//	if (mode == 2) type = 'split-node';
		//	var next_node = $(prefix + '#meta-map div').index($(prefix + '.' + type));
		//	if (event.direction == 'right') next_node -= 1;
		//	if (event.direction == 'left') next_node -= -1;
		//	if (next_node >= 0) switch_tab(mode,next_node);
		//}
		/**/
	});
	
	// Linear_Move by clicking on sides of screen
	$(document).on('click','.left',function(event) {
		if (!$('#screen2').html()) linear_move(0,$('.inner,.outer').filter(':visible').attr('id'),37,1);
		else {
			var mode;
			if (event.pageX < $(window).width()/2) mode = 1;
			else mode = 2;
			linear_move(mode,$('#screen' + mode + ' > div').eq(0).attr('id'),37,1);
		}
	});
	$(document).on('click','.right',function(event) {
		if (!$('#screen2').html()) linear_move(0,$('.inner,.outer').filter(':visible').attr('id'),39,1);
		else {
			var mode;
			if (event.pageX < $(window).width()/2) mode = 1;
			else mode = 2;
			linear_move(mode,$('#screen' + mode + ' > div').eq(0).attr('id'),39,1);
		}
	});
	/*
	$(window).click(function(event) {
		var mode = 0;
		if ($('#screen2').html()) {
			if (mouseX < $(window).width()/2) mode = 1;
			else mode = 2;
		}
		if (mouseX != event.pageX) {
			mouseX = event.pageX;
			return false;
		}
		if (mode == 0) {
			var current_div = $('.outer').filter(':visible');
			if (!current_div.html()) current_div = $('.inner').filter(':visible');
			var margin = parseFloat(current_div.css('margin-left'));
			var adjust = 0;
			if (event.pageY > 80) adjust = 24;
			if (mouseX < margin + adjust) linear_move(0,current_div.attr('id'),37,1);
			else if(mouseX > current_div.outerWidth() + margin - adjust) linear_move(0,current_div.attr('id'),39,1);
		}
	});
	*/
	
	// Use to Customize Scrollbars for Splitscreen
	/*
	$(window).mousewheel(function(event, delta) {
		var mode = 0;
		if ($('#screen2').html()) {
			if (mouseX < $(window).width()/2) mode = 1;
			else mode = 2;
		}
		if (mode > 0) $('#screen' + mode).scrollTop($('#screen' + mode).scrollTop()-delta*$(window).height()/20);
	});
	*/
	
	/*
	// Conceptual Zoom Out																
	$('.inner').click(function(event) {
		if (event.altKey) {
			return concept_zoom_out(0,1,0);
		}
	});

	// Conceptual Zoom In																
	$('.outer p').click(function(event) {
		if (event.ctrlKey) return concept_zoom_in(0,this.id);
	});
	*/
	
	/*
	$('.in').mouseenter(function(event) {
		var id = this.className.split(' ')[1];
		id = String.fromCharCode(id.charCodeAt(0)+1)+id.substr(1,id.length-1);;
		$('.preview').html($('.'+id).html());
		$('.preview').show();
	});
	$('.in').mouseleave(function(event) {
		$('.preview').hide();
		$('.preview').empty();
	});
	*/
	
	// Would prefer:
	// $('.inner,.outer').on('click','button',function(event) {	
	// However, then Opera highlights the .inner and .outer elements whenever clicked
	$(document).on('click','.inner button,.outer button',function(event) {				
		var type = this.className.split(' ')[0];
		var mode = 0;
		if ($(this).parent().parent().attr('id') == 'screen1') mode = 1;
		if ($(this).parent().parent().attr('id') == 'screen2') mode = 2;
		
		// Conceptual Zoom In
		if (type == 'in') return concept_zoom_in(mode,this.className.split(' ')[1]);
		// Conceptual Zoom Out
		if (type == 'out') return concept_zoom_out(mode,1,0);
		
		//if (type == 'expand') {
			
			/*
			// Method 1
			if ($(this).parent('p').children('div').html()) {
				$(this).parent('p').children('div').remove();
				$(this).html('+');
			}
			else {
				$(this).html('-');
				$(this).parent('p').append('<div style="border:1px solid #000; margin: 15px; padding: 0px 15px">' + $('.d7').html() + '</div>');
			}
			*/
			
			/*
			// Method 2
			window.open('okeebo.html#d1');
			// has code for when page loads
			// has code for an event change
			*/
			
			/*
			// Method 3
			var old_obj = $('.inner').filter(':visible');
			if (!old_obj.html()) old_obj = $('.outer').filter(':visible');
			go_to(0,old_obj.attr('id'),'d7');
			$('.focus').show();
			workspace.push(old_obj.attr('id'));
			if (workspace.length > 1) {
				$('.label').html('('+workspace.length+')');
				$('.label').show();
			}
			// has code for new button type
			// uses a new global variable called workspace
			*/
		//}
		
		/*
		// Method 3 (new button type)
		if (type == 'focus') {
			var old_obj = $('.inner').filter(':visible');
			if (!old_obj.html()) old_obj = $('.outer').filter(':visible');
			go_to(0,old_obj.attr('id'),workspace.pop());
			if (workspace.length == 0) {
				$('.focus').hide();
			}
			if (workspace.length == 1) $('.label').hide();
			if (workspace.length > 1) {
				$('.label').html('('+workspace.length+')');
				$('.label').show();
			}
		}
		*/
		
		if (type == 'preview_split') {
			var mode = 0;
			if ($(this).parent().parent().parent().attr('id') == 'screen1') mode = 1;
			if ($(this).parent().parent().parent().attr('id') == 'screen2') mode = 2;
			
			var new_id = $(this).parent().attr('id');
			new_id = new_id.substr(1,new_id.length-1);
			if (mode > 0) {
				var preview_offset = $(this).parent().offset().top;
				if (preview_offset < 0) $('#screen' + mode).scrollTop(preview_offset + $('#screen' + mode).scrollTop());
			}
			$(this).parent().remove();
			var old_scrollTop = Math.max($(window).scrollTop() - 80,0);
			var doc_height = $(document).height() - 80;
			//var percent_scroll = $(window).scrollTop() / ($(document).height() - $(window).height());		// Calculate Scroll Adjustment
			explore_tangent((mode*2)%3, new_id);
			
			if (mode == 0) {
				$('.splitscreen').click();
				$('#screen1').scrollTop(old_scrollTop * $('#screen1 div').eq(0).height() / doc_height + 80);
				//$('#screen1').scrollTop(percent_scroll * $('#screen1').height());			// Adjust Screen 1 in Splitscreen Mode
			}
			return false
		}
		
		if (type == 'preview_exit') {
			var mode = 0;
			if ($(this).parent().parent().parent().attr('id') == 'screen1') mode = 1;
			if ($(this).parent().parent().parent().attr('id') == 'screen2') mode = 2;
			var preview_offset = $(this).parent().offset().top;
			if (mode > 0 && preview_offset < 0) $('#screen' + mode).scrollTop(preview_offset + $('#screen' + mode).scrollTop());
			if (mode == 0 && preview_offset < $(window).scrollTop()) $(window).scrollTop(preview_offset);
			var obj = $(this).parent().parent();
			$(this).parent().remove();
			size_linear_buttons(mode,obj);
		}
		
		if (type == 'preview_main') {
			var mode = 0;
			if ($(this).parent().parent().parent().attr('id') == 'screen1') mode = 1;
			if ($(this).parent().parent().parent().attr('id') == 'screen2') mode = 2;
			
			var new_id = $(this).parent().attr('id');
			new_id = new_id.substr(1,new_id.length-1);
			explore_tangent(mode, new_id);
	
			$(this).parent().remove();
			return false;
		}
		
		// Name was previously 'more'. Essentially acts as a preview/link in the app and preserves the original functionality of <a>
		if (type == 'tangent') {
			var mode = 0;
			if ($(this).parent().parent().parent().attr('id') == 'screen1') mode = 1;
			if ($(this).parent().parent().parent().attr('id') == 'screen2') mode = 2;
			
			var new_id = this.className.split(' ')[1].substr(1,this.className.split(' ')[1].length-1);
			
			//
			//
			// Work-in-Progress Code for Preview Text		// Start Point
			
			/**/
			var content = $('#' + String.fromCharCode(new_id.charCodeAt(0)-1) + new_id.substr(1,new_id.length-1)).html();
			content = '<button class="preview_exit">&times;</button><p style="margin:0px 6px;">' + content + '</p>';
			content = '<button class="preview_main">*</button>' + /*'<button class="preview_split">&raquo;</button>' +*/ content;
			content = '<div id=_' + new_id +' class="preview_window">' + content + '</div>';
			
			if (!$('.preview_window').html()) {
				$(this).parent().after(content);
				size_preview_buttons();
				size_linear_buttons(mode,$(this).parent().parent());
			}
			
			var prefix = 'html, body';
			var current_screen = window;
			if (mode > 0) {
				prefix = '#screen' + mode;
				current_screen = '#screen' + mode;
			}
			
			var button_top = $(this).offset().top;
			var show_end = $('.preview_window').offset().top + $('.preview_window').height() - $(current_screen).height() + 15;
			if (mode > 0) {
				button_top += $(prefix).scrollTop();
				show_end += $(prefix).scrollTop();
			}
			if (show_end < button_top) {
				if (show_end > $(current_screen).scrollTop()) $(prefix).animate({'scrollTop':show_end});
			}
			else $(prefix).animate({'scrollTop':button_top});
			
			
			/*
			var parent_top = $(this).parent().offset().top - $(window).scrollTop();
			var button_top = $(this).offset().top - $(window).scrollTop();
			
			if (Math.round(Math.abs(parent_top-$(window).height()/2)) > Math.round(Math.abs(button_top-$(window).height()/2))) {
				$(this).parent().after(content);
			}
			
			else {
				$(this).parent().before(content);
			}
			*/
			
			return false;				// End Point
			//
			//
			
			explore_tangent(mode, new_id);
	
			return false;
		}
		
	});
	
	$('.exit').on('click',function() {
		var mode = 0;
		var prefix = '';
		var type = 'meta-node';
		if ($(this).parent().attr('id') == 'screen1') mode = 1;
		if ($(this).parent().attr('id') == 'screen2') mode = 2;
		if (mode > 0) prefix = '#screen' + mode + ' ';
		if (mode == 2) type = 'split-node';
		var old_workspace = $(prefix + '#meta-map div').index($(prefix + '.' + type));
		var old_obj = $(prefix + '.inner').filter(':visible');
		if (!old_obj.html()) old_obj = $(prefix + '.outer').filter(':visible');
		var old_id = old_obj.attr('id');
		for (var i=old_workspace; i < workspace.length-1; ++i) workspace[i] = workspace[i+1];
		workspace.pop();
		var new_id = workspace[old_workspace];
		if (!new_id) new_id = workspace[--old_workspace];
		$('.' + type).remove();
		
		// Comment out for Clean Meta-Map.
		if (old_workspace == $(prefix + ' #meta-map div').index($(prefix + ' .' + Array('meta-node','split-node')[mode%2]))) {
			if (old_workspace == 0) new_id = workspace[++old_workspace];
			else new_id = workspace[--old_workspace];
		}
		
		$(prefix + '#meta-map div').eq(old_workspace).attr('class',type);
		if (mode > 0) $('#screen' + (3 - mode) + ' #meta-map div').eq(old_workspace).attr('class',type);
		go_to(mode,old_id,new_id);
		if (workspace.length == 1) {
			if (mode > 0) $('#screen' + (3 - mode) + ' .mainscreen').click();
			$('.exit').hide();
			$('.splitscreen').hide();
			$('#meta-map').hide();
		}
	});
	
	/*
	$('.mainscreen').on('click',function() {
		mode = 1;
		if ($(this).parent().attr('id') == 'screen2') mode = 2;
		var space = new Array(2);
		space[0] = $('#screen1 #meta-map div').index($('#screen1 .meta-node'));
		space[1] = $('#screen2 #meta-map div').index($('#screen2 .split-node'));
		var id = new Array(2);
		id[0] = workspace[space[0]];
		id[1] = workspace[space[1]];
		if (!id[0] || !$('#screen1 div').eq(0).hasClass(id[0])) {
			id[0] = $('#screen1 div').eq(0).attr('class');
			var temp_id = id[0].split(' ')[1];
			if (temp_id != 'inner') id[0] = temp_id;
			else id[0] = id[0].split(' ')[2];
			if (id[0]) workspace[space[0]] = id[0];
			else workspace.push(id[0]);
		}
		if (!id[1] || !$('#screen2 div').eq(0).hasClass(id[1])) {
			id[1] = $('#screen2 div').eq(0).attr('class');
			var temp_id = id[1].split(' ')[1];
			if (temp_id != 'inner') id[1] = temp_id;
			else id[1] = id[1].split(' ')[2];
			if (id[1]) workspace[space[1]] = id[1];
			else workspace.push(id[1]);
		}
		$('.' + id[mode-1]).show();
		$('.' + id[0]).attr('id',id[0]);
		$('.' + id[1]).attr('id',id[1]);
		//$('.' + id[0]).css('width','auto');
		//$('.' + id[1]).css('width','auto');
		$('#screen1').remove();
		$('#screen2').remove();
		size_buttons($('.' + id[0]));
		size_buttons($('.' + id[1]));
		$('.exit').show();
		$('.splitscreen').show();
		$('#meta-map').show();
		// Could be removed it Mainscreen Meta-Map is fully maintained during Splitscreen mode
		$('#meta-map').eq(0).empty();
		for (var i=0; i < workspace.length; ++i) $('#meta-map').eq(0).append('<div class="_node"> </div>');
		$('#meta-map').eq(0).children('div').eq(space[mode-1]).attr('class','meta-node');
		//
		$('#map').show();
		redraw_node_map(0,id[mode-1],0);
		$('#meta-map div').attr('class','_node');
		$('#meta-map div').eq(space[mode-1]).attr('class','meta-node');
		resize_windows();
	});
	
	//// Utilize the method .clone(true) to copy content and event handlers
	$('.splitscreen').on('click',function() {
		var old_obj = $('.inner').filter(':visible');
		if (!old_obj.html()) old_obj = $('.outer').filter(':visible');
			
		old_obj.hide();
		$('#meta-map').hide();
		$('#map').hide();
		$('.exit').hide();
		$('.splitscreen').hide();
		$('.left').hide();
		$('.right').hide();
			
		var first_obj;
		if ($('#meta-map div').index($('.meta-node')) == 0) {
			first_obj = $('.' + workspace[1]);
			$('.meta-node').attr('class','split-node');
			$('#meta-map div').eq(1).attr('class','meta-node');
		}
		else {
			first_obj = $('.' + workspace[0]);
			$('.meta-node').attr('class','split-node');
			$('#meta-map div').eq(0).attr('class','meta-node');
		}
			
		var width = $(window).width();
		width /= 2;
			
		for (var i=1; i<=2; ++i) {
			if (i==1) var obj = first_obj;
			if (i==2) var obj = old_obj;
			
			// Main Content
			$('body').append('<div id="screen' + i + '"><div></div></div>');		// $('body').append('<div id="screen' + i + '"></div>');
			$('#screen' + i + ' > div').html(obj.html());							// obj.clone(true).appendTo('#screen' + i');
			$('#screen' + i + ' > div').attr('class',obj.attr('class'));
			$('#screen' + i + ' > div').attr('id',obj.attr('id'));
			// Modify CSS rule to have 'overflow':'hidden' to customize scrollbars for splitscreen mode
			$('#screen' + i).css({'position':'absolute','width':width,'height':$(window).height(),'overflow-y':'scroll'});
			$('#screen' + i).css({'left':(i-1)*width,'top':0});
			$('#screen' + i + ' > div').css('display','block');
			// New Linear Buttons for Splitscreen Mode
			$('#screen' + i).append('<div class="left"> </div><div class="right"> </div>');
			size_buttons($('#screen' + i + ' > div'));
			
			// Utility Buttons
			$('#screen' + i).append('<button class="exit">&times;</button>');
			$('#screen' + i + ' > button.exit').css({'margin-left':0,'display':'block'});
			$('#screen' + i).append('<button class="mainscreen">*</button>');
			$('#screen' + i + ' > button.mainscreen').css({'margin-left':0,'display':'block'});
			
			// Meta-Map
			$('#screen' + i).append('<div></div>');
			$('#screen' + i + ' > div').eq(3).html($('#meta-map').html());
			$('#screen' + i + ' > div').eq(3).attr('id','meta-map');
			$('#screen' + i + ' > div').eq(3).css({'margin-left':0,'display':'block'});
				
			// Map
			$('#screen' + i).append('<div></div>');
			//$('#screen' + i + ' > div').eq(4).html($('#map').html());	
			$('#screen' + i + ' > div').eq(4).attr('id','map');
			$('#screen' + i + ' > div').eq(4).css({'left':width - (100 + scrollbar_width),'display':'block'});
			redraw_node_map(i,obj.attr('id'),0);
		}
		
		// Add for Clean Meta-Map.  Comment out these 2 lines to show other window as a light color in the map.
		//$('#screen1 .split-node').attr('class','_node');
		//$('#screen2 .meta-node').attr('class','_node');	
		
		/// Comment out for Clean Meta-Map.  Swapping sides is only necessary when both windows are depicted in each meta-map.
		$('#screen1').on('click','.split-node',function(event) {
			swap_sides();
		});
		$('#screen2').on('click','.meta-node',function(event) {
			swap_sides();
		});
		///		
	});
	*/
	
	$('#meta-map').on('click','._node',function(event) {
		if (mobile) return true;
		var mode = 0;
		if ($(this).parent().parent().attr('id') == 'screen1') mode = 1;
		if ($(this).parent().parent().attr('id') == 'screen2') mode = 2;
		switch_tab(mode,$(this).parent().children('div').index($(this)));
	});
	
	// It's preferrable for links to have their original functionality.  Therefore, this code has been moved to the 'Tangent' button.
	//$('.inner,.outer').on('click','a',function(event) {
		/*
		var mode = 0;
		if ($(this).parent().parent().parent().attr('id') == 'screen1') mode = 1;
		if ($(this).parent().parent().parent().attr('id') == 'screen2') mode = 2;
		var prefix = '';
		if (mode > 0) prefix = '#screen' + mode + ' ';
		
		var old_obj = $(prefix + '.inner').filter(':visible');
		if (!old_obj.html()) old_obj = $(prefix + '.outer').filter(':visible');
		
		var new_id = this.className.substr(1,this.className.length-1);
		
		//$('.focus').show();
		
		if (workspace.length == 0) workspace.push(old_obj.attr('id'));
		else workspace[$(prefix + '#meta-map div').index($(prefix + '.meta-node'))] = old_obj.attr('id');
		workspace.push(new_id);
		
		$('#meta-map').eq(0).empty();
		for (var i=0; i < workspace.length; ++i) $('#meta-map').eq(0).append('<div class="_node"> </div>');
		if (mode == 0) {
			$('.exit').show();
			$('.splitscreen').show();
			$('#meta-map').show();
			$('._node').eq(i-1).attr('class','meta-node');
		}
		
		if (mode > 0) {
			var type = 'meta-node';
			if (mode == 2) type = 'split-node';
			for (var j=1; j<=2; ++j) {
				$('#screen' + j + ' #meta-map').append('<div class="_node"> </div>');
				$('#screen' + j + ' .' + type).attr('class','_node');
				$('#screen' + j + ' div').eq(i+1).attr('class',type);			// Comment out for Clean Meta-Map
			}
			//$('#screen' + mode + ' div').eq(i+1).attr('class',type);		// Add for Clean Meta-Map
		}
		
		go_to(mode,old_obj.attr('id'),new_id);
		
		/*
		if (workspace.length > 1) {
			$('.label').html('('+workspace.length+')');
			$('.label').show();
		}
		*/
		
		//return false;
	//});
	
	/*
	// Method 3 (more code for new button type)
	$('.inner,.outer').on('mouseenter','.focus',function(event) {
		redraw_node_map(0,workspace[workspace.length-1],1);
		$('.node').css({'border-color':'#555'});
	});
	$('.inner,.outer').on('mouseleave','.focus',function(event) {
		current = $('.inner').filter(':visible');
		if (!current.html()) current = $('.outer').filter(':visible');
		redraw_node_map(0,current.attr('id'),0);
		$('.node').css({'border-color':'#000'});
	});
	*/
	
	/*
	// Method 2 (event change portion)
	window.onhashchange = function() {
		var spot = location.hash;
		if (spot) {
			var old_obj = $('.inner').filter(':visible');
			if (!old_obj.html()) old_obj = $('.outer').filter(':visible');
			go_to(0,old_obj.attr('id'),spot.substr(1,spot.length-1));
		}
	}
	*/
	
});

function switch_tab(mode,new_workspace) {
	if (new_workspace >= workspace.length) return false;
	var type = 'meta-node';
	if (mode == 2) type = 'split-node';
	var prefix = '';
	if (mode > 0) prefix = '#screen' + mode + ' > ';
	var old_obj = $(prefix + '.inner').filter(':visible');
	if (!old_obj.html()) old_obj = $(prefix + '.outer').filter(':visible');
	var old_workspace = $(prefix + '#meta-map div').index($(prefix + '#meta-map .' + type));
	if (workspace.length == old_workspace) workspace.push(old_obj.attr('id'));
	else workspace[old_workspace] = old_obj.attr('id');
	$('.' + type).attr('class','_node');
	$('#meta-map div').eq(new_workspace).attr('class',type);
		
	// Adjusts other window's meta-map.  Comment out for Clean Meta-Map
	if (mode > 0) $('#screen' + (3 - mode) + ' > #meta-map div').eq(new_workspace).attr('class',type);
	
	// Add for Clean Meta-Map. Allows proper viewing of same tab in both windows but prematurely updating workspace.
	//if ((mode > 0) && (!$('#screen' + (3 - mode) + ' > #meta-map div').eq(new_workspace).hasClass('_node'))) {
	//	workspace[new_workspace] = $('#screen' + (3 - mode) + ' > div').eq(0).attr('id');
	//}
		
	go_to(mode,workspace[old_workspace],workspace[new_workspace]);	
}

function explore_tangent(mode,new_id) {
	var prefix = '';
	if (mode > 0) prefix = '#screen' + mode + ' ';
		
	var old_obj = $(prefix + '.inner').filter(':visible');
	if (!old_obj.html()) old_obj = $(prefix + '.outer').filter(':visible');
	
	if (workspace.length == 0) workspace.push(old_obj.attr('id'));
	else workspace[$(prefix + '#meta-map div').index($(prefix + '.meta-node'))] = old_obj.attr('id');
	workspace.push(new_id);
	
	$('#meta-map').eq(0).empty();
	for (var i=0; i < workspace.length; ++i) $('#meta-map').eq(0).append('<div class="_node"> </div>');
	if (mode == 0) {
		$('.exit').show();
		//$('.splitscreen').show();
		$('#meta-map').show();
		$('._node').eq(i-1).attr('class','meta-node');
	}
	
	if (mode > 0) {
		var type = 'meta-node';
		if (mode == 2) type = 'split-node';
		for (var j=1; j<=2; ++j) {
			$('#screen' + j + ' #meta-map').append('<div class="_node"> </div>');
			$('#screen' + j + ' .' + type).attr('class','_node');
			$('#screen' + j + ' #meta-map div').eq(i-1).attr('class',type);			// Comment out for Clean Meta-Map
		}
		//$('#screen' + mode + ' #meta-map div').eq(i-1).attr('class',type);		// Add for Clean Meta-Map
	}
	
	$(window).scrollTop(0);
	go_to(mode,old_obj.attr('id'),new_id);
}

function swap_sides() {
	var old_space = new Array(2);
	old_space[0] = $('#screen1 #meta-map div').index($('#screen1 .meta-node'));
	old_space[1] = $('#screen2 #meta-map div').index($('#screen2 .split-node'));
	
	var old_id = new Array(2);
	old_id[0] = workspace[old_space[0]];
	old_id[1] = workspace[old_space[1]];
	
	if (!old_id[0] || !$('#screen1 > div').eq(0).hasClass(old_id[0])) {
		old_id[0] = $('#screen1 > div').eq(0).attr('id');
		workspace[old_space[0]] = old_id[0];
	}
	if (!old_id[1] || !$('#screen2 > div').eq(0).hasClass(old_id[1])) {
		old_id[1] = $('#screen2 > div').eq(0).attr('id');
		workspace[old_space[1]] = old_id[1];
	}
	
	for (var j=0; j<=1; ++j) {
		$('#screen' + j).scrollTop(0);
		$('#screen' + j + ' > div').eq(0).html($('.' + old_id[1-j]).html());
		$('#screen' + j + ' > div').eq(0).attr('id',workspace[old_space[1-j]]);
		$('#screen' + j + ' > div').eq(0).attr('class',$('.'+workspace[old_space[1-j]]).attr('class'));
		$('#screen' + j + ' #meta-map div').eq(old_space[0]).attr('class','split-node');
		$('#screen' + j + ' #meta-map div').eq(old_space[1]).attr('class','meta-node');
		redraw_node_map(j,old_id[1-j],0);
	}
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

function go_to(mode,old_id,new_id) {
	old_obj = $('.'+old_id);
	new_obj = $('.'+new_id);
	if (new_obj.html() && !new_obj.hasClass(old_id)) {
		if ($('#status').filter(':visible').html()) $('#status').fadeOut();
		if (status_timer) clearTimeout(status_timer);
		if (mode == 0) $(window).scrollTop(0);
		else $('#screen' + mode).scrollTop(0);
		if (mode == 0) {
			/*		// More consistent feel?
			new_obj.fadeIn();
			old_obj.fadeOut();
			clean_transition(new_obj,old_obj);
			*/
			/**/	// Doesn't break with rapid Ctrl+Arrow
			if ($('body').css('overflow-y')=='hidden') $('body').css('overflow-y','auto');
			new_obj.show();
			old_obj.hide();
			/**/
			new_obj.attr('id',new_id);
		}
		else {
			$('#screen' + mode + ' > div').eq(0).html(new_obj.html());
			$('#screen' + mode + ' > div').eq(0).attr('class',new_obj.attr('class'));
			$('#screen' + mode + ' > div').eq(0).attr('id',new_id);
			// Possibly better method.
			// $('#screen' + mode).empty();
			// new_obj.clone(true).appendTo('#screen' + mode);
		}
		
		if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = new_id;
		if ($('#info').is(':visible')) $('#map .node').mouseleave();
		
		$(window).scrollTop(0);
		redraw_node_map(mode,new_id,0);
		size_buttons(new_obj);
		use_math_plug_in();
	}
}

function linear_move(mode,id,direction,redraw) {
	if (!$('.' + id).is(':visible') || $('.'+ id).css('opacity') != 1) return false;
	var number = id.substr(1,id.length-1) - (38 - direction);
	var letter = id.substr(0,1);
	if ($('.' + letter + number).html()) {
		if ($('#status').filter(':visible').html()) $('#status').fadeOut();
		if (status_timer) clearTimeout(status_timer);
		if (mode == 0) $(window).scrollTop(0);
		else $('#screen' + mode).scrollTop(0);
		if ($('body').css('overflow-y')=='hidden') $('body').css('overflow-y','auto');
		
		if (mode == 0) {
			/*
			// Sliding Animation (for touchscreen)
			var full = $(window).width();
			if (direction > 38) full = -full;
			$('body').css('overflow-x','hidden');
			$('.'+id).animate({'left':full+'px','width':$('.'+id).width()},{complete:function() {
				if ($('.'+id).css('left') == full+'px') {
					$('.'+id).hide();
					$('.'+id).css({'left':'auto','width':'auto'});
				}
			}});
			$('.' + letter + number).css({'left':-full+'px','width':$('.' + letter + number).width()});
			$('.' + letter + number).show();
			$('.' + letter + number).animate({'left':'0px'},{complete:function() {
				if ($('.' + letter + number).css('left') == '0px') {
					$('.' + letter + number).show();
					$('.' + letter + number).css({'left':'auto','width':'auto'});
				}
				$('body').css('overflow-x','auto');
			}});			
			*/
		
			$('.' + letter + number).show();
			$('.'+id).hide();
			
			if (tab_is_unique(0,$('.'+id))) $('.'+id).attr('id','');
			$('.' + letter + number).attr('id',letter+number);
		
		}
		
		else {
			$('#screen' + mode + ' > div').eq(0).html($('.' + letter + number).html());
			$('#screen' + mode + ' > div').eq(0).attr('class',$('.' + letter + number).attr('class'));
			$('#screen' + mode + ' > div').eq(0).attr('id',letter+number);
			// Possibly better method.
			// $('#screen' + mode).empty();
			// $('.' + letter + number).clone(true).appendTo('#screen' + mode);
		}
		
		if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = letter+number;
		if ($('#info').is(':visible')) $('#map .node').mouseleave();
		
		if (redraw) redraw_node_map(mode,letter+number,0);		
		else {
		// Currently, splitscreen mode is using redrawing. Think about updating this area to work with splitscreen in order to reduce workload
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
			update_last_node_line(mode,$('#' + letter + number),row+1);
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
	
	return false;
}

function redraw_node_map(mode,id,color) {
	clear_selected_text();
	var prefix = '';
	if (mode > 0) prefix = '#screen' + mode + ' ';
	$(prefix + '#map').empty();
	if (id.charCodeAt(0) < 90) return false;
	var a_color;
	var p_color;
	if (color == 0) { a_color = '#555'; a_brdr = '#2A2A2A'; p_color = '#00F'; p_brdr = '#008'; }
	if (color == 1) { a_color = '#888'; p_color = '#66F'; }
	var line = new Array();
	for (i=0; id; ++i) {
		line[i] = id;
		id = get_parent_tag(id);
	}
	var alpha = 96 + i;
	$(prefix + '#map').append('<div class="row" id="m_a"></div>');
	$(prefix + '#m_a').css('width','10px');
	$(prefix + '#m_a').append('<div class="node" id="m_a1"> </div>');
	if (line[0]!='Z1') $(prefix + '#m_a1').css({'background-color':p_color,'border-color':p_brdr});
	else $(prefix + '#m_a1').css({'background-color':a_color,'border-color':a_brdr,'cursor':'default'});
	for (j=i-1; j>=0; --j) {					
		update_last_node_line(mode,$('.'+line[j]),alpha-j+1);
		if (line[j+1]) {
			var b = $('.'+line[j+1]+' .in + p').first().attr('id');
			var n = line[j].substr(1,line[j].length-1);
			b = b.substr(1,b.length-1);
			n = n - b + 1;
			if (j==0) $(prefix + '#m_'+String.fromCharCode(alpha-j)+n).css({'background-color':a_color,'border-color':a_brdr,'cursor':'default'});
			else $(prefix + '#m_'+String.fromCharCode(alpha-j)+n).css({'background-color':p_color,'border-color':p_brdr});
		}
	}
}

function tab_is_unique(mode,obj) {
	var prefix = '';
	if (mode > 0) prefix = '#screen' + mode + ' ';
	var test_index = $(prefix + '#meta-map > div').index($(prefix + '.meta-node'));
	for (var i=0; i <= workspace.length; ++i) if ((i != test_index) && (workspace[i] == obj.attr('id'))) return false;
	return true;
}

function concept_zoom_out(mode,dif,adj) {
	if ($('#status').is(':visible')) $('#status').fadeOut();
	if (status_timer) clearTimeout(status_timer);
	if (mode == 0) $(window).scrollTop(0);
	else $('#screen' + mode).scrollTop(0);
	var id;
	if (mode == 0) id = $('.inner').filter(':visible').attr('id');
	else id = $('#screen' + mode + ' > .inner').filter(':visible').attr('id');
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
	if (mode == 0) {
		target_obj.fadeIn();
		old_obj.fadeOut();
		clean_transition(target_obj,old_obj);
		// target_obj.show();
		// old_obj.hide();
		if (tab_is_unique(0,old_obj)) old_obj.attr('id','');
	}
	else {
		$('#screen' + mode + ' > div').eq(0).html(target_obj.html());
		$('#screen' + mode + ' > div').eq(0).attr('class',target_obj.attr('class'));
		$('#screen' + mode + ' > div').eq(0).attr('id',target);
		// Possibly better method.
		// $('#screen' + mode).empty();
		// target_obj.clone(true).appendTo('#screen' + mode);
	}
	target_obj.attr('id',target);
	size_buttons(target_obj);
	if (badIE) setTimeout("size_buttons($('.inner,.outer').eq(" + $('.inner,.outer').index(target_obj) + "));",100);
	use_math_plug_in();
	
	if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = target;
	if ($('#info').is(':visible')) $('#map .node').mouseleave();
	
	// Utilizes Abstraction. Might increase workload.
	redraw_node_map(mode,target,0);
	return true;
	//
	
	var l = String.fromCharCode(target.charCodeAt(0)-1);
	var n = target.substr(1,target.length-1);
	var t = $('#' + l + n).parents('.outer');
	var b;
	if (t.html()) {
		b = t.children('.in + p').first().attr('id');
		b = b.substr(1,b.length-1);
		b = n - b + 1;
	}
	else b=n;
	
	var old_node = $('.node').filter(function() { 
		return ( $(this).css('background-color') == 'rgb(85, 85, 85)' || $(this).css('background-color') == '#555' ); 
	});
	old_node.css('background-color','#FFF');
	var old_row = old_node.attr('id').charCodeAt(2);
	var new_row = old_row - dif;
	update_last_node_line(mode, target_obj, new_row + 1);
	for (var i = old_row + 1; i >= new_row; --i) {
		if (i - new_row >= 2) $('#m_' + String.fromCharCode(i)).remove();
		else $('#m_' + String.fromCharCode(i) + ' > .node').filter(function() {
			return ($(this).css('background-color') == 'rgb(0, 0, 255)' || $(this).css('background-color') == '#00F' );
		}).css('background-color','#FFF');
	}
	$('#m_' + String.fromCharCode(new_row) + b).css('background-color','#555');

	return false;
}

function concept_zoom_in(mode,id) {	
	var letter = String.fromCharCode(id.charCodeAt(0)+1);
	var number = id.substr(1,id.length-1);
	if ($('.' + letter + number).html()) {
		if ($('#status').is(':visible')) $('#status').fadeOut();
		if (status_timer) clearTimeout(status_timer);
		if (mode == 0) $(window).scrollTop(0);
		else $('#screen' + mode).scrollTop(0);
		var old_obj = $('.outer').filter(':visible');
		var a = old_obj.children('.in + p').first().attr('id');
		a = a.substr(1,a.length-1);
		var b = number - a + 1;
		if (mode == 0) {
			$('.' + letter + number).fadeIn();						// Shows corresponding inner chunk
			old_obj.fadeOut();										// Hides outer chunk
			clean_transition($('.' + letter + number),old_obj);
			//$('.' + letter + number).show();						// Shows corresponding inner chunk
			//$('.outer').hide();									// Hides outer chunk
			$('.' + letter + number).attr('id',letter+number);
		}
		else {
			$('#screen' + mode + ' > div').eq(0).html($('.' + letter + number).html());
			$('#screen' + mode + ' > div').eq(0).attr('class',$('.' + letter + number).attr('class'));
			$('#screen' + mode + ' > div').eq(0).attr('id',letter+number);
			// Possibly better method.
			// $('#screen' + mode).empty();
			// $('.' + letter + number).clone(true).appendTo('#screen' + mode);
		}
		
		// Utilizes Abstraction. Might increase workload.
		redraw_node_map(mode,letter+number,0);
		size_buttons($('.' + letter + number));
		use_math_plug_in();
		
		if (workspace.length) workspace[$('#meta-map div').index($('#meta-map .meta-node'))] = letter+number;
		if ($('#info').is(':visible')) $('#map .node').mouseleave();
		
		return true;
		//
		
		var old_node = $('.node').filter(function() { return ( $(this).css('background-color') == 'rgb(85, 85, 85)' ); });
		old_node.css('background-color','#00F');
		var old_row = old_node.attr('id').charCodeAt(2);
		var new_row = old_row + 1;
	
		$('#m_' + String.fromCharCode(new_row) + b).css('background-color','#555');
	
		size_buttons($('.' + letter + number));
		use_math_plug_in();
		update_last_node_line(mode,$('.' + letter + number),new_row+1);		// Old method used x+1 for row parameter
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

// Need to update for Splitscreen Mode
function size_linear_buttons(mode,obj) {
	if (mode == 0) {
		$('.left,.right').height(obj.height());
		var _width = parseInt(obj.css('margin-left'),10)+12;
		var sidebar_width = $('#sidebar').outerWidth();
		if (sidebar_width) _width -= sidebar_width;
		$('.left,.right').width(_width);
		$('.right').css('left',obj.outerWidth()+obj.offset().left-12);
		var l = obj.attr('id').charAt(0);
		var n = parseInt(obj.attr('id').substr(1,obj.attr('id').length-1),10);
		if (!$('.'+l+(n-1)).html()) $('.left').css('cursor','default');
		else $('.left').css('cursor','pointer');
		if (!$('.'+l+(n+1)).html()) $('.right').css('cursor','default');
		else $('.right').css('cursor','pointer');
	}
	else {
		obj = $('#screen' + mode + ' > div').eq(0);
		var prefix = '#screen' + mode;
		$(prefix + ' .left,' + prefix + ' .right').height(obj.height());
		$(prefix + ' .left,' + prefix + ' .right').width(parseInt(obj.css('margin-left'),10)+24);
		$(prefix + ' .right').css('left',obj.width()+$(prefix + ' .left').width());
		var l = obj.attr('id').charAt(0);
		var n = parseInt(obj.attr('id').substr(1,obj.attr('id').length-1),10);
		if (!$('.'+l+(n-1)).html()) $(prefix + ' .left').hide();
		else $(prefix + ' .left').show();
		if (!$('.'+l+(n+1)).html()) $(prefix + ' .right').hide();
		else $(prefix + ' .right').show();
	}
}

function size_buttons(obj) {
	if (!obj.html()) return false;
	size_preview_buttons();
	var mode = 0;
	if ($('#screen1 > div').eq(0).html() == obj.html()) mode = 1;
	if ($('#screen2 > div').eq(0).html() == obj.html()) mode = 2;
	var dots = count_children(obj);
	// New Method
	for (var i=0; i<dots; ++i) obj.children('.in').eq(i).height(obj.children('.in + p').eq(i).height()+10);
	// Old Method
	//var id = obj.children('.in + p').first().attr('id');
	//if (id) {
		//var row = id.charAt(0);
		//var adj = parseInt(id.substr(1,id.length-1),10);
		//if (mode == 0) for (var i=1; i<=dots; ++i) $('.' + row + (i-1+adj)).height($('#' + row + (i-1+adj)).height()+10);
		//else for (var i=1; i<=dots; ++i) $('.' + row + (i-1+adj)).height($('#screen' + mode + '>div>#'+ row + (i-1+adj)).height()+10);
		// for (var i=1; i<=dots; ++i) $('.' + row + (i-1+adj)).height($('#' + row + (i-1+adj)).height()+10);
	//}
	size_linear_buttons(mode,obj);
}

function count_children(obj) {
	// New Method
	return obj.children('.in + p').index(obj.children('.in + p').last()) + 1;
	// Old Method
	//var z = obj.children('.in + p').last().attr('id');
	//if (z) {
	//	z = z.substr(1,z.length-1);
	//	var y = obj.children('.in + p').first().attr('id');
	//	y = y.substr(1,y.length-1);
	//	return z-y+1
	//}
	//else return false;
}

function get_parent_tag(id) {
	var test_l = String.fromCharCode(id.charCodeAt(0)-2);
	if (!id || test_l=='?' || test_l=='X') return false;
	if (test_l=='`') test_l='Z';
	var hit_l = String.fromCharCode(id.charCodeAt(0)-1);
	var hit_n = id.substr(1,id.length-1);
	/*
	// Old Method
	for (var i=1; $('.' + test_l + i).html(); ++i) {
		var target = $('.' + test_l + i).children('#'+hit_l+hit_n);
		if (target.html()) {
			var t = $('.' + test_l + i).attr('id');
			if (t) return t;
			else return test_l+i;
		}
		if (!$('.' + test_l + (i+1)).html()) ++i;
	}
	return false;
	*/
	// New Method
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

function update_last_node_line(mode,obj,row) {
	var row = String.fromCharCode(row);
	var prefix = '';
	if (mode > 0) prefix = '#screen' + mode + ' ';
	if (dots = count_children(obj)) {
		if (!$(prefix + '#m_' + row).html()) $(prefix + '#map').append('<div class="row" id="m_' + row + '"></div>');
		else $(prefix + '#m_' + row).empty();
		$(prefix + '#m_' + row).css('width',dots*10+'px');
		for (i=1; i<=dots; ++i) $(prefix + '#m_' + row).append('<div class="node" id="m_' + row + i + '"> </div>');
	}
	else {
		$(prefix + '#m_' + row).remove();
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
	redraw_node_map(0,current_keys[next_key],0);
}

function ancestors(id,msg,loop) {
	if (!id) return msg;
	var j;
	var test;
	var line;
	var results;
	var q;
	
	if (loop!=1) {
		var x = $('.'+id).attr('class').split(' ');
		for (j=0; test=x[j]; ++j) {
			if (test!='inner' && test!='outer') {
				line = test;
				if (msg) line += ',' + msg;
				test = get_parent_tag(test);
				if (loop > 0) --loop;
				q = ancestors(test,line,loop);
				//if (q) results[j] = q;
				if (q) {
					if (results) results += ',' + q;
					else results = q;
				}
			}
		}
	}
	
	else {
		test = id;
		line = test;
		if (msg) line += ',' + msg;
		while (test = get_parent_tag(test)) line = test + ',' + line;
		if (results) results += ',' + line;
		else results = line;
	}
	
	return results;
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
	//// Trying to get map to fit mobile screen properly when zoomed in.
	//if ($('.inner,.outer').filter(':visible').outerWidth() < $(map).width() + $(window).scrollLeft()) {
		//var old_width = $(map).width();
		//$(map).width($(window).width() - $(window).scrollLeft());
		//$(map).height($(map).width()/old_width * $(map).height());
		//$(map).css('left',$(window).scrollLeft());
	//}
	var resize_workaround_test = (($(window).scrollLeft() > 2) && ($(map).css('left') == '0px') && create);
	if (resize_workaround_test) resize_workaround_test = (!window.innerWidth || window.innerWidth >= $(document).width());
	if (resize_workaround_test) resize_workaround_test = (!window.innerHeight || window.innerHeight >= $(window).height());
	if (resize_workaround_test) {
		$('meta[name="viewport"]').attr('content','width=device-width, minimum-scale=1, maximum-scale=1');
		//$('meta[name="viewport"]').attr('content','initial-scale=1, minimum-scale=1, maximum-scale=5');
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
				switch_tab(0,different);
				return true;
			}
			var _old = $('.node').filter(function() { return ( $(this).css('background-color') == 'rgb(85, 85, 85)' ); }).attr('id');
			if (different == -1) return false;
			var _new = $(map + ' .node').eq(different).attr('id');
			var l1 = _new.charCodeAt(2);
			var n1 = _new.substr(3,_new.length-3);
			var l0 = _old.charCodeAt(2);
			var n0 = _old.substr(3,_old.length-3);
			
			var mode = 0;
			var prefix = '';
			
			$(map).remove();
				
			// zoom in		
			if (l1>l0) return concept_zoom_in(mode,$(prefix + '.outer').filter(':visible').children('.in + p').eq(n1-1).attr('id'));
			// zoom out
			else if (l1<l0) return concept_zoom_out(mode,l0-l1,n1);
			// linear move
			else if (n1!=n0) return linear_move(mode,$(prefix + '.inner').filter(':visible').attr('id'),38-(n0-n1),mode);
			
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
	if (!portrait) $('#lm_info').width($('#lm_ok').offset().left-($('#lm_info').outerWidth(1)-$('#lm_info').width()));
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
		var font_size = 2.5;
		$('#lm_info').css('font-size',font_size + 'em');
		var first_row_top = $(map + ' .row').eq(0).offset().top - $(map).offset().top;
		while (($('#lm_info').outerHeight() > first_row_top || $('#lm_info').outerWidth(1) > $(map).width()) && (font_size > 0.1)) {
			font_size -= 0.1;
			$('#lm_info').css('font-size',font_size + 'em');
		}
		$('#lm_info').css('text-shadow','0 ' + font_size + 'px ' + 2*font_size + 'px #7F7F7F');
	});
	
	if (create && meta) $(map + ' > #meta > div').on('tap',function(event) {
		$(map + ' > #meta > div').css('box-shadow','none');
		$(map + ' > #meta > div').css('-webkit-box-shadow','none');
		different = $(map + ' > #meta > div').index($(this));
		$(this).css('box-shadow','0 0 ' + 1.5*multiplier + 'px ' + 0.75*multiplier + 'px #eee');
		$(this).css('-webkit-box-shadow','0 0 ' + 1.5*multiplier + 'px ' + 0.75*multiplier + 'px #eee');
		
		$('#lm_info').html($('.' + workspace[$(map + ' > #meta > div').index($(this))] + ' h3').html());
		
		var font_size = 2.5;
		$('#lm_info').css('font-size',font_size + 'em');
		var first_row_top = $(map + ' #meta').offset().top - $(map).offset().top;
		while (($('#lm_info').outerHeight() > first_row_top || $('#lm_info').outerHeight() > 0.33*$(map).height() || $('#lm_info').outerWidth(1) > $(map).width()) && (font_size > 0.1)) {
			font_size -= 0.1;
			$('#lm_info').css('font-size',font_size + 'em');
		}
		$('#lm_info').css('text-shadow','0 ' + font_size + 'px ' + 2*font_size + 'px #7F7F7F');
	});
	
	if (!create && $('#lm_info').html()) {
		if ($(map).height()/$(map).width() > 1) $('#lm_info').width('auto');
		else $('#lm_info').width($('#lm_ok').offset().left-($('#lm_info').outerWidth(1)-$('#lm_info').width()));
		var font_size = 2.5;
		$('#lm_info').css('font-size',font_size + 'em');
		var first_row_top = $(map + Array(' .row',' #meta')[meta]).eq(0).offset().top - $(map).offset().top;
		while (($('#lm_info').outerHeight() > first_row_top  || $('#lm_info').outerHeight() > 0.33*$(map).height() || $('#lm_info').outerWidth(1) > $(map).width()) && (font_size > 0.1)) {
			font_size -= 0.1;
			$('#lm_info').css('font-size',font_size + 'em');
		}
		$('#lm_info').css('text-shadow','0 ' + font_size + 'px ' + 2*font_size + 'px #7F7F7F');
	}
}

function find_different(set,criteria) {
	var different = -1;
	for (var i=0; i < $(set).index($(set + '').last()); ++i) {
		if ($(set).eq(i).css(criteria) != $(set).eq(i+1).css(criteria)) {
			if (different > 0) return different;
			else different = i+1;
		}
		else if (different > 0) return 0;
	}	
	return different;
}

function use_math_plug_in() {
	if (typeof window['align_fractions'] === 'function') {
		align_fractions();
		align_summations();
		align_limits();
	}
}
