const fs = require('fs')
const {parse} = require('csv-parse')
const crypto = require('crypto')
const readline = require("readline");



// read userInput
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("provide a relative path to your csv file", function(filePath) {
    //provide the relative path to ypur csv file
    chip0007Format(filePath)
    rl.close()
});

rl.on("close", function() {
    console.log("\nBYE BYE !!!");
});


function chip0007Format(pathToFile){
    let data = []
let mutatedData = []
//converting the csv to object
fs.createReadStream(pathToFile).pipe(parse({delimiter:",",columns:true,ltrim:true}))
.on("data",(row)=>{
    data.push(row)
})
.on("error",()=>{
    console.log("invalid file path")
})
.on("end",()=>{
    let team_name = ""
    mutatedData = data.map((json)=>{
        //mapping the infomation from the csvfile to chip-0007 format
        if(json["TEAM NAMES"] !== ""){
            team_name = json["TEAM NAMES"]
        }
        

        let newJson ={} 
        newJson["format"] = "CHIP-0007"
        newJson["name"] = json.Filename
        newJson["description"] = json.Description
        newJson["minting_tool"] = team_name
        newJson["sensitive_content"] = false
        newJson["series_number"] = json["Series Number"]
        newJson["series_total"] = 420
        newJson["attributes"] = json.Attributes.split(';').map((e)=>{
            let attr = e.split(":")
            return({
               "trait_type":attr[0],
               "value":attr[1] 
            })
        })
        newJson["collection"] = {
            "name": "Zuri NFT Tickets for Free Lunch",
            "id": "b774f676-c1d5-422e-beed-00ef5510c64d",
            "attributes": [
                {
                    type: "description",
                    value: "Rewards for accomplishments during HNGi9."
                }
            ]
        }
    

        return newJson
    })

    //hashing and appending it to the parent data

    mutatedData.forEach((json1,index)=>{
        let hash = crypto.createHash('sha256').update(JSON.stringify(json1)).digest('hex');
        data[index] = {...data[index],["hash_value"]:hash}
        
    })
    //convertind back to csv
    var fields = Object.keys(data[0])
    var replacer = function(key, value) { return value === null ? '' : value } 
    var csv = data.map(function(row){
        return fields.map(function(fieldName){
            return JSON.stringify(row[fieldName], replacer)
        }).join(',')
    })
    csv.unshift(fields.join(','))
        csv = csv.join('\r\n');
        try {
            fs.writeFileSync('./filename.output.csv', csv);
          } catch (err) {
            console.error(err);
          }
    })
}


