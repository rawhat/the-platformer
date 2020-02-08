jQuery(document).ready(function(){
	// "/img/png/glyphicons-344-thumbs-up.png"
	// "/img/png/glyphicons-345-thumbs-down.png"
	$('.post-div').on('click', '.post-like-button', function(event){
		event.preventDefault();
		var postId = $(this).closest('.user-post').attr('id');
		var $this = $(this)
    fetch(`/posts/${postId}/likes`, { method: 'POST' })
      .then((res) => {
        if (res.ok) {
          window.location.reload();
        }
      })
	});

	$('.post-div').on('click', ".post-dislike-button", function(event){
		event.preventDefault();
		var postId = $(this).closest('.user-post').attr('id');
		var $this = $(this)
    fetch(`/posts/${postId}/likes`, { method: 'DELETE' })
      .then((res) => {
        if (res.ok) {
          window.location.reload();
        }
      })
	});

	$('.post-div').on('click', ".comment-like-button", function(event){
		event.preventDefault();
		var commentId = $(this).closest('.comment-area').attr('id');
		var postId = $(this).closest('.comment-area').siblings('.user-post').attr('id');
    fetch(`/posts/${postId}/comments/${commentId}/likes`, { method: "POST" })
      .then((res) => {
        if (res.ok) {
          window.location.reload();
        }
      })
	});

	$('.post-div').on('click', ".comment-dislike-button", function(event){
		event.preventDefault();
		var commentId = $(this).closest('.comment-area').attr('id');
		var postId = $(this).closest('.comment-area').siblings('.user-post').attr('id');
    fetch(`/posts/${postId}/comments/${commentId}/likes`, { method: "DELETE" })
      .then((res) => {
        if (res.ok) {
          window.location.reload();
        }
      })
	});
});
