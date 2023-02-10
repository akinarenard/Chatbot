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

# Exemple d'utilisation
Exemple de requête : "je cherche une robe rose de taille S et une  chemise bleue".
- Si aucun mot de la requête n'est dans la base de données des stocks, un message s'affiche (ou message vide): "Erreur : nous ne comprenons pas votre demande ou nous ne possédons pas ce que vous recherchez".

- Si la base de données contient les donées 'robe', 'rose', 'bleu', 'chemise', et 'S', l'agent CommandParser renvoit un json data : 
{'command':[
    {'product':'robe', 'color':['rose'], 'size':['S']},
    {'product':'chemise', 'color':['bleu'], 'size':['All']}],
'request':'je cherche une robe rose de taille S et une  chemise bleue'
}

L'agent Chatbot reçoit ce data vérifie que le produit décrit dans l'attribut 'command' existe dans la base de données. En effet, l'agent CommandParser n'a accès qu'à une base de données réduite contenant tous les mots de la "vraie" base de données. Cette base de données réduite est envoyée par l'agent Chatbot, qui lui reçoit la base de données du site web (autre projet ou base de test par défaut) qui est complète. Si les produits de la commande ne sont pas dans la base de données, le chatbot du Whiteboard affichera la réponse "Ce produit n'est plus disponible.", sinon, le chatbot affiche "Votre demande a pu être traitée". Cela est possible grâce à l'agent TextGenerator. Celui-ci reçoit un JSON du Chatbot, contenant entre autre la requête initiale (en langage naturel) de l'utilisateur qui sera affiché dans le whiteboard. Si le produit de 'command' n'est pas dans la base de données, le JSON aura un attribut 'error' (voir tests.igsscript). C'est donc le TextGenerator qui fait les impulsions pour écrire les messages sur le Whiteboard.

Après un message "Ce produit n'est plus disponible", l'utilisateur peut rentrer une nouvelle demande pour changer une caractéristique du produit ou les retirer afin d'avoir de nouveaux résultats.

# Tests de vérification et Validation
fichier test.igsscript
plusieurs tests ont été écrits, ils ne fonctionnent peut être pas pour les assertions d'égalité de string.


https://ingescape.com/n7/

