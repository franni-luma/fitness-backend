const express = require("express");
const { Pool } = require("pg");

const app = express();
app.use(express.json());

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
      "INSERT INTO vitals(pulse, spo2, ts) VALUES($1,$2,to_timestamp($3))",
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
