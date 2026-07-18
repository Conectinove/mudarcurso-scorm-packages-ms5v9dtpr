import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getAllSubmissions } from '@/services/activity_submissions'
import { getLearningTracks } from '@/services/learning_tracks'
import { useRealtime } from '@/hooks/use-realtime'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Clock, TrendingDown, Target, AlertTriangle } from 'lucide-react'
import type { RecordModel } from 'pocketbase'

const chartConfig: ChartConfig = {
  hours: { label: 'Horas', color: 'hsl(221, 83%, 53%)' },
  started: { label: 'Iniciados', color: 'hsl(215, 28%, 67%)' },
  completed: { label: 'Concluídos', color: 'hsl(142, 71%, 45%)' },
  rate: { label: 'Taxa %', color: 'hsl(142, 71%, 45%)' },
}

export function LabConfigAnalytics({ activities }: { activities: RecordModel[] }) {
  const [submissions, setSubmissions] = useState<RecordModel[]>([])
  const [tracks, setTracks] = useState<RecordModel[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string>('all')

  const loadData = async () => {
    try {
      const [subs, trks] = await Promise.all([getAllSubmissions(), getLearningTracks()])
      setSubmissions(subs)
      setTracks(trks)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('activity_submissions', loadData)
  useRealtime('learning_tracks', loadData)

  const statsByType = activities.reduce(
    (acc, act) => {
      const type = act.type || 'Outros'
      if (!acc[type]) acc[type] = { hoursTotal: 0, hoursCount: 0, subsTotal: 0, subsDone: 0 }
      const subs = submissions.filter((s) => s.activity === act.id)
      subs.forEach((s) => {
        const hours =
          (new Date(s.updated).getTime() - new Date(s.created).getTime()) / (1000 * 60 * 60)
        acc[type].hoursTotal += hours
        acc[type].hoursCount += 1
        acc[type].subsTotal += 1
        if (s.status === 'completed' || s.status === 'reviewed') acc[type].subsDone += 1
      })
      return acc
    },
    {} as Record<
      string,
      { hoursTotal: number; hoursCount: number; subsTotal: number; subsDone: number }
    >,
  )

  const completionData = Object.entries(statsByType).map(([type, d]) => ({
    type,
    hours: d.hoursCount > 0 ? Math.round((d.hoursTotal / d.hoursCount) * 10) / 10 : 0,
  }))

  const successData = Object.entries(statsByType).map(([type, d]) => ({
    type,
    rate: d.subsTotal > 0 ? Math.round((d.subsDone / d.subsTotal) * 100) : 0,
  }))

  const trackObj = selectedTrack !== 'all' ? tracks.find((t) => t.id === selectedTrack) : null
  const trackActivities = trackObj
    ? activities.filter((a) => (trackObj.activities || []).includes(a.id))
    : activities

  const retentionData = trackActivities.map((act) => {
    const subs = submissions.filter((s) => s.activity === act.id)
    const started = new Set(subs.map((s) => s.student)).size
    const completed = new Set(
      subs.filter((s) => s.status === 'completed' || s.status === 'reviewed').map((s) => s.student),
    ).size
    return {
      name: act.title.length > 15 ? act.title.substring(0, 15) + '…' : act.title,
      started,
      completed,
      rate: started > 0 ? Math.round((completed / started) * 100) : 0,
    }
  })

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5 text-blue-600" /> Tempo Médio de Conclusão por Tipo
          </CardTitle>
          <CardDescription>Horas em média entre submissão e conclusão/revisão</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={completionData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="type" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="hours" fill="hsl(221, 83%, 53%)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-green-600" /> Taxa de Sucesso por Tipo
          </CardTitle>
          <CardDescription>Percentual de submissões concluídas ou revisadas</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={successData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="type" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="rate" fill="hsl(142, 71%, 45%)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingDown className="w-5 h-5 text-red-500" /> Relatório de Retenção
              </CardTitle>
              <CardDescription>Identifique onde os alunos param de progredir</CardDescription>
            </div>
            <Select value={selectedTrack} onValueChange={setSelectedTrack}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Atividades</SelectItem>
                {tracks.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={retentionData}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                fontSize={11}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis tickLine={false} axisLine={false} fontSize={12} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="started" fill="hsl(215, 28%, 67%)" radius={4} />
              <Bar dataKey="completed" fill="hsl(142, 71%, 45%)" radius={4} />
            </BarChart>
          </ChartContainer>
          <div className="mt-4 space-y-2">
            {retentionData.map((d, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
              >
                <span className="font-medium text-gray-700 truncate flex-1 mr-2 flex items-center gap-1.5">
                  {d.rate < 50 && d.started > 0 && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  )}
                  {d.name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">
                    {d.completed}/{d.started}
                  </span>
                  <span
                    className={
                      'font-bold ' +
                      (d.rate >= 75
                        ? 'text-green-600'
                        : d.rate >= 50
                          ? 'text-yellow-600'
                          : 'text-red-600')
                    }
                  >
                    {d.rate}%
                  </span>
                </div>
              </div>
            ))}
            {retentionData.length === 0 && (
              <p className="text-center text-sm text-gray-500 py-4">Nenhum dado disponível.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
