export async function onRequestGet(ctx) {
    const path = new URL(ctx.request.url).pathname.replace("/media/", "");
    const file = await ctx.env.MEDIA.get(path);
    if (!file) return new Response(null, { status: 404 });

    var response = new Response(file.body, {
        headers: { "Content-Type": file.httpMetadata.contentType },
    });

    if (path.endsWith(".wasm") || path.endsWith(".wsam.gz") || path.endsWith(".wasm.br")) {
        response.headers.set("Content-Type", "application/wasm");
    }
    if (path.endsWith(".js") || path.endsWith(".js.gz") || path.endsWith(".js.br")) {
        response.headers.set("Content-Type", "application/javascript");
    }

    if (path.endsWith(".br")) {
        response.headers.set("Content-Encoding", "br");
    }
    if (path.endsWith(".gz")) {
        response.headers.set("Content-Encoding", "gzip");
    }

    return response;
}