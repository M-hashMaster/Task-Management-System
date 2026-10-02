export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  } catch {
    return '';
  }
};

export const isOverdue = (dateString?: string | null): boolean => {
  if (!dateString) return false;
  try {
    const date = new Date(dateString);
    return date.getTime() < Date.now();
  } catch {
    return false;
  }
};
