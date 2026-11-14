// server.js
const express = require("express");
const app = express();

// Reads form data and puts it on req.body. Must come BEFORE the routes.
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/quotes", (req, res) => {
  console.log(req.body);
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("listening on 3000");
});
