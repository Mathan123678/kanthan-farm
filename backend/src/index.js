const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Simple helper for queries
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Birds CRUD
app.get('/api/birds', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM birds ORDER BY bird_id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch birds' });
  }
});

app.get('/api/birds/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM birds WHERE bird_id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bird not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch bird' });
  }
});

app.post('/api/birds', async (req, res) => {
  const {
    name,
    breed,
    weight,
    age,
    color,
    health_status,
    match_ready,
    buy_price,
    buy_date,
    seller,
    location,
    status,
    photo,
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO birds
       (name, breed, weight, age, color, health_status, match_ready, buy_price, buy_date, seller, location, status, photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING *`,
      [
        name,
        breed,
        weight,
        age,
        color,
        health_status,
        match_ready,
        buy_price,
        buy_date,
        seller,
        location,
        status,
        photo,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create bird' });
  }
});

app.put('/api/birds/:id', async (req, res) => {
  const {
    name,
    breed,
    weight,
    age,
    color,
    health_status,
    match_ready,
    buy_price,
    buy_date,
    seller,
    location,
    status,
    photo,
  } = req.body;

  try {
    const result = await query(
      `UPDATE birds SET
         name=$1, breed=$2, weight=$3, age=$4, color=$5,
         health_status=$6, match_ready=$7, buy_price=$8,
         buy_date=$9, seller=$10, location=$11, status=$12, photo=$13
       WHERE bird_id=$14
       RETURNING *`,
      [
        name,
        breed,
        weight,
        age,
        color,
        health_status,
        match_ready,
        buy_price,
        buy_date,
        seller,
        location,
        status,
        photo,
        req.params.id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bird not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update bird' });
  }
});

app.delete('/api/birds/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM birds WHERE bird_id = $1 RETURNING bird_id', [
      req.params.id,
    ]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bird not found' });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete bird' });
  }
});

// Sales with profit calculation
app.get('/api/sales', async (_req, res) => {
  try {
    const result = await query(
      `SELECT s.*, b.name as bird_name, b.buy_price
       FROM sales s
       LEFT JOIN birds b ON b.bird_id = s.bird_id
       ORDER BY s.selling_date DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

app.post('/api/sales', async (req, res) => {
  const {
    bird_id,
    buyer_name,
    buyer_state,
    selling_price,
    selling_date,
    transport_cost,
    other_expenses,
    notes,
  } = req.body;

  try {
    const birdRes = await query('SELECT buy_price FROM birds WHERE bird_id=$1', [bird_id]);
    if (birdRes.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid bird_id' });
    }
    const buyPrice = Number(birdRes.rows[0].buy_price || 0);
    const profit =
      Number(selling_price || 0) -
      buyPrice -
      Number(transport_cost || 0) -
      Number(other_expenses || 0);

    const result = await query(
      `INSERT INTO sales
       (bird_id, buyer_name, buyer_state, selling_price, selling_date, transport_cost, other_expenses, profit, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        bird_id,
        buyer_name,
        buyer_state,
        selling_price,
        selling_date,
        transport_cost,
        other_expenses,
        profit,
        notes,
      ]
    );

    // mark bird as sold
    await query('UPDATE birds SET status=$1 WHERE bird_id=$2', ['Sold', bird_id]);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// Expenses
app.get('/api/expenses', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { date, category, amount, description } = req.body;
  try {
    const result = await query(
      `INSERT INTO expenses (date, category, amount, description)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [date, category, amount, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Health records
app.get('/api/health-records', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM health_records ORDER BY vaccination_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

app.post('/api/health-records', async (req, res) => {
  const { bird_id, vaccination_date, medicine, doctor, notes } = req.body;
  try {
    const result = await query(
      `INSERT INTO health_records
       (bird_id, vaccination_date, medicine, doctor, notes)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [bird_id, vaccination_date, medicine, doctor, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create health record' });
  }
});

// Matches
app.get('/api/matches', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM matches ORDER BY match_date DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.post('/api/matches', async (req, res) => {
  const { bird_id, match_date, opponent, result: matchResult, notes } = req.body;
  try {
    const result = await query(
      `INSERT INTO matches (bird_id, match_date, opponent, result, notes)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [bird_id, match_date, opponent, matchResult, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create match record' });
  }
});

// Buyers
app.get('/api/buyers', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM buyers ORDER BY total_purchases DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

app.post('/api/buyers', async (req, res) => {
  const { name, phone, state } = req.body;
  try {
    const result = await query(
      `INSERT INTO buyers (name, phone, state, total_purchases)
       VALUES ($1,$2,$3,0)
       RETURNING *`,
      [name, phone, state]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create buyer' });
  }
});

// Simple dashboard stats
app.get('/api/dashboard/summary', async (_req, res) => {
  try {
    const [
      totalBirds,
      readyForMatch,
      soldBirds,
      totalInvestment,
      totalSales,
      totalProfit,
      matchesAgg,
    ] = await Promise.all([
      query('SELECT COUNT(*)::int as count FROM birds'),
      query("SELECT COUNT(*)::int as count FROM birds WHERE status = 'ReadyForMatch'"),
      query("SELECT COUNT(*)::int as count FROM birds WHERE status = 'Sold'"),
      query('SELECT COALESCE(SUM(buy_price),0)::numeric as total FROM birds'),
      query('SELECT COALESCE(SUM(selling_price),0)::numeric as total FROM sales'),
      query('SELECT COALESCE(SUM(profit),0)::numeric as total FROM sales'),
      query(
        `SELECT 
           COUNT(*)::int as matches_played,
           COALESCE(SUM(CASE WHEN result = 'Win' THEN 1 ELSE 0 END),0)::int as wins,
           COALESCE(SUM(CASE WHEN result = 'Loss' THEN 1 ELSE 0 END),0)::int as losses
         FROM matches`
      ),
    ]);

    res.json({
      totalBirds: totalBirds.rows[0].count,
      birdsReadyForMatch: readyForMatch.rows[0].count,
      birdsSold: soldBirds.rows[0].count,
      totalInvestment: totalInvestment.rows[0].total,
      totalSales: totalSales.rows[0].total,
      totalProfit: totalProfit.rows[0].total,
      matchesPlayed: matchesAgg.rows[0].matches_played,
      wins: matchesAgg.rows[0].wins,
      losses: matchesAgg.rows[0].losses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

// Simple monthly profit & sales
app.get('/api/dashboard/monthly', async (_req, res) => {
  try {
    const salesMonthly = await query(
      `SELECT
         DATE_TRUNC('month', selling_date) AS month,
         COALESCE(SUM(selling_price),0)::numeric AS total_sales,
         COALESCE(SUM(profit),0)::numeric AS total_profit
       FROM sales
       GROUP BY month
       ORDER BY month`
    );

    res.json(salesMonthly.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

// Inventory analytics
app.get('/api/analytics/inventory', async (_req, res) => {
  try {
    const [mostProfitableBird, mostProfitableBreed, mostActiveBuyer, totals] = await Promise.all([
      query(
        `SELECT b.bird_id, b.name, COALESCE(SUM(s.profit),0)::numeric AS total_profit
         FROM birds b
         JOIN sales s ON s.bird_id = b.bird_id
         GROUP BY b.bird_id, b.name
         ORDER BY total_profit DESC
         LIMIT 1`
      ),
      query(
        `SELECT b.breed, COALESCE(SUM(s.profit),0)::numeric AS total_profit
         FROM birds b
         JOIN sales s ON s.bird_id = b.bird_id
         GROUP BY b.breed
         ORDER BY total_profit DESC
         LIMIT 1`
      ),
      query(
        `SELECT buyer_name, COALESCE(COUNT(*),0)::int AS purchase_count
         FROM sales
         GROUP BY buyer_name
         ORDER BY purchase_count DESC
         LIMIT 1`
      ),
      query(
        `SELECT 
           (SELECT COALESCE(SUM(buy_price),0)::numeric FROM birds) AS total_investment,
           (SELECT COALESCE(SUM(profit),0)::numeric FROM sales) AS net_profit`
      ),
    ]);

    res.json({
      mostProfitableBird: mostProfitableBird.rows[0] || null,
      mostProfitableBreed: mostProfitableBreed.rows[0] || null,
      mostActiveBuyer: mostActiveBuyer.rows[0] || null,
      totalInvestment: totals.rows[0]?.total_investment || 0,
      netProfit: totals.rows[0]?.net_profit || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch inventory analytics' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Kanthan Farm API listening on port ${port}`);
});

