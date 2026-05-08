# SSC CGL Mock Test Platform MVP

A production-quality MVP for an SSC CGL Mock Test platform built with Next.js, Express, and PostgreSQL.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod

## Getting Started

### Prerequisites
- Node.js (v18+)
- PostgreSQL instance

### 1. Backend Setup
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Copy `.env` and update `DATABASE_URL` with your PostgreSQL credentials.
4. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```
5. Seed the database with sample questions:
   ```bash
   npm run seed
   ```
6. Start the server:
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:5000`.

### 2. Frontend Setup
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Features
- **Test Dashboard**: View available SSC CGL mock tests.
- **Timed Test Environment**: 
  - One question at a time navigation.
  - Interactive option selection.
  - Real-time countdown timer.
  - Auto-submit on time expiration.
- **Anti-Cheat System**: Detection and warning modal when switching tabs.
- **Instant Evaluation**: Detailed score breakdown, accuracy %, and question review.
- **Premium UI**: Modern glassmorphism design with smooth transitions and responsive layout.

## Project Structure
- `backend/src`: Layered architecture (Controllers, Services, Repositories).
- `frontend/src`: Next.js App router with reusable components and services.
