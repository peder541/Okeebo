/*
 * Okeebo Guided Tour JavaScript
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
		.append('<button class="guided prev">No</button><button class="guided next">Yes</button>')
		.css('left',$page.offset().left + $page.outerWidth()/2 - 160)
		.animate({'top':0}, instant ? 0 : 800);
		
	$('.prev').on('click',end_tour);
	
	$('.next').on('click',function() {
		step_one();
	});
}

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
	
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		if (subsection) step_three();
		else guided_tour(1);
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		cancel();
		step_two(subsection);
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'outline-offset':'','outline':'','background-color':'','box-shadow':'','border-radius':''})
			.prev('.in').css({'box-shadow':''});
	}
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
	
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		step_one(subsection);
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		$('#guided_tour > p').html('Go ahead and click it!');
		$('.prev,.next').hide();
	});
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
}

function step_three(subsection) {
	$('#guided_tour > p').html('Now you see the ' + (subsection ? 'sub' : '') + 'section in more detail.');
	
	var $page = $(subsection ? '.d2' : '.b1');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	$children.css({'pointer-events':'none'}).not($page.children()).css({'opacity':'0.3'});
	
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		step_two(subsection);
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		cancel();
		if (subsection) step_four();
		else step_one(1);
	});
	function cancel() {
		$children.css({'opacity':'','pointer-events':''});
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
	
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		step_three(1);
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		$('#guided_tour > p').html('Go ahead and click it!');
		$('.prev,.next').hide();
	});
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
	
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		step_four();
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		cancel();
		step_six();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'outline-offset':'','outline':'','background-color':'','box-shadow':'','border-radius':''})
			.prev('.in').css({'box-shadow':''});
	}
}

function step_six(previous) {
	if (!previous) go_to($('.inner,.outer').filter(':visible').attr('id'), 'b1');
	$('#guided_tour > p').html(previous ? 'Click the left margin for the previous section.' : 'Click the right margin to see the next section.');
	
	var $page = $(previous ? '.b2' : '.b1');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter(previous ? '.left' : '.right');
	var color = previous ? '166, 206, 227' : '178, 223, 138';
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'background-color':'rgba(' + color + ', 0.5)','box-shadow':'0px 0px 10px 2px rgba(' + color + ', 0.75)'});
	
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		if (previous) step_six();
		else step_five();
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		$('#guided_tour > p').html('Go ahead and click it!');
		$('.prev,.next').hide();
	});
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

function step_seven() {
	$('#guided_tour > p').html('You can also use the right and left arrow keys.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		go_to($page.filter(':visible').attr('id'),'b2');
		step_six(1);
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		cancel();
		step_eight();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
	}
}

function step_eight(more) {
	$('#guided_tour > p').html(more ? 'You can also interact with it to navigate.' : 'This shows where you are in the content.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $children.filter('#map');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'20px'});
	
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		if (more) step_eight();
		else step_seven();
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		cancel();
		if (more) step_nine();
		else step_eight(1);
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':'','border-radius':''});
	}
}

function step_nine() {
	$('#guided_tour > p').html('Tangent ideas! (1)');	// Need better text
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'd6');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $('.tangent');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'background-color':'#fcfcfc','box-shadow':'0 0 10px 2px #fcfcfc','pointer-events':'all'})
		.parent().css({'opacity':'','color':'#8f8f8f'});
		
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		$(window).scrollTop(0);
		step_eight(1);
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		$('#guided_tour > p').html('Go ahead and click it!');
		$('.prev,.next').hide();
	});
	function cancel() {
		$target.off('click', next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':'','background-color':'','pointer-events':''})
			.parent().css({'color':''});
		$('#guided_tour').css('position','');
	}
	function next_step() {
		cancel();
		setTimeout(step_ten, 0);
	}
	
	$(window).scrollTop($target.offset().top - window.innerHeight*0.5);
	$('#guided_tour').css('position','fixed');
	$target.on('click', next_step);
}

function step_ten() {
	$('#guided_tour > p').html('Tangent ideas! (2)');	// Need better text
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'd6');
	if ($('.preview_window').index() == -1) {
		$(window).scrollTop($('.tangent').offset().top - window.innerHeight*0.5);
		$('.tangent').click();
	}
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right');
	var $target = $('.preview_window');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$target.css({'box-shadow':'0px 0px 4px 0px #555, 0px 0px 10px 2px #FCFCFC','background-color':'#fcfcfc'});
	
	$('.prev').off('click').show().html('Back').on('click',function() {
		cancel();
		$target.children('.preview_exit').click();
		step_nine();
	});
	$('.next').off('click').show().html('Next').on('click',function() {
		$('#guided_tour > p').html('Go ahead and click it!');
		$('.prev,.next').hide();
	});
	function cancel() {
		$target.children('.preview_main').off('click', next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$target.css({'box-shadow':'','background-color':''});
		$(window).scrollTop(0);
		$('#guided_tour').css('position','');
	}
	function next_step() {
		cancel();
		step_eleven();
	}
	
	$('#guided_tour').css('position','fixed');
	$target.children('.preview_main').on('click', next_step);
}

function step_eleven() {
	$('#guided_tour > p').html('And we\'re done!');
	$('.prev').off('click').show().html('Back').on('click',function() {
		step_ten();
	});
	$('.next').off('click').show().html('Done').on('click', end_tour);
}

function end_tour() {
	$('#guided_tour').animate({'top':'-65px'}, 800, function() {
		$(this).remove();
	});
}

$(document).ready(function() {
	guided_tour();
});
