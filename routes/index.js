const router = require('express').Router();
const userRoutes = require('./users');
const cardRoutes = require('./cards');
const { celebrate } = require('celebrate');
const auth = require('../middlewares/auth');
const { userValidSchema, loginSchema } = require('../middlewares/joi-schemas')
const { login, createUser } = require('../controllers/users')
const NotFoundError = require('../errors/NotFoundError')

router.post('/signup', celebrate({ body: userValidSchema }), createUser);
router.post('/signin', celebrate({ body: loginSchema }), login);
router.use(auth);
router.use('/users', userRoutes);
router.use('/cards', cardRoutes);
router.use('*', (req, res, next) => next(new NotFoundError('Page not found')));

module.exports = router;
