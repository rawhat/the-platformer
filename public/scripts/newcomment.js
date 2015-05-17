jQuery(document).ready(function(){
	$(".user-post").on('click', '.post-comment', function(){
		var commentBody = jQuery(this).prev("textarea").val();
		var commenter = Cookies.get("username");
		var postid = jQuery(this).parent().parent().attr('id');
		$.post('/post/' + postid + '/comment', {
			commenter: commenter,
			commentBody: commentBody,
		}, function(data, success){
			if(success){
				$.get('/post/' + postid + '/', function(data, success){
					if(success){
						$(".comment-box").val("");
						jQuery("#" + postid).html(data);
					}
				});
			}
		});
	});
});

