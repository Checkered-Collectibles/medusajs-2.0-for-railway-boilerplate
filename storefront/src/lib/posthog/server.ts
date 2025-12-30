import 'server-only'

import { PostHog } from 'posthog-node'
import { cookies } from 'next/headers';

const posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY || "", {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0
})

export async function getServerSidePostHogDistinctId() {
    const cookieStore = await cookies();

    // Find PH cookie
    const phCookie = cookieStore
        .getAll()
        .find(c => c.name.startsWith("ph_") && c.name.endsWith("_posthog"));

    if (!phCookie) return null;

    try {
        const parsed = JSON.parse(decodeURIComponent(phCookie.value));
        return parsed.distinct_id || null;
    } catch (e) {
        return null;
    }
}

export default posthogClient