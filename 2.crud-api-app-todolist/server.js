const express = require("express");
const app = express();
const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
  res.send("Todo app is running");
});

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
