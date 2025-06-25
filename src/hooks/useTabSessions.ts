import { useState, useEffect } from 'react'
import type { Tab } from '../types'

declare const chrome: any

export const useTabSessions = (currentTabs: Tab[]) => {
  const [sessions, setSessions] = useState<Record<string, Tab[]>>({})

  useEffect(() => {
    // Use chrome.storage.local instead of localStorage for Chrome extensions
    chrome.storage.local.get(['tidyTabSessions'], (result: any) => {
      if (result.tidyTabSessions) {
        setSessions(result.tidyTabSessions)
      }
    })
  }, [])

  const saveSession = (name: string) => {
    if (!name.trim()) return
    const updated = { ...sessions, [name.trim()]: currentTabs }
    setSessions(updated)
    chrome.storage.local.set({ tidyTabSessions: updated })
  }

  const deleteSession = (name: string) => {
    const updated = { ...sessions }
    delete updated[name]
    setSessions(updated)
    chrome.storage.local.set({ tidyTabSessions: updated })
  }

  const renameSession = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return
    const updated = {
      ...sessions,
      [newName.trim()]: sessions[oldName],
    }
    delete updated[oldName]
    setSessions(updated)
    chrome.storage.local.set({ tidyTabSessions: updated })
  }

  const restoreSession = (tabsToRestore: Tab[]) => {
    for (const tab of tabsToRestore) {
      chrome.tabs.create({ url: tab.url })
    }
  }

  return {
    sessions,
    saveSession,
    deleteSession,
    renameSession,
    restoreSession,
  }
}