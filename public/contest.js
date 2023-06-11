let duration = document.createElement("div")
let inputs = document.getElementsByTagName("form")[0]
let msg = document.getElementById("msg")

const host="http://localhost:2000/"

document.getElementById("contestDescinp").value = ""

const add = document.getElementById("add")
const questions = document.getElementById("questionSources")

add.addEventListener("click",()=>{
    let div = document.createElement("div")
    div.className = "questionDiv"

    let input = document.createElement("input")
    
    let points = document.createElement("input")

    input.className="question"
    input.setAttribute("placeholder","paste your question link here")
    input.Destruct = function(){
        div.remove()
    }
    input.required = true

    let linkHandler = input.addEventListener("paste",(pasteEvent)=>{

        const link = pasteEvent.clipboardData.getData("text")
        document.getElementById("submit").style.display = "none"
        msg.innerText = "verifying question link..."
        fetch(host+"questionName",{
            method:"post",
            headers:{
                "Content-type":"application/json"
            },
            body:JSON.stringify({"link":link})
        }).then((response)=>{
            return response.text()
        }).then((data)=>{
            if(data=="improper link"){
                msg.innerText = ""
                input.value = "provide a proper link";
                setTimeout(()=>{
                    input.value= "";
                    document.getElementById("submit").style.display = "inline"
                },2000)
            }
            else{
                let questions = document.getElementsByClassName("question")
                let Destructed = false 
                for(let question of questions){
                    if(question.value == data){
                        Destructed = true ;
                        break;
                    }
                }
                msg.innerText = ""
                input.value = data
                if(!Destructed){
                    input.setAttribute("name",link)
                    input.readOnly = true
                    points.setAttribute("name","points_"+data)
                    points.style.display = "inline"
                    document.getElementById("submit").style.display = "inline"
                }
                else{
                    setTimeout(()=>{
                        document.getElementById("submit").style.display = "inline"
                        input.Destruct();
                    },2000)
                }
            }
        })
    })

    div.append(input)

    let btn = document.createElement("div")
    btn.className = "remove"
    btn.innerText = "remove"
    btn.addEventListener("click",()=>{
        let questions = document.getElementsByClassName("question").length;
        if(questions == 1){
            add.click();
        }
        div.remove()
    })

    points.required=true
    points.className = "points"
    points.placeholder = "points"
    points.type = "number"
    points.min=0

    div.append(points)    

    div.append(btn)

    questions.append(div)
})

add.click();

let autoStart = document.getElementById("autoStartContest")
autoStart.checked = false;

let clock = document.createElement("div")

clock.innerHTML =`
<div id='clockDiv'>
<label class="optlabel">start time</label>
<input type= "datetime-local" name="startTime" required class="optional">
</div>

`
autoStart.addEventListener(("change"),()=>{
    if(autoStart.checked){
        document.getElementById("startContest").append(clock);
    }
    else{
        clock.remove()
    }
})

const form = document.getElementsByTagName("form")[0]
form.addEventListener("submit",()=>{
    window.scrollTo(0, 0);
    msg.innerText = "creating contest .."
    let questions = document.getElementsByClassName("question")
    let pointsobj = document.getElementsByClassName("points")
    let pointsarr = []

    for(let point in pointsobj){
        pointsarr.push(pointsobj[point])
    }
    
    const data = {}

    for(let question of questions){
        data[question.name] = {
            "name" : question.value ,
            "points" : pointsarr.find((point)=>{
                return point.name=="points_"+question.value
            }).value
        }
    }


    if(autoStart.checked) {
        data["autoStartContest"]= "on";
        data["startTime"] = document.getElementsByName("startTime")[0].value;
    }
    
        
    data["hours"] = document.getElementsByName("hours")[0].value;
    data["minutes"] = document.getElementsByName("minutes")[0].value;
    data["seconds"] = document.getElementsByName("seconds")[0].value;
    data["contestName"] = document.getElementsByName("contestName")[0].value;
    data["contestDesc"] = document.getElementsByName("contestDesc")[0].value;


    fetch(form.getAttribute("action"),{
        "method":"post",
        "headers":{
            "Content-Type":"application/json",
        },
        "body":JSON.stringify(data)
    }).then((response)=>{
        return response.text()
    }).then((data)=>{
        msg.style.color= "white"
        if(data=="ok"){
            msg.innerText = "contest created successfully"
            msg.style.background = "limegreen"
        }
        else{
            msg.innerText = "error occured while creating the contest"
            msg.style.background = "red"
        }
        msg.innerText +=" ,redirecting you to your contests page"
        setTimeout(()=>{
            window.location.replace(host+"mycontests");
        },2000)
    })
    
    

})