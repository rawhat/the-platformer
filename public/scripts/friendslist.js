jQuery(document).ready(function(){
	$(".friends-button").click(function(){
		var curruser = Cookies.get("username");
		$.post("/friends/", {curruser: curruser}, function(err, results){
			if(err){
				throw err
			}
			else{
				
			}
		});
	});
});