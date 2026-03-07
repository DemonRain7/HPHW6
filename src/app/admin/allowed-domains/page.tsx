import { createClient } from '@/lib/supabase/server'
import CrudPage from '../components/CrudPage'
import { createAllowedDomain, updateAllowedDomain, deleteAllowedDomain } from '../actions'

export default async function AllowedDomainsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('allowed_signup_domains')
    .select('*')
    .order('id', { ascending: false })
    .limit(100)

  const rows = (data ?? []) as Record<string, unknown>[]
  const columns = rows.length > 0 ? Object.keys(rows[0]) : ['id', 'apex_domain']
  const editableFields = ['apex_domain']
  const createFields = ['apex_domain']

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Allowed Signup Domains</h1>
          <p className="mt-1 text-sm text-gray-500">Manage allowed signup domains.</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to load: {error.message}
        </div>
      </div>
    )
  }

  return (
    <CrudPage
      data={rows}
      columns={columns}
      title="Allowed Signup Domains"
      description="Create, view, update, and delete allowed signup domains."
      editableFields={editableFields}
      createFields={createFields}
      createAction={createAllowedDomain}
      updateAction={updateAllowedDomain}
      deleteAction={deleteAllowedDomain}
    />
  )
}
