export const getError = (err) =>
  err?.response?.data?.error || err?.message || 'Something went wrong';

export const fmtMoney = (n) =>
  `${Number(n).toLocaleString('en-RW')} RWF`;

export const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
};

export const plateRegex = /^[A-Z]{2}[A-Z]\d{3}[A-Z]$/;

export const validatePlate = (p) => plateRegex.test((p || '').toUpperCase());
