const express = require ("express")
const server = new express()
const jwt = require("jsonwebtoken")
const {parse} = require("cookie")

const host = "http://localhost:2000/"

require("./db").then((db)=>{
    console.log("successfully configured database")
    try{
        require("./socket")()
        server.listen(2000,()=>{
            console.log("Server active ..")
        })
    }
    catch{
        console.log("some error occured")
    }
}).catch((data)=>{
    console.log(data)
})


const pid = require("./gfg/pid")
const { ObjectId } = require("mongodb")
const questionName = require("./gfg/questionName")


server.use(express.urlencoded({extended:true}))
server.use(express.json({extended:true}))


server.get("/signin",(req,res)=>{
    res.render("signin.ejs",{"host":host})
})

server.get("/signout",(req,res)=>{
    res.setHeader('Set-Cookie', [
        `authToken=""; Path=/; SameSite=Strict;`,
    ]);
    res.redirect(host+"signin")
})

server.post("/authenticate",async(req,res)=>{
    const client = await require("./db")
    const connection = await client.connect()
    try{
        const profiles = await connection.db("whiletruecode").collection("profiles")
        const profile = await profiles.findOne({"handle":req.body.username,"password":req.body.password})
        if(profile == null){
            res.send("incorrect credentials")
        }
        else{
            const token = jwt.sign({"handle":profile.handle},"helloworlditswhiletruecodebykovvurisateeshreddy")

            res.setHeader('Set-Cookie', [
                `authToken=${token}; Path=/; SameSite=Strict;`,
              ]);            
            res.send("authenticated")
        }
    }
    catch{
        res.send("some error occured")
    }
    finally{
        await connection.close()
    }
})

function authenticate(req,res,next){
    try {
        const cookies = parse(req.headers.cookie)
        jwt.verify(cookies.authToken,"helloworlditswhiletruecodebykovvurisateeshreddy",(err,data)=>{
            if(!err){
                req.user = data.handle
                next();
            }
            else{
                throw new Error();
            }
        })
    }
    
    catch{
        res.redirect(host+"signin")
    }
    
}

server.use(express.static("./public"))

server.get("/home",(req,res)=>{
    res.render("./home.ejs",{"host":host})
})

server.get("/verify",async (req,res)=>{
    res.render("verify.ejs",{expiryTime:new Date(Date.now()+300000),"host":host})
})

server.post("/verifyUserHandle" ,async(req,res)=>{
    if(req.headers["content-type"] == "application/x-www-form-urlencoded") return;

    let client = await require("./db")
    let connection = await client.connect()
    
    try{
        let verification = connection.db("whiletruecode").collection("verification")
        let secretCodeData = await verification.findOne({connectionID:req.body.connectionID})
        let verificationCode = secretCodeData._id.toString()

        if(secretCodeData == null || secretCodeData.expireAt.getTime()<=Date.now()){
            res.send("session expired")
        }

        else{

            let invalidLink = false
            let id = await pid(req.body.solvedQuestion).catch((response)=>{
                invalidLink =true
                res.send("improper link provided")
            })

            if(invalidLink) return ;

            let endTime = secretCodeData.expireAt.getTime()
            let startTime = endTime-300000
            
            let report = await result(id,startTime,endTime,[req.body.gfgUserName],true,verificationCode).catch((data)=>{return data})
            
            if(report == "verified"){
                let profiles = await connection.db("whiletruecode").collection("profiles")

                let profile = await profiles.findOne({"handle":req.body.gfgUserName});
                
                if(profile == null){
                    const initializeUser = {
                        "handle":req.body.gfgUserName,
                        "password":req.body.password,
                        "registeredContests":[]
                    }
                    await profiles.insertOne(initializeUser)
                }

                else{
                    await profiles.updateOne({"handle":req.body.gfgUserName},{$set:{"password":req.body.password}})
                }

            }

            res.send(report);
            
        }

    }

    catch(e){
        res.send("error occured")
    }

    finally{
        await connection.close();
    }

    
})

server.use(authenticate)

server.set("engine","ejs")



const result = require("./gfg/result")



server.get("/create",(req,res)=>{
    res.render("contest.ejs",{"host":host})
})

