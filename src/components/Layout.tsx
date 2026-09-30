import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";
import { SystemLogsDrawer } from "./SystemLogsDrawer";

export function Layout() {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden relative selection:bg-primary selection:text-on-primary">
      {/* Background ambient lighting and cybernetic grid */}
      <div className="absolute inset-0 pointer-events-none opacity-15 cyber-grid z-0"></div>
      <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-secondary/5 rounded-full blur-[160px] pointer-events-none z-0"></div>
      
      <Sidebar />
      
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <TopNav />
        <main className="flex-1 overflow-auto p-5 scroll-smooth relative">
          <Outlet />
        </main>
      </div>

      {/* Slide-up System Logs Terminal Drawer (Screen 4) */}
      <SystemLogsDrawer />
    </div>
  );
}
