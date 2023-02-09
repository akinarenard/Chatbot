# Chatbot
L'application est composée de 3 agents : 
- le CommandParser, qui va interpréter un texte en laguage naturel, 
- le TextGenerator, qui va renvoyer au Whiteboard le message de l'utilisateur avec un message de succès ou d'échec à afficher (selon si la demande de l'utilisateur a pu être traitée ou non), 
- le composant Chatbot, qui va faire la communication entre les 2 premiers agents ainsi que la communication avec le site Web ShoppingExperienceAgent.

Pour l'interaction avec des agents d'autres projets, il faut connecter la sortie JSON (de l'agent Chatbot) à un agent extérieur et donner une data en input (de l'agent Chatbot) qui représente un stock.

La sortie JSON est constituée d'un attribut requête, correspondant au texte écrit par l'utilisateur, et d'un attribut produits, contenant une liste de produits et leurs caractéristiques.

# Lancer le chatbot
- lancer CommandParser/index.html
- python3 Chatbot/src/main.py
- python3 TextGenerator/src/main.py
- spécifier le port 5670 sur l'interface Circle
- spécifier le device : ligne 22 TextGenerator/src/main.py et ligne 21 dans Chatbot/src/main.py

# Tests de vérification et Validation
fichier test.igsscript

https://ingescape.com/n7/

