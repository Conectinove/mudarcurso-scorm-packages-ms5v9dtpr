import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getMySubmissions = async (userId: string): Promise<RecordModel[]> => {
  return pb.collection('activity_submissions').getFullList({
    filter: `student = "${userId}"`,
  })
}

export const submitActivity = async (
  activityId: string,
  userId: string,
  content: string,
  existingId?: string,
): Promise<RecordModel> => {
  const data = {
    activity: activityId,
    student: userId,
    content,
    status: 'completed',
  }

  if (existingId) {
    return pb.collection('activity_submissions').update(existingId, data)
  }
  return pb.collection('activity_submissions').create(data)
}
