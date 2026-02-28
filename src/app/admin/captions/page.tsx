import { createClient } from '@/lib/supabase/server'
import { toggleCaptionPublic, deleteCaption } from '../actions'

export default async function CaptionsPage() {
  const supabase = await createClient()

  const { data: captions, error } = await supabase
    .from('captions')
    .select('*')
    .order('created_datetime_utc', { ascending: false })
    .limit(50)

  // Compute quick stats
  const total = captions?.length ?? 0
  const publicCount = captions?.filter((c) => c.is_public).length ?? 0
  const totalLikes = captions?.reduce((sum, c) => sum + (c.like_count ?? 0), 0) ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Captions</h1>
        <p className="mt-1 text-sm text-gray-500">
          View, toggle visibility, and manage all captions.
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex gap-4">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs text-gray-500">Showing</p>
          <p className="text-lg font-bold text-gray-900">{total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs text-gray-500">Public</p>
          <p className="text-lg font-bold text-indigo-600">{publicCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs text-gray-500">Total Likes</p>
          <p className="text-lg font-bold text-green-600">{totalLikes}</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to load captions: {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-semibold text-gray-600">Content</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Likes</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Public</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!captions || captions.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No captions found.
                  </td>
                </tr>
              )}
              {captions?.map((c) => (
                <tr key={c.id} className="transition hover:bg-gray-50">
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate text-gray-900">{c.content}</p>
                    <code className="text-xs text-gray-400">{c.id}</code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      {c.like_count ?? 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.is_public ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                        Private
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {c.created_datetime_utc
                      ? new Date(c.created_datetime_utc).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <form action={toggleCaptionPublic}>
                        <input type="hidden" name="captionId" value={c.id} />
                        <input
                          type="hidden"
                          name="currentPublic"
                          value={String(!!c.is_public)}
                        />
                        <button
                          type="submit"
                          className="rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        >
                          {c.is_public ? 'Make Private' : 'Make Public'}
                        </button>
                      </form>
                      <form action={deleteCaption}>
                        <input type="hidden" name="captionId" value={c.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
