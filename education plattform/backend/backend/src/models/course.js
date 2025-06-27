const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Course',
  tableName: 'courses',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    title: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    instructor_id: {
      type: 'int',
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    instructor: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: {
        name: 'instructor_id',
        referencedColumnName: 'id',
        onDelete: 'SET DEFAULT' // Set to a default platform admin ID
      },
      inverseSide: 'courses',
    },
    contents: {
      target: 'CourseContent',
      type: 'one-to-many',
      inverseSide: 'course',
      cascade: ["remove"]
    },
    enrollments: {  
      target: 'Enrollment',
      type: 'one-to-many',
      inverseSide: 'course', 
    },
  },
});