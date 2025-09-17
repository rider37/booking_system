import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { bookingStore } from '../state/bookingStore'
import { supabase } from '../lib/supabaseClient'
import { BottomBar } from '../ui/BottomBar'

export const InfoPage: React.FC = () => {
  const navigate = useNavigate()
  const draft = bookingStore.getDraft()
  const [name, setName] = useState(draft.name ?? '')
  const [phone, setPhone] = useState(draft.phone ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    setError(null)
    if (!name.trim() || !phone.trim()) {
      setError('이름과 전화번호를 입력하세요.')
      return
    }
    if (draft.selectedSeatIds.length === 0) {
      setError('선택된 좌석이 없습니다.')
      return
    }
    setSubmitting(true)
    bookingStore.setInfo(name.trim(), phone.trim())

    // 예약 트랜잭션: 좌석 예약 상태 확인 및 예약 생성
    const { data: seats, error: seatErr } = await supabase
      .from('seats')
      .select('id, reserved')
      .in('id', draft.selectedSeatIds)

    if (seatErr) {
      setError('좌석 조회 중 오류가 발생했습니다.')
      setSubmitting(false)
      return
    }

    if (seats?.some((s) => s.reserved)) {
      setError('이미 예약된 좌석이 포함되어 있습니다. 다시 선택해주세요.')
      setSubmitting(false)
      return
    }

    const { data: booking, error: bookErr } = await supabase
      .from('bookings')
      .insert({ name: name.trim(), phone: phone.trim() })
      .select('id')
      .single()

    if (bookErr || !booking) {
      setError('예약 생성 중 오류가 발생했습니다.')
      setSubmitting(false)
      return
    }

    const seatLinks = draft.selectedSeatIds.map((seatId) => ({ booking_id: booking.id as string, seat_id: seatId }))
    const { error: linkErr } = await supabase.from('booking_seats').insert(seatLinks)
    if (linkErr) {
      setError('좌석 연결 중 오류가 발생했습니다.')
      setSubmitting(false)
      return
    }

    const { error: reserveErr } = await supabase
      .from('seats')
      .update({ reserved: true })
      .in('id', draft.selectedSeatIds)

    if (reserveErr) {
      setError('좌석 상태 업데이트 중 오류가 발생했습니다.')
      setSubmitting(false)
      return
    }

    bookingStore.reset()
    navigate('/done')
  }

  return (
    <div className="page-content with-bottom">
      <div className="form stack gap-12">
        <label className="label">이름
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="이름" />
        </label>
        <label className="label">전화번호
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="010-1234-5678" inputMode="tel" />
        </label>
        {error && <p className="error">{error}</p>}
      </div>
      <BottomBar
        left={<Link to="/seats"><button className="btn">이전</button></Link>}
        right={<button className="btn primary" onClick={handleSubmit} disabled={submitting}>확인</button>}
      />
    </div>
  )
}


