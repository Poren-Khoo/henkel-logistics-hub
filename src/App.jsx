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
import { NotificationProvider, useNotifications } from './context/NotificationContext'

// 动态生成 MQTT Broker URL
const generateBrokerURL = () => {
  const protocol = window.location.protocol 
  if (protocol === 'https:') {
    return 'wss://supos-ce-instance1.supos.app:8084/mqtt'
  } else {
    return 'ws://13.229.82.59:8083/mqtt'
  }
}

const BROKER_URL = generateBrokerURL()

// --- TOPIC DEFINITIONS ---
const TOPIC_INBOUND = 'Henkel/Shanghai/Logistics/Costing/State/Inbound_List'
const TOPIC_APPROVAL = 'Henkel/Shanghai/Logistics/Costing/State/Approval_List'
const TOPIC_HISTORY = 'Henkel/Shanghai/Logistics/Costing/Metric/Final_Cost'
const TOPIC_SUBMIT = 'Henkel/Shanghai/Logistics/Costing/Action/Submit_Req'
const TOPIC_AUDIT = 'Henkel/Shanghai/Logistics/Costing/Action/Audit_Result'
const TOPIC_RATES = 'Henkel/Shanghai/Logistics/Costing/State/Rate_Card'
const TOPIC_INVOICES = 'Henkel/Shanghai/Logistics/Costing/State/Invoices'
const TOPIC_ACTIVITIES = 'Henkel/Shanghai/Logistics/Costing/State/Activity_Log'

// --- INITIAL RATE DATA ---
const INITIAL_RATES = [
    { id: 1, activity: "Inbound Handling", category: "BASIC", price: 50.00, unit: "per pallet" },
    { id: 2, activity: "Outbound Handling", category: "BASIC", price: 50.00, unit: "per pallet" },
    { id: 3, activity: "Storage", category: "BASIC", price: 5.00, unit: "per pallet / day" }, 
    { id: 4, activity: "Activity 1", category: "VAS", price: 200.00, unit: "per trip" }, 
    { id: 5, activity: "Activity 2", category: "VAS", price: 15.00, unit: "per box" }, 
    { id: 6, activity: "Activity 3", category: "VAS", price: 50.00, unit: "per qty" }, 
    { id: 7, activity: "Activity 4", category: "VAS", price: 100.00, unit: "per hour" }, 
]

