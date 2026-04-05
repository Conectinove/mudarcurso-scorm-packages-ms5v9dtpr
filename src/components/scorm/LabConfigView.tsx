import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LabConfigActivities } from './LabConfigActivities'
import { LabConfigTracks } from './LabConfigTracks'
import { LabConfigStats } from './LabConfigStats'
import type { RecordModel } from 'pocketbase'
import { Settings2, ListTree, BarChart3 } from 'lucide-react'

export function LabConfigView({ activities }: { activities: RecordModel[] }) {
  return (
    <div className="animate-fade-in-up">
      <Tabs defaultValue="activities" className="space-y-6">
        <TabsList className="bg-gray-100/80 p-1 h-auto rounded-xl inline-flex w-full sm:w-auto overflow-x-auto">
          <TabsTrigger
            value="activities"
            className="rounded-lg py-2.5 px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium gap-2 whitespace-nowrap"
          >
            <Settings2 className="w-4 h-4" /> Atividades
          </TabsTrigger>
          <TabsTrigger
            value="tracks"
            className="rounded-lg py-2.5 px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium gap-2 whitespace-nowrap"
          >
            <ListTree className="w-4 h-4" /> Trilhas
          </TabsTrigger>
          <TabsTrigger
            value="stats"
            className="rounded-lg py-2.5 px-5 data-[state=active]:bg-white data-[state=active]:shadow-sm font-medium gap-2 whitespace-nowrap"
          >
            <BarChart3 className="w-4 h-4" /> Estatísticas
          </TabsTrigger>
        </TabsList>
        <TabsContent value="activities" className="m-0 focus-visible:outline-none">
          <LabConfigActivities activities={activities} />
        </TabsContent>
        <TabsContent value="tracks" className="m-0 focus-visible:outline-none">
          <LabConfigTracks activities={activities} />
        </TabsContent>
        <TabsContent value="stats" className="m-0 focus-visible:outline-none">
          <LabConfigStats activities={activities} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
