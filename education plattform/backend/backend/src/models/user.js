 const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 100,
      unique: true,
      nullable: false,
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    role: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
});

// Update the User entity
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 100,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 100,
      unique: true,
      nullable: false,
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    role: {
      type: 'varchar',
      length: 50,
      nullable: false,
    },
    created_at: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    // Add these relations with cascade delete
    enrollments: {
      target: 'Enrollment',
      type: 'one-to-many',
      inverseSide: 'user',
      cascade: ["remove"]
    },
    progress: {
      target: 'Progress',
      type: 'one-to-many',
      inverseSide: 'user',
      cascade: ["remove"]
    },
    notifications: {
      target: 'Notification',
      type: 'one-to-many',
      inverseSide: 'user',
      cascade: ["remove"]
    },
    // For courses, we don't want to delete them when the instructor is deleted
    courses: {
      target: 'Course',
      type: 'one-to-many',
      inverseSide: 'instructor'
      // No cascade here - keep courses when user/instructor is deleted
    }
  }
});