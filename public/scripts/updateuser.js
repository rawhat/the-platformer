jQuery(document).ready(function(){
	$('#update-user').click(function(event){
		event.preventDefault();

		var newPassword = $('#password').val();
		var newEmail = $('#email').val();
		var username = $('#username').text();
		var twitchId = $('#twitchid').val();
		$.post('/profile/' + username + '/edit', {email: newEmail, pass: newPassword, twitchid: twitchId}, function(data, success){
			if(success){
				$('.status-div').addClass('alert-success');
				$('.status-div').html('Information successfully updated! Redirecting...');
				window.location.replace('/profile/' + username);
			}
		});
	});
});