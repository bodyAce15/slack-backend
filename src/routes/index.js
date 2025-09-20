const authRouter = require('./auth');
const userRouter = require('./user');
const fileRouter = require('./file')

module.exports = (app) => {
    app.use('/auth', authRouter);
    app.use('/user', userRouter);
    app.use('/file', fileRouter);
}