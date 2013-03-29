// JavaScript Document
var padding = 20;
var radius = padding/4;
var w = 1280;
var h = 800;
var s = 0;
var info_timer;  	// Redundant with okeebo.js
var noSVG = false;
var return_page_id = 'Z1';
var _hover = null;

$(document).ready(function(event) {
	
	//toggle_graph();
	
	$('body').append('<!--[if lt IE 9]><script type="text/javascript">noSVG = true;</script><![endif]-->');
	
	$(window).on('resize', function() {
		/// Might want a more specific selector to accommodate other uses of svg.
		if ($('svg').is(':visible')) {
			var sidebar = $('#sidebar');
			if (sidebar.is(':visible')) s = sidebar.outerWidth();
			else s = 0;
			w = $(window).width();
			h = $(window).height();
			update_graph();
			draw_lines()
		}
	});
	
	$(document).on('keyup',function(event) {
		if ($('svg').is(':visible')) {
			if (event.which == 13) {
				if (_hover) {
					toggle_graph();
					insert_page(null,$('.' + d3.select(_hover[0]).data()[0][0]),1);
				}
			}
			if (event.which == 46) {
				if (_hover) {
					toggle_graph();
					go_to(0,return_page_id,d3.select(_hover[0]).data()[0][0]);
					delete_page();
				}
			}
			if (event.which == 27) {
				toggle_graph();	
			}
		}
	});
	
});

function toggle_graph() {
	if (noSVG) return false;
	if ($('svg').is(':visible')) {
		if (typeof(go_to) === 'undefined') return false;
		$('svg').remove();
		$('body').css('background-color','');
		$('#menu,#map,#bold,#italic,#underline,#ol,#ul,.left,.right').show();
		$('#info').css({'color':'','text-shadow':'','font-size':'','margin-right':''});
		$('#status').hide().css({'top':'','bottom':''});
		if (status_timer) clearTimeout(status_timer);
		go_to(0,null,return_page_id);
	}
	else {
		return_page_id = $('.inner,.outer').filter(':visible').attr('id');
		$('.inner,.outer,#menu,#map,#bold,#italic,#underline,#ol,#ul,.left,.right').hide();
		if ($('#sidebar').is(':visible')) delete_sidebar();
		$('body').css('background-color','white');
		
		var sidebar = $('#sidebar');
		if (sidebar.is(':visible')) s = sidebar.outerWidth();
		else s = 0;
		w = $(window).width();
		h = $(window).height();
		draw_graph();
		draw_lines();
		if (status_timer) clearTimeout(status_timer);
		$('#status').html('Press Esc to quit viewing graph.')
			.css({'left':w*0.5-$('#status').outerWidth()*0.5,'top':h*0.5-$('#status').outerHeight()*0.5,'bottom':'auto'})
			.fadeIn();
		status_timer = setTimeout("$('#status').fadeOut();",2400);
	}
}

function draw_graph() {
			
	var svg = d3.select('body').append('svg').attr('width',w-17).attr('height',h-17);
	
	var dataset = new Array();
	
	$('.inner,.outer').each(function(index) {
		classes = $(this).attr('class').split(' ');
		if (classes.shift() == 'outer' && classes.shift() != 'inner') classes.push('`1');
		dataset.push(classes);
	});
	
	var yScale = d3.scale.linear()
				.domain([96,d3.max(dataset,function(array) { 
					return array[0].charCodeAt(0);
				}) ])
				.range([padding,h-2*padding]);
	
	svg.selectAll('circle')
		.data(dataset)
		.enter()
		.append('circle')
		.attr('cy',function(d,i) {
			return yScale(d[0].charCodeAt(0));
		})
		.attr('cx',function(d,i) {
			var _this = $('circle').eq(i);
			var same_row = $('[cy="' + _this.attr('cy') + '"]');
			
			/*		// Uses Page Location in DOM. Better to infer index placement from key value.
			var xScale = d3.scale.linear()
							.domain([-0.5, same_row.index(same_row.last()) + 0.5])
							.range([padding, $(window).width() - padding]);
							
			return xScale(same_row.index(_this));
			*/
			/**/			
			var xScale = d3.scale.linear()
							.domain([0.5, d3.max(d3.selectAll(same_row).data(), function(array) {
								return parseInt(array[0].substring(1,array[0].length),10);
							}) + 0.5 ])
							.range([s + padding, w - padding]);
							
			return xScale(parseInt(d[0].substring(1,d[0].length),10));			/**/
		})
		.attr('r',radius);
		
	$('svg').on('click', function(event) {
		var _this = $('circle').filter(function(index) {
			return ( (Math.abs($(this).attr('cx') - event.pageX) < 15) && (Math.abs($(this).attr('cy') - event.pageY) < 15) );
		});
		var _this_id = d3.select(_this[0]).data()[0];
		if (_this_id) {
			if (_this_id == '`1') _this_id = 'Z1';
			if (info_timer) clearTimeout(info_timer);
			$('#info').html($('.' + _this_id).children('h3').html());
			$('#info').css({'right':'auto','left':20,'top':7,'color':'#555','text-shadow':'0 1px 1px #AAA','font-size':'2em','margin-right':20});
			$('#info').fadeIn(200);
			info_timer = setTimeout("$('#info').fadeOut(200);",2000);
		}
	});
	
	$('circle').on('mouseover',function(event) {
		var _this = $(this);
		_hover = _this;
		var _this_id = d3.select(_this[0]).data()[0];
		if (_this_id) {
			if (_this_id == '`1') _this_id = 'Z1';
			if (info_timer) clearTimeout(info_timer);
			$('#info').html($('.' + _this_id).children('h3').html());
			$('#info').css({'right':'auto','left':20,'top':7,'color':'#555','text-shadow':'0 1px 1px #AAA','font-size':'2em','margin-right':20});
			info_timer = setTimeout("$('#info').fadeIn(200);",500);
		}
	}).on('mouseout',function(event) {
		if (info_timer) clearTimeout(info_timer);
		$('#info').fadeOut(200);
		_hover = null;
	});
	
}

