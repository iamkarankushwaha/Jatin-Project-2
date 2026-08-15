const div = (a, b) => (typeof a === 'number' && typeof b === 'number' && b !== 0 ? a / b : null)

export const RATIO_DEFS = [
  { key: 'currentRatio', label: 'Current Ratio', group: 'Liquidity', fmt: 'x' },
  { key: 'quickRatio', label: 'Quick Ratio', group: 'Liquidity', fmt: 'x' },
  { key: 'grossMargin', label: 'Gross Margin', group: 'Profitability', fmt: 'pct' },
  { key: 'operatingMargin', label: 'Operating Margin', group: 'Profitability', fmt: 'pct' },
  { key: 'netMargin', label: 'Net Margin', group: 'Profitability', fmt: 'pct' },
  { key: 'roa', label: 'Return on Assets', group: 'Profitability', fmt: 'pct' },
  { key: 'roe', label: 'Return on Equity', group: 'Profitability', fmt: 'pct' },
  { key: 'debtToEquity', label: 'Debt-to-Equity', group: 'Leverage', fmt: 'x' },
  { key: 'assetTurnover', label: 'Asset Turnover', group: 'Efficiency', fmt: 'x' },
]

function at(items, key, i) {
  const row = items[key]
  if (!row) return null
  const v = row.values[i]
  return typeof v === 'number' ? v : null
}

export function computeRatios(items, periodLabels) {
  return periodLabels.map((period, i) => {
    const revenue = at(items, 'revenue', i)
    const cogs = at(items, 'cogs', i)
    const grossProfitRaw = at(items, 'grossProfit', i)
    const grossProfit = grossProfitRaw !== null ? grossProfitRaw : revenue !== null && cogs !== null ? revenue - cogs : null
    const operatingIncome = at(items, 'operatingIncome', i)
    const netIncome = at(items, 'netIncome', i)
    const currentAssets = at(items, 'currentAssets', i)
    const currentLiabilities = at(items, 'currentLiabilities', i)
    const inventory = at(items, 'inventory', i)
    const totalAssets = at(items, 'totalAssets', i)
    const totalLiabilities = at(items, 'totalLiabilities', i)
    const totalEquity = at(items, 'totalEquity', i)

    return {
      period,
      revenue,
      netIncome,
      totalAssets,
      currentRatio: div(currentAssets, currentLiabilities),
      quickRatio: inventory !== null ? div(currentAssets - inventory, currentLiabilities) : div(currentAssets, currentLiabilities),
      grossMargin: div(grossProfit, revenue),
      operatingMargin: div(operatingIncome, revenue),
      netMargin: div(netIncome, revenue),
      roa: div(netIncome, totalAssets),
      roe: div(netIncome, totalEquity),
      debtToEquity: div(totalLiabilities, totalEquity),
      assetTurnover: div(revenue, totalAssets),
    }
  })
}

export function fmtRatio(value, fmt) {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  if (fmt === 'pct') return `${(value * 100).toFixed(1)}%`
  return `${value.toFixed(2)}x`
}
