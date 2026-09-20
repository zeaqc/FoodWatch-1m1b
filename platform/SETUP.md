# FoodWatch Platform — Setup & Run Guide

## Prerequisites
| Tool       | Min Version | Install |
|------------|-------------|---------|
| Node.js    | 18+         | https://nodejs.org |
| npm        | 9+          | bundled with Node |
| MongoDB    | 6+          | https://www.mongodb.com/try/download/community |

---

## Step 1 — Clone & enter the platform folder
```bash
cd platform
```

## Step 2 — Install all dependencies (one command)
```bash
npm run install:all
```
This installs root, server, and client packages.

---

## Step 3 — Configure environment variables

### Server
```bash
cd server
cp .env.example .env
```
Open `.env` and fill in:

| Variable         | What to set |
|-----------------|-------------|
| `MONGO_URI`     | Your MongoDB connection string (default: `mongodb://localhost:27017/foodwatch`) |
| `JWT_SECRET`    | Run: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` and paste result |
| `SMTP_USER`     | Your Gmail (or other SMTP) address |
| `SMTP_PASS`     | Gmail App Password (Settings → Security → App passwords) |
| `SMS_API_KEY`   | Your MSG91 / Twilio / Fast2SMS API key |
| `SMS_PROVIDER`  | `msg91` or `twilio` or `fast2sms` |

> **SMS in dev mode**: If you leave `SMS_API_KEY` as the placeholder, OTPs are printed to the server console. This is fine for local development.

### Client
```bash
cd ../client
cp .env.example .env
```
Leave `REACT_APP_API_URL` as `/api` (the proxy in `package.json` handles it during dev).

---

## Step 4 — Start MongoDB
```bash
# macOS/Linux
mongod --dbpath /data/db

# Windows
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath C:\data\db
```

---

## Step 5 — Run the platform (dev mode)
From the `platform/` directory:
```bash
npm run dev
```
- **Server** starts on `http://localhost:5000`
- **Client** starts on `http://localhost:3000`

The React app proxies `/api/*` to the Express server automatically (configured in `client/package.json`).

---

## Step 6 — Create the first Admin user
Because admin accounts cannot be self-registered (security), create one directly in MongoDB:

```bash
# In MongoDB shell or Compass
use foodwatch

# Hash a password first:
node -e "const b=require('bcryptjs'); b.hash('Admin@123', 12).then(h => console.log(h))"
# Copy the hash

db.users.insertOne({
  role: 'admin',
  name: 'Super Admin',
  email: 'admin@foodwatch.in',
  phone: '9000000000',
  passwordHash: '<PASTE_HASH_HERE>',
  isVerified: true,
  isActive: true,
  phoneVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Log in at `http://localhost:3000/login` with `admin@foodwatch.in` / `Admin@123`.

---

## Step 7 — Production Build
```bash
cd platform
npm run build
```
React builds into `client/build/`. Serve it from your Express static middleware or deploy to Vercel/Netlify (client) + Railway/Render (server).

---

## Step 8 — Deploy Checklist
- [ ] Set `NODE_ENV=production` in server `.env`
- [ ] Use a real MongoDB Atlas URI for production
- [ ] Enable HTTPS (use a reverse proxy like nginx + Certbot)
- [ ] Set strong `JWT_SECRET` (64 hex chars)
- [ ] Configure real SMS API key
- [ ] Configure real SMTP credentials
- [ ] Set `CLIENT_ORIGIN` to your production domain
- [ ] Review uploads directory permissions
- [ ] Enable MongoDB authentication in production
