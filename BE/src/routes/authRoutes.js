import express from 'express';
import { register, login, getProfile, updateProfile, googleCallback, forgotPassword, verifyOtp, resetPassword } from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/auth.js';
import passport from 'passport';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);

router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    (req, res, next) => {
        passport.authenticate('google', { session: false }, (err, user, info) => {
            // Determine client URL based on environment or referrer
            // Prioritize CLIENT_URL env, then fallback to localhost:3000
            const clientUrl = (process.env.CLIENT_URL || 'http://localhost:3000').replace(/\/$/, '');

            if (err) {
                return res.redirect(`${clientUrl}/dang-nhap?error=${encodeURIComponent(err.message)}`);
            }
            if (!user) {
                return res.redirect(`${clientUrl}/dang-nhap?error=Authentication failed`);
            }
            req.user = user;
            next();
        })(req, res, next);
    },
    googleCallback
);

export default router;


