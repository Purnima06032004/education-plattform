const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Enrollment',
  tableName: 'enrollments',
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
    enrolled_at: {
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
      inverseSide: 'enrollments',
    },
    course: {
      target: 'Course',
      type: 'many-to-one',
      joinColumn: {
        name: 'course_id',
        referencedColumnName: 'id',
      },
      inverseSide: 'enrollments',
    },
  },
});