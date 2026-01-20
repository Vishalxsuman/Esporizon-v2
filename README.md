# Esporizon 🎮

Esporizon is a premium, production-ready esports tournament platform designed for seamless tournament hosting, joining, and social interaction.

## 🚀 Key Features

- **Automated Tournaments**: Create and join tournaments for BMGI, Free Fire, Valorant, and Minecraft.
- **Combat Wallet**: Secure, atomic balance management with transaction history (Mock payments enabled).
- **Pro Feed**: Social hub for global announcements, LFG requests, and community events.
- **War Room integration**: Contextual chat and management for every tournament.
- **Host Dashboard**: Professional tools for host verification, tournament management, and result verification.

## 🛠 Tech Stack

- **Frontend**: Vite + React + TypeScript + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express.js
- **Database**: MongoDB (Atlas recommended for production)
- **Authentication**: Firebase Auth
- **Icons & UI**: Lucide React + Custom Design System

## 💻 Local Development

### 1. Clone the Repository
```bash
git clone <repository-url>
cd esporizon
```

### 2. Backend Setup
```bash
cd backend
npm install
# Configure .env based on .env.example
npm start
```

### 3. Frontend Setup
```bash
# From root
npm install
# Configure .env based on .env.example
npm run dev
```

## ☁️ Deployment Guide (AWS)

### Backend (EC2 / ECS)
1. **Node Version**: 18+
2. **Process Manager**: Use PM2 to keep the server running.
3. **Nginx**: Configure as a reverse proxy for SSL and port forwarding.
4. **Environment**: Ensure all variables from `.env.example` are set in the AWS Environment.

### Frontend (S3 + CloudFront)
1. **Build**: `npm run build`
2. **Hosting**: Upload `dist/` folder to S3.
3. **Distribution**: Use CloudFront for HTTPS and performance.

## 🔒 Production Notes

- **Wallet**: Currently uses mock-payment logic for simulation. High-priority for Stripe/Razorpay integration.
- **Atomic Operations**: All financial and join operations use MongoDB atomic operators to ensure data integrity without replica-set overhead.
- **Security**: CORS is restricted to production domains. Firebase Private Keys must be loaded via Environment Variables.

---

*Esporizon - Squad Up. Dominate.*