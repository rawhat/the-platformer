jQuery(document).ready(function(){
	$("#show-new-post").click(function(){
		$(".newpost").show("fast");
		$("#show-new-post").hide("fast");
	});

	$("#cancel-post").click(function(){
		$(".newpost").hide("fast");
		$("#show-new-post").show("fast");
	});

	$("#submit-post").click(function(){
		var postContent = $("#post-content").val();
		jQuery.post("/post/new", 
			{
				curruser : Cookies.get('username'),
				content : postContent, 
			},
			function(data, success){
				if(success){
					$("#post-content").val("");
					window.location.replace("/home/");
				}
				else{
					console.log('error');
					return false;
				}
			});
	});

	$(".post-search").click(function(){
		var queryElements = $("#search-query").val();
		if(queryElements == ""){
			$.get('/posts/', function(data, success){
				if(success){
					$("#search-query").val("");
					$(".post-area").html(data);
				}
			});
		}
		else{
			queryElements = queryElements.split(" ");
			$.post('/filter/', {queryElements: queryElements}, function(data, success){
				if(success){
					$("#search-query").val("");
					$(".post-area").html(data);
				}
			});
		}
	});
});