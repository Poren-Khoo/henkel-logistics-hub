import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import mqtt from 'mqtt'

import Layout from './components/Layout'
import InboundPage from './pages/InboundPage'
import ApprovalPage from './pages/ApprovalPage'
import HistoryPage from './pages/HistoryPage'
import RateCardsPage from './pages/RateCardsPage'
import WarehouseActivityPage from './pages/WarehouseActivityPage'
import BillingPage from './pages/BillingPage'

// 动态生成 MQTT Broker URL
const generateBrokerURL = () => {
  const protocol = window.location.protocol // 'http:' 或 'https:'
  
  if (protocol === 'https:') {
    return 'wss://supos-ce-instance1.supos.app:8084/mqtt'
  } else {
    return 'ws://13.229.82.59:8083/mqtt'
  }
}

const BROKER_URL = generateBrokerURL()

const TOPIC_INBOUND = 'Henkel/Shanghai/Logistics/Costing/State/Inbound_List'
const TOPIC_APPROVAL = 'Henkel/Shanghai/Logistics/Costing/State/Approval_List'
const TOPIC_HISTORY = 'Henkel/Shanghai/Logistics/Costing/Metric/Final_Cost'
const TOPIC_SUBMIT = 'Henkel/Shanghai/Logistics/Costing/Action/Submit_Req'
const TOPIC_AUDIT = 'Henkel/Shanghai/Logistics/Costing/Action/Audit_Result'

