function formSelector(selector) {

    let signupElement = document.getElementById("signup")
    let loginElement = document.getElementById("login")

    let signupForm = document.getElementById("signupForm")
    let loginForm = document.getElementById("loginForm")

    if (selector == "signup") {

        signup.classList.add("selectedHeader")
        login.classList.remove("selectedHeader")

        signupForm.classList.add("showForm")
        loginForm.classList.remove("showForm")
    } else if (selector == "login") {

        signup.classList.remove("selectedHeader")
        login.classList.add("selectedHeader")

        signupForm.classList.remove("showForm")
        loginForm.classList.add("showForm")
    }
}

function navbardivactivate() {

    document.getElementById("navsidebarcontent").classList.toggle("navsidebarcontentactive")

    document.getElementById("navsidebarbutton").classList.toggle("navsidebarbuttonactive")


    document.getElementById("bar1").classList.toggle("barclick1")

    document.getElementById("bar2").classList.toggle("barclick2")

    document.getElementById("bar3").classList.toggle("barclick3")

}