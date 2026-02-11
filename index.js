const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());
app.use(express.static("public"));


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get("/", (req, res) => {
  res.send("Server läuft!");
});

app.post("/vitals", async (req, res) => {
  const { pulse, spo2, timestamp } = req.body;

  try {
    await pool.query(
      "INSERT INTO vitals(pulse, spo2, time) VALUES($1,$2,$3)",
      [pulse, spo2, timestamp]
    );
    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server gestartet");
});

app.get("/vitals", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM vitals ORDER BY id DESC LIMIT 500"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});

