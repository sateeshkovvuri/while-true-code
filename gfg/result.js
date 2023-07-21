const problemData = require("./fetch")
const verification = require ("./verify")

const result = (problemID,startTime,endTime,players,verify,secretcode) =>{

    let report = "not verified"
    
    if(!verify){
        report = {}; 
        for(let player of players){
            report[player]={
                "total_testcase_count":1,
                "testcase_passed":-1,
                "subtime":1e60,
            }
        }    
    }

    return new Promise(async(accept,reject)=>{

        let refreshQuery= "";

        try{
            
            let reportWritten = false

            while (!reportWritten){

                let submissionsData = await problemData(problemID,refreshQuery).catch((response)=>{
                    reportWritten = true;
                    reject(response)
                })

                let refreshData = submissionsData.message.submissions.LastEvaluatedKey;
                
                if(refreshData!=null){
                    refreshQuery = `?last_submission_key=${refreshData.submission_id}&last_submission_key_time=${refreshData.subtime}`
                }
            
                
                let submissions = submissionsData.message.submissions.Items;
                
                for(let key in submissions){
                    const subtime = new Date(submissions[key].subtime).getTime();
                    let player = submissions[key].handle;


                    if(subtime<startTime){
                        reportWritten = true;
                        accept(report);
                        break;
                    }
                    
                    else if(subtime<=endTime && players.indexOf(player)!=-1){
                        if(!verify){
                            let ratio = undefined ;
                            const current_ratio = submissions[key]["testcase_passed"]/submissions[key]["total_testcase_count"];
                            
                            if(report[player]["total_testcase_count"]!=undefined){
                                ratio = report[player]["testcase_passed"]/report[player]["total_testcase_count"];
                            }
    
                            if(ratio == undefined  || ratio<=current_ratio){
                                for(let criteria in report[player]){
                                    report[player][criteria] = submissions[key][criteria]
                                }
                            }
                        }

                        else{
                            report = await verification(submissions[key].submission_id,secretcode).catch((data)=>{
                                reportWritten = true;
                                reject(data)
                            });
                            
                            if(report == "verified"){
                                reportWritten = true;
                                accept(report);
                                break;
                            }
                        }
                        
                    }
                }

                if(refreshData==null){
                    reportWritten =true
                    accept(report);
                }
                
            }
        }
        catch(e){
            reject("some error occured")
        }
    })
}

module.exports = result