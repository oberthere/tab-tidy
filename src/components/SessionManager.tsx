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
  const [newSessionName, setNewSessionName] = useState('')

  const handleSave = () => {
    onSave(newSessionName)
    setNewSessionName('')
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getSessionInfo = (session: SessionData | any) => {
    // Handle both old format (array) and new format (SessionData)
    if (Array.isArray(session)) {
      return { tabCount: session.length, isLegacy: true }
    }
    return {
      tabCount: session.metadata?.tabCount || session.tabs?.length || 0,
      pinnedCount: session.metadata?.pinnedCount || 0,
      domains: session.metadata?.domains || 0,
      timestamp: session.timestamp,
      isLegacy: false
    }
  }

  return (
    <div className="session-manager">
      <h3>Saved Sessions</h3>

      <div className="session-save-form">
        <input
          type="text"
          placeholder="Session name"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && newSessionName.trim()) {
              handleSave()
            }
          }}
        />
        <button onClick={handleSave} disabled={!newSessionName.trim()}>
          Save Tabs
        </button>
      </div>

      {Object.entries(sessions).length === 0 && (
        <p>No sessions saved yet.</p>
      )}

      <ul className="session-list">
        {Object.entries(sessions).map(([name, sessionData]) => {
          const info = getSessionInfo(sessionData)
          
          return (
            <li key={name} className="session-item">
              <div className="session-info">
                <button
                  onClick={() => onRestore(sessionData)}
                  className="restore-button"
                >
                  Restore "{name}"
                </button>
                <div className="session-details">
                  <span>{info.tabCount} tabs</span>
                  {!info.isLegacy && (
                    <>
                      {info.pinnedCount > 0 && <span> • {info.pinnedCount} pinned</span>}
                      {info.domains > 0 && <span> • {info.domains} sites</span>}
                      {info.timestamp && (
                        <span className="session-date"> • {formatDate(info.timestamp)}</span>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div className="session-actions">
                <button
                  onClick={() => {
                    const newName = prompt('Enter new name:', name)
                    if (newName) onRename(name, newName)
                  }}
                  className="rename-button"
                >
                  Rename
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete session "${name}"?`)) {
                      onDelete(name)
                    }
                  }}
                  className="delete-button"
                >
                  Delete
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default SessionManager