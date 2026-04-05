migrate(
  (app) => {
    const activities = app.findCollectionByNameOrId('advanced_activities')
    if (!activities.fields.getByName('description')) {
      activities.fields.add(new TextField({ name: 'description' }))
    }
    app.save(activities)

    const submissions = app.findCollectionByNameOrId('activity_submissions')
    if (!submissions.fields.getByName('instructor_feedback')) {
      submissions.fields.add(new TextField({ name: 'instructor_feedback' }))
    }
    if (!submissions.fields.getByName('student_comment')) {
      submissions.fields.add(new TextField({ name: 'student_comment' }))
    }
    app.save(submissions)
  },
  (app) => {
    const activities = app.findCollectionByNameOrId('advanced_activities')
    activities.fields.removeByName('description')
    app.save(activities)

    const submissions = app.findCollectionByNameOrId('activity_submissions')
    submissions.fields.removeByName('instructor_feedback')
    submissions.fields.removeByName('student_comment')
    app.save(submissions)
  },
)
