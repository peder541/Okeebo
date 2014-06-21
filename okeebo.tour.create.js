/*
 * Okeebo Guided Tour JavaScript (content creation)
 * author: Ben Pedersen
 * 
 */
 
function step_one() {
	$('#guided_tour > p').html((continuedTour ? 'Now we' : 'This tour') + ' will cover the writing software.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	
	var $noClick = $children.add($background);
	
	var cancel = setStylings($(), $noClick, $(), {});
	
	prevClick(function() {
		cancel();
		guided_tour(1);
	});
	nextClick(function() {
		cancel();
		if (continuedTour) {
			step_three();
		}
		else step_two();
	});
	if ($('#sidebar').is(':visible')) delete_sidebar();
}

function step_two() {
	$('#guided_tour > p').html('If you want a tour on navigation, click &nbsp;<span>Read</span>');
	
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
		step_one();
	});
	nextClick(function() {
		cancel();
		step_three();
	});
	
	function continueTour() {
		window.localStorage.setItem('continueTour','true');	
	}
	$('#function').on('click',continueTour);
	$('#guided_tour > p > span').css({'font-variant':$target.css('font-variant'),'font-family':$target.css('font-family')});
	scrollToTopOf($target,1);
}

// Real start of this tour
function step_three() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Click this to insert a new section.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#new_page');

	var $dim = $children.add($background).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow': '0 0 20px 10px rgb(252, 252, 252)'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel()
		if (continuedTour) step_one();
		else step_two();
	});
	nextClick();
	
	function next_step() {
		cancel();
		step_four();
	}
	$target.on('click',next_step);
	setTimeout(function() { scrollToTopOf($target,1); }, 10);
}

function step_four() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('This is the section you just inserted.');	
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children();
	var $target = $('#a4');
	var $in = $target.prev('.in');
	var $targetChildren = $target.children();
	var $targetDivs = $targetChildren.filter('div');
	
	var $noClick = $children.add($background).not($target);
	var $dim = $noClick.not($in);
	$noClick = $noClick.add($targetChildren);
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'0 4px 4px 0'};
	var inCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)'};
	var targetDivsCSS = {'box-shadow':'0 0 10px 0 rgb(252,252,252)'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS, $in, inCSS, $targetDivs, targetDivsCSS);
	
	prevClick(function() {
		cancel()
		$('#a4').children('.delete').click();
		step_three();
	});
	nextClick(function() {
		cancel();
		step_five();
	});
}

function step_five() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Type here to edit the section\'s title.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#a4').children('span').eq(0);
	
	var $dim = $children.add($background).not($target.parent()).add($target.siblings());
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		cancelCSS();
		lose_focus();	
	}
	
	prevClick(function() {
		cancel()
		step_four();
	});
	nextClick(function() {
		cancel();
		step_six();
	});
}

function step_six() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Type here to edit the section summary.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#a4').children('span').eq(1);
	
	var $dim = $children.add($background).not($target.parent()).add($target.siblings());
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		cancelCSS();
		lose_focus();	
	}
	
	prevClick(function() {
		cancel()
		step_five();
	});
	nextClick(function() {
		cancel();
		step_seven();
	});
}

function step_seven() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Let\'s look at the section in more detail.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children();
	var $target = $children.filter('.in').last();
	
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
		step_six();
	});
	nextClick(function() {
		$target[0].click();
	});
	
	function next_step() {
		$page.one('hide', function(event) {
			cancel();
			step_eight();
		});
	}
	$target.on('click',next_step);
	scrollToTopOf($target,1);
}

