// utils.ts - دالة مساعدة لإصلاح مسار الصور في GitHub Pages
export const getImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = import.meta.env.BASE_URL || '/';
  return url.startsWith('/') ? `${base}${url.slice(1)}` : `${base}${url}`;
};
