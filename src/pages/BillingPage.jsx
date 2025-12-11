import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Send, Eye, Filter } from "lucide-react"

export default function BillingPage({ transactionData = [] }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const [filters, setFilters] = useState({ supplier: "Warehouse Supplier A", year: "2025", month: "12" })
  const [config, setConfig] = useState({ supplier: "Warehouse Supplier A", year: "2025", month: "December" })

  const [invoices, setInvoices] = useState([])

  // Filter Logic for Bottom Table
  const filteredTransactions = transactionData.filter(item => {
    const date = new Date(item.approved_at)
    return item.supplier === filters.supplier && 
           date.getFullYear().toString() === filters.year && 
           (date.getMonth() + 1).toString().padStart(2, '0') === filters.month
  })
  const filteredTotal = filteredTransactions.reduce((sum, item) => sum + (Number(item.final_cost) || 0), 0)

  // --- GENERATE INVOICE LOGIC ---
  const handleGenerate = () => {
    const monthMap = { "January": "01", "February": "02", "March": "03", "April": "04", "May": "05", "June": "06", "July": "07", "August": "08", "September": "09", "October": "10", "November": "11", "December": "12" }
    const targetMonth = monthMap[config.month]

    // Calculate from REAL data
    const matchingItems = transactionData.filter(item => {
        const date = new Date(item.approved_at)
        return item.supplier === config.supplier && 
               date.getFullYear().toString() === config.year && 
               (date.getMonth() + 1).toString().padStart(2, '0') === targetMonth
    })

    const totalSum = matchingItems.reduce((sum, item) => sum + (Number(item.final_cost) || 0), 0)

    const newInvoice = {
        id: Date.now(),
        period: `${config.month} ${config.year}`,
        supplier: config.supplier,
        basic: totalSum, 
        vas: 0, 
        total: totalSum,
        status: "Draft"
    }
    
    setInvoices([newInvoice, ...invoices])
    setIsDialogOpen(false)
  }

  const handleSend = (id) => setInvoices(invoices.map(inv => inv.id === id ? { ...inv, status: "Sent" } : inv))
  const getMonths = () => [ {v:"01",l:"January"}, {v:"02",l:"February"}, {v:"03",l:"March"}, {v:"04",l:"April"}, {v:"05",l:"May"}, {v:"06",l:"June"}, {v:"07",l:"July"}, {v:"08",l:"August"}, {v:"09",l:"September"}, {v:"10",l:"October"}, {v:"11",l:"November"}, {v:"12",l:"December"} ]

  return (
    <div className="space-y-8">
      {/* TOP: INVOICE LIST */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div><h2 className="text-2xl font-bold text-slate-900">Monthly Billing</h2><p className="text-slate-500">Consolidate costs.</p></div>
            <Button className="bg-red-600 hover:bg-red-700 shadow-sm" onClick={() => setIsDialogOpen(true)}><Plus size={16} className="mr-2"/> Generate New Billing</Button>
        </div>
        <Card><CardContent className="p-0"><Table>
            <TableHeader><TableRow className="bg-slate-50"><TableHead>Period</TableHead><TableHead>Supplier</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
            <TableBody>
                {invoices.length === 0 ? <TableRow><TableCell colSpan={5} className="text-center h-24 text-slate-400">No invoices generated yet.</TableCell></TableRow> : 
                invoices.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>{item.period}</TableCell><TableCell>{item.supplier}</TableCell>
                        <TableCell className="text-right font-bold">¥{item.total.toFixed(2)}</TableCell>
                        <TableCell><Badge variant="outline">{item.status}</Badge></TableCell>
                        <TableCell className="text-right">{item.status==="Draft" && <Button size="sm" onClick={()=>handleSend(item.id)} variant="outline"><Send size={14} className="mr-1"/> Send</Button>}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table></CardContent></Card>
      </div>

      {/* BOTTOM: FILTER */}
      <div className="space-y-4">
        <div><h3 className="text-lg font-bold text-slate-900 flex items-center"><Filter size={20} className="mr-2"/> Transaction Reconciliation</h3></div>
        <div className="flex space-x-4 bg-white p-4 border rounded-lg shadow-sm">
            <div className="w-64"><Label className="text-xs text-slate-500 mb-1">Supplier</Label><Select value={filters.supplier} onValueChange={(v)=>setFilters({...filters, supplier:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Warehouse Supplier A">Warehouse Supplier A</SelectItem><SelectItem value="Warehouse Supplier B">Warehouse Supplier B</SelectItem></SelectContent></Select></div>
            <div className="w-32"><Label className="text-xs text-slate-500 mb-1">Year</Label><Select value={filters.year} onValueChange={(v)=>setFilters({...filters, year:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="2025">2025</SelectItem></SelectContent></Select></div>
            <div className="w-48"><Label className="text-xs text-slate-500 mb-1">Month</Label><Select value={filters.month} onValueChange={(v)=>setFilters({...filters, month:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{getMonths().map(m=><SelectItem key={m.v} value={m.v}>{m.l}</SelectItem>)}</SelectContent></Select></div>
        </div>
        <Card><CardHeader className="py-3 bg-slate-50 border-b flex flex-row justify-between"><CardTitle className="text-sm">Filtered Transactions</CardTitle><Badge variant="secondary">Sum: ¥{filteredTotal.toFixed(2)}</Badge></CardHeader>
        <CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>DN</TableHead><TableHead>Date</TableHead><TableHead>Supplier</TableHead><TableHead className="text-right">Cost</TableHead></TableRow></TableHeader>
        <TableBody>{filteredTransactions.length===0?<TableRow><TableCell colSpan={4} className="text-center h-24 text-slate-400">No data.</TableCell></TableRow>:filteredTransactions.map((tx,i)=>(<TableRow key={i}><TableCell>{tx.dn_no}</TableCell><TableCell>{new Date(tx.approved_at).toLocaleDateString()}</TableCell><TableCell>{tx.supplier}</TableCell><TableCell className="text-right font-bold">¥{tx.final_cost}</TableCell></TableRow>))}</TableBody></Table></CardContent></Card>
      </div>

      {/* POPUP */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}><DialogContent><DialogHeader><DialogTitle>Generate Monthly Billing</DialogTitle><DialogDescription>Select period to consolidate.</DialogDescription></DialogHeader>
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div><Label>Year</Label><Select value={config.year} onValueChange={(v)=>setConfig({...config, year:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="2025">2025</SelectItem></SelectContent></Select></div>
                <div><Label>Month</Label><Select value={config.month} onValueChange={(v)=>setConfig({...config, month:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{getMonths().map(m=><SelectItem key={m.v} value={m.l}>{m.l}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div><Label>Supplier</Label><Select value={config.supplier} onValueChange={(v)=>setConfig({...config, supplier:v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Warehouse Supplier A">Warehouse Supplier A</SelectItem><SelectItem value="Warehouse Supplier B">Warehouse Supplier B</SelectItem></SelectContent></Select></div>
        </div>
        <DialogFooter><Button variant="ghost" onClick={()=>setIsDialogOpen(false)}>Cancel</Button><Button onClick={handleGenerate} className="bg-red-600 hover:bg-red-700">Generate Invoice</Button></DialogFooter>
      </DialogContent></Dialog>
    </div>
  )
}