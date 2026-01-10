// Bypass SSL check for self-signed certificates if configured in environment
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const WP_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'http://localhost:8000';

export async function getCourses() {
    const url = `${WP_API_URL}/wp-json/wp/v2/cursos?_embed&acf_format=standard`;
    console.log(`Fetching courses from: ${url}`);

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
