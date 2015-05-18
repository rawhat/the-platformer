jQuery(document).ready(function(){
	$("#search-query").on('change input', function(){
		var query = $("#search-query").val();
		$('.well').hide();
		if(query == ""){
			//$('.user-post').show();
			$('.well').show();
		}
		else{
			//$(".post-body:not(:contains(\"" + query + "\"))").closest('.post-body').show();
			//alert('.post-body:contains(' + query +')');
			$('.post-body:contains(\'' + query + '\')').closest('.well').show();
			$('.comment-body:contains(\'' + query + '\')').closest('.well').show();
			$('.username:contains(\'' + query + '\')').closest('.well').show();
		}
	});
});