// =============================================================
// Rap Names: full-stack CRUD app (Express + MongoDB + EJS)
// Start it with:  npm run dev   (runs: node --watch --env-file=.env server.js)
// =============================================================

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 8000;

// ---------- Settings & middleware (before the routes) ----------
app.set("view engine", "ejs"); // build pages from views/*.ejs
app.use(express.static(__dirname + "/public")); // serve public/main.js to the browser
app.use(express.urlencoded({ extended: true })); // form data   -> req.body (CREATE)
app.use(express.json()); // JSON data   -> req.body (UPDATE, DELETE)

// Text from a form field, trimmed; '' if it's missing or not text
function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

// The _id arrives as text; MongoDB needs an ObjectId (null if the text isn't a valid id)
function toObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

MongoClient.connect(process.env.MONGODB_URI)
  .then((client) => {
    console.log("Connected to Database");
    const db = client.db("rap-names");
    const rappers = db.collection("rappers");

    // ---------- READ ----------
    // GET /  -> get every rapper, plug them into the EJS template, send back the HTML
    app.get("/", async (req, res) => {
      const info = await rappers.find().sort({ likes: -1 }).toArray(); // most liked first
      res.render("index.ejs", { info }); // { info: info } info is the array of objects
    });

    // ---------- CREATE ----------
    // POST /addRapper  <- the form (action="/addRapper" method="POST")
    app.post("/addRapper", async (req, res) => {
      const stageName = clean(req.body?.stageName);
      const birthName = clean(req.body?.birthName);

      if (stageName && birthName) {
        // only save if both were filled in
        await rappers.insertOne({ stageName, birthName, likes: 0 });
        console.log("Rapper Added");
      }
      res.redirect("/"); // tell the browser to reload the page
    });

    // ---------- UPDATE ----------
    // PUT /addOneLike   body: { "id": "<the rapper's _id>" }
    app.put("/addOneLike", async (req, res) => {
      const _id = toObjectId(req.body?.id);
      if (!_id) return res.status(400).json({ error: "invalid id" });

      // $inc adds 1 to "likes" inside the database
      const result = await rappers.updateOne({ _id }, { $inc: { likes: 1 } });
      if (result.matchedCount === 0)
        return res.status(404).json({ error: "rapper not found" });

      console.log("Like Added");
      res.json("Like Added");
    });

    // ---------- DELETE ----------
    // DELETE /deleteRapper   body: { "id": "<the rapper's _id>" }
    app.delete("/deleteRapper", async (req, res) => {
      const _id = toObjectId(req.body?.id);
      if (!_id) return res.status(400).json({ error: "invalid id" });

      const result = await rappers.deleteOne({ _id });
      if (result.deletedCount === 0)
        return res.status(404).json({ error: "rapper not found" });

      console.log("Rapper Deleted");
      res.json("Rapper Deleted");
    });

    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  })
  .catch((error) => console.error(error));
