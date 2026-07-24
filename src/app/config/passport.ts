import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env.js";
import prisma from "../lib/prisma.js";
import { Role } from "@prisma/client";

passport.use(new GoogleStrategy({
  clientID: envVars.GOOGLE_CLIENT_ID,
  clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  callbackURL: envVars.GOOGLE_CALLBACK_URL,
}, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
  try {
    const userEmail = profile.emails?.[0]?.value;
    if (!userEmail) {
      return done(null, false, { message: "User does not exist!" })
    }
    // 1. Check if this Google account is already linked to a user

    const existingAuth = await prisma.authProvider.findFirst({
      where: {
        provider: "google",
        providerId: profile.id,
      },
      include: {
        user: true,
      },
    });

    if (existingAuth) {
      return done(null, existingAuth.user);
    }

    // 2. Check if a user already registered with this email address
    let user = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (user) {
      // Link this Google login to their existing account
      await prisma.authProvider.create({
        data: {
          provider: "google",
          providerId: profile.id,
          userId: user.id,
        },
      });
    } else {
      // 3. Create a brand-new user account
      user = await prisma.user.create({
        data: {
          name: profile.displayName,
          email: userEmail,
          picture: profile.photos?.[0]?.value,
          role: Role.CUSTOMER,
          isVerified: true,
          auths: {
            create: {
              provider: "google",
              providerId: profile.id,
            },
          },
        },
      });
    }
    return done(null, user)
  } catch (error) {
    console.error("Google authentication failed:", error);
    return done(error as Error);
  }
}))

// frontend localhost:5173/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google OAuth Consent -> gmail login -> successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token

// Bridge == Google -> user db store -> token
//Custom -> email , password, role : USER, name... -> registration -> DB -> 1 User create
//Google -> req -> google -> successful : Jwt Token : Role , email -> DB - Store -> token - api access
 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});



passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    done(null, user);
  } catch (error) {
    console.error("Failed to load user session:", error);
    done(error);
  }
});