const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Notification',
  tableName: 'notifications',
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
    message: {
      type: 'text',
      nullable: false,
    },
    is_read: {
      type: 'boolean',
      default: false,
    },
    created_at: {
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
      inverseSide: 'notifications',
    },
  },
});