import React from 'react'
import { RATIO_DEFS, fmtRatio } from '../lib/ratios'

const GROUPS = ['Liquidity', 'Profitability', 'Leverage', 'Efficiency']

export default function RatioCards({ ratiosByPeriod, periodLabels }) {
  if (!ratiosByPeriod || ratiosByPeriod.length === 0) return null

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: 14 }}>
        NO. 03 — RATIO ANALYSIS
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {GROUPS.map((group) => {
          const defs = RATIO_DEFS.filter((d) => d.group === group)
          return (
            <div
              key={group}
              style={{
                background: 'var(--ink-2)',
                border: '1px solid var(--rule)',
                borderRadius: 6,
                padding: '18px 18px 14px',
                position: 'relative',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-dim)',
                  borderRadius: 3,
                  padding: '2px 6px',
                  transform: 'rotate(2deg)',
                }}
              >
                {group.toUpperCase()}
              </span>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 17, marginBottom: 14, maxWidth: '75%' }}>{group}</div>
              {defs.map((d) => (
                <div
                  key={d.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    padding: '7px 0',
                    borderTop: '1px solid var(--rule-soft)',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{d.label}</span>
                  <span className="num" style={{ fontSize: 15 }}>
                    {fmtRatio(ratiosByPeriod[ratiosByPeriod.length - 1][d.key], d.fmt)}
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      {periodLabels.length > 1 && (
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 10 }}>
          Showing most recent period ({periodLabels[periodLabels.length - 1]}). See trends below for the full history.
        </div>
      )}
    </div>
  )
}
