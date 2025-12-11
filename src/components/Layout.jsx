import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, History, Box, Menu, Bell, FileText, Package, CreditCard, Hexagon, Check, AlertCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Layout() {
  const location = useLocation()
  
  // Mock Notifications (Later we can connect this to Node-RED)
  const notifications = [
    { id: 1, title: "DN-2025-888 Approved", time: "2 mins ago", type: "success" },
    { id: 2, title: "New Rate Card Added", time: "1 hour ago", type: "info" },
    { id: 3, title: "System Maintenance", time: "5 hours ago", type: "warning" },
  ]

  const menuItems = [
    { path: "/", label: "DN Information", icon: <Box size={20} /> },
    { path: "/activity", label: "Warehouse Activity", icon: <Package size={20} /> },
    { path: "/approvals", label: "Cost Approvals", icon: <CheckSquare size={20} /> },
    { path: "/billing", label: "Monthly Billing", icon: <CreditCard size={20} /> },
    { path: "/history", label: "Archive / History", icon: <History size={20} /> },
    { path: "/rates", label: "Rate Cards", icon: <FileText size={20} /> },
  ]

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
            <Hexagon size={18} strokeWidth={3} />
          </div>
          <span className="font-bold text-lg text-slate-800 tracking-tight">Logistics Hub</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-md transition-all duration-200 ${
                  isActive 
                    ? "bg-slate-100 text-slate-900 font-semibold shadow-sm" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className={`mr-3 ${isActive ? "text-slate-900" : "text-slate-400"}`}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600">
              SM
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">Selene Morgan</p>
              <p className="text-xs text-slate-400">Logistics Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-slate-800">
            {menuItems.find(i => i.path === location.pathname)?.label}
          </h2>
          
          {/* --- NOTIFICATION BELL --- */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full relative transition-colors outline-none">
                <Bell size={20} />
                {/* Red Dot (Only if there are notifications) */}
                {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((note) => (
                <DropdownMenuItem key={note.id} className="cursor-pointer">
                  <div className="flex items-start space-x-3 py-2">
                    <div className={`mt-1 w-2 h-2 rounded-full ${note.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{note.title}</p>
                      <p className="text-xs text-slate-500">{note.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-xs text-blue-600 justify-center cursor-pointer">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* ------------------------- */}

        </header>

        <div className="flex-1 overflow-auto p-8">
          <Outlet /> 
        </div>
      </main>
    </div>
  )
}