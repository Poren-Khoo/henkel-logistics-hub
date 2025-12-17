import React, { createContext, useState, useContext } from 'react'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([
    // Initial "Welcome" message
    { id: 1, title: "System Online", time: "Just now", type: "system" }
  ])

  // Function to add a new notification (Limit to latest 10)
  const addNotification = (title, type = "info") => {
    const now = Date.now()
    const newNote = {
      id: now,
      title,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      type,
      timestamp: now // Explicitly store timestamp for reliable comparison
    }
    setNotifications(prev => [newNote, ...prev].slice(0, 10))
  }

  // Function to clear all
  const clearNotifications = () => setNotifications([])

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  )
}

// Custom hook to use it easily in other files
export const useNotifications = () => useContext(NotificationContext)