import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, DollarSign, Activity } from "lucide-react"

export default function ApprovalPage({ data, onAudit }) {
  const [searchTerm, setSearchTerm] = useState("")

  // 1. Calculate Summaries (The top cards)
  const totalBasic = data.reduce((sum, item) => sum + (item.basic_cost || 0), 0)
  const totalVAS = data.reduce((sum, item) => sum + (item.vas_cost || 0), 0)
  const grandTotal = totalBasic + totalVAS

  // 2. Filter Data based on Search
  const filteredData = data.filter(item => 
    item.dn_no.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Cost Calculation</h2>
        <p className="text-slate-500">Automated cost tracking per activity (Manager Review)</p>
      </div>

      {/* --- SUMMARY CARDS (Base44 Style) --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Basic Cost (Blue) */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total Basic Cost</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold text-slate-900">¥{totalBasic.toFixed(2)}</div>
                    <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                        <DollarSign size={20} />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Card 2: VAS Cost (Purple) */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Total VAS Cost</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold text-slate-900">¥{totalVAS.toFixed(2)}</div>
                    <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                        <Activity size={20} />
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Card 3: Grand Total (Green) */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">Grand Total</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center">
                    <div className="text-3xl font-bold text-slate-900">¥{grandTotal.toFixed(2)}</div>
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <DollarSign size={20} />
                    </div>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* --- DETAILED TABLE --- */}
      <div className="space-y-4">
        
        {/* Search Bar */}
        <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input 
                className="pl-10 bg-white" 
                placeholder="Search by DN or Activity..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        <Card className="shadow-sm border border-slate-200">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold text-slate-700">DN Number</TableHead>
                        <TableHead className="font-semibold text-slate-700">Activity Type</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Total Basic</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Total VAS</TableHead>
                        <TableHead className="text-right font-semibold text-slate-900">Total Cost</TableHead>
                        <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredData.length === 0 ? (
                        <TableRow><TableCell colSpan={6} className="text-center h-32 text-slate-400">All costs approved. Good job!</TableCell></TableRow>
                    ) : (
                        filteredData.map((item) => (
                            <TableRow key={item.dn_no} className="hover:bg-slate-50">
                                <TableCell className="font-medium text-slate-900">{item.dn_no}</TableCell>
                                <TableCell className="text-slate-600">
                                    Logistics Handling
                                    {/* Show a badge if VAS exists */}
                                    {item.vas_cost > 0 && <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">VAS Included</span>}
                                </TableCell>
                                <TableCell className="text-right font-mono text-slate-600">¥{item.basic_cost.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-mono text-purple-600">¥{item.vas_cost.toFixed(2)}</TableCell>
                                <TableCell className="text-right font-bold text-green-700 text-lg">¥{item.total_cost.toFixed(2)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => onAudit(item.dn_no, "REJECT", 0)}>
                                        Reject
                                    </Button>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={() => onAudit(item.dn_no, "APPROVE", item.total_cost)}>
                                        Approve
                                    </Button>
                                </TableCell>
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