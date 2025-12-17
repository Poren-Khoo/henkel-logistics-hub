import { useState } from 'react'
import { Plus, Pencil, Coins, Trash2 } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RateCardsPage({ rates, onAddRate, onUpdateRate, onDeleteRate }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState(null)
  const [formData, setFormData] = useState({ 
    activity: "", category: "VAS", price: "", unit: "per qty" 
  })

  // Open Dialog for New or Edit
  const handleOpen = (rate = null) => {
    if (rate) {
        setEditingRate(rate)
        setFormData(rate)
    } else {
        setEditingRate(null)
        setFormData({ activity: "", category: "VAS", price: "", unit: "per qty" })
    }
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (editingRate) {
        onUpdateRate({ ...formData, id: editingRate.id })
    } else {
        onAddRate(formData)
    }
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rate Cards</h1>
            <p className="text-sm text-muted-foreground">Manage standard costs for Basic & VAS services.</p>
        </div>
        <Button className="bg-[#e60000] hover:bg-red-700 shadow-sm text-white" onClick={() => handleOpen()}>
            <Plus size={16} className="mr-2"/> Add New Rate
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="pl-6">Activity Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id} className="hover:bg-slate-50 transition-colors">
                  <TableCell className="pl-6 font-medium text-slate-900">{rate.activity}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={rate.category === "BASIC" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-purple-50 text-purple-700 border-purple-200"}>
                        {rate.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-slate-700">¥{Number(rate.price).toFixed(2)}</TableCell>
                  <TableCell className="text-slate-500 text-sm">{rate.unit}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleOpen(rate)}>
                            <Pencil size={14} className="mr-1"/> Edit
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                                if(window.confirm(`Are you sure you want to delete "${rate.activity}"?`)) {
                                    onDeleteRate(rate.id)
                                }
                            }}
                        >
                            <Trash2 size={14} className="mr-1"/> Delete
                        </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* POPUP FORM */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingRate ? "Edit Rate" : "Add New Rate"}</DialogTitle>
            <DialogDescription>Define pricing for billing calculations.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label>Activity Name</Label>
                <Input value={formData.activity} onChange={(e) => setFormData({...formData, activity: e.target.value})} placeholder="e.g. Shrink Wrapping" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="BASIC">BASIC (In/Out/Storage)</SelectItem>
                            <SelectItem value="VAS">VAS (Value Added)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Unit Price (¥)</Label>
                    <div className="relative">
                        <Coins className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <Input className="pl-9" type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Billing Unit</Label>
                <Input value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} placeholder="e.g. per pallet" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-[#e60000] hover:bg-red-700 text-white">Save Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}