# 💕 Only For Us

A premium relationship management platform — organize your entire life together in one beautiful, private space.

## Tech Stack

### Frontend
- React 19 + Vite
- Tailwind CSS 4
- React Router v7
- Framer Motion
- Zustand (state management)
- React Query (server state)
- React Hook Form + Zod (forms & validation)
- Lucide React (icons)
- Axios (HTTP client)

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcrypt (password hashing)

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (for future phases)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend runs at `http://localhost:5000`

## Project Structure

```
Only-For-Us/
├── frontend/          # React + Vite application
│   └── src/
│       ├── assets/        # Static assets
│       ├── components/    # Reusable UI & layout components
│       ├── config/        # App constants & configuration
│       ├── context/       # React context providers
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utility functions
│       ├── pages/         # Page components
│       ├── routes/        # Route definitions
│       ├── services/      # API service layer
│       ├── store/         # Zustand stores
│       └── styles/        # Additional stylesheets
├── backend/           # Express.js API server
│   ├── config/        # Database & environment config
│   ├── controllers/   # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── uploads/       # File uploads directory
│   └── utils/         # Utility functions
└── README.md
```

## Phase 1 — Project Foundation

This is the initial project setup with:
- ✅ Complete design system (dark/light/auto themes)
- ✅ Reusable UI component library
- ✅ Responsive layout with sidebar & topbar
- ✅ Landing page with premium design
- ✅ Login & Register pages (UI only)
- ✅ Dashboard shell
- ✅ 404 page
- ✅ Backend Express server scaffold

## License

Private — All rights reserved.
