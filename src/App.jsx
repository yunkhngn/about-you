import { Sidebar } from '@/components/layout/Sidebar'
import { EditorArea } from '@/components/layout/EditorArea'
import { RightPanel } from '@/components/layout/RightPanel'
import { TopBar } from '@/components/layout/TopBar'

export default function App() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center Editor */}
        <EditorArea />

        {/* Right Panel */}
        <RightPanel />
      </div>
    </div>
  )
}
