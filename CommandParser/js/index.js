//
//  index.js
//  CommandParser version 1.0
//  Created by Ingenuity i/o on 2023/02/08
//
//  no description
//  Copyright © 2023 Ingenuity i/o. All rights reserved.
//
let data = {
    products:["robe", "chaussures", "chapeau"],
    sizes:["S", "M", "L"],
    colors:["black", "pink"]
};
//server connection
function isConnectedToServerChanged(isConnected)
{
    if (isConnected)
        document.getElementById("connectedToServer").style.background = 'green';
    else
        document.getElementById("connectedToServer").style.background = 'red';
}

//inputs
function reducedDataInputCallback(type, name, valueType, value, myData) {
    console.log(name + " changed to " + value);
    //add code here if needed
    data = JSON.parse(value)
}


IGS.netSetServerURL("ws://localhost:5000");
IGS.agentSetName("CommandParser");
IGS.observeWebSocketState(isConnectedToServerChanged);

IGS.definitionSetVersion("1.0");


IGS.inputCreate("reducedData", iopTypes.IGS_STRING_T, "");

IGS.outputCreate("Command", iopTypes.IGS_STRING_T, "");


//Initialize agent
IGS.observeInput("reducedData", reducedDataInputCallback);

//actually start ingescape
IGS.start();


//
// HTML example
//

document.getElementById("serverURL").value = IGS.netServerURL();
//document.getElementById("name").innerHTML = IGS.agentName();


function parse(text){
    result = []
    const parseProduct = (text) => {
        const tokens = text.split(/[ ,]+/)
        return tokens
            .filter(word => data.products != undefined && data.products.includes(word))
            .map(word => { 
                return {
                    product:word,
                    startingAt:tokens.indexOf(word)
                }
            })
    }
    const parseSizeAndColor = (text,products) => {
        for(let i = 0;i<products.length;i++) {
            products[i] = {...products[i],nextAt:(i < products.length -1 ? products[i+1].startingAt : text.split(/[ ,]+/).length)}
        }
        return products.map( ({product,startingAt,nextAt}) => {;
            const subText = text.split(/[ ,]+/).slice(startingAt,nextAt)
            const colors = subText.filter(word => data.colors != undefined && data.colors.includes(word))
            const sizes = subText.filter(word => data.sizes != undefined && data.sizes.includes(word))


            return {
                product,
                size:sizes.length > 0 ? sizes : ["All"],
                color:colors.length > 0 ? colors : ["All"]
            }
        })
    }
    return parseSizeAndColor(text,parseProduct(text))
}

function executeAction() {
    //add code here if needed
}

//update websocket config
function setServerURL() {
    IGS.netSetServerURL(document.getElementById("serverURL").value);
}

function clearErrorMessage() {
    document.getElementById('error-message').style.visibility = "hidden"
    document.getElementById('error-message').style.display = "none"
}

function triggerErrorMessage() {
    document.getElementById('error-message').style.visibility = "visible"
    document.getElementById('error-message').style.display = "block"
}

//write outputs
function setCommandOutput() {
    const text = document.getElementById("input").value
    parsedCommand = parse(text)
    console.log(parsedCommand)
    if(parsedCommand.length > 0) {
        result = {command : parsedCommand, request : text}
        IGS.outputSetString("Command", JSON.stringify(result));
    } else {
        triggerErrorMessage()
    }
}

