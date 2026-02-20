import { Key, Chord, Note, Scale, Interval } from 'tonal'

/**
 * Detect the most likely key from a list of chord names
 */
export function detectKey(chordNames) {
  if (!chordNames || chordNames.length === 0) return null

  // Get unique root notes from chords
  const roots = chordNames
    .map((name) => Chord.get(name).tonic)
    .filter(Boolean)

  if (roots.length === 0) return null

  // Try all major and minor keys, score by how many chords fit
  const allKeys = [
    ...Note.names().map((n) => `${n} major`),
    ...Note.names().map((n) => `${n} minor`),
  ]

  let bestKey = null
  let bestScore = 0

  for (const keyName of allKeys) {
    const keyType = keyName.includes('minor') ? 'minor' : 'major'

    let chordList
    if (keyType === 'major') {
      const k = Key.majorKey(keyName.split(' ')[0])
      chordList = k.chords
    } else {
      const k = Key.minorKey(keyName.split(' ')[0])
      chordList = k.natural.chords
    }

    const score = chordNames.filter((name) => {
      const simplified = name.replace(/7|9|11|13|maj|sus|add|dim|aug/gi, '').trim()
      return chordList.some((kc) => {
        const kcSimple = kc.replace(/7|9|11|13|maj|sus|add|dim|aug/gi, '').trim()
        return kcSimple === simplified || kc === name
      })
    }).length

    if (score > bestScore) {
      bestScore = score
      bestKey = keyName
    }
  }

  return bestKey
}

/**
 * Get chords in a given key
 */
export function getChordsInKey(keyName) {
  if (!keyName) return []

  const parts = keyName.split(' ')
  const root = parts[0]
  const type = parts[1] || 'major'

  try {
    if (type === 'major') {
      const k = Key.majorKey(root)
      return k.chords.filter(Boolean)
    } else {
      const k = Key.minorKey(root)
      return k.natural.chords.filter(Boolean)
    }
  } catch {
    return []
  }
}

/**
 * Get scale notes for a key
 */
export function getScaleNotes(keyName) {
  if (!keyName) return []

  const parts = keyName.split(' ')
  const root = parts[0]
  const type = parts[1] || 'major'

  try {
    const scaleName = type === 'minor' ? 'minor' : 'major'
    return Scale.get(`${root} ${scaleName}`).notes
  } catch {
    return []
  }
}

/**
 * Get the notes of a chord
 */
export function getChordNotes(chordName) {
  if (!chordName) return []
  const chord = Chord.get(chordName)
  return chord.notes || []
}

/**
 * Get chord intervals
 */
export function getChordIntervals(chordName) {
  if (!chordName) return []
  const chord = Chord.get(chordName)
  return chord.intervals || []
}

/**
 * Transpose a chord by semitones
 */
export function transposeChord(chordName, semitones) {
  if (!chordName || semitones === 0) return chordName

  const chord = Chord.get(chordName)
  if (!chord.tonic) return chordName

  const newTonic = Note.transpose(chord.tonic, Interval.fromSemitones(semitones))
  const newTonicName = Note.enharmonic(newTonic)

  // Rebuild chord name with new tonic
  const suffix = chordName.slice(chord.tonic.length)
  return newTonicName + suffix
}

/**
 * Transpose all chords in content by semitones
 */
export function transposeContent(lines, semitones) {
  if (!lines || semitones === 0) return lines

  return lines.map((line) => ({
    ...line,
    chords: line.chords.map((chord) => ({
      ...chord,
      name: transposeChord(chord.name, semitones),
    })),
  }))
}

/**
 * Extract all chord names from editor content
 */
export function extractChords(lines) {
  if (!lines) return []
  const chords = []
  for (const line of lines) {
    if (line.chords) {
      for (const chord of line.chords) {
        if (chord.name && !chords.includes(chord.name)) {
          chords.push(chord.name)
        }
      }
    }
  }
  return chords
}

/**
 * Get MIDI note numbers for a chord (for piano visualization)
 */
export function getChordMidi(chordName, octave = 4) {
  const notes = getChordNotes(chordName)
  return notes.map((n) => Note.midi(`${n}${octave}`)).filter(Boolean)
}
