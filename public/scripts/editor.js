jQuery(document).ready(function(){
	$('.post-edit').click(function(event){
		event.preventDefault();
		var postContent = $(this).closest('.user-post').find('.post-body').text();
		var postId = $(this).closest('.user-post').attr('id');
		$('#edited-data').val(postContent);
		$('.editor-dialog').dialog({
			title: "Edit post",
			close: function(event, ui){
				var newContent = $('#edited-data').val();
				if(newContent != postContent){
					$.post('/posts/' + postId + '/edit', {newcontent: newContent }, function(data, success){
						if(success){
							alert('Post successfully edited.');
							location.reload(true);
						}
					});
				}
			},
		});
	});

	$('.comment-edit').click(function(event){
		event.preventDefault();
		var commentContent = $(this).closest('.comment-area').find('.comment-body').text();
		var commentId = $(this).closest('.comment-area').attr('id');
		$('#edited-data').val(commentContent);
		$('.editor-dialog').dialog({
			title: "Edit comment",
			close: function(event, ui){
				var newContent = $('#edited-data').val();
				if(newContent != commentContent){
					$.post('/comments/' + commentId + '/edit', {newcontent: newContent }, function(data, success){
						if(success){
							alert('Comment successfully edited.');
							location.reload(true);
						}
					});
				}
			},
		});
	});
});