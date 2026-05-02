import { Bell, HelpCircle, Leaf } from 'lucide-react'

type AppHeaderProps = {
  accountName: string
  accountInitials: string
}

export function AppHeader({ accountName, accountInitials }: AppHeaderProps) {
  return (
    <header className="setup-topbar">
      <div className="setup-brand">
        <div className="setup-brand-mark" aria-hidden="true">
          <Leaf size={22} strokeWidth={2.3} />
        </div>
        <span>GrowPlan AI</span>
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
          <span>{accountName}</span>
        </div>
      </div>
    </header>
  )
}

