const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3001;
const MIN_LENGTH = 3;
const MAX_LENGTH = 50;
const ALLOWED_PATTERN = /^[A-Za-z0-9 ]+$/;

const dbConfig = {
  host: process.env.DB_HOST || 'mysqldb',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'pass',
  database: process.env.DB_NAME || 'testdb'
};

// OWASP Top 10 Proactive Controls - C3: Validate All Inputs
// Backend performs the same positive (allowlist) validation as the frontend.
// Frontend validation is a usability convenience only; it must never be trusted,
// since it can be bypassed (disabled JS, direct HTTP requests, etc.).
function validateSearchTerm(value) {
  if (typeof value !== 'string' || value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
    return { valid: false, reason: 'length' };
  }
  if (!ALLOWED_PATTERN.test(value)) {
    return { valid: false, reason: 'attack' };
  }
  return { valid: true };
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

async function initDb() {
  const conn = await mysql.createConnection(dbConfig);
  await conn.query(
    'CREATE TABLE IF NOT EXISTS `2400564` (' +
    'id INT AUTO_INCREMENT PRIMARY KEY, ' +
    'search_query VARCHAR(50) NOT NULL, ' +
    'query_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)'
  );
  await conn.end();
}

app.post('/search', async (req, res) => {
  const term = req.body.q;
  const check = validateSearchTerm(term);

  if (!check.valid) {
    // Invalid input (fails length check or looks like an XSS/SQLi attack):
    // clear input and remain on home page.
    return res.send(homePage('Invalid search term. Please try again.'));
  }

  try {
    const conn = await mysql.createConnection(dbConfig);
    // Parameterized query: defense in depth against SQL injection,
    // in addition to the input validation above.
    await conn.query(
      'INSERT INTO `2400564` (search_query, query_time) VALUES (?, NOW())',
      [term]
    );
    await conn.end();
  } catch (err) {
    console.error('DB error:', err.message);
    return res.status(500).send('Server error, please try again later.');
  }

  res.send(resultPage(term));
});

function homePage(error) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Search</title></head>
<body>
  <h1>Search</h1>
  <p style="color:red;">${error ? escapeHtml(error) : ''}</p>
  <form action="/search" method="POST" onsubmit="return handleSubmit(event)">
    <input type="text" id="q" name="q" minlength="3" maxlength="50" required>
    <button type="submit">Submit</button>
  </form>
  <script src="/validate.js"></script>
  <script>
    function handleSubmit(e) {
      var input = document.getElementById('q');
      var result = validateSearchTerm(input.value);
      if (!result.valid) {
        e.preventDefault();
        input.value = '';
        return false;
      }
      return true;
    }
  </script>
</body></html>`;
}

function resultPage(term) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Result</title></head>
<body>
  <h1>Search Result</h1>
  <p>You searched for: <strong>${escapeHtml(term)}</strong></p>
  <form action="/" method="GET"><button type="submit">Back to Home</button></form>
</body></html>`;
}

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`webapp listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize DB:', err.message);
    process.exit(1);
  });
