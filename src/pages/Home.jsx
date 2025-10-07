import React from 'react'
import Navbar from '../Components/Navbar'  
import Hero from '../Components/Hero'
import About from '../Components/About'
import Service from '../Components/Service'
import Contact from '../Components/Contact'
const Home = () => {
  return (
    <div>
        <Navbar />
        <Hero />
        <About />
        <Service />
        <Contact />
    </div>
  )
}

export default Home