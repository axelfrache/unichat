# UniChat

Une application de forum universitaire moderne construite avec Angular 20, Tailwind CSS, DaisyUI et PocketBase.

![Angular](https://img.shields.io/badge/Angular-20-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-cyan?style=flat-square&logo=tailwindcss)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5.0-green?style=flat-square)

## 🚀 Installation rapide

UniChat nécessite un backend PocketBase pour fonctionner. Vous avez deux options :

### Option 1 : Utiliser une instance PocketBase existante
Si vous avez déjà PocketBase installé :
1. Importez le schéma : **`pb_schema.json`**
2. Lancez PocketBase sur le port 8090
3. Installez et démarrez le frontend (voir ci-dessous)

### Option 2 : Installation complète
Consultez les sections [Installation](#installation) et [Configuration](#configuration) pour une installation pas à pas.

**Fichiers de configuration disponibles :**
- `pb_schema.json` - Schéma complet de la base de données PocketBase
- `test_data.json` - Données de test optionnelles
- `GUIDE_UTILISATION.md` - Guide d'utilisation détaillé

## Table des matières

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Structure du projet](#structure-du-projet)

## Fonctionnalités

### Authentification
- Inscription et connexion sécurisées
- Gestion des sessions avec tokens JWT
- Profils utilisateurs avec avatars basés sur l'email
- Protection des routes avec AuthGuard

### Forum
- Création et gestion des posts
- Système de catégories
- Commentaires sur les posts
- Navigation intuitive
- Design responsive mobile-first

### Interface utilisateur
- Design system moderne avec DaisyUI
- Thème sombre/clair
- Accessibilité optimisée
- Interface mobile-first
- Performance optimisée

## Stack technique

### Frontend
- **Angular 20** - Framework principal
- **TypeScript 5.0** - Langage de développement
- **Tailwind CSS 4.x** - Framework CSS utilitaire
- **DaisyUI 5.0** - Composants UI prêts à l'emploi
- **Angular Router** - Navigation
- **Angular Forms** - Gestion des formulaires

### Backend
- **PocketBase** - Backend-as-a-Service
- **SQLite** - Base de données (via PocketBase)

## Installation

### Prérequis

- **Node.js** 18+ et npm
- **Angular CLI** 20+
- **Git**

```bash
# Vérifier les versions
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
ng --version    # >= 20.0.0
```

### Installation du projet

1. **Cloner le repository**
```bash
git clone https://github.com/axelfrache/unichat.git
cd unichat
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur de développement**
```bash
npm start
# ou
ng serve
```

4. **Ouvrir l'application**
Naviguer vers [http://localhost:4200](http://localhost:4200)

## Configuration

### Configuration PocketBase

UniChat utilise PocketBase comme backend. Vous pouvez l'installer et le configurer de deux façons :

#### Option A : Import automatique du schéma (Recommandé)

1. **Télécharger PocketBase**
```bash
# Linux/macOS
wget https://github.com/pocketbase/pocketbase/releases/download/v0.28.4/pocketbase_0.28.4_linux_amd64.zip
unzip pocketbase_0.28.4_linux_amd64.zip

# Windows
# Télécharger depuis : https://github.com/pocketbase/pocketbase/releases
```

2. **Importer le schéma**
```bash
# Démarrer PocketBase
./pocketbase serve

# Dans un autre terminal, importer le schéma
curl -X POST http://127.0.0.1:8090/api/collections/import \
  -F "collections=@pb_schema.json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Ou via l'interface web :
- Accéder à [http://127.0.0.1:8090/_/](http://127.0.0.1:8090/_/)
- Créer un compte admin
- Aller dans **Settings > Import collections**
- Importer le fichier `pb_schema.json`

#### Option B : Configuration manuelle

Si vous préférez configurer manuellement, consultez la section détaillée ci-dessous.

### Configuration Frontend

1. **Variables d'environnement**
Créer un fichier `src/environments/environment.ts` :
```typescript
export const environment = {
  production: false,
  pocketbaseUrl: 'http://127.0.0.1:8090'
};
```

2. **Vérifier la configuration**
```bash
# Tester le build
npm run build

# Lancer les tests (optionnel)
npm test
```

### Configuration manuelle PocketBase (Détaillée)

#### Collection `users`
```json
{
  "name": "users",
  "type": "auth",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "required": true
    },
    {
      "name": "email",
      "type": "email",
      "required": true
    }
  ]
}
```

#### Collection `categories`
```json
{
  "name": "categories",
  "type": "base",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "required": true
    },
    {
      "name": "description",
      "type": "text"
    },
    {
      "name": "color",
      "type": "text"
    }
  ]
}
```

#### Collection `posts`
```json
{
  "name": "posts",
  "type": "base",
  "fields": [
    {
      "name": "title",
      "type": "text",
      "required": true
    },
    {
      "name": "content",
      "type": "text",
      "required": true
    },
    {
      "name": "author",
      "type": "relation",
      "options": {
        "collectionId": "users",
        "cascadeDelete": false
      }
    },
    {
      "name": "category",
      "type": "relation",
      "options": {
        "collectionId": "categories",
        "cascadeDelete": false
      }
    }
  ]
}
```

#### Collection `comments`
```json
{
  "name": "comments",
  "type": "base",
  "fields": [
    {
      "name": "content",
      "type": "text",
      "required": true
    },
    {
      "name": "author",
      "type": "relation",
      "options": {
        "collectionId": "users",
        "cascadeDelete": false
      }
    },
    {
      "name": "post",
      "type": "relation",
      "options": {
        "collectionId": "posts",
        "cascadeDelete": true
      }
    }
  ]
}
```

### Variables d'environnement

Créer un fichier `src/environments/environment.ts` :

```typescript
export const environment = {
  production: false,
  pocketbaseUrl: 'http://127.0.0.1:8090'
};
```

## Utilisation

### Interface utilisateur

1. **Inscription/Connexion**
   - Créer un compte avec email et mot de passe
   - Se connecter avec les identifiants

2. **Navigation**
   - Accéder au forum principal
   - Naviguer par catégories
   - Voir les détails des posts

3. **Création de contenu**
   - Créer de nouveaux posts
   - Ajouter des commentaires
   - Organiser par catégories

## Structure du projet

```
unichat/
├── src/
│   ├── app/
│   │   ├── auth/                  # Module d'authentification
│   │   │   ├── auth.service.ts
│   │   │   └── login.component.ts
│   │   ├── categories/            # Module catégories
│   │   │   └── categories-list.component.ts
│   │   ├── forum/                 # Module forum
│   │   │   ├── forum.component.ts
│   │   │   ├── post-detail/
│   │   │   └── new-post/
│   │   ├── guards/                # Guards de protection
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/          # Intercepteurs HTTP
│   │   │   └── auth.interceptor.ts
│   │   ├── services/              # Services partagés
│   │   │   └── pocketbase-api.service.ts
│   │   ├── app.config.ts          # Configuration de l'app
│   │   ├── app.routes.ts          # Routing
│   │   └── app.html               # Template principal
│   ├── styles.css                 # Styles globaux
│   └── index.html                 # Point d'entrée HTML
├── tailwind.config.js             # Configuration Tailwind
├── angular.json                   # Configuration Angular
└── package.json                   # Dépendances npm
```