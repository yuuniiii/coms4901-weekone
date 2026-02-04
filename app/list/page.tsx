export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabaseClient'

export default async function ListPage() {
  const { data, error } = await supabase
    .from('images')
    .select('*')

  if (error) {
    return <div>Error loading data</div>
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>Supabase Data (images table) </h1>
      <ul>
        {data?.map((row: any) => (
          <li key={row.id}>
            {JSON.stringify(row)}
          </li>
        ))}
      </ul>
    </main>
  )
}
