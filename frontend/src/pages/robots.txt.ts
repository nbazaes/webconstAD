import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  const noindex = import.meta.env.PUBLIC_NOINDEX === 'true';

  if (noindex) {
    return new Response('User-agent: *\nDisallow: /\n', {
      headers: { 'Content-Type': 'text/plain' },
    });
  }

  return new Response('User-agent: *\nDisallow:\n', {
    headers: { 'Content-Type': 'text/plain' },
  });
};
