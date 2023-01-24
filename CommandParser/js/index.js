//
//  index.js
//  CommandParser version 1.0
//  Created by Ingenuity i/o on 2023/01/24
//
//  no description
//  Copyright © 2022 Ingenuity i/o. All rights reserved.
//


import { parse } from './parser.js';

//server connection
function isConnectedToServerChanged(isConnected)
{
    if (isConnected)
        document.getElementById("connectedToServer").style.background = 'green';
    else
        document.getElementById("connectedToServer").style.background = 'red';
}

//inputs
function TextInputCallback(type, name, valueType, value, myData) {
    console.log(name + " changed to " + value);
    //add code here if needed

    document.getElementById("Text_input").value = value;
}


IGS.netSetServerURL("ws://localhost:5000");
IGS.agentSetName("CommandParser");
IGS.observeWebSocketState(isConnectedToServerChanged);

IGS.definitionSetVersion("1.0");


IGS.inputCreate("Text", iopTypes.IGS_STRING_T, "");

IGS.outputCreate("Command", iopTypes.IGS_DATA_T, new ArrayBuffer());


//Initialize agent
IGS.observeInput("Text", TextInputCallback);

//actually start ingescape
IGS.start();


//
// HTML example
//

document.getElementById("serverURL").value = IGS.netServerURL();
document.getElementById("name").innerHTML = IGS.agentName();

function executeAction() {
    //add code here if needed
    const data = parse(document.getElementById("Text_input").value);
    setCommandOutput(data);
}

//update websocket config
function setServerURL() {
    IGS.netSetServerURL(document.getElementById("serverURL").value);
}

//write outputs
function setCommandOutput(dataHex) {
    console.log("oui")
    if (dataHex.length === 0) {
        IGS.outputSetData("Command", null);
        return false;
    }
    else {
        // split the string into pairs of octets
        var pairs = dataHex.match(/[0-9A-Fa-f]{2}/g);
        if (pairs) {
            // dataHex is valid, convert the octets to integers
            var uint8array = new Uint8Array(pairs.map(function (h) {
                return parseInt(h, 16);
            }));
            IGS.outputSetData("Command", uint8array.buffer);
            return false;
        }
    }
    return true;
}

