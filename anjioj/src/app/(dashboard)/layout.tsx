import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'
import FloatingActionButton from '@/components/ui/FloatingActionButton'
import Breadcrumb from '@/components/ui/Breadcrumb'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Breadcrumb />
          {children}
        </main>
      </div>
      <FloatingActionButton />
    </div>
  )
}