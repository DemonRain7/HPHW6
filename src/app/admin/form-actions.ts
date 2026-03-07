'use server'

import {
  toggleCaptionPublic as _toggleCaptionPublic,
  deleteCaption as _deleteCaption,
  toggleSuperadmin as _toggleSuperadmin,
  createImage as _createImage,
  updateImage as _updateImage,
  deleteImage as _deleteImage,
  signOut as _signOut,
} from './actions'

// Void-returning wrappers for use with <form action={...}>
// (form actions require void return type)

export async function toggleCaptionPublic(formData: FormData): Promise<void> {
  await _toggleCaptionPublic(formData)
}

export async function deleteCaption(formData: FormData): Promise<void> {
  await _deleteCaption(formData)
}

export async function toggleSuperadmin(formData: FormData): Promise<void> {
  await _toggleSuperadmin(formData)
}

export async function createImage(formData: FormData): Promise<void> {
  await _createImage(formData)
}

export async function updateImage(formData: FormData): Promise<void> {
  await _updateImage(formData)
}

export async function deleteImage(formData: FormData): Promise<void> {
  await _deleteImage(formData)
}

export async function signOut(): Promise<void> {
  await _signOut()
}
