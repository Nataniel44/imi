import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get('url');
    if (!url) return new NextResponse('Missing url', { status: 400 });

    try {
        // Fetch the image from the remote server
        // NODE_TLS_REJECT_UNAUTHORIZED=0 in the environment will allow self-signed certs
        const res = await fetch(url);

        if (!res.ok) {
            return new NextResponse(`Failed to fetch image: ${res.status}`, { status: res.status });
        }

        const blob = await res.blob();
        const contentType = res.headers.get('Content-Type') || 'image/jpeg';

        return new NextResponse(blob, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('Proxy image error:', error);
        return new NextResponse('Error fetching image', { status: 500 });
    }
}
