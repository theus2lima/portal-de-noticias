import { redirect } from 'next/navigation'

export default async function AdminDashboard() {
  // Redireciona sempre para a página de configuração
  // Esta abordagem garante que a página nunca dependa do Supabase
  redirect('/admin/config')
}
