# Esporizon - Professional Esports Tournament Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)](https://www.mongodb.com/)

A production-ready esports tournament platform supporting Free Fire, BGMI, Valorant, and Minecraft with real-money prize distribution, automated wallet management, and comprehensive host tools.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB 6.0+
- Firebase Project (for authentication)

### installation

```bash
# Clone repository
git clone <repository-url>
cd esporizon

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend-standalone
npm install
cd ..
```

### Environment Configuration

1. **Frontend (.env.development)**
```env
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

2. **Backend (backend-standalone/.env)**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/esporizon
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
NODE_ENV=development
```

### Running the Application

```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
cd backend-standalone
npm start

# Terminal 3: Start Frontend
npm run dev
```

Access the application at `http://localhost:3000`

## 📚 Features

### For Players
- ✅ **Multi-Game Support**: Free Fire, BGMI, Valorant, Minecraft
- ✅ **Wallet System**: Deposit funds, pay entry fees, receive prizes automatically
- ✅ **Tournament Discovery**: Browse upcoming/ongoing/completed tournaments
- ✅ **Team Registration**: Solo, Duo, Squad modes
- ✅ **Real-time Chat**: Tournament-specific chat rooms
- ✅ **Profile Management**: Game-wise stats and rank tracking
- ✅ **Report System**: Submit disputes against tournaments/hosts

### For Hosts
- ✅ **Tournament Creation**: Custom prize structures, entry fees, game rooms
- ✅ **Prize Distribution**: Winner-based (98% split) or Kill-based rewards
- ✅ **Auto-Finance**: 2% service fee auto-credited to host wallet
- ✅ **Room Management**: Game-specific credentials (Room ID, Password, Lobby ID)
- ✅ **Result Publishing**: AI-assisted result extraction and validation
- ✅ **Dispute Resolution**: View and resolve player reports
- ✅ **Earnings Dashboard**: Track service fees and tournament performance

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 4
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: Context API
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js 18
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: Firebase Admin SDK
- **Validation**: Express Validator

### Authentication
- **System**: Firebase Authentication
- **Methods**: Email/Password, Google OAuth

## 📁 Project Structure

```
esporizon/
├── src/
│   ├── components/        # Reusable UI components
│   ├── pages/             # Route components
│   ├── services/          # API service layers
│   ├── contexts/          # React context providers
│   ├── types/             # TypeScript type definitions
│   └── config/            # Configuration files
├── backend-standalone/
│   ├── src/
│   │   ├── models/        #  MongoDB schemas
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Authentication, validation
│   │   └── utils/         # Helper functions
│   └── server.js          # Express server entry
└── public/                # Static assets
```

## 🔐 Security Features

- **Firebase Authentication**: Secure JWT-based auth
- **Route Protection**: Middleware-based access control
- **Host Verification**: Subscription status validation
- **Wallet Security**: Atomic transactions with MongoDB sessions
- **Input Validation**: Server-side validation for all endpoints
- **CORS Configuration**: Environment-specific origins

## 💰 Prize Distribution System

### 98/2 Split Model
- **98%** goes to players (configurable distribution)
- **2%** platform service fee (auto-credited to host)

### Distribution Types
1. **Winner-Based**: Fixed percentages to top 3 (e.g., 60%, 25%, 13%)
2. **Kill-Based**: Dynamic payout per kill (e.g., ₹3/kill)

### Validation
- Backend enforces 98% player distribution
- Frontend UI shows real-time validation
- Results immutable after publishing

## 🎮 Game-Specific Features

### Free Fire / BGMI
- Room ID + Password
- Match time scheduling
- Server region selection

### Valorant
- Custom Lobby ID
- Match Code
- Team slot configuration

### Minecraft
- Server Name
- World Name
- Game Mode specification

## 🗄️ Database Models

### Core Models
- **User**: Player profiles, authentication
- **Host**: Host accounts, subscription status
- **Tournament**: Event details, configuration, participants
- **Wallet**: Balance, transaction history, stats
- **Report**: Dispute system, message threads
- **PlayerProfile**: Game stats, rankings, match history

## 🔄 API Endpoints

See [Backend README](./backend-standalone/README.md) for complete API documentation.

### Key Endpoints
- `POST /api/tournaments` - Create tournament
- `POST /api/tournaments/:id/register` - Register for tournament
- `POST /api/results/publish` - Publish results (auto-credits wallets)
- `GET /api/wallet` - Get wallet balance
- `POST /api/reports` - Create dispute report
- `GET /api/host/reports` - View player reports

## 🧪 Testing

```bash
# Frontend tests
npm run test

# Backend tests
cd backend-standalone
npm test

# E2E tests
npm run test:e2e
```

See [TESTING.md](./TESTING.md) for detailed testing guide.

## 📦 Build & Deployment

```bash
# Build frontend
npm run build

# Preview production build
npm run preview

# Build backend
cd backend-standalone
npm run build
```

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Frontend will automatically try ports 3000-3010
# Backend: Change PORT in .env
```

**MongoDB Connection Failed**
```bash
# Ensure MongoDB is running
mongod --dbpath=/path/to/data

# Check connection string in backend/.env
```

**Firebase Auth Errors**
- Verify Firebase credentials in `.env`
- Check Firebase console project settings
- Ensure service account has correct permissions

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📧 Support

For issues and questions:
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)
- Email: support@esporizon.com

## 🎯 Roadmap

- [x] Multi-game tournament support
- [x] Automated wallet system
- [x] Prize distribution (98/2 split)
- [x] Report/dispute system
- [ ] AI result extraction
- [ ] Mobile apps (iOS/Android)
- [ ] Live streaming integration
- [ ] Sponsor management
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for the esports community**