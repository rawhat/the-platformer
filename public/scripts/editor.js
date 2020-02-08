jQuery(document).ready(function(){
  $('.post-div').on('click', '.post-edit', function(event){
    event.preventDefault();
    var postContent = $(this).closest('.user-post').find('.post-body').text();
    var postId = $(this).closest('.user-post').attr('id');
    $('#edited-data').val(postContent);
    $('.editor-dialog').dialog({
      title: "Edit post",
      close: function(event, ui){
        var newContent = $('#edited-data').val();
        if(newContent != postContent){
          fetch(`/posts/${postId}`, {
            headers: {
              'Content-Type': 'application/json'
            },
            method: "PUT",
            body: JSON.stringify({
              content: newContent
            })
          })
          .then(() => {
            window.location.reload();
          })
        }
      },
    });
  });

  $('.post-div').on('click', '.comment-edit', function(event){
    event.preventDefault();
    var commentContent = $(this).closest('.comment-area').find('.comment-body').text();
    var postId = $(this).closest('.comment-area').siblings(".user-post").attr('id');
    var commentId = $(this).closest('.comment-area').attr('id');
    $('#edited-data').val(commentContent);
    $('.editor-dialog').dialog({
      title: "Edit comment",
      close: function(event, ui){
        var newContent = $('#edited-data').val();
        if(newContent != commentContent){
          fetch(`/posts/${postId}/comments/${commentId}`, {
            headers: {
              'Content-Type': 'application/json'
            },
            method: "PUT",
            body: JSON.stringify({
              content: newContent
            })
          })
          .then(() => {
            window.location.reload();
          })
        }
      },
    });
  });

  $('.post-div').on('click', '.comment-delete', function(event){
    event.preventDefault();
    var commentId = $(this).parents('.comment-area').attr('id');
    var postId = $(this).closest('.comment-area').siblings('.user-post').attr('id');
    fetch(`/posts/${postId}/comments/${commentId}`, {
      method: "DELETE"
    })
    .then(() => {
      window.location.reload();
    })
  });

  $('.post-div').on('click', '.post-delete', function(event){
    event.preventDefault();
    var postId = $(this).parents('.user-post').attr('id');
    fetch(`/posts/${postId}`, {
      method: "DELETE"
    })
    .then(() => {
      window.location.reload();
    })
  });

  $('.reviews-area').on('click', '.review-delete', function(event){
    event.preventDefault();
    var reviewId = $(this).parents('.review-item').attr('id');
    $.post('/reviews/' + reviewId + '/delete', function(data, success){
      if(success){
        location.reload(true);
      }
    })
  });
});
