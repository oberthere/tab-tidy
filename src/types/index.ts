export interface Tab {
  id: number
  url: string
  title: string
  favIconUrl?: string
  pinned?: boolean
  active?: boolean
  audible?: boolean
  mutedInfo?: {
    muted: boolean
  }
  index?: number
  windowId?: number
  highlighted?: boolean
  discarded?: boolean
  autoDiscardable?: boolean
  groupId?: number
}

export interface SessionData {
  tabs: Tab[]
  timestamp: number
  metadata?: {
    tabCount: number
    pinnedCount: number
    domains: number
  }
}