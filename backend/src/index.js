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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const logError = (err, context = '') => {
  const msg = `[${new Date().toISOString()}] ${context}: ${err.message}\n`;
  fs.appendFileSync(path.join(__dirname, '../error.log'), msg);
  console.error('[ERROR]', context, err.message);
};

async function query(text, params) {
  const client = await pool.connect();
  try {
    return await client.query(text, params);
  } finally {
    client.release();
  }
}

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Birds ─────────────────────────────────────────────────────────────────

app.get('/api/birds', async (_req, res) => {
  try {
    const r = await query('SELECT * FROM birds ORDER BY bird_id DESC');
    res.json(r.rows);
  } catch (err) {
    logError(err, 'GET /api/birds');
    res.status(500).json({ error: 'Failed to fetch birds' });
  }
});

app.get('/api/birds/:id', async (req, res) => {
  try {
    const r = await query('SELECT * FROM birds WHERE bird_id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Bird not found' });
    res.json(r.rows[0]);
  } catch (err) {
    logError(err, 'GET /api/birds/:id');
    res.status(500).json({ error: 'Failed to fetch bird' });
  }
});

app.post('/api/birds', async (req, res) => {
  try {
    const { name, breed, weight, age, color, health_status, match_ready, buy_price, buy_date, seller, location, status, photo } = req.body;
    const r = await query(
      `INSERT INTO birds (name, breed, weight, age, color, health_status, match_ready, buy_price, buy_date, seller, location, status, photo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        name,
        breed || null,
        weight != null ? parseFloat(weight) : null,
        age != null ? parseInt(age) : null,
        color || null,
        health_status || 'Good',
        match_ready === true || match_ready === 'true',
        buy_price != null ? parseFloat(buy_price) : null,
        buy_date || null,
        seller || null,
        location || null,
        status || 'Growing',
        photo || null,
      ]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    logError(err, 'POST /api/birds');
    res.status(500).json({ error: 'Failed to create bird' });
  }
});

app.put('/api/birds/:id', async (req, res) => {
  try {
    const { name, breed, weight, age, color, health_status, match_ready, buy_price, buy_date, seller, location, status, photo } = req.body;
    const r = await query(
      `UPDATE birds SET name=$1, breed=$2, weight=$3, age=$4, color=$5, health_status=$6,
       match_ready=$7, buy_price=$8, buy_date=$9, seller=$10, location=$11, status=$12, photo=$13
       WHERE bird_id=$14 RETURNING *`,
      [name, breed || null, parseFloat(weight) || null, parseInt(age) || null,
       color || null, health_status || 'Good', match_ready === true || match_ready === 'true',
       parseFloat(buy_price) || null, buy_date || null, seller || null, location || null,
       status || 'Growing', photo || null, req.params.id]
    );
    if (!r.rows.length) return res.status(404).json({ error: 'Bird not found' });
    res.json(r.rows[0]);
  } catch (err) {
    logError(err, 'PUT /api/birds/:id');
    res.status(500).json({ error: 'Failed to update bird' });
  }
});

app.delete('/api/birds/:id', async (req, res) => {
  try {
    await query('DELETE FROM birds WHERE bird_id=$1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    logError(err, 'DELETE /api/birds/:id');
    res.status(500).json({ error: 'Failed to delete bird' });
  }
});

// ─── Sales ─────────────────────────────────────────────────────────────────

app.get('/api/sales', async (_req, res) => {
  try {
    const r = await query(`
      SELECT s.*, b.name as bird_name, b.buy_price as bird_buy_price
      FROM sales s LEFT JOIN birds b ON b.bird_id=s.bird_id
      ORDER BY s.selling_date DESC
    `);
    res.json(r.rows);
  } catch (err) {
    logError(err, 'GET /api/sales');
    res.status(500).json({ error: 'Failed to fetch sales' });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    const { bird_id, buyer_name, buyer_state, selling_price, selling_date, transport_cost, other_expenses, notes } = req.body;
    let profit = parseFloat(selling_price || 0) - parseFloat(transport_cost || 0) - parseFloat(other_expenses || 0);
    if (bird_id) {
      const br = await query('SELECT buy_price FROM birds WHERE bird_id=$1', [bird_id]);
      if (br.rows[0]?.buy_price) profit -= parseFloat(br.rows[0].buy_price);
    }
    const r = await query(
      `INSERT INTO sales (bird_id, buyer_name, buyer_state, selling_price, selling_date, transport_cost, other_expenses, profit, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [bird_id || null, buyer_name || null, buyer_state || null, parseFloat(selling_price || 0),
       selling_date || null, parseFloat(transport_cost || 0), parseFloat(other_expenses || 0), profit, notes || null]
    );
    if (bird_id) await query("UPDATE birds SET status='Sold' WHERE bird_id=$1", [bird_id]);
    res.status(201).json(r.rows[0]);
  } catch (err) {
    logError(err, 'POST /api/sales');
    res.status(500).json({ error: 'Failed to record sale' });
  }
});

// ─── Expenses ───────────────────────────────────────────────────────────────

app.get('/api/expenses', async (_req, res) => {
  try {
    const r = await query('SELECT * FROM expenses ORDER BY date DESC');
    res.json(r.rows);
  } catch (err) {
    logError(err, 'GET /api/expenses');
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { date, category, amount, description } = req.body;
    const r = await query(
      'INSERT INTO expenses (date, category, amount, description) VALUES ($1,$2,$3,$4) RETURNING *',
      [date || new Date().toISOString().split('T')[0], category || 'Other', parseFloat(amount || 0), description || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    logError(err, 'POST /api/expenses');
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

// ─── Health Records ─────────────────────────────────────────────────────────

app.get('/api/health-records', async (_req, res) => {
  try {
    const r = await query('SELECT * FROM health_records ORDER BY vaccination_date DESC');
    res.json(r.rows);
  } catch (err) {
    logError(err, 'GET /api/health-records');
    res.status(500).json({ error: 'Failed to fetch health records' });
  }
});

app.post('/api/health-records', async (req, res) => {
  try {
    const { bird_id, vaccination_date, medicine, doctor, notes } = req.body;
    const r = await query(
      'INSERT INTO health_records (bird_id, vaccination_date, medicine, doctor, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [bird_id || null, vaccination_date || null, medicine || null, doctor || null, notes || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    logError(err, 'POST /api/health-records');
    res.status(500).json({ error: 'Failed to create health record' });
  }
});

// ─── Matches ────────────────────────────────────────────────────────────────

app.get('/api/matches', async (_req, res) => {
  try {
    const r = await query('SELECT * FROM matches ORDER BY match_date DESC');
    res.json(r.rows);
  } catch (err) {
    logError(err, 'GET /api/matches');
    res.status(500).json({ error: 'Failed to fetch matches' });
  }
});

app.post('/api/matches', async (req, res) => {
  try {
    const { bird_id, match_date, opponent, result, notes } = req.body;
    const r = await query(
      'INSERT INTO matches (bird_id, match_date, opponent, result, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [bird_id || null, match_date || null, opponent || null, result || null, notes || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    logError(err, 'POST /api/matches');
    res.status(500).json({ error: 'Failed to create match record' });
  }
});

// ─── Buyers ─────────────────────────────────────────────────────────────────

app.get('/api/buyers', async (_req, res) => {
  try {
    const r = await query('SELECT * FROM buyers ORDER BY total_purchases DESC');
    res.json(r.rows);
  } catch (err) {
    logError(err, 'GET /api/buyers');
    res.status(500).json({ error: 'Failed to fetch buyers' });
  }
});

app.post('/api/buyers', async (req, res) => {
  try {
    const { name, phone, state } = req.body;
    const r = await query(
      'INSERT INTO buyers (name, phone, state, total_purchases) VALUES ($1,$2,$3,0) RETURNING *',
      [name, phone || null, state || null]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    logError(err, 'POST /api/buyers');
    res.status(500).json({ error: 'Failed to create buyer' });
  }
});

// ─── Dashboard ──────────────────────────────────────────────────────────────

app.get('/api/dashboard/summary', async (_req, res) => {
  try {
    const [tot, rdy, sold, inv, sal, prof, mat] = await Promise.all([
      query('SELECT COUNT(*)::int cnt FROM birds'),
      query("SELECT COUNT(*)::int cnt FROM birds WHERE status='ReadyForMatch'"),
      query("SELECT COUNT(*)::int cnt FROM birds WHERE status='Sold'"),
      query('SELECT COALESCE(SUM(buy_price),0)::numeric total FROM birds'),
      query('SELECT COALESCE(SUM(selling_price),0)::numeric total FROM sales'),
      query('SELECT COALESCE(SUM(profit),0)::numeric total FROM sales'),
      query("SELECT COUNT(*)::int played, COALESCE(SUM(CASE WHEN result='Win' THEN 1 ELSE 0 END),0)::int wins FROM matches"),
    ]);
    res.json({
      totalBirds: tot.rows[0].cnt,
      birdsReadyForMatch: rdy.rows[0].cnt,
      birdsSold: sold.rows[0].cnt,
      totalInvestment: inv.rows[0].total,
      totalSales: sal.rows[0].total,
      totalProfit: prof.rows[0].total,
      matchesPlayed: mat.rows[0].played,
      wins: mat.rows[0].wins,
      losses: mat.rows[0].played - mat.rows[0].wins,
    });
  } catch (err) {
    logError(err, 'GET /api/dashboard/summary');
    res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

app.get('/api/dashboard/monthly', async (_req, res) => {
  try {
    const r = await query(`
      SELECT DATE_TRUNC('month', selling_date) AS month,
             COALESCE(SUM(selling_price),0)::numeric AS total_sales,
             COALESCE(SUM(profit),0)::numeric AS total_profit
      FROM sales GROUP BY month ORDER BY month
    `);
    res.json(r.rows);
  } catch (err) {
    logError(err, 'GET /api/dashboard/monthly');
    res.status(500).json({ error: 'Failed to fetch monthly stats' });
  }
});

app.get('/api/analytics/inventory', async (_req, res) => {
  try {
    const [b, br, bu, tot, net] = await Promise.all([
      query('SELECT b.name, COALESCE(SUM(s.profit),0)::numeric profit FROM birds b JOIN sales s ON s.bird_id=b.bird_id GROUP BY b.bird_id, b.name ORDER BY profit DESC LIMIT 1'),
      query('SELECT b.breed, COALESCE(SUM(s.profit),0)::numeric profit FROM birds b JOIN sales s ON s.bird_id=b.bird_id GROUP BY b.breed ORDER BY profit DESC LIMIT 1'),
      query('SELECT buyer_name, COUNT(*)::int cnt FROM sales GROUP BY buyer_name ORDER BY cnt DESC LIMIT 1'),
      query('SELECT COALESCE(SUM(buy_price),0)::numeric total FROM birds'),
      query('SELECT COALESCE(SUM(profit),0)::numeric total FROM sales'),
    ]);
    res.json({
      mostProfitableBird: b.rows[0] || null,
      mostProfitableBreed: br.rows[0] || null,
      mostActiveBuyer: bu.rows[0] || null,
      totalInvestment: tot.rows[0].total,
      netProfit: net.rows[0].total,
    });
  } catch (err) {
    logError(err, 'GET /api/analytics/inventory');
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Kanthan Farm API listening on port ${port}`));
