import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

const SONGS_COLLECTION = 'songs'

/**
 * Create a new song
 */
export async function createSong(userId, data = {}) {
  const songData = {
    ownerId: userId,
    title: data.title || 'Untitled Song',
    content: data.content || '',
    key: data.key || '',
    tempo: data.tempo || 120,
    capo: data.capo || 0,
    tags: data.tags || [],
    visibility: data.visibility || 'private',
    shareId: data.shareId || generateShareId(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, SONGS_COLLECTION), songData)
  return { id: docRef.id, ...songData }
}

/**
 * Get all songs for a user
 */
export async function getSongs(userId) {
  const q = query(
    collection(db, SONGS_COLLECTION),
    where('ownerId', '==', userId),
    orderBy('updatedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }))
}

/**
 * Get a single song by ID
 */
export async function getSong(songId) {
  const docRef = doc(db, SONGS_COLLECTION, songId)
  const snapshot = await getDoc(docRef)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() }
}

/**
 * Get a song by its shareId
 */
export async function getSongByShareId(shareId) {
  const q = query(
    collection(db, SONGS_COLLECTION),
    where('shareId', '==', shareId)
  )
  const snapshot = await getDocs(q)
  if (snapshot.empty) return null
  const songDoc = snapshot.docs[0]
  return { id: songDoc.id, ...songDoc.data() }
}

/**
 * Update a song
 */
export async function updateSong(songId, data) {
  const docRef = doc(db, SONGS_COLLECTION, songId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Delete a song
 */
export async function deleteSong(songId) {
  const docRef = doc(db, SONGS_COLLECTION, songId)
  await deleteDoc(docRef)
}

/**
 * Generate a random share ID
 */
function generateShareId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
