import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { 
  ClipboardList, Warehouse, CheckSquare, CreditCard, History, FileText, 
  Bell, ChevronsUpDown, Wifi, Sun, Cloud, CloudRain, Calendar, Clock, Loader2, X 
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { useNotifications } from '../context/NotificationContext'

export default function Layout() {
  const location = useLocation()
  
  // --- CONFIGURATION ---
  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY 
  const WAREHOUSE_CITY = "Shanghai" 

  // --- STATE ---
  const [date, setDate] = useState(new Date())
  const [weather, setWeather] = useState({ temp: "--", condition: "Loading" })
  
  // NOTIFICATION HOOK
  const { notifications, clearNotifications } = useNotifications()
  const unreadCount = notifications.length
  
  // TOAST STATE
  const [showToast, setShowToast] = useState(null)

  // --- 🔥 THE NUCLEAR FIX LOGIC ---
  useEffect(() => {
    // Whenever the 'notifications' array changes (new item added)...
    if (notifications.length > 0) {
        // 1. Get the newest one
        const latest = notifications[0]
        
        // 2. FORCE SHOW IT (No timestamp checks, no math)
        setShowToast(latest)
        
        // 3. Hide after 3 seconds
        const timer = setTimeout(() => setShowToast(null), 3000)
        return () => clearTimeout(timer)
    }
  }, [notifications]) // Dependency = notifications array

  // CLOCK
  useEffect(() => {
    const timer = setInterval(() => setDate(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // WEATHER
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${WAREHOUSE_CITY}&units=metric&appid=${WEATHER_API_KEY}`
        )
        const data = await response.json()
        if (data.main) {
          setWeather({ temp: Math.round(data.main.temp), condition: data.weather[0].main })
        }
      } catch (error) { console.error(error) }
    }
    fetchWeather()
  }, [])

  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  const formattedTime = date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  
  const getWeatherIcon = () => {
    const c = weather.condition.toLowerCase()
    if (c === "loading") return <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
    if (c.includes("rain") || c.includes("drizzle")) return <CloudRain className="h-4 w-4 text-blue-500" />
    if (c.includes("cloud")) return <Cloud className="h-4 w-4 text-slate-500" />
    return <Sun className="h-4 w-4 text-amber-500" />
  }

  const menuItems = [
    { path: "/", label: "DN Information", icon: ClipboardList },
    { path: "/activity", label: "Warehouse Activity", icon: Warehouse },
    { path: "/approvals", label: "Cost Approvals", icon: CheckSquare },
    { path: "/billing", label: "Monthly Billing", icon: CreditCard },
    { path: "/history", label: "Archive / History", icon: History },
    { path: "/rates", label: "Rate Cards", icon: FileText },
  ]

  return (
    <div className="flex h-screen w-full bg-white font-sans text-slate-900 relative">
      
      {/* --- 🔥 TOAST POPUP (FIXED POSITION) --- */}
      {showToast && (
        <div className="fixed top-24 right-10 z-[9999] animate-in slide-in-from-right-10 fade-in duration-300">
            <div className={cn("flex items-center gap-3 px-4 py-4 rounded-lg shadow-2xl border bg-white min-w-[320px]", 
                showToast.type === 'success' ? "border-emerald-200" : 
                showToast.type === 'error' ? "border-red-200" : "border-slate-200"
            )}>
                {/* Icon Dot */}
                <div className={cn("h-3 w-3 rounded-full shrink-0 ring-2 ring-offset-1", 
                    showToast.type === 'success' ? "bg-emerald-500 ring-emerald-100" : 
                    showToast.type === 'error' ? "bg-red-500 ring-red-100" : "bg-blue-500 ring-blue-100"
                )}></div>
                
                {/* Text Content */}
                <div className="flex-1">
                    <p className="text-sm font-bold text-slate-800 leading-tight">{showToast.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-1">New Notification</p>
                </div>

                {/* Close Button */}
                <button onClick={() => setShowToast(null)} className="text-slate-300 hover:text-slate-600 transition-colors">
                    <X size={16}/>
                </button>
            </div>
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-[280px] flex-col bg-white border-r border-slate-200 hidden md:flex">
        <div className="flex h-[80px] items-center gap-3 pl-8 pr-6 bg-white"> 
          <img src="/Henkel logo transparent png.png" alt="Henkel" className="h-9 w-auto" />
          <div className="flex flex-col">
            <span className="font-bold text-base leading-none tracking-tight text-slate-900">Henkel</span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-widest mt-1">Logistics Hub</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Button key={item.path} asChild variant="ghost" className={cn("w-full justify-start h-11 px-4 mb-1 rounded-full transition-colors duration-200", isActive ? "bg-red-50 text-[#e60000] font-bold shadow-sm hover:bg-red-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}>
                <Link to={item.path} className="flex items-center"><item.icon className={cn("mr-3 h-5 w-5", isActive ? "text-red-700" : "text-slate-500")} /><span className="text-sm">{item.label}</span></Link>
              </Button>
            )
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-slate-50">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8 shadow-sm z-10">
          
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-slate-500 hover:text-slate-900 transition-colors">Home</Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900">{menuItems.find(i => i.path === location.pathname)?.label || "Dashboard"}</span>
          </div>

          <div className="flex items-center gap-6">
              
              <div className="hidden xl:flex items-center gap-6 text-xs font-medium text-slate-500 mr-2">
                 <div className="flex items-center gap-1.5">
                    {getWeatherIcon()}
                    <span>{WAREHOUSE_CITY}, {weather.temp}°C</span>
                 </div>
                 <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formattedDate}</span>
                 </div>
                 <div className="flex items-center gap-1.5 tabular-nums">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <span>{formattedTime}</span>
                 </div>
              </div>

              <div className="flex items-center gap-2" title="System Online">
                 <span className="relative flex h-2.5 w-2.5">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                 </span>
                 <span className="text-[11px] font-medium text-slate-600 hidden sm:block">Online</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
                      <Bell className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#e60000] ring-2 ring-white animate-pulse" />
                      )}
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="w-80 p-0 bg-white shadow-xl z-[100] border border-slate-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <span className="font-semibold text-sm text-slate-900">Notifications</span>
                      {unreadCount > 0 && (
                          <span className="text-[10px] text-blue-600 cursor-pointer hover:underline font-medium" onClick={clearNotifications}>
                              Mark all read
                          </span>
                      )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 text-sm">No new notifications</div>
                      ) : (
                          notifications.map((note) => (
                              <div key={note.id} className="px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 group cursor-default">
                                  <div className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", 
                                      note.type === 'success' ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : 
                                      note.type === 'error' ? 'bg-red-500 shadow-sm shadow-red-200' : 
                                      'bg-blue-500 shadow-sm shadow-blue-200'
                                  )} />
                                  <div className="flex flex-col gap-0.5">
                                      <span className="text-sm text-slate-700 font-medium leading-tight group-hover:text-slate-900">{note.title}</span>
                                      <span className="text-[10px] text-slate-400">{note.time}</span>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <div className="h-6 w-px bg-slate-200"></div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 hover:bg-slate-50 rounded-full transition-colors">
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarImage src="/selene-morgan.jpg" className="object-cover" />
                      <AvatarFallback className="bg-red-50 text-[#e60000] font-bold">SM</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                       <span className="font-semibold text-slate-700 text-xs">Selene Morgan</span>
                       <span className="text-[10px] text-slate-500">Logistics Mgr.</span>
                    </div>
                    <ChevronsUpDown className="h-3 w-3 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">
           <Outlet />
        </div>
      </main>
    </div>
  )
}