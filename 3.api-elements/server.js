// =============================================================
// Element lookup API: Express server, data kept in this file (no database)
// Start it with:  npm run dev   (runs: node --watch server.js)
// =============================================================

const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

// Sends files from the "public" folder (index.html, main.js) to the browser
app.use(express.static(__dirname + "/public"));

// ---------- The data ----------
// An object: each key is an element name in lowercase,
// each value is an object with that element's details.
// This is my "database"
const elements = {
  hydrogen: {
    name: "Hydrogen",
    symbol: "H",
    atomicNumber: 1,
    category: "nonmetal",
  },
  helium: {
    name: "Helium",
    symbol: "He",
    atomicNumber: 2,
    category: "noble gas",
  },
  carbon: {
    name: "Carbon",
    symbol: "C",
    atomicNumber: 6,
    category: "nonmetal",
  },
  nitrogen: {
    name: "Nitrogen",
    symbol: "N",
    atomicNumber: 7,
    category: "nonmetal",
  },
  oxygen: {
    name: "Oxygen",
    symbol: "O",
    atomicNumber: 8,
    category: "nonmetal",
  },
  neon: { name: "Neon", symbol: "Ne", atomicNumber: 10, category: "noble gas" },
  sodium: {
    name: "Sodium",
    symbol: "Na",
    atomicNumber: 11,
    category: "alkali metal",
  },
  iron: {
    name: "Iron",
    symbol: "Fe",
    atomicNumber: 26,
    category: "transition metal",
  },
  gold: {
    name: "Gold",
    symbol: "Au",
    atomicNumber: 79,
    category: "transition metal",
  },
};

// ---------- READ all ----------
// GET /api/elements  -> the whole object as JSON
app.get("/api/elements", (req, res) => {
  res.json(elements);
});

// ---------- READ one ----------
// GET /api/elements/:name  e.g. /api/elements/oxygen
app.get("/api/elements/:name", (req, res) => {
  // req.params.name = the text in the URL; lowercase it so "Oxygen" and "OXYGEN" also match
  const name = req.params.name.toLowerCase();

  if (elements[name]) {
    res.json(elements[name]); // found: send it (status 200)
  } else {
    res.status(404).json({ error: `No element called "${req.params.name}"` }); // not found
  }
});

app.listen(PORT, () => console.log(`listening on ${PORT}`));
