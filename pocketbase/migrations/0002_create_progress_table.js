migrate(
  (app) => {
    const usersId = app.findCollectionByNameOrId('users').id
    const packagesId = app.findCollectionByNameOrId('scorm_packages').id

    const collection = new Collection({
      name: 'student_progress',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != '' && student = @request.auth.id",
      updateRule: "@request.auth.id != '' && student = @request.auth.id",
      deleteRule: "@request.auth.id != '' && student = @request.auth.id",
      fields: [
        {
          name: 'student',
          type: 'relation',
          required: true,
          collectionId: usersId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'package',
          type: 'relation',
          required: true,
          collectionId: packagesId,
          maxSelect: 1,
          cascadeDelete: true,
        },
        {
          name: 'status',
          type: 'select',
          values: ['not_started', 'in_progress', 'completed', 'passed', 'failed'],
        },
        { name: 'score', type: 'number', min: 0, max: 100 },
        { name: 'progress_percentage', type: 'number', min: 0, max: 100 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_progress_student ON student_progress (student)'],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('student_progress')
    app.delete(collection)
  },
)
