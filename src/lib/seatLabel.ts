export function formatSeatLabel(row: number, col: number): string {
  // 상단 줄: row=0, col=1..18, 우->좌 1..18
  if (row === 0) {
    const n = 19 - col
    return `다-${n}`
  }
  // 본 그리드: 총 6행. DB col은 좌(1..8), 통로(9), 우(10..17)
  const isLeft = col <= 8
  const seatIndexInSide = isLeft ? (9 - col) : (col - 9) // 1..8
  const number = (6 - row) * 8 + seatIndexInSide // 아래행이 1..8
  const prefix = isLeft ? '나' : '가'
  return `${prefix}-${number}`
}


