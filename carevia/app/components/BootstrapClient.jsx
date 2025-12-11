// components/BootstrapClient.jsx
"use client"

import { useEffect } from 'react'

export default function BootstrapClient() {
  useEffect(() => {
    // Dynamically import Bootstrap JS only on client side
    import('bootstrap/dist/js/bootstrap.bundle.min.js')
      .then(() => {
        console.log('Bootstrap JS loaded successfully')
      })
      .catch(err => {
        console.error('Failed to load Bootstrap JS:', err)
      })
  }, [])

  return null
}