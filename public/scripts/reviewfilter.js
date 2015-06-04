jQuery(document).ready(function(){
	$('.list-group-item').click(function(event){
		event.preventDefault();
		$(this).toggleClass('active');
		filterReviews();
	});

	$('.reviews-area').on('click', 'div.review-item', function(event){
		if(!$(event.target).is('.panel-footer, a, img')){
			$(this).children('.full-review').toggle("slow");
			$(this).children('.review-snippet').toggle("slow");
		}
	});

	$('#search-query').on('change input', function(){
		filterReviews();
	});

	function filterReviews(){
		var query = $('#search-query').val();
		var platforms = $(".list-group-item.active").map(function(){
			return $.trim($(this).text());
		}).get();
		$.post('/reviews/filter', {platforms: platforms, query: query}, function(data, success){
			if(success)
				$('.reviews-area').html(data);
		});
	}
});