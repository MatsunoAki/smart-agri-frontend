import React from 'react'
import Navbar from './components/navbar/Navbar'
import MonitoringData from './components/widgets/monitoringData'
const Dashboard = () => {
return (
    <div>
        <Navbar />
        <div className="flex">
            <div className="bg-[#2a3e2c] w-64 h-screen p-5 flex flex-col">
                <nav className='flex flex-col space-y-2'>
                    <a href="#" className='text-white bg-[#3a4e3c] p-2 rounded'onClick={() => {window.location.href = "/dashboard/home"; }}>Home</a>
                    <a href="#" className='text-white hover:bg-[#3a4e3c] p-2 rounded'onClick={() => {window.location.href = "/dashboard/devices"; }}>Devices</a>
                    <a href="#" className='text-white hover:bg-[#3a4e3c] p-2 rounded'>Reports</a>
                    <a href="#" className='text-white hover:bg-[#3a4e3c] p-2 rounded'>Settings</a>
                    <a href="#" className='text-white hover:bg-[#3a4e3c] p-2 rounded'>Notification</a>
                </nav>
            </div>
        <MonitoringData />
        </div>
    </div>
)
}

export default Dashboard