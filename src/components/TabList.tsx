import React from 'react'
import TabItem from './TabItem'
import type { Tab } from '../types'

interface TabListProps {
  tabs: Tab[]
  groupByDomain: boolean
  selectedTabs: number[]
  getDomain: (url: string) => string
  onTabClick: (id: number) => void
  onTabSelect: (id: number, e: React.MouseEvent) => void
  onTabClose: (id: number, e: React.MouseEvent) => void
}

const TabList: React.FC<TabListProps> = ({
  tabs,
  groupByDomain,
  selectedTabs,
  getDomain,
  onTabClick,
  onTabSelect,
  onTabClose,
}) => { 
  // Render grouped view when toggle is active
  if (groupByDomain) {
    const grouped = tabs.reduce((acc: Record<string, Tab[]>, tab) => {
      const domain = getDomain(tab.url)
      acc[domain] = acc[domain] || []
      acc[domain].push(tab)
      return acc
    }, {})

    return (
      <div className="tab-list">
        {Object.entries(grouped).map(([domain, domainTabs]) => (
          <div key={domain} className="domain-group">
            <h3 className="domain-header">
              {domain} ({domainTabs.length})
            </h3>
            {domainTabs.map((tab) => (
              <div key={tab.id} className="grouped">
                <TabItem
                  tab={tab}
                  isSelected={selectedTabs.includes(tab.id)}
                  onClick={() => onTabClick(tab.id)}
                  onCheckboxChange={(e) => onTabSelect(tab.id, e)}
                  onClose={(e) => onTabClose(tab.id, e)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }
  // Render list view
  return (
    <div className="tab-list">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isSelected={selectedTabs.includes(tab.id)}
          onClick={() => onTabClick(tab.id)}
          onCheckboxChange={(e) => onTabSelect(tab.id, e)}
          onClose={(e) => onTabClose(tab.id, e)}
        />
      ))}
    </div>
  )
}

export default TabList