import { useState, useEffect, useMemo } from 'react'
import './App.css'
import TabItem from './components/TabItem'
import { useDebounce } from './hooks/useDebounce'

declare const chrome: any

// define tab interface to replace `any`
interface Tab {
  id: number
  url: string
  title: string
  favIconUrl?: string
}

function App() {
  // all open browser tabs
  const [tabs, setTabs] = useState<Tab[]>([])
  // current search filter text
  const [searchQuery, setSearchQuery] = useState('')
  // toggle for domain grouping view
  const [groupByDomain, setGroupByDomain] = useState(false)
  // list of selected tab ids for bulk actions
  const [selectedTabs, setSelectedTabs] = useState<number[]>([])
  const debouncedQuery = useDebounce(searchQuery, 200)
  const [sessions, setSessions] = useState<Record<string, Tab[]>>({})
  const [newSessionName, setNewSessionName] = useState('')


  // refresh tab list from chrome api
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
    const saved = localStorage.getItem('tidyTabSessions')
    if (saved) {
      setSessions(JSON.parse(saved))
    } 
  }, [])

  // load current browser tabs
  useEffect(() => {
    loadTabs()
  }, [])

  // handle clicking on a tab to switch to it
  const handleTabClick = (tabId: number) => {
    // only switch if not selecting
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

  // toggle tab selection for bulk actions
  const handleSelectTab = (tabId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    setSelectedTabs(prev =>
      prev.includes(tabId)
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    )
  }

  // close all selected tabs at once
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

  // get domain from URL
  const getDomain = (url: string) => {
    try {
      // parse url and extract hostname
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return 'other'
    }
  }

  // filter tabs based on search
  const filteredTabs = useMemo(() => {
    return tabs.filter(tab =>
      tab.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      tab.url.toLowerCase().includes(debouncedQuery.toLowerCase())
    )
  }, [tabs, debouncedQuery])


  // group tabs by domain
  const groupedTabs = useMemo(() => {
    return filteredTabs.reduce((groups: Record<string, Tab[]>, tab) => {
      // get domain for grouping
      const domain = getDomain(tab.url)
      if (!groups[domain]) {
        groups[domain] = []
      }
      groups[domain].push(tab)
      return groups
    }, {})
  }, [filteredTabs])

  // saves session to localStorage
  const handleSaveSession = () => {
    if (!newSessionName.trim()) return 

    const updatedSessions = {
      ...sessions,
      [newSessionName.trim()]: tabs,
    }
    setSessions(updatedSessions)
    localStorage.setItem('tidyTabSessions', JSON.stringify(updatedSessions))
    setNewSessionName('')
  }

  // restores session
  const handleRestoreSession = (sessionTabs: Tab[]) => {
    for (const tab of sessionTabs) {
      chrome.tabs.create({ url: tab.url })
    }
  }


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

    <div className="tab-list">
      {groupByDomain ? (
        // grouped view
        Object.entries(groupedTabs).map(([domain, domainTabs]: [string, Tab[]]) => (
          <div key={domain} className="domain-group">
            <h3 className="domain-header">
              {domain} ({domainTabs.length})
            </h3>
            {domainTabs.map((tab: Tab) => (
              <div key={tab.id} className="grouped">
                <TabItem
                  tab={tab}
                  isSelected={selectedTabs.includes(tab.id)}
                  onClick={() => handleTabClick(tab.id)}
                  onCheckboxChange={(e) => handleSelectTab(tab.id, e)}
                  onClose={(e) => handleCloseTab(tab.id, e)}
                />
              </div>
            ))}
          </div>
        ))
      ) : (
        // regular list view
        filteredTabs.map((tab: Tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isSelected={selectedTabs.includes(tab.id)}
            onClick={() => handleTabClick(tab.id)}
            onCheckboxChange={(e) => handleSelectTab(tab.id, e)}
            onClose={(e) => handleCloseTab(tab.id, e)}
          />
        ))
      )}
    </div>

    {filteredTabs.length === 0 && searchQuery && (
      <p className="no-results">No tabs found matching "{searchQuery}"</p>
    )}

    {/* Saved Sessions UI */}
    <div className="session-manager">
      <h3>Saved Sessions</h3>

      <div className="session-save-form">
        <input
          type="text"
          placeholder="Session name"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
        />
        <button onClick={handleSaveSession}>Save Tabs</button>
      </div>

      {Object.entries(sessions).length === 0 && (
        <p>No sessions saved yet.</p>
      )}

      <ul>
        {Object.entries(sessions).map(([name, sessionTabs]) => (
          <li key={name}>
            <button onClick={() => handleRestoreSession(sessionTabs)}>
              Restore "{name}" ({sessionTabs.length} tabs)
            </button>
          </li>
        ))}
      </ul>
    </div>
  </div>
)

}

export default App