function step_eight(instant) {
	$('#guided_tour > p').html('You can also edit the section\'s title here.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $children.filter('h3');
	$children = $children.not($target);
	
	var $dim = $background;
	var $noClick = $dim.add($children);
	
	var targetCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS);
	
	function cancel() {
		cancelCSS();
		$children.css({'opacity':''});
		$page.css({'background-color':''});
		lose_focus();
	}
	
	$children.animate({'opacity':'0.3'}, {
		duration: instant ? 0 : 400,
		progress: function() {
			$page.css({'background-color':'rgba(252,252,252,' + $children.css('opacity') + ')'});
		},
		complete: function() {
			$page.css({'background-color':'rgba(252,252,252,0.3)'});
		}
	});
		
	prevClick(function() {
		cancel()
		step_seven();
	});
	nextClick(function() {
		cancel();
		step_nine();
	});
}

function step_nine() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Type here to edit the section\'s content.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children();
	var $target = $children.filter('div[contenteditable]');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		cancelCSS();
		lose_focus();
	}
	
	prevClick(function() {
		cancel();
		step_eight(1);
	});
	nextClick(function() {
		cancel();
		step_ten();
	});
}

function step_ten() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Click this to insert an image.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#img');
	var $divEdit = $page.children('div[contenteditable]');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow': '0 0 20px 10px rgb(252, 252, 252)'};
	var divEditCSS = {'outline':'0'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS, $divEdit, divEditCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel()
		step_nine();
	});
	nextClick();
	
	function next_step() {
		cancel();
		step_eleven();
	}
	$target.on('click',next_step);
}

function step_eleven() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Now you can find an image and upload it.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children();
	var $divEdit = $children.filter('div[contenteditable]');
	var $target = $divEdit.children('iframe');
	
	var $dim = $children.add($background).not($target.parent()).add($target.parent().children().not($target));
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	$divEdit.attr('contenteditable','false');
	
	function cancel() {
		cancelCSS();
		$divEdit.attr('contenteditable','true');	
	}
	
	prevClick(function() {
		cancel();
		$page.find('iframe,img').filter(':visible').remove();
		step_ten();
	});
	nextClick(function() {
		cancel();
		step_twelve();
	});
}

function step_twelve() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Click this to insert a video.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#vid');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow': '0 0 20px 10px rgb(252, 252, 252)'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel()
		step_eleven();
	});
	nextClick();
	
	function next_step() {
		cancel();
		step_thirteen();
	}
	$target.on('click',next_step);
}

function step_thirteen() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Let\'s go back to the section summary.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children();
	var $target = $children.filter('.out');
	var $divEdit = $children.filter('div[contenteditable]');
	
	var $dim = $children.add($background).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)'};
	var divEditCSS = {'outline':'0'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS, $divEdit, divEditCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel();
		$page.find('video').filter(':visible').remove();
		step_twelve();
	});
	nextClick(function() {
		$target[0].click();
	});
	
	function next_step() {
		$page.one('hide', function(event) {
			cancel();
			transition();
		});
		var $outer = $('.outer');
		var $summary = $('#a4');
		var $in = $summary.prev('.in');
		
		var $noClick = $outer.children().not($summary);
		var $dim = $noClick.not($in);
		
		var outerCSS = {'background-color':'rgba(252,252,252,0.3)'};
		var summaryCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'0 4px 4px 0'};
		var inCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)'};
		
		setStylings($dim, $noClick, $summary, summaryCSS, $outer, outerCSS, $in, inCSS);
		
		function transition() {
			var $handle = $summary.children('.handle');
			var $animated = $summary.children().not($handle).add($in);
			var $noClick = $background;
			var $dim = $noClick;
			
			setStylings($dim, $noClick, $(), {});
			
			scrollToTopOf($handle, $handle.offset().top < $(window).scrollTop() + window.innerHeight, function() {
				$handle.css({'box-shadow': '0px 0px 8px 5px rgb(252, 252, 252)'});
				$animated.animate({'opacity':'0.3'}, {
					progress: function() {
						var calculated_opacity = ($dim.css('opacity') - 0.3) / 0.7;
						$summary.css('background-color','rgba(252,252,252,' + calculated_opacity + ')')
							.add($in).css('box-shadow','0 0 10px 2px rgba(252,252,252,' + calculated_opacity + ')');
					},
					complete: function() {
						$summary.css('background-color','').add($in).css('box-shadow','');
						step_fourteen();
					}
				});
			});
		}
	}
	$target.on('click',next_step);
}


