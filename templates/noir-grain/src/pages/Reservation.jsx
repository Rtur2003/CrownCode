import ReservationFlow from '../components/sections/ReservationFlow.jsx'
import { reservation } from '../data/content.js'
import { usePageTitle } from '../hooks/usePageTitle.js'

export default function Reservation() {
  usePageTitle('Rezervasyon')
  return (
    <main className="min-h-screen bg-noir-bg text-noir-text pt-28 lg:pt-36 pb-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        <header className="mb-12 lg:mb-16">
          <h1 className="font-display text-5xl lg:text-7xl text-balance">{reservation.title}</h1>
        </header>
        <ReservationFlow />
      </div>
    </main>
  )
}
