import React from 'react'
import { Link } from 'react-router-dom'

export const HomePage: React.FC = () => {
  return (
    <div className="home-hero">
      <div className="home-overlay">
        <h1 className="home-title">2025 극단 봄 정기공연<br />Way Down<br />좌석 예매</h1>
        <div className="home-actions">
          <Link to="/seats"><button className="btn primary lg">좌석 예매</button></Link>
          <Link to="/lookup"><button className="btn lg">예약 확인</button></Link>
        </div>
      </div>
    </div>
  )
}


