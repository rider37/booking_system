import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  return (
    <div className={isAdmin ? 'container admin' : 'container'}>
      <header className={isAdmin ? 'app-header admin' : 'app-header'}>
        <Link to="/" className="brand">좌석 예매</Link>
        {isAdmin && (
          <nav className="nav">
            <Link to="/">홈</Link>
            <Link to="/lookup">예약 확인</Link>
            <Link to="/admin">관리자</Link>
          </nav>
        )}
      </header>
      <main className={isAdmin ? '' : 'page'}>
        <Outlet />
      </main>
    </div>
  )
}


