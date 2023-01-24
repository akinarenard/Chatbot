//
//  index.js
//  CommandParser version 1.0
//  Created by Ingenuity i/o on 2023/01/24
//
//  no description
//  Copyright © 2022 Ingenuity i/o. All rights reserved.
//

//server connection
function isConnectedToServerChanged(isConnected)
{
    if (isConnected)
        document.getElementById("connectedToServer").style.background = 'green';
    else
        document.getElementById("connectedToServer").style.background = 'red';
}

//inputs
var TextInputCount = 0;
function TextInputCallback(type, name, valueType, value, myData) {
    console.log(name + " changed (impulsion)");
    //add code here if needed

    TextInputCount++;
    document.getElementById("Text_input").innerHTML = TextInputCount + " times";
}


IGS.netSetServerURL("ws://localhost:5000");
IGS.agentSetName("CommandParser");
IGS.observeWebSocketState(isConnectedToServerChanged);

IGS.definitionSetVersion("1.0");


IGS.inputCreate("Text", iopTypes.IGS_IMPULSION_T, "");

IGS.outputCreate("Command", iopTypes.IGS_IMPULSION_T, "");


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
}

//update websocket config
function setServerURL() {
    IGS.netSetServerURL(document.getElementById("serverURL").value);
}

//write outputs
function setCommandOutput() {
    IGS.outputSetImpulsion("Command");
}