server.post("/db/createContest",async(req,res)=>{
    
    let client = undefined,connection = undefined;
    try{
        client = await require("./db")
        connection = await client.connect()
        const db = await connection.db("whiletruecode")
        const collection = await db.collection("profiles")
        const profile = await collection.findOne({handle:req.user})
        
        if(profile != null){
            const contests = await connection.db("whiletruecode").collection("contests")

            const contestQuestions = {}

            let contestDetails = ["contestName","contestDesc","creator","autoStartContest","startTime","hours","minutes","seconds"]
            for(let key in req.body){
                if(contestDetails.indexOf(key)==-1){
                    let verifiedName = await questionName(key).catch(()=>{throw new Error()})
                    let id = await pid(key)
                    contestQuestions[verifiedName] = {
                        "pid":id,
                        "problem_link": key,
                        "points":req.body[key].points
                    }
                }
            }

            const contestData = {
                "creator":req.user,
                "contestName":req.body.contestName,
                "contestDesc":req.body.contestDesc,
                "questions":contestQuestions,
                "reports":undefined,
                "contenders":[]
            }

            let startTime = req.body.startTime
            contestData["startTime"] = startTime
            contestData["duration"] = (req.body["hours"]*3600 + req.body["minutes"]*60 + Number(req.body["seconds"]))*1000;
            if(startTime != undefined) contestData["startTime"] = new Date(startTime).getTime()

            await contests.insertOne(contestData)
        }

        else{
            throw new Error()
        }

        res.send("ok")
    }

    catch(e){
        res.send("error")
    }

    finally{
        await connection.close();
    }
    
})

server.post("/questionName",async(req,res)=>{
    
    require("./gfg/questionName")(req.body.link).then((data)=>{
        res.send(data)
    }).catch((data)=>{
        res.send(data)
    })
    
})


server.get("/mycontests",(req,res)=>{
    res.render("createdContests.ejs",{"host":host})
})

server.post("/createdContests",async(req,res)=>{
    const client = await require("./db")
    const connection = await client.connect()
    try{
        const contests = await connection.db("whiletruecode").collection("contests")
        const createdContests = await contests.find({"creator":req.user})
        const response_to_send = []

        await createdContests.forEach(document => {
            if(document.reports != null) document.reports = "generated"
            response_to_send.push(document)
        });

        response_to_send.reverse()

        res.send(response_to_send)
    }
    catch{
        res.send("some error occured")
    }
    finally{
        await connection.close()
    }
})


server.post("/startContest",async(req,res)=>{
    const client = await require("./db")
    const connection = await client.connect()
    try{
        const contests = await connection.db("whiletruecode").collection("contests")
        const y = await contests.updateOne({"_id":new ObjectId(req.body.contestID)},{$set:{"startTime":Date.now()}})
        res.send("ok")
    }
    catch{
        res.send("some error occured")
    }
    finally{
        await connection.close()
    }

})

server.get("/registeredcontests",(req,res)=>{
    res.render("registered.ejs",{"host":host})
})

server.post("/register",async(req,res)=>{
    const client = await require("./db")
    const connection = await client.connect()
    try{
        const contests = await connection.db("whiletruecode").collection("contests")
        const contest =await contests.findOne({"_id":new ObjectId(req.body.contestid)})
        if(contest == null) {
            res.send("incorrect contest id")
            return 
        }
        let startTime = contest.startTime
        let duration = contest.duration
        let endTime = startTime+duration
        let currentTime = Date.now()
        if(startTime == null  || endTime>currentTime){
            const profiles = await connection.db("whiletruecode").collection("profiles")
            
            await contests.updateOne({"_id":new ObjectId(req.body.contestid)},{
                $addToSet : {"contenders":req.user}
            })

            await profiles.updateOne({"handle":req.user},{
                $addToSet:{
                    "registered" : req.body.contestid
                }
            })

            res.send("ok")
        }
        else if(currentTime>=endTime){
            res.send("contest ended")
        }
    

    }
    catch{
        res.send("error occured")
    }
    finally{
        await connection.close()
    }
})

