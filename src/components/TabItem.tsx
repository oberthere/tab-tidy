import React from 'react'
import type { Tab } from '../types/index'

interface TabItemProps {
  tab: Tab
  isSelected: boolean
  onClick: () => void
  onCheckboxChange: (e: React.MouseEvent) => void
  onClose: (e: React.MouseEvent) => void
}

const TabItem: React.FC<TabItemProps> = ({
  tab,
  isSelected,
  onClick,
  onCheckboxChange,
  onClose,
}) => {
  // Get favicon URL with fallback
  const getFaviconUrl = (tab: Tab) => {
    if (tab.favIconUrl) {
      return tab.favIconUrl
    }
    
    // Fallback to Google's favicon service
    try {
      const url = new URL(tab.url)
      return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=16`
    } catch {
      return null
    }
  }

  const faviconUrl = getFaviconUrl(tab)

  return (
    <div className={`tab-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <div className="tab-content">
        {faviconUrl && (
          <img
            src={faviconUrl}
            alt=""
            className="favicon"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <span className="tab-title">{tab.title}</span>
      </div>
      <button className="close-button" onClick={onClose} title="Close tab">
        ×
      </button>
    </div>
  )
}

export default TabItem