import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Services from './pages/Services'
import About from './pages/About'
import Booking from './pages/Booking'
import RemoteProgramming from './pages/RemoteProgramming'
import Portal from './pages/Portal'
import Admin from './pages/Admin'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/remote-programming" element={<RemoteProgramming />} />
        <Route path="/portal" element={<Portal />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
      <BottomNav />
    </>
  )
}

export default App
