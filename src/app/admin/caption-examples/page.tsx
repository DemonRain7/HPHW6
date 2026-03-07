import { createClient } from '@/lib/supabase/server'
import CrudPage from '../components/CrudPage'
import { createCaptionExample, updateCaptionExample, deleteCaptionExample } from '../actions'

export default async function CaptionExamplesPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('caption_examples')
    .select('*')
    .order('id', { ascending: false })
    .limit(100)

  const rows = (data ?? []) as Record<string, unknown>[]
  const columns = rows.length > 0 ? Object.keys(rows[0]) : ['id', 'image_description', 'caption', 'explanation', 'priority', 'image_id']
  const editableFields = ['image_description', 'caption', 'explanation', 'priority', 'image_id']
  const createFields = ['image_description', 'caption', 'explanation', 'priority', 'image_id']

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Caption Examples</h1>
          <p className="mt-1 text-sm text-gray-500">Manage caption examples.</p>
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
      title="Caption Examples"
      description="Create, view, update, and delete caption examples."
      editableFields={editableFields}
      createFields={createFields}
      createAction={createCaptionExample}
      updateAction={updateCaptionExample}
      deleteAction={deleteCaptionExample}
    />
  )
}
