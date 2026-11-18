import { betterAuth } from "better-auth"
import { MongoClient } from "mongodb"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

// ভ্যালু না থাকলে ভুল জায়গায় কনফিগ স্পষ্ট করে বোঝানো যায়
const dbUri = process.env.DB_URI
if (!dbUri) {
    throw new Error(
        "Missing DB_URI environment variable. Add it to mentor-client/.env (see AGENTS.md)."
    )
}

const client = new MongoClient(dbUri)
const db = client.db("MentorLagbeDb")

// বুটস্ট্র্যাপেই কানেকশন যাচাই — অসুবিধা হলে লগে স্পষ্ট করে জানাবে (non-blocking)
client.connect().then(
    () => console.log("[auth] MongoDB connected"),
    (error) => console.error("[auth] MongoDB connection failed:", error)
)

export const auth = betterAuth({
    emailAndPassword: {
        enabled: true,
    },
    // cross-origin (localhost:5173 বা প্রোডাকশন ডোমেইন) থেকে আসা রিকোয়েস্ট
    trustedOrigins: [
        process.env.BETTER_AUTH_URL || "http://localhost:3000",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "http://localhost:5173",
    ],
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
