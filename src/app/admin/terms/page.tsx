import { createClient } from '@/lib/supabase/server'
import CrudPage from '../components/CrudPage'
import { createTerm, updateTerm, deleteTerm } from '../actions'

export default async function TermsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('terms')
    .select('*')
    .order('id', { ascending: false })
    .limit(100)

  const rows = (data ?? []) as Record<string, unknown>[]
  const columns = rows.length > 0 ? Object.keys(rows[0]) : ['id', 'term', 'definition', 'example', 'priority', 'term_type_id']
  const editableFields = ['term', 'definition', 'example', 'priority', 'term_type_id']
  const createFields = ['term', 'definition', 'example', 'priority', 'term_type_id']

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Terms</h1>
          <p className="mt-1 text-sm text-gray-500">Manage terms.</p>
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
      title="Terms"
      description="Create, view, update, and delete terms."
      editableFields={editableFields}
      createFields={createFields}
      createAction={createTerm}
      updateAction={updateTerm}
      deleteAction={deleteTerm}
    />
  )
}
