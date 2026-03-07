import { createClient } from '@/lib/supabase/server'
import CrudPage from '../components/CrudPage'
import { createLlmModel, updateLlmModel, deleteLlmModel } from '../actions'

export default async function LlmModelsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('llm_models')
    .select('*')
    .order('id', { ascending: false })
    .limit(100)

  const rows = (data ?? []) as Record<string, unknown>[]
  const columns = rows.length > 0 ? Object.keys(rows[0]) : ['id', 'name', 'llm_provider_id', 'provider_model_id', 'is_temperature_supported']
  const editableFields = ['name', 'llm_provider_id', 'provider_model_id', 'is_temperature_supported']
  const createFields = ['name', 'llm_provider_id', 'provider_model_id', 'is_temperature_supported']

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LLM Models</h1>
          <p className="mt-1 text-sm text-gray-500">Manage LLM models.</p>
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
      title="LLM Models"
      description="Create, view, update, and delete LLM models."
      editableFields={editableFields}
      createFields={createFields}
      createAction={createLlmModel}
      updateAction={updateLlmModel}
      deleteAction={deleteLlmModel}
    />
  )
}
