import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { RecordModel } from 'pocketbase'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  pkg: RecordModel | null
  progress: RecordModel | null
  onSimulate: (action: 'progress' | 'complete' | 'score') => void
}

export function PlayerSimulationModal({ open, onOpenChange, pkg, progress, onSimulate }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] border-0 rounded-3xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>SCORM Player Simulation</DialogTitle>
          <DialogDescription>Mock interface</DialogDescription>
        </DialogHeader>

        <div className="bg-gray-950 text-white p-10 pb-12 text-center relative">
          <h3 className="text-2xl font-bold mb-3 tracking-tight">{pkg?.name}</h3>
          <p className="text-gray-400 text-sm font-medium">
            Versão: <span className="text-gray-300">{pkg?.version}</span> • Critério:{' '}
            <span className="text-gray-300">{pkg?.completion_criteria}</span>
          </p>

          <div className="mt-12 mb-8">
            <div className="text-7xl font-black text-purple-400 mb-2 drop-shadow-lg">
              {progress?.progress_percentage || 0}%
            </div>
            <div className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">
              Progresso Atual
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-left min-w-[150px]">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                Status
              </div>
              <div className="font-black text-xl text-gray-100">
                {progress?.status || 'not_started'}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-left min-w-[150px]">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">
                Nota (Score)
              </div>
              <div className="font-black text-xl text-gray-100">{progress?.score || 0}</div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white space-y-6">
          <h4 className="text-sm font-black text-gray-800 uppercase tracking-wider text-center">
            Simular Eventos SCORM (LMS API)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              onClick={() => onSimulate('progress')}
              variant="outline"
              className="h-16 text-blue-700 border-blue-200 hover:bg-blue-50 font-bold rounded-2xl text-base shadow-sm"
            >
              Avançar 25%
            </Button>
            <Button
              onClick={() => onSimulate('score')}
              variant="outline"
              className="h-16 text-orange-700 border-orange-200 hover:bg-orange-50 font-bold rounded-2xl text-base shadow-sm"
            >
              +10 Pontos
            </Button>
            <Button
              onClick={() => onSimulate('complete')}
              variant="outline"
              className="h-16 text-emerald-700 border-emerald-200 hover:bg-emerald-50 font-bold rounded-2xl text-base shadow-sm"
            >
              Concluir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
