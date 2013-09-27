/*
 * Okeebo Graph JavaScript
 * author: Ben Pedersen
 * 
 */

var padding = 30;
var radius = padding/4;
var w = 1280, h = 800;
var s = 0;
var info_timer;		// Redundant with okeebo.js
var graph_timer;
var noSVG = false;
var return_page_id = 'Z1';
var _hover = null, edge = null;
var darkColor = ['rgb(44,67,116)','#2c4374','rgb(44,116,67)','#2c7443'];
var liteColor = ['rgb(89,144,233)','#5990e9','rgb(89,233,144)','#59e990'];
var continuous = false;

$(document).ready(function(event) {
	
	//toggle_graph();
	
	$('body').append('<div id="noSVG"><!--[if lt IE 9]><script type="text/javascript">noSVG = true;</script><![endif]--></div>');
	$('#noSVG').remove();
	
	$(window).on('resize', function() {
		/// Might want a more specific selector to accommodate other uses of svg.
		if ($('svg').is(':visible')) {
			var sidebar = $('#sidebar');
			if (sidebar.is(':visible')) s = sidebar.outerWidth();
			else s = 0;
			w = $(window).width();
			h = $(window).height();
			update_graph();
			draw_lines();
		}
	});
	
	$(document).on('keyup',function(event) {
		if ($('svg').is(':visible')) {
			if (event.which == 13) {
				if (_hover) {
					if ($('a[href="#tangent"]').html()) {
						link_tangent(d3.select(_hover[0]).data()[0][0]);
						toggle_graph();
					}
					else {
						toggle_graph();
						var page_id = d3.select(_hover[0]).data()[0][0];
						var summary_id = String.fromCharCode(page_id.charCodeAt(0)-1) + page_id.substr(1);
						insert_page($('#' + summary_id).clone(),$('.' + page_id),1);
						if (continuous) toggle_graph(1);
					}
				}
			}
			if (event.which == 46) {
				if (_hover) {
					toggle_graph();
					go_to(return_page_id,d3.select(_hover[0]).data()[0][0]);
					delete_page();
					if (continuous) toggle_graph(1);
				}
				if (edge) {
					toggle_graph();
					delete_edge(edge);
					if (continuous) toggle_graph(1);
				}
			}
			if (event.which == 27) {
				toggle_graph();
			}
		}
	});
	
});

function toggle_graph(flicker) {
	if (noSVG) return false;
	if ($('svg').is(':visible')) {
		if (typeof(go_to) === 'undefined') return false;
		$('svg').remove();
		$('body').css('background-color','');
		$('#menu,#map,' + writing_buttons + ',.left,.right,#map_helper,#home,#function').show();
		$('#info').hide().css({'color':'','text-shadow':'','font-size':'','margin-right':''});
		if (info_timer) clearTimeout(info_timer);
		$('#status').hide().css({'top':'','bottom':''});
		if (status_timer) clearTimeout(status_timer);
		undo_tangent();
		go_to(null,return_page_id);
	}
	else {
		return_page_id = $('.inner,.outer').filter(':visible').attr('id');
		$('.inner,.outer,#menu,#map,' + writing_buttons + ',.left,.right,#map_helper,#home,#function').hide();
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
		if (!flicker) $('#status').html('Press Esc to quit viewing graph.')
			.css({'left':w*0.5-$('#status').outerWidth()*0.5,'top':h*0.5-$('#status').outerHeight()*0.5,'bottom':'auto'})
			.fadeIn();
		status_timer = setTimeout("$('#status').fadeOut();",2400);
		_hover = null, edge = null;
	}
}

function draw_graph() {
	
	var d1 = new Date();
			
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
					//return d3.max(array,function(data) { return data.charCodeAt(0) });
				}) ])
				.range([padding,h-2*padding]);
				
	var xScale = {};
	var same_row = {};
	
	svg.selectAll('circle')
		.data(dataset)
		.enter()
		.append('circle')
		.attr('cy',function(d,i) {
			return yScale(d[0].charCodeAt(0));
			//return yScale(d3.max(d,function(data) { return data.charCodeAt(0) }));
		})
		.attr('cx',function(d,i) {
			var _this = $('circle').eq(i);
			var cy = _this.attr('cy')
			if (!same_row[cy]) 
				same_row[cy] = $('[cy="' + cy + '"]');
					
			if (!xScale[cy]) 
				xScale[cy] = d3.scale.linear()
							.domain([0.5, d3.max(d3.selectAll(same_row[cy]).data(), function(array) {
								return parseInt(array[0].substr(1),10);
							}) + 0.5 ])
							.range([s + padding, w - padding]);
							
			return xScale[cy](parseInt(d[0].substr(1),10));
		})
		.attr('r',radius = padding/Math.pow(Math.max($('circle').index($('circle').last()),1),0.3))
		.sort(function(a,b) {
			var chr_sort = a[0].charCodeAt(0) - b[0].charCodeAt(0);
			if (chr_sort != 0) return chr_sort;
			var int_sort = a[0].substr(1) - b[0].substr(1);
			return int_sort;
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
	}).on('click',function(event) {
		var _this = $(this);
		if (event.shiftKey) {
			var _this_id = d3.select(_this[0]).data()[0];
			return_page_id = _this_id[0];
			if (return_page_id == '`1') return_page_id = 'Z1';
			toggle_graph();
			if (continuous) toggle_graph(1);
			return;
		}
		handle_circle_click(_this,0,$('path'));
	});
	
	var d2 = new Date();
	console.log('Draw Graph:', d2.valueOf() - d1.valueOf());
}

