// Utility formatting functions

export const formatCurrency = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

export const formatWeight = (weight: number | string | undefined | null): string => {
  if (weight === undefined || weight === null || isNaN(Number(weight))) return '0 kg';
  return `${Number(weight).toFixed(1).replace(/\.0$/, '')} kg`;
};

export const formatDate = (dateString?: string | Date | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(dateString);
  }
};

export const formatDateTime = (dateString?: string | Date | null): string => {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return String(dateString);
  }
};

export const formatRelativeTime = (dateString?: string | Date | null): string => {
  if (!dateString) return 'recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return formatDate(dateString);
  } catch {
    return 'recently';
  }
};

export const formatLotId = (id: string): string => {
  if (!id) return '';
  if (id.length <= 8) return id.toUpperCase();
  return `LOT-${id.slice(-6).toUpperCase()}`;
};

