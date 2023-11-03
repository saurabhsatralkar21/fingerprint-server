const express = require('express');
const router = express.Router()
const cors = require("cors")
const {Home, generateQRImage, setMFAForUser} = require('../controllers/authController')
const {loginUser} = require('../controllers/loginController')
const {registerUser} = require('../controllers/registrationController')
const {verifyJWT} = require('../middleware/verifyJWT')
const {getProfile} = require('../controllers/getProfileController')
const {handleRefreshToken} = require('../controllers/refreshTokenController')
const {Logout} = require('../controllers/logoutController')


// Middleware
router.use(
    cors({
        credentials: true,
        origin: '*'
    })
)

router.get('/', Home)
router.post('/register', registerUser)
router.post('/login', loginUser)

// router.use()

router.get('/refresh', handleRefreshToken)
router.get('/dashboard', verifyJWT)
router.get('/profile', getProfile)
router.delete('/logout', Logout)

router.post('/qrImage', generateQRImage)
router.post('/setMFA', setMFAForUser)

module.exports = router