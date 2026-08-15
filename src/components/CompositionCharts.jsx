import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const tooltipStyle = {
  background: 'var(--ink-3)',
  border: '1px solid var(--rule)',
  borderRadius: 4,
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  color: 'var(--text)',
}

const legendStyle = { fontSize: 12, fontFamily: 'var(--font-mono)' }

const PALETTE = ['#e2a33d', '#55b98a', '#e2604f', '#4f8fe2', '#9a7fd1', '#7a6230']

function ChartCard({ title, note, children }) {
  return (
    <div style={{ background: 'var(--ink-2)', border: '1px solid var(--rule)', borderRadius: 6, padding: '18px 18px 8px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 2 }}>{title}</div>
      {note && <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 10 }}>{note}</div>}
      <div style={{ width: '100%', height: 260 }}>{children}</div>
    </div>
  )
}

function Donut({ data }) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} stroke="var(--ink-2)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => v.toLocaleString()} />
        <Legend wrapperStyle={legendStyle} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default function CompositionCharts({ items, periodLabels }) {
  if (!periodLabels || periodLabels.length === 0) return null
  const i = periodLabels.length - 1 // latest period
  const get = (key) => items[key]?.values?.[i]
  const positive = (n) => (typeof n === 'number' && n > 0 ? n : 0)

  // Asset mix: cash, receivables, inventory, and a plug for everything else
  const cash = positive(get('cash'))
  const receivables = positive(get('receivables'))
  const inventory = positive(get('inventory'))
  const totalAssets = get('totalAssets')
  const knownAssets = cash + receivables + inventory
  const otherAssets = typeof totalAssets === 'number' ? Math.max(totalAssets - knownAssets, 0) : 0
  const assetData = [
    { name: 'Cash & Equivalents', value: cash },
    { name: 'Receivables', value: receivables },
    { name: 'Inventory', value: inventory },
    { name: 'Other Assets', value: otherAssets },
  ].filter((d) => d.value > 0)

  // Capital structure: liabilities vs equity
  const totalLiabilities = positive(get('totalLiabilities'))
  const totalEquity = positive(get('totalEquity'))
  const capStructureData = [
    { name: 'Total Liabilities', value: totalLiabilities },
    { name: 'Total Equity', value: totalEquity },
  ].filter((d) => d.value > 0)

  // Where revenue goes: COGS, opex, interest, tax, and what's left as net income
  const revenue = get('revenue')
  const cogs = positive(get('cogs'))
  const opex = positive(get('opex'))
  const interestExpense = positive(get('interestExpense'))
  const taxExpense = positive(get('taxExpense'))
  const netIncome = get('netIncome')
  const spentSoFar = cogs + opex + interestExpense + taxExpense
  const remainder = typeof revenue === 'number' ? Math.max(revenue - spentSoFar, 0) : typeof netIncome === 'number' ? Math.max(netIncome, 0) : 0
  const expenseData = [
    { name: 'Cost of Goods Sold', value: cogs },
    { name: 'Operating Expenses', value: opex },
    { name: 'Interest Expense', value: interestExpense },
    { name: 'Tax Expense', value: taxExpense },
    { name: 'Net Income (remainder)', value: remainder },
  ].filter((d) => d.value > 0)

  const anyData = assetData.length > 0 || capStructureData.length > 0 || expenseData.length > 0
  if (!anyData) return null

  return (
    <div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: 14 }}>
        NO. 05 — COMPOSITION ({periodLabels[i]})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
        {assetData.length > 0 && (
          <ChartCard title="Asset Mix" note="Where the balance sheet's assets sit">
            <Donut data={assetData} />
          </ChartCard>
        )}
        {capStructureData.length > 0 && (
          <ChartCard title="Capital Structure" note="How the company is financed">
            <Donut data={capStructureData} />
          </ChartCard>
        )}
        {expenseData.length > 0 && (
          <ChartCard title="Where Revenue Goes" note="Costs vs. what's left as profit">
            <Donut data={expenseData} />
          </ChartCard>
        )}
      </div>
    </div>
  )
}
