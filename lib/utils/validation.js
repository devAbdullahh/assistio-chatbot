const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim().toLowerCase());
}

export function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

export function validateName(name) {
  return typeof name === 'string' && name.trim().length >= 1 && name.length <= 80;
}
