# Rice Mill Management System

A full-stack MERN application for managing rice mill operations with role-based authentication and modern UI.

## 🚀 Tech Stack

### Frontend
- **React.js** with **Vite** - Fast development and build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcrypt.js** - Password hashing
- **Nodemailer** - Email sending for password reset

## 📁 Project Structure

```
RiceMillProject/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── SignIn.jsx
│   │   │   ├── SignUp.jsx
│   │   │   └── ForgotPassword.jsx
│   │   ├── pages/           # Page components
│   │   │   └── Dashboard.jsx
│   │   ├── store/           # Redux store configuration
│   │   │   ├── index.js
│   │   │   └── slices/
│   │   │       └── authSlice.js
│   │   ├── services/        # API service layer
│   │   │   └── authService.js
│   │   ├── utils/           # Utility functions
│   │   ├── hooks/           # Custom React hooks
│   │   └── layouts/         # Layout components
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── package.json
│
├── backend/                 # Node.js backend application
│   ├── config/             # Configuration files
│   │   └── database.js
│   ├── controllers/        # Route controllers
│   │   └── authController.js
│   ├── middleware/         # Custom middleware
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/             # Mongoose models
│   │   └── User.js
│   ├── routes/             # API routes
│   │   └── auth.js
│   ├── utils/              # Utility functions
│   ├── .env.example        # Environment variables example
│   ├── server.js           # Main server file
│   └── package.json
│
└── README.md               # Project documentation
```

## 🔐 Authentication Features

### Role-Based Access Control
- **Admin**: Full system access, user management, system settings
- **Manager**: Production management, inventory control, reports
- **Employee**: Daily tasks, time tracking, basic operations

### Authentication Functions
- ✅ **User Registration** - Create new accounts with role assignment
- ✅ **User Login** - Secure authentication with JWT tokens
- ✅ **Password Reset** - Email-based password recovery
- ✅ **Change Password** - Secure password updates
- ✅ **Profile Management** - View and manage user profile
- ✅ **Protected Routes** - Role-based route protection

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd RiceMillProject
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create environment file
cp .env.example .env

# Update the .env file with your configuration:
# - MongoDB connection string
# - JWT secret key
# - Email credentials for password reset
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

### 4. Environment Configuration

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ricemill
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex
JWT_EXPIRE=30d

# Email Configuration (for forgot password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

## 📋 API Endpoints

### Authentication Routes
```
POST   /api/auth/register        # Register new user
POST   /api/auth/login           # User login
GET    /api/auth/me              # Get current user (Protected)
POST   /api/auth/forgot-password # Send password reset email
PUT    /api/auth/reset-password/:token # Reset password with token
POST   /api/auth/change-password # Change password (Protected)
POST   /api/auth/logout          # Logout user (Protected)
```

## 👥 User Roles & Permissions

### Admin
- Full access to all system features
- User management (create, read, update, delete users)
- System configuration and settings
- View all reports and analytics

### Manager
- Production management
- Inventory control and monitoring
- Team management
- Generate reports

### Employee
- Daily task management
- Time tracking
- Basic inventory viewing
- Personal profile management

## 🔧 Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

#### Backend
```bash
npm start           # Start production server
npm run dev         # Start development server with nodemon
```

## 🔐 Security Features

- **Password Hashing** - bcrypt.js for secure password storage
- **JWT Authentication** - Secure token-based authentication
- **Rate Limiting** - API rate limiting to prevent abuse
- **CORS Protection** - Cross-origin resource sharing configuration
- **Helmet.js** - Security headers for Express apps
- **Input Validation** - Express-validator for request validation

## 📧 Email Configuration

For password reset functionality, configure your email settings:

1. **Gmail Setup**:
   - Enable 2-factor authentication
   - Generate an app-specific password
   - Use the app password in SMTP_PASSWORD

2. **Other Email Providers**:
   - Update SMTP_HOST and SMTP_PORT accordingly
   - Provide valid credentials

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Modern Interface** - Clean and intuitive user interface
- **Loading States** - Animated loading indicators
- **Error Handling** - User-friendly error messages
- **Form Validation** - Client-side and server-side validation

## 🚀 Deployment

### Backend Deployment
1. Set NODE_ENV=production
2. Configure production MongoDB URI
3. Deploy to platforms like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to platforms like Vercel, Netlify, or AWS S3

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support, email support@ricemill.com or create an issue in the repository.

## 🔮 Future Enhancements

- [ ] Inventory management system
- [ ] Production tracking
- [ ] Financial reporting
- [ ] Mobile application
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Export/Import functionality
- [ ] Multi-language support

---

**Built with ❤️ for Rice Mill Management**
