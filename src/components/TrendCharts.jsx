import React from 'react'
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts'

const tooltipStyle = {
  background: 'var(--ink-3)',
  border: '1px solid var(--rule)',
  borderRadius: 4,
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'var(--text)',
}

const axisProps = {
  stroke: 'var(--rule)',
  tick: { fill: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)' },
}

const legendStyle = { fontSize: 12, fontFamily: 'var(--font-mono)' }

function ChartCard({ title, children }) {
  return (
    <div style={{ background: 'var(--ink-2)', border: '1px solid var(--rule)', borderRadius: 6, padding: '18px 18px 8px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 12 }}>{title}</div>
      <div style={{ width: '100%', height: 260 }}>{children}</div>
    </div>
  )
}

export default function TrendCharts({ ratiosByPeriod }) {
  if (!ratiosByPeriod || ratiosByPeriod.length === 0) return null

  const hasMultiplePeriods = ratiosByPeriod.length > 1

  const marginData = ratiosByPeriod.map((r) => ({
    period: r.period,
    'Gross %': r.grossMargin !== null ? +(r.grossMargin * 100).toFixed(1) : null,
    'Operating %': r.operatingMargin !== null ? +(r.operatingMargin * 100).toFixed(1) : null,
    'Net %': r.netMargin !== null ? +(r.netMargin * 100).toFixed(1) : null,
  }))

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: 14 }}>
        NO. 04 — TRENDS {!hasMultiplePeriods && <span style={{ color: 'var(--text-dim)' }}>(upload more than one period to compare across bars)</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 16 }}>
        <ChartCard title="Revenue vs. Net Income">
          <ResponsiveContainer>
            <BarChart data={ratiosByPeriod}>
              <CartesianGrid stroke="var(--rule-soft)" vertical={false} />
              <XAxis dataKey="period" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Bar dataKey="revenue" name="Revenue" fill="var(--rule)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="netIncome" name="Net Income" fill="var(--accent)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Margins">
          <ResponsiveContainer>
            <BarChart data={marginData}>
              <CartesianGrid stroke="var(--rule-soft)" vertical={false} />
              <XAxis dataKey="period" {...axisProps} />
              <YAxis {...axisProps} unit="%" />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={legendStyle} />
              <Bar dataKey="Gross %" fill="var(--pos)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Operating %" fill="var(--accent)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="Net %" fill="var(--neg)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Liquidity: Current Ratio">
          <ResponsiveContainer>
            <BarChart data={ratiosByPeriod}>
              <CartesianGrid stroke="var(--rule-soft)" vertical={false} />
              <XAxis dataKey="period" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="currentRatio" name="Current Ratio" fill="var(--pos)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Leverage: Debt-to-Equity">
          <ResponsiveContainer>
            <BarChart data={ratiosByPeriod}>
              <CartesianGrid stroke="var(--rule-soft)" vertical={false} />
              <XAxis dataKey="period" {...axisProps} />
              <YAxis {...axisProps} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="debtToEquity" name="Debt-to-Equity" fill="var(--neg)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
