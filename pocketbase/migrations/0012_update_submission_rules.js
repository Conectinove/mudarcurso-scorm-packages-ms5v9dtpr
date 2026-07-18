migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('activity_submissions')
    col.listRule = "@request.auth.id != ''"
    col.viewRule = "@request.auth.id != ''"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('activity_submissions')
    col.listRule = "@request.auth.id != '' && student = @request.auth.id"
    col.viewRule = "@request.auth.id != '' && student = @request.auth.id"
    app.save(col)
  },
)
