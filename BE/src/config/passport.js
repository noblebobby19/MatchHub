import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: `${process.env.BACKEND_URL?.replace(/\/$/, '')}/api/auth/google/callback`,
            scope: ['profile', 'email'],
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists
                let user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // If user exists but no googleId (registered with email/password), update it
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                    return done(null, user);
                }

                // Create new user if not exists
                user = await User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: Math.random().toString(36).slice(-8), // Random password for google auth users
                    role: 'user', // Default role
                    googleId: profile.id,
                    image: profile.photos[0]?.value
                });

                done(null, user);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

export default passport;
