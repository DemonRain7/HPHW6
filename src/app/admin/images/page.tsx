import { createClient } from '@/lib/supabase/server'
import { deleteImage } from '../actions'

export default async function ImagesPage() {
  const supabase = await createClient()

  const { data: images, error } = await supabase
    .from('images')
    .select('*')
    .order('created_datetime_utc', { ascending: false })
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Images</h1>
        <p className="mt-1 text-sm text-gray-500">
          Browse and manage all uploaded images.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Failed to load images: {error.message}
        </div>
      )}

      {!error && (!images || images.length === 0) && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-4 text-sm text-gray-500">No images found.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images?.map((img) => (
          <div
            key={img.id}
            className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
          >
            {/* Image preview */}
            {img.cdn_url || img.url ? (
              <div className="relative aspect-video bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.cdn_url || img.url}
                  alt={`Image ${img.id}`}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gray-50">
                <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            {/* Image info */}
            <div className="space-y-2 p-4">
              <div className="flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
                  {img.id}
                </code>
              </div>

              {img.cdn_url && (
                <a
                  href={img.cdn_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-xs text-indigo-600 hover:underline"
                >
                  {img.cdn_url}
                </a>
              )}

              <div className="flex items-center gap-3 text-xs text-gray-400">
                {img.created_datetime_utc && (
                  <span>{new Date(img.created_datetime_utc).toLocaleDateString()}</span>
                )}
                {img.is_common_use !== undefined && (
                  <span className={`rounded-full px-2 py-0.5 ${img.is_common_use ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {img.is_common_use ? 'Common' : 'User'}
                  </span>
                )}
              </div>

              <form action={deleteImage}>
                <input type="hidden" name="imageId" value={img.id} />
                <button
                  type="submit"
                  className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Delete Image
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
