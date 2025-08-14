# Roxiler FullStack Store Rating System

A full-stack web application that allows users to submit ratings for stores registered on the platform.

## Tech Stack

- **Backend**: Express.js (Node.js runtime)
- **Database**: PostgreSQL
- **Frontend**: React.js
- **Styling**: Tailwind CSS

## Features

### User Roles & Access

1. **System Administrator**
   - Add new stores, normal users, and admin users
   - Dashboard with total counts (users, stores, ratings)
   - View and filter all users and stores
   - Full system management access

2. **Normal User**
   - Sign up and log in
   - View and search stores
   - Submit and modify ratings (1-5 scale)
   - Update profile information

3. **Store Owner**
   - Log in and manage store
   - View ratings and analytics
   - Dashboard with user ratings

## Project Structure

```
roxiler_fullstack/
├── backend/                 # Express.js API server
│   ├── config/             # Database and server configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   └── server.js          # Main server file
├── frontend/               # React.js application
│   ├── public/            # Static files
│   ├── src/               # React source code
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json
├── package.json            # Root package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Backend Setup
1. Navigate to backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Copy `env.example` to `.env` and configure database
4. Start development server: `npm run dev`

### Frontend Setup
1. Navigate to frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start development server: `npm start`

### Quick Start (Both Backend & Frontend)
1. Install all dependencies: `npm run install-all`
2. Start both servers: `npm run dev`

## Environment Variables

Create a `.env` file in the backend directory with:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=roxiler_store_rating
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/stores` - Get all stores
- `POST /api/stores` - Add new store (Admin only)
- `POST /api/ratings` - Submit rating
- `PUT /api/ratings/:id` - Update rating

## 🚀 **Quick Start for Evaluators**

### **System Administrator Access**
Use these credentials to log in and test all admin features:

```
Email: admin@roxiler.com
Password: admin123
Role: System Administrator
```

### **Pre-configured Test Data**
The system comes with sample data for testing:

#### **Users:**
- **Admin User**: admin@roxiler.com (System Administrator)
- **Store Owner**: yashwanth12345678900@gmail.com (Store Owner)
- **Normal User**: yash@gmail.com (Normal User)

#### **Stores:**
- **store1**: Electronics store with ratings
- **Sony Store**: Technology store

#### **Sample Ratings:**
- Multiple ratings with comments for testing

### **Testing Steps for Evaluators**

1. **Start the Application:**
   ```bash
   npm run install-all
   npm run dev
   ```

2. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

3. **Login as System Administrator:**
   - Email: `admin@roxiler.com`
   - Password: `admin123`

4. **Test Admin Features:**
   - ✅ View dashboard with total counts
   - ✅ Create new users (Normal User, Store Owner, Admin)
   - ✅ Create new stores
   - ✅ View all users with role-based information
   - ✅ View all stores with ratings
   - ✅ Apply filters and search
   - ✅ Change admin password

5. **Test Other Roles:**
   - **Store Owner**: Login with `yashwanth12345678900@gmail.com`
   - **Normal User**: Login with `yash@gmail.com`

### **Database Setup (if needed)**
If you need to set up the database from scratch:

```bash
cd backend
node database/init.js
```

This will create the database schema and insert the default admin user.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License
