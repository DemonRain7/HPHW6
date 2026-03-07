'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Row = Record<string, unknown>

interface DataTableProps {
  data: Row[]
  columns: string[]
  onDelete?: (id: string) => Promise<void>
  onUpdate?: (id: string, updates: Record<string, string>) => Promise<void>
  onCreate?: (values: Record<string, string>) => Promise<void>
  createFields?: string[]
  editableFields?: string[]
  idField?: string
  title: string
  description: string
}

export default function DataTable({
  data,
  columns,
  onDelete,
  onUpdate,
  onCreate,
  createFields,
  editableFields,
  idField = 'id',
  title,
  description,
}: DataTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [showCreate, setShowCreate] = useState(false)
  const [createValues, setCreateValues] = useState<Record<string, string>>({})
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const startEdit = (row: Row) => {
    const id = String(row[idField] ?? '')
    setEditingId(id)
    const vals: Record<string, string> = {}
    for (const field of editableFields ?? []) {
      vals[field] = String(row[field] ?? '')
    }
    setEditValues(vals)
  }

  const handleSave = (rowId: string) => {
    if (!onUpdate) return
    setErrorMsg(null)
    startTransition(async () => {
      try {
        await onUpdate(rowId, editValues)
        setEditingId(null)
      } catch (e) {
        setErrorMsg(String(e))
      }
      router.refresh()
    })
  }

  const handleCreate = () => {
    if (!onCreate) return
    setErrorMsg(null)
    startTransition(async () => {
      try {
        await onCreate(createValues)
        setCreateValues({})
        setShowCreate(false)
      } catch (e) {
        setErrorMsg(String(e))
      }
      router.refresh()
    })
  }

  const handleDelete = (rowId: string) => {
    if (!onDelete) return
    setErrorMsg(null)
    startTransition(async () => {
      try {
        await onDelete(rowId)
      } catch (e) {
        setErrorMsg(String(e))
      }
      router.refresh()
    })
  }

  const placeholderFor = (field: string): string => {
    const hints: Record<string, string> = {
      name: 'e.g. OpenAI',
      llm_provider_id: 'e.g. 1 (integer)',
      provider_model_id: 'e.g. gpt-4o',
      is_temperature_supported: 'true or false',
      term: 'e.g. Irony',
      definition: 'Short definition',
      example: 'Usage example',
      priority: 'e.g. 1 (integer)',
      term_type_id: 'e.g. 1 (integer, optional)',
      image_description: 'Describe the image',
      caption: 'Caption text',
      explanation: 'Why it is funny',
      image_id: 'UUID (optional)',
      apex_domain: 'e.g. example.com',
      email_address: 'e.g. user@example.com',
      humor_flavor_id: 'e.g. 1 (integer)',
      caption_count: 'e.g. 5 (integer)',
    }
    return hints[field] ?? field
  }

  const formatCell = (value: unknown): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        </div>
        {onCreate && (
          <button
            onClick={() => {
              setShowCreate(!showCreate)
              setCreateValues({})
            }}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            {showCreate ? 'Cancel' : '+ Create New'}
          </button>
        )}
      </div>

      {isPending && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-700">
          Processing...
        </div>
      )}

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Error: {errorMsg}
          <button onClick={() => setErrorMsg(null)} className="ml-2 font-bold">x</button>
        </div>
      )}

      {/* Create form */}
      {showCreate && onCreate && createFields && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
          <h3 className="mb-3 text-sm font-semibold text-indigo-900">Create New Entry</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {createFields.map((field) => (
              <div key={field}>
                <label className="mb-1 block text-xs font-medium text-gray-700">{field}</label>
                <input
                  type="text"
                  value={createValues[field] ?? ''}
                  onChange={(e) =>
                    setCreateValues((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder={placeholderFor(field)}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {/* Data count */}
      <div className="flex gap-4">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs text-gray-500">Total Records</p>
          <p className="text-lg font-bold text-gray-900">{data.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {columns.map((col) => (
                  <th key={col} className="px-4 py-3 font-semibold text-gray-600">
                    {col}
                  </th>
                ))}
                {(onUpdate || onDelete) && (
                  <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (onUpdate || onDelete ? 1 : 0)}
                    className="px-4 py-8 text-center text-gray-400"
                  >
                    No records found.
                  </td>
                </tr>
              )}
              {data.map((row, idx) => {
                const rowId = String(row[idField] ?? idx)
                const isEditing = editingId === rowId

                return (
                  <tr key={rowId} className="transition hover:bg-gray-50">
                    {columns.map((col) => (
                      <td key={col} className="max-w-xs px-4 py-3">
                        {isEditing && editableFields?.includes(col) ? (
                          <input
                            type="text"
                            value={editValues[col] ?? ''}
                            onChange={(e) =>
                              setEditValues((prev) => ({
                                ...prev,
                                [col]: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
                          />
                        ) : (
                          <span className="block truncate text-gray-900">
                            {formatCell(row[col])}
                          </span>
                        )}
                      </td>
                    ))}
                    {(onUpdate || onDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {onUpdate && editableFields && editableFields.length > 0 && (
                            <>
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSave(rowId)}
                                    disabled={isPending}
                                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-50"
                                  >
                                    {isPending ? 'Saving...' : 'Save'}
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => startEdit(row)}
                                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                >
                                  Edit
                                </button>
                              )}
                            </>
                          )}
                          {onDelete && !isEditing && (
                            <button
                              onClick={() => handleDelete(rowId)}
                              disabled={isPending}
                              className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                            >
                              {isPending ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
