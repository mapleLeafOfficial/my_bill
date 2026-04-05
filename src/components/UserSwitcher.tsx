import { useState, useRef, useEffect } from 'react'
import { LogOut, User, ChevronDown } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import type { Member } from '@/types'

interface UserSwitcherProps {
  members: Member[]
  currentUser: Member | undefined
  onLogin: (userId: string) => void
  onLogout: () => void
}

export function UserSwitcher({ members, currentUser, onLogin, onLogout }: UserSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉框
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectUser = (userId: string) => {
    onLogin(userId)
    setIsOpen(false)
  }

  const handleLogout = () => {
    onLogout()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
      >
        {currentUser ? (
          <>
            <Avatar className="h-7 w-7">
              {currentUser.avatar_url ? (
                <AvatarImage src={currentUser.avatar_url} alt={currentUser.name} />
              ) : null}
              <AvatarFallback className="text-xs">
                {currentUser.name.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">{currentUser.name}</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </>
        ) : (
          <>
            <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">选择用户</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-popover border rounded-lg shadow-lg z-50 py-1">
          {currentUser && (
            <div className="border-b pb-1 mb-1 px-3 pt-2">
              <p className="text-xs text-muted-foreground">当前用户</p>
              <p className="font-medium">{currentUser.name}</p>
            </div>
          )}

          <div className="px-1">
            <p className="text-xs text-muted-foreground px-2 py-1">
              {currentUser ? '切换用户' : '选择用户'}
            </p>
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => handleSelectUser(member.id)}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-left hover:bg-accent transition-colors ${
                  member.id === currentUser?.id ? 'bg-accent' : ''
                }`}
              >
                <Avatar className="h-6 w-6">
                  {member.avatar_url ? (
                    <AvatarImage src={member.avatar_url} alt={member.name} />
                  ) : null}
                  <AvatarFallback className="text-xs">
                    {member.name.slice(0, 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">{member.name}</span>
                {member.id === currentUser?.id && (
                  <span className="ml-auto text-xs text-primary">✓</span>
                )}
              </button>
            ))}
          </div>

          {currentUser && (
            <div className="border-t mt-1 pt-1 px-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-left hover:bg-accent text-muted-foreground transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">退出登录</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
