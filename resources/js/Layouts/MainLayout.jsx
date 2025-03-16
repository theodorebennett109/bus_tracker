import Sidebar from '@/Components/Sidebar'
import React from 'react'

export default function MainLayout({ children }) {
  return (
    <div className='flex'>
      <Sidebar/>


      <div className="flex-1 p-5  text-white ">
        {children}
      </div>


    </div>
  )
}
