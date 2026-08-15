import React, { useCallback, useState } from 'react'

export default function UploadZone({ onFiles, busy, fileNames }) {
  const [dragOver, setDragOver] = useState(false)

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      setDragOver(false)
      const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type === 'application/pdf')
      if (files.length) onFiles(files)
    },
    [onFiles]
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      style={{
        border: `1.5px dashed ${dragOver ? 'var(--accent)' : 'var(--rule)'}`,
        borderRadius: 4,
        padding: '48px 32px',
        textAlign: 'center',
        background: dragOver ? 'rgba(226,163,61,0.06)' : 'var(--ink-2)',
        transition: 'border-color 120ms ease, background 120ms ease',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: 14 }}>
        NO. 01 — SOURCE DOCUMENT
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, marginBottom: 8 }}>
        {busy ? 'Reading statement…' : 'Drop financial statement PDFs here'}
      </div>
      <div style={{ color: 'var(--text-dim)', fontSize: 14, marginBottom: 22, maxWidth: 440, marginInline: 'auto' }}>
        Annual reports, 10-Ks, or income/balance-sheet PDFs. Multiple files are treated as separate periods and merged into one trend.
      </div>
      <label
        style={{
          display: 'inline-block',
          fontFamily: 'var(--font-mono)',
          fontSize: 13,
          letterSpacing: '0.04em',
          padding: '10px 20px',
          border: '1px solid var(--accent-dim)',
          borderRadius: 3,
          color: 'var(--accent)',
          cursor: 'pointer',
        }}
      >
        {busy ? 'Working…' : 'Choose files'}
        <input
          type="file"
          accept="application/pdf"
          multiple
          disabled={busy}
          onChange={(e) => {
            const files = Array.from(e.target.files || [])
            if (files.length) onFiles(files)
            e.target.value = ''
          }}
          style={{ display: 'none' }}
        />
      </label>
      {fileNames && fileNames.length > 0 && (
        <div style={{ marginTop: 20, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-dim)' }}>
          {fileNames.map((n) => (
            <div key={n}>· {n}</div>
          ))}
        </div>
      )}
    </div>
  )
}
