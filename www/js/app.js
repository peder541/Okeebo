// JavaScript Document

$(document).on('ready',function(event) {
	$('body').on('click','a',function(event) {
		var $url = $(this).attr('href');
		if ($url.substr(0,22) == "https://www.okeebo.com") {
			$.get($url,function(data) {
				document.write(data);
				document.close();
			});
			return false;
		}
		else {
			alert($url);
			return false;
		}
	});
});