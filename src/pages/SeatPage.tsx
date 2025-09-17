import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { bookingStore } from '../state/bookingStore'
import type { SeatId } from '../state/bookingStore'
import { BottomBar } from '../ui/BottomBar'

type SeatRecord = {
  id: string
  row: number
  col: number
  label: string
  reserved: boolean
}

// 사진 기준: 상단 1줄(1~18) + 본 그리드 6행, 좌 8열 + 통로(2좌석 폭) + 우 8열 = 총 18좌석 폭
const NUM_ROWS = 6
const NUM_COLS = 18
const AISLE_START_COL = 9 // 1-indexed 시작 위치
const AISLE_SPAN = 2

export const SeatPage: React.FC = () => {
  const navigate = useNavigate()
  const [seats, setSeats] = useState<SeatRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<SeatId>>(new Set(bookingStore.getDraft().selectedSeatIds))

  const healedTop = useRef(false)
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const { data, error } = await supabase.from('seats').select('*').order('row').order('col')
      if (error) {
        console.error('seat load error', error)
        setLoading(false)
        return
      }
      const rows = (data ?? []) as SeatRecord[]
      // 상단 18칸 자동 치유: row=0, col=1..18이 없으면 생성
      if (!healedTop.current) {
        const existingCols = new Set(rows.filter(s => s.row === 0).map(s => s.col))
        const missing = Array.from({ length: 18 }).map((_, i) => i + 1).filter(c => !existingCols.has(c))
        if (missing.length) {
          const { error: insertErr } = await supabase
            .from('seats')
            .insert(missing.map(c => ({ row: 0, col: c, label: `0-${c}`, reserved: false })))
          if (insertErr) {
            console.error('top row heal insert failed', insertErr)
          }
          healedTop.current = true
          const { data: reloaded } = await supabase.from('seats').select('*').order('row').order('col')
          setSeats((reloaded ?? []) as SeatRecord[])
          setLoading(false)
          return
        }
        healedTop.current = true
      }
      setSeats(rows)
      setLoading(false)
    }
    load()
  }, [])

  const grid = useMemo(() => {
    const byPos: Record<string, SeatRecord> = {}
    for (const s of seats) byPos[`${s.row}-${s.col}`] = s
    const uiToDbCol = (uiCol: number): number | null => {
      // uiCol: 1..18, 가운데 통로는 9~10
      if (uiCol >= AISLE_START_COL && uiCol < AISLE_START_COL + AISLE_SPAN) return null
      if (uiCol <= AISLE_START_COL - 1) return uiCol
      return uiCol - AISLE_SPAN
    }
    return Array.from({ length: NUM_ROWS }).map((_, r) =>
      Array.from({ length: NUM_COLS }).map((__, c) => {
        const dbCol = uiToDbCol(c + 1)
        if (dbCol === null) return null as any
        return byPos[`${r + 1}-${dbCol}`]
      })
    )
  }, [seats])

  const toggle = (seat: SeatRecord) => {
    if (seat.reserved) return
    const copy = new Set(selected)
    if (copy.has(seat.id)) copy.delete(seat.id)
    else copy.add(seat.id)
    setSelected(copy)
  }

  const handleNext = () => {
    const ids = Array.from(selected)
    bookingStore.setSeats(ids)
    navigate('/info')
  }

  if (loading) return <p>불러오는 중...</p>

  return (
    <div className="page-content with-bottom">
      <div className="seat-grid">
        {/* 상단 1~18 연속 줄 */}
        <div className="seat-row top">
          {Array.from({ length: 18 }).map((_, cIdx) => {
            const seat = seats.find(s => s.row === 0 && s.col === cIdx + 1)
            if (!seat) return <div key={`top-empty-${cIdx}`} />
            const displayNumber = 18 - cIdx // 오 -> 왼 1..18
            return (
              <button
                key={seat.id}
                disabled={seat.reserved}
                onClick={() => toggle(seat)}
                className={'seat ' + (seat.reserved ? 'disabled' : selected.has(seat.id) ? 'selected' : '')}
              >
                {displayNumber}
              </button>
            )
          })}
        </div>
        {grid.map((row, rIdx) => (
          <div key={rIdx} className="seat-row">
            {row.map((seat, cIdx) => {
              // 가운데 통로 (2칸)
              if (cIdx + 1 >= AISLE_START_COL && cIdx + 1 < AISLE_START_COL + AISLE_SPAN) {
                return <div key={`aisle-${rIdx}-${cIdx}`} className="aisle" />
              }
              if (!seat) {
                return <div key={`empty-${rIdx}-${cIdx}`} />
              }
              // 표시용 번호: 좌측은 오->왼 1..8, 우측은 왼->오 1..8
              const isLeft = cIdx + 1 < AISLE_START_COL
              const seatIndexInSide = isLeft ? (AISLE_START_COL - 1 - cIdx) : (cIdx - (AISLE_START_COL + AISLE_SPAN) + 1)
              const rowFromBottom = (NUM_ROWS - rIdx - 1)
              const displayNumber = rowFromBottom * 8 + seatIndexInSide
              const sideClass = isLeft ? 'left' : 'right'
              // 저장용 라벨: 좌측(나-1~48), 우측(가-1~48), 상단(다-1~18)
              const saveLabel = isLeft ? `나-${displayNumber}` : `가-${displayNumber}`
              return (
                <button
                  key={seat.id}
                  disabled={seat.reserved}
                  onClick={() => toggle({ ...seat, label: saveLabel } as any)}
                  className={'seat ' + sideClass + ' ' + (seat.reserved ? 'disabled' : selected.has(seat.id) ? 'selected' : '')}
                >
                  {displayNumber}
                </button>
              )
            })}
          </div>
        ))}
        <div className="stage">무대</div>
      </div>
      <BottomBar
        left={<Link to="/"><button className="btn">돌아가기</button></Link>}
        right={<button className="btn primary" onClick={handleNext} disabled={selected.size === 0}>다음</button>}
      />
    </div>
  )
}


