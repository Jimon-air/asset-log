'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

export type ChartData = {
  month: string
  現金: number
  投資信託: number
  株式: number
  買付余力: number
  その他: number
}

const SERIES = [
  { key: '現金', color: '#6366f1' },
  { key: '投資信託', color: '#22d3ee' },
  { key: '株式', color: '#34d399' },
  { key: '買付余力', color: '#fbbf24' },
  { key: 'その他', color: '#f87171' },
] as const

function formatYAxis(value: number) {
  return `${value}万`
}

export default function AssetsBarChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-52 items-center justify-center text-sm text-zinc-400">
        データがありません
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" strokeOpacity={0.08} />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          formatter={(value, name) => [
            typeof value === 'number'
              ? `¥${(value * 10000).toLocaleString('ja-JP')}`
              : String(value),
            String(name),
          ]}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {SERIES.map(({ key, color }) => (
          <Bar key={key} dataKey={key} stackId="a" fill={color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
