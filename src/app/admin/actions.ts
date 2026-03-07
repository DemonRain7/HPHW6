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
    .eq('email', user.email)
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

  const { error } = await supabase
    .from('profiles')
    .update({ is_superadmin: !currentValue })
    .eq('id', profileId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/users')
}

// ── Image management (CRUD) ──
// images: id(uuid auto), created_datetime_utc, modified_datetime_utc, url, is_common_use, profile_id, additional_context, is_public, image_description, celebrity_recognition, embedding

export async function createImage(formData: FormData) {
  const { supabase, user } = await requireSuperadmin()
  const file = formData.get('file') as File | null
  const imageDescription = String(formData.get('image_description') ?? '')

  if (!file || file.size === 0) return

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

  // Try common bucket names
  let imageUrl = ''
  const bucketNames = ['images', 'humor-images', 'public']

  for (const bucket of bucketNames) {
    const { error } = await supabase.storage.from(bucket).upload(fileName, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
      imageUrl = urlData.publicUrl
      console.log(`Uploaded to bucket "${bucket}":`, imageUrl)
      break
    }
    console.log(`Bucket "${bucket}" failed:`, error.message)
  }

  if (!imageUrl) {
    console.error('All storage buckets failed. Creating record without file upload.')
    imageUrl = `https://placeholder.com/${fileName}`
  }

  const { error: insertError } = await supabase.from('images').insert({
    url: imageUrl,
    image_description: imageDescription || null,
    profile_id: user.id,
  })

  if (insertError) {
    throw new Error(insertError.message)
  }

  revalidatePath('/admin/images')
}

