var $sidebar = $(".sidebar.right").sidebar({side: "right"});
$(".friends-button").click(function(){
	$sidebar.trigger("sidebar:open");
	$.post('/friends/', {curruser: Cookies.get("username")}, function(data, success){
		if(success){
			data.sort(function(a, b){ return a.username - b.username; });
			$.each(data, function(){
				$(".friends-area").append(this.friendname);
			});
		}
		else{
			console.log("error");
		}
	});
});
$(".close-sidebar").click(function(){
	$sidebar.trigger("sidebar:close");
	$(".friends-area").html("");
});
