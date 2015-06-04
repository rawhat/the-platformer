jQuery(document).ready(function(){
	$(".post-div").on('click', '.post-comment', function(){
		var commentBody = jQuery(this).prev("textarea").val();
		var postid = $(this).siblings('.user-post').attr('id');
		var $this = $(this);

		$.post('/post/' + postid + '/comment', {
			commentBody: commentBody,
		}, function(data, success){
			if(success){
				$.get('/post/' + postid + '/', function(data, success){
					if(success){
						$(".comment-box").val("");
						$this.closest('.post-div').html(data);
					}
				});
			}
		});
	});
});

