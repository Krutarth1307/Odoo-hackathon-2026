const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Serve all HTML / CSS / JS files in the project root ─────────────────────
app.use(express.static(path.join(__dirname)));

// ── MySQL connection ─────────────────────────────────────────────────────────
const db = mysql.createConnection({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'VendorBridge',
  port:     process.env.DB_PORT     || 3306
});

db.connect((err) => {
  if (err) { console.error('❌ DB connection error:', err.message); return; }
  console.log('✅ MySQL connected to', process.env.DB_NAME);
});

// ── Helper: send a clean error response ─────────────────────────────────────
function dbErr(res, err) {
  console.error(err);
  res.status(500).json({ success: false, message: err.message });
}

// ═══════════════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════════════

// POST /api/login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  db.query(
    'SELECT id, name, email, role FROM users WHERE email = ? AND password = ?',
    [email, password],
    (err, rows) => {
      if (err) return dbErr(res, err);
      if (rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }
      res.json({ success: true, user: rows[0] });
    }
  );
});

// ═══════════════════════════════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════════════════════════════

// GET /api/dashboard
app.get('/api/dashboard', (req, res) => {
  db.query(
    `SELECT
      (SELECT COUNT(*) FROM vendors)                          AS totalVendors,
      (SELECT COUNT(*) FROM rfqs WHERE status='OPEN')        AS activeRFQs,
      (SELECT COUNT(*) FROM approvals WHERE status='PENDING') AS pendingApprovals,
      (SELECT COUNT(*) FROM invoices)                        AS totalInvoices`,
    (err, rows) => {
      if (err) return dbErr(res, err);
      res.json(rows[0]);
    }
  );
});

// ═══════════════════════════════════════════════════════════════════
//  VENDORS
// ═══════════════════════════════════════════════════════════════════

// GET /api/vendors
app.get('/api/vendors', (req, res) => {
  db.query('SELECT * FROM vendors ORDER BY id', (err, rows) => {
    if (err) return dbErr(res, err);
    res.json(rows);
  });
});

// POST /api/vendors
app.post('/api/vendors', (req, res) => {
  const { vendor_name, gst_number, category, contact_number, email, status } = req.body;
  if (!vendor_name) return res.status(400).json({ success: false, message: 'vendor_name required' });
  db.query(
    'INSERT INTO vendors (vendor_name, gst_number, category, contact_number, email, status) VALUES (?,?,?,?,?,?)',
    [vendor_name, gst_number || null, category || null, contact_number || null, email || null, status || 'ACTIVE'],
    (err, result) => {
      if (err) return dbErr(res, err);
      res.json({ success: true, id: result.insertId });
    }
  );
});

// PUT /api/vendors/:id
app.put('/api/vendors/:id', (req, res) => {
  const { vendor_name, gst_number, category, contact_number, email, status } = req.body;
  db.query(
    'UPDATE vendors SET vendor_name=?, gst_number=?, category=?, contact_number=?, email=?, status=? WHERE id=?',
    [vendor_name, gst_number, category, contact_number, email, status, req.params.id],
    (err) => {
      if (err) return dbErr(res, err);
      res.json({ success: true });
    }
  );
});

// DELETE /api/vendors/:id
app.delete('/api/vendors/:id', (req, res) => {
  db.query('DELETE FROM vendors WHERE id=?', [req.params.id], (err) => {
    if (err) return dbErr(res, err);
    res.json({ success: true });
  });
});

// ═══════════════════════════════════════════════════════════════════
//  USERS (Resources)
// ═══════════════════════════════════════════════════════════════════

// GET /api/users
app.get('/api/users', (req, res) => {
  db.query('SELECT id, name, email, role FROM users ORDER BY id', (err, rows) => {
    if (err) return dbErr(res, err);
    res.json(rows);
  });
});

// POST /api/users
app.post('/api/users', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return res.status(400).json({ success: false, message: 'name, email, password and role required' });
  }
  db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
    [name, email, password, role],
    (err, result) => {
      if (err) return dbErr(res, err);
      res.json({ success: true, id: result.insertId });
    }
  );
});

// PUT /api/users/:id
app.put('/api/users/:id', (req, res) => {
  const { name, email, role } = req.body;
  db.query(
    'UPDATE users SET name=?, email=?, role=? WHERE id=?',
    [name, email, role, req.params.id],
    (err) => {
      if (err) return dbErr(res, err);
      res.json({ success: true });
    }
  );
});

