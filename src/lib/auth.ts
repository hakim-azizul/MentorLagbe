import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

const client = new MongoClient(process.env.DB_URI as string)
const db = client.db("MentorLagbeDb")

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            role: {
                type: ["student", "tutor", "admin"],
                input: true,
                defaultValue: "student",
            },
            phone: {
                type: "string",
                input: true,
                defaultValue: "",
            },
            bio: {
                type: "string",
                input: true,
                defaultValue: "",
            },
            plan: {
                type: ["free", "pro"],
                input: true,
                defaultValue: "free",
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    database: mongodbAdapter(db, {
        client,
    }),
})