migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('advanced_activities')
    const tasks = [
      {
        order_number: 1,
        title: 'Implementação de Algoritmo Base',
        type: 'Código',
        difficulty: 'Médio',
        is_active: true,
      },
      {
        order_number: 2,
        title: 'Ambiente Isolado de Testes',
        type: 'Sandbox',
        difficulty: 'Médio',
        is_active: true,
      },
      {
        order_number: 3,
        title: 'Prática de Refatoração',
        type: 'Exercício',
        difficulty: 'Médio',
        is_active: true,
      },
      {
        order_number: 4,
        title: 'Construção de API REST',
        type: 'Projeto',
        difficulty: 'Médio',
        is_active: true,
      },
      {
        order_number: 5,
        title: 'Otimização de Performance',
        type: 'Desafio',
        difficulty: 'Médio',
        is_active: true,
      },
      {
        order_number: 6,
        title: 'Integração Contínua (CI)',
        type: 'Código',
        difficulty: 'Médio',
        is_active: true,
      },
    ]

    for (const task of tasks) {
      try {
        app.findFirstRecordByData('advanced_activities', 'order_number', task.order_number)
      } catch (_) {
        const record = new Record(col)
        record.set('order_number', task.order_number)
        record.set('title', task.title)
        record.set('type', task.type)
        record.set('difficulty', task.difficulty)
        record.set('is_active', task.is_active)
        app.save(record)
      }
    }
  },
  (app) => {
    const col = app.findCollectionByNameOrId('advanced_activities')
    app.truncateCollection(col)
  },
)
