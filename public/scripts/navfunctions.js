jQuery(document).ready(function(){
    $("#sign-out").click(function(event){
      event.preventDefault();
      if(Cookies.get('username') != null){
        Cookies.remove('username');
        window.location.replace('/');
      }
    });
});