const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Progress',
  tableName: 'progress',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    user_id: {
      type: 'int',
      nullable: false,
    },
    course_id: {
      type: 'int',
      nullable: false,
    },
    content_id: {
      type: 'int',
      nullable: false,
    },
    time_spent: {
      type: 'int',
      default: 0, // Time spent in seconds
    },
    completed_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
      },
      inverseSide: 'progress',
    },
    course: {
      target: 'Course',
      type: 'many-to-one',
      joinColumn: {
        name: 'course_id',
        referencedColumnName: 'id',
      },
      inverseSide: 'progress',
    },
    content: {
      target: 'CourseContent',
      type: 'many-to-one',
      joinColumn: {
        name: 'content_id',
        referencedColumnName: 'id',
      },
      inverseSide: 'progress',
    },
  },
});