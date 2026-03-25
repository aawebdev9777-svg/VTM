import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.email !== 'aa.web.dev9777@gmail.com') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { targetEmail } = await req.json();

    if (!targetEmail) {
      return Response.json({ error: 'Target email required' }, { status: 400 });
    }

    // Create an impersonation token that redirects to home
    const token = await base44.asServiceRole.auth.createImpersonationToken(targetEmail);

    return Response.json({ token });
  } catch (error) {
    console.error('Impersonation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});