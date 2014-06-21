/*
 * Okeebo Guided Tour JavaScript (core)
 * author: Ben Pedersen
 * 
 */
 
var continuedTour = false;
 
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

function setStylings($dim, $noClick, $target, targetCSS) {
	var dimOpacity = '0.3';
	
	var $dimSVG = $dim.filter('svg,circle,path');
	$dim = $dim.not($dimSVG);
	
	$dim.css('opacity', dimOpacity);
	if (!$('svg').is(':visible')) $dim.filter('.writing').not($target).addClass('writingDim');
	$dimSVG.css({'stroke-opacity': dimOpacity, 'fill-opacity': dimOpacity});
	$noClick.css('pointer-events', 'none');
	$target.css(targetCSS);
	
	var cancelCSS = {};
	for (var i in targetCSS) cancelCSS[i] = '';
	
	var $other = [];
	var otherCSS = [];
	for (var i=4, l=arguments.length; i<l; i+=2) {
		var $el = arguments[i];
		var elCSS = arguments[i+1];
		$el.css(elCSS);
		$other.push($el);
		for (var j in elCSS) elCSS[j] = '';
		otherCSS.push(elCSS);
	}
	
	function cancel() {
		$dim.css('opacity','');
		$('.writing').removeClass('writingDim');
		$dimSVG.css({'stroke-opacity': '', 'fill-opacity': ''});
		$noClick.css('pointer-events', '');
		$target.css(cancelCSS);
		for (var i=0, l=$other.length; i<l; ++i) $other[i].css(otherCSS[i]);
	}
	
	return cancel;
}

function end_tour() {
	var distance = -$('#guided_tour').outerHeight();
	$('#guided_tour').animate({'top': distance, 'bottom': distance}, 800, function() {
		$(this).remove();
	});
	window.localStorage.removeItem('continueTour');
	$('.inner,.outer').removeAttr('data-tour');
}

$(document).ready(function() {
	$background = $('.Z1').prevAll().add('.left,.right,.writing');
	
	if (window.localStorage.getItem('continueTour') == 'true') {
		continuedTour = true;
		window.localStorage.removeItem('continueTour');
		guided_tour(1);
		step_one();
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
