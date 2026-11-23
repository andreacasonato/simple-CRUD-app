// =============================================================
// To-do app: Express server + JSON API + MongoDB
// Start it with:  npm run dev
// (runs: node --watch --env-file=.env server.js)
// =============================================================

// ---------- 1. Load the libraries ----------
// express: the web server framework
const express = require("express");
// MongoClient: connects to MongoDB
// ObjectId: the special type MongoDB uses for every document's _id
const { MongoClient, ObjectId } = require("mongodb");

// ---------- 2. Create the app ----------
const app = express();
// Use the PORT from the environment if one is set (hosting services do this),
// otherwise use 8000 on your own computer
const PORT = process.env.PORT || 8000;

// ---------- 3. Middleware (runs on every request, before the routes) ----------
// Reads JSON request bodies and puts the data in req.body
// (without it, req.body is undefined in Express 5)
app.use(express.json());
// Sends files from the "public" folder to the browser.
// Visiting http://localhost:8000/ automatically sends public/index.html
app.use(express.static(__dirname + "/public"));

// ---------- 4. Helper ----------
// The _id arrives in the URL as plain text, e.g. "6b03fcfc10129de94857ebcc",
// but MongoDB stores it as an ObjectId. This converts the text to an ObjectId,
// or returns null if the text is not a valid id (e.g. "abc"), so we never crash.
function toObjectId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

// ---------- 5. Connect to MongoDB, then set up the routes ----------
// process.env.MONGODB_URI is your connection string, loaded from .env.
// Connecting takes time, so connect() returns a promise:
// .then() runs once connected, .catch() runs if the connection fails.
MongoClient.connect(process.env.MONGODB_URI)
  .then((client) => {
    console.log("Connected to Database");

    // Pick the database and the collection (MongoDB creates both
    // automatically the first time a to-do is saved)
    const db = client.db("todo-app");
    const todos = db.collection("todos");

    // The routes live inside .then() because they need "todos",
    // which only exists after the connection succeeds.
    //
    // Each route uses "async" + "await": await waits for the database
    // and then continues on the next line. If the database throws an error,
    // Express 5 catches it and replies with status 500.

    // ---------- READ all ----------
    // GET /api/todos  -> sends back an array with every to-do
    app.get("/api/todos", async (req, res) => {
      const list = await todos.find().toArray(); // find() with no filter = all documents
      res.json(list); // send the array as JSON (status 200)
    });

    // ---------- CREATE ----------
    // POST /api/todos   body: { "task": "Buy milk" }
    app.post("/api/todos", async (req, res) => {
      // ?. = if req.body is missing, give undefined instead of crashing
      const task = req.body?.task;

      // Validate: task must be text and not blank.
      // 400 = "bad request"; return stops the function here.
      if (typeof task !== "string" || task.trim() === "") {
        return res.status(400).json({ error: "task is required" });
      }

      // Build the document ourselves (never save req.body directly,
      // or anyone could add any fields they like).
      // Every new to-do starts as not done; trim() removes extra spaces.
      const todo = { task: task.trim(), done: false };

      await todos.insertOne(todo); // save it; the driver adds todo._id
      res.status(201).json(todo); // 201 = "created"; send back the new to-do
    });

    // ---------- READ one ----------
    // GET /api/todos/:id  -> one to-do, found by its _id
    // ":id" is a route parameter: whatever is in the URL there arrives as req.params.id
    app.get("/api/todos/:id", async (req, res) => {
      const _id = toObjectId(req.params.id);
      if (!_id) return res.status(400).json({ error: "invalid id" });

      // { _id } is shorthand for { _id: _id } = "the document with this id"
      const todo = await todos.findOne({ _id }); // the document, or null
      if (!todo) return res.status(404).json({ error: "todo not found" }); // 404 = not found
      res.json(todo);
    });

    // ---------- UPDATE ----------
    // PATCH /api/todos/:id   body: { "done": true } and/or { "task": "New text" }
    // PATCH (not PUT) because we change only part of the to-do
    app.patch("/api/todos/:id", async (req, res) => {
      const _id = toObjectId(req.params.id);
      if (!_id) return res.status(400).json({ error: "invalid id" });

      // Take only these two fields from the body (anything else is ignored).
      // ?? {} = if there is no body, use an empty object instead.
      const { task, done } = req.body ?? {};

      // Collect the valid changes here
      const changes = {};

      // task was sent: it must be non-empty text
      if (task !== undefined) {
        if (typeof task !== "string" || task.trim() === "") {
          return res
            .status(400)
            .json({ error: "task must be a non-empty string" });
        }
        changes.task = task.trim();
      }

      // done was sent: it must be a real true/false (not the text "yes")
      if (done !== undefined) {
        if (typeof done !== "boolean") {
          return res.status(400).json({ error: "done must be true or false" });
        }
        changes.done = done;
      }

      // Nothing valid to change
      if (Object.keys(changes).length === 0) {
        return res.status(400).json({ error: "send task and/or done" });
      }

      // Find the to-do by _id and change only the fields in "changes" ($set).
      // returnDocument: 'after' = give back the updated version, not the old one.
      // Returns the document, or null if no to-do has this _id.
      const updated = await todos.findOneAndUpdate(
        { _id },
        { $set: changes },
        { returnDocument: "after" },
      );
      if (!updated) return res.status(404).json({ error: "todo not found" });
      res.json(updated);
    });

    // ---------- DELETE ----------
    // DELETE /api/todos/:id
    app.delete("/api/todos/:id", async (req, res) => {
      const _id = toObjectId(req.params.id);
      if (!_id) return res.status(400).json({ error: "invalid id" });

      // deletedCount says how many documents were removed: 1, or 0 if none matched
      const result = await todos.deleteOne({ _id });
      if (result.deletedCount === 0)
        return res.status(404).json({ error: "todo not found" });

      res.status(204).end(); // 204 = "done, nothing to send back"
    });

    // ---------- 6. Start the server ----------
    // Only after the database is connected, so no request arrives too early
    app.listen(PORT, () => console.log(`listening on ${PORT}`));
  })
  // If the connection fails, show the error in the terminal
  .catch((error) => console.error(error));
