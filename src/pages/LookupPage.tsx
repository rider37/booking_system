import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export const LookupPage: React.FC = () => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [result, setResult] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLookup = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    const { data: booking, error: bookErr } = await supabase
      .from('bookings')
      .select('id')
      .eq('name', name.trim())
      .eq('phone', phone.trim())
      .maybeSingle()

    if (bookErr) {
      setError('조회 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    if (!booking) {
      setResult([])
      setLoading(false)
      return
    }

    const { data: rows, error: joinErr } = await supabase
      .from('booking_seats')
      .select('seat:seat_id(row, col)')
      .eq('booking_id', booking.id)

    if (joinErr) {
      setError('좌석 조회 중 오류가 발생했습니다.')
      setLoading(false)
      return
    }

    const labels = (rows ?? []).map((r: any) => {
      const s = r.seat as any
      // 동일 로직으로 가/나/다 라벨 재계산 표시
      if (s.row === 0) return `다-${19 - s.col}`
      const isLeft = s.col <= 8
      const seatIndexInSide = isLeft ? (9 - s.col) : (s.col - 9)
      const number = (6 - s.row) * 8 + seatIndexInSide
      const prefix = isLeft ? '나' : '가'
      return `${prefix}-${number}`
    })
    setResult(labels)
    setLoading(false)
  }

  return (
    <div className="page-content">
      <div className="form stack gap-12">
        <label className="label">이름
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
        </label>
        <label className="label">전화번호
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" inputMode="tel" />
        </label>
        <button className="btn primary" onClick={handleLookup} disabled={loading}>확인</button>
        {error && <p className="error">{error}</p>}
        {result && (
          <div className="card">
            <h3>예매 좌석</h3>
            {result.length === 0 ? <p>예매 내역이 없습니다.</p> : (
              <ul className="list">
                {result.map((label) => <li key={label}>{label}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


