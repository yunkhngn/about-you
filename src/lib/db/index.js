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
    sharedEmails: data.sharedEmails || [],
    sharedRoles: data.sharedRoles || {},
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  const docRef = await addDoc(collection(db, SONGS_COLLECTION), songData)
  return { id: docRef.id, ...songData }
}

/**
 * Get all songs for a user (owned + shared with them)
 */
export async function getSongs(userId, userEmail) {
  // Query 1: Songs owned by user
  const qOwned = query(
    collection(db, SONGS_COLLECTION),
    where('ownerId', '==', userId)
  )

  const promises = [getDocs(qOwned)]

  // Query 2: Songs shared with user via email
  if (userEmail) {
    const qShared = query(
      collection(db, SONGS_COLLECTION),
      where('sharedEmails', 'array-contains', userEmail)
    )
    promises.push(getDocs(qShared))
  }

  const snapshots = await Promise.all(promises)
  
  // Merge and deduplicate by ID
  const songsMap = new Map()
  snapshots.forEach((snap) => {
    snap.docs.forEach((doc) => {
      songsMap.set(doc.id, { id: doc.id, ...doc.data() })
    })
  })

  // Convert to array and sort by updatedAt desc
  return Array.from(songsMap.values()).sort((a, b) => {
    const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0
    const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0
    return timeB - timeA
  })
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
