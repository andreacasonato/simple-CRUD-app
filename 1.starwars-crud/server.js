// server.js
process.loadEnvFile(); // loads .env into process.env (built into Node 20.12+)

const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.set("view engine", "ejs");
const client = new MongoClient(process.env.MONGODB_URI);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

async function start() {
  await client.connect();
  console.log("Connected to Database");

  const db = client.db("star-wars-quotes");
  const quotesCollection = db.collection("quotes");

  app.get("/", async (req, res) => {
    const quotes = await quotesCollection.find().toArray();
    res.render("index", { quotes });
  });

  app.post("/quotes", async (req, res) => {
    const result = await quotesCollection.insertOne(req.body);
    console.log(result);
    res.redirect("/");
  });

  app.put("/quotes", async (req, res) => {
    const result = await quotesCollection.findOneAndUpdate(
      { name: "Yoda" },
      {
        $set: {
          name: req.body.name,
          quote: req.body.quote,
        },
      },
      { upsert: true },
    );
    console.log(result);
    res.json("Success");
  });

  app.delete("/quotes", async (req, res) => {
    const result = await quotesCollection.deleteOne({ name: req.body.name });

    if (result.deletedCount === 0) {
      return res.json("No quote to delete");
    }
    res.json("Deleted Darth Vader's quote");
  });

  app.listen(3000, () => {
    console.log("listening on 3000");
  });
}

start().catch(console.error);
