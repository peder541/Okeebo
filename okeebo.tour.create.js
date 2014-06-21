/*
 * Okeebo Guided Tour JavaScript (content creation)
 * author: Ben Pedersen
 * 
 */
 
function step_one() {
	$('#guided_tour > p').html((window.localStorage.getItem('tour') == 'true' ? 'Now we' : 'This tour') + ' will cover the writing software.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
//	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none'/*,'opacity':'0.3'*/});
	
	prevClick(function() {
		cancel();
		guided_tour(1);
	});
	nextClick(function() {
		cancel();
		if (window.localStorage.getItem('tour') == 'true') {
			step_three();
		}
		else step_two();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
	}
}

function step_two() {
	$('#guided_tour > p').html('Click &nbsp;<span>Read</span>&nbsp; if you want a tour on navigation.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('#function');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'box-shadow':'0px 0px 3px 0px #555','border-radius':'6px','background-color':'rgba(31, 120, 180, 1)','padding':'4px','left':'76px','top':'5px'});
	
	prevClick(function() {
		cancel();
		step_one();
	});
	nextClick(function() {
		cancel();
		step_three();
	});
	function cancel() {
		$('#function').off('click');
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','border-radius':'','background-color':'','padding':'','left':'','top':''});
	}
	$('#function').off('click').one('click',function(event) {
		window.localStorage.setItem('tour','true');
	});
	$('#guided_tour > p > span').css({'font-variant':$target.css('font-variant'),'font-family':$target.css('font-family')});
	scrollToTopOf($target,1);
}

// Real start of this tour
function step_three() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Click this to insert a new section.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('#new_page');
	$children = $children.not($target);
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'box-shadow': '0 0 20px 10px rgb(252, 252, 252)'});
	
	prevClick(function() {
		cancel()
		if (window.localStorage.getItem('tour') == 'true') step_one();
		else step_two();
	});
	nextClick();
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','background-color':'','border-radius':''}).off('click', next_step);
	}
	function next_step() {
		cancel();
		step_four();
	}
	$target.on('click', next_step);
	setTimeout(function() { scrollToTopOf($target,1); }, 10);
}

function step_four() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('This is the section you just inserted.');	
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('#a4');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none'}).not($target.prev('.in')).css({'opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'0 4px 4px 0'})
		.prev('.in').css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
	$target.children().css('pointer-events','none').filter('div').css('box-shadow','0 0 10px 0 rgb(252,252,252)');
	
	prevClick(function() {
		cancel()
		$('#a4').children('.delete').click();
		step_three();
	});
	nextClick(function() {
		cancel();
		step_five();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'background-color':'','box-shadow':'','border-radius':''})
			.prev('.in').css({'box-shadow':''});
		$target.children().css('pointer-events','').css('box-shadow','');
	}
}

function step_five() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Type here to edit the section\'s title.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('#a4');
	$target = $target.children('span').eq(0);
	$children = $children.not($target.parent()).add($target.siblings());
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'});
	
	prevClick(function() {
		cancel()
		step_four();
	});
	nextClick(function() {
		cancel();
		step_six();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','background-color':''});
		lose_focus();
	}
}

function step_six() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Type here to edit the section summary.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('#a4');
	$target = $target.children('span').eq(1);
	$children = $children.not($target.parent()).add($target.siblings());
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'});
	
	prevClick(function() {
		cancel()
		step_five();
	});
	nextClick(function() {
		cancel();
		step_seven();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','background-color':''});
		lose_focus();
	}
}

