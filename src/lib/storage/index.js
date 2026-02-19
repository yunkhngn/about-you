// Cloudinary upload utility
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

/**
 * Upload a file to Cloudinary
 * @param {File} file - The file to upload
 * @param {string} folder - Optional folder path
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadFile(file, folder = 'about-you') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: 'POST', body: formData }
  )

  if (!response.ok) throw new Error('Upload failed')

  const data = await response.json()
  return {
    url: data.secure_url,
    publicId: data.public_id,
  }
}

/**
 * Get an optimized Cloudinary URL
 * @param {string} publicId - The Cloudinary public ID
 * @param {object} options - Transform options
 * @returns {string}
 */
export function getOptimizedUrl(publicId, { width, height, format = 'auto' } = {}) {
  let transforms = `f_${format},q_auto`
  if (width) transforms += `,w_${width}`
  if (height) transforms += `,h_${height}`

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}
