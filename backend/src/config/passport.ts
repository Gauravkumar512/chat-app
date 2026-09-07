import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/User";

type GitHubEmailRecord = {
    email: string;
    primary: boolean;
    verified: boolean;
};

async function getGitHubVerifiedPrimaryEmail(accessToken: string): Promise<string> {
    try {
        const response = await fetch("https://api.github.com/user/emails", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "echo-chat-api",
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch GitHub user emails");
        }

        const emailList: unknown = await response.json();
        if (!Array.isArray(emailList)) {
            throw new Error("Invalid GitHub email response");
        }

        const primaryVerified = (emailList as GitHubEmailRecord[]).find(
            (item) => item?.primary === true && item?.verified === true && typeof item?.email === "string"
        );

        if (!primaryVerified?.email) {
            throw new Error("No verified primary email found");
        }

        return primaryVerified.email;
    } catch (error) {
        if (error instanceof Error && error.message === "No verified primary email found") {
            throw error;
        }
        throw new Error("Failed to resolve GitHub email");
    }
}

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
        },
        async (_accessToken, _refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0]?.value;
                const avatar = profile.photos?.[0]?.value;
                const googleId = profile.id;

                if (!email) {
                    return done(new Error("Google account has no email associated"));
                }

                const verifiedEmail: string = email;

                // Check if user already exists by googleId or email
                let user = await User.findOne({
                    $or: [{ googleId }, { email: verifiedEmail }],
                });

                if (user) {
                    if (!user.googleId) {
                        user.googleId = googleId;
                        if (!user.avatar && avatar) {
                            user.avatar = avatar;
                        }
                        await user.save({ validateBeforeSave: false });
                    }
                    return done(null, user);
                }

                const username = (verifiedEmail.split("@")[0] ?? verifiedEmail)
                    .toLowerCase()
                    .replace(/[^a-z0-9_-]/g, "");

                user = await User.create({
                    googleId,
                    email: verifiedEmail,
                    username,
                    ...(avatar ? { avatar } : {}),
                });

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
            callbackURL: process.env.GITHUB_CALLBACK_URL as string,
        },
        async (
            accessToken: string,
            _refreshToken: string,
            profile: any,
            done: (error: Error | null, user?: any) => void
        ) => {
            try {
                const email = await getGitHubVerifiedPrimaryEmail(accessToken);
                const avatar = profile.photos?.[0]?.value;
                const githubId = profile.id;

                // Check if user already exists by githubId or email
                let user = await User.findOne({
                    $or: [{ githubId }, { email }],
                });

                if (user) {
                    // User found by email but GitHub not yet linked - link it now
                    if (!user.githubId) {
                        user.githubId = githubId;
                        if (!user.avatar && avatar) {
                            user.avatar = avatar;
                        }
                        await user.save({ validateBeforeSave: false });
                    }
                    return done(null, user);
                }

                // No existing user - create a new one
                // Prefer GitHub username, fallback to email prefix
                const username = (profile.username || email.split("@")[0])
                    .toLowerCase()
                    .replace(/[^a-z0-9_-]/g, "");

                user = await User.create({
                    githubId,
                    email,
                    username,
                    ...(avatar ? { avatar } : {}),
                });

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

export default passport;
