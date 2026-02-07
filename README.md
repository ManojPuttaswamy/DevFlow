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

2. **Backend Setup**
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```

3. **Frontend Setup** (new terminal)
```bash
cd frontend
npm install
npm run dev
```

4. **Access**
- Frontend: http://localhost
- Backend: http://localhost/api/health

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
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
- **Redis** - Caching
- **JWT** - Authentication

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
npm run test     # Unit testing
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
