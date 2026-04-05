import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getAdvancedActivities = async (): Promise<RecordModel[]> => {
  return pb.collection('advanced_activities').getFullList({
    sort: 'order_number',
  })
}

export const updateAdvancedActivity = async (
  id: string,
  data: Partial<RecordModel>,
): Promise<RecordModel> => {
  return pb.collection('advanced_activities').update(id, data)
}

export const deleteAdvancedActivity = async (id: string): Promise<void> => {
  return pb.collection('advanced_activities').delete(id)
}
