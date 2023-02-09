#!/usr/bin/env -P /usr/bin:/usr/local/bin python3 -B
# coding: utf-8

#
#  Chatbot.py
#  Chatbot version 1.0
#  Created by Ingenuity i/o on 2023/02/09
#
# "no description"
#
import ingescape as igs
import sys
import json 

class Singleton(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super(Singleton, cls).__call__(*args, **kwargs)
        return cls._instances[cls]


DEFAULT_DATASET = [{"product" : "robe", "size" : ["S","M"], "color" : ["rose","noir"]}, {"product" : "chaussure", "size" : ["S"], "color" : ["noir"]}]
def flatten(l):
    return [item for sublist in l for item in sublist]

class Chatbot(metaclass=Singleton):
    def __init__(self):
        # inputs
        self.CommandI = None
        self.dataI = DEFAULT_DATASET

        # outputs
        self._JSONO = None
        self._reducedDataO = None
    # outputs
    @property
    def JSONO(self):
        return self._JSONO

    @JSONO.setter
    def JSONO(self, value):
        self._JSONO = value
        print(value)
        if self._JSONO is not None:
            igs.output_set_string("JSON", self._JSONO)
    @property
    def reducedDataO(self):
        return self._reducedDataO

    @reducedDataO.setter
    def reducedDataO(self, value):
        self._reducedDataO = value
        if self._reducedDataO is not None:
            igs.output_set_string("reducedData", self._reducedDataO)


    """
        fonction permettant de matcher les éléments d'une commande avec les éléments présent dans les données
    """
    def interpretCommand(self, value):
        jsonobject = json.loads(value)
        request = jsonobject["request"]
        commands = jsonobject["command"]
        matchingProducts = []
        for command in commands:
            if command["product"] != None:  
                desiredProduct = command["product"]
                desiredSizes = command["size"]
                desiredColors = command["color"]
                for d in self.dataI:
                    if d["product"] == desiredProduct:
                        availableColors = d["color"]
                        availableSizes = d["size"]
                        matchingColors = availableColors if desiredColors[0] == "All" else list(set(availableColors) & set(desiredColors))
                        matchingSizes = availableSizes if desiredSizes[0] == "All" else list(set(availableSizes) & set(desiredSizes))
                        matchingProducts.append({"product":desiredProduct,"size":matchingSizes,"colors":matchingColors})
        if len(matchingProducts) == 0 :
            self.JSONO = json.dumps({"request":request,"error":"error"})
        self.JSONO = json.dumps({"request":request,"products":matchingProducts})

            
    """
        fonction permettant de reduire les donnée arrivant au serveur pour rendre unique chaque produit taille et coleur,
        permettant au parser(autre agent) de recuperer efficacement les données utiles.
        entrée : donnée, exprimé en tableau d'objet json ayant comme attribut un "product" en string, "size" un tableau de string,"color" un tableau de string
        sortie : donnée reduite, un dictionnaire contenant comme attribut, "products" une liste de string unique,"sizes" une liste de string unique,"colors" une liste de string unique
    """
    def reduceData(self,data):
        products = set([d["product"] for d in data])
        sizes = set(flatten([d["size"] for d in data]))
        colors = set(flatten([d["color"] for d in data]))
        reducedData = {"products":list(products), "sizes":list(sizes), "colors":list(colors)}
        return reducedData
    """
        fonction permettant de mettre les données, les réduire et les envoyer au parseur (autre agent)
    """
    def updateData(self, value):
        reducedData = self.reduceData(value)
        self.reducedDataO = json.dumps(reducedData, indent = 4) 
