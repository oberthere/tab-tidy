import { useState, useEffect } from 'react'
import './App.css'

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
  // set of selected tab ids for bulk actions
  const [selectedTabs, setSelectedTabs] = useState<Set<number>>(new Set())

  // refresh tab list from chrome api
  const loadTabs = () => {
    chrome.tabs.query({}, (tabs: Tab[]) => {
      setTabs(tabs)
    })
  }

  useEffect(() => {
    loadTabs()
  }, [])

  // handle clicking on a tab to switch to it
  const handleTabClick = (tabId: number) => {
    // only switch if not selecting
    if (selectedTabs.size === 0) {
      chrome.tabs.update(tabId, { active: true })
    }
  }

  // close a single tab
  const handleCloseTab = (tabId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    chrome.tabs.remove(tabId, () => {
      loadTabs()
    })
  }

  // toggle tab selection for bulk actions
  const handleSelectTab = (tabId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    // create new set to trigger re-render
    const newSelected = new Set(selectedTabs)
    if (newSelected.has(tabId)) {
      newSelected.delete(tabId)
    } else {
      newSelected.add(tabId)
    }
    setSelectedTabs(newSelected)
  }

  // close all selected tabs at once
  const handleCloseSelected = () => {
    if (selectedTabs.size > 0) {
      chrome.tabs.remove(Array.from(selectedTabs), () => {
        setSelectedTabs(new Set())
        loadTabs()
      })
    }
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
  const filteredTabs = tabs.filter(tab => 
    tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // group tabs by domain
  const groupedTabs = filteredTabs.reduce((groups: Record<string, Tab[]>, tab) => {
    // get domain for grouping
    const domain = getDomain(tab.url)
    if (!groups[domain]) {
      groups[domain] = []
    }
    groups[domain].push(tab)
    return groups
  }, {})

  // tab component
  const TabItem = ({ tab }: { tab: Tab }) => (
    <div 
      className={`tab-item ${selectedTabs.has(tab.id) ? 'selected' : ''}`}
      onClick={() => handleTabClick(tab.id)}
    >
      <input
        type="checkbox"
        checked={selectedTabs.has(tab.id)}
        onChange={(e) => handleSelectTab(tab.id, e as any)}
        onClick={(e) => e.stopPropagation()}
        className="tab-checkbox"
      />
      {tab.favIconUrl && (
        <img
          src={tab.favIconUrl}
          alt=""
          className="favicon"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      <span className="tab-title">{tab.title}</span>
      <button 
        className="close-button"
        onClick={(e) => handleCloseTab(tab.id, e)}
        title="Close tab"
      >
        ×
      </button>
    </div>
  )

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
        
        {selectedTabs.size > 0 && (
          <button 
            onClick={handleCloseSelected}
            className="close-selected-button"
          >
            Close {selectedTabs.size} tabs
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
                  <TabItem tab={tab} />
                </div>
              ))}
            </div>
          ))
        ) : (
          // regular list view
          filteredTabs.map((tab: Tab) => (
            <TabItem key={tab.id} tab={tab} />
          ))
        )}
      </div>
      
      {filteredTabs.length === 0 && searchQuery && (
        <p className="no-results">No tabs found matching "{searchQuery}"</p>
      )}
    </div>
  )
}

export default App
