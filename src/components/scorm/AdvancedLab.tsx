import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Beaker, Settings, Activity } from 'lucide-react'
import { getAdvancedActivities } from '@/services/advanced_activities'
import { useRealtime } from '@/hooks/use-realtime'
import type { RecordModel } from 'pocketbase'

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
            ) : activities.length === 0 ? (
              <div className="text-center py-12 text-gray-500 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                Nenhuma atividade ativa no laboratório.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm transition-all flex flex-col gap-3 group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-wider bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">
                        #{act.order_number}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 font-bold border-0"
                      >
                        {act.type}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-gray-900 leading-tight mt-1 group-hover:text-blue-700 transition-colors">
                      {act.title}
                    </h4>
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100/60">
                      <span className="text-sm font-medium text-gray-500">Dificuldade</span>
                      <Badge
                        variant="outline"
                        className="text-gray-600 font-bold border-gray-200 bg-white"
                      >
                        {act.difficulty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="config" className="outline-none">
            <div className="p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50">
              <div className="h-16 w-16 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Configurações do Laboratório</h3>
              <p className="text-gray-500 font-medium max-w-sm mx-auto leading-relaxed">
                Opções de gerenciamento e configurações avançadas serão disponibilizadas aqui em
                breve.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
