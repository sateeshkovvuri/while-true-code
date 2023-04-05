let ques_add=document.getElementById("question_add")
let questions=document.getElementById("questions")
let contenders=document.getElementById("contenders")
let continue_btn=document.getElementById("continue_btn")
let status_box=document.getElementById("status")

const added_questions={}

const mousemovefunc=function(){this.value="double click to delete"}
const mouseleavefunc=function(){this.value=this.valuetemp}
const dblclickfunc=function(){
    delete(added_questions[this.valuetemp])
    if(JSON.stringify(added_questions)=="{}")continue_btn.disabled=true
    this.reference.remove()
}

continue_btn.disabled=true



ques_add.addEventListener("click",()=>{
    
    let question=document.getElementById("question")
    let question_ro=document.createElement("textarea")
    
    const url=question.value
    question.value=""
    let url_taken=false

    for(let q in added_questions){
        if(added_questions[q]==url){
            return
        }
    }

    if(url!=""){
    status_box.innerText="adding.."
    
    let options={
    method:"post",
    body:JSON.stringify({"url":url}),
    headers:{
        'Content-Type': 'application/json;charset=utf-8'
        }
    }



    fetch("http://localhost:3769/contest/problemname",options).then((response)=>{
        return response.text()
    }).then((data)=>{
        if(data!="error occurred" && data!="wrong link"){

            question_ro.value=data
            question_ro.readOnly=true
            question_ro.className="question"
            question_ro.valuetemp=data
            question_ro.reference=question_ro

            question_ro.addEventListener("mousemove",mousemovefunc)

            question_ro.addEventListener("mouseleave",mouseleavefunc)

            question_ro.addEventListener("dblclick",dblclickfunc)
            
            let already_added=false;
            for(let q in added_questions){
                if(q==data){
                    already_added=true;
                    break
                }
            }

            if(!already_added){
                added_questions[data]=url;
                continue_btn.disabled=false
                questions.appendChild(question_ro)
                status_box.innerText=""
            }
        }

        else if(data=="wrong link"){
            status_box.innerText=""
            alert("some error occured or link you provided is wrong,try again with a proper link")
        }
    
    })
    }

})

continue_btn.addEventListener("click",()=>{
    
    let question_boxes=document.getElementsByClassName("question")
    
    for(let box of question_boxes){
        box.removeEventListener("dblclick",dblclickfunc)
        box.removeEventListener("mousemove",mousemovefunc)
        box.removeEventListener("mouseleave",mouseleavefunc)
    }

    status_box.innerText="waiting for approval.."
    let options={
        method:"post",
        body:JSON.stringify({urls:added_questions,organizer:"sateesh"}),
        headers:{
            'Content-Type': 'application/json;charset=utf-8'
            }
    }
    fetch("http://localhost:3769/contest/configure-approve",options).then((data)=>{
        return data.text()
    }).then((data)=>{
        status_box.innerText=data
        if(data=="forgery detected"){
            setTimeout(()=>{
                location.replace("http://localhost:3769/home")
            },2000)
        }

        else if(data!="error occured,please try again"){
            location.replace(`http://localhost:3769/contest/${data}/configure`)
        }

        else{
            for(let box of question_boxes){
                box.addEventListener("dblclick",dblclickfunc)
                box.addEventListener("mousemove",mousemovefunc)
                box.addEventListener("mouseleave",mouseleavefunc)
            }
        }
        
    })
})



