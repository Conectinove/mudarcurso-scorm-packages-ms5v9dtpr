import { Package, Users, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardsProps {
  totalPackages: number
  uniqueStudents: number
  avgCompletion: number
}

export function StatCards({ totalPackages, uniqueStudents, avgCompletion }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in-up">
      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Package className="h-24 w-24" />
        </div>
        <CardContent className="p-6 flex items-center gap-5">
          <div className="h-16 w-16 bg-purple-50 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100/50">
            <Package className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Total de Pacotes
            </p>
            <h3 className="text-4xl font-black text-gray-900">{totalPackages}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Users className="h-24 w-24" />
        </div>
        <CardContent className="p-6 flex items-center gap-5">
          <div className="h-16 w-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100/50">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Alunos Engajados
            </p>
            <h3 className="text-4xl font-black text-gray-900">{uniqueStudents}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm rounded-3xl bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Activity className="h-24 w-24" />
        </div>
        <CardContent className="p-6 flex items-center gap-5">
          <div className="h-16 w-16 bg-emerald-50 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100/50">
            <Activity className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Conclusão Média
            </p>
            <h3 className="text-4xl font-black text-gray-900">{avgCompletion}%</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
