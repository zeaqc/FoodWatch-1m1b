# FoodWatch Platform — Complete File Tree

```
platform/
├── package.json                    # Root — runs both server + client concurrently
├── SETUP.md                        # Full setup & run instructions
├── TEST_CHECKLIST.md               # Manual + automated test checklist
│
├── server/                         # Node.js / Express backend
│   ├── package.json
│   ├── .env.example                # Copy to .env and fill values
│   ├── uploads/                    # Photo uploads (auto-created at runtime)
│   └── src/
│       ├── index.js                # Express app entry point
│       ├── models/
│       │   ├── User.js             # Donor, Receiver, Admin (Aadhaar-compliant)
│       │   ├── Donation.js         # Food donation with SDG tags
│       │   ├── Claim.js            # Atomic claim (unique index prevents double-claim)
│       │   ├── Rating.js           # Post-collection ratings
│       │   └── Notification.js     # In-app notifications
│       ├── routes/
│       │   ├── auth.js             # Register (donor/receiver), login, OTP, profile, delete
│       │   ├── donations.js        # CRUD, geo-filter, photo upload, report
│       │   ├── claims.js           # Claim, collect (both-side confirm), cancel
│       │   ├── ratings.js          # Submit + view ratings
│       │   ├── admin.js            # User verify/disable, donation remove, reports
│       │   └── impact.js           # Live platform stats, SDG metrics, notifications
│       ├── middleware/
│       │   └── auth.js             # protect, requireRole, requirePhoneVerified
│       ├── utils/
│       │   ├── db.js               # MongoDB connection
│       │   ├── token.js            # JWT sign
│       │   ├── sms.js              # SMS OTP (MSG91/Twilio/Fast2SMS, dev fallback)
│       │   ├── email.js            # Nodemailer + email templates
│       │   └── notify.js           # In-app + email notification helper
│       └── jobs/
│           └── expiryJob.js        # Cron: expire donations + 30-min donor warnings
│
└── client/                         # React 18 frontend
    ├── package.json
    ├── .env.example
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js                # Root render
        ├── App.js                  # Router + role guards
        ├── context/
        │   └── AuthContext.js      # Auth state, login, logout, refreshUser
        ├── utils/
        │   └── api.js              # Axios instance with JWT interceptors
        ├── styles/
        │   └── global.css          # Design tokens + all shared styles
        ├── components/
        │   ├── auth/
        │   │   ├── LoginForm.js
        │   │   ├── RegisterForm.js  # Donor + Receiver tabs, Aadhaar + safety consent
        │   │   └── VerifyOtp.js
        │   ├── donor/
        │   │   └── DonationForm.js  # Full donation modal with photo + allergens + geo
        │   └── shared/
        │       ├── Navbar.js        # Sticky nav + notification bell panel
        │       ├── Footer.js        # SDG tags + links
        │       ├── DonationCard.js  # Reusable card with countdown + SDG tags
        │       └── Countdown.js     # Live expiry countdown (updates every 30s)
        └── pages/
            ├── HomePage.js          # Hero + live stats + how-it-works + SDG strip
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── VerifyOtpPage.js
            ├── BrowsePage.js        # Grid + Leaflet map view + filters + claim
            ├── DonorDashboard.js    # Tabs: all/active/claimed/collected/expired
            ├── ReceiverDashboard.js # Claims list + mark collected + rate
            ├── AdminDashboard.js    # Overview / Users / Donations / Reports
            ├── ImpactPage.js        # SDG cards + Recharts (line/pie/bar) + 12.3 progress
            ├── DonationDetailPage.js
            ├── ClaimDetailPage.js
            ├── PrivacyPage.js       # DPDP Act 2023 + FSSAI liability + Aadhaar policy
            └── NotFoundPage.js
```
