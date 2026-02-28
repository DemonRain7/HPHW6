import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch aggregate counts in parallel
  const [profilesRes, imagesRes, captionsRes, votesRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('images').select('*', { count: 'exact', head: true }),
    supabase.from('captions').select('*', { count: 'exact', head: true }),
    supabase.from('caption_votes').select('*', { count: 'exact', head: true }),
  ])

  const totalProfiles = profilesRes.count ?? 0
  const totalImages = imagesRes.count ?? 0
  const totalCaptions = captionsRes.count ?? 0
  const totalVotes = votesRes.count ?? 0

  // Fetch additional stats in parallel
  const [
    publicCaptionsRes,
    superadminRes,
    topCaptionsRes,
    recentVotesRes,
    positiveVotesRes,
    negativeVotesRes,
  ] = await Promise.all([
    supabase.from('captions').select('*', { count: 'exact', head: true }).eq('is_public', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_superadmin', true),
    supabase
      .from('captions')
      .select('id, content, like_count')
      .order('like_count', { ascending: false })
      .limit(5),
    supabase
      .from('caption_votes')
      .select('id, caption_id, vote_value, created_datetime_utc')
      .order('created_datetime_utc', { ascending: false })
      .limit(8),
    supabase
      .from('caption_votes')
      .select('*', { count: 'exact', head: true })
      .eq('vote_value', 1),
    supabase
      .from('caption_votes')
      .select('*', { count: 'exact', head: true })
      .eq('vote_value', -1),
  ])

  const publicCaptions = publicCaptionsRes.count ?? 0
  const privateCaptions = totalCaptions - publicCaptions
  const superadminCount = superadminRes.count ?? 0
  const topCaptions = topCaptionsRes.data ?? []
  const recentVotes = recentVotesRes.data ?? []
  const positiveVotes = positiveVotesRes.count ?? 0
  const negativeVotes = negativeVotesRes.count ?? 0
  const positivePercent = totalVotes > 0 ? Math.round((positiveVotes / totalVotes) * 100) : 0

  const statCards = [
    {
      label: 'Total Profiles',
      value: totalProfiles,
      color: 'bg-blue-500',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      href: '/admin/users',
    },
    {
      label: 'Total Images',
      value: totalImages,
      color: 'bg-emerald-500',
      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
      href: '/admin/images',
    },
    {
      label: 'Total Captions',
      value: totalCaptions,
      color: 'bg-purple-500',
      icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
      href: '/admin/captions',
    },
    {
      label: 'Total Votes',
      value: totalVotes,
      color: 'bg-amber-500',
      icon: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5',
      href: '#votes',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your humor database at a glance.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${stat.color}`}>
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Two-column layout for detailed stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vote Sentiment */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Vote Sentiment</h2>
          <p className="mt-1 text-xs text-gray-500">Distribution of funny vs. not funny votes</p>
          <div className="mt-5 space-y-4">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-green-700">Funny (+1)</span>
                  <span className="text-gray-500">{positiveVotes}</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{ width: `${positivePercent}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-gray-600">Not Funny (-1)</span>
                  <span className="text-gray-500">{negativeVotes}</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-400 transition-all"
                    style={{ width: `${100 - positivePercent}%` }}
                  />
                </div>
              </div>
            </div>
            <p className="pt-2 text-center text-2xl font-bold text-green-600">
              {positivePercent}% <span className="text-sm font-normal text-gray-400">approval rate</span>
            </p>
          </div>
        </div>

        {/* Caption Visibility */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Caption Visibility</h2>
          <p className="mt-1 text-xs text-gray-500">Public vs. private captions breakdown</p>
          <div className="mt-5 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                <span className="text-2xl font-bold text-indigo-700">{publicCaptions}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700">Public</p>
            </div>
            <div className="text-3xl text-gray-300">/</div>
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <span className="text-2xl font-bold text-gray-600">{privateCaptions}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-gray-700">Private</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Superadmins</span>
              <span className="font-semibold text-gray-900">{superadminCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Regular users</span>
              <span className="font-semibold text-gray-900">{totalProfiles - superadminCount}</span>
            </div>
          </div>
        </div>

        {/* Top Captions by Likes */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Top Captions by Likes</h2>
          <p className="mt-1 text-xs text-gray-500">The funniest captions by community vote</p>
          {topCaptions.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">No captions yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {topCaptions.map((c, i) => (
                <li key={c.id} className="flex items-start gap-3">
                  <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-gray-300'}`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-gray-800">{c.content}</p>
                    <p className="text-xs text-gray-400">{c.like_count ?? 0} likes</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Votes */}
        <div id="votes" className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <p className="mt-1 text-xs text-gray-500">Latest votes across the platform</p>
          {recentVotes.length === 0 ? (
            <p className="mt-4 text-sm text-gray-400">No votes yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {recentVotes.map((v) => (
                <li
                  key={v.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                >
                  <span className="truncate font-mono text-xs text-gray-500">
                    {v.caption_id}
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        v.vote_value > 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {v.vote_value > 0 ? '+1' : '-1'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {v.created_datetime_utc
                        ? new Date(v.created_datetime_utc).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
