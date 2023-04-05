const mysql=require("mysql")


let con = mysql.createConnection({
  host: "localhost",
  user: "your user name",
  password: "your password",
  database:"your database"

});

let connection=new Promise((accept,reject)=>{
  con.connect((err)=>{
    if(err)reject(err)
    else accept(con)
  })
})

module.exports=connection

