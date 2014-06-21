/*
 * Okeebo Guided Tour JavaScript (navigation)
 * author: Ben Pedersen
 * 
 */

function step_one(subsection) {
	go_to($('.inner,.outer').filter(':visible').attr('id'), subsection ? 'b1' : 'Z1');
	$('#guided_tour > p').html('This is a ' + (subsection ? 'sub' : '') + 'section summary.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children();
	var $target = $children.filter('.in + p[id]').eq(subsection ? 1 : 0);
	var $in = $target.prev('.in');
	
	var $noClick = $children.not($target).add($background);
	var $dim = $noClick.not($in);
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'0 4px 4px 0'};
	var inCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS, $in, inCSS);
	
	prevClick(function() {
		cancel();
		if (subsection) step_three();
		else guided_tour(1);
	});
	nextClick(function() {
		cancel();
		step_two(subsection);
	});
	
	scrollToTopOf($(subsection ? '.c2' : '.a1'));
}

function step_two(subsection) {
	go_to($('.inner,.outer').filter(':visible').attr('id'), subsection ? 'b1' : 'Z1');
	$('#guided_tour > p').html('Click this to see the ' + (subsection ? 'sub' : '') + 'section in more detail.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children();
	var $target = $children.filter('.in').eq(subsection ? 1 : 0);
	
	var $dim = $children.not($target).add($background);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel();
		step_one(subsection);
	});
	nextClick();
	
	function next_step() {
		cancel();
		step_three(subsection);
	}
	$target.on('click',next_step);
	scrollToTopOf($(subsection ? '.c2' : '.a1'), true);
}

function step_three(subsection) {
	$('#guided_tour > p').html('Now you see the ' + (subsection ? 'sub' : '') + 'section in more detail.');
	
	var $page = $(subsection ? '.d2' : '.b1');
	var $summary = $(subsection ? '.b1' : '.Z1');
	var $children = $page.children();
	
	var $noClick = $children.add($background).add($summary.children().not(subsection ? '.c2' : '.a1'));
	var $dim = $noClick.not($page.children());
	
	var summaryCSS = {'background-color':'rgba(252,252,252,0.3)'};
	
	var cancel = setStylings($dim, $noClick, $(), {}, $summary, summaryCSS);
	
	prevClick(function() {
		cancel();
		step_two(subsection);
	});
	nextClick(function() {
		cancel();
		if (subsection) step_four();
		else step_one(1);
	});
}

function step_four() {
	go_to($('.inner,.outer').filter(':visible').attr('id'),'d2');
	$('#guided_tour > p').html('Click this to see the subsection summary.');
	
	var $page = $('.d2');
	var $children = $page.children();
	var $target = $children.filter('.out');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();	
	}
	
	prevClick(function() {
		cancel();
		step_three(1);
	});
	nextClick();
	
	function next_step() {
		cancel();
		step_five();
	}
	$target.on('click',next_step);
}

function step_five() {
	$('#guided_tour > p').html('Now you see the subsection summary.');
	
	var $page = $('.b1,.d2');
	var $children = $page.children();
	var $target = $children.filter('.in + p[id]').eq(1);
	var $in = $target.prev('.in');
	
	var $noClick = $children.add($background).not($target);
	var $dim = $noClick.not($in);
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'0 4px 4px 0'};
	var inCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS, $in, inCSS);
	
	prevClick(function() {
		cancel();
		step_four();
	});
	nextClick(function() {
		cancel();
		step_six();
	});
	
	setTimeout(function() {
		scrollToTopOf($('.c2'));
	}, 500);
}

function step_six(previous) {
	if ($('.left').width() == 0) {
		step_six_seven(previous);
		return false;
	}
	if (!previous) go_to($('.inner,.outer').filter(':visible').attr('id'), 'b1');
	$('#guided_tour > p').html(previous ? 'Click the left margin for the previous section.' : 'Click the right margin to see the next section.');
	
	var $page = $(previous ? '.b2' : '.b1');
	var $children = $page.children();
	var $target = $(previous ? '.left' : '.right');
	
	var $noClick = $children.add($background).not($target);
	var $dim = $noClick;
	
	var color = previous ? '166, 206, 227' : '178, 223, 138';
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'rgba(' + color + ', 0.5)','box-shadow':'0px 0px 10px 2px rgba(' + color + ', 0.75)'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel();
		if (previous) step_six();
		else step_five();
	});
	nextClick();
	
	function next_step() {
		cancel();
		if (previous) step_seven();
		else step_six(1);
	}
	$target.on('click',next_step);
}

function step_six_seven(previous) {
	go_to($('.inner,.outer').filter(':visible').attr('id'), previous ? 'b2' : 'b1');
	
	var instruction = 'Press the ' + (previous ? 'left' : 'right') + ' arrow key';
	if (mobile) instruction = 'Swipe ' + (previous ? 'right' : 'left');
	$('#guided_tour > p').html(instruction + ' for the ' + (previous ? 'previous one' : 'next section') + '.');
	$('#guided_tour').addClass(previous ? 'canLeft' : 'canRight');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	
	var $dim = $children.add($background);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	
	var cancelCSS = setStylings($dim, $noClick, $(), {}, $page, pageCSS);
	
	function cancel() {
		$('.inner').off('hide', next_step);
		$('#guided_tour').removeClass(previous ? 'canLeft' : 'canRight');
		cancelCSS();
	}
	
	prevClick(function() {
		cancel();
		if (previous) step_six_seven();
		else step_five();
	});
	nextClick('Go ahead and ' + instruction.toLowerCase() + '!');
	
	function next_step() {
		cancel();
		if (previous) step_eight();
		else step_six_seven(1);
	}
	$('.inner').on('hide', next_step);
}

