const router = require("express").Router();
const multer = require('multer');

const upload = multer({ dest: './src/source/avatar' })
const authController = require('../controllers/authController');

router.post('/signup', upload.single("avatar"), (req, res) => {
    authController.signUp(req, res)
    // console.log(req.file, req.body)
});
router.post('/login', authController.signIn);
router.post('/', authController.checkAuth);

module.exports = router;