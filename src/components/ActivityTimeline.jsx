import React from 'react'
import { CheckCircle2, Clock, Box, User } from 'lucide-react'

export default function ActivityTimeline({ activities }) {
  const recent = activities ? [...activities].slice(0, 4) : []

  // 👇 HELPER: Clean the name (Remove parentheses)
  // "Activity 2 (Repacking)" -> "Activity 2"
  const cleanName = (name) => {
    if (!name) return "Unknown Activity"
    return name.split('(')[0].trim()
  }

  return (
    <div className="h-[250px] w-full bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-800">Live Operations Feed</h3>
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>

      <div className="relative space-y-4">
        {/* Vertical Line */}
        <div className="absolute left-3.5 top-2 bottom-2 w-[2px] bg-slate-100"></div>

        {recent.length === 0 ? (
           <p className="text-sm text-slate-400 pl-10">No recent activity recorded.</p>
        ) : (
           recent.map((item, index) => (
            <div key={index} className="relative flex items-start gap-4">
              {/* Icon Dot */}
              <div className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 border border-blue-100">
                 <Box size={14} className="text-blue-600" />
              </div>
              
              {/* Content */}
              <div className="flex flex-col pt-0.5">
                {/* 👇 USE THE CLEAN FUNCTION HERE */}
                <span className="text-sm font-semibold text-slate-800 leading-none">
                    {cleanName(item.activity)}
                </span>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                        {item.dn_no}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <User size={10} /> {item.operator}
                    </span>
                </div>
              </div>

              {/* Time */}
              <span className="ml-auto text-[10px] font-medium text-slate-400 tabular-nums flex items-center gap-1">
                 <Clock size={10} /> 
                 {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}