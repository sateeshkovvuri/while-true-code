let contestsDiv = document.getElementById("createdContests")

const host = "http://localhost:2000/"

function calDuration(milliseconds){
    let seconds =  milliseconds/1000
    let minutes = Math.floor(seconds/60);
    seconds = Math.floor(seconds%60);
    let hours = Math.floor(minutes/60);
    minutes = Math.floor(minutes%60);
    return `${hours} hours , ${minutes} minutes , ${seconds} seconds`
}

function timerFunction(startTime,duration,timer,start,contest,id){
    let timerFunctionality =setInterval(()=>{
        let currentTime = Date.now()
        let endTime = startTime+duration
        if(currentTime>=endTime){
            start.innerText = "contest ended"
            timer.remove();
            let results = document.createElement("div")
            let resultsLink = document.createElement("a")
            resultsLink.setAttribute("href",host+"generateresults/"+id)
            resultsLink.setAttribute("target","_blank")
            resultsLink.innerText="generate results (a new tab will be opened dont close it till you get results)"
            results.append(resultsLink)
            contest.append(results)
            clearInterval(timerFunctionality)
        }
        else{
            timer.innerText = `contest ends in :${calDuration(endTime-Date.now())}`
        }
    },1000)    
}

fetch(host+"createdContests",{
    "method":"post",
    "headers":{
        "Content-Type":"application/json"
    }
}).then((response)=>{
    return response.json()
}).then((data)=>{
    data.forEach((doc)=>{
        let contest = document.createElement("div")
        let timer = document.createElement("div")
        contest.className ="contest"
        function startHandler(){
            fetch(host+"startContest",{
                "method":"post",
                headers :{
                    "Content-Type":"application/json"
                },
                "body":JSON.stringify({"contestID":contest.contestID})
            }).then((response)=>{return response.text()}).then((data)=>{
                if(data == "ok"){
                    window.location.replace(host+"mycontests")
                }
            })                
        }

        Object.defineProperty(contest,"contestID",{
            value: doc._id,
            writable : false,
        });

        Object.defineProperty(contest,"duration",{
            value: doc.duration,
            writable : false,
        });

        let contestName = document.createElement("div")
        contestName.className = "contestName"
        contestName.innerText = doc.contestName 
        contest.append(contestName)

        let desc = doc.contestDesc 
        let contestDesc = document.createElement("div")    
        contestDesc.innerText = desc 
        contestDesc.className = "contestDesc"
        contest.append(contestDesc)

        let contestIdDisplay=document.createElement("input")
        contestIdDisplay.className = "contestIdDisplay"
        contestIdDisplay.value = "contest id: "+contest.contestID
        contestIdDisplay.readOnly = true
        contest.append(contestIdDisplay)

        let questions = document.createElement("div")
        questions.className = "questions"

        let heading = document.createElement("h3")
        heading.innerHTML = "Questions <h6>(visible to contenders only after contest is started)</h6> :"
        questions.append(heading)

        for(let question in doc.questions){
            let questionBar = document.createElement("div")
            questionBar.className = "questionBar"
            let questionLink = document.createElement("a")
            questionLink.setAttribute("href",doc.questions[question].problem_link)
            questionLink.setAttribute("target","_blank")
            questionLink.innerHTML = `${question} (<i>${doc.questions[question].points} points</i>)`
            questionBar.append(questionLink)
            questions.append(questionBar)
        }

        contest.append(questions)

        let startTime = doc.startTime
        let start = document.createElement("div")
        let currentTime = Date.now()
        let endTime = startTime+contest.duration
        
        if(startTime==null){
            start.innerText = "start contest"
            start.style.cursor = "pointer"
            start.style.color = "white"
            start.style.backgroundColor = "black"
            start.style.width="250px"
            start.style.textAlign = "center"
            start.style.padding = "5px";
            start.style.margin = "0px 0px 5px 0px";
            start.style.fontSize = "20px"
            start.addEventListener("click",startHandler)
        }

        else if(currentTime>=startTime && currentTime<endTime){
            start.innerText="contest is live.."
            timerFunction(startTime,contest.duration,timer,start,contest,contest.contestID)
        }

        else if(currentTime>=endTime){
            start.innerText = "contest ended"
            let results = document.createElement("div")
            let resultsLink = document.createElement("a")
            if(doc.reports == null){
                resultsLink.innerText = "generate results (a new tab will be opened dont close it till you get results)"
                resultsLink.setAttribute("href",host+"generateresults/"+contest.contestID)
            }
            else{
                resultsLink.innerText = "results"
                resultsLink.setAttribute("href",host+"results/"+contest.contestID)
            } 
            
            resultsLink.setAttribute("target","_blank")
            results.append(resultsLink)
            contest.append(results)
        }
        
        else if(startTime>currentTime){
            start.innerText = `contest will start automatically on : ${new Date(startTime)}`
        }

        contest.append(start)
        contest.append(timer)



        let duration = document.createElement("div")
        duration.innerText=`duration : ${calDuration(contest.duration)}`
        contest.append(duration)
        
        contestsDiv.append(contest)
    })
})