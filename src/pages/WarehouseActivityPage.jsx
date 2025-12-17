import React, { useState } from 'react'
import { Search, Plus, Trash2, X, Save } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import WarehouseGauge from '../components/WarehouseGauge'
import ActivityTimeline from '../components/ActivityTimeline'

// 👇 Added 'onDeleteActivity' to the props here
export default function WarehouseActivityPage({ dns, activities, onAddActivity, onDeleteActivity }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [newActivity, setNewActivity] = useState({
    dn_no: '',
    activity: 'Activity 1', 
    qty: 10,
    operator: 'Operator A'
  })

  const cleanName = (name) => {
    if (!name) return "--"
    return name.split('(')[0].trim()
  }

  const filteredActivities = activities ? activities.filter(item => {
    const lowerSearch = searchTerm.toLowerCase()
    const cleanAct = cleanName(item.activity).toLowerCase()
    const matchDN = item.dn_no && item.dn_no.toLowerCase().includes(lowerSearch)
    const matchAct = cleanAct.includes(lowerSearch)
    return matchDN || matchAct
  }) : []

  const handleSubmit = (e) => {
    e.preventDefault() 
    if (onAddActivity) {
      // Add a timestamp so we can delete it uniquely later!
      onAddActivity({ ...newActivity, timestamp: new Date().toISOString() }) 
    }
    setIsModalOpen(false) 
    setNewActivity({ dn_no: '', activity: 'Activity 1', qty: 10, operator: 'Operator A' })
  }

  const maxCapacity = 20

  return (
    <div className="space-y-6 relative">

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between">
         <div>
           <h1 className="text-2xl font-bold text-slate-900">Warehouse Activities</h1>
           <p className="text-slate-500">Log and manage daily warehouse operations.</p>
         </div>
         
         <Button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#e60000] hover:bg-red-700 text-white shadow-sm"
         >
            <Plus className="mr-2 h-4 w-4" /> Record Activity
         </Button>
      </div>

      {/* --- VISUALS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
             <WarehouseGauge value={activities ? activities.length : 0} max={maxCapacity} />
          </div>
          <div className="lg:col-span-2">
             <ActivityTimeline activities={activities} />
          </div>
      </div>

      {/* --- SEARCH --- */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by DN or Activity..."
          className="pl-10 bg-white border-slate-200 focus-visible:ring-red-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* --- TABLE --- */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">DN Number</th>
              <th className="px-6 py-4">Activity</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Operator</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredActivities.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No activities found.
                </td>
              </tr>
            ) : (
              filteredActivities.map((item, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 tabular-nums">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString('en-US') : new Date().toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{item.dn_no}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{cleanName(item.activity)}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="font-bold text-slate-900">{item.qty || 10}</span> <span className="text-xs text-slate-400">unit</span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.operator || "Operator A"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Recorded
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {/* 👇 THIS IS THE DELETE BUTTON LOGIC */}
                    <button 
                      onClick={() => onDeleteActivity && onDeleteActivity(item.timestamp)}
                      className="text-slate-300 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
                      title="Delete Activity"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- POPUP MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 p-6 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Record New Activity</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">DN Number</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  value={newActivity.dn_no}
                  onChange={(e) => setNewActivity({...newActivity, dn_no: e.target.value})}
                  required
                >
                  <option value="">Select DN...</option>
                  {dns && dns.map((d, i) => (
                    <option key={i} value={d.dn}>{d.dn}</option>
                  ))}
                  <option value="DN-2025-010">DN-2025-010 (Test)</option>
                  <option value="DN-2025-011">DN-2025-011 (Test)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Activity Type</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  value={newActivity.activity}
                  onChange={(e) => setNewActivity({...newActivity, activity: e.target.value})}
                >
                  <option value="Activity 1">Activity 1</option>
                  <option value="Activity 2">Activity 2</option>
                  <option value="Activity 3">Activity 3</option>
                  <option value="Activity 4">Activity 4</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Quantity</label>
                  <Input 
                    type="number" 
                    value={newActivity.qty}
                    onChange={(e) => setNewActivity({...newActivity, qty: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Operator</label>
                  <select 
                     className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm outline-none"
                     value={newActivity.operator}
                     onChange={(e) => setNewActivity({...newActivity, operator: e.target.value})}
                  >
                    <option>Operator A</option>
                    <option>Operator B</option>
                    <option>Manager</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#e60000] hover:bg-red-700">
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}