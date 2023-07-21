const fetch = require("node-fetch-commonjs")
const pid = require("./pid")


let cookie = `_gcl_aw=GCL.1683053067.Cj0KCQjw6cKiBhD5ARIsAKXUdyY9L3npCCQh2QMn5g-ZIZurhqD6CXULBPEeuLx-ucrigTwet29Rr5kaAlh5EALw_wcB; _gcl_au=1.1.1495172357.1683053067; _ga=GA1.2.1956048458.1683053068; _gac_UA-71763465-1=1.1683053079.Cj0KCQjw6cKiBhD5ARIsAKXUdyY9L3npCCQh2QMn5g-ZIZurhqD6CXULBPEeuLx-ucrigTwet29Rr5kaAlh5EALw_wcB; _clck=1r2fsf9|2|fc0|0|1227; _fbp=fb.1.1683053069184.1953656169; g_state={"i_p":1683060270808,"i_l":1}; _ga_SZ454CLTZM=GS1.1.1685348523.48.1.1685348593.60.0.0; gfg_nluid=0a12fce5ecc7678581838442c418d4c5; gfguserName=kovvurisateesh%2FeyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvd3d3LmdlZWtzZm9yZ2Vla3Mub3JnXC8iLCJpYXQiOjE2ODMwNTMxMjQsImV4cCI6MTY5MDgyOTEyMywiaGFuZGxlIjoia292dnVyaXNhdGVlc2giLCJ1dWlkIjoiNTM2ZTk2OThkODhlYTExZDcyOWI5ZWU3ZTg5ZDE5NWEiLCJwcm9maWxlVXJsIjoiaHR0cHM6XC9cL21lZGlhLmdlZWtzZm9yZ2Vla3Mub3JnXC9pbWctcHJhY3RpY2VcL3VzZXJfd2ViLTE1OTg0MzMyMjguc3ZnIiwiaW5zdGl0dXRlSWQiOjI1NCwiaW5zdGl0dXRlTmFtZSI6IkpOVFVIIENvbGxlZ2Ugb2YgRW5naW5lZXJpbmcgS2FyaW0gTmFnYXIiLCJuYW1lIjoiS292dnVyaSBzYXRlZXNoIHJlZGR5IiwiaXNJbnRlcmVzdFNlbGVjdGVkIjp0cnVlLCJwdWlkIjoidVdPS1M5NDEwQT09IiwiYWlkIjoiM2dtZVRkRVwvMFNUU2VnPT0iLCJwYSI6MX0.bjUzMCmWbyK333zWMmZVM0zPoZxoAZLnnrCNOnGN3Hrd0bo2J9a3ZOml_O98d85cy7khGzPfm79FZPJjNfC9TP8mVaRN4uncPE433yRPXtekWEEmQL-JTo7IS6OkByIb6fyOzgfCVYGzQf71JYdb8ZlEBe_1bmgzH_edso-yt695bpVkS4qb6_TMYkXpI4Ab0xWoP12o_Fgn80i9Bz89iT5iRe-8XlAVPOK6W8mkAX2LzSNN_NEfe5uHGJZhlA5u-PV5Ex4gYjb_qXwdtZtpCnrsPeajbkqZ5L0pUjy3TuPSOg4Os_l6hLVm_f_urY6zqNNpckAnmC2WnzDpQG4bHw; gfg_id5_identity=5feceb66ffc86f38d952786c6d696c79c2dbc239dd4e91b46729d73a27fb57e9; gfg_id5_ugen=0d248e82c62c9386878327d491c762a002152d42ab2c391a31c44d9f62675ddf; gfg_id5_utype=776af9401679287d8d332e26e99062919d58a135f4ef5ba85d4ec981b50f58ae; gfg_id5_ugy=6557739a67283a8de383fc5c0997fbec7c5721a46f28f3235fc9607598d9016b; _ga_DWCCJLKX3X=GS1.1.1685295967.15.1.1685299376.25.0.0; gfg_theme=gfgThemeDark; _gaexp=GAX1.2.hiI9en02TV2WdjU8amdFkA.19505.1!4WtBib_-ReCni-nRCo-EHQ.19509.1!woGPWC5rRw-Gi-1EJiDX_Q.19531.0; RT="z=1&dm=geeksforgeeks.org&si=5gi1cjarevt&ss=lhht1uwx&sl=0&tt=0"; __gads=ID=cf28d5e9aef90bd8:T=1683729472:RT=1685299201:S=ALNI_MYSE3Gx_5o0pqwh8WF3D4TJC_Xj-w; __gpi=UID=00000c0413abb2ca:T=1683729472:RT=1685299201:S=ALNI_MZkFu8QrUAhLpSt13bfQ1cXuQ5j9A; cto_bundle=_pvcFF9kSjV4N1JLSFQlMkYzZEZtTXNwbGtRVjE3ZCUyQmhud3FLNHlTdUtycXdqcTNjTGtDZ2NpZFh3SnNGc3B4ZHglMkI2UmFEdFhEbjZkYmE1dzZTbUJjNVgzeWRmUlklMkZ4RjM4Uzl2NjBqcTlvZjF2JTJGdiUyQmhUZCUyQlNjZ1ZiS1pDRFJpQmR4aVVLT1pBY00lMkJQenA4ZkdEejVYdUhNU2ZnJTNEJTNE; _gid=GA1.2.1505951109.1685293970; FCNEC=%5B%5B%22AKsRol_ZKdylX7-RiotgR5mXRWVL05JrlifuLh6FMk3pYT4sEyRnmNAncW2SAT266looNqlJmi2lxK0__AHNW07xwCpcWiNT9jWLFkgAqaV6as7n0VXKwewP38Ai2S7_ZktnFFydC42SzC9kWSYofd6cSugdWLOY7Q%3D%3D%22%5D%2Cnull%2C%5B%5D%5D; _clsk=1if2c6u|1685348526890|1|1|y.clarity.ms/collect`


const problemData = (problemid,refreshQuery) =>{
    return new Promise(async(accept,reject)=>{
        try{
            const url = `https://practiceapi.geeksforgeeks.org/api/latest/problems/${problemid}/submissions/${refreshQuery}`;
            fetch(url,{
                headers:{
                "Cookie":cookie
            }
            }).then((response)=>{
                return response.json()
            }).then((data)=>{
                accept(data)
            }).catch(()=>{
                reject("some error occured")
            })
        }
        catch{
            reject("some error occured");
        }
    })
}

module.exports = problemData