// Known line items we look for, in priority order (more specific patterns first
// so e.g. "Total Liabilities and Equity" doesn't get claimed by "Total Liabilities").
export const LINE_ITEMS = [
  { key: 'revenue', label: 'Revenue', group: 'income', pattern: /(total\s+net\s+revenues?|net\s+revenues?|total\s+revenues?|total\s+net\s+sales|net\s+sales|total\s+sales|^revenue$|^sales$)/i },
  { key: 'cogs', label: 'Cost of Goods Sold', group: 'income', pattern: /(cost\s+of\s+(goods\s+sold|sales|revenue|products\s+sold)|^cogs$)/i },
  { key: 'grossProfit', label: 'Gross Profit', group: 'income', pattern: /gross\s+profit/i },
  { key: 'opex', label: 'Operating Expenses', group: 'income', pattern: /total\s+operating\s+expenses/i },
  { key: 'operatingIncome', label: 'Operating Income (EBIT)', group: 'income', pattern: /(operating\s+income|income\s+from\s+operations|operating\s+profit)/i },
  { key: 'interestExpense', label: 'Interest Expense', group: 'income', pattern: /interest\s+expense/i },
  { key: 'taxExpense', label: 'Income Tax Expense', group: 'income', pattern: /(income\s+tax\s+expense|provision\s+for\s+income\s+taxes)/i },
  { key: 'netIncome', label: 'Net Income', group: 'income', pattern: /(net\s+income|net\s+earnings|profit\s+for\s+the\s+(year|period)|net\s+profit)/i },
  { key: 'eps', label: 'Earnings per Share', group: 'income', pattern: /earnings\s+per\s+share/i },

  { key: 'cash', label: 'Cash & Equivalents', group: 'balance', pattern: /cash\s+and\s+cash\s+equivalents/i },
  { key: 'receivables', label: 'Accounts Receivable', group: 'balance', pattern: /(accounts\s+receivable|trade\s+receivables)/i },
  { key: 'inventory', label: 'Inventory', group: 'balance', pattern: /^inventor(y|ies)\b/i },
  { key: 'currentAssets', label: 'Total Current Assets', group: 'balance', pattern: /total\s+current\s+assets/i },
  { key: 'totalAssets', label: 'Total Assets', group: 'balance', pattern: /^total\s+assets$/i },
  { key: 'currentLiabilities', label: 'Total Current Liabilities', group: 'balance', pattern: /total\s+current\s+liabilities/i },
  { key: 'longTermDebt', label: 'Long-Term Debt', group: 'balance', pattern: /long[\s-]?term\s+(debt|borrowings)/i },
  { key: 'totalLiabilities', label: 'Total Liabilities', group: 'balance', pattern: /^total\s+liabilities$/i },
  { key: 'totalEquity', label: "Total Equity", group: 'balance', pattern: /(total\s+(stockholders|shareholders)[’']?\s+equity|^total\s+equity$)/i },

  { key: 'operatingCF', label: 'Operating Cash Flow', group: 'cashflow', pattern: /(net\s+cash\s+(provided\s+by|from|generated\s+by)\s+operating\s+activities|cash\s+flow(s)?\s+from\s+operations)/i },
  { key: 'investingCF', label: 'Investing Cash Flow', group: 'cashflow', pattern: /net\s+cash\s+(used\s+in|from)\s+investing\s+activities/i },
  { key: 'financingCF', label: 'Financing Cash Flow', group: 'cashflow', pattern: /net\s+cash\s+(used\s+in|from)\s+financing\s+activities/i },
  { key: 'capex', label: 'Capital Expenditures', group: 'cashflow', pattern: /(capital\s+expenditures?|purchases?\s+of\s+property[, ]+plant\s+and\s+equipment)/i },
]

const NUMBER_RE = /\(?-?\$?\d{1,3}(?:,\d{3})*(?:\.\d+)?\)?%?/g

function parseNumbers(text) {
  const matches = text.match(NUMBER_RE) || []
  return matches
    .map((raw) => {
      const isNeg = raw.startsWith('(') || raw.trim().startsWith('-')
      const cleaned = raw.replace(/[()$,%]/g, '').trim()
      const val = parseFloat(cleaned)
      if (Number.isNaN(val)) return null
      return isNeg ? -Math.abs(val) : val
    })
    .filter((v) => v !== null)
}

// Try to find a header row with period labels (years), e.g. "2023 2022 2021"
function detectPeriods(lines) {
  const yearLine = lines.find((l) => {
    const years = l.text.match(/\b(19|20)\d{2}\b/g)
    return years && years.length >= 2
  })
  if (yearLine) {
    const years = yearLine.text.match(/\b(19|20)\d{2}\b/g)
    return years
  }
  return null
}

export function extractFinancials(lines) {
  // Pass 1: collect every candidate row per line item — a label can legitimately
  // appear more than once (the statement's face, a footnote table, an MD&A
  // mention), and those occurrences often have different numbers of columns
  // (e.g. a debt-maturity schedule with many more columns than the balance
  // sheet's actual year-over-year row).
  const candidatesByKey = {}
  for (const item of LINE_ITEMS) {
    const candidates = []
    for (const line of lines) {
      const labelMatch = line.text.match(item.pattern)
      if (!labelMatch) continue
      const rest = line.text.slice(labelMatch.index + labelMatch[0].length)
      const values = parseNumbers(rest)
      if (values.length === 0) continue
      candidates.push({ label: item.label, group: item.group, values, sourceText: line.text.trim(), page: line.page })
    }
    if (candidates.length) candidatesByKey[item.key] = candidates
  }

  // Pass 2: figure out the canonical number of periods. Most matched rows
  // should agree on this if they're really from the same comparative
  // statement, so the most common column count across all candidates wins —
  // this is what lets us reject a footnote table row that happens to have
  // more (or fewer) numbers than the real data row.
  const lengthCounts = {}
  Object.values(candidatesByKey).forEach((cands) => {
    cands.forEach((c) => {
      lengthCounts[c.values.length] = (lengthCounts[c.values.length] || 0) + 1
    })
  })
  let modeLen = 0
  let modeCount = -1
  Object.entries(lengthCounts).forEach(([len, count]) => {
    const l = Number(len)
    if (count > modeCount || (count === modeCount && l > modeLen)) {
      modeLen = l
      modeCount = count
    }
  })
  if (modeLen === 0) modeLen = 1

  // Pass 3: for each line item, pick the candidate closest to the canonical
  // column count (exact match preferred), then align it to that count —
  // trimming extra leading numbers (footnote refs, stray page numbers) or
  // padding missing leading periods with nulls, always keeping the rightmost
  // columns intact since that's where real data columns consistently land.
  const found = {}
  Object.entries(candidatesByKey).forEach(([key, cands]) => {
    let chosen =
      cands.find((c) => c.values.length === modeLen) ||
      cands.slice().sort((a, b) => {
        const da = Math.abs(a.values.length - modeLen)
        const db = Math.abs(b.values.length - modeLen)
        return da !== db ? da - db : b.values.length - a.values.length
      })[0]

    let values = chosen.values
    if (values.length > modeLen) values = values.slice(values.length - modeLen)
    else if (values.length < modeLen) values = Array(modeLen - values.length).fill(null).concat(values)

    found[key] = { label: chosen.label, group: chosen.group, values, sourceText: chosen.sourceText, page: chosen.page }
  })

  const periods = detectPeriods(lines)
  const periodLabels =
    periods && periods.length === modeLen
      ? periods
      : Array.from({ length: modeLen }, (_, i) => (modeLen - i === 1 ? 'Latest' : `Period -${modeLen - i - 1}`))

  return { items: found, periodLabels }
}
