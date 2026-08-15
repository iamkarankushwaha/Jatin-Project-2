import React from 'react'

const GROUP_LABELS = {
  income: 'Income Statement',
  balance: 'Balance Sheet',
  cashflow: 'Cash Flow',
}

export default function DataTable({ items, periodLabels, onEdit }) {
  const groups = ['income', 'balance', 'cashflow']
  const hasAny = Object.keys(items).length > 0

  if (!hasAny) return null

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: 14 }}>
        NO. 02 — EXTRACTED FIGURES <span style={{ color: 'var(--accent)' }}>· editable</span>
      </div>

      {groups.map((g) => {
        const rows = Object.entries(items).filter(([, v]) => v.group === g)
        if (rows.length === 0) return null
        return (
          <div key={g} style={{ marginBottom: 28 }}>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 15,
                color: 'var(--accent)',
                borderBottom: '1px solid var(--rule)',
                paddingBottom: 8,
                marginBottom: 4,
              }}
            >
              {GROUP_LABELS[g]}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Line item</th>
                  {periodLabels.map((p, i) => (
                    <th key={i} style={{ ...thStyle, textAlign: 'right' }}>
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([key, row]) => (
                  <tr key={key} title={row.sourceText}>
                    <td style={tdLabelStyle}>{row.label}</td>
                    {periodLabels.map((_, i) => (
                      <td key={i} style={tdNumStyle}>
                        <input
                          className="num"
                          value={row.values[i] ?? ''}
                          onChange={(e) => onEdit(key, i, e.target.value)}
                          style={inputStyle}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

const thStyle = {
  textAlign: 'left',
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  letterSpacing: '0.06em',
  color: 'var(--text-dim)',
  padding: '6px 10px',
  borderBottom: '1px solid var(--rule-soft)',
}

const tdLabelStyle = {
  padding: '9px 10px',
  fontSize: 14,
  borderBottom: '1px solid var(--rule-soft)',
}

const tdNumStyle = {
  padding: '4px 6px',
  textAlign: 'right',
  borderBottom: '1px solid var(--rule-soft)',
}

const inputStyle = {
  width: 110,
  textAlign: 'right',
  background: 'transparent',
  border: '1px solid transparent',
  color: 'var(--text)',
  fontSize: 14,
  padding: '6px 8px',
  borderRadius: 3,
}
