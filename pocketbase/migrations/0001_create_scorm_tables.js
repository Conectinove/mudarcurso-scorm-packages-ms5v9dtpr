migrate(
  (app) => {
    const usersId = app.findCollectionByNameOrId('users').id

    const collection = new Collection({
      name: 'scorm_packages',
      type: 'base',
      listRule: 'owner = @request.auth.id',
      viewRule: 'owner = @request.auth.id',
      createRule: 'owner = @request.auth.id',
      updateRule: 'owner = @request.auth.id',
      deleteRule: 'owner = @request.auth.id',
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'file',
          type: 'file',
          required: true,
          maxSize: 104857600,
          mimeTypes: ['application/zip', 'application/x-zip-compressed', 'application/x-zip'],
        },
        {
          name: 'version',
          type: 'select',
          values: ['SCORM 1.2', 'SCORM 2004', 'xAPI', 'cmi5'],
          required: true,
        },
        { name: 'completion_criteria', type: 'text' },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_scorm_owner ON scorm_packages (owner)'],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('scorm_packages')
    app.delete(collection)
  },
)
