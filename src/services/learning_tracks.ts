import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getLearningTracks = async (): Promise<RecordModel[]> => {
  return pb.collection('learning_tracks').getFullList({
    sort: 'created',
  })
}

export const createLearningTrack = async (data: Partial<RecordModel>): Promise<RecordModel> => {
  return pb.collection('learning_tracks').create(data)
}

export const updateLearningTrack = async (
  id: string,
  data: Partial<RecordModel>,
): Promise<RecordModel> => {
  return pb.collection('learning_tracks').update(id, data)
}

export const deleteLearningTrack = async (id: string): Promise<void> => {
  return pb.collection('learning_tracks').delete(id)
}
