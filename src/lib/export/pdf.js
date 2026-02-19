import jsPDF from 'jspdf'

/**
 * Generate a PDF song sheet from song data
 */
export async function exportSongPDF(song) {
  const lines = parseSongContent(song.content)
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ── Title ──
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(22)
  pdf.text(song.title || 'Untitled Song', margin, y)
  y += 10

  // ── Song meta ──
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(9)
  pdf.setTextColor(120, 120, 120)

  const meta = []
  if (song.key) meta.push(`Key: ${song.key}`)
  meta.push(`Tempo: ${song.tempo || 120} BPM`)
  if (song.capo > 0) meta.push(`Capo: ${song.capo}`)
  pdf.text(meta.join('  ·  '), margin, y)
  y += 8

  // ── Separator ──
  pdf.setDrawColor(200, 200, 200)
  pdf.line(margin, y, pageWidth - margin, y)
  y += 8

  // ── Content ──
  pdf.setTextColor(0, 0, 0)

  for (const line of lines) {
    // Check page break
    if (y > 270) {
      pdf.addPage()
      y = margin
    }

    // Chords line
    if (line.chords && line.chords.length > 0) {
      pdf.setFont('courier', 'bold')
      pdf.setFontSize(10)
      pdf.setTextColor(60, 60, 160)

      // Build chord line string with spacing
      let chordLine = ''
      const sortedChords = [...line.chords].sort((a, b) => a.position - b.position)

      for (const chord of sortedChords) {
        // Approximate position based on pixel offset (normalize to text width)
        const approxPos = Math.floor(chord.position / 8)
        while (chordLine.length < approxPos) chordLine += ' '
        chordLine += chord.name + ' '
      }

      pdf.text(chordLine.trimEnd(), margin, y)
      y += 4
    }

    // Lyrics line
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(30, 30, 30)

    const lyricText = line.lyrics || ''
    if (lyricText.trim()) {
      // Word wrap long lyrics
      const wrappedLines = pdf.splitTextToSize(lyricText, contentWidth)
      for (const wl of wrappedLines) {
        if (y > 270) {
          pdf.addPage()
          y = margin
        }
        pdf.text(wl, margin, y)
        y += 5
      }
    }

    y += 2 // spacing between lines
  }

  // ── Footer ──
  const pageCount = pdf.internal.getNumberOfPages()
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(7)
  pdf.setTextColor(180, 180, 180)

  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i)
    pdf.text(
      `${song.title || 'Untitled'} — Created with About You`,
      margin,
      290
    )
    pdf.text(`${i} / ${pageCount}`, pageWidth - margin - 10, 290)
  }

  // Save
  const filename = `${(song.title || 'song').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`
  pdf.save(filename)
}

function parseSongContent(content) {
  if (!content) return [{ lyrics: '', chords: [] }]
  try {
    const parsed = JSON.parse(content)
    if (Array.isArray(parsed)) return parsed
  } catch {
    return content.split('\n').map((line) => ({ lyrics: line, chords: [] }))
  }
  return [{ lyrics: '', chords: [] }]
}
