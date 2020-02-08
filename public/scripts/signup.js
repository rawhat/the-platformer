jQuery(document).ready(function(){
	$('#sign-up').click(function(){
		$('.form-group').removeClass('has-error');
		var email = $('#email').val();
		var username = $('#username').val();
		var password = $('#password').val();
		var errors = false;
		if(username == "" || username == null){
			$('.username-group').addClass('has-error');
			errors = true;
		}
		if(password == "" || password == null){
			$('.password-group').addClass('has-error');
			errors = true;
		}
		if(email == "" || email == null || !isValidEmailAddress(email)){
			$('.email-group').addClass('has-error');
			errors = true;
		}

		if(isValidEmailAddress(email) && errors == false){
      fetch('/users', {
        body: JSON.stringify({
          username: username,
          email: email,
          password: password,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      })
      .then(function(res){
				if(res.ok){
					$('.alert').addClass('alert-success');
					$('.alert').text("User successfully created! You can now log in.");
					window.setTimeout(window.location.replace('/'), 200);
				}
				else{
					$('.alert').addClass('alert-danger');
					$('.alert').text("Invalid username or password.");
				}
			});
		}
	});

	function isValidEmailAddress(emailAddress) {
    	var pattern = new RegExp(/^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i);
    	return pattern.test(emailAddress);
	};
});
