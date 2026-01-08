/**
 * Cloudinary Image Upload Utility
 * 
 * Handles client-side image uploads to Cloudinary using unsigned uploads.
 * No backend or API keys required.
 */

const CLOUDINARY_CLOUD_NAME = 'dzpdypyxq'
const CLOUDINARY_UPLOAD_PRESET = 'esporizon_uploads'
const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']

interface CloudinaryResponse {
    secure_url: string
    public_id: string
    width: number
    height: number
    format: string
    bytes: number
}

/**
 * Validates an image file for type and size
 * @throws Error with user-friendly message if validation fails
 */
function validateImageFile(file: File): void {
    // Check if file is an image
    if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(
            'Invalid file type. Only JPEG, PNG, GIF, and WEBP images are allowed.'
        )
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(2)
        throw new Error(
            `File size (${sizeMB}MB) exceeds the maximum limit of 5MB.`
        )
    }
}

/**
 * Uploads an image to Cloudinary
 * @param file - The image file to upload
 * @returns The secure URL of the uploaded image
 * @throws Error if upload fails
 */
export async function uploadImage(file: File): Promise<string> {
    // Validate file first
    validateImageFile(file)

    // Create form data
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)

    try {
        const response = await fetch(CLOUDINARY_UPLOAD_URL, {
            method: 'POST',
            body: formData,
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(
                errorData.error?.message || `Upload failed with status ${response.status}`
            )
        }

        const data: CloudinaryResponse = await response.json()

        // Return the secure URL
        return data.secure_url
    } catch (error) {
        // Handle network errors
        if (error instanceof TypeError) {
            throw new Error('Network error. Please check your internet connection and try again.')
        }

        // Re-throw other errors
        throw error
    }
}

/**
 * Validates if a file is an acceptable image
 * @returns true if valid, false otherwise
 */
export function isValidImageFile(file: File): boolean {
    try {
        validateImageFile(file)
        return true
    } catch {
        return false
    }
}

/**
 * Gets a human-readable file size string
 */
export function getFileSizeString(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
