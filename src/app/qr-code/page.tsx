import { redirect } from 'next/navigation';

export default function QRCodeRedirect() {
  redirect('/dashboard/qr-code');
}
