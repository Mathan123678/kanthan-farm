const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Standard URL decoded from Prisma API key
const DB_URL = "postgresql://postgres:postgres@localhost:51214/template1?sslmode=disable";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || DB_URL,
});

const logError = (err) => {
  const logMsg = `[${new Date().toISOString()}] ${err.message}\n${err.stack}\n\n`;
  fs.appendFileSync(path.join(__dirname, '../error.log'), logMsg);
  console.error(err);
};

// Simple helper for queries
async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (err) {
    logError(err);
    throw err;
  } finally {
    client.release();
  }
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Birds CRUD
app.get('/api/birds', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM birds ORDER BY bird_id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch birds' });
  }
});

app.post('/api/birds', async (req, res) => {
  const {
    name, breed, weight, age, color, health_status,
    match_ready, buy_price, buy_date, seller, location, status, photo
  } = req.body;

  try {
    const result = await query(
      `INSERT INTO birds 
       (name, breed, weight, age, color, health_status, match_ready, buy_price, buy_date, seller, location, status, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        name, breed, 
        parseFloat(weight) || 0, 
        parseInt(age) || 0, 
        color, health_status, 
        match_ready === true || match_ready === 'true',
        parseFloat(buy_price) || 0, 
        buy_date || new Date().toISOString().split('T')[0],
        seller || null, location || null, status || 'Growing', photo || null
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create bird' });
  }
});

app.put('/api/birds/:id', async (req, res) => {
  const {
    name, breed, weight, age, color, health_status,
    match_ready, buy_price, buy_date, seller, location, status, photo
  } = req.body;

  try {
    const result = await query(
      `UPDATE birds SET 
        name=$1, breed=$2, weight=$3, age=$4, color=$5, health_status=$6, 
        match_ready=$7, buy_price=$8, buy_date=$9, seller=$10, location=$11, 
        status=$12, photo=$13
       WHERE bird_id=$14 RETURNING *`,
      [
        name, breed, parseFloat(weight), parseInt(age), color, health_status,
        match_ready, parseFloat(buy_price), buy_date, seller, location, status, photo,
        req.params.id
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bird not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update bird' });
  }
});

app.delete('/api/birds/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM birds WHERE bird_id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Bird not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete bird' });
  }
});

// Sales
app.get('/api/sales', async (_req, res) => {
  try {
    const result = await query(`
      SELECT s.*, b.name as bird_name, b.buy_price 
      FROM sales s 
      LEFT JOIN birds b ON b.bird_id = s.bird_id 
      ORDER BY s.selling_date DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

app.post('/api/sales', async (req, res) => {
  const { bird_id, buyer_name, buyer_state, selling_price, selling_date, transport_cost, other_expenses, notes } = req.body;
  try {
    const birdRes = await query('SELECT buy_price FROM birds WHERE bird_id=$1', [bird_id]);
    const buyPrice = birdRes.rows[0]?.buy_price || 0;
    const profit = Number(selling_price) - Number(buyPrice) - Number(transport_cost || 0) - Number(other_expenses || 0);

    const result = await query(
      `INSERT INTO sales (bird_id, buyer_name, buyer_state, selling_price, selling_date, transport_cost, other_expenses, profit, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [bird_id, buyer_name, buyer_state, selling_price, selling_date, transport_cost, other_expenses, profit, notes]
    );
    await query('UPDATE birds SET status=$1 WHERE bird_id=$2', ['Sold', bird_id]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// Expenses
app.get('/api/expenses', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { date, category, amount, description } = req.body;
  try {
    const result = await query(
      'INSERT INTO expenses (date, category, amount, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [date, category, amount, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// Health records
app.get('/api/health-records', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM health_records ORDER BY vaccination_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

app.post('/api/health-records', async (req, res) => {
  const { bird_id, vaccination_date, medicine, doctor, notes } = req.body;
  try {
    const result = await query(
      'INSERT INTO health_records (bird_id, vaccination_date, medicine, doctor, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [bird_id, vaccination_date, medicine, doctor, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create health record' });
  }
});

// Matches
app.get('/api/matches', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM matches ORDER BY match_date DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.post('/api/matches', async (req, res) => {
  const { bird_id, match_date, opponent, result, notes } = req.body;
  try {
    const resultMatch = await query(
      'INSERT INTO matches (bird_id, match_date, opponent, result, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [bird_id, match_date, opponent, result, notes]
    );
    res.status(201).json(resultMatch.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create match record' });
  }
});

// Buyers
app.get('/api/buyers', async (_req, res) => {
  try {
    const result = await query('SELECT * FROM buyers ORDER BY total_purchases DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

app.post('/api/buyers', async (req, res) => {
  const { name, phone, state } = req.body;
  try {
    const result = await query(
      'INSERT INTO buyers (name, phone, state, total_purchases) VALUES ($1, $2, $3, 0) RETURNING *',
      [name, phone, state]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create buyer' });
  }
});

// Dashboard stats
app.get('/api/dashboard/summary', async (_req, res) => {
  try {
    const [totalBirds, readyForMatch, soldBirds, totalInvestment, totalSales, totalProfit, matchesAgg] = await Promise.all([
      query('SELECT COUNT(*)::int as count FROM birds'),
      query("SELECT COUNT(*)::int as count FROM birds WHERE status = 'ReadyForMatch'"),
      query("SELECT COUNT(*)::int as count FROM birds WHERE status = 'Sold'"),
      query('SELECT COALESCE(SUM(buy_price),0)::numeric as total FROM birds'),
      query('SELECT COALESCE(SUM(selling_price),0)::numeric as total FROM sales'),
      query('SELECT COALESCE(SUM(profit),0)::numeric as total FROM sales'),
      query("SELECT COUNT(*)::int as played, SUM(CASE WHEN result='Win' THEN 1 ELSE 0 END)::int as wins FROM matches")
    ]);

    res.json({
      totalBirds: totalBirds.rows[0].count,
      birdsReadyForMatch: readyForMatch.rows[0].count,
      birdsSold: soldBirds.rows[0].count,
      totalInvestment: totalInvestment.rows[0].total,
      totalSales: totalSales.rows[0].total,
      totalProfit: totalProfit.rows[0].total,
      matchesPlayed: matchesAgg.rows[0].played,
      wins: matchesAgg.rows[0].wins,
      losses: matchesAgg.rows[0].played - matchesAgg.rows[0].wins
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

app.get('/api/dashboard/monthly', async (_req, res) => {
  try {
    const result = await query(`
      SELECT DATE_TRUNC('month', selling_date) AS month, SUM(selling_price) as total_sales, SUM(profit) as total_profit
      FROM sales GROUP BY month ORDER BY month
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

app.get('/api/analytics/inventory', async (_req, res) => {
  try {
    const [profitableBird, profitableBreed, activeBuyer, totals] = await Promise.all([
      query('SELECT b.name, SUM(s.profit) as profit FROM birds b JOIN sales s ON s.bird_id=b.bird_id GROUP BY b.bird_id, b.name ORDER BY profit DESC LIMIT 1'),
      query('SELECT b.breed, SUM(s.profit) as profit FROM birds b JOIN sales s ON s.bird_id=b.bird_id GROUP BY b.breed ORDER BY profit DESC LIMIT 1'),
      query('SELECT buyer_name, COUNT(*) as count FROM sales GROUP BY buyer_name ORDER BY count DESC LIMIT 1'),
      query('SELECT (SELECT SUM(buy_price) FROM birds) as investment, (SELECT SUM(profit) FROM sales) as net_profit')
    ]);
    res.json({
      mostProfitableBird: profitableBird.rows[0],
      mostProfitableBreed: profitableBreed.rows[0],
      mostActiveBuyer: activeBuyer.rows[0],
      totalInvestment: totals.rows[0].investment,
      netProfit: totals.rows[0].net_profit
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch inventory analytics' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Kanthan Farm API listening on port ${port}`);
});
