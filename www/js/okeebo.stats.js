/*
 * Okeebo Reading Statistics JavaScript
 * author: Ben Pedersen
 * 
 */

var time = new Date();
var stats = {};
var read_path = ['Z1'];

$(document).ready(function(event) {
	
	var _show = $.fn.show;
	var _hide = $.fn.hide;
	var _fadeOut = $.fn.fadeOut;
	
	$.fn.show = function(){
    	_show.apply(this,arguments).trigger("show");
	};
	$.fn.hide = function(){
    	_hide.apply(this,arguments).trigger("hide");
	};
	$.fn.fadeOut = function(){
    	_fadeOut.apply(this,arguments).trigger("fadeOut");
	};
	
	$('body').on('fadeOut hide','.inner,.outer',function(event) {
		recordStats($(this));
	}).on('show','.inner,.outer',function(event) {
		var keys = $(this).attr('class').replace('inner ','').replace('outer ','');
		read_path.push(keys);
	});
	$(window).on('scroll',function(event) {
		recordStats();
	});
	
});

function recordStats(page) {
	if (typeof(page) === 'undefined') page = $('.inner,.outer').filter(':visible');
	var newTime = new Date();
	var keys = page.attr('class').replace('inner ','').replace('outer ','');
	var _win = $(window);
	var _doc = $(document);
	var ratio = (_win.scrollTop()||_doc.scrollTop())/(_doc.height()-_win.height());
	ratio = Math.round(ratio*10);
	var timeDif = newTime.valueOf() - time.valueOf();
	if (stats[keys]) stats[keys][0] += timeDif;
	else stats[keys] = [timeDif,{}];
	if (stats[keys][1][ratio]) stats[keys][1][ratio] += timeDif;
	else stats[keys][1][ratio] = timeDif;
	time = newTime;
}

function ShowStats(pretty) {
	recordStats();
	if (pretty) {
		var results;
		for (var i in stats) {
			var data = i + '\t' + stats[i][0] + '\t->';
			for (var j=0; j<11; ++j) if (stats[i][1][j]) data += '\t' + stats[i][1][j];
			if (results) results += '\n ';
			else results = '';
			results += data;		
		}
		return results;
	}
	else return stats;
}