function handle_circle_click(_this,no_timer,$path) {
	if (!no_timer) var d1 = new Date();
	//var path = $('path[d$=" ' + _this.attr('cx') + ' ' + _this.attr('cy') + '"]');
	var data = d3.select(_this[0]).data()[0];
	var path = $('');
	for (var i=0; i < data.length; ++i) {
		var parent = data[i];
		var _path = $path.filter(function() {
			var _child = d3.select(this).data()[0];
			/**/
			// ^ toggles WORKS to DRAFT
			// WORKS
			var _parent = d3_get_parent_tag(_child);
			if (parent == _parent || (parent == '`1' && _parent == 'Z1')) return true;
			else return false;
			/*/
			// DRAFT
			var _parent = d3_get_parent_tag(_child);
			while (_parent) {
				if (parent == _parent || (parent == '`1' && _parent == 'Z1')) return true;
				_parent = d3_get_parent_tag(_parent);
			}
			return false;
			/**/
		});
		path = path.add(_path);
	}
	if (path.index() == -1) return false;
	var compare = d3.selectAll(path).data();
	var circles = d3.selectAll('circle').filter(function(d,i) {
		// Handles proper collapsing of sub-branches
		var _this = $(this);
		var color = _this.css('fill').replace(/\s/g,'').toLowerCase();
		var _return = 0;
		if (d.length > 1) for (var i=0; i<d.length; ++i) {
			var route = $path.filter(function() {
				return d3.select(this).data()[0] == d[i];
			});
			if (route.css('display') == 'inline' && path.index(route) == -1) return false;
		}
		for (var i=0; i<d.length; ++i) {
			if (-1 != compare.indexOf(d[i])) {
				if (liteColor.indexOf(color) != -1 || _this.css('display') == 'none') {
					if (!(liteColor.indexOf(color) != -1 && _this.css('display') == 'none')) /**/handle_circle_click(_this,1,$path);
					/*{	if (_this.css('display') == 'none') _this.css('fill',liteColor[0]).show();
						else _this.css('fill',darkColor[0]).hide();
					}*/
					else {
						var _path = $path.filter('[d$="' + _this.attr('cx') + ' ' + _this.attr('cy') + '"]');
						if (_path.index() != -1) _this.css('fill',darkColor[0]);//.show();
					}
				}
				else _this.css('fill',liteColor[0]);//.hide();
				return true;
			}
		}
		return false;
	});
	
	if (path.css('display') == 'none') {
		path.show();
		/**/circles.style('display','inline');
		_this.css('fill',liteColor[0]);
	}
	else {
		path.hide();
		/**/circles.style('display','none');
		_this.css('fill',darkColor[0]);
	}
	if (graph_timer) clearTimeout(graph_timer);
	graph_timer = setTimeout("update_graph(); draw_lines();",0);
	if (!no_timer) {
		var d2 = new Date();
		console.log('Click Response', d2.valueOf() - d1.valueOf());
	}
}

function update_graph() {
	
	var d1 = new Date();
	
	var svg = d3.select('svg').attr('width',w-17).attr('height',h-17);
	
	var circle = svg.selectAll('circle');
	
	var yScale = d3.scale.linear()
				.domain([96,d3.max(circle.data(),function(array) { 
					return array[0].charCodeAt(0);
				}) ])
				.range([padding,h-2*padding]);
	
	var xScale = {};
	var xScale_visible = {};
	var same_row = {};
	var same_row_visible = {};
	
	circle.attr('cy',function(d,i) {
			return yScale(d[0].charCodeAt(0));
		})
		.attr('cx',function(d,i) {
			var _this = $(this);
			var cy = _this.attr('cy');
			if (!same_row[cy]) 
				same_row[cy] = $('[cy="' + cy + '"]');
			if (!same_row_visible[cy]) 
				same_row_visible[cy] = same_row[cy].filter(function() { return $(this).css('display') != 'none' });
			// original xScale
			if (!xScale[cy]) 
				xScale[cy] = d3.scale.linear()
							.domain([0.5, d3.max(d3.selectAll(same_row[cy]).data(), function(array) {
								return parseInt(array[0].substr(1),10);
							}) + 0.5 ])
							.range([s + padding, w - padding]);
			
			// new xScale to account for hiding nodes
			if (!xScale_visible[cy])
				xScale_visible[cy] = d3.scale.linear()
							.domain([-0.5, same_row_visible[cy].index(same_row_visible[cy].last())+0.5])
							.range([s + padding, w - padding]);
							
			if (same_row[cy].length == same_row_visible[cy].length || _this.css('display') == 'none')
				return xScale[cy](parseInt(d[0].substr(1),10));
			else
				return (xScale[cy](parseInt(d[0].substr(1),10)) + xScale_visible[cy](same_row_visible[cy].index(_this)))/2;
			
		})
		.attr('r',radius);
		
	var d2 = new Date();
	
	console.log('Update Graph:', d2.valueOf() - d1.valueOf());
}

