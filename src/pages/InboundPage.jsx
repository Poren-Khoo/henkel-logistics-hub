import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Package, 
  FileText, 
  MoreHorizontal, 
  Eye, 
  Pencil, 
  ArrowUpDown 
} from "lucide-react"

// SHADCN IMPORTS
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function InboundPage({ data, onSubmit, allActivities = [], allFinancials = [] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isViewOnly, setIsViewOnly] = useState(false) 
  const [searchTerm, setSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    urgent_delivery: false, repacking: false, temperature_control: false,
    special_instructions: "", completion_date: "", remarks: "", storage_days: 0           
  })

  // --- FILTER LOGIC ---
  const currentActivities = allActivities.filter(a => a.dn_no === selectedOrder?.dn_no)
  const currentFinance = allFinancials.find(f => f.dn_no === selectedOrder?.dn_no)

  const filteredData = data.filter(item => {
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
        item.dn_no.toLowerCase().includes(searchLower) || 
        item.material.toLowerCase().includes(searchLower)
    return matchesStatus && matchesSearch
  })

  // --- HANDLERS ---
  const handleProcessClick = (order) => {
    setSelectedOrder(order)
    if (order.saved_requirements) {
        setFormData(order.saved_requirements)
        setIsViewOnly(true) 
    } else {
        setFormData({
            urgent_delivery: false, repacking: false, temperature_control: false,
            special_instructions: "", completion_date: new Date().toISOString().split('T')[0], remarks: "", storage_days: 0
        })
        setIsViewOnly(false)
    }
    setIsDialogOpen(true)
  }

  const handleConfirm = () => {
    onSubmit(selectedOrder, formData)
    setIsDialogOpen(false)
  }

  // --- NEW "PRO" BADGE STYLES ---
  const getBadgeStyle = (status) => {
    if(status === "NEW") return "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50"
    if(status === "LE COMPLETED") return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50" // Clean Green
    return "border-slate-200 bg-slate-50 text-slate-600"
  }

  return (
    <div className="space-y-6">
      
      {/* 1. RESTORED PAGE TITLE */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          DN Information
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage inbound delivery notes and warehouse receipts.
        </p>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search by DN, Material..." 
                className="pl-9 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-white">
                    <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="LE COMPLETED">LE Completed</SelectItem>
                </SelectContent>
            </Select>
        </div>
      </div>

      {/* --- MASTER DATA TABLE --- */}
      <div className="rounded-md border bg-white shadow-sm">
        <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="w-[140px] text-[11px] uppercase tracking-wider font-semibold text-slate-500">DN Number</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Material</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Supplier</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Qty</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Destination</TableHead>
                <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Status</TableHead>
                <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-slate-500">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        No results found.
                    </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.dn_no} className="group hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium text-slate-900">{item.dn_no}</TableCell>
                    <TableCell className="font-medium text-slate-700">{item.material}</TableCell>
                    
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-6 items-center rounded-md bg-slate-100 px-2 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                {item.supplier || "GENERIC"}
                            </span>
                        </div>
                    </TableCell>

                    <TableCell className="text-slate-600">{item.qty}</TableCell>
                    <TableCell className="text-slate-600">{item.destination}</TableCell>
                    
                    <TableCell>
                        <Badge variant="outline" className={getBadgeStyle(item.status)}>
                            {item.status}
                        </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                       {/* CLEAN ACTION BUTTONS */}
                       {item.status === 'NEW' ? (
                          <Button 
                            size="sm" 
                            className="h-8 bg-[#e60000] text-white hover:bg-red-700 shadow-sm font-medium"
                            onClick={() => handleProcessClick(item)}
                          >
                            <Pencil className="mr-2 h-3 w-3" /> Process
                          </Button>
                       ) : (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            onClick={() => handleProcessClick(item)}
                          >
                            <span className="sr-only">Open menu</span>
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Button>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
        </Table>
      </div>

      {/* --- DIALOG / POPUP (KEPT MOSTLY SAME, JUST CLEANED) --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden h-[80vh] flex flex-col gap-0">
          
          {/* POPUP HEADER */}
          <div className="px-6 py-4 border-b bg-slate-50 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-slate-500 shadow-sm">
                    <Package size={20}/>
                </div>
                <div>
                    <h3 className="font-bold text-lg text-slate-900">{selectedOrder?.dn_no}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Inbound Order Details</p>
                </div>
            </div>
            <Badge variant="outline" className={getBadgeStyle(selectedOrder?.status)}>{selectedOrder?.status}</Badge>
          </div>

          {/* POPUP CONTENT */}
          <div className="flex-1 bg-white overflow-hidden flex flex-col">
            <Tabs defaultValue="requirements" className="flex-1 flex flex-col">
                <div className="px-6 pt-4">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
                        <TabsTrigger value="requirements">1. LE Requirements</TabsTrigger>
                        <TabsTrigger value="activity" disabled={!isViewOnly}>2. Warehouse Activity</TabsTrigger>
                        <TabsTrigger value="financials" disabled={!isViewOnly}>3. Cost & Financials</TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {/* TAB 1: REQUIREMENTS */}
                    <TabsContent value="requirements" className="mt-0 h-full">
                         <div className="grid grid-cols-12 gap-6 h-full">
                            {/* Left Column: Material Info */}
                            <div className="col-span-5 space-y-4">
                                <div className="p-4 border rounded-lg bg-slate-50/50 space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Material ID</Label>
                                        <div className="font-semibold text-base">{selectedOrder?.material}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Quantity</Label>
                                            <div className="text-sm font-medium">{selectedOrder?.qty} Units</div>
                                        </div>
                                        <div>
                                            <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Destination</Label>
                                            <div className="text-sm font-medium">{selectedOrder?.destination}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Special Instructions</Label>
                                    <Textarea 
                                        className="min-h-[120px] resize-none focus-visible:ring-red-500" 
                                        placeholder="Enter any handling instructions..."
                                        value={formData.special_instructions} 
                                        onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Right Column: Controls */}
                            <div className="col-span-7 space-y-6 pl-4 border-l border-slate-100">
                                <div className="space-y-4">
                                    <Label className="text-base font-semibold">VAS Services Required</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({...prev, urgent_delivery: !prev.urgent_delivery}))}>
                                            <Checkbox id="urgent" checked={formData.urgent_delivery} onCheckedChange={(c) => setFormData({...formData, urgent_delivery: c})} />
                                            <Label htmlFor="urgent" className="cursor-pointer font-medium">Activity 1</Label>
                                        </div>
                                        <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({...prev, repacking: !prev.repacking}))}>
                                            <Checkbox id="repack" checked={formData.repacking} onCheckedChange={(c) => setFormData({...formData, repacking: c})} />
                                            <Label htmlFor="repack" className="cursor-pointer font-medium">Activity 2</Label>
                                        </div>
                                        <div className="flex items-center space-x-3 p-3 border rounded-md hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setFormData(prev => ({...prev, temperature_control: !prev.temperature_control}))}>
                                            <Checkbox id="temp" checked={formData.temperature_control} onCheckedChange={(c) => setFormData({...formData, temperature_control: c})} />
                                            <Label htmlFor="temp" className="cursor-pointer font-medium">Activity 3</Label>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-blue-900 font-semibold">Storage Simulation</Label>
                                        <Badge variant="secondary" className="bg-white text-blue-700 border border-blue-200">
                                            {formData.storage_days || 0} Days
                                        </Badge>
                                    </div>
                                    <Input 
                                        type="range" min="0" max="30" step="1"
                                        className="cursor-pointer accent-blue-600"
                                        value={formData.storage_days || 0}
                                        onChange={(e) => setFormData({...formData, storage_days: parseInt(e.target.value)})}
                                    />
                                    <p className="text-[11px] text-blue-500/80 font-medium">
                                        Calculated Cost: ¥{(selectedOrder?.qty * (formData.storage_days || 0) * 1.5).toFixed(2)} (Estimated)
                                    </p>
                                </div>
                            </div>
                        </div>
                        {!isViewOnly && (
                            <div className="absolute bottom-6 right-6">
                                <Button size="lg" onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white shadow-md">
                                    Save & Submit Request
                                </Button>
                            </div>
                        )}
                    </TabsContent>

                    {/* TAB 2 & 3 KEPT SIMPLE AS REQUESTED */}
                    <TabsContent value="activity">
                         <div className="border rounded-md">
                            <Table>
                                <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Activity</TableHead><TableHead>Operator</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {currentActivities.length === 0 ? <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No activity logs found.</TableCell></TableRow> : 
                                    currentActivities.map((act, i) => (<TableRow key={i}><TableCell>{act.timestamp}</TableCell><TableCell>{act.activity}</TableCell><TableCell>{act.operator}</TableCell></TableRow>))}
                                </TableBody>
                            </Table>
                         </div>
                    </TabsContent>

                    <TabsContent value="financials">
                        {currentFinance ? (
                             <div className="grid grid-cols-3 gap-6">
                                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Basic Cost</CardTitle></CardHeader><CardContent className="text-2xl font-bold">¥{currentFinance.basic_cost}</CardContent></Card>
                                <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">VAS Cost</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-purple-600">¥{currentFinance.vas_cost}</CardContent></Card>
                                <Card className="bg-emerald-50 border-emerald-100"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-emerald-600">Total Billable</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-emerald-700">¥{currentFinance.total_cost}</CardContent></Card>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg text-muted-foreground bg-slate-50/50">
                                <FileText size={40} className="mb-2 opacity-20" />
                                <span>Financial data generated after LE completion</span>
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}