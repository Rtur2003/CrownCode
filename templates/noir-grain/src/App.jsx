import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar.jsx'
import MobileActionBar from './components/layout/MobileActionBar.jsx'
import Footer from './components/layout/Footer.jsx'
import PageTransition from './components/layout/PageTransition.jsx'
import CustomCursor from './components/ui/CustomCursor.jsx'
import Preloader from './components/ui/Preloader.jsx'
import Home from './pages/Home.jsx'
import Menu from './pages/Menu.jsx'
import Reservation from './pages/Reservation.jsx'
import Contact from './pages/Contact.jsx'
import { useScrollTriggerRefresh } from './hooks/useScrollTrigger.js'
import { useLenis } from './hooks/useLenis.js'

function AppInner() {
  useScrollTriggerRefresh()
  useLenis()

  return (
    <PageTransition>
      <Preloader />
      <CustomCursor />
      <Navbar />
      <Routes>
        <Route path="/"             element={<Home />} />
        <Route path="/menu"         element={<Menu />} />
        <Route path="/rezervasyon"  element={<Reservation />} />
        <Route path="/iletisim"     element={<Contact />} />
      </Routes>
      <Footer />
      {/* Alt barın kapladığı alan için mobil boşluk */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <MobileActionBar />
    </PageTransition>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
