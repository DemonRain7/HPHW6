'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function requireSuperadmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_superadmin) redirect('/login')
  return { supabase, user }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ── User management ──

export async function toggleSuperadmin(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const profileId = String(formData.get('profileId') ?? '')
  const currentValue = formData.get('currentValue') === 'true'

  await supabase
    .from('profiles')
    .update({ is_superadmin: !currentValue })
    .eq('id', profileId)

  revalidatePath('/admin/users')
}

// ── Caption management ──

export async function toggleCaptionPublic(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const captionId = String(formData.get('captionId') ?? '')
  const currentValue = formData.get('currentPublic') === 'true'

  await supabase
    .from('captions')
    .update({ is_public: !currentValue })
    .eq('id', captionId)

  revalidatePath('/admin/captions')
}

export async function deleteCaption(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const captionId = String(formData.get('captionId') ?? '')

  await supabase.from('captions').delete().eq('id', captionId)
  revalidatePath('/admin/captions')
}

// ── Image management ──

export async function deleteImage(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const imageId = String(formData.get('imageId') ?? '')

  await supabase.from('images').delete().eq('id', imageId)
  revalidatePath('/admin/images')
}