// DELETE /api/users/:id
app.delete('/api/users/:id', (req, res) => {
  db.query('DELETE FROM users WHERE id=?', [req.params.id], (err) => {
    if (err) return dbErr(res, err);
    res.json({ success: true });
  });
});

// ═══════════════════════════════════════════════════════════════════
//  RFQs
// ═══════════════════════════════════════════════════════════════════

// GET /api/rfqs
app.get('/api/rfqs', (req, res) => {
  db.query('SELECT * FROM rfqs ORDER BY id', (err, rows) => {
    if (err) return dbErr(res, err);
    res.json(rows);
  });
});

// POST /api/rfqs
app.post('/api/rfqs', (req, res) => {
  const { title, description, quantity, deadline, status, created_by } = req.body;
  db.query(
    'INSERT INTO rfqs (title, description, quantity, deadline, status, created_by) VALUES (?,?,?,?,?,?)',
    [title, description, quantity, deadline, status || 'OPEN', created_by],
    (err, result) => {
      if (err) return dbErr(res, err);
      res.json({ success: true, id: result.insertId });
    }
  );
});

// ═══════════════════════════════════════════════════════════════════
//  QUOTATIONS
// ═══════════════════════════════════════════════════════════════════

// GET /api/quotations
app.get('/api/quotations', (req, res) => {
  db.query(
    `SELECT q.*, r.title AS rfq_title, v.vendor_name 
     FROM quotations q 
     LEFT JOIN rfqs r ON q.rfq_id = r.id 
     LEFT JOIN vendors v ON q.vendor_id = v.id 
     ORDER BY q.id`,
    (err, rows) => {
      if (err) return dbErr(res, err);
      res.json(rows);
    }
  );
});

// ═══════════════════════════════════════════════════════════════════
//  APPROVALS
// ═══════════════════════════════════════════════════════════════════

// GET /api/approvals
app.get('/api/approvals', (req, res) => {
  db.query(
    `SELECT a.*, r.title AS rfq_title, v.vendor_name, q.price 
     FROM approvals a 
     LEFT JOIN quotations q ON a.quotation_id = q.id 
     LEFT JOIN rfqs r ON q.rfq_id = r.id 
     LEFT JOIN vendors v ON q.vendor_id = v.id 
     ORDER BY a.id`,
    (err, rows) => {
      if (err) return dbErr(res, err);
      res.json(rows);
    }
  );
});

// PUT /api/approvals/:id
app.put('/api/approvals/:id', (req, res) => {
  const { status, remarks } = req.body;
  db.query(
    'UPDATE approvals SET status=?, remarks=? WHERE id=?',
    [status, remarks, req.params.id],
    (err) => {
      if (err) return dbErr(res, err);
      res.json({ success: true });
    }
  );
});

// ═══════════════════════════════════════════════════════════════════
//  PURCHASE ORDERS
// ═══════════════════════════════════════════════════════════════════

// GET /api/purchase-orders
app.get('/api/purchase-orders', (req, res) => {
  db.query(
    `SELECT po.*, r.title AS rfq_title, v.vendor_name, q.price 
     FROM purchase_orders po 
     LEFT JOIN quotations q ON po.quotation_id = q.id 
     LEFT JOIN rfqs r ON q.rfq_id = r.id 
     LEFT JOIN vendors v ON q.vendor_id = v.id 
     ORDER BY po.id`,
    (err, rows) => {
      if (err) return dbErr(res, err);
      res.json(rows);
    }
  );
});

// ═══════════════════════════════════════════════════════════════════
//  INVOICES
// ═══════════════════════════════════════════════════════════════════

// GET /api/invoices
app.get('/api/invoices', (req, res) => {
  db.query(
    `SELECT i.*, po.po_number, v.vendor_name 
     FROM invoices i 
     LEFT JOIN purchase_orders po ON i.po_id = po.id 
     LEFT JOIN quotations q ON po.quotation_id = q.id 
     LEFT JOIN vendors v ON q.vendor_id = v.id 
     ORDER BY i.id`,
    (err, rows) => {
      if (err) return dbErr(res, err);
      res.json(rows);
    }
  );
});

// ═══════════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 VendorBridge server running → http://localhost:${PORT}/main.html`);
});
