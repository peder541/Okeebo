/*
 * Okeebo Guided Tour JavaScript (navigation)
 * author: Ben Pedersen
 * 
 */

function step_one(subsection) {
	go_to($('.inner,.outer').filter(':visible').attr('id'), subsection ? 'b1' : 'Z1');
	$('#guided_tour > p').html('This is a ' + (subsection ? 'sub' : '') + 'section summary.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter('.in + p[id]').eq(subsection ? 1 : 0);
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none'}).not($target.prev('.in')).css({'opacity':'0.3'});
	$target.css({'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'0 4px 4px 0'})
		.prev('.in').css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
	
	prevClick(function() {
		cancel();
		if (subsection) step_three();
		else guided_tour(1);
	});
	nextClick(function() {
		cancel();
		step_two(subsection);
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'outline-offset':'','outline':'','background-color':'','box-shadow':'','border-radius':''})
			.prev('.in').css({'box-shadow':''});
	}
	scrollToTopOf($(subsection ? '.c2' : '.a1'));
}

function step_two(subsection) {
	go_to($('.inner,.outer').filter(':visible').attr('id'), subsection ? 'b1' : 'Z1');
	$('#guided_tour > p').html('Click this to see the ' + (subsection ? 'sub' : '') + 'section in more detail.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter('.in').eq(subsection ? 1 : 0);
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
	
	prevClick(function() {
		cancel();
		step_one(subsection);
	});
	nextClick();
	function cancel() {
		$target.off('click',next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':''}).next('p[id]').css({'background-color':'','box-shadow':''});
	}
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
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right').add($summary.children().not(subsection ? '.c2' : '.a1'));
	$children.css({'pointer-events':'none'}).not($page.children()).css({'opacity':'0.3'});
	$summary.css({'background-color':'rgba(252,252,252,0.3)'});
	
	prevClick(function() {
		cancel();
		step_two(subsection);
	});
	nextClick(function() {
		cancel();
		if (subsection) step_four();
		else step_one(1);
	});
	function cancel() {
		$children.css({'opacity':'','pointer-events':''});
		$summary.css({'background-color':''});
	}
}

function step_four() {
	go_to($('.inner,.outer').filter(':visible').attr('id'),'d2');
	$('#guided_tour > p').html('Click this to see the subsection summary.');
	
	var $page = $('.d2');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter('.out');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
	
	prevClick(function() {
		cancel();
		step_three(1);
	});
	nextClick();
	function cancel() {
		$target.off('click',next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':''}).next('p[id]').css({'background-color':'','box-shadow':''});	
	}
	function next_step() {
		cancel();
		step_five();
	}
	$target.on('click',next_step);
}

function step_five() {
	$('#guided_tour > p').html('Now you see the subsection summary.');
	
	var $page = $('.b1,.d2');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter('.in + p[id]').eq(1);
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none'}).not($target.prev('.in')).css({'opacity':'0.3'});
	$target.css({'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'0 4px 4px 0'})
		.prev('.in').css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
	
	prevClick(function() {
		cancel();
		step_four();
	});
	nextClick(function() {
		cancel();
		step_six();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'outline-offset':'','outline':'','background-color':'','box-shadow':'','border-radius':''})
			.prev('.in').css({'box-shadow':''});
	}
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
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter(previous ? '.left' : '.right');
	var color = previous ? '166, 206, 227' : '178, 223, 138';
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'background-color':'rgba(' + color + ', 0.5)','box-shadow':'0px 0px 10px 2px rgba(' + color + ', 0.75)'});
	
	prevClick(function() {
		cancel();
		if (previous) step_six();
		else step_five();
	});
	nextClick();
	function cancel() {
		$target.off('click',next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'background-color':'','box-shadow':''});
	}
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
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	
	prevClick(function() {
		cancel();
		if (previous) step_six_seven();
		else step_five();
	});
	nextClick('Go ahead and ' + instruction.toLowerCase() + '!');
	function cancel() {
		$('.inner').off('hide', next_step);
		$('#guided_tour').removeClass(previous ? 'canLeft' : 'canRight');
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
	}
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
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	
	prevClick(function() {
		cancel();
		go_to($page.filter(':visible').attr('id'),'b2');
		step_six(1);
	});
	nextClick(function() {
		cancel();
		step_eight();
	});
	function cancel() {
		$('#guided_tour').removeClass('canLeft canRight');
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
	}
}

function step_eight(more) {
	$('#guided_tour > p').html(more ? 'You can also interact with it to navigate.' : 'This shows where you are in the content.');
	$(window).scrollTop(0);
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter('#map');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'50px / 30px','background-color':'#bbb'});
	
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
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':'','border-radius':'','background-color':''});
	}
}

