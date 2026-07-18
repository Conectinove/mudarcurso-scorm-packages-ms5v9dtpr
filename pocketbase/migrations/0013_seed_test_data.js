migrate(
  (app) => {
    const students = [
      { email: 'student1@test.com', name: 'Ana Silva' },
      { email: 'student2@test.com', name: 'Carlos Santos' },
    ]

    const studentIds = []

    for (let i = 0; i < students.length; i++) {
      const s = students[i]
      try {
        const existing = app.findAuthRecordByEmail('_pb_users_auth_', s.email)
        studentIds.push(existing.id)
      } catch (_) {
        const users = app.findCollectionByNameOrId('_pb_users_auth_')
        const record = new Record(users)
        record.setEmail(s.email)
        record.setPassword('Skip@Pass')
        record.setVerified(true)
        record.set('name', s.name)
        app.save(record)
        studentIds.push(record.id)
      }
    }

    const existingActivities = app.findRecordsByFilter(
      'advanced_activities',
      "id != ''",
      'order_number',
      0,
      0,
    )
    const allActivityIds = []
    for (let i = 0; i < existingActivities.length; i++) {
      allActivityIds.push(existingActivities[i].id)
    }

    const activitiesCol = app.findCollectionByNameOrId('advanced_activities')
    const newActivities = [
      {
        order_number: 10,
        title: 'API REST com Node.js',
        type: 'Projeto',
        difficulty: 'Avancada',
        description: 'Construa uma API REST completa com autenticacao',
      },
      {
        order_number: 11,
        title: 'Otimizacao de Query SQL',
        type: 'Desafio',
        difficulty: 'Avancada',
        description: 'Otimize queries complexas para grande volume de dados',
      },
      {
        order_number: 12,
        title: 'Deploy com Docker',
        type: 'Sandbox',
        difficulty: 'Intermediaria',
        description: 'Pratique containerizacao e CI/CD',
      },
    ]

    for (let i = 0; i < newActivities.length; i++) {
      const a = newActivities[i]
      try {
        const existing = app.findFirstRecordByData('advanced_activities', 'title', a.title)
        allActivityIds.push(existing.id)
      } catch (_) {
        const record = new Record(activitiesCol)
        record.set('order_number', a.order_number)
        record.set('title', a.title)
        record.set('type', a.type)
        record.set('difficulty', a.difficulty)
        record.set('is_active', true)
        record.set('description', a.description)
        app.save(record)
        allActivityIds.push(record.id)
      }
    }

    const tracksCol = app.findCollectionByNameOrId('learning_tracks')
    const testTracks = [
      {
        name: 'Desenvolvimento Full Stack',
        description: 'Trilha completa cobrindo frontend e backend',
        activities: allActivityIds.slice(0, Math.min(4, allActivityIds.length)),
      },
      {
        name: 'Especializacao Backend',
        description: 'Foco em APIs, banco de dados e infraestrutura',
        activities: allActivityIds.slice(Math.max(0, allActivityIds.length - 3)),
      },
    ]

    for (let i = 0; i < testTracks.length; i++) {
      const t = testTracks[i]
      try {
        app.findFirstRecordByData('learning_tracks', 'name', t.name)
      } catch (_) {
        const record = new Record(tracksCol)
        record.set('name', t.name)
        record.set('description', t.description)
        record.set('is_active', true)
        record.set('activities', t.activities)
        app.save(record)
      }
    }

    const subsCol = app.findCollectionByNameOrId('activity_submissions')
    const submissionData = [
      {
        studentIdx: 0,
        activityIdx: 0,
        status: 'completed',
        content: 'Solucao implementada com sucesso',
        feedback: 'Excelente trabalho!',
        comment: 'Gostei muito deste exercicio',
      },
      {
        studentIdx: 0,
        activityIdx: 1,
        status: 'reviewed',
        content: 'Codigo revisado e otimizado',
        feedback: 'Boas praticas aplicadas corretamente',
        comment: '',
      },
      {
        studentIdx: 0,
        activityIdx: 2,
        status: 'pending',
        content: 'Trabalho em andamento',
        feedback: '',
        comment: 'Tive duvidas na parte de CSS',
      },
      {
        studentIdx: 0,
        activityIdx: 3,
        status: 'completed',
        content: 'Projeto finalizado',
        feedback: 'Parabens pela dedicacao!',
        comment: 'Foi um grande desafio',
      },
      {
        studentIdx: 1,
        activityIdx: 0,
        status: 'completed',
        content: 'Resolvido',
        feedback: 'Bom trabalho',
        comment: '',
      },
      {
        studentIdx: 1,
        activityIdx: 1,
        status: 'pending',
        content: 'Em progresso',
        feedback: '',
        comment: 'Preciso de ajuda',
      },
      {
        studentIdx: 1,
        activityIdx: 4,
        status: 'reviewed',
        content: 'API completa',
        feedback: 'Arquitetura solida',
        comment: 'Aprendi muito',
      },
      {
        studentIdx: 1,
        activityIdx: 5,
        status: 'completed',
        content: 'Query otimizada',
        feedback: 'Excelente otimizacao',
        comment: '',
      },
    ]

    for (let i = 0; i < submissionData.length; i++) {
      const s = submissionData[i]
      if (s.studentIdx >= studentIds.length || s.activityIdx >= allActivityIds.length) continue

      const studentId = studentIds[s.studentIdx]
      const activityId = allActivityIds[s.activityIdx]

      try {
        app.findFirstRecordByFilter(
          'activity_submissions',
          'student = "' + studentId + '" && activity = "' + activityId + '"',
        )
      } catch (_) {
        const record = new Record(subsCol)
        record.set('student', studentId)
        record.set('activity', activityId)
        record.set('content', s.content)
        record.set('status', s.status)
        if (s.feedback) record.set('instructor_feedback', s.feedback)
        if (s.comment) record.set('student_comment', s.comment)
        app.save(record)
      }
    }

    for (let i = 0; i < studentIds.length; i++) {
      const offset = i === 0 ? '-2 days' : '-4 days'
      app
        .db()
        .newQuery(
          "UPDATE activity_submissions SET created = datetime('now', {:offset}) WHERE student = {:sid} AND status != 'pending'",
        )
        .bind({ offset: offset, sid: studentIds[i] })
        .execute()
    }
  },
  (app) => {
    const testEmails = ['student1@test.com', 'student2@test.com']
    for (let i = 0; i < testEmails.length; i++) {
      try {
        const record = app.findAuthRecordByEmail('_pb_users_auth_', testEmails[i])
        app.delete(record)
      } catch (_) {}
    }

    const testTitles = ['API REST com Node.js', 'Otimizacao de Query SQL', 'Deploy com Docker']
    for (let i = 0; i < testTitles.length; i++) {
      try {
        const record = app.findFirstRecordByData('advanced_activities', 'title', testTitles[i])
        app.delete(record)
      } catch (_) {}
    }

    const testTrackNames = ['Desenvolvimento Full Stack', 'Especializacao Backend']
    for (let i = 0; i < testTrackNames.length; i++) {
      try {
        const record = app.findFirstRecordByData('learning_tracks', 'name', testTrackNames[i])
        app.delete(record)
      } catch (_) {}
    }
  },
)
