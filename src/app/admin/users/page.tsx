import { createClient } from '@/lib/supabase/server'
import { toggleSuperadmin } from '../actions'

export default async function UsersPage() {
  const supabase = await createClient()

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_datetime_utc', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users &amp; Profiles</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage all user profiles. Toggle superadmin access for any user.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to load profiles: {error.message}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 font-semibold text-gray-600">Username</th>
                <th className="px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Superadmin</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Created</th>
                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(!profiles || profiles.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                    No profiles found.
                  </td>
                </tr>
              )}
              {profiles?.map((p) => (
                <tr key={p.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {p.username || '(no username)'}
                  </td>
                  <td className="px-4 py-3">
                    <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
                      {p.id}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    {p.is_superadmin ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {p.created_datetime_utc
                      ? new Date(p.created_datetime_utc).toLocaleString()
                      : 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <form action={toggleSuperadmin}>
                      <input type="hidden" name="profileId" value={p.id} />
                      <input
                        type="hidden"
                        name="currentValue"
                        value={String(!!p.is_superadmin)}
                      />
                      <button
                        type="submit"
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                          p.is_superadmin
                            ? 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                            : 'border border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {p.is_superadmin ? 'Revoke Admin' : 'Grant Admin'}
                      </button>
                    </form>
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
