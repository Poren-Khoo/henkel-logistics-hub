import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { History } from "lucide-react"

export default function HistoryPage({ data = [] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Archive / History</h1>
        <p className="text-sm text-muted-foreground">Historical record of all approved transactions.</p>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="pl-6">Completion Date</TableHead>
                <TableHead>DN Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Final Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-48 text-muted-foreground flex flex-col items-center justify-center">
                        <History className="h-10 w-10 mb-2 opacity-20" />
                        <span>No history records found.</span>
                    </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={index} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="pl-6 text-slate-600">
                        {new Date(item.approved_at).toLocaleString('en-US', { 
                            year: 'numeric', month: 'short', day: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                        })}
                    </TableCell>
                    <TableCell className="font-medium text-slate-900">{item.dn_no}</TableCell>
                    <TableCell className="text-slate-600">{item.supplier}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-slate-900 pr-6">
                      ¥{Number(item.final_cost).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}