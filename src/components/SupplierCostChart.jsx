import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts'

export default function SupplierCostChart({ data }) {
  
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const grouped = data.reduce((acc, item) => {
      const supplier = item.supplier || "Unknown"
      // DETECTIVE MODE: Find the cost
      const cost = Number(item.total || item.totalCost || item.total_cost || item.cost || item.price || 0)

      if (!acc[supplier]) acc[supplier] = 0
      acc[supplier] += cost
      return acc
    }, {})

    // Convert to Array AND SORT ALPHABETICALLY (A -> Z)
    return Object.keys(grouped).map(key => ({
      // CHANGE: Removed the part that shortened "Supplier" to "Supp."
      // We still remove "Warehouse " to keep it clean (e.g., "Supplier A")
      name: key.replace("Warehouse ", ""), 
      fullName: key,
      value: grouped[key]
    })).sort((a, b) => a.name.localeCompare(b.name)) 

  }, [data])

  if (chartData.length === 0) {
    return (
      <div className="h-[350px] w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-slate-400 gap-2">
         <p>No data available</p>
      </div>
    )
  }

  return (
    <div className="h-[350px] w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
            <h3 className="text-lg font-bold text-slate-800">Pending Cost Distribution</h3>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">By Supplier</p>
        </div>
        <div className="text-right">
            <span className="text-2xl font-bold text-slate-800">{chartData.length}</span>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Active Vendors</p>
        </div>
      </div>

      <div className="h-[250px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#64748b', fontWeight: 600}} 
                    dy={10}
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 12, fill: '#94a3b8'}} 
                    tickFormatter={(val) => `¥${val / 1000}k`} 
                />
                <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{borderRadius: '8px', border: 'none', backgroundColor: '#1e293b', color: '#fff'}}
                    itemStyle={{color: '#fff'}}
                    formatter={(value) => [`¥${value.toFixed(2)}`, 'Total Pending']}
                />
                
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={80}>
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#e60000" />
                    ))}
                    <LabelList 
                        dataKey="value" 
                        position="top" 
                        formatter={(val) => `¥${val}`} 
                        style={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                    />
                </Bar>
            </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}