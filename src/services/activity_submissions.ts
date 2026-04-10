import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getAllSubmissions = async (): Promise<RecordModel[]> => {
  return pb.collection('activity_submissions').getFullList({
    expand: 'student,activity',
    sort: '-created',
  })
}

export const getMySubmissions = async (userId: string): Promise<RecordModel[]> => {
  return pb.collection('activity_submissions').getFullList({
    filter: `student = "${userId}"`,
  })
}

export const submitActivity = async (
  activityId: string,
  userId: string,
  content: string,
  studentComment: string,
  existingId?: string,
): Promise<RecordModel> => {
  const data = {
    activity: activityId,
    student: userId,
    content,
    student_comment: studentComment,
    status: 'pending',
  }

  if (existingId) {
    return pb.collection('activity_submissions').update(existingId, data)
  }
  return pb.collection('activity_submissions').create(data)
}

export const reviewSubmission = async (
  id: string,
  feedback: string,
  status: string,
): Promise<RecordModel> => {
  return pb.collection('activity_submissions').update(id, {
    instructor_feedback: feedback,
    status: status,
  })
}
