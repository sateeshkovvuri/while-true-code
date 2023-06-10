const fetch = require("node-fetch-commonjs")

const pid = (url)=>{
    return new Promise((accept,reject)=>{
        try{
            fetch(url).then((response)=>{
                return response.text()
            }).then((data)=>{
                let searchFor= `"id":`
                let index = data.indexOf(searchFor);
                
                if(index==-1) reject("incorrect url");
                else{
                    let extract= index + searchFor.length;
                    let problemID = "";
                    for(extract;data[extract]!=',';extract++){
                        problemID+=data[extract]
                    }
                    accept(problemID)
                }
            }).catch(()=>{
                reject("invalid question link")
            })
        }
        catch{
            reject("some error occured")
        }
    })
}


module.exports = pid;
