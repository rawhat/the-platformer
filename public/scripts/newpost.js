jQuery(document).ready(function(){
	$("#show-new-post").click(function(){
		$(".newpost").show("fast");
		$("#show-new-post").hide("fast");
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
					return 'false';
				}
			});
	});
});