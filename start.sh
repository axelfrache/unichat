#!/bin/bash

# Script de démarrage pour UniChat
# Lance PocketBase (backend) et Angular (frontend) simultanément

echo "Démarrage d'UniChat..."
echo "----------------------------------------"

# Vérifier que nous sommes dans le bon dossier
if [ ! -f "package.json" ] || [ ! -d "pocketbase" ]; then
    echo "Erreur: Ce script doit être exécuté depuis la racine du projet UniChat"
    exit 1
fi

# Vérifier que PocketBase existe
if [ ! -f "pocketbase/pocketbase" ]; then
    echo "Erreur: Exécutable PocketBase non trouvé dans pocketbase/pocketbase"
    exit 1
fi

# Vérifier que les dépendances npm sont installées
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances npm..."
    npm install
    if [ $? -ne 0 ]; then
        echo "Erreur lors de l'installation des dépendances"
        exit 1
    fi
fi

echo "Démarrage de PocketBase (backend)..."
cd pocketbase
./pocketbase serve &
POCKETBASE_PID=$!
cd ..

# Attendre que PocketBase soit prêt
echo "Attente du démarrage de PocketBase..."
sleep 3

# Vérifier que PocketBase répond
while ! curl -f http://localhost:8090/api/health >/dev/null 2>&1; do
    echo "PocketBase démarre..."
    sleep 2
done

echo "PocketBase démarré sur http://localhost:8090"

echo "Démarrage d'Angular (frontend)..."
npm start &
ANGULAR_PID=$!

# Attendre un peu pour Angular
sleep 5

echo ""
echo "UniChat est maintenant accessible !"
echo "----------------------------------------"
echo "Frontend (Angular): http://localhost:4200"
echo "Backend (PocketBase): http://localhost:8090"
echo "Admin PocketBase: http://localhost:8090/_/"
echo ""
echo "Identifiants admin par défaut (si configurés):"
echo "   Email: admin@unichat.local"
echo "   Mot de passe: admin123456"
echo ""
echo "Pour arrêter les serveurs, appuyez sur Ctrl+C"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "Arrêt des serveurs..."
    kill $POCKETBASE_PID 2>/dev/null
    kill $ANGULAR_PID 2>/dev/null
    echo "Serveurs arrêtés"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT

# Attendre indéfiniment
while true; do
    sleep 1
done
