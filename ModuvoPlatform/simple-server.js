const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors({ 
  origin: process.env.CORS_ORIGIN?.split(',') || ['https://moduvo.to', 'https://www.moduvo.to'], 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'dist/public')));

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).send('ok');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Simple logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.json({ success: true });
});

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});




