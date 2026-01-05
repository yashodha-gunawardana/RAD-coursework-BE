# Eventora Backend - Event Planning & Booking System 🎉

## 📌 Project Overview

This is the backend API for Eventora, a full-stack web application designed for seamless event planning and management. Users can create and schedule events, book vendors (e.g., photography, catering, decoration), track budgets, and manage invitations.
The backend provides secure, role-based RESTful APIs with full CRUD operations, file uploads, email notifications, and JWT authentication.


## ⚡ Key Features:
- Role-based access control (Admin, User, Vendor)
- Event creation with scheduling and extra items
- Vendor management and booking system
- Budget planning with automatic calculations
- File uploads for event/vendor images
- Email notifications (Nodemailer)
- JWT authentication with access & refresh tokens
- Ready for advanced features: AI budget optimization & timeline automation


## 🛠 Technologies Used
- **Backend**: Node.js, Express.js, TypeScript  
- **Database**: MongoDB + Mongoose  
- **Security**: JWT + bcryptjs (authentication & security)  
- **File Uploads**: Multer (image uploads)  
- **Email Notifications**: Nodemailer (email sending)  
- **Environment Variables**: dotenv  
- **Networking**: CORS  
- **Cloud Deployment**: Render / Railway / Vercel


## 📂 Project Structure

- **EVENTORA-BE/**
  - **src/** 
    - **controllers/ ** – All route handlers and business logic
      - `authController.ts ` 
      - `bookingController.ts `
      - `budgetController.ts ` 
      - `eventController.ts ` 
      - `vendorController.ts ` 
    - **middleware/ **          – Custom middleware
      - `authMiddleware.ts ` 
      - `roleMiddleware.ts ` 
      - `upload.ts ` 
    - **models/ **        - Mongoose schemas
      - `userModel.ts `
      - `eventModel.ts `
      - `vendorModel.ts `
      - `bookingModel.ts `
      - `budgetModel.ts `
    - **routes/ **        – API route definitions
      - `authRoutes.ts `
      - `eventRoutes.ts `
      - `vendorRoutes.ts `
      - `bookingRoutes.ts `
      - `budgetRoutes.ts `
    - **utils/ **          – Helper functions
      - `tokens.ts `
      - `email.ts ` 
    - `index.ts ` 
  - `.env `         – Environment variables (never commit)
  - `.gitignore `
  - `package.json `
  - `tsconfig.json `
  - `README.md `


 ## 🚀 Setup and Run Instructions 
 
  ### 1️⃣ Clone the Repository
      git clone https://github.com/yashodha-gunawardana/RAD-coursework-BE
      cd EVENTORA-BE
  ### 2️⃣ Initialize the Project
      npm init -y

  ### 3️⃣ Install Dependencies
      npm install express mongoose jsonwebtoken bcryptjs nodemailer multer dotenv cors

  ### 4️⃣ Install Development Dependencies
      npm install -D typescript ts-node-dev @types/node @types/express @types/mongoose @types/jsonwebtoken @types/bcryptjs         @types/nodemailer @types/multer @types/cors

  ### 5️⃣ Initialize TypeScript Configuration
      npx tsc --init

  ### 6️⃣ Create `.env` File in Root Directory
      SERVER_PORT=5000
      MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/database_name
      JWT_SECRET=your_very_strong_secret_key_here
      JWT_REFRESH_SECRET=your_refresh_token_secret_here
      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=587
      SMTP_USER=your-email@gmail.com
      SMTP_PASS=your-app-password

  ### 7️⃣ Start the Development Server
      npm run dev
  API will be available at: `http://localhost:5000/api/v1`

## ⚡ Scripts in `package.json`
      "scripts": {
        "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
        "build": "tsc",
        "start": "node dist/index.js"
      }
## 🌐 API Base URL

  - Local: `http://localhost:5000/api/v1`
  - Deployed Backend: `https://eventora-be.onrender.com`
  - Linked Frontend: `https://eventora-planning-fe.vercel.app/`

## 🔐 Authentication Endpoints

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login and get access + refresh token | Public |
| GET | `/auth/me` | Get current user details | Authenticated |
| POST | `/auth/request/vendor` | Request to become a vendor | User only |
| POST | `/auth/refresh` | Refresh access token (send refresh token in body) | Authenticated (Refresh Token) |

---

## 👥 Admin-Only User Management

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| GET | `/auth/users` | Get all users (admin panel) | Admin only |
| POST | `/auth/users/approve/:id` | Approve vendor request | Admin only |
| POST | `/auth/users/reject/:id` | Reject vendor request | Admin only |
| DELETE | `/auth/users/:id` | Delete a user | Admin only |

---

## 📅 Events Endpoints

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| POST | `/events` | Create a new event (with optional image) | Authenticated |
| GET | `/events/my` | Get all events of current user | Authenticated |
| GET | `/events/all` | Get all events (pagination supported) | Admin only |
| GET | `/events/dropdown` | Get user's PLANNING events (dropdown) | Authenticated |
| GET | `/events/:id` | Get single event by ID | Authenticated |
| PUT | `/events/:id` | Update event (with optional image) | Admin only |
| DELETE | `/events/:id` | Delete event | Owner or Admin |

---

## 🛍️ Vendors Endpoints

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| GET | `/vendors` | Get all available vendors | Public |
| GET | `/vendors/:id` | Get vendor by ID | Public |
| GET | `/vendors/dropdown` | Get vendors for booking dropdown | Authenticated |
| GET | `/vendors/me` | Get own vendor profile | Vendor only |
| GET | `/vendors/by-user` | Get vendor profile linked to current user | Authenticated |
| PUT | `/vendors/me` | Update own vendor profile (with image) | Vendor only |
| POST | `/vendors` | Create new vendor (with image) | Admin only |
| PUT | `/vendors/:id` | Update vendor | Admin only |
| DELETE | `/vendors/:id` | Delete vendor | Admin only |

---

## 📑 Bookings Endpoints

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| POST | `/bookings` | Create new booking (event + vendor) | User / Admin |
| GET | `/bookings` | Get current user's bookings | User / Admin |
| GET | `/bookings/:id` | Get booking by ID | User / Admin |
| PUT | `/bookings/:id` | Update booking (notes, etc.) | User / Admin |
| DELETE | `/bookings/:id` | Delete booking | User / Admin |
| GET | `/bookings/vendor/bookings` | Get bookings assigned to current vendor | Vendor only |
| PUT | `/bookings/vendor/bookings/:id/status` | Update booking status | Vendor / Admin |

---

## 💰 Budget Endpoints

| Method | Endpoint | Description | Access |
|------|--------|------------|--------|
| POST | `/budgets` | Create or update budget for an event | User / Admin |
| GET | `/budgets` | Get all budgets of current user | User / Admin |
| GET | `/budgets/:budgetId` | Get specific budget by ID | User / Admin |
| PATCH | `/budgets/:budgetId/status` | Update budget status | User / Admin |
| DELETE | `/budgets/:budgetId` | Delete a budget | User / Admin |

---



  
      

