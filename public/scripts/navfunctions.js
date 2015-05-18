jQuery(document).ready(function(){
    if(location.pathname != '/' && Cookies.get('username') == null){
      window.location.replace('/');
    }

    $("#sign-out").click(function(event){
      event.preventDefault();
      if(Cookies.get('username') != null){
        Cookies.remove('username');
        window.location.replace('/');
      }
    });
});