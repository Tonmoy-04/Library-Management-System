// example helper functions
export function formatDate(date) {
  const d = new Date(date);
  return d.toLocaleDateString();
}

export function calculateDueDate(issueDate, days = 14) {
  const d = new Date(issueDate);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}
