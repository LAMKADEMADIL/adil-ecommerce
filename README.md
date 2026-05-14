# Adil E-commerce 🛍️

Une plateforme e-commerce moderne (SPA) dédiée à la vente de portefeuilles et sacs faits main, développée avec React.js et Firebase.

## Fonctionnalités (Core Features)
- **Catalogue interactif** : Affichage des produits sous forme de grille attrayante.
- **Détails du produit** : Informations complètes et images supplémentaires.
- **Commande Rapide (Paiement à la livraison)** : Formulaire simplifié sans panier complexe.
- **Commande WhatsApp** : Bouton direct avec message pré-rempli.
- **Dashboard Admin** : Interface sécurisée pour visualiser les commandes en temps réel.

## Technologies (Tech Stack)
- **Frontend** : React.js (Vite), TypeScript, Vanilla CSS
- **Backend / DB** : Firebase (Firestore)
- **Design** : Entièrement Responsive (Desktop, Mobile, Tablette)

## Roadmap de Développement (Plan)

### 📍 Étape 1 : Design et Interfaces (UI/UX) - [Terminé]
- [x] Structure globale (Sidebar & Header)
- [x] Page **Produits** (Tableau & Modal)
- [x] Page **Commandes** (Tableau & Filtres)
- [x] Page **Clients** (Liste des clients)
- [x] Page **Paramètres** (Configuration)

### 📍 Étape 2 : Sécurité et Authentification (Auth) - [Terminé]
- [x] Page de connexion Admin (Login)
- [ ] Protection des routes Admin (À faire avec Firebase)

### 📍 Étape 3 : Base de données (Firebase) - [En cours]
- [ ] Remplacer les données fictives par des données réelles (Firestore)
- [ ] Upload d'images réelles (Firebase Storage)

### 📍 Étape 4 : Intégration Complète
- [ ] Liaison entre le Storefront et le Dashboard

## Guide de Connexion Firebase

1. **Créer un projet** sur la console Firebase.
2. **Ajouter une application Web** `</>` pour obtenir les clés de configuration.
3. **Installer Firebase SDK** via terminal : `npm install firebase`.
4. **Créer un fichier** `src/firebase.ts` et y coller la configuration.
5. **Initialiser les services** (Firestore et Storage).
