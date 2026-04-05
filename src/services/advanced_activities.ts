import pb from '@/lib/pocketbase/client'
import type { RecordModel } from 'pocketbase'

export const getAdvancedActivities = async (): Promise<RecordModel[]> => {
  return pb.collection('advanced_activities').getFullList({
    sort: 'order_number',
  })
}