function step_seven() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Let\'s look at the section in more detail.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('.in').last();
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
	
	prevClick(function() {
		cancel();
		step_six();
	});
	nextClick(function() {
		$target[0].click();
	});
	function cancel() {
		$target.off('click',next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':''}).next('p[id]').css({'background-color':'','box-shadow':''});
	}
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
	var $dim = $('.Z1').prevAll().add('.left,.right,.writing');
	var $children = $page.children();
	var $target = $children.filter('h3');
	$children = $children.not($target);
	
	$dim.css({'opacity':'0.3'}).add($children).css({'pointer-events':'none'});
	$('.writing').not($target).addClass('writingDim');
	$children.animate({'opacity':'0.3'}, {
		duration: instant ? 0 : 400,
		progress: function() {
			$page.css({'background-color':'rgba(252,252,252,' + $children.css('opacity') + ')'});
		},
		complete: function() {
			$page.css({'background-color':'rgba(252,252,252,0.3)'});
		}
	});
	$target.css({'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'});
	
	prevClick(function() {
		cancel()
		step_seven();
	});
	nextClick(function() {
		cancel();
		step_nine();
	});
	function cancel() {
		$page.css({'background-color':''});
		$dim.add($children).css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','background-color':''});
		lose_focus();
	}
}

function step_nine() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Type here to edit the section\'s content.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('div[contenteditable]');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'});
	
	prevClick(function() {
		cancel();
		step_eight(1);
	});
	nextClick(function() {
		cancel();
		step_ten();
	});
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','background-color':''});
		lose_focus();
	}
}

function step_ten() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Click this to insert an image.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('#img');
	$children = $children.not($target);
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$page.children('div[contenteditable]').css('outline','0');
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'box-shadow': '0 0 20px 10px rgb(252, 252, 252)'});
	
	prevClick(function() {
		cancel()
		step_nine();
	});
	nextClick();
	function cancel() {
		$page.css({'background-color':''});
		$page.children('div[contenteditable]').css('outline','');
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','background-color':'','border-radius':''}).off('click', next_step);
	}
	function next_step() {
		cancel();
		step_eleven();
	}
	$target.on('click', next_step);
}

function step_eleven() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Now you can find an image and upload it.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $div = $children.filter('div[contenteditable]');
	var $target = $div.children('iframe');
	$children = $children.not($target.parent()).add($target.parent().children().not($target));
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$div.attr('contenteditable','false');
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'4px'});
	
	prevClick(function() {
		cancel();
		$page.find('iframe,img').filter(':visible').remove();
		step_ten();
	});
	nextClick(function() {
		cancel();
		step_twelve();
	});
	function cancel() {
		$page.css({'background-color':''});
		$div.attr('contenteditable','true');
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','background-color':''});
	}
}

function step_twelve() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Click this to insert a video.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('#vid');
	$children = $children.not($target);
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$page.children('div[contenteditable]').css('outline','0');
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'box-shadow': '0 0 20px 10px rgb(252, 252, 252)'});
	
	prevClick(function() {
		cancel()
		step_eleven();
	});
	nextClick();
	function cancel() {
		$page.css({'background-color':''});
		$page.children('div[contenteditable]').css('outline','');
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','background-color':'','border-radius':''}).off('click', next_step);
	}
	function next_step() {
		cancel();
		step_thirteen();
	}
	$target.on('click', next_step);
}

