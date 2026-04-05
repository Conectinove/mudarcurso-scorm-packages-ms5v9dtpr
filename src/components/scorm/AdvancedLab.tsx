import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Beaker, Settings, Activity } from 'lucide-react'
import { getAdvancedActivities } from '@/services/advanced_activities'
import { useRealtime } from '@/hooks/use-realtime'
import type { RecordModel } from 'pocketbase'
import { LabStudentView } from './LabStudentView'
import { LabConfigView } from './LabConfigView'

export function AdvancedLab() {
  const [activities, setActivities] = useState<RecordModel[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      const data = await getAdvancedActivities()
      setActivities(data)
    } catch (e) {
      console.error('Error loading advanced activities', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('advanced_activities', () => {
    loadData()
  })

  return (
    <Card
      className="border-0 shadow-sm overflow-hidden bg-white rounded-3xl mt-8 animate-fade-in-up"
      style={{ animationDelay: '300ms' }}
    >
      <CardHeader className="bg-gray-50/80 border-b border-gray-100 p-6 sm:p-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
            <Beaker className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-black text-gray-900 tracking-tight">
              Laboratório Avançado
            </CardTitle>
            <CardDescription className="text-base font-medium text-gray-500 mt-1">
              Organize e visualize atividades técnicas de alto nível
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8">
        <Tabs defaultValue="lab" className="w-full">
          <TabsList className="mb-6 p-1 bg-gray-100/50 rounded-xl h-auto flex-wrap">
            <TabsTrigger
              value="lab"
              className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 transition-all"
            >
              <Activity className="w-4 h-4 mr-2" /> Lab Ativo
            </TabsTrigger>
            <TabsTrigger
              value="config"
              className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm px-6 py-2.5 transition-all"
            >
              <Settings className="w-4 h-4 mr-2" /> Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lab" className="outline-none min-h-[200px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500 font-medium">
                <Activity className="w-6 h-6 mb-3 animate-spin text-blue-500" />
                Carregando atividades...
              </div>
            ) : (
              <LabStudentView activities={activities} />
            )}
          </TabsContent>

          <TabsContent value="config" className="outline-none">
            {loading ? (
              <div className="flex justify-center py-12 text-gray-400">
                <Activity className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <LabConfigView activities={activities} />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
