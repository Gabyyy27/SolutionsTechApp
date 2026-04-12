export function formatCurrency(value) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL',
    minimumFractionDigits: 2,
  }).format(Number(value || 0))
}

export function formatDateTime(value) {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-HN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}