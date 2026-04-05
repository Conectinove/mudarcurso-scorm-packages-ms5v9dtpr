migrate(
  (app) => {
    const collection = new Collection({
      name: 'activity_submissions',
      type: 'base',
      listRule: "@request.auth.id != '' && student = @request.auth.id",
      viewRule: "@request.auth.id != '' && student = @request.auth.id",
      createRule: "@request.auth.id != '' && student = @request.auth.id",
      updateRule: "@request.auth.id != '' && student = @request.auth.id",
      deleteRule: "@request.auth.id != '' && student = @request.auth.id",
      fields: [
        {
          name: 'student',
          type: 'relation',
          required: true,
          collectionId: '_pb_users_auth_',
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'activity',
          type: 'relation',
          required: true,
          collectionId: app.findCollectionByNameOrId('advanced_activities').id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'completed', 'reviewed'],
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_act_sub_student ON activity_submissions (student)',
        'CREATE INDEX idx_act_sub_activity ON activity_submissions (activity)',
      ],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('activity_submissions')
    app.delete(collection)
  },
)
