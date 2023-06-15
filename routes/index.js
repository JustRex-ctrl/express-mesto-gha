const router = require('express').Router();
const userRoutes = require('./users');
const cardRoutes = require('./cards');
const { errNotFound } = require('../utils/constants');

router.use('/users', userRoutes);
router.use('/cards', cardRoutes);
router.use('*', (req, res) => res.status(errNotFound).send({ message: 'Page not found' }));

module.exports = router;