function step_fourteen($target) {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Grab this to move the section.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $target || $children.filter('#a4');
	$target = $target.children('.handle');
	
	var $dim = $children.add($background).not($target.parent()).add($target.siblings());
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow': '0px 0px 8px 5px rgb(252, 252, 252)'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('mousedown',moveSummary);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel()
		var $a4 = $target.parent();
		var id = $a4.attr('id');
		if (id != 'a4') {
			var pageKey = String.fromCharCode(id.charCodeAt(0)+1) + id.slice(1);
			$('.Z1').append($a4).children('p[id]').each(function(i) {
				this.id = 'a' + (i+1);
				$(this).before($('.a' + (i+1)));
			});
			$('.' + pageKey).attr('class','inner b4');
			$('.outer.inner').each(function(i) {
				$(this).attr('class', 'outer inner b' + (i+1));
			});
		}
		step_thirteen();
	});
	nextClick(function() {
		cancel();
		step_fifteen($target.parent());
	});
	
	function moveSummary(event) {
		cancel();
		
		var $this = $(event.target);
		var $target = $this.parent();
		var $in = $target.prev('.in');
		
		var $page = $('.Z1');
		var $children = $page.children();
		var $groupA = $children.filter('.in').not($in);
		var $groupB = $groupA.next('p[id]').not($target);
		
		var $noClick = $children.add($background).not($groupB).not($target);
		var $dim = $noClick.add($groupB.children()).not($in);
		
		var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
		var groupBCSS = {'background-color':'rgba(252,252,252,0.3)','border-radius':'0 4px 4px 0','box-shadow':'0 0 10px 2px rgba(252,252,252,0.3)'};
		var groupACSS = {'box-shadow':'0 0 10px 2px rgba(252,252,252,0.3)'};
		var targetCSS = {'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)'};
		var inCSS = {'box-shadow':'0 0 10px 2px rgb(252,252,252)'}
		
		var cancel2 = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS, $groupA, groupACSS, $groupB, groupBCSS, $in, inCSS);
		
		$(document).one('mouseup mouseout drop', function(event) {
			cancel2();
			step_fourteen($target);
		});
	}
	$target.one('mousedown',moveSummary);
}

function step_fifteen($target) {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Click this to delete the section.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $target || $children.filter('#a4');
	$target = $target.children('.delete');
	
	var $dim = $children.add($background).not($target.parent()).add($target.siblings());
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var targetCSS = {'box-shadow': '0 0 8px 5px rgb(252, 252, 252)', 'background-color': 'rgb(252, 252, 252)', 'border-radius': '4px'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
	}
	
	prevClick(function() {
		cancel()
		step_fourteen($target.parent());
	});
	nextClick();
	
	function next_step() {
		cancel();
		step_sixteen();
	}
	$target.on('click',next_step);
}

function step_sixteen() {
	$('#guided_tour > p').html('Click this to open the sidebar.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#menu');
	
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
		undo_page_delete();
		step_fifteen();
	});
	nextClick();
	
	function next_step() {
		cancel();
		step_seventeen();
		$(window).resize();
	}
	$target.on('click',next_step);	
}

