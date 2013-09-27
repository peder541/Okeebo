// JavaScript Document

$(document).on('ready',function(event) {
	$('body').on('click','a',function(event) {
		alert($(this).attr('href'));
		return false;
	});
});