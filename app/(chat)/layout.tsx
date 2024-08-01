import { FaqSection } from '@/components/faq-section'
import { SidebarDesktop } from '@/components/sidebar-desktop'

interface ChatLayoutProps {
  children: React.ReactNode
}

export default async function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative flex h-[calc(100vh_-_theme(spacing.16))] overflow-hidden">
      <SidebarDesktop />
      {children}
      {/* <script
        async
        data-id="7524541731"
        id="chatling-embed-script"
        data-display="fullscreen"
        type="text/javascript"
        src="https://chatling.ai/js/embed.js"
      ></script> */}
      {/* <FaqSection /> */}
    </div>
  )
}
