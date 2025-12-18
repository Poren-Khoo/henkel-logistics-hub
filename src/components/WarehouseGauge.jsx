import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function WarehouseGauge({ value = 0, max = 100 }) {
  
  // 1. Calculate Percentage & Color
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  let color = "#10b981" // Green (Default)
  if (percentage > 60) color = "#f59e0b" // Orange (Warning)
  if (percentage > 80) color = "#ef4444" // Red (Critical)

  // 2. Prepare Data for the Semi-Circle
  // [Filled Part, Empty Part]
  const data = [
    { value: percentage },
    { value: 100 - percentage }
  ]

  return (
    <div className="h-[250px] w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center relative">
      
      {/* Title */}
      <div className="absolute top-6 left-6">
        <h3 className="text-base font-bold text-slate-800">Warehouse Load</h3>
        <p className="text-xs text-slate-400 font-medium uppercase">Real-time Capacity</p>

        <p className="text-[10px] text-slate-400 mt-1 italic">
            (Based on daily activity volume)
        </p>
      </div>

      {/* The Gauge */}
      <div className="w-full h-[180px] mt-8 flex items-end justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%" // Moves center to the bottom (Semi-circle)
              startAngle={180}
              endAngle={0}
              innerRadius={80}
              outerRadius={100}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              {/* Segment 1: The Value (Colored) */}
              <Cell fill={color} cornerRadius={10} />
              {/* Segment 2: The Empty Space (Gray) */}
              <Cell fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* The Big Number in the Center */}
      <div className="absolute bottom-6 flex flex-col items-center">
        <span className="text-4xl font-black text-slate-800 tracking-tight">
          {Math.round(percentage)}%
        </span>
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: color }}>
          {percentage > 80 ? 'CRITICAL' : percentage > 60 ? 'HIGH LOAD' : 'OPTIMAL'}
        </span>
      </div>

    </div>
  )
}