import React from 'react'

export interface Tab {
  id: number
  url: string
  title: string
  favIconUrl?: string
}

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
  return (
    <div className={`tab-item ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => {}}
        onClick={onCheckboxChange}
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
      <button className="close-button" onClick={onClose} title="Close tab">
        ×
      </button>
    </div>
  )
}

export default TabItem
