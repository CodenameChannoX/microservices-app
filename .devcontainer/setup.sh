#!/bin/bash

echo "🎉 Installation de tout ce qu'il faut..."

# Mise à jour
apt-get update

# Installation des outils de base
apt-get install -y \
  git \
  curl \
  wget \
  nano \
  docker-compose

# Vérification
echo "✅ Installation terminée :"
echo "Git version: $(git --version)"
echo "Docker Compose version: $(docker-compose --version)"

# Création de la structure minimale
mkdir -p frontend api-gateway

echo "🚀 Tout est prêt !"
