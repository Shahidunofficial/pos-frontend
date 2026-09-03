export const STORE_NAME = 'CellCare (PVT) LTD';
export const STORE_ADDRESS = '225, Dehiwala Road, Boralesgamuwa';
export const STORE_PHONE = '0701343431';

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function money(value: number): string {
  return `LKR ${value.toFixed(2)}`;
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
