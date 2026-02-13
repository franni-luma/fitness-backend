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
      "INSERT INTO vitals(pulse, spo2) VALUES($1,$2)",
      [pulse, spo2]
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
  const range = req.query.range;

  try {
    
    // 24 Stunden 
    if (range === "24h") {

      const result = await pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('hour', time AT TIME ZONE 'Europe/Berlin') + INTERVAL '1 hour',
            'YYYY-MM-DD HH24:00') AS hour,
          AVG(pulse) AS pulse,
          AVG(spo2) AS spo2
        FROM vitals
        WHERE time >= DATE_TRUNC('hour', NOW()) - INTERVAL '24 hours'
        AND time < DATE_TRUNC('hour', NOW() AT TIME ZONE 'Europe/Berlin')
        GROUP BY hour
        ORDER BY hour
      `);

      return res.json(result.rows);
    }

    // 7 Tage 
    if (range === "7d") {
      const result = await pool.query(`
        SELECT
          DATE_TRUNC('day', time) AS day,
          AVG(pulse) AS pulse,
          AVG(spo2) AS spo2
        FROM vitals
        WHERE time >= NOW() - INTERVAL '7 days'
        GROUP BY day
        ORDER BY day ASC
      `);

      return res.json(result.rows);
    }


    // Standard 1h
    const result = await pool.query(`
      SELECT *
      FROM vitals
      ORDER BY id DESC
      LIMIT 200
    `);

    return res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).send("Database error");
  }
});




