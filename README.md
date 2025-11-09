# FitTrack API

Fitness tracking API for managing workouts, exercises, workout plans, and progress tracking.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase project with Firestore and Authentication enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/fittrack-api.git
cd fittrack-api
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (or create a new one)
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the downloaded JSON file as `config/serviceAccount.json`

4. Configure environment variables:
```bash
cp .env.example .env
```

The default `.env` file should work if you placed your service account at `config/serviceAccount.json`. If you placed it elsewhere, update the path in `.env`.

5. Run the development server:
```bash
npm run dev
```

The API will be available at:
- API: http://localhost:3000
- Health Check: http://localhost:3000/health
- API Documentation: http://localhost:3000/api-docs

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code for linting errors
- `npm run lint:fix` - Fix linting errors automatically

## Project Structure
```
fittrack-api/
├── config/
│   ├── serviceAccount.json (gitignored - your Firebase credentials)
│   └── serviceAccount.example.json
├── src/
│   ├── api/v1/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── validations/
│   ├── config/
│   ├── app.ts
│   └── server.ts
├── tests/
├── .env (gitignored)
├── .env.example
└── package.json
```

## Security Note

**NEVER commit the following files:**
- `.env`
- `config/serviceAccount.json`

These files contain sensitive credentials and are automatically ignored by git.