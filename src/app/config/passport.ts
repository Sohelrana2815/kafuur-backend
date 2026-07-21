import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env.js";
import prisma from "../lib/prisma.js";
import { Role } from "@prisma/client";

passport.use(new GoogleStrategy({
    clientID: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
    callbackURL: envVars.GOOGLE_CALLBACK_URL,
}, async(accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        const userEmail = profile.emails?.[0].value;
        if(!userEmail){
            return done(null,false,{message:"User does not exist!"})
        }
        let user = await prisma.user.findUnique({where:{
            email:userEmail
        }})
        if(!user){
         user = await prisma.user.create({
            data: {
                name:profile.displayName,
                email: userEmail,
                picture: profile.photos?.[0].value,
                role:Role.CUSTOMER,
                isVerified:true,
                auths: {
                   create: {
                    provider: "google",
                    providerId:profile.id
                   }
                }

            }
         })
        }
        return done(null,user)
      } catch (error) {
         console.log("Google Strategy Error", error);
         return done(error)
      }
}))

// frontend localhost:5173/login?redirect=/booking -> localhost:5000/api/v1/auth/google?redirect=/booking -> passport -> Google OAuth Consent -> gmail login -> successful -> callback url localhost:5000/api/v1/auth/google/callback -> db store -> token

// Bridge == Google -> user db store -> token
//Custom -> email , password, role : USER, name... -> registration -> DB -> 1 User create
//Google -> req -> google -> successful : Jwt Token : Role , email -> DB - Store -> token - api access





