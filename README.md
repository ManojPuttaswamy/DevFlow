# DevFlow - Developer Portfolio & Code Review Platform

A modern platform where developers showcase projects, receive peer code reviews, and discover career opportunities.

## Quick Start

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- Git

### Installation

1. **Clone and setup**
```bash
git clone https://github.com/ManojPuttaswamy/DevFlow.git
cd devflow
```

2. **Start Database**
```bash
docker-compose up -d
```

3. **Backend Setup**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

4. **Frontend Setup** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

5. **Access**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/health

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching & caching
- **Lucide React** - Icons

### Backend  
- **Node.js + Express** - API server
- **TypeScript** - Type safety
- **PostgreSQL** - Primary database
- **Prisma** - Database ORM
- **Redis** - Caching (upcoming)
- **JWT** - Authentication (upcoming)

### DevOps
- **Docker** - Local development
- **GitHub Actions** - CI/CD
- **ESLint + Prettier** - Code quality

## Database Schema

```prisma
model User {
  id       String @id @default(cuid())
  email    String @unique
  username String @unique
  // ... profile fields
  projects Project[]
  reviews  Review[]
}

model Project {
  id           String @id @default(cuid())
  title        String
  description  String?
  githubUrl    String?
  technologies String[]
  author       User @relation(fields: [authorId], references: [id])
  reviews      Review[]
}

model Review {
  id        String @id @default(cuid())
  rating    Int
  comment   String?
  project   Project @relation(fields: [projectId], references: [id])
  reviewer  User @relation(fields: [reviewerId], references: [id])
}
```

## Development Commands

### Backend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Code linting
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # Code linting
```

### Database
```bash
npx prisma studio    # Database GUI
npx prisma generate  # Generate client
npx prisma db push   # Sync schema
```

## 15-Day Roadmap

### Phase 1: Foundation (Days 1-5)
- [x] Project setup & database
- [ ] Authentication system
- [ ] User profiles  
- [ ] Project management
- [ ] Basic review system

### Phase 2: Features (Days 6-10)
- [ ] Real-time notifications
- [ ] File uploads
- [ ] UI polish
- [ ] Testing

### Phase 3: Production (Days 11-15)
- [ ] Job matching
- [ ] Performance optimization
- [ ] Deployment
- [ ] Monitoring

## 🌍 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://devflow_user:devflow_password@localhost:5432/devflow_db
JWT_SECRET=your-secret-here
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## ✅ Day 1 Completed
- [x] Project structure created
- [x] Frontend: Next.js 14 + React 18 + TypeScript  
- [x] Backend: Express + TypeScript + Prisma
- [x] Database: PostgreSQL with Docker
- [x] Health check API working
- [x] Beautiful landing page
- [x] Development environment ready

## ✅ Day 2 Completed
- [x] **Backend Authentication**
  - [x] JWT token system (access + refresh tokens)
  - [x] Password hashing with bcrypt
  - [x] Input validation middleware
  - [x] Protected route middleware
  - [x] User registration & login APIs
- [x] **Frontend Authentication**
  - [x] React Context for global auth state
  - [x] Login & Registration forms with validation
  - [x] Protected route component
  - [x] Modal-based authentication UI
  - [x] Persistent sessions with localStorage
- [x] **Security Features**
  - [x] Real-time password strength validation
  - [x] Secure token storage strategy
  - [x] Comprehensive error handling
  - [x] Rate limiting and CORS protection
- [x] **Documentation**
  - [x] Complete authentication system docs
  - [x] Interview Q&A preparation
  - [x] API endpoint documentation

**Current Features**: Secure user registration, login, logout, protected routes, persistent sessions

Ready for Day 3: User Profiles & Project Management!