export async function updateImage(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const imageId = String(formData.get('imageId') ?? '')
  const imageDescription = String(formData.get('image_description') ?? '')

  const { error } = await supabase
    .from('images')
    .update({ image_description: imageDescription })
    .eq('id', imageId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/images')
}

export async function deleteImage(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const imageId = String(formData.get('imageId') ?? '')

  const { error } = await supabase.from('images').delete().eq('id', imageId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/images')
}

// ── Caption management ──

export async function toggleCaptionPublic(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const captionId = String(formData.get('captionId') ?? '')
  const currentValue = formData.get('currentPublic') === 'true'

  const { error } = await supabase
    .from('captions')
    .update({ is_public: !currentValue })
    .eq('id', captionId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/captions')
}

export async function deleteCaption(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const captionId = String(formData.get('captionId') ?? '')

  const { error } = await supabase.from('captions').delete().eq('id', captionId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/captions')
}

// ── Humor Flavor Mix (read/update) ──
// humor_flavor_mix: id, created_datetime_utc, humor_flavor_id, caption_count

export async function updateHumorFlavorMix(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const mixId = String(formData.get('id') ?? '')
  const humorFlavorId = formData.get('humor_flavor_id')
  const captionCount = formData.get('caption_count')

  const updates: Record<string, number> = {}
  if (humorFlavorId) updates.humor_flavor_id = Number(humorFlavorId)
  if (captionCount) updates.caption_count = Number(captionCount)

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase.from('humor_flavor_mix').update(updates).eq('id', mixId)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/admin/humor-mix')
}

// ── Caption Examples (CRUD) ──
// caption_examples: id, created_datetime_utc, modified_datetime_utc, image_description, caption, explanation, priority, image_id

export async function createCaptionExample(formData: FormData) {
  const { supabase } = await requireSuperadmin()

  const { data: maxRow } = await supabase.from('caption_examples').select('id').order('id', { ascending: false }).limit(1).single()
  const nextId = (maxRow?.id ?? 0) + 1

  const insert: Record<string, string | number | null> = {
    id: nextId,
    image_description: String(formData.get('image_description') ?? ''),
    caption: String(formData.get('caption') ?? ''),
    explanation: String(formData.get('explanation') ?? ''),
    priority: Number(formData.get('priority') ?? 0),
    image_id: formData.get('image_id') ? String(formData.get('image_id')) : null,
  }
  const { error } = await supabase.from('caption_examples').insert(insert)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/caption-examples')
  revalidatePath('/admin/example-captions')
}

export async function updateCaptionExample(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const updates: Record<string, string | number | null> = {}
  if (formData.get('image_description')) updates.image_description = String(formData.get('image_description'))
  if (formData.get('caption')) updates.caption = String(formData.get('caption'))
  if (formData.get('explanation')) updates.explanation = String(formData.get('explanation'))
  if (formData.get('priority')) updates.priority = Number(formData.get('priority'))
  if (formData.get('image_id')) updates.image_id = String(formData.get('image_id'))
  const { error } = await supabase.from('caption_examples').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/caption-examples')
}

export async function deleteCaptionExample(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const { error } = await supabase.from('caption_examples').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/caption-examples')
}

// ── Terms (CRUD) ──
// terms: id, created_datetime_utc, modified_datetime_utc, term, definition, example, priority, term_type_id

export async function createTerm(formData: FormData) {
  const { supabase } = await requireSuperadmin()

  const { data: maxRow } = await supabase.from('terms').select('id').order('id', { ascending: false }).limit(1).single()
  const nextId = (maxRow?.id ?? 0) + 1

  const insert: Record<string, string | number | null> = {
    id: nextId,
    term: String(formData.get('term') ?? ''),
    definition: String(formData.get('definition') ?? ''),
    example: String(formData.get('example') ?? ''),
    priority: Number(formData.get('priority') ?? 0),
    term_type_id: formData.get('term_type_id') ? Number(formData.get('term_type_id')) : null,
  }
  const { error } = await supabase.from('terms').insert(insert)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/terms')
}

export async function updateTerm(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const updates: Record<string, string | number | null> = {}
  if (formData.get('term')) updates.term = String(formData.get('term'))
  if (formData.get('definition')) updates.definition = String(formData.get('definition'))
  if (formData.get('example')) updates.example = String(formData.get('example'))
  if (formData.get('priority')) updates.priority = Number(formData.get('priority'))
  if (formData.get('term_type_id')) updates.term_type_id = Number(formData.get('term_type_id'))
  const { error } = await supabase.from('terms').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/terms')
}

export async function deleteTerm(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const { error } = await supabase.from('terms').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/terms')
}

// ── LLM Models (CRUD) ──
// llm_models: id, created_datetime_utc, name, llm_provider_id, provider_model_id, is_temperature_supported

export async function createLlmModel(formData: FormData) {
  const { supabase } = await requireSuperadmin()

  const { data: maxRow } = await supabase.from('llm_models').select('id').order('id', { ascending: false }).limit(1).single()
  const nextId = (maxRow?.id ?? 0) + 1

  const { error } = await supabase.from('llm_models').insert({
    id: nextId,
    name: String(formData.get('name') ?? ''),
    llm_provider_id: Number(formData.get('llm_provider_id') ?? 0),
    provider_model_id: String(formData.get('provider_model_id') ?? ''),
    is_temperature_supported: formData.get('is_temperature_supported') === 'true',
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/llm-models')
}

export async function updateLlmModel(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const updates: Record<string, string | number | boolean> = {}
  if (formData.get('name')) updates.name = String(formData.get('name'))
  if (formData.get('llm_provider_id')) updates.llm_provider_id = Number(formData.get('llm_provider_id'))
  if (formData.get('provider_model_id')) updates.provider_model_id = String(formData.get('provider_model_id'))
  if (formData.has('is_temperature_supported')) updates.is_temperature_supported = formData.get('is_temperature_supported') === 'true'
  const { error } = await supabase.from('llm_models').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/llm-models')
}

export async function deleteLlmModel(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const { error } = await supabase.from('llm_models').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/llm-models')
}

// ── LLM Providers (CRUD) ──
// llm_providers: id, created_datetime_utc, name

export async function createLlmProvider(formData: FormData) {
  const { supabase } = await requireSuperadmin()

  const { data: maxRow } = await supabase.from('llm_providers').select('id').order('id', { ascending: false }).limit(1).single()
  const nextId = (maxRow?.id ?? 0) + 1

  const { error } = await supabase.from('llm_providers').insert({
    id: nextId,
    name: String(formData.get('name') ?? ''),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/llm-providers')
}

export async function updateLlmProvider(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const updates: Record<string, string> = {}
  if (formData.get('name')) updates.name = String(formData.get('name'))
  const { error } = await supabase.from('llm_providers').update(updates).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/llm-providers')
}

export async function deleteLlmProvider(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const { error } = await supabase.from('llm_providers').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/llm-providers')
}

// ── Allowed Signup Domains (CRUD) ──
// allowed_signup_domains: id, created_datetime_utc, apex_domain

export async function createAllowedDomain(formData: FormData) {
  const { supabase } = await requireSuperadmin()

  const { data: maxRow } = await supabase.from('allowed_signup_domains').select('id').order('id', { ascending: false }).limit(1).single()
  const nextId = (maxRow?.id ?? 0) + 1

  const { error } = await supabase.from('allowed_signup_domains').insert({
    id: nextId,
    apex_domain: String(formData.get('apex_domain') ?? ''),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/allowed-domains')
}

export async function updateAllowedDomain(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const { error } = await supabase.from('allowed_signup_domains').update({
    apex_domain: String(formData.get('apex_domain') ?? ''),
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/allowed-domains')
}

export async function deleteAllowedDomain(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const { error } = await supabase.from('allowed_signup_domains').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/allowed-domains')
}

// ── Whitelist Email Addresses (CRUD) ──
// whitelist_email_addresses: id, created_datetime_utc, modified_datetime_utc, email_address

export async function createWhitelistedEmail(formData: FormData) {
  const { supabase } = await requireSuperadmin()

  const { data: maxRow } = await supabase.from('whitelist_email_addresses').select('id').order('id', { ascending: false }).limit(1).single()
  const nextId = (maxRow?.id ?? 0) + 1

  const { error } = await supabase.from('whitelist_email_addresses').insert({
    id: nextId,
    email_address: String(formData.get('email_address') ?? ''),
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/whitelisted-emails')
}

export async function updateWhitelistedEmail(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const { error } = await supabase.from('whitelist_email_addresses').update({
    email_address: String(formData.get('email_address') ?? ''),
  }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/whitelisted-emails')
}

export async function deleteWhitelistedEmail(formData: FormData) {
  const { supabase } = await requireSuperadmin()
  const id = String(formData.get('id') ?? '')
  const { error } = await supabase.from('whitelist_email_addresses').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/whitelisted-emails')
}
