import { useState, useEffect } from 'react'
import './App.css'

declare const chrome: any;

function App() {
  const [tabs, setTabs] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [groupByDomain, setGroupByDomain] = useState(false)

  useEffect(() => {
    // get all tabs
    chrome.tabs.query({}, (tabs: any) => {
      setTabs(tabs)
    })
  }, [])

  const handleTabClick = (tabId: number) => {
    // switches to the clicked tab
    chrome.tabs.update(tabId, { active: true})
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
                <div 
                  key={tab.id}
                  className="tab-item grouped"
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
                </div>
              ))}
            </div>
          ))
        ) : (
          // List view
          filteredTabs.map((tab) => (
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
            </div>
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