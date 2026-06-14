'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

type Slice = {
  label: string
  value: number
  color: string
}

export default function SnapshotPieChart({ data }: { data: Slice[] }) {
  return (
    <ResponsiveContainer width="100%" height={192}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          cx="50%"
          cy="50%"
          outerRadius={80}
          strokeWidth={1}
        >
          {data.map((entry) => (
            <Cell key={entry.label} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) =>
            typeof value === 'number'
              ? [`¥${value.toLocaleString('ja-JP')}`, '']
              : [String(value), '']
          }
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
