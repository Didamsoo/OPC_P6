Mon Vieux Grimoire - Backend
Ce projet permet de créer, consulter et noter des livres. Il est réalisé avec un backend en Node.js utilisant Express pour gérer les routes, MongoDB comme base de données et JWT pour l'authentification. Ce README explique comment cloner le projet et configurer l'environnement pour le tester.

Prérequis
Avant de commencer, assurez-vous d'avoir les éléments suivants installés sur votre machine : Node.js et MongoDB

Étapes d'installation
1. Cloner le projet
Commencez par cloner ce dépôt GitHub :

git clone https://github.com/username/mon-vieux-grimoire.git
Accédez ensuite au répertoire du projet : cd mon-vieux-grimoire

2. Installer les dépendances
Installez toutes les dépendances nécessaires en utilisant npm :
npm install
3. Configurer les variables d'environnement
Créez un fichier .env à la racine du projet et configurez-le comme suit :


4. Lancer le serveur en exécutant :

node server.js
Le serveur backend sera accessible sur le port 4000.


5. Tester les fonctionnalités avec des comptes de test :
Deux comptes de test sont déjà disponibles pour vérifier les fonctionnalités d'authentification et de notation de livres :

test@test.com, mot de passe : test
test2@test.com, mot de passe : test
Utilisez ces informations pour vous connecter via les routes d'authentification et tester les différentes fonctionnalités.



