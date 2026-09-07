import { registerUser,loginUser,logoutUser,currentUser,googleCallback,githubCallback } from "../controllers/auth.controller";
import { registerSchema,loginSchema } from "../utils/validation";
import { Router } from "express";
import { validateSchema } from "../utils/validation";
import { verifyToken } from "../middleware/auth.middleware";
import passport from "passport";


const router = Router()

const oauthFailureRedirect = `${process.env.CLIENT_URL}/login?error=oauth_failed`

router.route('/register').post(validateSchema(registerSchema), registerUser)
router.route('/login').post(validateSchema(loginSchema), loginUser)
router.route('/logout').post(logoutUser)
router.route('/me').get(verifyToken,currentUser)

router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);
router.get(
    '/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: oauthFailureRedirect }),
    googleCallback
);

router.get(
    '/github',
    passport.authenticate('github', { scope: ['user:email'], session: false })
);
router.get(
    '/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: oauthFailureRedirect }),
    githubCallback
);

export default router