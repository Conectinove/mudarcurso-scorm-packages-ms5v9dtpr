onRecordAfterUpdateSuccess((e) => {
  const studentId = e.record.getString('student')
  const newStatus = e.record.getString('status')

  if (newStatus !== 'completed' && newStatus !== 'reviewed') {
    return e.next()
  }

  const tracks = $app.findRecordsByFilter('learning_tracks', 'is_active = true', 'created', 0, 0)

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i]
    const trackId = track.id

    let hasCert = false
    try {
      $app.findFirstRecordByFilter(
        'certificates',
        'student = "' + studentId + '" && track = "' + trackId + '"',
      )
      hasCert = true
    } catch (_) {}

    if (hasCert) continue

    const activityIds = track.getStringSlice('activities')
    if (!activityIds || activityIds.length === 0) continue

    let allComplete = true
    for (let j = 0; j < activityIds.length; j++) {
      try {
        $app.findFirstRecordByFilter(
          'activity_submissions',
          'student = "' +
            studentId +
            '" && activity = "' +
            activityIds[j] +
            '" && (status = "completed" || status = "reviewed")',
        )
      } catch (_) {
        allComplete = false
        break
      }
    }

    if (allComplete) {
      try {
        const code = 'CERT-' + $security.randomString(12).toUpperCase()
        const certCol = $app.findCollectionByNameOrId('certificates')
        const cert = new Record(certCol)
        cert.set('student', studentId)
        cert.set('track', trackId)
        cert.set('issue_date', new Date().toISOString().split('T')[0])
        cert.set('certificate_code', code)
        $app.save(cert)
        $app
          .logger()
          .info('auto_certificate: generated certificate', 'student', studentId, 'track', trackId)
      } catch (err) {
        $app
          .logger()
          .error('auto_certificate: failed to generate certificate', 'error', err.message)
      }
    }
  }

  return e.next()
}, 'activity_submissions')
