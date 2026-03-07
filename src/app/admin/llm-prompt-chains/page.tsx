import { createClient } from '@/lib/supabase/server'

export default async function LlmPromptChainsPage() {
  const supabase = await createClient()
  const { data: chains, error } = await supabase
    .from('llm_prompt_chains')
    .select('*')
    .order('id', { ascending: false })
    .limit(100)

  const rows = chains ?? []
  const columns = rows.length > 0 ? Object.keys(rows[0]) : ['id']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LLM Prompt Chains</h1>
        <p className="mt-1 text-sm text-gray-500">Browse all LLM prompt chains (read-only).</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to load: {error.message}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 inline-block">
        <p className="text-xs text-gray-500">Total Records</p>
        <p className="text-lg font-bold text-gray-900">{rows.length}</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 font-semibold text-gray-600">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 && (
                <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400">No records found.</td></tr>
              )}
              {rows.map((row, idx) => (
                <tr key={row.id ?? idx} className="transition hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="max-w-xs px-4 py-3 truncate text-gray-900">
                      {row[col] === null ? '-' : typeof row[col] === 'boolean' ? (row[col] ? 'Yes' : 'No') : typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
