// OWASP Top 10 Proactive Controls - C3: Validate All Inputs
// Positive validation (allowlist): only allow alphanumeric characters and spaces.
// This rejects characters commonly used in XSS (<, >, ", ') and SQL injection
// (', ", ;, --, /*) attacks by construction, rather than trying to blacklist them.
// No unicode support required, so plain ASCII alphanumerics only.

var MIN_LENGTH = 3;
var MAX_LENGTH = 50;
var ALLOWED_PATTERN = /^[A-Za-z0-9 ]+$/;

function validateSearchTerm(value) {
  if (!value || value.length < MIN_LENGTH || value.length > MAX_LENGTH) {
    return { valid: false, message: 'Search term must be ' + MIN_LENGTH + '-' + MAX_LENGTH + ' characters long.' };
  }
  if (!ALLOWED_PATTERN.test(value)) {
    return { valid: false, message: 'Search term contains invalid characters. Only letters, numbers and spaces are allowed.' };
  }
  return { valid: true, message: '' };
}
