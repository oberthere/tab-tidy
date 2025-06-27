import { useState, useEffect, useMemo } from 'react'
import './App.css'
import TabList from './components/TabList'
import SessionManager from './components/SessionManager'
import { useDebounce } from './hooks/useDebounce'
import { useTabSessions } from './hooks/useTabSessions'
import type { Tab } from './types/index'

declare const chrome: any

function App() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [groupByDomain, setGroupByDomain] = useState(false)
  const debouncedQuery = useDebounce(searchQuery, 200)

  // Tab sessions logic (extracted to custom hook)
  const {
    sessions,
    saveSession,
    deleteSession,
    renameSession,
    restoreSession,
  } = useTabSessions(tabs)

  // refresh open tab list
  const loadTabs = () => {
    chrome.tabs.query({}, (tabs: Tab[]) => {
      if (chrome.runtime.lastError) {
        console.error('Failed to load tabs:', chrome.runtime.lastError.message)
        return
      }
      setTabs(tabs)
    })
  }

  useEffect(() => {
    loadTabs()
  }, [])

  // Add real-time tab monitoring
  useEffect(() => {
    // Listen for tab updates
    const handleTabUpdated = (_tabId: number, changeInfo: any, _tab: Tab) => {
      if (changeInfo.status === 'complete' || changeInfo.favIconUrl || changeInfo.title) {
        loadTabs()
      }
    }

    // Listen for tab removal
    const handleTabRemoved = (_tabId: number) => {
      loadTabs()
    }

    // Listen for new tabs
    const handleTabCreated = (_tab: Tab) => {
      loadTabs()
    }

    // Listen for tab moves
    const handleTabMoved = (_tabId: number) => {
      loadTabs()
    }

    // Add listeners
    chrome.tabs.onUpdated.addListener(handleTabUpdated)
    chrome.tabs.onRemoved.addListener(handleTabRemoved)
    chrome.tabs.onCreated.addListener(handleTabCreated)
    chrome.tabs.onMoved.addListener(handleTabMoved)

    // Cleanup
    return () => {
      chrome.tabs.onUpdated.removeListener(handleTabUpdated)
      chrome.tabs.onRemoved.removeListener(handleTabRemoved)
      chrome.tabs.onCreated.removeListener(handleTabCreated)
      chrome.tabs.onMoved.removeListener(handleTabMoved)
    }
  }, [])

  // handle clicking on a tab
  const handleTabClick = (tabId: number) => {
    chrome.tabs.update(tabId, { active: true }, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to activate tab:', chrome.runtime.lastError.message)
      }
    })
  }

  // close a single tab
  const handleCloseTab = (tabId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    chrome.tabs.remove(tabId, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to close tab:', chrome.runtime.lastError.message)
        return
      }
      // No need to loadTabs() - listener will handle it
    })
  }

  // close multiple tabs (e.g. all tabs from a domain group)
  const handleCloseMultiple = (tabIds: number[]) => {
    chrome.tabs.remove(tabIds, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to close tabs:', chrome.runtime.lastError.message)
        return
      }
      // No need to loadTabs() - listener will handle it
    })
  }

  // extract domain from URL
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '')
    } catch {
      return 'other'
    }
  }

  const filteredTabs = useMemo(() => {
    return tabs.filter(tab =>
      tab.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      tab.url.toLowerCase().includes(debouncedQuery.toLowerCase())
    )
  }, [tabs, debouncedQuery])

  return (
    <div className="App">
      <h1>Tidy Tabs</h1>
      <p>You have {tabs.length} tabs open</p>

      <input
        type="text"
        placeholder="Search tabs..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      <div className="action-bar">
        <button
          onClick={() => setGroupByDomain(!groupByDomain)}
          className="group-button"
        >
          {groupByDomain ? 'List View' : 'Group by Site'}
        </button>
      </div>

      <TabList
        tabs={filteredTabs}
        groupByDomain={groupByDomain}
        getDomain={getDomain}
        onTabClick={handleTabClick}
        onTabClose={handleCloseTab}
        onCloseMultiple={handleCloseMultiple}
      />

      {filteredTabs.length === 0 && searchQuery && (
        <p className="no-results">No tabs found matching "{searchQuery}"</p>
      )}

      <SessionManager
        sessions={sessions}
        onSave={saveSession}
        onRestore={restoreSession}
        onRename={renameSession}
        onDelete={deleteSession}
      />
    </div>
  )
}

export default App