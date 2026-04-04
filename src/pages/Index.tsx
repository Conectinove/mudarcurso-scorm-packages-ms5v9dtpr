import { useState, useRef, useEffect } from 'react'
import { Package, Upload, Trash2, PlayCircle, LogOut, Eye, FileArchive } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  getScormPackages,
  createScormPackage,
  deleteScormPackage,
  getStudentProgress,
  getOrCreateProgress,
  updateProgress,
} from '@/services/scorm'
import { useRealtime } from '@/hooks/use-realtime'
import type { RecordModel } from 'pocketbase'
import { Label } from '@/components/ui/label'

import { StatCards } from '@/components/scorm/StatCards'
import { StudentProgressModal } from '@/components/scorm/StudentProgressModal'
import { PlayerSimulationModal } from '@/components/scorm/PlayerSimulationModal'

export default function Index() {
  const { toast } = useToast()
  const { user, signOut } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [scormVersion, setScormVersion] = useState('SCORM 1.2')
  const [completionCriteria, setCompletionCriteria] = useState('Marcado como completo')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

  const [packages, setPackages] = useState<RecordModel[]>([])
  const [progresses, setProgresses] = useState<RecordModel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [playerOpen, setPlayerOpen] = useState(false)
  const [studentsOpen, setStudentsOpen] = useState(false)
  const [currentPkg, setCurrentPkg] = useState<RecordModel | null>(null)
  const [currentProgress, setCurrentProgress] = useState<RecordModel | null>(null)

  const loadData = async () => {
    try {
      const [pkgs, progs] = await Promise.all([getScormPackages(), getStudentProgress()])
      setPackages(pkgs)
      setProgresses(progs)
    } catch {
      toast({ title: 'Erro ao carregar dados', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])
  useRealtime('scorm_packages', () => {
    loadData()
  })
  useRealtime('student_progress', () => {
    loadData()
  })

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      return toast({
        title: 'Formato inválido',
        description: 'Selecione um arquivo .zip',
        variant: 'destructive',
      })
    }
    if (!user) return
    setUploadProgress(10)
    try {
      const interval = setInterval(() => setUploadProgress((p) => Math.min((p || 0) + 20, 90)), 200)
      await createScormPackage({
        name: file.name,
        file,
        version: scormVersion,
        completion_criteria: completionCriteria,
        owner: user.id,
      })
      clearInterval(interval)
      setUploadProgress(100)
      setTimeout(() => {
        setUploadProgress(null)
        toast({ title: 'Pacote carregado com sucesso!' })
      }, 600)
    } catch (err: any) {
      setUploadProgress(null)
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este pacote permanentemente?')) return
    try {
      await deleteScormPackage(id)
      toast({ title: 'Pacote excluído' })
    } catch {
      toast({ title: 'Erro ao excluir', variant: 'destructive' })
    }
  }

  const openPlayer = async (pkg: RecordModel) => {
    if (!user) return
    setCurrentPkg(pkg)
    try {
      const prog = await getOrCreateProgress(user.id, pkg.id)
      setCurrentProgress(prog)
      setPlayerOpen(true)
    } catch {
      toast({ title: 'Erro ao carregar simulação', variant: 'destructive' })
    }
  }

  const simulateScormEvent = async (action: 'progress' | 'complete' | 'score') => {
    if (!currentProgress) return
    try {
      let data = {}
      if (action === 'progress') {
        const newPct = Math.min((currentProgress.progress_percentage || 0) + 25, 100)
        data = { progress_percentage: newPct, status: newPct === 100 ? 'completed' : 'in_progress' }
      } else if (action === 'complete') data = { status: 'completed', progress_percentage: 100 }
      else if (action === 'score')
        data = { score: Math.min((currentProgress.score || 0) + 10, 100) }

      const updated = await updateProgress(currentProgress.id, data)
      setCurrentProgress(updated)
      toast({ title: 'Evento SCORM simulado' })
    } catch {
      toast({ title: 'Erro de sincronização', variant: 'destructive' })
    }
  }

  const totalPackages = packages.length
  const uniqueStudents = new Set(progresses.map((p) => p.student)).size
  const avgCompletion =
    progresses.length > 0
      ? Math.round(
          progresses.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / progresses.length,
        )
      : 0

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            Portal SCORM
          </h1>
          <p className="text-gray-500 mt-1.5 font-medium text-lg">
            Gerencie pacotes e monitore o progresso dos alunos
          </p>
        </div>
        <div className="flex items-center gap-4 animate-fade-in">
          <span className="text-sm text-gray-600 font-bold hidden sm:inline-block">
            Olá, {user?.name || user?.email}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={signOut}
            className="gap-2 rounded-xl border-gray-200 hover:bg-gray-100 font-bold h-10 px-4"
          >
            <LogOut className="w-4 h-4" /> Sair
          </Button>
        </div>
      </div>

      <StatCards
        totalPackages={totalPackages}
        uniqueStudents={uniqueStudents}
        avgCompletion={avgCompletion}
      />

      <Card
        className="border-0 shadow-sm overflow-hidden bg-white rounded-3xl animate-fade-in-up"
        style={{ animationDelay: '100ms' }}
      >
        <CardContent className="p-6 sm:p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-purple-100 rounded-2xl flex items-center justify-center shrink-0">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Upload de Material</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold">Versão SCORM</Label>
              <Select value={scormVersion} onValueChange={setScormVersion}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 focus:ring-purple-500/20 h-12 rounded-xl font-bold text-gray-800">
                  <SelectValue placeholder="Selecione a versão" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {['SCORM 1.2', 'SCORM 2004', 'xAPI', 'cmi5'].map((v) => (
                    <SelectItem
                      key={v}
                      value={v}
                      className="rounded-lg my-1 font-bold cursor-pointer"
                    >
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700 font-bold">Critério de Conclusão</Label>
              <Select value={completionCriteria} onValueChange={setCompletionCriteria}>
                <SelectTrigger className="w-full bg-gray-50 border-gray-200 focus:ring-purple-500/20 h-12 rounded-xl font-bold text-gray-800">
                  <SelectValue placeholder="Selecione o critério" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-gray-100 shadow-xl">
                  {[
                    'Marcado como completo',
                    'Aprovação no quiz',
                    'Nota mínima',
                    'Interação completa',
                  ].map((c) => (
                    <SelectItem
                      key={c}
                      value={c}
                      className="rounded-lg my-1 font-bold cursor-pointer"
                    >
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div
            className={cn(
              'relative group flex flex-col items-center justify-center p-10 text-center rounded-3xl border-2 border-dashed transition-all duration-300 ease-apple cursor-pointer',
              isDragging
                ? 'border-purple-500 bg-purple-50 scale-[1.01]'
                : 'border-purple-200 bg-gray-50/50 hover:bg-purple-50/50 hover:border-purple-400',
              uploadProgress !== null && 'pointer-events-none opacity-80',
            )}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault()
              setIsDragging(false)
              if (e.dataTransfer.files[0]) processFile(e.dataTransfer.files[0])
            }}
            onClick={() => !uploadProgress && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
              accept=".zip"
              className="hidden"
            />
            {uploadProgress === null ? (
              <>
                <div className="h-16 w-16 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                  <Upload className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  Arraste o pacote .zip ou clique
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  Max 100MB. Suporta SCORM 1.2, 2004, xAPI e cmi5
                </p>
              </>
            ) : (
              <div className="w-full max-w-md space-y-4 animate-fade-in">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-purple-700">Enviando e processando pacote...</span>
                  <span className="text-purple-900">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-3 bg-purple-100" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {!isLoading && packages.length === 0 && (
        <Card className="border-2 border-dashed border-gray-200 bg-transparent shadow-none rounded-3xl animate-fade-in-up mt-8">
          <CardContent className="p-16 flex flex-col items-center justify-center text-center">
            <div className="h-24 w-24 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileArchive className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-3">Nenhum pacote SCORM</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8 text-lg font-medium">
              Você ainda não enviou nenhum pacote. Faça o upload do seu primeiro material acima para
              começar a gerenciar o progresso.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && packages.length > 0 && (
        <Card
          className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          <Table>
            <TableHeader className="bg-gray-50/80">
              <TableRow className="border-b border-gray-100 hover:bg-transparent">
                <TableHead className="font-bold text-gray-700 h-16 px-6">
                  Pacote Educacional
                </TableHead>
                <TableHead className="font-bold text-gray-700 hidden md:table-cell">
                  Versão / Critério
                </TableHead>
                <TableHead className="font-bold text-gray-700">Progresso Geral</TableHead>
                <TableHead className="font-bold text-gray-700 text-right px-6">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => {
                const pkgProgresses = progresses.filter((p) => p.package === pkg.id)
                const studentsCount = pkgProgresses.length
                const pkgAvg =
                  studentsCount > 0
                    ? Math.round(
                        pkgProgresses.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) /
                          studentsCount,
                      )
                    : 0

                return (
                  <TableRow
                    key={pkg.id}
                    className="border-b border-gray-50 hover:bg-purple-50/40 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 py-5 px-6">
                      <div className="flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center shrink-0 border border-orange-200/50">
                          <Package className="h-7 w-7 text-orange-600" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span
                            className="truncate max-w-[200px] sm:max-w-xs font-black text-gray-800 text-base"
                            title={pkg.name}
                          >
                            {pkg.name}
                          </span>
                          <span className="text-xs text-gray-500 font-bold tracking-wide uppercase">
                            {studentsCount} aluno(s) engajados
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-sm font-bold text-gray-700">{pkg.version}</span>
                        <span className="text-xs font-medium text-gray-500">
                          {pkg.completion_criteria}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 w-48">
                        <Progress value={pkgAvg} className="h-2.5 w-full bg-gray-100" />
                        <span className="text-sm font-black text-gray-700 w-10">{pkgAvg}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-6">
                      <div className="flex justify-end gap-2.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl h-10 px-4"
                          onClick={() => {
                            setCurrentPkg(pkg)
                            setStudentsOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" /> Alunos
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold rounded-xl h-10 px-4 hidden xl:flex"
                          onClick={() => openPlayer(pkg)}
                        >
                          <PlayCircle className="h-4 w-4 mr-2" /> Testar
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          onClick={() => handleDelete(pkg.id)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <StudentProgressModal
        open={studentsOpen}
        onOpenChange={setStudentsOpen}
        pkg={currentPkg}
        progresses={progresses}
      />
      <PlayerSimulationModal
        open={playerOpen}
        onOpenChange={setPlayerOpen}
        pkg={currentPkg}
        progress={currentProgress}
        onSimulate={simulateScormEvent}
      />
    </div>
  )
}
