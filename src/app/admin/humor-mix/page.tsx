import { createClient } from '@/lib/supabase/server'
import CrudPage from '../components/CrudPage'
import { updateHumorFlavorMix } from '../actions'

export default async function HumorMixPage() {
  const supabase = await createClient()
  const { data: mixes, error } = await supabase
    .from('humor_flavor_mix')
    .select('*')
    .order('id')

  const rows = (mixes ?? []) as Record<string, unknown>[]
  const columns = rows.length > 0 ? Object.keys(rows[0]) : ['id', 'humor_flavor_id', 'caption_count']
  const editableFields = ['humor_flavor_id', 'caption_count']

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Humor Flavor Mix</h1>
          <p className="mt-1 text-sm text-gray-500">View and update humor flavor mix settings.</p>
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
      title="Humor Flavor Mix"
      description="View and update humor flavor mix settings."
      editableFields={editableFields}
      updateAction={updateHumorFlavorMix}
    />
  )
}
