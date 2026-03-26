import { redirect } from 'next/navigation';

export default async function NewFormPage() {
  redirect('/dashboard/forms/create');
}


