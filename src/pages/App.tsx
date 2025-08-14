import React from 'react'
import { AppLayout } from '@/pages/layouts/AppLayout'
import { AppRoutes } from '@/pages/routes/AppRoutes'

const App: React.FC = () => {
  return (
    <AppLayout>
      <AppRoutes />
    </AppLayout>
  )
}

export default App


