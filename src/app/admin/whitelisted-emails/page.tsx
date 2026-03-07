import { createClient } from '@/lib/supabase/server'
import CrudPage from '../components/CrudPage'
import { createWhitelistedEmail, updateWhitelistedEmail, deleteWhitelistedEmail } from '../actions'

export default async function WhitelistedEmailsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('whitelist_email_addresses')
    .select('*')
    .order('id', { ascending: false })
    .limit(100)

  const rows = (data ?? []) as Record<string, unknown>[]
  const columns = rows.length > 0 ? Object.keys(rows[0]) : ['id', 'email_address']
  const editableFields = ['email_address']
  const createFields = ['email_address']

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Whitelisted Emails</h1>
          <p className="mt-1 text-sm text-gray-500">Manage whitelisted email addresses.</p>
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
      title="Whitelisted Emails"
      description="Create, view, update, and delete whitelisted email addresses."
      editableFields={editableFields}
      createFields={createFields}
      createAction={createWhitelistedEmail}
      updateAction={updateWhitelistedEmail}
      deleteAction={deleteWhitelistedEmail}
    />
  )
}
