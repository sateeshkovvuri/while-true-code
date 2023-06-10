document.getElementsByTagName("form")[0].addEventListener("submit",(submission)=>{
    let msg=document.getElementById("msg");
    
    msg.innerText = "signing in..";
    msg.style.backgroundColor = "balck";
    msg.classList.add("msg");
    

    submission.preventDefault()
    fetch("http://localhost:2000/authenticate",{
        "method":"post",
        "headers":{
            "Content-Type":"application/json"
        },
        "body":JSON.stringify({
            "username":document.getElementsByName("username")[0].value,
            "password":document.getElementsByName("password")[0].value 
        })
    }).then((response)=>{
        return response.text()
    }).then ((data)=>{
        if(data=="authenticated"){
            window.location.replace("http://localhost:2000/home")
        }
        else{
            msg.innerText = "incorrect credentials"
            setTimeout(()=>{
                msg.innerText=""
                msg.classList.remove("msg")
            },2000)
        }
    })
})

const visibility = document.getElementById("visibility")
visibility.checked = false
visibility.addEventListener("change",()=>{
    let password = document.getElementById("password")
    if(visibility.checked){
        password.setAttribute("type","text")
    }
    else{
        password.setAttribute("type","password")
    }
})