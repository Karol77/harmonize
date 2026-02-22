#!/usr/bin/env node

const express = require("express");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

const app = express();
app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use("/public", express.static(path.join(__dirname, "public")));

// Automaticky pridá currentPath do každého renderu – nav.ejs ho používa pre aktívne linky
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const API_BASE = process.env.API_BASE || "https://admin.harmonize.sk";
const BASE_URL = process.env.BASE_URL || "https://harmonize.sk";
const BRAND_NAME = process.env.BRAND_NAME || "Hormonize";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "info@harmonize.sk";

async function apiGet(pathname) {
  const url = `${API_BASE}${pathname}`;
  const r = await fetch(url, { headers: { "Accept": "application/json" } });
  if (!r.ok) throw new Error(`API error ${r.status} for ${url}`);
  return r.json();
}

function ctx(extra = {}) {
  return {
    BRAND_NAME,
    BASE_URL,
    API_BASE,
    SUPPORT_EMAIL,
    ...extra
  };
}

// Home
app.get("/", async (req, res) => {
  try {
    const [courses, sessions] = await Promise.all([
      apiGet("/api/courses"),
      apiGet("/api/sessions")
    ]);

    // featured = first 3 published courses
    const featured = (courses || []).slice(0, 3);

    res.render("index", ctx({ featured, sessions: (sessions || []).slice(0, 6), apiDown: false }));
  } catch (e) {
    res.render("index", ctx({ featured: [], sessions: [], apiDown: true }));
  }
});

// Courses list
app.get("/courses", async (req, res) => {
  try {
    const courses = await apiGet("/api/courses");
    res.render("courses", ctx({ courses }));
  } catch (e) {
    res.render("courses", ctx({ courses: [], apiDown: true }));
  }
});

// Course detail (by slug)
app.get("/courses/:slug", async (req, res) => {
  const slug = decodeURIComponent(String(req.params.slug || "")).trim().toLowerCase();

  try {
    const [courses, sessions] = await Promise.all([
      apiGet("/api/courses"),
      apiGet("/api/sessions")
    ]);

    const course = (courses || []).find(c =>
      String(c.slug || "").trim().toLowerCase() === slug
    );

    if (!course) {
      return res.status(404).render(
        "course_detail",
        ctx({ course: null, sessions: [], apiDown: false })
      );
    }

    const courseSessions = (sessions || []).filter(s =>
      String(s.slug || "").trim().toLowerCase() === slug
    );

    res.render("course_detail", ctx({ course, sessions: courseSessions, apiDown: false }));
  } catch (e) {
    res.status(500).render("course_detail", ctx({ course: null, sessions: [], apiDown: true }));
  }
});

// Login / Account (UI placeholder – napojíme na magic link neskôr)
app.get("/login", (req, res) => res.render("login", ctx()));
app.get("/account", (req, res) => res.render("account", ctx()));

// Legal & contact
app.get("/privacy", (req, res) => res.render("privacy", ctx()));
app.get("/terms", (req, res) => res.render("terms", ctx()));
app.get("/contact", (req, res) => res.render("contact", ctx()));

// Probe (pre CloudLinux)
app.get("/__probe", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200).send("OK");
});

const port = process.env.PORT || 3000;
const host = process.env.IP || "0.0.0.0";
app.listen(port, host, () => console.log(`Hormonize web running on ${host}:${port}`));