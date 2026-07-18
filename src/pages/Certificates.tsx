import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getMyCertificates } from '@/services/certificates'
import { useRealtime } from '@/hooks/use-realtime'
import { StudentCertificates } from '@/components/scorm/StudentCertificates'
import type { RecordModel } from 'pocketbase'

export default function CertificatesPage() {
  const { user } = useAuth()
  const [certificates, setCertificates] = useState<RecordModel[]>([])

  const loadData = async () => {
    if (!user) return
    try {
      setCertificates(await getMyCertificates(user.id))
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadData()
  }, [user])

  useRealtime('certificates', loadData)

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-500" /> Meus Certificados
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Visualize e gerencie seus certificados de conclusão
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 bg-yellow-50 rounded-xl flex items-center justify-center border border-yellow-100/50">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Certificados
              </p>
              <p className="text-2xl font-black text-gray-900">{certificates.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <StudentCertificates certificates={certificates} user={user} />
    </div>
  )
}
