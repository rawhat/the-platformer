jQuery(document).ready(function(){
    $("#login_button").click(function(){
      var uname = jQuery("#username").val();
      var pw = jQuery("#user_pass").val();

      jQuery.post("/login/",
        { username : uname, password : pw},
        function(data, success){
          if(success){
            Cookies.set('username', uname, {expires: 1});
            window.location.replace("/home/");
          }
          else{
            jQuery("#error_box").show("slow");
            jQuery("#error_box").html("Username or password incorrect.");
            jQuery("#password").val("");
          }
        }, "json");
    });
  });