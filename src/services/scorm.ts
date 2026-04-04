import pb from '@/lib/pocketbase/client'

export const getScormPackages = () =>
  pb.collection('scorm_packages').getFullList({ sort: '-created' })

export const createScormPackage = async (data: {
  name: string
  file: File
  version: string
  completion_criteria: string
  owner: string
}) => {
  const formData = new FormData()
  formData.append('name', data.name)
  formData.append('file', data.file)
  formData.append('version', data.version)
  formData.append('completion_criteria', data.completion_criteria)
  formData.append('owner', data.owner)

  return pb.collection('scorm_packages').create(formData)
}

export const deleteScormPackage = (id: string) => pb.collection('scorm_packages').delete(id)

export const getStudentProgress = () =>
  pb.collection('student_progress').getFullList({ expand: 'package,student' })

export const getOrCreateProgress = async (studentId: string, packageId: string) => {
  const records = await pb.collection('student_progress').getList(1, 1, {
    filter: `student = "${studentId}" && package = "${packageId}"`,
  })

  if (records.items.length > 0) {
    return records.items[0]
  }

  return await pb.collection('student_progress').create({
    student: studentId,
    package: packageId,
    status: 'not_started',
    score: 0,
    progress_percentage: 0,
  })
}

export const updateProgress = (
  id: string,
  data: Partial<{
    status: string
    score: number
    progress_percentage: number
  }>,
) => pb.collection('student_progress').update(id, data)
