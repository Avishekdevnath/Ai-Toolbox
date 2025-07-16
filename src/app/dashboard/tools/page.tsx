import { redirect } from 'next/navigation';
 
export default function DashboardToolsRedirect() {
  redirect('/admin/tools');
  return null;
} 