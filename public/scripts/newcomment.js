jQuery(document).ready(function(){
	$(".post-div").on('click', '.post-comment', function(){
		var commentBody = jQuery(this).prev("textarea").val();
		var postid = $(this).siblings('.user-post').attr('id');
		var $this = $(this);

    fetch(`/posts/${postid}/comments`, {
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: commentBody,
      }),
      method: 'POST'
    })
    .then(res => res.json())
    .then((res) => {
      console.log('res', res)
      window.location.reload();
    });
			//if(res.ok){
				//$.get('/post/' + postid + '/', function(data, success){
					//if(success){
						//$(".comment-box").val("");
						//$this.closest('.post-div').html(data);
					//}
				//});
			//}
    //})
		//$.post('/post/' + postid + '/comment', {
			//commentBody: commentBody,
		//}, function(data, success){
		//});
	});
});

