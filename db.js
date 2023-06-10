const { MongoClient} = require("mongodb");

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

const configured_client = new Promise(async(accept,reject)=>{
    try{
        const connection = await client.connect()
        const collection = await connection.db("whiletruecode").collection("verification")
        await collection.createIndex({"expireAt":1} , {expireAfterSeconds:0})
        await connection.close()
        accept(client)
    }
    catch{
        reject("some error occured while configuring database")
    }
})


module.exports = configured_client
