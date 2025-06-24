import { useState, useEffect } from 'react'
import { Tab } from '../components/TabItem' // or wherever it's defined

export function useTabSessions() {
  const [sessions, setSessions] = useState<Record<string, Tab[]>>({})

  useEffect(() => {
    const saved = localStorage.getItem('tidyTabSessions')
    if (saved) setSessions(JSON.parse(saved))
  }, [])

  const saveSession = (name: string, tabs: Tab[]) => {
    const updated = { ...sessions, [name]: tabs }
    setSessions(updated)
    localStorage.setItem('tidyTabSessions', JSON.stringify(updated))
  }

  const deleteSession = (name: string) => {
    const updated = { ...sessions }
    delete updated[name]
    setSessions(updated)
    localStorage.setItem('tidyTabSessions', JSON.stringify(updated))
  }

  const renameSession = (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) return
    const updated = { ...sessions }
    updated[newName.trim()] = updated[oldName]
    delete updated[oldName]
    setSessions(updated)
    localStorage.setItem('tidyTabSessions', JSON.stringify(updated))
  }

  return {
    sessions,
    saveSession,
    deleteSession,
    renameSession,
  }
}
