import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

/**
 * Extracts text from a PDF file, reconstructing lines from positioned
 * text fragments (pdf.js gives us disconnected words with x/y coords,
 * not paragraphs). Fragments within a small vertical tolerance on the
 * same page are merged into one line, ordered left to right.
 */
export async function extractPdfLines(file) {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise
  const lines = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()

    const items = content.items
      .filter((it) => it.str && it.str.trim().length > 0)
      .map((it) => ({
        text: it.str,
        x: it.transform[4],
        y: Math.round(it.transform[5]),
      }))

    // group by rounded y (line), tolerant of small jitter
    const rows = new Map()
    for (const it of items) {
      let key = null
      for (const existingY of rows.keys()) {
        if (Math.abs(existingY - it.y) <= 2) {
          key = existingY
          break
        }
      }
      if (key === null) key = it.y
      if (!rows.has(key)) rows.set(key, [])
      rows.get(key).push(it)
    }

    const sortedYs = Array.from(rows.keys()).sort((a, b) => b - a)
    for (const y of sortedYs) {
      const rowItems = rows.get(y).sort((a, b) => a.x - b.x)
      const text = rowItems
        .map((it) => it.text)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (text) lines.push({ page: pageNum, text })
    }
  }

  return lines
}
