import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, FileText, Filter, Plus } from "lucide-react"

export default function BillingPage({ transactionData = [], invoices = [], onGenerate, onUpdate }) {
  // --- STATE ---
  const [selectedSupplier, setSelectedSupplier] = useState("All") 
  const [selectedYear, setSelectedYear] = useState("2025")
  const [selectedMonth, setSelectedMonth] = useState("December")

  // --- FILTER LOGIC ---
  const filteredTransactions = transactionData.filter(item => {
      const dateStr = item.approved_at || new Date().toISOString()
      const itemDate = new Date(dateStr)
      
      const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
      
      const matchYear = itemDate.getFullYear().toString() === selectedYear
      const matchMonth = monthNames[itemDate.getMonth()] === selectedMonth
      const matchSupplier = selectedSupplier === "All" || item.supplier === selectedSupplier

      return matchYear && matchMonth && matchSupplier
  })

  const totalAmount = filteredTransactions.reduce((sum, item) => sum + (item.final_cost || 0), 0)

  // --- INVOICE GENERATION ---
  const handleGenerateInvoice = () => {
      if (filteredTransactions.length === 0) return alert("No transactions to bill!")
      if (selectedSupplier === "All") return alert("Please select a specific supplier to generate an invoice.")

      const newInvoice = {
          id: Date.now(),
          period: `${selectedMonth} ${selectedYear}`,
          supplier: selectedSupplier,
          total: totalAmount,
          status: "Draft",
          items: filteredTransactions
      }
      onGenerate(newInvoice)
  }

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Monthly Billing</h1>
        <p className="text-sm text-muted-foreground">Consolidate costs and generate invoices.</p>
      </div>

      {/* --- INVOICE HISTORY --- */}
      <Card className="shadow-sm border-slate-200">
          <CardHeader>
              <CardTitle className="text-base font-semibold text-slate-900">Generated Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
              <Table>
                  <TableHeader>
                      <TableRow className="bg-slate-50/50">
                          <TableHead className="pl-6">Period</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right">Total Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right pr-6">Action</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {invoices.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="text-center h-24 text-slate-400">No invoices generated yet.</TableCell></TableRow>
                      ) : (
                          invoices.map((inv) => (
                              <TableRow key={inv.id} className="hover:bg-slate-50 transition-colors">
                                  <TableCell className="pl-6 font-medium text-slate-700">{inv.period}</TableCell>
                                  <TableCell>{inv.supplier}</TableCell>
                                  <TableCell className="text-right font-bold text-slate-900">¥{inv.total.toFixed(2)}</TableCell>
                                  <TableCell>
                                      <Badge variant="outline" className={inv.status === "Sent" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-600 border-slate-200"}>
                                          {inv.status}
                                      </Badge>
                                  </TableCell>
                                  <TableCell className="text-right pr-6">
                                      {inv.status === "Draft" ? (
                                          <Button size="sm" variant="outline" className="hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200" onClick={() => onUpdate({...inv, status: "Sent"})}>
                                              <Send size={14} className="mr-2"/> Send
                                          </Button>
                                      ) : (
                                          <Button size="sm" variant="ghost" disabled>
                                              <FileText size={14} className="mr-2"/> View
                                          </Button>
                                      )}
                                  </TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

      {/* --- RECONCILIATION AREA --- */}
      <div className="space-y-4">
          <div className="flex items-center gap-2 text-slate-800">
              <Filter size={20} className="text-slate-400"/>
              <h3 className="text-lg font-semibold">Transaction Reconciliation</h3>
          </div>

          {/* FILTERS */}
          <Card className="p-6 bg-slate-50/50 border-slate-200">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                  
                  {/* Supplier Dropdown */}
                  <div className="space-y-2 flex-1">
                      <label className="text-sm font-medium text-slate-700">Supplier</label>
                      <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                          <SelectTrigger className="bg-white border-slate-200">
                              <SelectValue placeholder="Select Supplier" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="All" className="font-semibold">All Suppliers</SelectItem>
                              <SelectItem value="Warehouse Supplier A">Warehouse Supplier A</SelectItem>
                              <SelectItem value="Warehouse Supplier B">Warehouse Supplier B</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>

                  {/* Year Dropdown */}
                  <div className="space-y-2 w-32">
                      <label className="text-sm font-medium text-slate-700">Year</label>
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                          <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="2025">2025</SelectItem>
                              <SelectItem value="2024">2024</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>

                  {/* Month Dropdown */}
                  <div className="space-y-2 w-40">
                      <label className="text-sm font-medium text-slate-700">Month</label>
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                          <SelectTrigger className="bg-white border-slate-200"><SelectValue /></SelectTrigger>
                          <SelectContent>
                              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m => (
                                  <SelectItem key={m} value={m}>{m}</SelectItem>
                              ))}
                          </SelectContent>
                      </Select>
                  </div>

                  {/* Action Button */}
                  <Button 
                    className="bg-[#e60000] hover:bg-red-700 text-white shadow-sm" 
                    onClick={handleGenerateInvoice}
                    disabled={selectedSupplier === "All"} 
                    title={selectedSupplier === "All" ? "Select a specific supplier to generate invoice" : ""}
                  >
                      <Plus className="mr-2 h-4 w-4"/> Generate New Billing
                  </Button>
              </div>
          </Card>

          {/* FILTERED TABLE */}
          <Card className="shadow-sm border-slate-200">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white rounded-t-lg">
                  <span className="font-semibold text-slate-700">Filtered Transactions</span>
                  <Badge variant="secondary" className="text-base px-3 py-1 bg-slate-100 text-slate-900 border-slate-200">
                      Sum: ¥{totalAmount.toFixed(2)}
                  </Badge>
              </div>
              <Table>
                  <TableHeader>
                      <TableRow className="bg-slate-50/50">
                          <TableHead className="pl-6">DN Number</TableHead>
                          <TableHead>Approval Date</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right pr-6">Cost</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredTransactions.length === 0 ? (
                          <TableRow><TableCell colSpan={4} className="text-center h-32 text-slate-400">No transactions found for this period.</TableCell></TableRow>
                      ) : (
                          filteredTransactions.map((t, i) => (
                              <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                                  <TableCell className="pl-6 font-medium text-slate-900">{t.dn_no}</TableCell>
                                  <TableCell className="text-slate-600">{new Date(t.approved_at).toLocaleDateString()}</TableCell>
                                  <TableCell className="text-slate-600">{t.supplier}</TableCell>
                                  <TableCell className="text-right font-bold text-slate-900 pr-6">¥{t.final_cost?.toFixed(2)}</TableCell>
                              </TableRow>
                          ))
                      )}
                  </TableBody>
              </Table>
          </Card>
      </div>
    </div>
  )
}