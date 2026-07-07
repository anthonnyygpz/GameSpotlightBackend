# 🎮 GameSpotlight Backend

REST API built with **Node.js + Express** and **MySQL** that powers the GameSpotlight app — providing game info, news, favorites, upcoming releases, and user notifications.

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MySQL](https://www.mysql.com/) v8 or higher
- npm v9 or higher

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
```

### 4. Set up the database

Create the database in MySQL and run the seed file:

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS game_spotlight;"
mysql -u root -p game_spotlight < seed_data.sql
```

### 5. Start the server

```bash
# Development (auto-restart on changes)
npm run dev

# Production
npm start
```

The server will start on `http://localhost:3000` by default.

---

## 📡 API Endpoints

| Method | Endpoint | Description | Auth required |
|--------|----------|-------------|:---:|
| `GET` | `/api/health` | Health check | ❌ |
| `POST` | `/api/auth/register` | Register a new user | ❌ |
| `POST` | `/api/auth/login` | Login and get JWT token | ❌ |
| `GET` | `/api/games/home` | Get home games list | ✅ |
| `GET` | `/api/games/:id` | Get game details by ID | ✅ |
| `GET` | `/api/upcoming-releases` | Get upcoming game releases | ✅ |
| `GET` | `/api/favorites` | Get user favorites | ✅ |
| `POST` | `/api/favorites` | Add a game to favorites | ✅ |
| `DELETE` | `/api/favorites/:id` | Remove a game from favorites | ✅ |
| `GET` | `/api/news` | Get latest news | ✅ |
| `GET` | `/api/notifications` | Get user notifications | ✅ |

> **Auth required**: include the JWT token in the `Authorization` header:
> ```
> Authorization: Bearer <your_token>
> ```

---

## 🗂️ Project Structure

```
src/
├── config/
│   └── db.js                  # MySQL connection pool
├── controllers/
│   ├── authController.js
│   ├── favoritesController.js
│   ├── gamesController.js
│   ├── newsController.js
│   ├── notificationsController.js
│   └── upcomingController.js
├── middleware/
│   ├── authMiddleware.js       # JWT verification
│   ├── errorHandler.js        # Global error handler
│   └── validate.js            # Request validation
├── routes/
│   ├── authRoutes.js
│   ├── favoritesRoutes.js
│   ├── gamesRoutes.js
│   ├── newsRoutes.js
│   ├── notificationsRoutes.js
│   └── upcomingRoutes.js
└── server.js                  # Entry point
```

---

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express v5
- **Database**: MySQL 8 via `mysql2`
- **Auth**: JSON Web Tokens (`jsonwebtoken`) + `bcrypt`
- **Validation**: `express-validator`
- **Logging**: `morgan`
- **Env vars**: `dotenv`

---

## 📄 License

ISC
