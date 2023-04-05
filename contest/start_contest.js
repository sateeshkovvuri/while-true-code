let db=undefined;
(async()=>{
    db=await require("../database/mysql.js").catch(()=>{
        db=undefined
    })
})()

const express=require("express")
const fetch=require("node-fetch")
const server=new express.Router()
const gfg= require("../scrapper/submissions_gfg.js")
const pid=require("../scrapper/pid.js")

server.get("/start",(req,res)=>{
    res.render("contest/start.ejs")
})

server.post("/problemname",async(req,res)=>{
    let url=req.body.url
    let error=false
    let problemid=await pid(url).catch(()=>{
        error=true
        res.send("wrong link")
    })
    if(error)return 
    let data=await gfg(problemid,false,{}).catch(()=>{
        error=true
        res.send("error occurred")
    })
    if(error)return 
    let problemname=undefined
    try{
        problemname=data.message.problem_name
        res.send(problemname)
    }
    catch{
        res.send("error occurred")
    }

})

server.post("/configure-approve",async(req,res)=>{
    let data=req.body.urls
    let organizer=req.body.organizer
    if(JSON.stringify(data)=="{}"){
        res.send("forgery detected")
        return
    }
    let error=false
    let options={
        method:"post",
        headers:{
        'Content-Type': 'application/json;charset=utf-8'
        }
    }

    for(let x in data){
        options["body"]=JSON.stringify({url:data[x]})
        let problemname=await fetch("http://localhost:3769/contest/problemname",options)
        problemname=await problemname.text()
        if(x!=problemname){
            error=true
            break
        }
    }
    if(error){
        res.send("forgery detected")
        return
    }
    let date=new Date()
    let unique_event=String(date.getDate())+String(date.getMonth())+String(date.getFullYear())+String(date.getTime())+organizer
    
    const crypto = require('crypto'),
    hash = crypto.getHashes();
    let eventid= crypto.createHash('sha1').update(unique_event).digest('hex');


    let payload={}
    payload["eventid"]=eventid
    payload["urls"]=data
    payload["organizer"]=organizer
    options["body"]=JSON.stringify(payload)
    
    fetch("http://localhost:3769/contest/dbregister",options).then((response)=>{
        return response.text()
    }).then((data)=>{
        if(data=="success"){
            res.send(eventid)
        }
        else{
            res.send("error occured,please try again")
        }
    })
    
})

server.post("/dbregister",async(req,res)=>{

    if(db==undefined){
        res.send("error occured")
        return
    }

    let contest_id=req.body.eventid
    let organizer=req.body.organizer 
    let problems=req.body.urls

    for(let problem in problems){
        let before_problem=problem
        let after_problem=before_problem.replace("'"," ")
        while(before_problem!=after_problem){
            before_problem=after_problem
            after_problem=after_problem.replace("'"," ")
        }
        let temp=problems[problem]
        delete(problems[problem])
        problems[before_problem]=temp
    }

    let scoring_details=JSON.parse(JSON.stringify(problems))

    for(let question in scoring_details){
        scoring_details[question]="false"
    }

    scoring_details=JSON.stringify(scoring_details)

    problems=JSON.stringify(problems)

    let sql=undefined
    
    sql=`select contests from user_contests where user= "${organizer}"`

    db.query(sql,(err,result)=>{
        if(err){
            res.send("error")
        }
        else{
            let from_db=result[0].contests
            let contests=JSON.parse(from_db)

            contests.push(contest_id)
            contests=JSON.stringify(contests)

            sql=`update user_contests set contests='${contests}' where user='${organizer}'`

            db.query(sql,(err,result)=>{
                if(err){
                    res.send("error")
                }
                else{
                    sql=`insert into contest_details (contest_id,problems,organizer,status,duration,scoring_details) values ('${contest_id}','${problems}','${organizer}','configuring','   ','${scoring_details}')`

                    db.query(sql,(err,result)=>{
                        if(err){
                            res.send("error")
                        }
                        else{
                            res.send("success")
                        }
                    })
                }
            })
            
        }
    })

})

server.get("/:contest_id/configure",async(req,res)=>{
    if(db==undefined){
        res.send("some error occured")
        return
    }

    let sql=undefined

    let cid= req.params.contest_id
    
    sql=`select * from contest_details where contest_id='${cid}'`

    db.query(sql,(err,result)=>{
        try{

        result[0]["problems"]=JSON.parse(result[0]["problems"])
        result[0]["duration"]=result[0]["duration"].split(" ")
        result[0]["scoring_details"]=JSON.parse(result[0]["scoring_details"])
        
        if(err){
            res.send("some error occured")
        }
        else res.render("./contest/configure.ejs",{data:result[0]})
        }

        catch(err){
            res.redirect("http://localhost:3769/home")
        }
    })
})

server.post("/configuration-update",async(req,res)=>{
    const payload=req.body

    let sql=`update contest_details set scoring_details='${JSON.stringify(payload.partial_scoring_data)}', duration="${payload.duration}",contest_name="${payload.contest_name}",status="ready" where contest_id="${payload.contest_id}"`
    db.query(sql,(err,result)=>{
        if(err){
            res.send("error")
        }
        else{
            res.send("ok")
        }
    })
})


module.exports=server