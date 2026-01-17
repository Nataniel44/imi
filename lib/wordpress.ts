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
    const url = `${WP_API_URL}/wp-json/wp/v2/cursos?slug=${slug}&_embed&acf_format=standard`;
    console.log(`[DEBUG] Fetching course by slug: ${url}`);
    const res = await fetch(url);
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

export async function getLessonsByCourseId(courseId: number) {
    // Nota: Por defecto traemos 100 para asegurar que entren todas las de un curso
    const url = `${WP_API_URL}/wp-json/wp/v2/lecciones?_embed&acf_format=standard&per_page=100`;
    console.log(`[DEBUG] Fetching lessons: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Failed to fetch lessons');
    }
    const allLessons = await res.json();

    // Filtrado por curso_relacionado
    return allLessons.filter((lesson: any) => {
        const rel = lesson.acf?.curso_relacionado;
        const relId = (typeof rel === 'object' && rel !== null) ? (rel.ID || rel.id) : rel;
        return Number(relId) === Number(courseId);
    }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function getComments(postId: number) {
    const url = `${WP_API_URL}/wp-json/wp/v2/comments?post=${postId}&_embed&order=asc&per_page=100`;
    console.log(`[DEBUG] Fetching comments for post ${postId}: ${url}`);
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch comments');
        return res.json();
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}

export async function createComment(postId: number, content: string, token?: string, parentId?: number) {
    const url = `${WP_API_URL}/wp-json/wp/v2/comments`;
    const headers: any = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            post: postId,
            content: content,
            parent: parentId || 0,
        }),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to post comment');
    }

    return res.json();
}

export async function getCommunityPosts() {
    const url = `${WP_API_URL}/wp-json/wp/v2/comunidad?_embed&acf_format=standard`;
    console.log(`[DEBUG] Fetching community posts from: "${url}"`);

    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`Failed to fetch community posts. Status: ${res.status} ${res.statusText}`);
            return [];
        }
        return res.json();
    } catch (error) {
        console.error("Fetch error details:", error);
        return [];
    }
}

export function fixWordPressUrls(html: string) {
    if (!html || typeof html !== 'string') return html;

    let fixedHtml = html;

    // 1. Replace localhost:8000 with the actual WP_API_URL
    if (WP_API_URL) {
        fixedHtml = fixedHtml.replace(/http:\/\/localhost:8000/g, WP_API_URL);
    }

    // 2. Force HTTPS for the WordPress domain if the API URL is HTTPS
    if (WP_API_URL && WP_API_URL.startsWith('https')) {
        const urlObj = new URL(WP_API_URL);
        const hostname = urlObj.hostname;
        const regex = new RegExp(`http://${hostname.replace(/\./g, '\\.')}`, 'g');
        fixedHtml = fixedHtml.replace(regex, `https://${hostname}`);
    }

    // 3. Proxy images to bypass SSL issues in the browser
    // We only proxy images that belong to our WordPress instance
    if (WP_API_URL) {
        try {
            const urlObj = new URL(WP_API_URL);
            const hostname = urlObj.hostname;

            // Regex to find src attributes pointing to our WordPress instance
            // It avoids already proxied URLs
            const imgRegex = new RegExp(`src=["']((?:https?:)?//${hostname.replace(/\./g, '\\.')}[^"']+)["']`, 'g');

            fixedHtml = fixedHtml.replace(imgRegex, (match, url) => {
                if (url.includes('/api/proxy-image')) return match;
                return `src="/api/proxy-image?url=${encodeURIComponent(url)}"`;
            });
        } catch (e) {
            // If WP_API_URL is not a valid URL, skip proxying
        }
    }

    return fixedHtml;
}
