import { useState, useEffect } from 'react'
import './App.css'

declare const chrome: any;

function App() {
  const [tabs, setTabs] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [groupByDomain, setGroupByDomain] = useState(false)

  const loadTabs = () => {
    chrome.tabs.query({}, (tabs: any) => {
      setTabs(tabs)
    })
  }

  useEffect(() => {
    loadTabs()
  }, [])

  const handleTabClick = (tabId: number) => {
    // switches to the clicked tab
    chrome.tabs.update(tabId, { active: true})
  }

  const handleCloseTab = (tabId: number, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent tab from switching when clicking X
    chrome.tabs.remove(tabId, () => {
      // Reload tabs after closing
      loadTabs()
    })
  }

  // Get domain from URL
  const getDomain = (url: string) => {
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.replace('www.', '')
    } catch {
      return 'other'
    }
  }

  // Filter tabs based on user search
  const filteredTabs = tabs.filter(tab =>
    tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.url.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Group tabs by domain
  const groupedTabs = filteredTabs.reduce((groups: any, tab) => {
    const domain = getDomain(tab.url)
    if (!groups[domain]) {
      groups[domain] = []
    }
    groups[domain].push(tab)
    return groups
  }, {})

   // Tab component to avoid repetition
  const TabItem = ({ tab }: { tab: any }) => (
    <div 
      key={tab.id}
      className="tab-item"
      onClick={() => handleTabClick(tab.id)}
    >
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

      <button 
        onClick={() => setGroupByDomain(!groupByDomain)}
        className="group-button"
      >
        {groupByDomain ? 'List View' : 'Group by Site'}
      </button>
    
      <div className="tab-list">
        {groupByDomain ? (
          // Grouped view
          Object.entries(groupedTabs).map(([domain, domainTabs]: [string, any]) => (
            <div key={domain} className="domain-group">
              <h3 className="domain-header">
                {domain} ({domainTabs.length})
              </h3>
              {domainTabs.map((tab: any) => (
                <div key={tab.id} className="grouped">
                  <TabItem tab={tab} />
                </div>
              ))}
            </div>
          ))
        ) : (
          // Regular list view
          filteredTabs.map((tab) => (
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