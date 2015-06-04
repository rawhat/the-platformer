jQuery(document).ready(function(){
	// "/img/png/glyphicons-344-thumbs-up.png"
	// "/img/png/glyphicons-345-thumbs-down.png"
	$('.post-div').on('click', '.post-like-button', function(event){
		event.preventDefault();
		var postId = $(this).closest('.user-post').attr('id');
		var $this = $(this)
		$.post('/post/' + postId + '/like', function(data, success){
			if(success){
				$.get('/post/' + postId, function(data, success){
					if(success){
						$this.closest('.user-post').html(data);
					}
				});
			}
		});
	});

	$('.post-div').on('click', ".post-dislike-button", function(event){
		event.preventDefault();
		var postId = $(this).closest('.user-post').attr('id');
		var $this = $(this)
		$.post('/post/' + postId + '/dislike', function(data, success){
			if(success){
				$.get('/post/' + postId, function(data, success){
					if(success){
						$this.closest('.user-post').html(data);
					}
				});
			}
		});
	});

	$('.post-div').on('click', ".comment-like-button", function(event){
		event.preventDefault();
		var commentId = $(this).closest('.comment-area').attr('id');
		var postId = $(this).closest('.comment-area').siblings('.user-post').attr('id');
		var $this = $(this)
		$.post('/comment/' + commentId + '/like', function(data, success){
			if(success){
				$.get('/post/' + postId, function(data, success){
					if(success){
						$this.closest('.comment-area').parents('.post-div').html(data);
					}
				});
			}
		});
	});

	$('.post-div').on('click', ".comment-dislike-button", function(event){
		event.preventDefault();
		var commentId = $(this).closest('.comment-area').attr('id');
		var postId = $(this).closest('.comment-area').siblings('.user-post').attr('id');
		var $this = $(this)
		$.post('/comment/' + commentId + '/dislike', function(data, success){
			if(success){
				$.get('/post/' + postId, function(data, success){
					if(success){
						$this.closest('.comment-area').parents('.post-div').html(data);
					}
				});
			}
		});
	});
});