function step_thirteen() {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'b4');
	$('#guided_tour > p').html('Let\'s go back to the section summary.');
	
	var $page = $('.inner,.outer').filter(':visible');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('.out');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$page.children('div[contenteditable]').css('outline','0');
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
	
	prevClick(function() {
		cancel();
		$page.find('video').filter(':visible').remove();
		step_twelve();
	});
	nextClick(function() {
		$target[0].click();
	});
	function cancel() {
		$target.off('click',next_step);
		$page.css({'background-color':''});
		$page.children('div[contenteditable]').css('outline','');
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':''}).next('p[id]').css({'background-color':'','box-shadow':''});
	}
	function next_step() {
		$page.one('hide', function(event) {
			cancel();
			transition();
		});
		var $page2 = $('.outer');
		var $target2 = $('#a4');
		var $children2 =  $page2.children().not($target2);
		$page2.css('background-color','rgba(252,252,252,0.3)');
		$children2.css('poiner-events','none').not($target2.prev('.in')).css('opacity','0.3');
		$target2.css({'background-color':'rgb(252,252,252)','box-shadow':'0 0 10px 2px rgb(252,252,252)','border-radius':'0 4px 4px 0'})
			.prev('.in').css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
		function transition() {
			var $summary = $target2;
			var $in = $summary.prev('.in');
			var $handle = $summary.children('.handle');
			var $dim = $summary.children().not($handle).add($in);
			var $gray = $('.Z1').prevAll().add('.left,.right,.writing');
			$gray.css('poiner-events','none').not($target2.prev('.in')).css('opacity','0.3');
			$('.writing').addClass('writingDim');
			
			scrollToTopOf($handle, $handle.offset().top < $(window).scrollTop() + window.innerHeight, function() {
				$handle.css({'box-shadow': '0px 0px 8px 5px rgb(252, 252, 252)'});
				$dim.animate({'opacity':'0.3'}, {
					progress: function() {
						var calculated_opacity = ($dim.css('opacity') - 0.3) / 0.7;
						$summary.css('background-color','rgba(252,252,252,' + calculated_opacity + ')')
							.add($in).css('box-shadow','0 0 10px 2px rgba(252,252,252,' + calculated_opacity + ')');
						//$handle.css({'box-shadow': '0px 0px 8px 5px rgba(252, 252, 252, ' + (1 - calculated_opacity) + ')' });
					},
					complete: function() {
						$summary.css('background-color','').add($in).css('box-shadow','');
						//$handle.css({'box-shadow': '0px 0px 8px 5px rgb(252, 252, 252)'});
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
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $target || $children.filter('#a4');
	$target = $target.children('.handle');
	$children = $children.not($target.parent()).add($target.siblings());
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'box-shadow': '0px 0px 8px 5px rgb(252, 252, 252)'});
	
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
	function cancel() {
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':''});
	}
	$target.one('mousedown', function(event) {
		cancel();
		var $this = $(event.target);
		var $target = $this.parent();
		var $page = $('.Z1');
		var $children = $page.children();
		var $groupA = $children.filter('.in');
		var $groupB = $groupA.next('p[id]');
		$children = $children.not($groupA).not($groupB).add($('.Z1').prevAll()).add('.left,.right,.writing');
		$page.css({'background-color':'rgba(252,252,252,0.3)'});
		$children.css({'pointer-events':'none','opacity':'0.3'});
		$('.writing').not($target).addClass('writingDim');
		$groupB.css({'background-color':'rgba(252,252,252,0.3)','border-radius':'0 4px 4px 0'})
			.add($groupA).css({'box-shadow':'0 0 10px 2px rgba(252,252,252,0.3)'});
		$groupA.not($target.prev('.in')).add($groupB.not($target).children()).css('opacity','0.3');
		$target.css({'background-color':'rgb(252,252,252)'}).add($target.prev('.in')).css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
		
		function cancel2() {
			$page.css({'background-color':''});
			$children.add($groupA).add($groupB.children()).css({'opacity':'','pointer-events':''});
			$('.writing').removeClass('writingDim');
			$groupB.css({'background-color':'','border-radius':''})
				.add($groupA).css({'box-shadow':''});
		}
		$(document).one('mouseup mouseout drop', function(event) {
			cancel2();
			step_fourteen($target);
		});
	});
}

function step_fifteen($target) {
	go_to($('.inner,.outer').filter(':visible').attr('id'), 'Z1');
	$('#guided_tour > p').html('Click this to delete the section.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $target || $children.filter('#a4');
	$target = $target.children('.delete');
	$children = $children.not($target.parent()).add($target.siblings());
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'box-shadow': '0 0 8px 5px rgb(252, 252, 252)', 'background-color': 'rgb(252, 252, 252)', 'border-radius': '4px'});
	
	prevClick(function() {
		cancel()
		step_fourteen($target.parent());
	});
	nextClick();
	function cancel() {
		$target.off('click', next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','background-color':'','border-radius':''});
	}
	function next_step() {
		cancel();
		step_sixteen();
	}
	$target.on('click', next_step);
}

function step_sixteen() {
	$('#guided_tour > p').html('Click this to open the sidebar menu.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('#menu');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').addClass('writingDim');
	$target.css({'box-shadow':'0 0 10px 2px rgb(252,252,252)'});
	
	prevClick(function() {
		cancel();
		undo_page_delete();
		step_fifteen();
	});
	nextClick();
	function cancel() {
		$target.off('click',next_step);
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'box-shadow':'','border-radius':''});
	}
	function next_step() {
		cancel();
		step_seventeen();
		$(window).resize();
	}
	$target.on('click',next_step);	
}

function step_seventeen() {
	$('#guided_tour > p').html('The sidebar is a menu of additional actions.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $target = $children.filter('#sidebar');
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$target.css({'pointer-events':'none'});
	
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
	function cancel() {
		$('#function').off('click');
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$target.css({'pointer-events':''});
	}
}

function step_eighteen() {
	$('#guided_tour > p').html('Click this to see a visualization of the demo.');
	
	var $page = $('.inner,.outer');
	var $children = $page.children().add($('.Z1').prevAll()).add('.left,.right,.writing');
	var $sidebar = $('#sidebar');
	var $target = $('#view_graph');
	$children = $children.add($sidebar.children());
	
	$page.css({'background-color':'rgba(252,252,252,0.3)'});
	$children.not($target).not($sidebar).css({'pointer-events':'none','opacity':'0.3'});
	$('.writing').not($target).addClass('writingDim');
	$sidebar.css('background-color','rgba(85, 85, 85, 0.3)');
	$target.css({'background-color':'rgb(85, 85, 85)','box-shadow':'0 0 10px 2px rgb(51, 51, 51)'});
	
	prevClick(function() {
		cancel();
		step_seventeen();
	});
	nextClick();
	function cancel() {
		$('#function').off('click');
		$page.css({'background-color':''});
		$children.css({'opacity':'','pointer-events':''});
		$('.writing').removeClass('writingDim');
		$sidebar.css('background-color','');
		$target.css({'background-color':'','box-shadow':''});
	}
	function next_step() {
		$(window).resize();
		cancel();
		step_nineteen();
	}
	$target.on('click', next_step);
}

function step_nineteen() {
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
	$('#guided_tour > p').html(green ? 'It\'s green because that\'s where we were.' : 'This circle represents the demo\'s first screen.');
	
	var $circle = $('circle');
	var $target = $circle.eq(0);
	var $dim = $circle.add('path').not($target);
	var $buttons = $('#graphMode,#new_page,#graphExit');
	$dim.css({'stroke-opacity':'0.3','fill-opacity':'0.3'});
	$buttons.css('opacity','0.3');
	$target.css({'stroke-width':'3'});
	$dim.add($buttons).add($target).css('pointer-events','none');
	
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
	function cancel() {
		$dim.css({'stroke-opacity':'','fill-opacity':''});
		$buttons.css('opacity','');
		$target.css({'stroke-width':''});
		$dim.add($buttons).add($target).css('pointer-events','');
	}
}

function step_twentyone() {
	$('#guided_tour > p').html('These circles represent the sections.');
	
	var $circle = $('circle');
	var $target = $('[cy="' + $circle.eq(1).attr('cy') + '"]');
	var $dim = $circle.add('path').not($target);
	var $buttons = $('#graphMode,#new_page,#graphExit');
	$dim.css({'stroke-opacity':'0.3','fill-opacity':'0.3'});
	$buttons.css('opacity','0.3');
	$target.css({'stroke-width':'3'});
	$dim.add($buttons).add($target).css('pointer-events','none');
	
	prevClick(function() {
		cancel();
		step_twenty(1);
	});
	nextClick(function() {
		cancel();
		step_twentytwo();
	});
	function cancel() {
		$dim.css({'stroke-opacity':'','fill-opacity':''});
		$buttons.css('opacity','');
		$target.css({'stroke-width':''});
		$dim.add($buttons).add($target).css('pointer-events','');
	}
}

function step_twentytwo() {
	$('#guided_tour > p').html('These circles represent the subsections.');
	
	var $circle = $('circle');
	var $target = $('[cy="' + $circle.last().attr('cy') + '"]');
	var $dim = $circle.add('path').not($target);
	var $buttons = $('#graphMode,#new_page,#graphExit');
	$dim.css({'stroke-opacity':'0.3','fill-opacity':'0.3'});
	$buttons.css('opacity','0.3');
	$target.css({'stroke-width':'3'});
	$dim.add($buttons).add($target).css('pointer-events','none');
	
	prevClick(function() {
		cancel();
		step_twentyone();
	});
	nextClick(function() {
		cancel();
		step_twentythree();
	});
	function cancel() {
		$dim.css({'stroke-opacity':'','fill-opacity':''});
		$buttons.css('opacity','');
		$target.css({'stroke-width':''});
		$dim.add($buttons).add($target).css('pointer-events','');
	}
}

function step_twentythree() {
	$('#guided_tour > p').html('The visualization is currently in Collapse mode.');
	
	var $target = $('#graphMode');
	var $dim = $('circle,path');
	var $buttons = $('#graphMode,#new_page,#graphExit').not($target);
	$dim.css({'stroke-opacity':'0.3','fill-opacity':'0.3'});
	$buttons.css('opacity','0.3');
	$target.css({'box-shadow':'0 0 10px 2px #1F78B4'});
	$dim.add($buttons).add($target).css('pointer-events','none');
	
	prevClick(function() {
		cancel();
		step_twentytwo();
	});
	nextClick(function() {
		cancel();
		step_twentyfour();
	});
	function cancel() {
		$dim.css({'stroke-opacity':'','fill-opacity':''});
		$buttons.css('opacity','');
		$target.css({'box-shadow':''});
		$dim.add($buttons).add($target).css('pointer-events','');
	}
}

function step_twentyfour(unhide) {
	$('#guided_tour > p').html(unhide ? 'Click it again to uncollapse them.' : 'Click this circle to hide its branches.');
	
	var $circle = $('circle');
	var $target = $circle.eq(1);
	/*
	var $path = $('path').filter('[d$="' + $target.attr('cx') + ' ' + $target.attr('cy') + '"]');
	$path.each(function() {
		var $this = $(this);
		var data = $this.attr('d').split(' ');
		var cx = data[1];
		var cy = data[2];
		$target = $target.add($circle.filter('[cx="' + cx + '"][cy="' + cy + '"]'));
	});
	$target = $target.add($path);
	*/
	
	var $dim = $('circle,path').not($target);
	var $buttons = $('#graphMode,#new_page,#graphExit');
	$dim.css({'stroke-opacity':'0.3','fill-opacity':'0.3'});
	$buttons.css('opacity','0.3');
	$target.css('stroke-width','3');
	$dim.add($buttons).css('pointer-events','none');
	
	prevClick(function() {
		cancel();
		if (unhide) {
			$target.click();
			step_twentyfour();
		}
		else step_twentythree();
	});
	nextClick();
	function cancel() {
		$dim.css({'stroke-opacity':'','fill-opacity':''});
		$buttons.css('opacity','');
		$target.css({'stroke-width':''});
		$('#tempPathStyling').remove();
		$dim.add($buttons).css('pointer-events','');
	}
	function next_step() {
		cancel();
		$('body').append('<style id="tempPathStyling">path { stroke-opacity: 0.3; }</style>');
		if (unhide) step_twentyfive();
		else step_twentyfour(1);
	}
	$target.on('click', next_step);
}

function step_twentyfive() {
	$('#guided_tour > p').html('Click this to change modes.');
	
	var $target = $('#graphMode');
	var $dim = $('circle,path');
	var $buttons = $('#graphMode,#new_page,#graphExit').not($target);
	$dim.css({'stroke-opacity':'0.3','fill-opacity':'0.3'});
	$buttons.css('opacity','0.3');
	$target.css({'box-shadow':'0 0 10px 2px #1F78B4'});
	$dim.add($buttons).css('pointer-events','none');
	
	prevClick(function() {
		cancel();
		//$('circle').eq(1).click();
		step_twentyfour(1);
	});
	nextClick();
	function cancel() {
		$dim.css({'stroke-opacity':'','fill-opacity':''});
		$buttons.css('opacity','');
		$target.css({'box-shadow':''});
		$dim.add($buttons).css('pointer-events','');
	}
	function next_step() {
		cancel();
		step_twentysix();	
	}
	$target.on('click', next_step);
}

function step_twentysix() {
	
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