function App() {
  const [client, setClient] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")
  
  // --- DATA STATE ---
  const [inboundList, setInboundList] = useState([
    { dn_no: "DN-2025-888", material: "Loctite-Super-Glue", qty: 500, destination: "Shanghai", status: "NEW", supplier: "Warehouse Supplier A" },
    { dn_no: "DN-2025-893", material: "Henkel-Bonderite-MNT1455", qty: 1500, destination: "Beijing", status: "NEW", supplier: "Warehouse Supplier B" }, 
    { dn_no: "DN-2025-899", material: "Loctite-401", qty: 400, destination: "Shanghai", status: "NEW", supplier: "Warehouse Supplier A" },
  ])
  
  const [approvalList, setApprovalList] = useState([]) 

  const [historyList, setHistoryList] = useState([
    { dn_no: "DN-2025-801", final_cost: 150, approved_at: "2025-12-01T10:00:00", supplier: "Warehouse Supplier A" },
    { dn_no: "DN-2025-802", final_cost: 200, approved_at: "2025-12-05T14:30:00", supplier: "Warehouse Supplier A" }, 
    { dn_no: "DN-2025-803", final_cost: 50, approved_at: "2025-12-08T09:15:00", supplier: "Warehouse Supplier B" }, 
    { dn_no: "DN-2025-804", final_cost: 300, approved_at: "2025-11-20T11:00:00", supplier: "Warehouse Supplier A" }, 
  ])

  const [warehouseActivities, setWarehouseActivities] = useState([
    { id: 1, timestamp: "2025-12-09 11:59", dn_no: "DN-2025-888", activity: "Inbound Handling", qty: 1, unit: "pallet", operator: "Operator A", status: "Calculated" },
  ])

  const [rateList, setRateList] = useState([
    { id: 1, activity: "Inbound Handling", basic_cost: 50.00, vas_cost: 0.00, unit: "pallet" },
    { id: 2, activity: "Outbound Handling", basic_cost: 45.00, vas_cost: 0.00, unit: "pallet" },
    { id: 3, activity: "Repacking", basic_cost: 15.00, vas_cost: 5.00, unit: "box" },
    { id: 4, activity: "Relabeling", basic_cost: 2.00, vas_cost: 0.50, unit: "pcs" },
    { id: 5, activity: "Urgent Delivery", basic_cost: 0.00, vas_cost: 200.00, unit: "trip" },
  ])

  useEffect(() => {
    const mqttClient = mqtt.connect(BROKER_URL)
    setClient(mqttClient)

    mqttClient.on('connect', () => {
      setConnectionStatus("Connected")
      mqttClient.subscribe([TOPIC_INBOUND, TOPIC_APPROVAL, TOPIC_HISTORY])
    })

    mqttClient.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString())
        if (topic === TOPIC_INBOUND && Array.isArray(payload)) setInboundList(payload)
        if (topic === TOPIC_APPROVAL && Array.isArray(payload)) setApprovalList(payload)
        if (topic === TOPIC_HISTORY) {
            const newItem = { ...payload, supplier: "Warehouse Supplier A" } 
            setHistoryList(prev => [newItem, ...prev])
        }
      } catch (error) { console.error(error) }
    })

    return () => mqttClient.end()
  }, [])

  const handleSubmitRequirement = (order, requirements) => {
    if (!client) return
    const payload = { dn_no: order.dn_no, operator: "Operator_01", destination: order.destination, requirements: requirements }
    client.publish(TOPIC_SUBMIT, JSON.stringify(payload))
    setInboundList(prev => prev.filter(item => item.dn_no !== order.dn_no))
  }

  const handleAudit = (dn_no, action, cost) => {
    if (!client) return
    const payload = { dn_no, action, total: cost, comment: action === "REJECT" ? "Rejection" : "OK" }
    client.publish(TOPIC_AUDIT, JSON.stringify(payload))
    setApprovalList(prev => prev.filter(item => item.dn_no !== dn_no))
  }

  const handleAddRate = (newRate) => setRateList([...rateList, { ...newRate, id: Date.now() }])
  const handleUpdateRate = (updatedRate) => setRateList(prev => prev.map(item => item.id === updatedRate.id ? updatedRate : item))
  
  // --- UPDATED: HANDLE WAREHOUSE ACTIVITY (SENDS MQTT) ---
  const handleAddActivity = (newActivity) => {
    // 1. Update the Local Table (Visuals)
    setWarehouseActivities(prev => [newActivity, ...prev])

    // 2. Send to Node-RED (The Brain) so it calculates cost & sends to Approval
    if (!client) return

    // Map your Dropdown values to the Flags Node-RED expects for pricing
    const requirements = {
        manual_activity_name: newActivity.activity, 
        qty: newActivity.qty 
    }

    // Keyword matching: If activity says "Repacking", turn on the "repackaging" flag for Node-RED
    if (newActivity.activity.includes("Repacking")) requirements.repackaging = true
    if (newActivity.activity.includes("Urgent")) requirements.urgent_delivery = true
    if (newActivity.activity.includes("Temp")) requirements.temperature_control = true
    
    const payload = {
      dn_no: newActivity.dn_no,
      operator: newActivity.operator,
      destination: "Shanghai", // Default
      supplier: "Warehouse Supplier A", // Important for Billing later
      requirements: requirements
    }

    // Send to the same topic that calculates price
    client.publish(TOPIC_SUBMIT, JSON.stringify(payload))
  }

  const allKnownDNs = [
    ...inboundList.map(i => ({ dn: i.dn_no, status: "New" })),
    ...approvalList.map(i => ({ dn: i.dn_no, status: "Processing" })),
    ...historyList.map(i => ({ dn: i.dn_no, status: "Completed" }))
  ]

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<InboundPage data={inboundList} onSubmit={handleSubmitRequirement} connectionStatus={connectionStatus} allActivities={warehouseActivities} allFinancials={approvalList} />} />
          <Route path="activity" element={<WarehouseActivityPage dns={allKnownDNs} activities={warehouseActivities} onAddActivity={handleAddActivity} />} />
          <Route path="approvals" element={<ApprovalPage data={approvalList} onAudit={handleAudit} />} />
          <Route path="history" element={<HistoryPage data={historyList} />} />
          <Route path="billing" element={<BillingPage transactionData={historyList} />} />
          <Route path="rates" element={<RateCardsPage rates={rateList} onAddRate={handleAddRate} onUpdateRate={handleUpdateRate} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