server.post("/allRegisteredContests",async(req,res)=>{
    const client = await require("./db")
    const connection = await client.connect()

    try{
        const profiles = await connection.db("whiletruecode").collection("profiles")
        const profile = await profiles.findOne({"handle":req.user})
        const regcontests = profile.registered

        const response = {}
        const contests = await connection.db("whiletruecode").collection("contests")

        regcontests.reverse()

        for(let key in regcontests){
            const id = regcontests[key]
            let contest = await contests.findOne({"_id":new ObjectId(id)})

            if(contest != null){
                response[id]={
                    "contestname":contest.contestName,
                    "contestdesc":contest.contestDesc,
                    "starttime":contest.startTime,
                    "duration":contest.duration,
                    "creator":contest.creator
                }            
            }

            if(key == regcontests.length-1){
                res.send(response)
            }
        }
    }
    catch{
        res.send({"error":"some  error occured"})
    }
    finally{
        await connection.close()
    }
})

server.get("/contest/:id",async(req,res)=>{
    const client = await require("./db")
    const connection = await client.connect();

    try{
        const profiles = await connection.db("whiletruecode").collection("profiles")
        const profile = await profiles.findOne({"handle":req.user})
        const registered = profile.registered

        const contests = await connection.db("whiletruecode").collection("contests")
        const contest = await contests.findOne({"_id":new ObjectId(req.params.id)})        
        contest["endTime"] = new Date(contest["startTime"]+contest["duration"])

        function conditionalRender(){
            const currentTime = Date.now();
            if(contest.startTime != null && contest.startTime<=currentTime){
                res.render("contestPage.ejs",{
                    contestDetails:contest
                })                
            }
            else{
                res.send("contest is not started")
            }            
        }

        if(contest == null){
            res.send("contest doesnt exists");
            return;
        }

        if(registered.indexOf(req.params.id)!=-1) conditionalRender();
        else{
            if(contest.creator == req.user) conditionalRender();
            else res.send("you have'nt registered for the following contest")
        }

    }
    catch{
        res.send("some error occured")
    }
    finally{
        await connection.close()
    }
})

server.get("/generateresults/:id",async(req,res)=>{
    const client = await require("./db")
    const connection = await client.connect()
    try{
        const id = new ObjectId(req.params.id);
        const contests = await connection.db("whiletruecode").collection("contests")
        const contest = await contests.findOne({"_id":id})
        
        if(contest.creator!=req.user){
            res.send("results can be generated only by the creator");
            return;
        }

        if(contest.reports!=null){
            res.redirect(host+`results/${req.params.id}`)
            return
        }

        let contenders = contest.contenders
        let questions = contest.questions
        
        let result = require("./gfg/result")
        let reports = {}

        let startTime = contest.startTime
        let duration = contest.duration
        let endTime = startTime+duration
        let currentTime = Date.now()

        if(currentTime<=endTime){
            res.send("contest did`nt end")
            return
        }

        
        let keys = Object.keys(questions)

        for(let key=0 ;key<keys.length ;key++){
            let question = keys[key]
            let report = await result(questions[question].pid,startTime,endTime,contenders,false,undefined)
            
            reports[question]=report;

            if(key==keys.length-1){
                await contests.updateOne({"_id":id},{$set:{
                    "reports":{
                        "scoreBoard":await require("./results")(contenders,keys,reports,contest.questions),
                        "questionWiseReport":reports
                    }
                }})

                res.redirect(host+`results/${req.params.id}`)
            }
        }

    }
    catch(e){
        res.send("some error occured")
    }
    finally{
        await connection.close()
    }
    
})

server.get("/results/:id",async (req,res)=>{
    const client = await require("./db")
    const connection = await client.connect()
    try{
        const contests = await connection.db("whiletruecode").collection("contests")
        const id = new ObjectId(req.params.id)
        const contest = await contests.findOne({"_id":id})

        if(contest == null) throw new Error()

        else if(contest.contenders.indexOf(req.user)!=-1 || contest.creator == req.user){
            const reports = contest.reports
            if(reports == null) {
                res.send("results will be shown here");
                return;
            }
            reports["contestName"] = contest.contestName
            reports["creator"] = contest.creator
            reports["questions"]= contest.questions
            res.render("resultsPage.ejs",reports)
        }

        else{
            res.send("results will be only available to registered people or creator")
        }
    }
    catch{
        res.send("requested contest doesnt exist")
    }
    finally{
        await connection.close()
    }
})






