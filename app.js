require("dotenv").config();

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const mongoose = require("mongoose");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const path = require("path");

const app = express();

// env variables

const {
  PORT = 3000,
  MONGODB_URI,
  SESSION_SECRET,
  NODE_ENV,
  GITHUB_CLIENT_ID,
  GITHUB_CALLBACK_URL,
  GITHUB_CLIENT_SECRET,
} = process.env;

// validate env

if (
  !MONGODB_URI ||
  !GITHUB_CALLBACK_URL ||
  !SESSION_SECRET ||
  !GITHUB_CLIENT_ID ||
  !GITHUB_CLIENT_SECRET
) {
  throw new Error("Missing required environment variables");
}

// mongodb connection

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// view engine

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// sessions

app.use(
  session({
    secret: SESSION_SECRET,

    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
      mongoUrl: MONGODB_URI,
    }),

    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: NODE_ENV === "production",
    },
  }),
);

// passport setup

passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
    },

    (accessToken, refreshToken, profile, done) => {
      done(null, {
        username: profile.username,
        name: profile.displayName || profile.username,
        avatar: profile.photos[0]?.value || "",
        accessToken,
      });
    },
  ),
);

// passport session

passport.serializeUser((user, done) => done(null, user));

passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());

app.use(passport.session());

// routes

[
  "./routes/auth",
  "./routes/profile",
  "./routes/skills",
  "./routes/harvest",
  "./routes/saved",
].forEach((route) => {
  app.use("/", require(route));
});

// home route

app.get("/", (req, res) => {
  res.redirect(req.session.user ? "/discover" : "/login");
});

// start server

app.listen(PORT, "0.0.0.0", () => {
  console.log(`GitMatch running on http://localhost:${PORT}`);
});