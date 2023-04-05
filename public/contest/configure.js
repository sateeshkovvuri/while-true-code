function verified(){
    let duration=document.getElementById("days").value+document.getElementById("hours").value+document.getElementById("minutes").value+document.getElementById("seconds").value
    let contest_name=document.getElementById("contest_name").value.trim()
    return contest_name!="" && duration!="" && contest_name.length<100
}

let link=location.href
let search_str="contest/"
let start_index=link.indexOf(search_str)+search_str.length
let cid=""
for(let i=start_index;i<start_index+40;i++){
    cid+=link[i]
}

let confi_info=document.getElementById("confi_info")

confi_info.addEventListener("submit",()=>{
    if(verified()){
        let duration=String(Number(document.getElementById("days").value))+" "+String(Number(document.getElementById("hours").value))+" "+String(Number(document.getElementById("minutes").value))+" "+String(Number(document.getElementById("seconds").value))
        let contest_name=document.getElementById("contest_name").value.trim()
        
        const payload={}
        payload["contest_id"]=cid
        payload["duration"]=duration
        payload["contest_name"]=contest_name

        let tds=document.getElementsByTagName("td")
        
        let partial_scoring_data={}

        for(let i=0;i<tds.length;i+=3){
            partial_scoring_data[tds[i].innerText]=String(document.getElementsByName(tds[i].innerText)[0].checked)    
        }

        payload["partial_scoring_data"]=partial_scoring_data

        const options={
            "method":"post",
            "body":JSON.stringify(payload),
            headers:{
                'Content-Type': 'application/json;charset=utf-8'
                }
        }

        fetch("http://localhost:3769/contest/configuration-update",options).then((response)=>{
            return response.text()
        }).then((data)=>{
            let msg=document.getElementById("message")

            if(data=="ok"){
                msg.innerText="configuration updated successfully (redirecting..)"    
            }
            else{
                msg.innerText="error occured while configuring (redirecting..)"
            }
            setTimeout(()=>{
                location.replace("http://localhost:3769/manage")
            },2000)
        })
    }
    else{
        alert("provide a proper contest name and contest duration. make sure contest name is less than 100 characters and contest duration is not empty")
    }
})







