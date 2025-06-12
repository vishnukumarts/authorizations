const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const SECRET = 'my-secret-key';
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'session-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Dummy login
app.post('/login', (req, res) => {
  const { username } = req.body;

  // 1. Cookie
  res.cookie('username', username, { httpOnly: true });

  // 2. Session
  req.session.user = username;

  // 3. JWT
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });

  res.json({ message: 'Logged in!' });
});

// Endpoint to check cookie
app.get('/cookie', (req, res) => {
  const username = req.cookies.username;
  if (username) {
    res.send(`Cookie says you're ${username}`);
  } else {
    res.status(401).send('No cookie found');
  }
});

// Endpoint to check session
app.get('/session', (req, res) => {
	console.log(req);
  if (req.session.user) {
    res.send(`Session says you're ${req.session.user}`);
  } else {
    res.status(401).send('No session found');
  }
});

// Endpoint to check JWT
app.get('/jwt', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('No token provided');

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(403).send('Invalid token');
    res.send(`JWT says you're ${decoded.username}`);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

