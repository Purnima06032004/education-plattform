const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'CourseContent',
  tableName: 'course_content',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    course_id: {
      type: 'int',
      nullable: false,
    },
    type: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    content: {
      type: 'jsonb',
      nullable: false,
    },
    order: {
      type: 'int',
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    course: {
      target: 'Course',
      type: 'many-to-one',
      joinColumn: {
        name: 'course_id',
        referencedColumnName: 'id',
      },
      inverseSide: 'contents',
    },
  },
});