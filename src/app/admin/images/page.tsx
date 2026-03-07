import { createClient } from '@/lib/supabase/server'
import { createImage } from '../actions'
import ImageGrid from './ImageGrid'

export default async function ImagesPage() {
  const supabase = await createClient()

  const { data: images, error } = await supabase
    .from('images')
    .select('id, url, image_description, created_datetime_utc, is_common_use, is_public, additional_context')
    .order('created_datetime_utc', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Images</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse, upload, update, and delete images.
        </p>
      </div>

      {/* Upload form */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-indigo-900">Upload New Image</h3>
        <form action={createImage} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Image File</label>
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">Description (optional)</label>
            <input
              type="text"
              name="image_description"
              placeholder="Describe the image"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Upload
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to load images: {error.message}
        </div>
      )}

      <ImageGrid images={images ?? []} />
    </div>
  )
}
