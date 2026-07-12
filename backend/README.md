# 💕 Only For Us — Production Backend API

Only For Us is a premium relationship management platform built to help couples organize their shared lives inside a secure, private digital space.

This backend provides a production-ready, secure, and scalable REST API and WebSocket (Socket.io) server.

---

## 📂 Folder Structure

```text
backend/
├── src/
│   ├── config/          # Database, Cloudinary, and Nodemailer configs
│   ├── controllers/     # API request controllers (Auth, User, Chat, Habits, Goals, etc.)
│   ├── middlewares/     # HTTP middlewares (Auth, validation parser, errors, rate limiting)
│   ├── models/          # 14 Mongoose Database models
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic helpers (Cloudinary uploads, JWT, email templates)
│   ├── socket/          # Real-time WebSocket connection handling
│   ├── validators/      # express-validator schema rule sets
│   ├── utils/           # Helper functions (OTP generator, standard response payloads)
│   ├── app.js           # Express application configurations
│   └── server.js        # Main server boot entry point
├── .env.example         # Template for environment variables
├── package.json         # Dependencies and script definitions
└── README.md            # Backend setup and documentation guide
```

---

## 🛠️ Setup & Installation

### 1. Prerequisite Installations
* **Node.js** (LTS version 20+)
* **npm** (v10+)

### 2. Install Project Dependencies
Run the package manager from the backend root folder:
```bash
npm install
```

### 3. Setup Environment Configuration
Copy the configuration template:
```bash
cp .env.example .env
```
Fill in the configuration details in the created `.env` file as detailed below.

---

## ⚙️ Integrations & Services Setup

### 1. MongoDB Atlas Setup
1. Log in or sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database cluster and configure a database user with password credentials.
3. Add your current IP address to the Network Access whitelist.
4. Copy the application connection string (e.g. `mongodb+srv://...`) and paste it as the `MONGODB_URI` value in `.env`.

### 2. Gmail SMTP Setup (App Passwords)
Nodemailer connects to Gmail via SMTP. For security, do not use your standard password. Use an App Password instead:
1. Access your Google Account settings page.
2. Ensure **2-Step Verification** is enabled under the **Security** tab.
3. Search for **App passwords** in the search bar.
4. Set an app name (e.g., `Only For Us Backend`) and click **Create**.
5. Copy the generated 16-character password and paste it as the `EMAIL_PASS` value in `.env`, and your email address as `EMAIL_USER`.

### 3. Cloudinary Image Storage Setup
Cloudinary serves and stores media files (avatars, galleries, chat attachments).
1. Sign up for a free account at [Cloudinary](https://cloudinary.com).
2. Go to the dashboard console and retrieve your:
   * **Cloud Name** (`CLOUDINARY_CLOUD_NAME`)
   * **API Key** (`CLOUDINARY_API_KEY`)
   * **API Secret** (`CLOUDINARY_API_SECRET`)
3. Populate these keys inside the `.env` file.

---

## 🚀 Running the Server Locally

Start the local development server (automatically reboots on save):
```bash
npm run dev
```

For production execution:
```bash
npm start
```

*Note: A valid `MONGODB_URI` pointing to a MongoDB Atlas cluster must be provided in the `.env` file for the application to run.*

---

## 🌐 API Documentation

### 🔒 Authentication (`/api/auth`)
* `POST /register`: Registers an account and emails an OTP.
* `POST /login`: Logs in a user, returning access and refresh tokens.
* `POST /logout`: Invalidates the session refresh token.
* `POST /send-otp`: Sends a 6-digit numeric OTP code.
* `POST /verify-otp`: Validates the code and activates registration.
* `POST /forgot-password`: Emails a password reset link.
* `POST /reset-password`: Resets password using the email token.
* `POST /refresh-token`: Rotates access/refresh tokens.
* `GET /me`: Returns current user payload.

### 👤 User Profiles (`/api/users`)
* `GET /profile`: Fetch active profile info.
* `PATCH /profile`: Update text details (name, username, bio, phone, theme).
* `PATCH /avatar`: Upload a new avatar image (Multipart form data).
* `DELETE /account`: Wipe user account and adjust partner pairing status.

### 💑 Relationship Pairing (`/api/relationship`)
* `POST /create`: Generates an invite code.
* `POST /join`: Connects two accounts using the partner's invite code.
* `GET /`: Retrieves paired relationship details.
* `PATCH /`: Updates anniversary, theme, or relationship name.

### 💬 Instant Chat (`/api/messages`)
* `GET /`: Fetches message logs.
* `POST /`: Sends a text message or a media attachment.
* `PATCH /:id/seen`: Registers a read receipt.
* `DELETE /:id`: Deletes a sent message.

### 🎯 Shared Modules
* **Goals (`/api/goals`)**: Shared couple milestones.
* **Habits (`/api/habits`)**: Habit streaks, streaking logs, and completions.
* **Finance (`/api/finance`)**: Log individual income, share expenses, and view who owes whom.
* **Calendar (`/api/calendar`)**: View events and toggle reminder check boxes.
* **Journal (`/api/journal`)**: Personal private diary with mood indicators.
* **Wishlist (`/api/wishlist`)**: Shared wishlist with purchase markers.
* **Memories (`/api/memories`)**: Gallery album for shared photos and videos.

---

## 🧪 Integration Testing Guide

Run the automated integration test suite to verify database connects, tokens, pairing rules, and OTP validations:
```bash
node test-script.js
```
