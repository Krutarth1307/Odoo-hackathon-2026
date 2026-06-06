const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) { console.log('DB Error:', err); return; }
  console.log('MySQL Connected!');
});

// LOGIN
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  db.query('SELECT * FROM users WHERE email=? AND password=?',
  [email, password], (err, result) => {
    if (result.length > 0) res.json({ success: true, user: result[0] });
    else res.json({ success: false, message: 'Invalid credentials' });
  });
});

// DASHBOARD STATS
app.get('/dashboard', (req, res) => {
  db.query(`SELECT 
    (SELECT COUNT(*) FROM vendors) as vendors,
    (SELECT COUNT(*) FROM rfqs) as rfqs,
    (SELECT COUNT(*) FROM approvals WHERE status='PENDING') as pending,
    (SELECT COUNT(*) FROM invoices) as invoices`,   
  (err, result) => res.json(result[0]));
});

// VENDORS
app.get('/vendors', (req, res) => {
  db.query('SELECT * FROM vendors', (err, result) => res.json(result));
});

app.post('/vendors', (req, res) => {
  const { vendor_name, gst_number, category, contact_number, email } = req.body;
  db.query('INSERT INTO vendors SET ?',
  { vendor_name, gst_number, category, contact_number, email },
  (err, result) => res.json({ success: true, id: result.insertId }));
});

// RFQS
app.get('/rfqs', (req, res) => {
  db.query('SELECT * FROM rfqs', (err, result) => res.json(result));
});

app.post('/rfqs', (req, res) => {
  const data = req.body;
  db.query('INSERT INTO rfqs SET ?', data,
  (err, result) => res.json({ success: true, id: result.insertId }));
});

// QUOTATIONS
app.get('/quotations', (req, res) => {
  db.query('SELECT * FROM quotations', (err, result) => res.json(result));
});

// APPROVALS
app.get('/approvals', (req, res) => {
  db.query('SELECT * FROM approvals', (err, result) => res.json(result));
});

app.post('/approvals/:id', (req, res) => {
  const { status, remarks } = req.body;
  db.query('UPDATE approvals SET status=?, remarks=? WHERE id=?',
  [status, remarks, req.params.id],
  (err) => res.json({ success: true }));
});

// PURCHASE ORDERS
app.get('/purchase-orders', (req, res) => {
  db.query('SELECT * FROM purchase_orders', (err, result) => res.json(result));
});

// INVOICES
app.get('/invoices', (req, res) => {
  db.query('SELECT * FROM invoices', (err, result) => res.json(result));
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
