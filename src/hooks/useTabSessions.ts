import { useState, useEffect } from 'react'
import type { Tab, SessionData } from '../types'

declare const chrome: any

export const useTabSessions = (currentTabs: Tab[]) => {
  const [sessions, setSessions] = useState<Record<string, SessionData>>({})

  // Load saved sessions from Chrome sync storage
  useEffect(() => {
    chrome.storage.sync.get(['tidyTabSessions'], (result: any) => {
      if (result.tidyTabSessions) {
        setSessions(result.tidyTabSessions as Record<string, SessionData>)
      }
    })
  }, [])

  // Extract domain from URL for grouping purposes
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'other'
    }
  }

  // Saves current tabs as a new session
  const saveSession = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    // Creates a new session with metadata about the tabs (pinned, activity, etc.)
    const updated: Record<string, SessionData> = {
      ...sessions,
      [trimmed]: {
        tabs: currentTabs,
        timestamp: Date.now(),
        metadata: {
          tabCount: currentTabs.length,
          pinnedCount: currentTabs.filter(t => t.pinned).length,
          domains: [...new Set(currentTabs.map(t => getDomain(t.url)))].length
        }
      },
    }

    setSessions(updated)
    chrome.storage.sync.set({ tidyTabSessions: updated })
  }

  // Delete a saved session
  const deleteSession = (name: string) => {
    const updated = { ...sessions }
    delete updated[name]
    setSessions(updated)
    chrome.storage.sync.set({ tidyTabSessions: updated })
  }

  // Renames an existing session
  const renameSession = (oldName: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed || oldName === trimmed) return

    const updated: Record<string, SessionData> = {
      ...sessions,
      [trimmed]: sessions[oldName],
    }

    // Removes old session name
    delete updated[oldName]
    setSessions(updated)
    chrome.storage.sync.set({ tidyTabSessions: updated })
  }

  // Restores all tabs from previous saved session
  const restoreSession = (session: SessionData) => {
    for (const tab of session.tabs) {
      chrome.tabs.create({ 
        url: tab.url,
        pinned: tab.pinned || false,
        active: false
      })
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