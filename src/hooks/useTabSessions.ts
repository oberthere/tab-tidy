import { useState, useEffect } from 'react'
import type { Tab, SessionData } from '../types'

declare const chrome: any

export const useTabSessions = (currentTabs: Tab[]) => {
  const [sessions, setSessions] = useState<Record<string, SessionData>>({})

  // Load saved sessions from storage
  useEffect(() => {
    chrome.storage.sync.get(['tidyTabSessions'], (result: any) => {
      const stored = result.tidyTabSessions
      if (stored && typeof stored === 'object') {
        setSessions(stored)
      }
    })
  }, [])

  const updateStorage = (next: Record<string, SessionData>) => {
    setSessions(next)
    chrome.storage.sync.set({ tidyTabSessions: next })
  }

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'other'
    }
  }

  const saveSession = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

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

    updateStorage(updated)
  }

  const deleteSession = (name: string) => {
    const updated = { ...sessions }
    delete updated[name]
    updateStorage(updated)
  }

  const renameSession = (oldName: string, newName: string) => {
    const trimmed = newName.trim()
    if (!trimmed || oldName === trimmed) return

    const updated: Record<string, SessionData> = {
      ...sessions,
      [trimmed]: sessions[oldName],
    }

    delete updated[oldName]
    updateStorage(updated)
  }

  const restoreSession = (session: SessionData) => {
    for (const tab of session.tabs) {
      chrome.tabs.create({
        url: tab.url,
        pinned: tab.pinned || false,
        active: false,
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
