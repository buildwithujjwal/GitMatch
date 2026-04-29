require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');
 
const app = express();
const PORT = process.env.PORT || 3000;
 
// connect to mongo
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
 
// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
 
// sessions — stored in mongo so they survive restarts
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));
 
// routes
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/profile'));
app.use('/', require('./routes/skills'));
app.use('/', require('./routes/harvest'));
app.use('/', require('./routes/saved'));
 
// placeholder home redirect
app.get('/', (req, res) => {
  if (req.session.user) return res.redirect('/discover');
  res.redirect('/login');
});
 
app.listen(PORT, () => console.log(`GitMatch running on http://localhost:${PORT}`));