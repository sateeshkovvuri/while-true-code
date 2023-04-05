let db=undefined;
(async()=>{
    db=await require("../database/mysql.js").catch(()=>{
        db=undefined
    })
})()

const express=require("express")
const server=express.Router()

server.get("/",(req,res)=>{
    let sql=undefined
    let user="sateesh" //req.body.user
    sql=`select contests from user_contests where user='${user}'`

    db.query(sql,(err,result)=>{
        if(err){
            res.send("some error occurred")
        }
        else{
            let cids=JSON.parse(result[0].contests)
            if (cids.length==0){
                res.send("manage your contests here")
                return 
            }
            else{
                sql='select contest_name,status,duration,contest_end from contest_details where contest_id in '
                let values='('
                for(let index in cids){
                    if(index!=cids.length-1) values+=`"${cids[index]}",`
                    else values+=`"${cids[index]}")`
                }
                sql+=values
                
                let data={}

                db.query(sql,(err,result)=>{
                    if(err){
                        res.send("some error occured")
                    }
                    else{
                        for(let index in result){
                            let res=result[index]
                            let date=new Date(Number(result[index].contest_end))
                            let check_on="Date: "+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+", Time: "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()
                            data[cids[index]]=[res.contest_name,res.status,res.duration.split(" "),res.contest_end,check_on]
                        }
                        res.render("contest/manage.ejs",{"data":[data,String(new Date().getTime())]})
                    }
                })
            }

        }
    })
})

server.post("/delete",(req,res)=>{
    if(db==undefined){
        res.send("some error occured")
        return 
    }
    else{
        let sql=undefined
        let user="sateesh" //req.body.user
        let delete_contest=Object.keys(req.body)[0]

        sql=`select contests from user_contests where user="${user}"`

        db.query(sql,(err,result)=>{
            if(err){
                res.send("some error occured")
            }
            else{
                let contests=JSON.parse(result[0].contests)
                
                contests=contests.filter((contest)=>{return contest!=delete_contest})

                contests=JSON.stringify(contests)
                sql=`update user_contests set contests='${contests}' where user="${user}"`
                db.query(sql,(err,result)=>{
                    if(err){
                        res.send("some error occured")
                    }
                    else{
                        sql=`delete from contest_details where contest_id="${delete_contest}"`
                        db.query(sql,(err,result)=>{
                            if(err){
                                res.send("some error occured")
                            }
                            else{
                                res.redirect("http://localhost:3769/manage")
                            }
                        })
                    }
                })
            }
        })
        
    }
    
    
})

server.post("/:contest_id/start",(req,res)=>{
    let cid=req.params.contest_id
    if(db==undefined){
        res.send("error occured")
    }
    else{
        let sql=undefined
        sql=`select duration from contest_details where contest_id='${cid}'`
        db.query(sql,(err,result)=>{
            if(err){
                res.send("error occured")
            }
            else{
                const contest_duration=result[0].duration.split(" ")

                let now=new Date()
                let now1=new Date()
                let calender=require("date-and-time")
                for(let i=0;i<=3;i++){
                    switch(i){
                        case 0:
                            now=calender.addDays(now,Number(contest_duration[0]))
                            break
                        case 1:
                            now=calender.addHours(now,Number(contest_duration[1]))
                            break
                        case 2:
                            now=calender.addMinutes(now,Number(contest_duration[2]))
                            break
                        case 3:
                            now=calender.addSeconds(now,Number(contest_duration[3]))
                    }
                }

                sql=`update contest_details set contest_end='${String(now.getTime())}',status='online' where contest_id='${cid}'`
                db.query(sql,(err,result)=>{
                    if(err){
                        res.send("error occured")
                    }
                    else{
                        res.redirect("http://localhost:3769/manage")
                    }
                })
            }
        })
    }
})

server.post("/:contest_id/result",(req,res)=>{
    
    let cid=req.params.contest_id
    if(db==undefined){
        res.send("error occured")
    }
    else{
        let sql=undefined
        sql=`select contest_end from contest_details where contest_id='${cid}'`
        db.query(sql,(err,result)=>{
            if(err){
                res.send("error occured")
            }
            else{
                let now=new Date().getTime()
                if(now>=result[0].contest_end){
                    res.send("result will be shown here")
                }
                else{
                    let date=new Date(Number(result[0].contest_end))
                    let check_on="Date: "+date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear()+", Time: "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()
                    res.send(`contest is still online .. try again after contest ends (${check_on})`)
                }
                
            }
        })
    }
    
})

module.exports=server