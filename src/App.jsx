import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import About from './pages/About'
import Booking from './pages/Booking'
import RemoteProgramming from './pages/RemoteProgramming'
import Portal from './pages/Portal'

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
      </Routes>
      <Footer />
    </>
  )
}

export default App
