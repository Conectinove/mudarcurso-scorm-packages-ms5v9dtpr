migrate(
  (app) => {
    const subsCol = app.findCollectionByNameOrId('activity_submissions')
    subsCol.updateRule = "@request.auth.id != ''"
    app.save(subsCol)

    let activities = []
    try {
      activities = app.findRecordsByFilter(
        'advanced_activities',
        'id != ""',
        'order_number',
        100,
        0,
      )
    } catch (_) {}
    if (activities.length === 0) return

    const activityIds = activities.map(function (a) {
      return a.id
    })
    const tracksCol = app.findCollectionByNameOrId('learning_tracks')

    var seedTracks = [
      {
        name: 'Trilha Frontend Completa',
        description: 'Dominio completo de desenvolvimento frontend moderno',
        activities: activityIds.slice(0, 3),
        is_active: true,
      },
      {
        name: 'Trilha Backend Avancada',
        description: 'Projetos e desafios de arquitetura backend',
        activities: activityIds.slice(2, 5),
        is_active: true,
      },
      {
        name: 'Trilha Full Stack',
        description: 'Trilha integrada com todas as atividades',
        activities: activityIds,
        is_active: true,
      },
    ]

    for (var i = 0; i < seedTracks.length; i++) {
      var t = seedTracks[i]
      try {
        app.findFirstRecordByData('learning_tracks', 'name', t.name)
      } catch (_) {
        var record = new Record(tracksCol)
        record.set('name', t.name)
        record.set('description', t.description)
        record.set('activities', t.activities)
        record.set('is_active', t.is_active)
        app.save(record)
      }
    }

    var admin = null
    try {
      admin = app.findAuthRecordByEmail('_pb_users_auth_', 'ronaldoconectinove@gmail.com')
    } catch (_) {}
    if (!admin) return

    var subsCollection = app.findCollectionByNameOrId('activity_submissions')

    var seedSubs = [
      {
        activityIdx: 0,
        content: 'function soma(a, b) { return a + b; }',
        status: 'completed',
        student_comment: 'Resolvi usando arrow function',
      },
      {
        activityIdx: 1,
        content: 'const api = createAPI(); api.get("/users");',
        status: 'reviewed',
        instructor_feedback: 'Excelente abordagem! Codigo limpo e bem estruturado.',
      },
      {
        activityIdx: 2,
        content: 'class Component extends React { render() { return null } }',
        status: 'completed',
        student_comment: 'Usei hooks no lugar de classes',
      },
      { activityIdx: 3, content: 'SELECT * FROM users WHERE active = true', status: 'pending' },
      { activityIdx: 4, content: 'docker build -t app .', status: 'completed' },
    ]

    for (var j = 0; j < seedSubs.length; j++) {
      var s = seedSubs[j]
      if (s.activityIdx >= activities.length) continue
      var actId = activities[s.activityIdx].id
      try {
        app.findFirstRecordByFilter(
          'activity_submissions',
          'student = "' + admin.id + '" && activity = "' + actId + '"',
        )
      } catch (_) {
        var sub = new Record(subsCollection)
        sub.set('student', admin.id)
        sub.set('activity', actId)
        sub.set('content', s.content)
        sub.set('status', s.status)
        if (s.student_comment) sub.set('student_comment', s.student_comment)
        if (s.instructor_feedback) sub.set('instructor_feedback', s.instructor_feedback)
        app.save(sub)
      }
    }
  },
  (app) => {
    var col = app.findCollectionByNameOrId('activity_submissions')
    col.updateRule = "@request.auth.id != '' && student = @request.auth.id"
    app.save(col)
  },
)
