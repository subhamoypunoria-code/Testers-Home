require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
require('./models/Counter'); // ensure Counter model is registered before any pre-save hooks

const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const defectRoutes = require('./routes/defects');
const testCaseRoutes = require('./routes/testCases');
const analyticsRoutes = require('./routes/analytics');
const notificationRoutes = require('./routes/notifications');
const userRoutes = require('./routes/users');

if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] },
});

app.set('io', io);

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// CORS must come first — before helmet and everything else
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight for all routes

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: false,
}));
app.use(mongoSanitize());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50, message: { success: false, message: 'Too many requests' } }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/defects', defectRoutes);
app.use('/api/projects/:projectId/testcases', testCaseRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'QA Platform API running' }));

// Socket.io
io.on('connection', (socket) => {
  socket.on('join_project', (projectId) => socket.join(`project_${projectId}`));
  socket.on('join_defect', (defectId) => socket.join(`defect_${defectId}`));
  socket.on('leave_project', (projectId) => socket.leave(`project_${projectId}`));
  socket.on('disconnect', () => {});
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
module.exports.server = server;
