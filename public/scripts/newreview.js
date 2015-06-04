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
					var gameList = [];
					data.forEach(function(elem, index){
						gameList.push({
							label: elem.title + " (" + elem.platform.toUpperCase() + ")",
							value: elem.title,
							platform: elem.platform.toUpperCase(),
						});
					});
					setAutocomplete(gameList);
				}
			});
		}
	});

	$(".preview-review").click(function(){
		$(".review-preview").dialog({width: 'auto', minHeight: 350});
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
		//console.log(converter.makeHtml($('#wmd-input').val()));ss
		var params = {
			reviewTitle: $('#review-title').val(),
			gameTitle: $('#game-title').val(),
			platform: $('.platform-list option:selected').text().toLowerCase(),
			gameRating: $('#rating-spinner').spinner("value"),
			reviewSnippet: $('#review-snippet').val(),
			reviewBody: $('.review-body').val(),
		};

		var allParams = true;

		$.each(params, function(key, value){
			if(value == "")
				allParams = false;
		});

		if(allParams){
			$.post('/reviews/new', {
				reviewTitle: $('#review-title').val(),
				gameTitle: $('#game-title').val(),
				platform: $('.platform-list option:selected').text().toLowerCase(),
				gameRating: $('#rating-spinner').spinner("value"),
				reviewSnippet: $('#review-snippet').val(),
				reviewBody: $('.review-body').val(),
			}, function(data, success){
				if(success){
					$('.message-area').addClass('alert-success');
					$('.message-area').html('Review successfully submitted!  Redirecting...');
					window.location.replace('/reviews/');
				}
			});
		}
		else{
			$('.message-area').addClass('alert-danger');
			$('.message-area').html('You must fill out every field.');
		}
	});
});