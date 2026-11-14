// server.js
process.loadEnvFile(); // loads .env into process.env (built into Node 20.12+)

const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
const client = new MongoClient(process.env.MONGODB_URI);

app.use(express.urlencoded({ extended: true }));

async function start() {
  await client.connect();
  console.log("Connected to Database");

  const db = client.db("star-wars-quotes");
  const quotesCollection = db.collection("quotes");

  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
  });

  app.post("/quotes", async (req, res) => {
    const result = await quotesCollection.insertOne(req.body);
    console.log(result);
    res.redirect("/");
  });

  app.listen(3000, () => {
    console.log("listening on 3000");
  });
}

start().catch(console.error);
