jQuery(document).ready(function(){
	$(".list-group-item").click(function(event){
		event.preventDefault();
		$(this).toggleClass("active");
		filterGames();
	});

	$('#search-query').on('change input', function(){
		filterGames();
	});

	$('.games-area').on('click', '.gameicon', function(event){
		event.preventDefault();
		var isAdding;
		if($(this).children('img').attr('src') == "/img/png/glyphicons-192-circle-minus.png"){
			isAdding = false;
		}
		else{
			isAdding = true;
		}

		var clickedOn = $(this);

		var gameTitle = $(this).closest('.game-item').find('#game-title').text();
		var gamePlatform = $(this).closest('.game-item').find('#game-platform').text().toLowerCase();
		$.post('/games/own/' + gameTitle + '/' + gamePlatform, {adding: isAdding}, function(data, success){
			if(success && isAdding){
				clickedOn.children('img').attr('src', "/img/png/glyphicons-192-circle-minus.png");
			}
			else if (success && !isAdding)
				clickedOn.children('img').attr('src', "/img/png/glyphicons-191-circle-plus.png");
		});
	});

	function filterGames(){
		var query = $('#search-query').val();
		var platforms = $(".list-group-item.active").map(function(){
			return $.trim($(this).text());
		}).get();
		$.post('/games/filter', {platforms: platforms, query: query}, function(data, success){
			if(success)
				$('.games-area').html(data);
		});
	}
});