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

	$('.update-review').click(function(){
		var reviewId = $('.review-area').attr('id');
		$.post('/reviews/' + reviewId + '/edit/', {
			reviewTitle: $('#review-title').val(),
			gameRating: $('#rating-spinner').spinner("value"),
			reviewSnippet: $('#review-snippet').val(),
			reviewBody: $('#wmd-input').val(),
		}, function(data, success){
			if(success)
				alert("review updated");
		});
	});
});