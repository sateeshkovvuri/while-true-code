const endTime = document.getElementById("endTime").innerText
let timer = document.getElementById("timer")

const timerFunction = setInterval(()=>{
    let seconds = (new Date(endTime).getTime()-Date.now())/1000
    let minutes = Math.floor(seconds/60);
    seconds = Math.floor(seconds%60);
    let hours = Math.floor(minutes/60);
    minutes = Math.floor(minutes%60);
    if(seconds<=0 && minutes<=0 && hours<=0){
        timer.innerText = "contest ended"
        setTimeout(()=>{
            clearInterval(timerFunction)
        },2000)
        
    }
    else{
        timer.innerText = `contest ends in : ${hours} hours , ${minutes} minutes ,${seconds} seconds`
    }

},1000)
