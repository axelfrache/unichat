# UniChat

Une application de forum universitaire moderne construite avec Angular 20, Tailwind CSS, DaisyUI et PocketBase.

![Angular](https://img.shields.io/badge/Angular-20-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-cyan?style=flat-square&logo=tailwindcss)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5.0-green?style=flat-square)

## Installation rapide

```bash
git clone https://github.com/axelfrache/unichat.git
cd unichat
npm install
./start.sh
```

L'application sera accessible sur [http://localhost:4200](http://localhost:4200).

**Identifiants admin par défaut :**
- Email: `admin@unichat.local`
- Mot de passe: `admin123456`
- Interface admin: [http://localhost:8090/_/](http://localhost:8090/_/)

## Fonctionnalités

- **Authentification** : Inscription/connexion sécurisées avec gestion des sessions JWT
- **Forum** : Création de posts, système de catégories, commentaires
- **Interface moderne** : Design responsive avec DaisyUI et thème sombre/clair

## Stack technique

- **Frontend** : Angular 20, TypeScript 5.0, Tailwind CSS 4.x, DaisyUI 5.0
- **Backend** : PocketBase (SQLite)

## Développement

### Prérequis
- Node.js 18+ et npm
- Git

### Scripts disponibles
```bash
./start.sh                  # Démarre PocketBase + Angular (Linux/macOS)
start.bat                   # Démarre PocketBase + Angular (Windows)
npm start                   # Angular uniquement
npm run build               # Build de production
npm test                    # Tests
```

### Démarrage manuel
```bash
# Terminal 1
cd pocketbase && ./pocketbase serve

# Terminal 2  
npm start
```

## Configuration

### Base de données
PocketBase est pré-configuré avec toutes les collections nécessaires. Pour repartir avec une base vierge :
```bash
cd pocketbase
rm -rf pb_data/
./pocketbase serve
```

### Variables d'environnement (optionnel)
Créer `src/environments/environment.ts` pour personnaliser l'URL de PocketBase :
```typescript
export const environment = {
  production: false,
  pocketbaseUrl: 'http://127.0.0.1:8090'
};
```

## Structure du projet

```
unichat/
├── src/app/                      # Code Angular
│   ├── auth/                     # Authentification
│   ├── forum/                    # Forum et posts
│   ├── categories/               # Gestion des catégories
│   └── services/                 # Services API
├── pocketbase/                   # Backend inclus
│   ├── pocketbase                # Exécutable
│   └── pb_data/                  # Base de données SQLite
├── start.sh / start.bat          # Scripts de démarrage
└── package.json                  # Dépendances npm
```