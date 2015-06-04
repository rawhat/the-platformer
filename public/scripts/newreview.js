jQuery(document).ready(function(){
	var converter = new Markdown.getSanitizingConverter();
	var editor = new Markdown.Editor(converter);
		
	editor.run();

	$("#rating-spinner").spinner({
		max: 5,
		min: 0,
		page: 1,
		step: .5,
	});

	$("#game-title").bind("input propertychanged", function(){
		var inputText = $("#game-title").val();
		if((inputText.length >= 1 && inputText.substr(0, 3).toLowerCase() != "the") || inputText.length >= 6){
			$.post('/games/filter/' + inputText, function(data, success){
				if(success){
					console.log(data);
					var gameList = [];
					data.forEach(function(elem, index){
						gameList.push({
							label: elem.gameTitle + " (" + elem.gamePlatform.toUpperCase() + ")",
							value: elem.gameTitle,
							platform: elem.gamePlatform.toUpperCase(),
						});
					});
					setAutocomplete(gameList);
				}
			});
		}
	});

	$(".preview-review").click(function(){
		$(".review-preview").dialog({width: 'auto'});
	});

	function setAutocomplete(stuff){
		$("#game-title").autocomplete({
			source: stuff,
			select: function(event, ui){
				$('.platform-list').val(ui.item.platform);
			},
		})
	}

	function setPlatforms(plats){
		$('.platform-list').html("");
		plats.forEach(function(item){
			$('.platform-list').append("<option>" + item + "</option>");
		});
	}

	$('.submit-review').click(function(){
		console.log(converter.makeHtml($('#wmd-input').val()));
		/*
		$.post('/reviews/new', {
			reviewTitle: $('#review-title').val(),
			gameTitle: $('#game-title').val(),
			gameRating: $('#rating-spinner').spinner("value"),
			reviewSnippet: $('#review-snippet').val(),
			reviewBody: converter.makeHtml($('#wmd-input').val()),
		}, function(data, success){
			if(success)
				alert("review posted");
		});*/
	});
});