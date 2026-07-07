export const toISODate = (dateStr) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (isNaN(date)) return null;
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
};