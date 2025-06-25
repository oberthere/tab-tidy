import React, { useState } from 'react'
import type { Tab } from '../types'

interface SessionManagerProps {
  sessions: Record<string, Tab[]>
  onSave: (name: string) => void
  onRestore: (sessionTabs: Tab[]) => void
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

  return (
    <div className="session-manager">
      <h3>Saved Sessions</h3>

      <div className="session-save-form">
        <input
          type="text"
          placeholder="Session name"
          value={newSessionName}
          onChange={(e) => setNewSessionName(e.target.value)}
        />
        <button onClick={handleSave}>Save Tabs</button>
      </div>

      {Object.entries(sessions).length === 0 && (
        <p>No sessions saved yet.</p>
      )}

      <ul className="session-list">
        {Object.entries(sessions).map(([name, sessionTabs]) => (
          <li key={name} className="session-item">
            <div className="session-info">
              <button
                onClick={() => onRestore(sessionTabs)}
                className="restore-button"
              >
                Restore "{name}" ({sessionTabs.length} tabs)
              </button>
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
        ))}
      </ul>
    </div>
  )
}

export default SessionManager