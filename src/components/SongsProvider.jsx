/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { createSong, getSongs, updateSong, deleteSong } from '@/lib/db'

const SongsContext = createContext(null)

export function SongsProvider({ children }) {
    const { user } = useAuth()
    const [songs, setSongs] = useState([])
    const [activeSongId, setActiveSongId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'unsaved'
    const saveTimerRef = useRef(null)

    // Load songs on user change
    useEffect(() => {
        if (!user) {
            setTimeout(() => {
                setSongs([])
                setActiveSongId(null)
                setLoading(false)
            }, 0)
            return
        }

        let cancelled = false
        setTimeout(() => setLoading(true), 0)

        getSongs(user.uid, user.email).then((data) => {
            if (cancelled) return
            setSongs(data)
            if (data.length > 0) setActiveSongId(data[0].id)
            setLoading(false)
        }).catch((err) => {
            console.error('Failed to load songs:', err)
            if (!cancelled) setLoading(false)
        })

        return () => { cancelled = true }
    }, [user])

    const activeSong = songs.find((s) => s.id === activeSongId) || null

    // Create new song
    const handleCreate = useCallback(async () => {
        if (!user) return
        try {
            const song = await createSong(user.uid)
            setSongs((prev) => [song, ...prev])
            setActiveSongId(song.id)
            return song
        } catch (err) {
            console.error('Failed to create song:', err)
        }
    }, [user])

    // Delete song
    const handleDelete = useCallback(async (songId) => {
        try {
            await deleteSong(songId)
            setSongs((prev) => {
                const remaining = prev.filter((s) => s.id !== songId)
                if (activeSongId === songId) {
                    setActiveSongId(remaining.length > 0 ? remaining[0].id : null)
                }
                return remaining
            })
        } catch (err) {
            console.error('Failed to delete song:', err)
        }
    }, [activeSongId])

    // Update song locally + autosave with debounce
    const handleUpdate = useCallback((songId, data) => {
        // Prevent update if we know it's read only for active song
        if (activeSongId === songId && activeSong) {
            const isOwner = activeSong.ownerId === user?.uid
            const isEditor = activeSong.sharedRoles?.[user?.email?.toLowerCase()] === 'editor'
            if (!isOwner && !isEditor) return
        }

        // Optimistic local update
        setSongs((prev) =>
            prev.map((s) => (s.id === songId ? { ...s, ...data } : s))
        )
        setSaveStatus('unsaved')

        // Debounced Firestore save
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(async () => {
            setSaveStatus('saving')
            try {
                await updateSong(songId, data)
                setSaveStatus('saved')
            } catch {
                setSaveStatus('unsaved')
            }
        }, 1000)
    }, [])

    const isOwner = activeSong ? activeSong.ownerId === user?.uid : false
    const isEditor = activeSong && user ? activeSong.sharedRoles?.[user.email?.toLowerCase()] === 'editor' : false
    const isReadOnly = activeSong ? (!isOwner && !isEditor) : false

    const value = {
        songs,
        activeSong,
        activeSongId,
        setActiveSongId,
        loading,
        saveStatus,
        isReadOnly,
        isOwner,
        createSong: handleCreate,
        updateSong: handleUpdate,
        deleteSong: handleDelete,
    }

    return (
        <SongsContext.Provider value={value}>
            {children}
        </SongsContext.Provider>
    )
}

export function useSongs() {
    const context = useContext(SongsContext)
    if (!context) throw new Error('useSongs must be used within SongsProvider')
    return context
}
