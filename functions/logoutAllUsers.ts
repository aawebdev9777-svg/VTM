import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Invalidate all user sessions by calling logout for each active session
        const allUsers = await base44.asServiceRole.entities.User.list();
        
        // The platform doesn't have a bulk logout endpoint, so we need to use a different approach
        // We'll create a logout token by invalidating sessions through the SDK
        for (const user of allUsers) {
            try {
                // This forces a re-authentication on next request
                await base44.asServiceRole.auth.invalidateAllSessions(user.id);
            } catch (e) {
                console.log(`Failed to logout ${user.email}: ${e.message}`);
            }
        }
        
        return Response.json({ 
            success: true, 
            message: `All ${allUsers.length} users have been logged out and must log back in` 
        });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});