import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function HistoryPage({ data }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Archive & Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>DN Number</TableHead>
              <TableHead>Final Cost</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-slate-500">{new Date(item.approved_at).toLocaleString()}</TableCell>
                <TableCell className="font-medium">{item.dn_no}</TableCell>
                <TableCell>¥{item.final_cost}</TableCell>
                <TableCell><Badge variant="outline" className="bg-slate-100 text-slate-600">COMPLETED</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}