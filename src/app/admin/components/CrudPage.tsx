'use client'

import DataTable from './DataTable'

type Row = Record<string, unknown>

interface CrudPageProps {
  data: Row[]
  columns: string[]
  title: string
  description: string
  idField?: string
  createFields?: string[]
  editableFields?: string[]
  createAction?: (formData: FormData) => Promise<void>
  updateAction?: (formData: FormData) => Promise<void>
  deleteAction?: (formData: FormData) => Promise<void>
}

export default function CrudPage({
  data,
  columns,
  title,
  description,
  idField = 'id',
  createFields,
  editableFields,
  createAction,
  updateAction,
  deleteAction,
}: CrudPageProps) {
  const handleCreate = createAction
    ? async (values: Record<string, string>) => {
        const fd = new FormData()
        for (const [k, v] of Object.entries(values)) {
          fd.append(k, v)
        }
        await createAction(fd)
      }
    : undefined

  const handleUpdate = updateAction
    ? async (id: string, updates: Record<string, string>) => {
        const fd = new FormData()
        fd.append('id', id)
        for (const [k, v] of Object.entries(updates)) {
          fd.append(k, v)
        }
        await updateAction(fd)
      }
    : undefined

  const handleDelete = deleteAction
    ? async (id: string) => {
        const fd = new FormData()
        fd.append('id', id)
        await deleteAction(fd)
      }
    : undefined

  return (
    <DataTable
      data={data}
      columns={columns}
      title={title}
      description={description}
      idField={idField}
      createFields={createFields}
      editableFields={editableFields}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  )
}
