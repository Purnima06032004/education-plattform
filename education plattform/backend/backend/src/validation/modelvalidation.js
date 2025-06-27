const Joi = require('joi');

const courseCreateSchema = Joi.object({
  title: Joi.string().required().max(255).messages({
    'any.required': 'Title is required.',
    'string.empty': 'Title cannot be empty.',
    'string.max': 'Title cannot exceed 255 characters.'
  }),
  description: Joi.string().allow('').optional(),
  instructor_id: Joi.number().integer().required().messages({
    'any.required': 'Instructor ID is required.',
    'number.base': 'Instructor ID must be an integer.'
  })
});

const courseUpdateSchema = Joi.object({
  title: Joi.string().max(255).optional().messages({
    'string.max': 'Title cannot exceed 255 characters.'
  }),
  description: Joi.string().allow('').optional(),
  instructor_id: Joi.number().integer().optional().messages({
    'number.base': 'Instructor ID must be an integer.'
  })
});

const courseContentCreateSchema = Joi.object({
  course_id: Joi.number().integer().required().messages({
    'any.required': 'Course ID is required.',
    'number.base': 'Course ID must be an integer.'
  }),
  type: Joi.string().required().max(50).messages({
    'any.required': 'Type is required.',
    'string.empty': 'Type cannot be empty.',
    'string.max': 'Type cannot exceed 50 characters.'
  }),
  content: Joi.object().required().messages({
    'any.required': 'Content is required.',
    'object.base': 'Content must be a JSON object.'
  }),
  order: Joi.number().integer().required().messages({
    'any.required': 'Order is required.',
    'number.base': 'Order must be an integer.'
  })
});

const courseContentUpdateSchema = Joi.object({
  course_id: Joi.number().integer().optional().messages({
    'number.base': 'Course ID must be an integer.'
  }),
  type: Joi.string().max(50).optional().messages({
    'string.max': 'Type cannot exceed 50 characters.'
  }),
  content: Joi.object().optional().messages({
    'object.base': 'Content must be a JSON object.'
  }),
  order: Joi.number().integer().optional().messages({
    'number.base': 'Order must be an integer.'
  })
});

const enrollmentCreateSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    'any.required': 'User ID is required.',
    'number.base': 'User ID must be an integer.'
  }),
  course_id: Joi.number().integer().required().messages({
    'any.required': 'Course ID is required.',
    'number.base': 'Course ID must be an integer.'
  })
});

const enrollmentUpdateSchema = Joi.object({
  user_id: Joi.number().integer().optional().messages({
    'number.base': 'User ID must be an integer.'
  }),
  course_id: Joi.number().integer().optional().messages({
    'number.base': 'Course ID must be an integer.'
  })
});


const notificationCreateSchema = Joi.object({
  user_id: Joi.number().integer().required().messages({
    'any.required': 'User ID is required.',
    'number.base': 'User ID must be an integer.'
  }),
  message: Joi.string().required().messages({
    'any.required': 'Message is required.',
    'string.empty': 'Message cannot be empty.'
  }),
  is_read: Joi.boolean().optional()
});

const notificationUpdateSchema = Joi.object({
  user_id: Joi.number().integer().optional().messages({
    'number.base': 'User ID must be an integer.'
  }),
  message: Joi.string().optional(),
  is_read: Joi.boolean().optional()
});

//The progress model is similar to notification model so I will reuse the schemas

const progressCreateSchema = Joi.object({
    user_id: Joi.number().integer().required().messages({
      'any.required': 'User ID is required.',
      'number.base': 'User ID must be an integer.'
    }),
    message: Joi.string().required().messages({
      'any.required': 'Message is required.',
      'string.empty': 'Message cannot be empty.'
    }),
    is_read: Joi.boolean().optional()
  });
  
  const progressUpdateSchema = Joi.object({
    user_id: Joi.number().integer().optional().messages({
      'number.base': 'User ID must be an integer.'
    }),
    message: Joi.string().optional(),
    is_read: Joi.boolean().optional()
  });

const userCreateSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'any.required': 'Name is required.',
    'string.empty': 'Name cannot be empty.',
    'string.max': 'Name cannot exceed 100 characters.'
  }),
  email: Joi.string().email().required().max(100).messages({
    'any.required': 'Email is required.',
    'string.empty': 'Email cannot be empty.',
    'string.email': 'Email must be a valid email address.',
    'string.max': 'Email cannot exceed 100 characters.'
  }),
  password: Joi.string().required().min(8).max(255).messages({
    'any.required': 'Password is required.',
    'string.empty': 'Password cannot be empty.',
    'string.min': 'Password must be at least 8 characters long.',
    'string.max': 'Password cannot exceed 255 characters.'
  }),
  role: Joi.string().required().max(50).messages({
    'any.required': 'Role is required.',
    'string.empty': 'Role cannot be empty.',
    'string.max': 'Role cannot exceed 50 characters.'
  })
});

const userUpdateSchema = Joi.object({
  name: Joi.string().max(100).optional().messages({
    'string.max': 'Name cannot exceed 100 characters.'
  }),
  email: Joi.string().email().max(100).optional().messages({
    'string.email': 'Email must be a valid email address.',
    'string.max': 'Email cannot exceed 100 characters.'
  }),
  password: Joi.string().min(8).max(255).optional().messages({
    'string.min': 'Password must be at least 8 characters long.',
    'string.max': 'Password cannot exceed 255 characters.'
  }),
  role: Joi.string().max(50).optional().messages({
    'string.max': 'Role cannot exceed 50 characters.'
  })
});

module.exports = {
  courseCreateSchema,
  courseUpdateSchema,
  courseContentCreateSchema,
  courseContentUpdateSchema,
  enrollmentCreateSchema,
  enrollmentUpdateSchema,
  notificationCreateSchema,
  notificationUpdateSchema,
  progressCreateSchema,
  progressUpdateSchema,
  userCreateSchema,
  userUpdateSchema
};