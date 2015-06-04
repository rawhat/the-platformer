jQuery(document).ready(function(){
	$('#update-user').click(function(event){
		event.preventDefault();

		var newPassword = $('#password').val();
		var newEmail = $('#email').val();
		var username = $('#username').text();
		$.post('/profile/' + username + '/edit', {email: newEmail, pass: newPassword}, function(data, success){
			if(success){
				alert('User information successfully updated.');
				window.location.replace('/profile/' + username);
			}
		});
	});
});