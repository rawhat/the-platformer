jQuery(document).ready(function(){
	$('.button-area').on('click', '.add-friend', function(event){
		event.preventDefault();
		var $this = $(this);
		$.post('/friends/add', {friendname: $('.username').text()}, function(data, success){
			if(success)
				swapImagesAndClasses($this);
		});
	});

	$('.button-area').on('click', '.remove-friend', function(event){
		event.preventDefault();
		var $this = $(this);
		$.post('/friends/remove', {friendname: $('.username').text()}, function(data, success){
			if(success)
				swapImagesAndClasses($this);
		});
	});

	function swapImagesAndClasses(object){
		object.toggleClass('add-friend');
		object.toggleClass('remove-friend');

		if(object.hasClass('add-friend')){
			object.children('img').attr('src', '/img/png/glyphicons-7-user-add.png');
		}
		else{
			object.children('img').attr('src', '/img/png/glyphicons-8-user-remove.png');
		}
	}
});