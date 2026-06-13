#!/bin/bash
# Script de build PNC Alerte pour Android
# Usage: ./build-android.sh

set -e

echo "🔧 PNC Alerte - Build Android"
echo "=============================="

# 1. Supprimer temporairement les routes API pour l'export statique
echo "📦 Préparation du build statique..."
if [ -d "src/app/api" ]; then
  echo "  ⏳ Sauvegarde des routes API..."
  cp -r src/app/api src/app_api_backup
  rm -rf src/app/api
fi

# 2. Build statique Next.js
echo "🏗️  Build Next.js (export statique)..."
CAPACITOR_BUILD=true npx next build

# 3. Sync avec Capacitor
echo "📱 Synchronisation avec Capacitor..."
npx cap sync android

# 4. Restaurer les routes API
echo "♻️  Restauration des routes API..."
if [ -d "src/app_api_backup" ]; then
  cp -r src/app_api_backup src/app/api
  rm -rf src/app_api_backup
fi

echo "✅ Build terminé !"
echo ""
echo "Prochaines étapes :"
echo "  1. Ouvrir Android Studio : npx cap open android"
echo "  2. Build APK : cd android && ./gradlew assembleDebug"
echo "  3. L'APK sera dans : android/app/build/outputs/apk/debug/"