function step_seven() {
	if ($('.left').width() == 0) {
		step_six_seven(1);
		return false;
	}
	$('#guided_tour > p').html('You can also use the right and left arrow keys.');
	$('#guided_tour').addClass('canLeft canRight');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	
	var $dim = $children.add($background);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	
	var cancelCSS = setStylings($dim, $noClick, $(), {}, $page, pageCSS);
	
	function cancel() {
		$('#guided_tour').removeClass('canLeft canRight');
		cancelCSS();
	}
	
	prevClick(function() {
		cancel();
		go_to($page.filter(':visible').attr('id'),'b2');
		step_six(1);
	});
	nextClick(function() {
		cancel();
		step_eight();
	});
}

function step_eight(more) {
	$('#guided_tour > p').html(more ? 'You can also interact with it to navigate.' : 'This shows where you are in the content.');
	$(window).scrollTop(0);
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#map');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'50px / 30px','background-color':'#bbb'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	prevClick(function() {
		cancel();
		if (more) step_eight();
		else step_seven();
	});
	nextClick(function() {
		cancel();
		if (more) step_nine();
		else step_eight(1);
	});
}

function step_nine() {
	$('#guided_tour > p').html('This links to a tangent idea.');
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'd6');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('.tangent');
	var $parent = $target.parent();
	
	var $dim = $children.add($background).not($parent);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'#fcfcfc','box-shadow':'0 0 10px 2px #fcfcfc'};
	var parentCSS = {'opacity':'','color':'#8f8f8f','pointer-events':''};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS, $parent, parentCSS);
	
	function cancel() {
		$target.off('click', next_step);
		cancelCSS();	
	}
		
	prevClick(function() {
		cancel();
		$(window).scrollTop(0);
		step_eight(1);
	});
	nextClick();
	
	function next_step() {
		setTimeout(function() {
			cancel();
			step_ten();
		}, 0);
	}
	
	$(window).scrollTop($target.offset().top - window.innerHeight*0.5);
	$target.on('click', next_step);
}

function step_ten() {
	$('#guided_tour > p').html('This is a preview of the tangent idea.');
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'd6');
	if ($('.preview_window').index() == -1) {
		$(window).scrollTop($('.tangent').offset().top - window.innerHeight*0.5);
		$('.tangent').click();
	}
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('.preview_window');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim.add($target.children());
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'#fcfcfc'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	prevClick(function() {
		cancel();
		$('.preview_exit').click();
		step_nine();
	});
	nextClick(function() {
		cancel();
		step_eleven();
	});
	
	no_pointer_events();
}

function step_eleven() {
	$('#guided_tour > p').html('Click this to see the tangent idea in full.');
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'd6');
	if ($('.preview_window').index() == -1) {
		$(window).scrollTop($('.tangent').offset().top - window.innerHeight*0.5);
		$('.tangent').click();
	}
	
	var $page = $('.inner,.outer');
	var $target = $('.preview_main');
	var $children = $page.children();
	
	var $dim = $children.add($background).not($target.parent()).add($target.parent().children()).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow':'0px 0px 10px 2px #FCFCFC'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
		$('.preview_exit').click();
		$(window).scrollTop(0);
	}
	
	prevClick(function() {
		cancel();
		step_ten();
	});
	nextClick();
	
	function next_step() {
		setTimeout(function() {
			cancel();
			step_twelve();
		}, 0);
	}
	$target.on('click', next_step);	
}

function step_twelve() {
	$('#guided_tour > p').html('Now you see the tangent idea in full.');
	$('#meta-map > div').eq(1).click();
	
	var $page = $('.d2');
	var $children = $page.children();
	
	var $dim = $background;
	var $noClick = $dim.add($children);
	
	var cancel = setStylings($dim, $noClick, $(), {});
	
	prevClick(function() {
		cancel();
		$('.exit').click();
		step_eleven();
	});
	nextClick(function() {
		cancel();
		step_thirteen();
	});
	
	no_pointer_events();
}

function step_thirteen() {
	$('#guided_tour > p').html('You can interact with this to switch threads.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#meta-map');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius': $target.outerWidth()*0.5 + 'px / ' + $target.outerHeight()*0.5 + 'px','background-color':'#bbb'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	prevClick(function() {
		cancel();
		step_twelve();
	});
	nextClick(function() {
		cancel();
		step_fourteen();
	});
}

function step_fourteen() {
	$('#guided_tour > p').html('Click this to close a thread.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('.exit');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim;

	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel();
		step_thirteen();
	});
	nextClick();
	
	function next_step() {
		cancel();
		step_fifteen();	
	}
	$target.on('click',next_step);
}

function step_fifteen() {
	$('#guided_tour > p').html('If you want to continue the tour, click &nbsp;<span>Edit</span>');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#function');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow':'0px 0px 3px 0px #555','border-radius':'6px','background-color':'rgba(31, 120, 180, 1)','padding':'4px','left':'76px','top':'5px'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('click',continueTour);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel();
		workspace = [];
		go_to($('.inner,.outer').filter(':visible').attr('id'),'d6');
		explore_tangent('d2');
		step_fourteen();
	});
	nextClick(function() {
		cancel();
		step_sixteen();
	});
	
	function continueTour() {
		window.localStorage.setItem('continueTour','true');
	}
	$target.on('click',continueTour);
	$('#guided_tour > p > span').children('span').css({'font-variant':$target.css('font-variant'),'font-family':$target.css('font-family')});
}

function step_sixteen() {
	$('#guided_tour > p').html('Otherwise we\'re done!');
	$('#guided_tour').addClass('canLeft canRight');
	prevClick(function() {
		$('#guided_tour').removeClass('canLeft canRight');
		step_fifteen();
	});
	nextClick(end_tour,'Done');
}
