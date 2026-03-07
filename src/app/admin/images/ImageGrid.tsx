'use client'

import { updateImage, deleteImage } from '../form-actions'

interface ImageItem {
  id: string
  url?: string
  image_description?: string
  created_datetime_utc?: string
  is_common_use?: boolean
  is_public?: boolean
  additional_context?: string
}

export default function ImageGrid({ images }: { images: ImageItem[] }) {
  if (images.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
        <p className="text-sm text-gray-500">No images found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((img) => (
        <div
          key={img.id}
          className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
        >
          {img.url ? (
            <div className="relative aspect-video bg-gray-100">
              <img
                src={img.url}
                alt={img.image_description || `Image ${img.id}`}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex aspect-video items-center justify-center bg-gray-50">
              <p className="text-sm text-gray-400">No URL</p>
            </div>
          )}

          <div className="space-y-2 p-4">
            <code className="block truncate rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs text-gray-600">
              {img.id}
            </code>

            {img.url && (
              <a
                href={img.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block truncate text-xs text-indigo-600 hover:underline"
              >
                {img.url}
              </a>
            )}

            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
              {img.created_datetime_utc && (
                <span>{img.created_datetime_utc.split('T')[0]}</span>
              )}
              {img.is_common_use !== undefined && (
                <span className={`rounded-full px-2 py-0.5 ${img.is_common_use ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                  {img.is_common_use ? 'Common' : 'User'}
                </span>
              )}
              {img.is_public !== undefined && (
                <span className={`rounded-full px-2 py-0.5 ${img.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {img.is_public ? 'Public' : 'Private'}
                </span>
              )}
            </div>

            {/* Update description */}
            <form action={updateImage} className="flex gap-2">
              <input type="hidden" name="imageId" value={img.id} />
              <input
                type="text"
                name="image_description"
                defaultValue={img.image_description ?? ''}
                placeholder="Image description"
                className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
              >
                Update
              </button>
            </form>

            <form action={deleteImage}>
              <input type="hidden" name="imageId" value={img.id} />
              <button
                type="submit"
                className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
              >
                Delete
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  )
}
