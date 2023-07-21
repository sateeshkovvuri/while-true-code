async function results (contenders,questions,reports){
    let scoreBoard = {}
    await contenders.forEach((contender)=>{
        scoreBoard[contender] = 0;
    })

    await questions.forEach((question)=>{
        contenders.sort(function (a,b){
            console.log(a,b)
            let ratio_a = reports[question][a].testcase_passed/reports[question][a].total_testcase_count
            let ratio_b = reports[question][b].testcase_passed/reports[question][b].total_testcase_count
            
            if(ratio_a>ratio_b) return -1;
            else if(ratio_a == ratio_b){
                if(reports[question][a].subtime == reports[question][b].subtime) return 0;
                else if(reports[question][a].subtime > reports[question][b].subtime) return 1;
                return -1;
            }
            return 1;
            
        })

        let currentPoints = contenders.length
        scoreBoard[contenders[0]] +=currentPoints
    
        for(let i=1;i<contenders.length;i++){
            let ratio_a = reports[question][contenders[i-1]].testcase_passed/reports[question][contenders[i-1]].total_testcase_count
            let ratio_b = reports[question][contenders[i]].testcase_passed/reports[question][contenders[i]].total_testcase_count

            if(ratio_a > ratio_b) currentPoints--;
            else{
                if(reports[question][contenders[i-1]].subtime < reports[question][contenders[i]].subtime) currentPoints--;
            }
            
            scoreBoard[contenders[i]]+=currentPoints
        }

    })


    await contenders.sort((a,b)=>{
        if(scoreBoard[a]>scoreBoard[b])return -1;
        else if(scoreBoard[a]<scoreBoard[b])return 1;
        return 0;
    })

    return contenders;    

}

module.exports = results
