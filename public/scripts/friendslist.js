jQuery(document).ready(function(){
	var $sidebar = $(".sidebar.right").sidebar({side: "right", close: true});

	$(".friends-button").click(function(event){
		event.preventDefault();
		$sidebar.trigger("sidebar:open");
		$.get('/friends/', function(data, success){
			if(success){
				$(".sidebar-content").html(data);
			}
			else{
				console.log("error");
			}
		});
	});

	$(".close-sidebar").click(function(){
		$sidebar.trigger("sidebar:close");
		$(".sidebar-content").html("");
	});
});