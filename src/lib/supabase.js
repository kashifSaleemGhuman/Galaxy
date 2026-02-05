/**
 * Supabase Storage Configuration
 * 
 * This module handles file uploads and downloads to/from Supabase Storage
 */

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase environment variables not configured. File uploads will not work.')
}

// Client for client-side operations (uses anon key)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Admin client for server-side operations (uses service role key)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// Storage bucket name for HR documents
export const HR_DOCUMENTS_BUCKET = 'hr-documents'

/**
 * Upload a file to Supabase Storage
 * @param {File|Buffer} file - File to upload
 * @param {string} path - Path in the bucket (e.g., "employees/emp123/offer-letter.pdf")
 * @param {string} bucket - Bucket name (default: HR_DOCUMENTS_BUCKET)
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadFile(file, path, bucket = HR_DOCUMENTS_BUCKET) {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  }

  try {
    // Convert File to Buffer if needed
    let fileBuffer
    if (file instanceof File) {
      const arrayBuffer = await file.arrayBuffer()
      fileBuffer = Buffer.from(arrayBuffer)
    } else {
      fileBuffer = file
    }

    // Determine content type
    let contentType = 'application/octet-stream'
    if (file instanceof File) {
      contentType = file.type
    } else if (Buffer.isBuffer(file)) {
      // Try to detect PDF from buffer
      if (fileBuffer[0] === 0x25 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x44 && fileBuffer[3] === 0x46) {
        contentType = 'application/pdf'
      } else if (path.endsWith('.pdf')) {
        contentType = 'application/pdf'
      }
    }

    // Upload file
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType,
        upsert: true // Overwrite if exists
      })

    if (error) {
      throw error
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path)

    return {
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('Error uploading file to Supabase:', error)
    throw error
  }
}

/**
 * Generate a signed URL for private file access (valid for 1 hour)
 * @param {string} path - Path in the bucket
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @param {string} bucket - Bucket name
 * @returns {Promise<string>} Signed URL
 */
export async function getSignedUrl(path, expiresIn = 3600, bucket = HR_DOCUMENTS_BUCKET) {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured')
  }

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw error
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error generating signed URL:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} path - Path in the bucket
 * @param {string} bucket - Bucket name
 * @returns {Promise<void>}
 */
export async function deleteFile(path, bucket = HR_DOCUMENTS_BUCKET) {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured')
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting file from Supabase:', error)
    throw error
  }
}

/**
 * Check if a bucket exists, create if it doesn't
 * @param {string} bucket - Bucket name
 * @returns {Promise<void>}
 */
export async function ensureBucketExists(bucket = HR_DOCUMENTS_BUCKET) {
  if (!supabaseAdmin) {
    throw new Error('Supabase not configured')
  }

  try {
    // Try to list files (this will fail if bucket doesn't exist)
    const { error } = await supabaseAdmin.storage.from(bucket).list('', { limit: 1 })
    
    if (error && error.message.includes('not found')) {
      // Bucket doesn't exist - Note: Creating buckets requires Supabase dashboard or API
      console.warn(`⚠️  Bucket "${bucket}" does not exist. Please create it in Supabase dashboard.`)
      throw new Error(`Bucket "${bucket}" does not exist. Please create it in Supabase dashboard.`)
    }
  } catch (error) {
    if (error.message.includes('not found')) {
      throw error
    }
    // Other errors are fine (bucket exists)
  }
}

