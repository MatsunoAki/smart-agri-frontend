import React from 'react'

const Sidebar = () => {
  return (
    <div className="bg-[#2a3e2c] w-64 h-screen p-5 flex flex-col">
      <nav className='flex flex-col space-y-2'>
        <a href="#" className='text-white hover:bg-[#3a4e3c] p-2 rounded'>Home</a>
        <a href="#" className='text-white hover:bg-[#3a4e3c] p-2 rounded'>Devices</a>
        <a href="#" className='text-white hover:bg-[#3a4e3c] p-2 rounded'>Reports</a>
        <a href="#" className='text-white hover:bg-[#3a4e3c] p-2 rounded'>Settings</a>
        <a href="#" className='text-white hover:bg-[#3a4e3c] p-2 rounded'>Notification</a>
      </nav>
    </div>
  )
}

export default Sidebar