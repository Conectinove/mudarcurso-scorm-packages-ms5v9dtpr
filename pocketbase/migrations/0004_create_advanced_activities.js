migrate(
  (app) => {
    const collection = new Collection({
      name: 'advanced_activities',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'order_number', type: 'number', required: true },
        { name: 'title', type: 'text', required: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['Código', 'Sandbox', 'Exercício', 'Projeto', 'Desafio'],
        },
        { name: 'difficulty', type: 'text' },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('advanced_activities')
    app.delete(collection)
  },
)