function step_seventeen() {
	$('#guided_tour > p').html('The sidebar has a menu of additional actions.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $target = $('#sidebar');
	
	var $dim = $children.add($background);
	var $noClick = $dim.add($target);
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	
	var cancel = setStylings($dim, $noClick, $(), {}, $page, pageCSS);
	
	prevClick(function() {
		cancel();
		delete_sidebar();
		$(window).resize();
		step_sixteen();
	});
	nextClick(function() {
		cancel();
		step_eighteen();
	});
}

function step_eighteen() {
	$('#guided_tour > p').html('Click this to see a visualization of the demo.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children();
	var $sidebar = $('#sidebar');
	var $target = $('#view_graph');
	$children = $children.add($sidebar.children());
	
	var $dim = $children.add($background).not($sidebar).add($sidebar.children()).not($target);
	var $noClick = $dim;
	
	var pageCSS = {'background-color':'rgba(252,252,252,0.3)'};
	var sidebarCSS = {'background-color':'rgba(85, 85, 85, 0.3)'};
	var targetCSS = {'background-color':'rgb(85, 85, 85)','box-shadow':'0 0 10px 2px rgb(51, 51, 51)'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS, $page, pageCSS, $sidebar, sidebarCSS);
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();	
	}
	
	prevClick(function() {
		cancel();
		step_seventeen();
	});
	nextClick();
	
	function next_step() {
		$(window).resize();
		cancel();
		step_nineteen();
	}
	$target.on('click',next_step);
}

function step_nineteen() {
	requireGraph();
	$('#guided_tour > p').html('This is the visualization.');
	
	var $noClick = $('svg,buttons').filter(':visible').not('#guided_tour').css('pointer-events','none');
	prevClick(function() {
		$noClick.css('pointer-events','');
		toggle_graph();
		create_sidebar();
		step_eighteen();
		$('#guided_tour').css({'top':'','border-radius':''});
		$(window).resize();
	});
	nextClick(function() {
		$noClick.css('pointer-events','');
		step_twenty();
	});
}

function step_twenty(green) {
	requireGraph(1);
	$('#guided_tour > p').html(green ? 'It\'s green because that\'s where we were.' : 'This circle represents the demo\'s first screen.');
	
	var $circle = $('circle');
	var $target = $circle.eq(0);
	var $buttons = $('#graphMode,#new_page,#graphExit');
	
	var $noClick = $circle.add('path').add($buttons);
	var $dim = $noClick.not($target);
	
	var targetCSS = {'stroke-width':'3'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS);
	
	prevClick(function() {
		cancel();
		if (green) step_twenty();
		else step_nineteen();
	});
	nextClick(function() {
		cancel();
		if (green) step_twentyone();
		else step_twenty(1);
	});
}

function step_twentyone() {
	requireGraph(1);
	$('#guided_tour > p').html('These circles represent the sections.');
	
	var $circle = $('circle');
	var $target = $('[cy="' + $circle.eq(1).attr('cy') + '"]');
	var $buttons = $('#graphMode,#new_page,#graphExit');
	
	var $noClick = $circle.add('path').add($buttons);
	var $dim = $noClick.not($target);
	var targetCSS = {'stroke-width':'3'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS);
	
	prevClick(function() {
		cancel();
		step_twenty(1);
	});
	nextClick(function() {
		cancel();
		step_twentytwo();
	});
}

function step_twentytwo() {
	requireGraph(1);
	$('#guided_tour > p').html('These circles represent the subsections.');
	
	var $circle = $('circle');
	var $target = $('[cy="' + $circle.last().attr('cy') + '"]');
	var $buttons = $('#graphMode,#new_page,#graphExit');
	
	var $noClick = $circle.add('path').add($buttons);
	var $dim = $noClick.not($target);
	
	var targetCSS = {'stroke-width':'3'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS);
	
	prevClick(function() {
		cancel();
		step_twentyone();
	});
	nextClick(function() {
		cancel();
		step_twentythree();
	});
}

function step_twentythree() {
	requireGraph(1);
	$('#guided_tour > p').html('The visualization is currently in Collapse mode.');
	
	var $target = $('#graphMode');
	var $buttons = $('#graphMode,#new_page,#graphExit');
	
	var $noClick = $('circle,path').add($buttons);
	var $dim = $noClick.not($target);
	
	var targetCSS = {'box-shadow':'0 0 10px 2px #1F78B4'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS);
	
	prevClick(function() {
		cancel();
		step_twentytwo();
	});
	nextClick(function() {
		cancel();
		step_twentyfour();
	});
}

function step_twentyfour(unhide) {
	requireGraph(1);
	$('#guided_tour > p').html(unhide ? 'Click it again to uncollapse them.' : 'Click this circle to collapse its branches.');
	
	var $circle = $('circle');
	var $target = $circle.eq(1);
	var $buttons = $('#graphMode,#new_page,#graphExit');
	
	var $noClick = $circle.add('path').add($buttons).not($target);
	var $dim = $noClick;

	var targetCSS = {'stroke-width':'3'};
	
	var cancelCSS = setStylings($noClick, $dim, $target, targetCSS);
	$('body').append('<style id="tempPathStyling">path { stroke-opacity: 0.3; }</style>');
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
		$('#tempPathStyling').remove();
	}
	
	prevClick(function() {
		cancel();
		if (unhide) {
			$target.click();
			step_twentyfour();
		}
		else step_twentythree();
	});
	nextClick();
	
	function next_step() {
		cancel();
		if (unhide) step_twentyfive();
		else step_twentyfour(1);
	}
	$target.on('click',next_step);
}

