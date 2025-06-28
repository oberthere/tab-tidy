import React from 'react'
import TabItem from './TabItem'
import type { Tab } from '../types'

interface TabListProps {
  tabs: Tab[]
  groupByDomain: boolean
  getDomain: (url: string) => string
  onTabClick: (id: number) => void
  onTabClose: (id: number, e: React.MouseEvent) => void
  onCloseMultiple: (tabIds: number[]) => void
}

const TabList: React.FC<TabListProps> = ({
  tabs,
  groupByDomain,
  getDomain,
  onTabClick,
  onTabClose,
  onCloseMultiple,
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
            <div className="domain-header">
              <span className="group-title">{domain} ({domainTabs.length})</span>
              <button
                className="close-group-button"
                onClick={() => onCloseMultiple(domainTabs.map(tab => tab.id))}
              >
                Close All
              </button>
            </div>

            {domainTabs.map((tab) => (
              <div key={tab.id} className="grouped">
                <TabItem
                  tab={tab}
                  onClick={() => onTabClick(tab.id)}
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
          onClick={() => onTabClick(tab.id)}
          onClose={(e) => onTabClose(tab.id, e)}
        />
      ))}
    </div>
  )
}

export default TabList
