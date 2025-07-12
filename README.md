# UniChat

Une application de forum universitaire moderne construite avec Angular 20, Tailwind CSS, DaisyUI et PocketBase.

![Angular](https://img.shields.io/badge/Angular-20-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-cyan?style=flat-square&logo=tailwindcss)
![DaisyUI](https://img.shields.io/badge/DaisyUI-5.0-green?style=flat-square)

## 🚀 Installation rapide

### Option 1 : Développement local (recommandé)
```bash
git clone https://github.com/axelfrache/unichat.git
cd unichat
npm install
./start.sh
```

### Option 2 : Docker
```bash
git clone https://github.com/axelfrache/unichat.git
cd unichat
docker compose up -d
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
- **Node.js** 18+ et npm
- **Angular CLI** 20+
- **Git**

```bash
# Vérifier les versions
node --version    # >= 18.0.0
npm --version     # >= 9.0.0
ng --version      # >= 20.0.0

# Installer Angular CLI si nécessaire
npm install -g @angular/cli
```

### Scripts disponibles
```bash
./start.sh                  # Démarre PocketBase + Angular (Linux/macOS)
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
├── docker/                       # Configuration Docker
│   ├── Dockerfile.frontend       # Image frontend
│   ├── Dockerfile.pocketbase     # Image PocketBase
│   └── nginx.conf                # Configuration nginx
├── start.sh
├── docker-compose.yml            # Configuration Docker
└── package.json                  # Dépendances npm
```

## Docker

### Démarrage rapide avec Docker

```bash
# Démarrer les services
docker compose up -d

# Arrêter les services
docker compose down

# Voir les logs
docker compose logs -f
```

### Prérequis Docker
- **Docker** 20+ 
- **Docker Compose** 2+

```bash
# Vérifier les versions
docker --version          # >= 20.0.0
docker compose version    # >= 2.0.0
```

### Commandes Docker utiles
```bash
docker compose up -d        # Démarrer en arrière-plan
docker compose down         # Arrêter les services
docker compose restart     # Redémarrer les services
docker compose logs -f     # Voir les logs en temps réel
docker compose ps          # Voir l'état des conteneurs
```

### Accès aux services
- **Frontend** : [http://localhost:4200](http://localhost:4200)
- **PocketBase** : [http://localhost:8090](http://localhost:8090)
- **Admin PocketBase** : [http://localhost:8090/_/](http://localhost:8090/_/)