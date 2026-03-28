# MaidSaathi — Domestic Worker Booking Platform

A full-stack MERN marketplace that connects families with trusted domestic helpers across India. Customers can search, book, and pay for home services; workers manage their profiles, accept jobs, and withdraw earnings — all in one place.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Features](#3-features)
4. [Project Structure](#4-project-structure)
5. [Getting Started](#5-getting-started)
6. [Environment Variables](#6-environment-variables)
7. [API Reference](#7-api-reference)
8. [Roles & Access Control](#8-roles--access-control)
9. [Real-Time Chat](#9-real-time-chat)
10. [Payment Flow](#10-payment-flow)
11. [Internationalization](#11-internationalization)
12. [Deployment](#12-deployment)
13. [Scripts Reference](#13-scripts-reference)

---

## 1. Project Overview

MaidSaathi is a three-sided marketplace:

| Role | What they do |
|---|---|
| **Customer** | Search workers by location/skills, book, pay, review |
| **Worker** | Create profile, receive offers, accept bookings, withdraw earnings |
| **Admin** | Manage all users, bookings, payments, reviews, coupons, and audit logs |

Users can also **switch modes** — a single account can act as both a customer and a worker.

---

## 2. Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| Vite | 6 | Build tool & dev server |
| React Router DOM | 7 | Client-side routing |
| Tailwind CSS | 4 | Utility-first styling |
| Framer Motion | 12 | Animations & transitions |
| Axios | 1 | HTTP client with interceptors |
| Socket.io-client | 4 | Real-time chat |
| i18next | 25 | Internationalization (EN / HI / KN) |
| react-hot-toast | 2 | Toast notifications |
| lucide-react | 0.577 | Icon set |

### Backend
| Package | Version | Purpose |
|---|---|---|
| Express | 4 | Web framework |
| Mongoose | 9 | MongoDB ODM |
| jsonwebtoken | 9 | JWT access + refresh tokens |
| bcryptjs | 3 | Password hashing |
| Socket.io | 4 | Real-time communication |
| Razorpay | 2 | Payment gateway |
| Cloudinary | 1 | Image storage & CDN |
| Nodemailer | 8 | Email (OTP, notifications) |
| Fast2SMS | — | SMS OTP delivery |
| Joi | 18 | Request validation |
| Helmet | 8 | Security headers |
| express-rate-limit | 8 | Rate limiting |
| Winston | 3 | Structured logging |
| Morgan | 1 | HTTP request logging |

### Database
- **MongoDB Atlas** — primary datastore with geospatial indexing for worker location search

---

## 3. Features

### Authentication
- Email + password login with OTP verification
- Google OAuth 2.0 (`/auth/callback`)
- JWT access tokens (15 min) + refresh tokens (7 days, httpOnly cookie)
- Forgot password via OTP (email & SMS)
- Automatic token refresh on 401 via Axios interceptor

### Customer
- Search workers by service type, location (geospatial), rating, and price
- View detailed worker profiles with reviews and availability
- Book a worker with date, time, address, and service details
- Apply discount coupons at checkout
- Pay via Razorpay (UPI, cards, wallets, net banking)
- Track booking status in real time
- Chat with booked workers
- Save favourite workers
- View and cancel bookings
- Leave ratings and reviews after job completion

### Worker
- Create and update professional profile (photo, skills, experience, service areas, pricing)
- Upload verification documents (ID proof, address proof)
- Receive job offers and accept/reject them
- View upcoming and past bookings
- Wallet dashboard — track earnings and request withdrawals
- Real-time chat with customers
- Switch to customer mode from the same account

### Admin Panel
| Section | Capabilities |
|---|---|
| Dashboard | Live stats — users, bookings, revenue, workers |
| Users | View, ban/unban, delete users |
| Workers | Verify documents, approve/reject worker profiles |
| Bookings | View all bookings, filter by status |
| Payments | Track all transactions, handle refunds |
| Withdrawals | Approve or reject worker withdrawal requests |
| Refund Requests | Process customer refund claims |
| Offers & Coupons | Create and manage discount codes |
| Reviews | Moderate and delete inappropriate reviews |
| Audit Logs | Full system activity trail |
| Contact Messages | View and delete contact form submissions |

### Other
- Multi-language support: English, Hindi, Kannada
- Responsive design — works on mobile, tablet, and desktop
- Real-time unread message badge in navbar
- Hidden scrollbars for clean UI
- Glass-morphism card design system

---

## 4. Project Structure

```
MaidSaathi/
├── README.md
├── package.json              # Root scripts (build + start for deployment)
├── client/                   # React frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── vercel.json           # SPA rewrite rule
│   ├── public/               # Static assets (icons, images)
│   └── src/
│       ├── main.jsx          # React entry point
│       ├── App.jsx           # All routes and layouts
│       ├── api/
│       │   └── axios.js      # Axios instance with token refresh
│       ├── context/
│       │   ├── AuthContext.jsx   # Global auth state
│       │   └── SocketContext.jsx # Socket.io connection
│       ├── hooks/
│       │   └── useAuth.js    # Auth context consumer hook
│       ├── i18n/
│       │   ├── index.js
│       │   └── locales/
│       │       ├── en.json
│       │       ├── hi.json
│       │       └── kn.json
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx
│       │   │   └── Footer.jsx
│       │   ├── common/
│       │   │   ├── ProtectedRoute.jsx
│       │   │   ├── GuestRoute.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Spinner.jsx
│       │   │   ├── StarRating.jsx
│       │   │   ├── EmptyState.jsx
│       │   │   └── LanguageSwitcher.jsx
│       │   └── chat/
│       │       ├── ChatWindow.jsx
│       │       └── MessageNotifications.jsx
│       └── pages/
│           ├── Home.jsx
│           ├── Login.jsx
│           ├── Register.jsx
│           ├── ForgotPassword.jsx
│           ├── Contact.jsx
│           ├── Terms.jsx
│           ├── Privacy.jsx
│           ├── Profile.jsx
│           ├── customer/
│           │   ├── CustomerDashboard.jsx
│           │   ├── SearchWorkers.jsx
│           │   ├── WorkerProfile.jsx
│           │   ├── MyBookings.jsx
│           │   ├── BookingDetail.jsx
│           │   └── FavoriteWorkers.jsx
│           ├── worker/
│           │   ├── WorkerDashboard.jsx
│           │   ├── WorkerProfile.jsx
│           │   ├── WorkerBookings.jsx
│           │   └── WorkerWallet.jsx
│           └── admin/
│               ├── AdminLayout.jsx
│               ├── AdminDashboard.jsx
│               ├── AdminUsers.jsx
│               ├── AdminWorkers.jsx
│               ├── AdminBookings.jsx
│               ├── AdminPayments.jsx
│               ├── AdminWithdrawals.jsx
│               ├── AdminRefundRequests.jsx
│               ├── AdminOffers.jsx
│               ├── AdminReviews.jsx
│               ├── AdminAuditLogs.jsx
│               └── AdminContactMessages.jsx
└── server/
    ├── server.js             # HTTP server + Socket.io init
    ├── app.js                # Express app + middleware + routes
    ├── scripts/
    │   └── createAdmin.js    # CLI script to seed admin user
    └── src/
        ├── config/
        │   ├── db.js
        │   └── cloudinary.js
        ├── controllers/
        │   ├── authController.js
        │   ├── workerController.js
        │   ├── bookingController.js
        │   ├── paymentController.js
        │   ├── walletController.js
        │   ├── adminController.js
        │   ├── offerController.js
        │   ├── couponController.js
        │   ├── chatController.js
        │   ├── contactController.js
        │   └── favoriteController.js
        ├── models/
        │   ├── User.js
        │   ├── Worker.js
        │   ├── Booking.js
        │   ├── Payment.js
        │   ├── Transaction.js
        │   ├── Message.js
        │   ├── ChatRead.js
        │   ├── Review.js
        │   ├── Offer.js
        │   ├── Coupon.js
        │   ├── OTP.js
        │   ├── RegisterOTP.js
        │   ├── AuditLog.js
        │   ├── ContactMessage.js
        │   └── WithdrawalRequest.js
        ├── middleware/
        │   ├── auth.js           # JWT verify + attach user
        │   ├── roleCheck.js      # authorize('admin') etc.
        │   ├── validate.js       # Joi schema validation
        │   ├── upload.js         # Multer + Cloudinary
        │   └── rateLimiter.js
        ├── routes/
        │   ├── authRoutes.js
        │   ├── workerRoutes.js
        │   ├── bookingRoutes.js
        │   ├── paymentRoutes.js
        │   ├── walletRoutes.js
        │   ├── adminRoutes.js
        │   ├── favoriteRoutes.js
        │   ├── chatRoutes.js
        │   ├── offerRoutes.js
        │   ├── couponRoutes.js
        │   └── contactRoutes.js
        ├── services/
        │   ├── otpService.js
        │   └── paymentService.js
        ├── socket/
        │   └── chatSocket.js
        ├── utils/
        │   ├── email.js
        │   ├── sms.js
        │   ├── logger.js
        │   ├── errorHandler.js
        │   ├── generateToken.js
        │   ├── geocodeService.js
        │   └── apiFeatures.js
        └── validators/
            ├── authValidator.js
            ├── bookingValidator.js
            ├── paymentValidator.js
            └── workerValidator.js
```

---

## 5. Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- Razorpay account (test mode is fine for development)
- Gmail app password (for Nodemailer) or any SMTP provider
- Fast2SMS API key (optional — for SMS OTP)

### Clone the Repository

```bash
git clone https://github.com/your-username/maid-saathi.git
cd maid-saathi
```

### Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Configure Environment Variables

Create `server/.env` using the template in the [Environment Variables](#6-environment-variables) section below.

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5001/api
VITE_SERVER_URL=http://localhost:5001
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_here
```

### Run in Development

Open **two terminals**:

```bash
# Terminal 1 — Backend
cd server
npm run dev
# Server starts on http://localhost:5001

# Terminal 2 — Frontend
cd client
npm run dev
# Client starts on http://localhost:5173
```

### Seed Admin User

```bash
cd server
node scripts/createAdmin.js
```

This creates an admin account you can use to log in at `/login` and access `/admin`.

---

## 6. Environment Variables

### Server (`server/.env`)

```env
# App
NODE_ENV=development
PORT=5001
CLIENT_ORIGIN=http://localhost:5173

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/maidsaathi

# JWT
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
EMAIL_FROM=MaidSaathi <your@gmail.com>

# SMS (Fast2SMS — optional)
FAST2SMS_API_KEY=your_fast2sms_api_key

# Logging
LOG_LEVEL=info
```

### Client (`client/.env`)

```env
VITE_API_URL=http://localhost:5001/api
VITE_SERVER_URL=http://localhost:5001
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> Never commit `.env` files. They are listed in `.gitignore`.

---

## 7. API Reference

All routes are prefixed with `/api`.

### Auth — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Register with name, email, password, phone |
| POST | `/verify-register-otp` | Public | Verify OTP sent after register |
| POST | `/login` | Public | Login with email + password |
| POST | `/logout` | Auth | Invalidate refresh token |
| POST | `/refresh` | Public | Get new access token via cookie |
| POST | `/forgot-password` | Public | Send OTP to email/phone |
| POST | `/verify-otp` | Public | Verify password reset OTP |
| POST | `/reset-password` | Public | Set new password after OTP |
| GET | `/me` | Auth | Get logged-in user profile |
| GET | `/google` | Public | Initiate Google OAuth |
| GET | `/google/callback` | Public | Google OAuth callback |

### Workers — `/api/workers`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Public | Search/filter/paginate workers |
| GET | `/:id` | Public | Get single worker profile |
| POST | `/setup` | Auth | Create worker profile |
| PUT | `/profile` | Worker | Update own profile |
| POST | `/documents` | Worker | Upload verification documents |
| GET | `/my/profile` | Worker | Get own worker profile |

### Bookings — `/api/bookings`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Customer | Create a new booking |
| GET | `/my` | Auth | List current user's bookings |
| GET | `/:id` | Auth | Get booking details |
| PATCH | `/:id/cancel` | Auth | Cancel a booking |
| PATCH | `/:id/status` | Worker | Update booking status |
| POST | `/:id/review` | Customer | Submit rating & review |

### Payments — `/api/payments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/order` | Customer | Create Razorpay order |
| POST | `/verify` | Customer | Verify payment signature |
| POST | `/webhook` | Public | Razorpay webhook (raw body) |
| POST | `/:bookingId/refund` | Customer | Request refund |

### Wallet — `/api/wallet`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/balance` | Worker | Get current wallet balance |
| GET | `/transactions` | Worker | List transaction history |
| POST | `/withdraw` | Worker | Request withdrawal |

### Favorites — `/api/favorites`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Customer | List favourite workers |
| POST | `/:workerId` | Customer | Add to favourites |
| DELETE | `/:workerId` | Customer | Remove from favourites |

### Chat — `/api/chat`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/conversations` | Auth | List all conversations |
| GET | `/:userId` | Auth | Get messages with a user |
| PATCH | `/:userId/read` | Auth | Mark messages as read |

### Offers — `/api/offers`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Worker | List received offers |
| PATCH | `/:id/accept` | Worker | Accept an offer |
| PATCH | `/:id/reject` | Worker | Reject an offer |

### Coupons — `/api/coupons`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/apply` | Customer | Apply coupon code |
| POST | `/` | Admin | Create coupon |
| GET | `/` | Admin | List all coupons |
| DELETE | `/:id` | Admin | Delete coupon |

### Contact — `/api/contact`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/` | Public | Submit contact form |
| GET | `/` | Admin | List all messages |
| PATCH | `/:id/read` | Admin | Mark message as read |
| DELETE | `/:id` | Admin | Delete message |

### Admin — `/api/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/stats` | Admin | Dashboard KPIs |
| GET | `/users` | Admin | List all users |
| PATCH | `/users/:id/ban` | Admin | Ban or unban a user |
| DELETE | `/users/:id` | Admin | Delete a user |
| GET | `/workers` | Admin | List all workers |
| PATCH | `/workers/:id/verify` | Admin | Approve worker |
| GET | `/bookings` | Admin | All bookings |
| GET | `/payments` | Admin | All payments |
| GET | `/withdrawals` | Admin | All withdrawal requests |
| PATCH | `/withdrawals/:id` | Admin | Approve/reject withdrawal |
| GET | `/reviews` | Admin | All reviews |
| DELETE | `/reviews/:id` | Admin | Delete review |
| GET | `/audit-logs` | Admin | System activity log |

---

## 8. Roles & Access Control

The app uses **JWT claims** for authentication and a **role-based middleware** (`authorize`) for authorization.

```
User.role = 'customer' | 'worker' | 'admin'
```

### Route Guards (Frontend)

| Guard | File | Behavior |
|---|---|---|
| `ProtectedRoute` | `components/common/ProtectedRoute.jsx` | Redirects to `/login` if not authenticated; redirects if wrong role |
| `GuestRoute` | `components/common/GuestRoute.jsx` | Redirects authenticated users away from login/register |
| `WorkerGuard` | `App.jsx` | Checks if worker profile is set up before accessing worker pages |
| `HomeRoute` | `App.jsx` | Redirects admin to `/admin` instead of home |

### Middleware (Backend)

```js
// Verify JWT and attach req.user
router.use(protect);

// Allow only specific roles
router.use(authorize('admin'));
router.use(authorize('worker'));
router.use(authorize('customer', 'worker'));
```

### Mode Switching

A user can switch between `customer` and `worker` roles without creating a second account. The `switchMode` function in `AuthContext` calls `POST /api/auth/switch-mode`, updates the JWT, and redirects accordingly.

---

## 9. Real-Time Chat

Chat is powered by **Socket.io** on the same HTTP server as the Express API.

### How it works

1. Client connects to Socket.io with `auth: { token }` on mount (via `SocketContext.jsx`)
2. Socket joins a personal room: `socket.join(userId)`
3. Sending a message emits `sendMessage` → server saves to `Message` model → emits `receiveMessage` to recipient's room
4. Unread count badge updates via `newMessageNotification` event
5. REST endpoints (`/api/chat`) handle message history and marking as read

### Socket Events

| Event | Direction | Description |
|---|---|---|
| `sendMessage` | Client → Server | Send a chat message |
| `receiveMessage` | Server → Client | Deliver message to recipient |
| `newMessageNotification` | Server → Client | Increment unread badge |
| `markAsRead` | Client → Server | Mark a conversation as read |
| `typing` | Client → Server | User is typing indicator |
| `stopTyping` | Client → Server | User stopped typing |

---

## 10. Payment Flow

MaidSaathi uses **Razorpay** for processing payments.

```
Customer clicks "Pay"
     │
     ▼
POST /api/payments/order
  → Creates Razorpay order (returns order_id)
     │
     ▼
Razorpay checkout opens in browser
  → Customer pays (UPI / card / wallet)
     │
     ▼
POST /api/payments/verify
  → Verifies HMAC signature
  → Creates Payment record
  → Updates booking status to "confirmed"
  → Credits worker wallet
     │
     ▼
Razorpay Webhook → POST /api/payments/webhook
  → Secondary confirmation (signature verified on raw body)
  → Handles edge cases (late payment, failed payment)
```

### Refunds

1. Customer submits refund request via `POST /api/payments/:bookingId/refund`
2. Admin reviews in `/admin/refund-requests`
3. Admin approves → Razorpay refund is initiated server-side
4. Transaction record updated

---

## 11. Internationalization

The app supports three languages switchable at runtime without a page reload.

| Code | Language |
|---|---|
| `en` | English (default) |
| `hi` | Hindi |
| `kn` | Kannada |

### Setup

- **Library**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`
- **Config**: `client/src/i18n/index.js`
- **Locale files**: `client/src/i18n/locales/{en,hi,kn}.json`
- **Component**: `LanguageSwitcher.jsx` — appears in both desktop navbar and mobile menu

### Usage in Components

```jsx
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
return <button>{t('nav.signIn')}</button>;
```

---

## 12. Deployment

### Production Build

```bash
# From project root
npm run build
# Installs all deps and builds client to client/dist/

npm start
# Starts Express server which serves the React build
```

The Express server in production:
- Serves `client/dist/` as static files
- Falls back to `index.html` for all unknown routes (SPA behaviour)

### Vercel (Frontend only)

`client/vercel.json` contains a rewrite rule to support React Router:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Set `VITE_API_URL` to your deployed backend URL in Vercel environment settings.

### Environment Checklist for Production

- [ ] `NODE_ENV=production`
- [ ] Strong `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` (32+ random chars)
- [ ] `CLIENT_ORIGIN` set to your frontend domain
- [ ] MongoDB Atlas IP whitelist includes your server IP
- [ ] Razorpay live keys (replace test keys)
- [ ] Cloudinary configured
- [ ] SMTP credentials working
- [ ] Razorpay webhook URL registered in Razorpay dashboard

---

## 13. Scripts Reference

### Root

```bash
npm run build   # Install deps + build React app
npm start       # Start Express server (serves built client)
```

### Client

```bash
npm run dev     # Start Vite dev server on :5173
npm run build   # Build for production → dist/
npm run preview # Preview production build locally
npm run lint    # Run ESLint
```

### Server

```bash
npm run dev     # Start with nodemon (auto-restart on changes)
npm start       # Start with node (production)
node scripts/createAdmin.js   # Seed admin user
```

---

## Brand

- **Primary colour**: `#3b82f6` (blue)
- **Gold accent**: `#C9A84C`
- **Dark navy**: `#1B2B4B`
- **Background**: `#FAF8F3` (warm off-white)

---

## License

This project is proprietary. All rights reserved © 2025 MaidSaathi.
