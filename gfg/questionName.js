let pid = require("./pid")
let fetch = require("./fetch")

const questionName = (link) =>{
    return new Promise (async(accept,reject)=>{

        pid(link).then((id)=>{
            fetch(id,"").then((data)=>{
                accept(data.message.problem_name)
            }).catch(()=>{
                reject("improper link")
            })
        }).catch(()=>{
            reject("improper link")
        })
        
        
    })
}

module.exports = questionName


