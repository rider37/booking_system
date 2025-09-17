export type SeatId = string

export type BookingDraft = {
  selectedSeatIds: SeatId[]
  name?: string
  phone?: string
}

let draft: BookingDraft = {
  selectedSeatIds: []
}

export const bookingStore = {
  getDraft(): BookingDraft {
    return { ...draft, selectedSeatIds: [...draft.selectedSeatIds] }
  },
  setSeats(seatIds: SeatId[]) {
    draft.selectedSeatIds = [...new Set(seatIds)]
  },
  setInfo(name: string, phone: string) {
    draft.name = name
    draft.phone = phone
  },
  reset() {
    draft = { selectedSeatIds: [] }
  }
}


