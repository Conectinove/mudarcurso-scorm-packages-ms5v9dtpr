import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { ProgressBadge } from './ProgressBadge'
import type { RecordModel } from 'pocketbase'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  pkg: RecordModel | null
  progresses: RecordModel[]
}

export function StudentProgressModal({ open, onOpenChange, pkg, progresses }: Props) {
  const pkgProgresses = progresses.filter((p) => p.package === pkg?.id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[750px] border-0 rounded-3xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-gray-50 border-b border-gray-100">
          <DialogTitle className="text-2xl font-bold tracking-tight text-gray-900 mb-1">
            Progresso dos Alunos
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600">
            Desempenho no material: <span className="font-bold text-purple-700">{pkg?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="p-0 max-h-[60vh] overflow-y-auto bg-white">
          {pkgProgresses.length === 0 ? (
            <div className="p-16 text-center text-gray-500 font-medium text-lg">
              Nenhum aluno iniciou este pacote ainda.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                <TableRow className="border-b border-gray-100 hover:bg-transparent">
                  <TableHead className="font-bold text-gray-700 h-14 px-8">Aluno</TableHead>
                  <TableHead className="font-bold text-gray-700">Status</TableHead>
                  <TableHead className="font-bold text-gray-700">Nota</TableHead>
                  <TableHead className="font-bold text-gray-700 text-right px-8">
                    Progresso
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pkgProgresses.map((prog) => (
                  <TableRow
                    key={prog.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <TableCell className="font-semibold text-gray-900 px-8 py-5">
                      {prog.expand?.student?.name ||
                        prog.expand?.student?.email ||
                        `Aluno ${prog.student.substring(0, 5)}`}
                    </TableCell>
                    <TableCell>
                      <ProgressBadge status={prog.status} />
                    </TableCell>
                    <TableCell className="font-bold text-gray-700 text-lg">
                      {prog.score || '-'}
                    </TableCell>
                    <TableCell className="text-right px-8">
                      <div className="flex items-center justify-end gap-4">
                        <Progress
                          value={prog.progress_percentage || 0}
                          className="h-2.5 w-24 bg-gray-100"
                        />
                        <span className="text-sm font-bold text-gray-600 w-10">
                          {prog.progress_percentage || 0}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
