import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, DollarSign, Activity, CheckCircle, XCircle } from "lucide-react"
import SupplierCostChart from '../components/SupplierCostChart'

export default function ApprovalPage({ data, onAudit }) {
  const [searchTerm, setSearchTerm] = useState("")

  // Calculate Summaries
  const totalBasic = data.reduce((sum, item) => sum + (item.basic_cost || 0), 0)
  const totalVAS = data.reduce((sum, item) => sum + (item.vas_cost || 0), 0)
  const grandTotal = totalBasic + totalVAS

  const filteredData = data.filter(item => 
    item.dn_no.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Cost Approvals</h1>
        <p className="text-sm text-muted-foreground">Review and approve calculated costs before billing.</p>
      </div>

      {/* --- SUMMARY CARDS & CHART --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Section - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle>Cost Distribution by Supplier</CardTitle>
            </CardHeader>
            <CardContent>
              <SupplierCostChart data={data} />
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards - Stacked vertically in 1 column */}
        <div className="flex flex-col gap-4">
          
          {/* Card 1: Basic Cost */}
          <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500">Total Basic Cost</CardTitle>
                  <DollarSign className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-slate-900">¥{totalBasic.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground mt-1">Standard handling & storage</p>
              </CardContent>
          </Card>

          {/* Card 2: VAS Cost */}
          <Card className="shadow-sm border-slate-200 bg-purple-50/30 border-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-700">Total VAS Cost</CardTitle>
                  <Activity className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-purple-700">¥{totalVAS.toFixed(2)}</div>
                  <p className="text-xs text-purple-600/80 mt-1">Value-added services</p>
              </CardContent>
          </Card>

          {/* Card 3: Grand Total */}
          <Card className="shadow-sm border-emerald-100 bg-emerald-50/30">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-emerald-700">Grand Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                  <div className="text-2xl font-bold text-emerald-700">¥{grandTotal.toFixed(2)}</div>
                  <p className="text-xs text-emerald-600/80 mt-1">Total billable amount</p>
              </CardContent>
          </Card>
        </div>
      </div>

      {/* --- DETAILED TABLE --- */}
      <div className="space-y-4">
        
        {/* Search */}
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                className="pl-9 bg-white" 
                placeholder="Search by DN or Supplier..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <Card className="shadow-sm border-slate-200">
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead>DN Number</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-right">Basic Cost</TableHead>
                            <TableHead className="text-right">VAS Cost</TableHead>
                            <TableHead className="text-right">Total Cost</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="text-center h-32 text-slate-400">All costs approved. Good job!</TableCell></TableRow>
                        ) : (
                            filteredData.map((item) => (
                                <TableRow key={item.dn_no} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-medium text-slate-900">{item.dn_no}</TableCell>
                                    <TableCell className="text-slate-600">{item.supplier}</TableCell>
                                    <TableCell className="text-right font-mono text-slate-600">¥{item.basic_cost.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-mono text-purple-600">
                                        {item.vas_cost > 0 && <span className="font-bold">¥{item.vas_cost.toFixed(2)}</span>}
                                        {item.vas_cost === 0 && <span className="text-slate-300">-</span>}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-emerald-700 text-lg">¥{item.total_cost.toFixed(2)}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onAudit(item.dn_no, "REJECT", 0)}>
                                            <XCircle className="h-4 w-4 mr-1"/> Reject
                                        </Button>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm" onClick={() => onAudit(item.dn_no, "APPROVE", item.total_cost)}>
                                            <CheckCircle className="h-4 w-4 mr-1"/> Approve
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  )
}