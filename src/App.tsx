import { useState, useEffect } from 'react'
import './App.css'

declare const chrome: any;

function App() {
  const [tabs, setTabs] = useState<any[]>([])

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

  return (
    <div className="App">
      <h1>Tidy Tabs</h1>
      <p>You have {tabs.length} tabs open</p>
    
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
    </div>
  )
}

export default App