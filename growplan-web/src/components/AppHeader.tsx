import { Bell, HelpCircle, Leaf } from 'lucide-react'

type AppHeaderProps = {
  accountName: string
  accountInitials: string
  variant?: 'full' | 'edge'
}

export function AppHeader({ accountName, accountInitials, variant = 'full' }: AppHeaderProps) {
  return (
    <header className={`app-header app-header--${variant}`}>
      <div className="setup-brand">
        <div className="setup-brand-mark" aria-hidden="true">
          <Leaf size={22} strokeWidth={2.3} />
        </div>
        <span>AgriMatrix</span>
      </div>

      <div className="setup-account">
        <button type="button" className="icon-btn" aria-label="Help">
          <HelpCircle size={18} />
        </button>
        <button type="button" className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
        </button>
        <div className="account-chip">
          <span className="avatar">{accountInitials}</span>
          <span className="account-name">{accountName}</span>
        </div>
      </div>
    </header>
  )
}
