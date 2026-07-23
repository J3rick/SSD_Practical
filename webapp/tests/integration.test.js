const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Search webapp - integration test', function () {
  this.timeout(10000);

  it('home page loads with search form', async () => {
    const res = await fetch(BASE_URL + '/');
    const body = await res.text();
    assert.strictEqual(res.status, 200);
    assert.ok(body.includes('<form'));
  });

  it('valid search term returns result page with the term', async () => {
    const res = await fetch(BASE_URL + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'q=hello123'
    });
    const body = await res.text();
    assert.strictEqual(res.status, 200);
    assert.ok(body.includes('hello123'));
  });

  it('XSS/SQLi-style input is rejected and home page is shown again', async () => {
    const res = await fetch(BASE_URL + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'q=' + encodeURIComponent("<script>alert(1)</script>")
    });
    const body = await res.text();
    assert.strictEqual(res.status, 200);
    assert.ok(body.includes('Invalid search term'));
  });

  it('too-short input is rejected', async () => {
    const res = await fetch(BASE_URL + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'q=ab'
    });
    const body = await res.text();
    assert.strictEqual(res.status, 200);
    assert.ok(body.includes('Invalid search term'));
  });
});
