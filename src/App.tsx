import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { Home, Receipt, Users, Calculator } from 'lucide-react'
import { MembersPage } from '@/pages/MembersPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SettlementPage } from '@/pages/SettlementPage'
import { Button } from '@/components/ui/button'
import { UserSwitcher } from '@/components/UserSwitcher'
import { useMembers } from '@/hooks/useMembers'
import { useCurrentUser } from '@/hooks/useCurrentUser'

function Layout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { to: '/', label: '概览', icon: Home },
    { to: '/expenses', label: '支出', icon: Receipt },
    { to: '/settlement', label: '结算', icon: Calculator },
    { to: '/members', label: '成员', icon: Users },
  ]

  const { data: members } = useMembers()
  const { currentUser, login, logout } = useCurrentUser(members)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 移动端顶部栏 */}
      <div className="sm:hidden border-b px-4 py-2 flex items-center justify-between">
        <h1 className="font-bold">🏠 合租记账本</h1>
        <UserSwitcher
          members={members || []}
          currentUser={currentUser}
          onLogin={login}
          onLogout={logout}
        />
      </div>

      {/* 顶部导航 - 桌面端 */}
      <nav className="border-b hidden sm:block">
        <div className="container mx-auto px-4 h-14 flex items-center gap-4">
          <h1 className="font-bold text-lg">🏠 合租记账本</h1>
          <div className="flex-1" />
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {({ isActive }) => (
              <Button variant={isActive ? 'default' : 'ghost'} size="sm">
                <item.icon className="h-4 w-4 mr-1" />
                {item.label}
              </Button>
            )}
          </NavLink>
          ))}
          <UserSwitcher
            members={members || []}
            currentUser={currentUser}
            onLogin={login}
            onLogout={logout}
          />
        </div>
      </nav>

      {/* 主内容区 */}
      <main className="flex-1 container mx-auto py-4 pb-20 sm:pb-4">
        {children}
      </main>

      {/* 底部导航 - 移动端 */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background sm:hidden">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center gap-1 px-4 py-2"
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-xs ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/settlement" element={<SettlementPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
