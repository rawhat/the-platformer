jQuery(document).ready(function(){
	$('.show-post-likers').click(function(event){
		event.preventDefault();
		if(parseInt($(this).text()) != 0){
			var postId = $(this).closest(".user-post").attr('id');
			$.get('/post/' + postId + '/likers', function(data, success){
				if(success)
					$('.liker-popup').html(data).dialog();
			});
		}
	});

	$(".show-comment-likers").click(function(event){
		event.preventDefault();
		if(parseInt($(this).text()) != 0){
			var commentId = $(this).closest(".comment-area").attr('id');
			$.get('/comment/' + commentId + '/likers', function(data, success){
				if(success)
					$('.liker-popup').html(data).dialog();
			});
		}
	});
});