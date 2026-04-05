migrate(
  (app) => {
    const tracks = new Collection({
      name: 'learning_tracks',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'description', type: 'text' },
        {
          name: 'activities',
          type: 'relation',
          collectionId: app.findCollectionByNameOrId('advanced_activities').id,
          maxSelect: 999,
        },
        { name: 'is_active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(tracks)
  },
  (app) => {
    const tracks = app.findCollectionByNameOrId('learning_tracks')
    app.delete(tracks)
  },
)
