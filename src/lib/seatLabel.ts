export function formatSeatLabel(row: number, col: number): string {
  // 상단 줄: row=0, col=1..18, 우->좌 1..18
  if (row === 0) {
    const n = 19 - col
    return `다-${n}`
  }
  // 본 그리드: 6행, 좌(1..8), 통로(9,10 UI), 우(10..17 DB)
  const NUM_ROWS = 6
  const isLeft = col <= 8
  const seatIndexInSide = isLeft ? (9 - col) : (col - 9)
  const number = (NUM_ROWS - row) * 8 + seatIndexInSide
  const prefix = isLeft ? '나' : '가'
  return `${prefix}-${number}`
}


