import React from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Welcome to the Dashboard</h1>
        {user && <p className="mt-4">Signed in as: {user.first_name || user.email || user.phone}</p>}
        <button
          onClick={logout}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