function draw_lines() {
	
	var d1 = new Date();
	
	//d3.selectAll('line').remove();
	d3.selectAll('path').remove();
	
	var circle = d3.selectAll('circle');
	
	if (return_page_id == 'Z1') {
		var active = circle.filter(function(data,index) { for (var k=0; k < data.length; ++k) if (data[k] == '`1') return true; });
		var color = active.style('fill').replace(/\s/g,'').toLowerCase();
		active.style('fill',(darkColor.indexOf(color) != -1) ? darkColor[3] : liteColor[3]);
	}
	
	var pos = {};
	
	circle.each(function(d,i) {
		var _this = d3.select(this);
		for (var j=0; j < d.length; ++j) pos[d[j]] = [_this.attr('cx'),_this.attr('cy'),_this.style('fill'),_this.style('display')];
	});
	pos['Z1'] = pos['`1'];
	
	circle.each(function(d,i) {
		for (var j=0; j < d.length; ++j) {
			var id = d[j];
			if (id == return_page_id) {
				var color = d3.select(this).style('fill').replace(/\s/g,'').toLowerCase();
				$(this).css('fill',(darkColor.indexOf(color) != -1) ? darkColor[3] : liteColor[3]);
			}
			var parent = d3_get_parent_tag(id);
			if (parent) {
				if (pos[parent]) {
					var path_data = 'M ' + pos[id][0] + ' ' + pos[id][1] + ' ';
					var mid_x = pos[id][0]*0.5 + pos[parent][0]*0.5;
					if (pos[parent][1] == pos[id][1]) {
						var mid_y = pos[id][1]*1.0 + pos['b1'][1]*0.45 - pos['Z1'][1]*0.45;
						var q1_y = pos[id][1]*1.0 + pos['b1'][1]*0.4 - pos['Z1'][1]*0.4;
						var q3_y = q1_y;
					}
					else {
						var mid_y = pos[id][1]*0.5 + pos[parent][1]*0.5;
						var q1_y = pos[id][1]*0.75 + pos[parent][1]*0.25;
						var q3_y = pos[id][1]*0.25 + pos[parent][1]*0.75;
					}
					path_data += 'Q ' + pos[id][0] + ' ' + q1_y + ' ' + mid_x + ' ' + mid_y + ' ';
					path_data += 'Q ' + pos[parent][0] + ' ' + q3_y + ' ' + pos[parent][0] + ' ' + pos[parent][1];
					
					var color = pos[parent][2].replace(/\s/g,'').toLowerCase();
						
					d3.select('svg').append('path')
						.attr('d',path_data)
						.attr('stroke','black')
						.attr('stroke-width','1')
						.attr('fill','none')
						.data([id])
						.style('display',
							(darkColor.indexOf(color) != -1 || pos[parent][3] == 'none' || pos[id][3] == 'none')
								? 'none' : 'inline');
				}
			}
		}
	});
	 
	$('path').on('mouseover',function(event) {
		edge = d3.select($(this)[0]).data()[0];
	}).on('mouseout',function(event) {
		edge = null;
	});
	
	var d2 = new Date();
	
	console.log('Draw Lines:',d2.valueOf() - d1.valueOf());
	 
}

function d3_get_parent_tag(id) {
	var test_l = String.fromCharCode(id.charCodeAt(0)-2);
	if (!id || test_l=='?' || test_l=='X' || test_l=='^') return false;
	if (test_l=='`') test_l='Z';
	var hit_l = String.fromCharCode(id.charCodeAt(0)-1);
	var hit_n = id.substr(1);
	var parent = $('#'+hit_l+hit_n).parent();
	var parent_class = parent.attr('class').split(' ');
	for (var i=0; i<parent_class.length; ++i) {
		if ((parent_class[i] != 'outer') && (parent_class[i] != 'inner') && (parent_class[i].charAt(0) == test_l)) return parent_class[i];
	}
	return false;
}