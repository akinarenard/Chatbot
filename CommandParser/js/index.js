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

function stripLastS(w) {
    if(w.charAt(w.length-1) === "s"){
        return w.slice(0,-1)
    }
    return w
}

function lemmatizer(text) {
    const determiners = ["le","la","les","un","une","des","du","de","la","des", 
        "ce","cette","ces ","ceci","celà","cette-ci","ces","mon","ma","mes","ton","ta","tes","son","sa","ses","notre","nos","votre","vos","leur","leurs",
        "aucun","aucune","pasun","pasune","nul","nulle","certain","certains","certaine","certaines","aucun","aucune","quelque","quelques","plusieurs","chaque","tout","toute","tous","toutes","n'importequels","n'importequel","n'importequelle","n'importequelles",
        "un","une",
        "lequel","laquelle","lesquels","lesquelles","auquel","àlaquelle","auxquels","auxquelles","duquel","delaquelle","desquels","desquelles",
        "quel","quelle,quels","quelles",
    ]
    const pronom = ["je","tu","il","elle","nous","vous","ils","elles","on"]
    words =  text.split(/[ ,]+/)
        .map(w => w.toLowerCase())
        .filter(w => !determiners.includes(w))
        .filter(w => !pronom.includes(w))
        .map(stripLastS)
    return words
}

/**
 * fonction permettant de parser un text pour en extraire les produits, les tailles et les couleurs disponible dans les données.
 */
function parse(text){
    result = []
    /**
     * fonction permettant de parser des produits dans un texte
     */
    const parseProduct = (tokens) => {
        return tokens
            .filter(word => data.products != undefined && data.products.map(w => w.toLowerCase()).map(stripLastS).includes(word))
            .map(word => { 
                return {
                    product:word,
                    startingAt:tokens.indexOf(word)
                }
            })
    }
    /**
     * fonction permettant de parser les couleurs et les tailles aprés avoir troivé un produit
     */
    const parseSizeAndColor = (tokens,products) => {
        for(let i = 0;i<products.length;i++) {
            products[i] = {...products[i],nextAt:(i < products.length -1 ? products[i+1].startingAt : text.split(/[ ,]+/).length)}
        }
        return products.map( ({product,startingAt,nextAt}) => {;
            const subText = tokens.slice(startingAt,nextAt)
            const colors = subText.filter(word => data.colors != undefined && data.colors.map(w => w.toLowerCase()).map(stripLastS).includes(word))
            const sizes = subText.filter(word => data.sizes != undefined && data.sizes.map(w => w.toLowerCase()).map(stripLastS).includes(word))


            return {
                product,
                size:sizes.length > 0 ? sizes : ["All"],
                color:colors.length > 0 ? colors : ["All"]
            }
        })
    }
    tokens = lemmatizer(text)
    return parseSizeAndColor(tokens,tokens)
}

function executeAction() {
    //add code here if needed
}

//update websocket config
function setServerURL() {
    IGS.netSetServerURL(document.getElementById("serverURL").value);
}
/**
 * fonction enleveant le message d'erreur
 */
function clearErrorMessage() {
    document.getElementById('error-message').style.visibility = "hidden"
    document.getElementById('error-message').style.display = "none"
}
/**
 * fonction affichant un message d'erreur
 */
function triggerErrorMessage() {
    document.getElementById('error-message').style.visibility = "visible"
    document.getElementById('error-message').style.display = "block"
}
function isEnter(e){
    if(e.keyCode == 13) {
        setCommandOutput()
    }
}
//write outputs
/**
 * fonction permettant l'envoie des commandes parsé au chatbot (autre agent)
 */
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

