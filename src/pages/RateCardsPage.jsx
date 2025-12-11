import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil } from "lucide-react"

export default function RateCardsPage({ rates, onAddRate, onUpdateRate }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false) // Track mode
  
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    activity: "",
    basic_cost: "",
    vas_cost: "",
    unit: "pallet"
  })

  // Open "Add New" Mode
  const handleAddNew = () => {
    setIsEditing(false)
    setFormData({ id: null, activity: "", basic_cost: "", vas_cost: "", unit: "pallet" })
    setIsDialogOpen(true)
  }

  // Open "Edit" Mode (Fill form with data)
  const handleEditClick = (rate) => {
    setIsEditing(true)
    setFormData({
        id: rate.id,
        activity: rate.activity,
        basic_cost: rate.basic_cost,
        vas_cost: rate.vas_cost,
        unit: rate.unit
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    const payload = {
        ...formData,
        basic_cost: Number(formData.basic_cost),
        vas_cost: Number(formData.vas_cost),
    }

    if (isEditing) {
        onUpdateRate(payload) // Update existing
    } else {
        onAddRate(payload) // Create new
    }
    
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-slate-900">Rate Cards</h2>
            <p className="text-slate-500">Manage pricing for warehouse activities and VAS.</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700" onClick={handleAddNew}>
            <Plus size={16} className="mr-2"/> Add New Rate
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold text-slate-700">Activity Type</TableHead>
                <TableHead className="font-semibold text-slate-700">Basic Cost</TableHead>
                <TableHead className="font-semibold text-slate-700">VAS Cost</TableHead>
                <TableHead className="font-semibold text-slate-700">Unit</TableHead>
                <TableHead className="font-semibold text-slate-700">Effective Date</TableHead>
                <TableHead className="font-semibold text-slate-700">Expiry Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{rate.activity}</TableCell>
                  <TableCell>¥{rate.basic_cost.toFixed(2)}</TableCell>
                  <TableCell>¥{rate.vas_cost.toFixed(2)}</TableCell>
                  <TableCell><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold uppercase">{rate.unit}</span></TableCell>
                  <TableCell className="text-slate-500">2023-01-01</TableCell>
                  <TableCell className="text-slate-500">2025-12-31</TableCell>
                  <TableCell className="text-right">
                    {/* PENCIL BUTTON */}
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600" onClick={() => handleEditClick(rate)}>
                        <Pencil size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog (Used for both Add and Edit) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Rate Card" : "Add New Rate Card"}</DialogTitle>
            <DialogDescription>Define pricing rules for logistics activities.</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label>Activity Name</Label>
                <Input value={formData.activity} onChange={(e) => setFormData({...formData, activity: e.target.value})} placeholder="Type name..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Basic Cost (¥)</Label>
                    <Input type="number" value={formData.basic_cost} onChange={(e) => setFormData({...formData, basic_cost: e.target.value})} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                    <Label>VAS Cost (¥)</Label>
                    <Input type="number" value={formData.vas_cost} onChange={(e) => setFormData({...formData, vas_cost: e.target.value})} placeholder="0.00" />
                </div>
            </div>
            <div className="space-y-2">
                <Label>Unit</Label>
                <select 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                >
                    <option value="pallet">Pallet</option>
                    <option value="box">Box</option>
                    <option value="pcs">Pcs</option>
                    <option value="trip">Trip</option>
                    <option value="hour">Hour</option>
                </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
                {isEditing ? "Save Changes" : "Add Rate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}