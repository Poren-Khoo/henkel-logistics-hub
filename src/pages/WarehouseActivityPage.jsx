import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function WarehouseActivityPage({ dns = [], activities, onAddActivity }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newActivity, setNewActivity] = useState({
    dn_no: "", activity: "Inbound Handling", qty: "", unit: "pallet", operator: "Operator A"
  })

  const handleSave = () => {
    const entry = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        dn_no: newActivity.dn_no,
        activity: newActivity.activity,
        qty: newActivity.qty,
        unit: newActivity.unit,
        operator: newActivity.operator,
        status: "Pending"
    }
    onAddActivity(entry)
    setIsDialogOpen(false)
    setNewActivity({ dn_no: "", activity: "Inbound Handling", qty: "", unit: "pallet", operator: "Operator A" })
  }

  // Helper to safely delete (Mock only for now since logic is in App.jsx)
  const handleDelete = (id) => {
    console.log("Delete requested for ID:", id)
  }

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Warehouse Activities</h2>
            <p className="text-slate-500">Log and manage daily warehouse operations.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 shadow-sm" onClick={() => setIsDialogOpen(true)}>
            <Plus size={16} className="mr-2"/> Record Activity
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Timestamp</TableHead>
                <TableHead>DN Number</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead>Qty / Unit</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Cost Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50">
                  <TableCell className="text-slate-500 text-sm">{item.timestamp}</TableCell>
                  <TableCell className="font-medium font-mono">{item.dn_no}</TableCell>
                  <TableCell>{item.activity}</TableCell>
                  <TableCell><span className="font-bold">{item.qty}</span> <span className="text-slate-400 text-xs">{item.unit}</span></TableCell>
                  <TableCell className="text-slate-600 text-sm">{item.operator}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.status === "Calculated" ? "text-green-600 bg-green-50 border-green-200" : "text-amber-600 bg-amber-50 border-amber-200"}>
                        {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- RECORD ACTIVITY DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Record New Activity</DialogTitle>
            <DialogDescription>Link manual labor to an existing Delivery Note.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            
            {/* 1. DN SELECTION */}
            <div className="space-y-2">
                <Label>Link Delivery Note (DN)</Label>
                <Select value={newActivity.dn_no} onValueChange={(val) => setNewActivity({...newActivity, dn_no: val})}>
                    <SelectTrigger><SelectValue placeholder="Select DN..." /></SelectTrigger>
                    <SelectContent>
                        {dns.length === 0 ? <SelectItem value="none" disabled>No Active DNs</SelectItem> : 
                            dns.map((d, i) => <SelectItem key={i} value={d.dn}>{d.dn} ({d.status})</SelectItem>)
                        }
                    </SelectContent>
                </Select>
            </div>

            {/* 2. ACTIVITY TYPE (UPDATED LIST) */}
            <div className="space-y-2">
                <Label>Activity Type</Label>
                <Select value={newActivity.activity} onValueChange={(val) => setNewActivity({...newActivity, activity: val})}>
                    <SelectTrigger><SelectValue placeholder="Select Operation..." /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Inbound Handling">Inbound Handling (Pallet)</SelectItem>
                        <SelectItem value="Outbound Handling">Outbound Handling (Pallet)</SelectItem>
                        <SelectItem value="Repacking">Repacking (Box)</SelectItem>
                        <SelectItem value="Relabeling">Relabeling (Pcs)</SelectItem>
                        <SelectItem value="Forklifting">Forklifting (Order)</SelectItem>
                        <SelectItem value="Urgent Delivery">Urgent Delivery (Trip)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* 3. QUANTITY & UNIT (RESTORED) */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" value={newActivity.qty} onChange={(e) => setNewActivity({...newActivity, qty: e.target.value})} placeholder="0" />
                </div>
                <div className="space-y-2">
                    <Label>Unit</Label>
                    <Select value={newActivity.unit} onValueChange={(val) => setNewActivity({...newActivity, unit: val})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pallet">Pallet</SelectItem>
                            <SelectItem value="box">Box</SelectItem>
                            <SelectItem value="pcs">Pcs</SelectItem>
                            <SelectItem value="trip">Trip</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 4. OPERATOR */}
            <div className="space-y-2">
                <Label>Operator</Label>
                <Select value={newActivity.operator} onValueChange={(val) => setNewActivity({...newActivity, operator: val})}>
                    <SelectTrigger><SelectValue placeholder="Select Operator" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Operator A">Operator A</SelectItem>
                        <SelectItem value="Operator B">Operator B</SelectItem>
                        <SelectItem value="Manager John">Manager John</SelectItem>
                    </SelectContent>
                </Select>
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">Save Activity</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}