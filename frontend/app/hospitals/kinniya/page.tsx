import { redirect } from 'next/navigation';

export default function KinniyaHospitalPage() {
  // Redirect the legacy Kinniya URL to the unified dynamic routing architecture
  redirect('/hospitals/hosp-kinniya');
}
