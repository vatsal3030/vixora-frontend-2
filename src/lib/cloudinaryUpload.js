/**
 * Shared Cloudinary direct-upload utility.
 * 
 * FLOW (for all image types — avatar, cover, post/tweet image, video thumbnail):
 *  1. Call `videoService.getUploadSignature(resourceType)` to get a signed payload
 *  2. Pass the file + signed payload to this function
 *  3. Use the returned `public_id` to update the backend endpoint
 *
 * `resourceType` values accepted by backend signature endpoint:
 *   'avatar' | 'cover' | 'post' | 'thumbnail' | 'video'
 */

/**
 * Upload a file directly to Cloudinary using a pre-signed payload from the backend.
 * @param {File|Blob} file - The file to upload
 * @param {Object} signatureData - Payload from GET /upload/signature
 * @param {Object} [options]
 * @param {function} [options.onProgress] - Optional progress callback (0-100)
 * @returns {Promise<Object>} Cloudinary response including public_id, secure_url, etc.
 */
export async function uploadToCloudinary(file, signatureData, options = {}) {
    // Cloudinary URL only accepts 'video' or 'image' — not Vixora-specific keys
    const cloudinaryResourceType =
        signatureData.resourceType === 'video' ? 'video' : 'image'

    const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/${cloudinaryResourceType}/upload`

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', signatureData.api_key)
    formData.append('timestamp', signatureData.timestamp)
    formData.append('signature', signatureData.signature)
    formData.append('public_id', signatureData.publicId)

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', url)

        if (options.onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    options.onProgress(Math.round((e.loaded / e.total) * 100))
                }
            })
        }

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve(JSON.parse(xhr.responseText))
            } else {
                let errMsg = `Cloudinary upload failed (${xhr.status})`
                try {
                    const body = JSON.parse(xhr.responseText)
                    if (body?.error?.message) errMsg = body.error.message
                } catch (_) { /* ignore */ }
                reject(new Error(errMsg))
            }
        }
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(formData)
    })
}
