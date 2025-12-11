import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Search, Filter, Upload, Eye, Pencil, Package, FileText, Wifi } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InboundPage({ data, onSubmit, connectionStatus, allActivities = [], allFinancials = [] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [isViewOnly, setIsViewOnly] = useState(false) 
  const [searchTerm, setSearchTerm] = useState("")
  
  const [formData, setFormData] = useState({
    urgent_delivery: false, repackaging: false, temperature_control: false,
    special_instructions: "", completion_date: "", remarks: ""               
  })

  // --- FILTER DATA FOR THE POPUP ---
  const currentActivities = allActivities.filter(a => a.dn_no === selectedOrder?.dn_no)
  const currentFinance = allFinancials.find(f => f.dn_no === selectedOrder?.dn_no)

  // --- MAIN TABLE FILTER LOGIC ---
  const filteredData = data.filter(item => {
    // 1. Status Filter
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter
    
    // 2. Search Filter (DN or Material)
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
        item.dn_no.toLowerCase().includes(searchLower) || 
        item.material.toLowerCase().includes(searchLower)

    return matchesStatus && matchesSearch
  })

  const handleProcessClick = (order) => {
    setSelectedOrder(order)
    if (order.saved_requirements) {
        setFormData(order.saved_requirements)
        setIsViewOnly(true) 
    } else {
        setFormData({
            urgent_delivery: false, repackaging: false, temperature_control: false,
            special_instructions: "", completion_date: new Date().toISOString().split('T')[0], remarks: ""
        })
        setIsViewOnly(false)
    }
    setIsDialogOpen(true)
  }

  const handleConfirm = () => {
    onSubmit(selectedOrder, formData)
    setIsDialogOpen(false)
  }

  const getBadgeStyle = (status) => {
    if(status === "NEW") return "bg-blue-100 text-blue-700 border-blue-200"
    if(status === "LE COMPLETED") return "bg-purple-100 text-purple-700 border-purple-200"
    return "bg-slate-100 text-slate-700"
  }

  return (
    <div className="space-y-6">
      
      {/* TOP BAR */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 flex justify-between items-center shadow-sm">
        <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500" 
                placeholder="Search by DN, Material..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
        </div>

        <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter Status" /></SelectTrigger><SelectContent><SelectItem value="ALL">All Statuses</SelectItem><SelectItem value="NEW">New</SelectItem><SelectItem value="LE COMPLETED">LE Completed</SelectItem></SelectContent></Select>
            <Badge variant="outline" className={`flex items-center gap-2 px-3 py-1 ${connectionStatus === "Connected" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                <Wifi size={14} className={connectionStatus === "Connected" ? "animate-pulse" : ""} />
                {connectionStatus}
            </Badge>
        </div>
      </div>

      {/* MAIN TABLE */}
      <Card>
        <CardHeader><CardTitle>DN Information (Inbound)</CardTitle><CardDescription>Master Data View</CardDescription></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>DN Number</TableHead>
                <TableHead>Material</TableHead>
                {/* SUPPLIER COLUMN ADDED HERE */}
                <TableHead>Supplier</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center h-32 text-slate-400">No orders found matching "{searchTerm}".</TableCell></TableRow> : 
                filteredData.map((item) => (
                  <TableRow key={item.dn_no} className="hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{item.dn_no}</TableCell>
                    <TableCell>{item.material}</TableCell>
                    
                    {/* SUPPLIER DATA CELL */}
                    <TableCell className="text-slate-500 text-xs font-semibold uppercase">
                        {item.supplier || "—"}
                    </TableCell>

                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{item.destination}</TableCell>
                    <TableCell><Badge variant="outline" className={`px-3 py-1 ${getBadgeStyle(item.status)}`}>{item.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      {item.status === 'NEW' ? (
                          <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50" onClick={() => handleProcessClick(item)}>
                              <Pencil size={14} className="mr-1"/> Add LE Req
                          </Button>
                      ) : (
                          <Button size="sm" variant="ghost" className="text-slate-500 hover:text-slate-800" onClick={() => handleProcessClick(item)}>
                              <Eye size={14} className="mr-1"/> View All
                          </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* POPUP (SMART TABS) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden h-[700px] flex flex-col">
          <div className="bg-slate-50 p-6 border-b border-slate-200 flex justify-between items-start">
            <div><h3 className="text-xl font-bold text-slate-900 flex items-center"><Package className="mr-2 text-slate-500" size={20}/> {selectedOrder?.dn_no}</h3><p className="text-sm text-slate-500 mt-1">Master Data View</p></div>
            <Badge className="text-lg">{selectedOrder?.status || "NEW"}</Badge>
          </div>
          <div className="flex-1 bg-white p-6 overflow-hidden">
            <Tabs defaultValue="requirements" className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="requirements">1. LE Requirements</TabsTrigger>
                    <TabsTrigger value="activity" disabled={!isViewOnly}>2. Warehouse Activity {isViewOnly ? `(${currentActivities.length})` : "🔒"}</TabsTrigger>
                    <TabsTrigger value="financials" disabled={!isViewOnly}>3. Cost & Financials {isViewOnly ? "" : "🔒"}</TabsTrigger>
                </TabsList>

                {/* TAB 1 */}
                <TabsContent value="requirements" className="flex-1 overflow-auto">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="p-4 border rounded bg-slate-50"><Label className="text-xs text-slate-500 uppercase">Material Info</Label><div className="font-bold">{selectedOrder?.material}</div><div className="text-sm text-slate-500">Qty: {selectedOrder?.qty} | Dest: {selectedOrder?.destination}</div></div>
                            <div className="space-y-2"><Label>Special Instructions</Label><Textarea className="h-32" value={formData.special_instructions} onChange={(e) => setFormData({...formData, special_instructions: e.target.value})}/></div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-3"><Label>VAS Services</Label><div className="space-y-2"><div className="flex items-center space-x-2"><Checkbox id="urgent" checked={formData.urgent_delivery} onCheckedChange={(c) => setFormData({...formData, urgent_delivery: c})} /><Label htmlFor="urgent">Urgent Delivery</Label></div><div className="flex items-center space-x-2"><Checkbox id="repack" checked={formData.repackaging} onCheckedChange={(c) => setFormData({...formData, repackaging: c})} /><Label htmlFor="repack">Repackaging</Label></div><div className="flex items-center space-x-2"><Checkbox id="temp" checked={formData.temperature_control} onCheckedChange={(c) => setFormData({...formData, temperature_control: c})} /><Label htmlFor="temp">Temp Control</Label></div></div></div>
                            <div className="space-y-2"><Label>Remarks</Label><Input value={formData.remarks} onChange={(e) => setFormData({...formData, remarks: e.target.value})}/></div>
                        </div>
                    </div>
                    {!isViewOnly && <div className="mt-6 flex justify-end"><Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700 text-white">Save Requirements</Button></div>}
                </TabsContent>

                {/* TAB 2 */}
                <TabsContent value="activity">
                    <div className="border rounded-md"><Table><TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Activity</TableHead><TableHead>Operator</TableHead></TableRow></TableHeader><TableBody>{currentActivities.length === 0 ? (<TableRow><TableCell colSpan={3} className="text-center py-4 text-slate-400">No activity recorded yet.</TableCell></TableRow>) : (currentActivities.map((act, i) => (<TableRow key={i}><TableCell>{act.timestamp}</TableCell><TableCell>{act.activity}</TableCell><TableCell>{act.operator}</TableCell></TableRow>)))}</TableBody></Table></div>
                </TabsContent>

                {/* TAB 3 */}
                <TabsContent value="financials">
                    {currentFinance ? (
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">Basic Cost</CardTitle></CardHeader><CardContent className="text-2xl font-bold">¥{currentFinance.basic_cost}</CardContent></Card>
                            <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">VAS Cost</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-purple-600">¥{currentFinance.vas_cost}</CardContent></Card>
                            <Card className="bg-green-50 border-green-200"><CardHeader className="pb-2"><CardTitle className="text-sm text-green-600">Total Billable</CardTitle></CardHeader><CardContent className="text-2xl font-bold text-green-700">¥{currentFinance.total_cost}</CardContent></Card>
                        </div>
                    ) : (<div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400"><FileText size={32} className="mr-3" /><span>Cost calculation pending manager approval</span></div>)}
                </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}