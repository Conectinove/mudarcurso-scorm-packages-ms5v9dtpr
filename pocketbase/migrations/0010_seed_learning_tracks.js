migrate(
  (app) => {
    const tracks = app.findCollectionByNameOrId('learning_tracks')
    const activities = app.findRecordsByFilter(
      'advanced_activities',
      'is_active = true',
      '',
      100,
      0,
    )

    const actIds = activities.map((a) => a.id)

    try {
      app.findFirstRecordByData('learning_tracks', 'name', 'Iniciação ao Código')
    } catch (_) {
      const record = new Record(tracks)
      record.set('name', 'Iniciação ao Código')
      record.set('description', 'Trilha básica para iniciantes')
      record.set('is_active', true)
      if (actIds.length > 0) record.set('activities', actIds.slice(0, Math.ceil(actIds.length / 2)))
      app.save(record)
    }

    try {
      app.findFirstRecordByData('learning_tracks', 'name', 'Projetos Reais')
    } catch (_) {
      const record = new Record(tracks)
      record.set('name', 'Projetos Reais')
      record.set('description', 'Aplicações práticas e desafios')
      record.set('is_active', true)
      if (actIds.length > 1) record.set('activities', actIds.slice(Math.ceil(actIds.length / 2)))
      app.save(record)
    }
  },
  (app) => {
    try {
      const r1 = app.findFirstRecordByData('learning_tracks', 'name', 'Iniciação ao Código')
      app.delete(r1)
    } catch (_) {}
    try {
      const r2 = app.findFirstRecordByData('learning_tracks', 'name', 'Projetos Reais')
      app.delete(r2)
    } catch (_) {}
  },
)
