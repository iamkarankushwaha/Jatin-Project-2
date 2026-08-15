import React, { useMemo, useState } from 'react'
import UploadZone from './components/UploadZone.jsx'
import DataTable from './components/DataTable.jsx'
import RatioCards from './components/RatioCards.jsx'
import TrendCharts from './components/TrendCharts.jsx'
import CompositionCharts from './components/CompositionCharts.jsx'
import { extractPdfLines } from './lib/pdfParse.js'
import { extractFinancials } from './lib/extractFinancials.js'
import { computeRatios } from './lib/ratios.js'

function pickPrimaryColumn(items) {
  const counts = {}
  Object.values(items).forEach((row) => {
    row.values.forEach((v, i) => {
      if (typeof v === 'number') counts[i] = (counts[i] || 0) + 1
    })
  })
  let best = 0
  let bestCount = -1
  Object.entries(counts).forEach(([i, c]) => {
    if (c > bestCount) {
      best = Number(i)
      bestCount = c
    }
  })
  return best
}

function mergeFileResults(results) {
  if (results.length === 1) {
    return { items: results[0].items, periodLabels: results[0].periodLabels }
  }

  const periodLabels = []
  const primaryIdx = []
  results.forEach((r) => {
    const idx = pickPrimaryColumn(r.items)
    primaryIdx.push(idx)
    const detected = r.periodLabels[idx]
    const fallback = r.fileName.replace(/\.pdf$/i, '')
    periodLabels.push(detected && /^\d{4}$/.test(detected) ? detected : fallback)
  })

  const merged = {}
  results.forEach((r, fileI) => {
    Object.entries(r.items).forEach(([key, row]) => {
      if (!merged[key]) merged[key] = { label: row.label, group: row.group, values: results.map(() => null), sourceText: row.sourceText }
      merged[key].values[fileI] = row.values[primaryIdx[fileI]] ?? null
    })
  })

  return { items: merged, periodLabels }
}

export default function App() {
  const [busy, setBusy] = useState(false)
  const [fileNames, setFileNames] = useState([])
  const [items, setItems] = useState({})
  const [periodLabels, setPeriodLabels] = useState([])
  const [error, setError] = useState(null)

  const ratiosByPeriod = useMemo(() => computeRatios(items, periodLabels), [items, periodLabels])

  async function handleFiles(files) {
    setBusy(true)
    setError(null)
    try {
      const results = []
      for (const file of files) {
        const lines = await extractPdfLines(file)
        const { items: fileItems, periodLabels: filePeriods } = extractFinancials(lines)
        if (Object.keys(fileItems).length === 0) {
          throw new Error(
            `Couldn't find recognizable financial line items in "${file.name}". It may be a scanned/image-only PDF, or use non-standard labels.`
          )
        }
        results.push({ fileName: file.name, items: fileItems, periodLabels: filePeriods })
      }
      const merged = mergeFileResults(results)
      setItems(merged.items)
      setPeriodLabels(merged.periodLabels)
      setFileNames(files.map((f) => f.name))
    } catch (e) {
      setError(e.message || 'Something went wrong reading that PDF.')
    } finally {
      setBusy(false)
    }
  }

  function handleEdit(key, i, rawValue) {
    setItems((prev) => {
      const next = { ...prev }
      const row = { ...next[key], values: [...next[key].values] }
      const num = rawValue.trim() === '' ? null : parseFloat(rawValue.replace(/,/g, ''))
      row.values[i] = Number.isNaN(num) ? null : num
      next[key] = row
      return next
    })
  }

  const hasData = Object.keys(items).length > 0

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent, transparent 27px, var(--rule-soft) 28px)',
        backgroundAttachment: 'local',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '56px 24px 100px' }}>
        <header style={{ marginBottom: 44, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: -24,
              top: 0,
              bottom: -20,
              width: 1,
              background: 'var(--neg)',
              opacity: 0.35,
              display: window.innerWidth > 700 ? 'block' : 'none',
            }}
          />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.16em', color: 'var(--accent)', marginBottom: 10 }}>
            LEDGER · FINANCIAL STATEMENT ANALYZER
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 600, margin: 0, lineHeight: 1.05 }}>
            Turn a financial statement PDF into a ratio analysis in seconds.
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: 16, maxWidth: 620, marginTop: 16 }}>
            Upload one or more statement PDFs. Figures are pulled and matched to standard line items,
            you can correct anything that was misread, and the ratios and trend charts update instantly —
            entirely in your browser, nothing is uploaded to a server.
          </p>
        </header>

        <section style={{ marginBottom: 40 }}>
          <UploadZone onFiles={handleFiles} busy={busy} fileNames={fileNames} />
          {error && (
            <div style={{ marginTop: 14, color: 'var(--neg)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}
        </section>

        {hasData && (
          <>
            <section style={{ marginBottom: 44 }}>
              <DataTable items={items} periodLabels={periodLabels} onEdit={handleEdit} />
            </section>
            <section style={{ marginBottom: 44 }}>
              <RatioCards ratiosByPeriod={ratiosByPeriod} periodLabels={periodLabels} />
            </section>
            <section style={{ marginBottom: 44 }}>
              <TrendCharts ratiosByPeriod={ratiosByPeriod} />
            </section>
            <section>
              <CompositionCharts items={items} periodLabels={periodLabels} />
            </section>
          </>
        )}

        <footer style={{ marginTop: 80, paddingTop: 20, borderTop: '1px solid var(--rule)', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-dim)' }}>
          Client-side extraction only — no accounts, no server, no cost. Built for coursework; verify extracted figures against the source before relying on them.
        </footer>
      </div>
    </div>
  )
}
