jQuery(document).ready(function(){
	$('#sign-out').click(function(event){
		event.preventDefault();
		Cookies.remove('username');
		window.location.replace('/');
	});
});