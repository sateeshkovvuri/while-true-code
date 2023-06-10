const socket = () =>{

console.log("socket is open")

const server_side_of_socket = require("socket.io")(2001,{
    "cors":{
        "origin":"*"
    }
})

server_side_of_socket.on("connection",async(connection)=>{
    
    connection.emit("id",connection.id)
    const client = await require("./db")

    connection.on("disconnect",async()=>{

        try{
            const dbConnection = await client.connect()
            const verification = await dbConnection.db("whiletruecode").collection("verification")
            await verification.deleteOne({"connectionID":connection.id})
        }
        catch{}
        finally{
            await dbConnection.close()
        }
    })
    
    
    const dbConnection = await client.connect()
    try{
        
        const verification = await dbConnection.db("whiletruecode").collection("verification")
        const expiryTime = new Date(Date.now()+300000)
        const secretCodeData = {
            "connectionID" : connection.id,
            "expireAt":expiryTime,
        }
        const secretCode = (await verification.insertOne(secretCodeData)).insertedId.toString()
        connection.emit("verificationCode",secretCode)
    }
    catch{
        connection.emit("verificationCode","some error occured")
    }
    finally{
        await dbConnection.close()
    }
})

}

module.exports = socket