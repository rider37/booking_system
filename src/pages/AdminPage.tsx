import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { formatSeatLabel } from '../lib/seatLabel'

type AdminRow = {
  booking_id: string
  name: string
  phone: string
  seats: string[]
}

export const AdminPage: React.FC = () => {
  const [rows, setRows] = useState<AdminRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setError(null)
    const { data: bookings, error: bErr } = await supabase.from('bookings').select('id, name, phone')
    if (bErr) {
      setError('예약 목록을 불러오지 못했습니다.')
      setLoading(false)
      return
    }

    const results: AdminRow[] = []
    for (const b of bookings ?? []) {
      const { data: seatRows } = await supabase
        .from('booking_seats')
        .select('seat:seat_id(row, col)')
        .eq('booking_id', b.id)
      const labels = (seatRows ?? []).map((r: any) => {
        const s = r.seat as { row: number; col: number }
        return formatSeatLabel(s.row, s.col)
      })
      results.push({
        booking_id: b.id,
        name: b.name,
        phone: b.phone,
        seats: labels
      })
    }
    setRows(results)
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  const cancelBooking = async (bookingId: string) => {
    const { data: seatIds } = await supabase
      .from('booking_seats')
      .select('seat_id')
      .eq('booking_id', bookingId)

    await supabase.from('booking_seats').delete().eq('booking_id', bookingId)
    await supabase.from('bookings').delete().eq('id', bookingId)
    const ids = (seatIds ?? []).map((r: any) => r.seat_id as string)
    if (ids.length) {
      await supabase.from('seats').update({ reserved: false }).in('id', ids)
    }
    await fetchAll()
  }

  const resetAll = async () => {
    await supabase.from('booking_seats').delete().gte('created_at', '1970-01-01')
    await supabase.from('bookings').delete().gte('created_at', '1970-01-01')
    await supabase.from('seats').update({ reserved: false }).gte('row', 0)
    await fetchAll()
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <div className="admin-section">
      <div className="admin-toolbar">
        <button onClick={fetchAll}>새로고침</button>
        <button onClick={resetAll} className="danger">초기화</button>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <colgroup>
            <col style={{ width: 140 }} />
            <col style={{ width: 160 }} />
            <col />
            <col style={{ width: 120 }} />
          </colgroup>
          <thead>
            <tr>
              <th>이름</th>
              <th>전화번호</th>
              <th>좌석</th>
              <th>액션</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.booking_id}>
                <td>{r.name}</td>
                <td>{r.phone}</td>
                <td className="mono">{r.seats.join(', ')}</td>
                <td>
                  <button onClick={() => cancelBooking(r.booking_id)}>취소</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


