const loginButton = document.getElementById('login_button');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('user_pass');
const errorBox = document.getElementById("error_box");

loginButton.addEventListener('click', () => {
  const username = usernameInput.value;
  const password = passwordInput.value;

  fetch(
    '/login',
    {
      body: JSON.stringify({username, password}),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })
    .then(res => {
      if (res.ok) {
        errorBox.style.display ='none';
        Cookies.set('username', username, {expires: 1});
        window.location.replace("/posts/");
      } else {
        errorBox.style.display = 'relative';
        errorBox.innerHTML = "Username or password incorrect";
      }
    })
})

//jQuery(document).ready(function(){
    //$("#login_button").click(function(){
      //var uname = jQuery("#username").val();
      //var pw = jQuery("#user_pass").val();

      //jQuery.post("/login/",
        //{ username : uname, password : pw},
        //function(data, success){
          //if(success){
            //Cookies.set('username', uname, {expires: 1});
            //window.location.replace("/posts/");
          //}
          //else{
            //jQuery("#error_box").show("slow");
            //jQuery("#error_box").html("Username or password incorrect.");
            //jQuery("#password").val("");
          //}
        //}, "json");
    //});
  //});
