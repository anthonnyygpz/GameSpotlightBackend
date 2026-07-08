# 🎮 GameSpotlight Backend

REST API built with **Node.js + Express + TypeScript** and **MySQL** that powers the GameSpotlight app — providing game info, trailers, news, favorites, genres, platforms, upcoming releases, and user notifications.

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://www.mysql.com/) v8 or higher
- npm v9 or higher
- [TypeScript](https://www.typescriptlang.org/) v6 or higher (installed via devDependencies)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/anthonnyygpz/GameSpotlightBackend.git
cd GameSpotlightBackend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root of the project:

```bash
cp .env.example .env
```

Then edit `.env` with your values:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=game_spotlight

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```

### 4. Set up the database

Create the database in MySQL and run the seed file:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS game_spotlight;"
mysql -u root -p game_spotlight < seed_data.sql
```

### 5. Start the server

```bash
# Development — auto-restart on changes (ts-node-dev)
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

The server will start on `http://localhost:3000` by default.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|:----:|
| `GET` | `/api/health` | Health check | ❌ |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and get JWT token | ❌ |
| `POST` | `/api/auth/logout` | Logout current session | ✅ |
| `GET` | `/api/auth/me` | Get own profile | ✅ |
| `POST` | `/api/auth/forget-password` | Request password reset | ✅ |
| `PUT` | `/api/auth/update-user` | Update authenticated user | ✅ |
| `GET` | `/api/games/home` | Get home games list | ✅ |
| `GET` | `/api/games/:id` | Get game details by ID | ✅ |
| `GET` | `/api/trailers` | Get trailers | ✅ |
| `GET` | `/api/categories` | Get categories | ✅ |
| `GET` | `/api/trailer-categories` | Get trailer categories | ✅ |
| `GET` | `/api/upcoming-releases` | Get upcoming game releases | ✅ |
| `GET` | `/api/favorites` | Get user favorites | ✅ |
| `POST` | `/api/favorites` | Add a game to favorites | ✅ |
| `DELETE` | `/api/favorites/:gameId` | Remove a game from favorites | ✅ |
| `GET` | `/api/news` | Get latest news | ❌ |
| `GET` | `/api/notifications` | Get user notifications | ✅ |
| `GET` | `/api/users` | Get all users | ✅ |
| `GET` | `/api/users/:id` | Get user by ID | ✅ |
| `PUT` | `/api/users/:id` | Update a user | ✅ |
| `DELETE` | `/api/users/:id` | Delete a user | ✅ |
| `GET` | `/api/genres` | Get all genres | ❌ |
| `GET` | `/api/genres/:id/games` | Get games by genre | ❌ |
| `GET` | `/api/platforms` | Get all platforms | ❌ |
| `GET` | `/api/platforms/:id/games` | Get games by platform | ❌ |

> **Auth required**: include the JWT token in the `Authorization` header:
> ```
> Authorization: Bearer <your_token>
> ```

---

## 🗂️ Project Structure

```
src/
├── config/
│   └── db.ts                      # MySQL connection pool
├── controllers/
│   ├── authController.ts
│   ├── categoriesController.ts
│   ├── favoritesController.ts
│   ├── gamesController.ts
│   ├── genresController.ts
│   ├── newsController.ts
│   ├── notificationsController.ts
│   ├── platformsController.ts
│   ├── trailersController.ts
│   ├── upcomingController.ts
│   └── userController.ts
├── middleware/
│   ├── authMiddleware.ts          # JWT verification
│   ├── authValidators.ts          # Register & login validators
│   ├── errorHandler.ts            # Global error handler
│   └── validate.ts                # express-validator runner
├── routes/
│   ├── authRoutes.ts
│   ├── categoriesRoutes.ts
│   ├── favoritesRoutes.ts
│   ├── gamesRoutes.ts
│   ├── genresRoutes.ts
│   ├── newsRoutes.ts
│   ├── notificationsRoutes.ts
│   ├── platformsRoutes.ts
│   ├── trailerCategoriesRoutes.ts
│   ├── trailersRoutes.ts
│   ├── upcomingRoutes.ts
│   └── usersRoutes.ts
├── services/
│   ├── authService.ts
│   ├── genresService.ts
│   └── platformsService.ts
├── types/
│   ├── auth.type.ts
│   ├── genre.type.ts
│   ├── index.ts
│   ├── platform.type.ts
│   ├── reponse.type.ts
│   └── user.type.ts
├── utils/
│   └── apiError.ts                # Custom ApiError class
└── server.ts                      # Entry point
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js v18+ |
| **Language** | TypeScript v6 |
| **Framework** | Express v5 |
| **Database** | MySQL 8 via `mysql2` |
| **Auth** | JSON Web Tokens (`jsonwebtoken`) + `bcrypt` |
| **Validation** | `express-validator` |
| **Logging** | `morgan` |
| **Env vars** | `dotenv` |
| **Dev server** | `ts-node-dev` |

---

## 📄 License

ISC
