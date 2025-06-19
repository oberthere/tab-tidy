import { useState, useEffect } from 'react'
import './App.css'

declare const chrome: any;

function App() {
  const [tabCount, setTabCount] = useState<number>(0)

  useEffect(() => {
    // gets the tab count 
    chrome.tabs.query({}, (tabs: any) => {
      setTabCount(tabs.length)
    })
  }, [])

  return (
    <div className="App">
      <h1>Tidy Tabs</h1>
      <p>You have {tabCount} tabs open</p>
    </div>
  )
}

export default App