jQuery(document).ready(function(){
	var converter = new Markdown.getSanitizingConverter();
	var editor = new Markdown.Editor(converter);
		
	editor.run();

	$("#rating-spinner").spinner({
		max: 5,
		min: 0,
		page: 1,
		step: .5,
	});

	$(".preview-review").click(function(){
		$(".review-preview").dialog({width: 'auto'});
	});

	$('.submit-review').click(function(){
		console.log(converter.makeHtml($('#wmd-input').val()));
		/*
		$.post('/reviews/new', {
			reviewTitle: $('#review-title').val(),
			gameTitle: $('#game-title').val(),
			gameRating: $('#rating-spinner').spinner("value"),
			reviewSnippet: $('#review-snippet').val(),
			reviewBody: converter.makeHtml($('#wmd-input').val()),
		}, function(data, success){
			if(success)
				alert("review posted");
		});*/
	});
});