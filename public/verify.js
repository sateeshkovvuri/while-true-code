const socket_client_side = io.connect("http://localhost:2001");
let timer = document.getElementById("timer")
const expiryTime = document.getElementById("expiryTime").innerText
let solvedQuestions = document.getElementById("solvedQuestions")
let signup = document.getElementById("signup")
let signupDiv = document.getElementById("signupDiv")
let message = document.getElementById("message")

socket_client_side.on("id",(connectionID)=>{

    const formData={}
    
    solvedQuestions.value=""
    
    let fetching = false;
    let sessionExpired = false;
    
    let changeTimer = setInterval(()=>{
        try{
            let remaining_seconds = (new Date(expiryTime).getTime()-Date.now())/1000;
            let remaining_minutes = Math.floor(remaining_seconds/60);
            remaining_seconds = Math.floor(remaining_seconds%60);
            timer.innerText = "session expires in: " + remaining_minutes + " minutes," + remaining_seconds + " seconds" 
    
            if(Math.floor(remaining_minutes) <= 0 && Math.floor(remaining_seconds) <= 0){
                if(!fetching){
                    signupDiv.remove()
                    message.innerText = "session expired , reload this page and try again"
                    message.classList.add("msg_box")
                }
                sessionExpired = true;
                socket_client_side.disconnect();
                clearInterval(changeTimer)
            }
        }
        catch{
    
        }
    },1000)
    
    socket_client_side.on("verificationCode",(code)=>{
        
        if(code == "some error occured"){
            message.innerText = code+" page reloading..";
            setTimeout(()=>{
                window.location.replace("http://localhost:2000/verify");
            },2000)
            
        }

        else{
            document.getElementsByName("verificationCode")[0].value = code
            let signUpForm = document.getElementsByTagName("form")[0]
            signUpForm.addEventListener("submit",(submission)=>{
                fetching = true;
                submission.preventDefault();
                
                message.innerText = "verifying...";
                message.classList.add("msg_box");
                message.style.color = "white";
                message.style.backgroundColor ="black";
        
                formData["gfgUserName"]=document.getElementsByName("gfgUserName")[0].value
                formData["password"]=document.getElementsByName("password")[0].value
                formData["solvedQuestion"]=document.getElementsByName("solvedQuestion")[0].value
                formData["verificationCode"]= document.getElementsByName("verificationCode")[0].value
                formData["connectionID"]= connectionID
            
                let options = {
                    
                    method:"post",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body : JSON.stringify(formData)
            
                }
                
                fetch(signUpForm.getAttribute("action"),options).then((response)=>{
                    return response .text()
                }).then((data)=>{
                    message.style.color = "black";
                    const signinLink = `redirecting you to sign in page`
                    let signinRedirect = false;
        
                    if(data == "verified"){
                        message.innerHTML = "verified and account is configured successfully ,"+signinLink
                        message.style.background = "limegreen";
                        signupDiv.remove();
                        signinRedirect =true;
                    }
        
                    else{
                        if(!sessionExpired){
                            message.innerText = data
                            message.innerText+=",no need to reload this page,try again"
                            message.style.background = "red"
                
                            if(data=="invalid question link"){
                                document.getElementsByName("solvedQuestion")[0].value=""
                            }
                
                            setTimeout(()=>{
                                if(!sessionExpired){
                                    message.innerText="";
                                    message.classList.remove("msg_box");
                                }
                            },3000)
                
                            fetching = false ;
                        }
                        else{
                            signupDiv.remove()
                            message.innerText = data+",reload this page and try again"
                            message.classList.add("msg_box")                    
                            socket_client_side.disconnect();
                        }                
                    }
        
                    if(signinRedirect){
                        socket_client_side.disconnect();
                        setTimeout(()=>{
                            window.location.replace("http://localhost:2000/signin");
                        },3000)
                    }
                    
                })
            })
        }        
    })
    
    
})


socket_client_side.io.on("reconnect",()=>{
    message.innerText = "some error occured , page reloading..";
    setTimeout(()=>{
        window.location.replace("http://localhost:2000/verify")
    },2000)
})
