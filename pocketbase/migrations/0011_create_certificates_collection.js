migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const learningTracks = app.findCollectionByNameOrId('learning_tracks')

    const collection = new Collection({
      name: 'certificates',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'student',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'track',
          type: 'relation',
          required: true,
          collectionId: learningTracks.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'certificate_code', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_cert_code ON certificates (certificate_code)'],
    })
    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('certificates')
    app.delete(collection)
  },
)
