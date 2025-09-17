import React from 'react'
import { Link } from 'react-router-dom'

export const HomePage: React.FC = () => {
  return (
    <div className="stack gap-12">
      <Link to="/seats"><button className="btn primary lg">좌석 예매</button></Link>
      <Link to="/lookup"><button className="btn lg">예약 확인</button></Link>
    </div>
  )
}


