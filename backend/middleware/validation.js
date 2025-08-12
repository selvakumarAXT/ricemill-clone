const { body, validationResult } = require('express-validator');

// Validation rules for user registration
exports.validateRegister = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['employee', 'manager', 'admin'])
    .withMessage('Role must be employee, manager, or admin')
];

// Validation rules for user login
exports.validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation rules for forgot password
exports.validateForgotPassword = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail()
];

// Validation rules for reset password
exports.validateResetPassword = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Validation rules for change password
exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
];

// Middleware to handle validation errors
exports.handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

// Validation rules for paddy data
exports.validatePaddyData = [
  body('issueDate')
    .notEmpty()
    .withMessage('Issue date is required')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('issueMemo')
    .notEmpty()
    .withMessage('Issue memo is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Issue memo must be between 1 and 200 characters'),
  body('lorryNumber')
    .notEmpty()
    .withMessage('Lorry number is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Lorry number must be between 1 and 50 characters'),
  body('paddyFrom')
    .notEmpty()
    .withMessage('Paddy source is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Paddy source must be between 1 and 100 characters'),
  body('paddyVariety')
    .notEmpty()
    .withMessage('Paddy variety is required')
    .isIn(['A', 'C'])
    .withMessage('Paddy variety must be A or C'),
  body('gunny.nb')
    .optional()
    .isInt({ min: 0 })
    .withMessage('NB gunny count must be a non-negative integer'),
  body('gunny.onb')
    .optional()
    .isInt({ min: 0 })
    .withMessage('ONB gunny count must be a non-negative integer'),
  body('gunny.ss')
    .optional()
    .isInt({ min: 0 })
    .withMessage('SS gunny count must be a non-negative integer'),
  body('gunny.swp')
    .optional()
    .isInt({ min: 0 })
    .withMessage('SWP gunny count must be a non-negative integer'),
  body('paddy.bags')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Bags count must be a non-negative integer'),
  body('paddy.weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a non-negative number'),
  exports.handleValidationErrors
]; 