function App() {
  const [client, setClient] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState("Connecting...")
  
  // --- DATA STATE ---
  const [inboundList, setInboundList] = useState([])
  const [approvalList, setApprovalList] = useState([]) 
  const [historyList, setHistoryList] = useState([])
  const [warehouseActivities, setWarehouseActivities] = useState([]) 
  const [invoiceList, setInvoiceList] = useState([])
  const { addNotification } = useNotifications()
  const [rateList, setRateList] = useState(INITIAL_RATES)

  useEffect(() => {
    const mqttClient = mqtt.connect(BROKER_URL)
    setClient(mqttClient)

    mqttClient.on('connect', () => {
      setConnectionStatus("Connected")
      addNotification("Connected to Henkel Logistics Hub", "success")
      
      // Subscribe to all topics
      mqttClient.subscribe([TOPIC_INBOUND, TOPIC_APPROVAL, TOPIC_HISTORY, TOPIC_RATES, TOPIC_INVOICES, TOPIC_ACTIVITIES])

      // Auto-Sync Rate Cards
      console.log("Auto-Syncing Rate Cards to Node-RED...")
      mqttClient.publish(TOPIC_RATES, JSON.stringify(INITIAL_RATES), { retain: true })
    })

    mqttClient.on('message', (topic, message) => {
      try {
        const payload = JSON.parse(message.toString())

        const toArray = (data) => {
          if (Array.isArray(data)) return data
          if (data && typeof data === 'object') return Object.values(data)
          return []
        }

        if (topic === TOPIC_INBOUND) setInboundList(toArray(payload))
        if (topic === TOPIC_APPROVAL) setApprovalList(toArray(payload))
        if (topic === TOPIC_HISTORY) setHistoryList(toArray(payload))
        if (topic === TOPIC_RATES) setRateList(toArray(payload))
        if (topic === TOPIC_INVOICES) setInvoiceList(toArray(payload))
        
        // 👇 CLEANING GHOSTS ON THE FRONTEND TOO (Safety Net)
        if (topic === TOPIC_ACTIVITIES) {
             const rawList = toArray(payload)
             // Filter out any "Auto-Generated" items just in case the backend missed one
             const cleanList = rawList.filter(item => item.activity !== 'Auto-Generated')
             setWarehouseActivities(cleanList)
        }

      } catch (error) {
        console.error(error)
      }
    })

    return () => mqttClient.end()
  }, [])

  const handleSubmitRequirement = (order, requirements) => {
    if (!client) return
    const payload = { dn_no: order.dn_no, operator: "Operator_01", destination: order.destination, requirements: requirements }
    client.publish(TOPIC_SUBMIT, JSON.stringify(payload))
    setInboundList(prev => prev.filter(item => item.dn_no !== order.dn_no))
    addNotification(`📋 Requirements submitted for ${order.dn_no}`, "info")
  }

  const handleAudit = (dn_no, action, cost) => {
    if (!client) return
    const payload = { dn_no, action, total: cost, comment: action === "REJECT" ? "Rejection" : "OK" }
    client.publish(TOPIC_AUDIT, JSON.stringify(payload))
    setApprovalList(prev => prev.filter(item => item.dn_no !== dn_no))

    if (action === "APPROVE") {
      addNotification(`✅ Approved cost for ${dn_no}(¥${cost.toFixed(2)}`, "success")
    } else {
      addNotification(`❌ Rejected cost for ${dn_no}`, "error")
    }
  }

  // --- RATE CARD HANDLERS ---
  const handleAddRate = (newRate) => {
    const newItem = { ...newRate, id: Date.now() }
    const newList = [...rateList, newItem]
    setRateList(newList)
    if (client) {
        client.publish(TOPIC_RATES, JSON.stringify(newList), { retain: true })
    }
  }

  const handleUpdateRate = (updatedRate) => {
    const newList = rateList.map(item => item.id === updatedRate.id ? updatedRate : item)
    setRateList(newList)
    if (client) {
        client.publish(TOPIC_RATES, JSON.stringify(newList), { retain: true })
    }
  }

  const handleDeleteRate = (idToDelete) => {
    const updatedList = rateList.filter(rate => rate.id !== idToDelete)
    setRateList(updatedList)
    if (client) {
      client.publish(TOPIC_RATES, JSON.stringify(updatedList), { retain: true })
    }
  }

  // --- WAREHOUSE ACTIVITY HANDLERS ---
  const handleAddActivity = (newActivity) => {
    if (!client) return

    const requirements = {
        manual_activity_name: newActivity.activity, 
        qty: newActivity.qty 
    }

    // 🛑 LOGIC FIX: EXACT MATCHING FOR ACTIVITY NAMES
    // This tells Node-RED which Price Rule to use
    if (newActivity.activity === "Activity 1") requirements.urgent_delivery = true
    if (newActivity.activity === "Activity 2") requirements.repacking = true
    if (newActivity.activity === "Activity 3") requirements.temperature_control = true
    if (newActivity.activity === "Activity 4") requirements.loading = true
    
    // NOTE: This submits an ACTION. The Backend will process it and update the STATE topic.
    const payload = {
      dn_no: newActivity.dn_no,
      operator: newActivity.operator,
      destination: "Shanghai",
      requirements: requirements,
      // Pass the timestamp so we can track it later
      timestamp: newActivity.timestamp || new Date().toISOString()
    }

    client.publish(TOPIC_SUBMIT, JSON.stringify(payload))
  }

  const handleDeleteActivity = (timestampToDelete) => {
      // 1. Filter out the item locally
      const updatedList = warehouseActivities.filter(act => act.timestamp !== timestampToDelete)
      
      // 2. Update local state
      setWarehouseActivities(updatedList)

      // 3. Update the Cloud (MQTT) so it persists!
      if (client) {
          client.publish(TOPIC_ACTIVITIES, JSON.stringify(updatedList), { retain: true })
          addNotification("Activity Deleted", "info")
      }
  }

  // --- BILLING / INVOICE HANDLERS ---
  const handleAddInvoice = (newInvoice) => {
    const updatedList = [newInvoice, ...invoiceList]
    setInvoiceList(updatedList)
    if (client) {
        client.publish(TOPIC_INVOICES, JSON.stringify(updatedList), { retain: true })
    }
  }

  const handleUpdateInvoice = (updatedInvoice) => {
    const updatedList = invoiceList.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv)
    setInvoiceList(updatedList)
    if (client) {
        client.publish(TOPIC_INVOICES, JSON.stringify(updatedList), { retain: true })
    }
  }

  const allKnownDNs = [
    ...inboundList.map(i => ({ dn: i.dn_no, status: "New" })),
    ...approvalList.map(i => ({ dn: i.dn_no, status: "Processing" })),
    ...historyList.map(i => ({ dn: i.dn_no, status: "Completed" }))
  ]

  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
          <Route index element={<InboundPage data={inboundList} onSubmit={handleSubmitRequirement} connectionStatus={connectionStatus} allActivities={warehouseActivities} allFinancials={approvalList} />} />
          
          <Route path="activity" element={
            <WarehouseActivityPage 
                dns={allKnownDNs} 
                activities={warehouseActivities} 
                onAddActivity={handleAddActivity}
                onDeleteActivity={handleDeleteActivity} 
            />
          } />

          <Route path="approvals" element={<ApprovalPage data={approvalList} onAudit={handleAudit} />} />
          <Route path="history" element={<HistoryPage data={historyList} />} />
          
          <Route path="billing" element={<BillingPage transactionData={historyList} invoices={invoiceList} onGenerate={handleAddInvoice} onUpdate={handleUpdateInvoice} />} />
          
          <Route path="rates" element=
          {<RateCardsPage
            rates={rateList} 
            onAddRate={handleAddRate} 
            onUpdateRate={handleUpdateRate}
            onDeleteRate={handleDeleteRate}
          />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </NotificationProvider>
  )
}

export default App