import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const isHome = location.pathname === '/' || location.pathname === ''
  return (
    <div className={isAdmin ? 'container admin' : 'container'}>
      <header className={isAdmin ? 'app-header admin' : 'app-header public'}>
        {isAdmin ? (
          <>
            <Link to="/" className="brand">관리</Link>
            <nav className="nav">
              <Link to="/">홈</Link>
              <Link to="/lookup">예약 확인</Link>
              <Link to="/admin">관리자</Link>
            </nav>
          </>
        ) : isHome ? null : (
          <div className="app-title">2025 극단 봄 정기공연, Way Down</div>
        )}
      </header>
      <main className={isAdmin ? '' : 'page'}>
        <Outlet />
      </main>
    </div>
  )
}


