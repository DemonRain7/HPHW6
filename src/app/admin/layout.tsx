import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from './form-actions'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin, first_name, last_name, email')
    .eq('email', user.email)
    .single()

  if (!profile?.is_superadmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600">
            Your account ({user.email}) does not have superadmin privileges.
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg bg-gray-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-900"
            >
              Sign out
            </button>
          </form>
        </div>
      </main>
    )
  }

  const navSections = [
    {
      label: 'General',
      items: [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/images', label: 'Images' },
        { href: '/admin/captions', label: 'Captions' },
        { href: '/admin/caption-requests', label: 'Caption Requests' },
      ],
    },
    {
      label: 'Humor',
      items: [
        { href: '/admin/humor-flavors', label: 'Humor Flavors' },
        { href: '/admin/humor-flavor-steps', label: 'Flavor Steps' },
        { href: '/admin/humor-mix', label: 'Humor Flavor Mix' },
        { href: '/admin/example-captions', label: 'Example Captions' },
        { href: '/admin/caption-examples', label: 'Caption Examples' },
        { href: '/admin/terms', label: 'Terms' },
      ],
    },
    {
      label: 'LLM',
      items: [
        { href: '/admin/llm-models', label: 'LLM Models' },
        { href: '/admin/llm-providers', label: 'LLM Providers' },
        { href: '/admin/llm-prompt-chains', label: 'Prompt Chains' },
        { href: '/admin/llm-responses', label: 'LLM Responses' },
      ],
    },
    {
      label: 'Access Control',
      items: [
        { href: '/admin/allowed-domains', label: 'Allowed Domains' },
        { href: '/admin/whitelisted-emails', label: 'Whitelisted Emails' },
      ],
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-sm font-bold text-gray-900">HW7 Admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {section.label}
              </p>
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="mb-3">
            <p className="truncate text-sm font-medium text-gray-900">
              {[profile.first_name, profile.last_name].filter(Boolean).join(' ') || user.email}
            </p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">{children}</div>
      </main>
    </div>
  )
}
