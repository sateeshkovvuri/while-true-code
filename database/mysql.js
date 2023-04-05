const mysql=require("mysql")


let con = mysql.createConnection({
  host: "localhost",
  user: "sateesh",
  password: "25050023",
  database:"whiletruecode"

});

let connection=new Promise((accept,reject)=>{
  con.connect((err)=>{
    if(err)reject(err)
    else accept(con)
  })
})

module.exports=connection

