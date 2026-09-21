const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🌱 Setting up FoodWatch Environment Variables & Media Directories...\n');

// 1. Server .env
const serverDir = path.join(__dirname, 'platform', 'server');
const serverEnvPath = path.join(serverDir, '.env');
const jwtSecret = crypto.randomBytes(32).toString('hex');

const serverEnvContent = `# Server Configuration
PORT=5000
NODE_ENV=development

# Database (Local MongoDB or MongoDB Atlas URI)
MONGO_URI=mongodb://localhost:27017/foodwatch

# Security (Auto-generated 64-character hex JWT secret)
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# CORS & Client URL (React dev server)
CLIENT_ORIGIN=http://localhost:3000
CLIENT_URL=http://localhost:3000

# File Upload Directory
UPLOAD_DIR=uploads

# Optional Email SMTP (Leave blank to print notifications to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="FoodWatch <no-reply@foodwatch.in>"

# Optional SMS Gateway (Leave blank to print OTPs directly to terminal console)
SMS_API_KEY=
SMS_PROVIDER=msg91
`;

if (!fs.existsSync(serverEnvPath)) {
  fs.writeFileSync(serverEnvPath, serverEnvContent, 'utf-8');
  console.log('✅ Created platform/server/.env (includes auto-generated JWT_SECRET).');
} else {
  console.log('ℹ️  platform/server/.env already exists (keeping existing configuration).');
}

// 2. Client .env
const clientDir = path.join(__dirname, 'platform', 'client');
const clientEnvPath = path.join(clientDir, '.env');
const clientEnvContent = `# React Client Configuration
REACT_APP_API_URL=/api
PORT=3000
`;

if (!fs.existsSync(clientEnvPath)) {
  fs.writeFileSync(clientEnvPath, clientEnvContent, 'utf-8');
  console.log('✅ Created platform/client/.env (configured with /api proxy).');
} else {
  console.log('ℹ️  platform/client/.env already exists (keeping existing configuration).');
}

// 3. Uploads directory
const uploadDirPath = path.join(serverDir, 'uploads');
if (!fs.existsSync(uploadDirPath)) {
  fs.mkdirSync(uploadDirPath, { recursive: true });
  console.log('✅ Created platform/server/uploads/ directory for donor image uploads.');
} else {
  console.log('ℹ️  platform/server/uploads/ directory already exists.');
}

console.log('\n🎉 Environment setup complete! You can now start the platform with:');
console.log('   npm start   (or start_platform.bat on Windows)\n');
