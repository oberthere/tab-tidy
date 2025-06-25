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
  const [selectedTabs, setSelectedTabs] = useState<number[]>([])
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

  // handle clicking on a tab
  const handleTabClick = (tabId: number) => {
    if (selectedTabs.length === 0) {
      chrome.tabs.update(tabId, { active: true }, () => {
        if (chrome.runtime.lastError) {
          console.error('Failed to activate tab:', chrome.runtime.lastError.message)
        }
      })
    }
  }

  // close a single tab
  const handleCloseTab = (tabId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    chrome.tabs.remove(tabId, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to close tab:', chrome.runtime.lastError.message)
        return
      }
      loadTabs()
    })
  }

  // toggle selected tab
  const handleSelectTab = (tabId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedTabs(prev =>
      prev.includes(tabId)
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    )
  }

  // close all selected tabs
  const handleCloseSelected = () => {
    chrome.tabs.remove(selectedTabs, () => {
      if (chrome.runtime.lastError) {
        console.error('Failed to close selected tabs:', chrome.runtime.lastError.message)
        return
      }
      setSelectedTabs([])
      loadTabs()
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

        {selectedTabs.length > 0 && (
          <button
            onClick={handleCloseSelected}
            className="close-selected-button"
          >
            Close {selectedTabs.length} tabs
          </button>
        )}
      </div>

      <TabList
        tabs={filteredTabs}
        groupByDomain={groupByDomain}     
        selectedTabs={selectedTabs}
        getDomain={getDomain}           
        onTabClick={handleTabClick}   
        onTabSelect={handleSelectTab}     
        onTabClose={handleCloseTab}     
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