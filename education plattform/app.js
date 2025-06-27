const express = require('express');
const dotenv = require('dotenv');
const AppDataSource = require('./data-source');
const userRoutes = require('./routes/userroute');
const courseRoutes = require('./routes/courseRoute');
const enrollmentRoutes = require('./routes/enrollmentRoute');
const progressRoutes = require('./routes/progressroute');
const courseContentRoutes = require('./routes/coursecontentroute');
const notificationRoutes = require('./routes/notificationroute');
const dashboardRoutes = require('./routes/dashboardroute');
const analyticsRoutes = require('./routes/analyticsRoute');
const cors = require('cors');


// Load environment variables
dotenv.config();

// Initialize Express
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',  // Your frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']  // Allow Authorization header
}));


// Middleware
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/course-content', courseContentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);


// Connect to the database and start the server
AppDataSource.initialize()
  .then(() => {
    console.log('Connected to PostgreSQL via TypeORM');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection error', err);
  });