function step_twentyfive() {
	requireGraph(1);
	$('#guided_tour > p').html('Click this to change modes.');
	
	var $target = $('#graphMode');
	var $buttons = $('#graphMode,#new_page,#graphExit');
	
	var $noClick = $('circle,path').add($buttons).not($target);
	var $dim = $noClick;
	
	var targetCSS = {'box-shadow':'0 0 10px 2px #1F78B4'};
	
	var cancelCSS = setStylings($dim, $noClick, $target, targetCSS);
	$('body').append('<style id="tempPathStyling">path { stroke-opacity: 0.3; }</style>');
	
	function cancel() {
		$target.off('click',next_step);
		cancelCSS();
		$('#tempPathStyling').remove();
	}	
	
	prevClick(function() {
		cancel();
		$('circle').eq(1).click();
		step_twentyfour(1);
	});
	nextClick();
	
	function next_step() {
		cancel();
		step_twentysix();	
	}
	$target.on('click', next_step);
}

function step_twentysix(info) {
	requireGraph(1);
	var instruction;
	info = info || 0;
	switch(info) {
		case 0:
			instruction = 'The visualization is now in Select mode.';
			break;
		case 1:
			instruction = 'Selecting a circle has three effects.';
			break;
		case 2:
			instruction = '1. It\'s where we\'ll go after the visualization.';
			break;
		case 3:
			instruction = '2. We can add new sections to it.';
			break;
		case 4:
			instruction = '3. We can connect circles to the selected one.';
			break;	
	}
	$('#guided_tour > p').html(instruction);
	
	var $target = $('#graphMode');
	var $buttons = $('#graphMode,#new_page,#graphExit');
	
	var $noClick = $('circle,path').add($buttons);
	var $dim = $noClick.not($target);
	
	var targetCSS = {'box-shadow':'0 0 10px 2px #2BFFAA'};
	
	var cancel = setStylings($dim, $noClick, $target, targetCSS);
	
	prevClick(function() {
		cancel();
		if (!info) {
			$target.attr('class','collapse').html('Collapse');
			step_twentyfive();
		}
		else {
			step_twentysix(info-1);	
		}
	});
	nextClick(function() {
		cancel();
		if (info < 4) step_twentysix(info+1);
		else step_twentyseven();
	});
}

function step_twentyseven() {
	requireGraph(1);
	
}

function lose_focus() {
	var sel = document.getSelection();
	$(sel.anchorNode).blur();
	if (sel.rangeCount) {
		var range = sel.getRangeAt(0);
		range.collapse();
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

function requireGraph(instant) {
	if (!$('svg').is(':visible')) {
		toggle_graph(instant);
		$(window).resize();
	}	
}
