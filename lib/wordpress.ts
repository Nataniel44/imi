// Bypass SSL check for self-signed certificates if configured in environment
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const rawUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
const WP_API_URL = (rawUrl && rawUrl.trim() !== "") ? rawUrl : 'http://localhost:8000';

if (!WP_API_URL || !WP_API_URL.startsWith('http')) {
    console.error(`ERROR: Invalid NEXT_PUBLIC_WORDPRESS_URL: "${WP_API_URL}". It must be an absolute URL starting with http or https.`);
}

export async function getCourses() {
    const url = `${WP_API_URL}/wp-json/wp/v2/cursos?_embed&acf_format=standard`;
    console.log(`[DEBUG] Fetching courses from: "${url}"`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed to fetch courses. Status: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.error(`Response body: ${text}`);
            throw new Error(`Failed to fetch courses: ${res.status} ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Fetch error details:", error);
        throw error;
    }
}

export async function getCourseBySlug(slug: string) {
    const res = await fetch(`${WP_API_URL}/wp-json/wp/v2/cursos?slug=${slug}&_embed&acf_format=standard`);
    if (!res.ok) {
        throw new Error('Failed to fetch course');
    }
    const courses = await res.json();
    return courses.length > 0 ? courses[0] : null;
}

export async function getCourseById(id: number) {
    const res = await fetch(`${WP_API_URL}/wp-json/wp/v2/cursos/${id}?_embed&acf_format=standard`);
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch course by ID');
    }
    return res.json();
}
