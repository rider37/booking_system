import React from 'react'
import { Link } from 'react-router-dom'

export const DonePage: React.FC = () => {
  return (
    <div className="center stack gap-12">
      <h2>예매가 완료되었습니다.</h2>
      <p>예약 확인 메뉴에서 좌석을 확인할 수 있어요.</p>
      <Link to="/"><button className="btn primary">처음으로</button></Link>
    </div>
  )
}


