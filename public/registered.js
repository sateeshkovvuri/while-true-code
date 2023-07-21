let registerForm = document.getElementsByTagName("form")[0]
const host = "http://localhost:2000/"
registerForm.addEventListener("submit",(submission)=>{
    submission.preventDefault();
    fetch(host+"register",{
        "method":"post",
        "headers":{
            "Content-Type":"application/json"
        },
        "body":JSON.stringify({"contestid":document.getElementById("contestid").value})
    }).then((response)=>{
        return response.text()
    }).then((data)=>{
        if(data=="ok"){
            window.location.replace(host+"registeredContests")
        }
        else{
            let msg = document.getElementById("msg")
            msg.innerText = data;
            msg.classList.add("msg")
            document.getElementById("contestid").value = ""
            setTimeout(()=>{
                msg.innerText = ""
                msg.classList.remove("msg")
            },2000)
        }
    })
})

function calDuration(milliseconds){
    let seconds =  milliseconds/1000
    let minutes = Math.floor(seconds/60);
    seconds = Math.floor(seconds%60);
    let hours = Math.floor(minutes/60);
    minutes = Math.floor(minutes%60);
    return `${hours} hours , ${minutes} minutes , ${seconds} seconds`
}

function timerFunctionality(starttime,duration,timer){
    let timerFunction = setInterval(()=>{
        let currentTime = Date.now();
        let endTime = starttime+duration;
        if(currentTime<endTime){
            timer.innerText = "contest end in :"+calDuration(endTime-currentTime)
        }
        else{
            window.location.replace(host+"registeredContests")
            clearInterval(timerFunction)
        }
    },1000)
}

fetch(host+"allRegisteredContests",{
    "method":"post",
    headers:{
        "Content-Type":"application/json",
    },
}).then((response)=>{
    return response.json()
}).then((data)=>{
    if(data.error != undefined) return 
    let registered = document.getElementById("registered")

    for(let doc in data){
        let contest = document.createElement("div")
        contest.className = "contest"
        let contestName = document.createElement("div")
        contestName.innerText = data[doc].contestname
        contestName.className = "contestName"
        let contestDesc = document.createElement("div")
        contestDesc.innerText = data[doc].contestdesc
        contestDesc.className = "contestDesc"

        let startTime = document.createElement("div")
        startTime.className = "startTime"
        let contestStatus = document.createElement("div")
        contestStatus.className = "contestStatus"

        if(data[doc].starttime == null){
            contestStatus.innerText = "contest will be manually started by the creator [reload the page when started]"
        }
        else{
            let currentTime = Date.now()
            let endTime = data[doc].starttime + data[doc].duration          


            let contestLink = document.createElement("a")
            contestLink.setAttribute("href",host+"contest/"+doc)
            contestLink.setAttribute("target","_blank")
            contestLink.innerText = "go to contest"

            if(currentTime >= data[doc].starttime && currentTime<endTime){
                contestStatus.innerText = "contest is live.."
                let timer = document.createElement("div")
                timer.className = "timer"
                startTime.append(contestLink)
                timerFunctionality(data[doc].starttime,data[doc].duration,timer)
                startTime.append(timer)

            }
            else if(currentTime>=endTime){
                contestStatus.innerText = "contest ended"
                let results = document.createElement("a")
                results.setAttribute("href",host+"results/"+doc)
                results.innerText = "results"
                startTime.append(contestLink)
                startTime.append(results)
            }
            else if(currentTime<data[doc].starttime){
                contestStatus.innerText = "contest will start at : "+new Date(data[doc].starttime)+" [reload the page when contest time is reached]"
            }
        }
        let duration = document.createElement("div")
        duration.innerText = "duration :"+calDuration(data[doc].duration)
        let creator = document.createElement("div")
        creator.innerText = "creator: "+data[doc].creator
        contest.append(contestName)
        contest.append(contestDesc)
        startTime.append(contestStatus)
        contest.append(startTime)
        contest.append(duration)
        contest.append(creator)

        registered.append(contest)
    }
})