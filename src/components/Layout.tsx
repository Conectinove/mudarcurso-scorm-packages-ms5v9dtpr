import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
      <main className="pb-12">
        <Outlet />
      </main>
    </div>
  )
}
