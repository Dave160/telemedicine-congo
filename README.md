# TéléMéd Congo 🏥

Plateforme de téléconsultation médicale pour le Congo Brazzaville — mobile-first, Mobile Money, SMS.

## Architecture

```
telemedicine-congo/
├── backend/          # API Node.js + Express + Prisma + PostgreSQL + Socket.io
├── frontend/         # PWA React + Vite + TailwindCSS
└── mobile/           # Application Android React Native + Expo
```

## Stack

| Couche | Technologie |
|--------|------------|
| Backend API | Node.js + Express.js |
| Base de données | PostgreSQL + Prisma ORM |
| Temps réel | Socket.io |
| Auth | JWT (access + refresh tokens) |
| SMS / OTP | Africa's Talking (simulation locale en dev) |
| Paiements | MTN Mobile Money + Airtel Money (mock en dev) |
| PDF | PDFKit |
| Frontend Web | React 18 + Vite + TailwindCSS (PWA) |
| Mobile | React Native + Expo (Android prioritaire) |

## Démarrage rapide

### 1. Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm 9+

### 2. Installation

```bash
# Cloner le dépôt
git clone <repo>

# Installer les dépendances
npm run install:all
```

### 3. Configuration Backend

```bash
cd backend
cp .env.example .env
# Éditer .env : DATABASE_URL, JWT_SECRET, etc.
```

### 4. Base de données

```bash
npm run db:generate    # Générer le client Prisma
npm run db:migrate     # Créer les tables
npm run db:seed        # Données de test
```

### 5. Lancer les serveurs

```bash
# Backend (terminal 1)
npm run backend         # http://localhost:3000

# Frontend Web (terminal 2)
npm run frontend        # http://localhost:5173

# App Mobile (terminal 3)
npm run mobile          # Expo Go sur Android
```

## Comptes de test (après seed)

| Rôle | Téléphone | Mot de passe |
|------|-----------|-------------|
| Admin | +242060000000 | Admin1234! |
| Médecin | +242061111111 | Doctor1234! |
| Patient | +242070000001 | Patient1234! |

> En mode développement, le code OTP est affiché dans la réponse API et les logs serveur.

## Fonctionnalités

### Patient
- Inscription/connexion via téléphone + OTP
- Recherche de médecins par spécialité
- Consultation immédiate ou sur rendez-vous
- Paiement Mobile Money (MTN/Airtel)
- Chat temps réel avec le médecin
- Réception des ordonnances (PDF, SMS, WhatsApp)
- Historique des consultations
- Articles santé

### Médecin
- Profil détaillé (spécialité, tarif, bio)
- Gestion des disponibilités
- Mode "disponible maintenant"
- Confirmation/refus des rendez-vous
- Chat avec les patients
- Rédaction et envoi d'ordonnances PDF
- Abonnement mensuel 20 000 FCFA

### Admin
- Validation des comptes médecins
- Tableau de bord statistiques
- Gestion des paiements
- Publication d'articles santé

## API

Documentation des endpoints : `GET /health` pour vérifier que l'API fonctionne.

Structure : `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/doctors`, etc.

## Déploiement Android (Production)

```bash
cd mobile
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Variables d'environnement

Voir `backend/.env.example` et `frontend/.env.example` pour la liste complète.
