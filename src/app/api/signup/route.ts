// Local stand-in for the source's /api/signup. Validates and acknowledges; wire it to a real
// mailing-list provider before deploying.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown } | null;
  if (!body || typeof body.email !== "string" || !EMAIL_RE.test(body.email)) {
    return Response.json({ ok: false }, { status: 400 });
  }
  // Honeypot submissions also get ok so bots don't retry; nothing is stored either way.
  return Response.json({ ok: true });
}
