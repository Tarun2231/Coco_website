export function getPublicAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== '') {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'https://coco-website-ten.vercel.app';
}

export function getPetPublicUrl(publicId: string): string {
  const baseUrl = getPublicAppUrl();
  return `${baseUrl}/pet/${publicId}`;
}
