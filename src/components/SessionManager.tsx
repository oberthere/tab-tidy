import React, { useState } from 'react'
import type { SessionData } from '../types'

interface SessionManagerProps {
  sessions: Record<string, SessionData>
  onSave: (name: string) => void
  onRestore: (sessionData: SessionData) => void
  onRename: (oldName: string, newName: string) => void
  onDelete: (sessionName: string) => void
}

const SessionManager: React.FC<SessionManagerProps> = ({
  sessions,
  onSave,
  onRestore,
  onRename,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [sessionName, setSessionName] = useState('')

  const handleSave = () => {
    const trimmed = sessionName.trim()
    if (trimmed) {
      onSave(trimmed)
      setSessionName('')
    }
  }

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
  }

  const getSessionInfo = (session: SessionData) => {
    if (Array.isArray(session)) {
      return { tabCount: session.length, isLegacy: true, domains: 0, timestamp: undefined }
    }
    return {
      tabCount: session.metadata?.tabCount || session.tabs?.length || 0,
      domains: session.metadata?.domains ?? 0,
      timestamp: session.timestamp,
      isLegacy: false
    }
  }

  return (
    <div className="session-container">
      <button onClick={() => setIsExpanded(!isExpanded)} className="session-toggle">
        <span style={{ fontSize: '16px' }}>Session Manager</span>
        <svg
          className={`arrow-icon ${isExpanded ? 'rotate' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="session-panel">
          <div className="session-save">
            <input
              type="text"
              placeholder="Session name..."
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <button onClick={handleSave}>Save</button>
          </div>

          <div className="session-list">
            {Object.entries(sessions).map(([name, session]) => {
              const info = getSessionInfo(session)

              return (
                <div key={name} className="session-item-card">
                  <div>
                    <h4>{name}</h4>
                    <p>
                      {info.tabCount} tabs
                      {!info.isLegacy && (
                        <>
                          {info.domains > 0 && ` • ${info.domains} sites`}
                          {info.timestamp && ` • ${formatDate(info.timestamp)}`}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="session-actions">
                    <button className="restore" onClick={() => onRestore(session)}>Restore</button>
                    <button
                      className="rename"
                      onClick={() => {
                        const newName = prompt('New name:', name)
                        if (newName && newName.trim()) {
                          onRename(name, newName.trim())
                        }
                      }}
                    >
                      Rename
                    </button>
                    <button className="delete" onClick={() => onDelete(name)}>Delete</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default SessionManager
