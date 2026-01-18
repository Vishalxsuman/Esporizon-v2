# Esporizon - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- MongoDB installed and running locally
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd "ESPO V 2"
```

### 2. Setup Backend

```bash
# Navigate to backend
cd backend-standalone

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start MongoDB (if not running)
# Windows: mongod
# Mac/Linux: sudo service mongod start

# Start backend server
npm run dev
```

The backend should now be running on `http://localhost:5000`

### 3. Setup Frontend

```bash
# Open a new terminal in the project root
cd "ESPO V 2"

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Make sure .env has:
VITE_API_URL=http://localhost:5000
# ... other Firebase variables

# Start frontend dev server
npm run dev
```

The frontend should now be running on `http://localhost:5173`

## 🎮 Testing the Application

### 1. Create an Account
1. Navigate to `http://localhost:5173`
2. Click "Get Started" or "Sign Up"
3. Create an account with email/password or Google

### 2. Add Funds to Wallet
1. After logging in, click "Deposit" in the wallet section
2. Enter amount: 500
3. Click "Add Funds"
4. Your balance should update immediately

### 3. Join a Tournament
1. Navigate to any game arena (Free Fire, BGMI, etc.)
2. Find an "Upcoming" tournament
3. Click "Register Now"
4. Fill in team/player details
5. Confirm payment (if entry fee required)
6. You should be registered!

### 4. Create a Tournament (Host)
1. Click "Create Tournament" on any arena page
2. If not a host, you'll be redirected to host benefits
3. Follow the flow to become a host
4. Create your tournament with all details
5. Manage your tournaments from the dashboard

## 📁 Project Structure

```
ESPO V 2/
├── backend-standalone/     # Node.js/Express/MongoDB backend
│   ├── src/
│   │   ├── controllers/    # API logic
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Auth, validation
│   │   └── config/         # DB config
│   └── index.js
│
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── services/          # API service layer
│   ├── contexts/          # React contexts (Auth, Wallet)
│   ├── types/             # TypeScript definitions
│   └── config/            # Firebase config
│
└── package.json
```

## 🔧 Environment Variables

### Backend (.env in backend-standalone/)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/esporizon_prod
NODE_ENV=development
```

### Frontend (.env in root/)
```
VITE_API_URL=http://localhost:5000

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
...
```

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running: `mongod --version`
- Check port 5000 is not in use
- Verify .env file exists in backend-standalone/

### Frontend auth not working
- Check Firebase configuration in .env
- Ensure all VITE_FIREBASE_* variables are set
- Clear browser cache and localStorage

### Wallet deposit not working
- Check backend is running on port 5000
- Open browser console to see API errors
- Verify VITE_API_URL in frontend .env

## 📝 API Endpoints

### Tournaments
- `GET /api/tournaments` - List all tournaments
- `GET /api/tournaments/:id` - Get tournament details
- `POST /api/tournaments` - Create tournament (Host only)
- `POST /api/tournaments/:id/register` - Join tournament

### Wallet
- `GET /api/wallet` - Get wallet balance
- `POST /api/wallet/deposit` - Deposit funds
- `POST /api/wallet/deduct` - Deduct funds

### Host
- `GET /api/host/:id` - Get host profile
- `GET /api/host/:id/tournaments` - Get host's tournaments
- `POST /api/host/:id/rate` - Rate a host

## 🎯 Next Steps

1. Deploy backend to a cloud service (AWS, Heroku, Railway)
2. Deploy frontend to Vercel/Netlify
3. Setup production MongoDB (MongoDB Atlas)
4. Configure production environment variables
5. Add payment gateway integration
6. Implement email notifications

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is private and proprietary.

---

**Built with ❤️ by the Esporizon Team**