function update_graph() {
	
	var svg = d3.select('svg').attr('width',w-17).attr('height',h-17);
	
	var circle = svg.selectAll('circle');
	
	var yScale = d3.scale.linear()
				.domain([96,d3.max(circle.data(),function(array) { 
					return array[0].charCodeAt(0);
				}) ])
				.range([padding,h-2*padding]);
	
	circle.attr('cy',function(d,i) {
			return yScale(d[0].charCodeAt(0));
		})
		.attr('cx',function(d,i) {
			var _this = $('circle').eq(i);
			var same_row = $('[cy="' + _this.attr('cy') + '"]');
							
			var xScale = d3.scale.linear()
							.domain([0.5, d3.max(d3.selectAll(same_row).data(), function(array) {
								return parseInt(array[0].substring(1,array[0].length),10);
							}) + 0.5 ])
							.range([s + padding, w - padding]);
							
			return xScale(parseInt(d[0].substring(1,d[0].length),10));
		})
		.attr('r',radius);
}

function draw_lines() {
	 
	 //d3.selectAll('line').remove();
	 d3.selectAll('path').remove();
	 
	 var circle = d3.selectAll('circle');
	 
	 circle.each(function(d,i) {
		 for (var j=0; j < d.length; ++j) {
			 var parent_id = d3_get_parent_tag(d[j]);
			 if (parent_id) {
				 var parent = circle.filter(function(data,index) {
					 for (var k=0; k < data.length; ++k) {
						 if (data[k] == parent_id || (parent_id == 'Z1' && data[k] == '`1')) return true;
					 }
			 	});
			 	if (parent) {
					var _this = d3.select(this);
					/*
					d3.select('svg').append('line')
						.attr('x1',_this.attr('cx'))
						.attr('y1',_this.attr('cy'))
						.attr('x2',parent.attr('cx'))
						.attr('y2',parent.attr('cy'));
						*/
					var path_data = 'M ' + _this.attr('cx') + ' ' + _this.attr('cy') + ' ';
					if (parent.attr('cy') == _this.attr('cy')) {
						//break;
						var mid_x = _this.attr('cx')*0.5 + parent.attr('cx')*0.5;
						var dif_y = $('circle').eq(1).attr('cy')*0.5 - $('circle').eq(0).attr('cy')*0.5;
						var mid_y = _this.attr('cy')*1.0 + dif_y*1.6;
						var q1_y = _this.attr('cy')*0.5 + mid_y*0.5;
						var q3_y = q1_y;
						path_data += 'Q ' + _this.attr('cx') + ' ' + q1_y + ' ' + mid_x + ' ' + (mid_y - dif_y*0.75) + ' ';
						path_data += 'Q ' + parent.attr('cx') + ' ' + q3_y + ' ' + parent.attr('cx') + ' ' + parent.attr('cy');
					}
					else {
						var mid_x = _this.attr('cx')*0.5 + parent.attr('cx')*0.5;
						var mid_y = _this.attr('cy')*0.5 + parent.attr('cy')*0.5;
						var q1_y = _this.attr('cy')*0.5 + mid_y*0.5;
						var q3_y = mid_y*0.5 + parent.attr('cy')*0.5;
						path_data += 'Q ' + _this.attr('cx') + ' ' + q1_y + ' ' + mid_x + ' ' + mid_y + ' ';
						path_data += 'Q ' + parent.attr('cx') + ' ' + q3_y + ' ' + parent.attr('cx') + ' ' + parent.attr('cy');
					}
						
					d3.select('svg').append('path')
						.attr('d',path_data)
						.attr('stroke','black')
						.attr('stroke-width','1')
						.attr('fill','none');
				}
			 }
		 }
	 });
	 
}

function d3_get_parent_tag(id) {
	var test_l = String.fromCharCode(id.charCodeAt(0)-2);
	if (!id || test_l=='?' || test_l=='X' || test_l=='^') return false;
	if (test_l=='`') test_l='Z';
	var hit_l = String.fromCharCode(id.charCodeAt(0)-1);
	var hit_n = id.substr(1,id.length-1);
	var parent = $('#'+hit_l+hit_n).parent();
	var parent_class = parent.attr('class').split(' ');
	for (var i=0; i<parent_class.length; ++i) {
		if ((parent_class[i] != 'outer') && (parent_class[i] != 'inner') && (parent_class[i].charAt(0) == test_l)) return parent_class[i];
	}
	return false;
}
