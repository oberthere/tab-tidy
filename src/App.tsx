import { useState, useEffect } from 'react'
import './App.css'

declare const chrome: any;

function App() {
  const [tabs, setTabs] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')

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

  // Filter tabs based on user search
  const filteredTabs = tabs.filter(tab =>
    tab.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tab.url.toLowerCase().includes(searchQuery.toLowerCase())
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
    
      <div className="tab-list">
        {tabs.map((tab) => (
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
        ))}
      </div>

      {filteredTabs.length === 0 && searchQuery && (
        <p className="no-results">No tabs found matching "{searchQuery}"</p>
      )}
    </div>
  )
}

export default App