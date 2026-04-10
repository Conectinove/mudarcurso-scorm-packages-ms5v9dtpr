import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getMyCertificates = async (userId: string): Promise<RecordModel[]> => {
  return pb.collection('certificates').getFullList({
    filter: `student = "${userId}"`,
    expand: 'track',
    sort: '-created',
  })
}

export const issueCertificate = async (userId: string, trackId: string): Promise<RecordModel> => {
  const code = `CERT-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`
  return pb.collection('certificates').create({
    student: userId,
    track: trackId,
    certificate_code: code,
  })
}
