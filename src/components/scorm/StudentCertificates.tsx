import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Award, Eye, Printer } from 'lucide-react'
import type { RecordModel } from 'pocketbase'

export function StudentCertificates({
  certificates,
  user,
}: {
  certificates: RecordModel[]
  user: any
}) {
  const [selected, setSelected] = useState<RecordModel | null>(null)
  const location = useLocation()
  const isCertPage = location.pathname === '/certificates'

  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" /> Meus Certificados
          </CardTitle>
          {!isCertPage && certificates.length > 0 && (
            <Link to="/certificates">
              <Button variant="outline" size="sm">
                Ver Todos
              </Button>
            </Link>
          )}
        </div>
        <CardDescription>
          Certificados conquistados ao concluir trilhas de aprendizado
        </CardDescription>
      </CardHeader>
      <CardContent>
        {certificates.length === 0 ? (
          <div className="text-center py-8 text-gray-500 font-medium bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Award className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            Nenhum certificado ainda. Conclua uma trilha para ganhar seu primeiro certificado!
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl border-2 border-yellow-100 bg-gradient-to-br from-yellow-50/50 to-white hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-700 font-mono text-xs">
                    {cert.certificate_code}
                  </Badge>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">
                  {cert.expand?.track?.name || 'Trilha'}
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Emitido em:{' '}
                  {new Date(cert.issue_date || cert.created).toLocaleDateString('pt-BR')}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full border-yellow-200 text-yellow-700 hover:bg-yellow-50"
                  onClick={() => setSelected(cert)}
                >
                  <Eye className="w-3.5 h-3.5 mr-2" /> Visualizar
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-[600px] text-center p-8 border-4 border-double border-yellow-200 bg-gradient-to-b from-white to-yellow-50/30">
          <div className="flex flex-col items-center space-y-6">
            <div className="absolute top-4 right-12 no-print">
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.print()}
                className="border-gray-200"
              >
                <Printer className="w-4 h-4 mr-2" /> Imprimir
              </Button>
            </div>
            <Award className="w-20 h-20 text-yellow-500 mb-2 drop-shadow-sm" />
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                Certificado de Conclusão
              </h2>
              <p className="text-gray-500">Este certificado é orgulhosamente apresentado a</p>
            </div>
            <h3 className="text-4xl font-black text-blue-900 border-b-2 border-yellow-200 pb-2 w-full max-w-sm">
              {user?.name || user?.email || 'Estudante'}
            </h3>
            <p className="text-gray-600">
              Por concluir com excelência todos os requisitos da trilha:
            </p>
            <h4 className="text-xl font-bold text-gray-800">
              {selected?.expand?.track?.name || 'Trilha Avançada'}
            </h4>
            <div className="flex justify-between w-full mt-8 pt-6 border-t border-gray-100 text-sm font-medium text-gray-400">
              <span>
                Data:{' '}
                {new Date(
                  selected?.issue_date || selected?.created || Date.now(),
                ).toLocaleDateString('pt-BR')}
              </span>
              <span>Código: {selected?.certificate_code}</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
