/*
 * Okeebo Guided Tour JavaScript (core)
 * author: Ben Pedersen
 * 
 */
 
function guided_tour(instant) {
	$('#search').hide();
	var $page = $('.inner,.outer').filter(':visible');
	$('#guided_tour').remove();
	$('body').append('<div id="guided_tour"></div>');
	$('#guided_tour')
		.append('<p>Would you like a guided tour?</p>')
		.append('<button class="guided prev"></button><button class="guided next"></button>')
		.css({'top': -$('#guided_tour').outerHeight(), 'bottom': -$('#guided_tour').outerHeight()})
		.css('left',$page.offset().left + $page.outerWidth()*0.5 - $('#guided_tour').outerWidth()*0.5)
		.animate({'top':'','bottom':''}, instant ? 0 : 800)
		.addClass('canLeft canRight');
		
	prevClick(end_tour,'No');
		
	nextClick(function() {
		$('#guided_tour').removeClass('canLeft canRight');
		step_one();
	},'Yes');
	
	no_pointer_events();
	$('.inner,.outer').attr('data-tour','guided');
}

function prevClick(callback, prevText) {
	prevText = prevText || 'Back';
	$('.prev').off('click').show().html(prevText).on('click',callback);		
}
function nextClick(callback, nextText) {
	if (!callback || typeof(callback) === 'string') {
		var instruction = callback || 'Go ahead and click it!';
		callback = function() {
			$('#guided_tour > p').html(instruction);
			$('.prev,.next').hide();	
		};
	}
	nextText = nextText || 'Next';
	$('.next').off('click').show().html(nextText).on('click',callback);
}

function end_tour() {
	var distance = -$('#guided_tour').outerHeight();
	$('#guided_tour').animate({'top': distance, 'bottom': distance}, 800, function() {
		$(this).remove();
	});
	window.localStorage.removeItem('tour');
	$('.inner,.outer').removeAttr('data-tour');
}

$(document).ready(function() {
	if (window.localStorage.getItem('tour') == 'true') {
		guided_tour(1);
		step_one();
		if ($('#function').html() == 'Edit') {
			window.localStorage.removeItem('tour');
		}
	}
	else guided_tour();
	
	$(window).on('resize',function(event) {
		var $page = $('.inner,.outer').filter(':visible');
		if ($page.index() != -1) {
			var newLeft = $page.offset().left + $page.outerWidth()*0.5 - $('#guided_tour').outerWidth()*0.5;
			//if ($('#sidebar').is(':visible') && $page.outerWidth() == 900) newLeft = 530;
			$('#guided_tour').css('left',newLeft);
		}
		else {
			// SVG positioning
			var newLeft = window.innerWidth*0.5 - $('#guided_tour').outerWidth()*0.5;
			var $circle = $('circle');
			var newTop = $circle.eq(1).offset().top*0.5 - $circle.eq(0).offset().top*0.5;
			$('#guided_tour').css({'top':newTop,'left':newLeft,'border-radius':15,'bottom':newTop});
		}
	});
});

// Lite shim for "pointer-events: none;" on IE
function no_pointer_events() {
	if (IE) $('*').not('html').off('click',shim).on('click',shim);
	function shim(event) {
		var $this = $(this);
		if ($this.css('pointer-events') == 'none' || ($this.parent().css('pointer-events') == 'none' && $this.css('pointer-events') != 'all')) {
			event.stopImmediatePropagation();
			event.preventDefault();
			return false;
		}
	}
}

function scrollToTopOf($obj, instant, callback) {
	var obj_top = $obj.offset().top;
	var obj_bottom = obj_top + $obj.outerHeight();
	var show_end = obj_bottom - $(window).height() + 15 + ($('#guided_tour').css('top')!='0px' ? $('#guided_tour').outerHeight() : 0);
	var spot = Math.min(show_end, obj_top-15);
	
	if (!instant || callback || $(window).scrollTop() < spot || $(window).scrollTop() > obj_bottom) {
		$('html,body').animate({'scrollTop':spot}, instant ? 0 : Math.abs($(window).scrollTop() - spot)*Math.PI + 400, function() {
			if (typeof(callback) === 'function') callback();
		});
	}
}
