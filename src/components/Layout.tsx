import { Outlet, Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, Layers, Settings, Search, Bell, Menu } from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Layout() {
  const location = useLocation()

  const navItems = [
    { title: 'Dashboard', icon: LayoutDashboard, url: '#' },
    { title: 'Cursos', icon: BookOpen, url: '#' },
    { title: 'Materiais Avançados', icon: Layers, url: '/' }, // Active route
    { title: 'Configurações', icon: Settings, url: '#' },
  ]

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#F9FAFB]">
        <Sidebar>
          <SidebarHeader className="h-16 flex items-center justify-center border-b px-4">
            <div className="flex items-center gap-2 font-bold text-xl text-primary w-full">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                M
              </div>
              Mudarcurso
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        className="data-[active=true]:bg-purple-100 data-[active=true]:text-purple-900 hover:bg-purple-50"
                      >
                        <Link to={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 flex items-center justify-between px-4 sm:px-8 border-b bg-white">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="relative hidden sm:flex items-center">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9 w-64 bg-gray-50 border-none focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-gray-500 hover:text-gray-900"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Button>
              <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarImage src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1" />
                <AvatarFallback>MC</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-5xl mx-auto w-full animate-fade-in-up">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