function step_nine() {
	$('#guided_tour > p').html('This links to a tangent idea.');
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'd6');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $('.tangent');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'background-color':'#fcfcfc','box-shadow':'0 0 10px 2px #fcfcfc'})
		.parent().css({'opacity':'','color':'#8f8f8f','pointer-events':''});
		
	prevClick(function() {
		cancel();
		$(window).scrollTop(0);
		step_eight(1);
	});
	nextClick();
	function cancel() {
		$target.off('click', next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':'','background-color':'','pointer-events':''})
			.parent().css({'color':''});
		$('#guided_tour').css('position','');
	}
	function next_step() {
		setTimeout(function() {
			cancel();
			step_ten();
		}, 0);
	}
	
	$(window).scrollTop($target.offset().top - window.innerHeight*0.5);
	$('#guided_tour').css('position','fixed');
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
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $('.preview_window');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'opacity':'0.3'}).add($target.children()).css({'pointer-events':'none'});
	$target.css({/*'box-shadow':'0px 0px 4px 0px #555, 0px 0px 10px 2px #FCFCFC',*/'background-color':'#fcfcfc'});
	
	prevClick(function() {
		cancel();
		$('.preview_exit').click();
		step_nine();
	});
	nextClick(function() {
		cancel();
		step_eleven();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':''}).add($target.children()).css({'pointer-events':''});
		$target.css({'box-shadow':'','background-color':''});
		$('#guided_tour').css('position','');
	}
	$('#guided_tour').css('position','fixed');
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
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right').add($target.parent().children().not($target));
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target.parent()).css({'opacity':'0.3','pointer-events':'none'});
	$target.css({'box-shadow':'0px 0px 10px 2px #FCFCFC'});
	
	prevClick(function() {
		cancel();
		step_ten();
	});
	nextClick();
	function cancel() {
		$target.children('.preview_main').off('click', next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':'','pointer-event':''});
		$('.preview_exit').click();
		$(window).scrollTop(0);
		$('#guided_tour').css('position','');
	}
	function next_step() {
		setTimeout(function() {
			cancel();
			step_twelve();
		}, 0);
	}
	
	$('#guided_tour').css('position','fixed');
	$target.on('click', next_step);	
}

function step_twelve() {
	$('#guided_tour > p').html('Now you see the tangent idea in full.');
	$('#meta-map > div').eq(1).click();
	
	var $page = $('.d2');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	$children.css({'pointer-events':'none'}).not($page.children()).css({'opacity':'0.3'});
	
	prevClick(function() {
		cancel();
		$('.exit').click();
		step_eleven();
	});
	nextClick(function() {
		cancel();
		step_thirteen();
	});
	function cancel() {
		$children.css({'opacity':'','pointer-events':''});
	}
	no_pointer_events();
}

function step_thirteen() {
	$('#guided_tour > p').html('You can interact with this to switch threads.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter('#meta-map');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius': $target.outerWidth()*0.5 + 'px / ' + $target.outerHeight()*0.5 + 'px','background-color':'#bbb'});
	
	prevClick(function() {
		cancel();
		step_twelve();
	});
	nextClick(function() {
		cancel();
		step_fourteen();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':'','border-radius':'','background-color':''});
	}
}

function step_fourteen() {
	$('#guided_tour > p').html('Click this to close a thread.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter('.exit');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
	
	prevClick(function() {
		cancel();
		step_thirteen();
	});
	nextClick();
	function cancel() {
		$target.off('click',next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':'','border-radius':''});
	}
	function next_step() {
		cancel();
		step_fifteen();	
	}
	$target.on('click',next_step);
}

function step_fifteen() {
	$('#guided_tour > p').html('Click &nbsp;<span>Edit</span>&nbsp; if you want to continue the tour.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter('#function');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'box-shadow':'0px 0px 3px 0px #555','border-radius':'6px','background-color':'rgba(31, 120, 180, 1)','padding':'4px','left':'76px','top':'5px'});
	
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
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':'','border-radius':'','background-color':'','padding':'','left':'','top':''});
	}
	$('#function').off('click').one('click',function(event) {
		window.localStorage.setItem('tour','true');
	});
	$('#guided_tour > p > span').css({'font-variant':$target.css('font-variant'),'font-family':$target.css('font-family')});
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
