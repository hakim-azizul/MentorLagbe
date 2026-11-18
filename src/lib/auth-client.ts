import { inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
// শুধু টাইপ ইমপোর্ট — সার্ভার কনফিগ (MongoClient সহ) কখনো ক্লায়েন্ট বান্ডলে যাবে না
import type { auth } from "./auth"

export const authClient = createAuthClient({
    // ক্লায়েন্টে শুধু NEXT_PUBLIC_* ভ্যালু থাকে; না থাকলে same-origin fallback
    baseURL: process.env.NEXT_PUBLIC_APP_URL || undefined,
    plugins: [inferAdditionalFields<typeof auth>()],
})

export const { signIn, signUp, useSession } = authClient
