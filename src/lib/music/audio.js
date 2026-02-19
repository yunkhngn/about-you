import * as Tone from 'tone'

let synth = null

function getSynth() {
  if (!synth) {
    synth = new Tone.PolySynth(Tone.Synth, {
      maxPolyphony: 6,
      voice: Tone.Synth,
      options: {
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.02,
          decay: 0.3,
          sustain: 0.2,
          release: 1.5,
        },
        volume: -12,
      },
    })
    synth.toDestination()
  }
  return synth
}

/**
 * Play a single note
 */
export function playNote(note) {
  const s = getSynth()
  Tone.start()
  s.triggerAttackRelease(note, '4n')
}

/**
 * Play a chord (all notes together)
 */
export function playChord(notes, octave = 4) {
  const s = getSynth()
  Tone.start()
  const notesWithOctave = notes.map((n) => {
    if (/\d/.test(n)) return n
    return `${n}${octave}`
  })
  s.triggerAttackRelease(notesWithOctave, '2n')
}

/**
 * Play a chord by name
 */
export async function playChordByName(chordName) {
  const { getChordNotes } = await import('@/lib/music/engine')
  const notes = getChordNotes(chordName)
  if (notes.length > 0) {
    playChord(notes)
  }
}
