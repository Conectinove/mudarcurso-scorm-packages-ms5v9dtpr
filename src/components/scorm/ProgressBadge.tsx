import { Badge } from '@/components/ui/badge'

export function ProgressBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
    case 'passed':
      return (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0 font-bold px-3 py-1">
          Concluído
        </Badge>
      )
    case 'failed':
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-0 font-bold px-3 py-1">
          Reprovado
        </Badge>
      )
    case 'in_progress':
      return (
        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-0 font-bold px-3 py-1">
          Em Progresso
        </Badge>
      )
    case 'not_started':
    default:
      return (
        <Badge className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-0 font-bold px-3 py-1">
          Não Iniciado
        </Badge>
      )
  }
}
