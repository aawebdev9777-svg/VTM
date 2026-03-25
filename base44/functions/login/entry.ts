import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const { username, password } = await req.json();
    
    if (!username || !password) {
      return Response.json({ 
        success: false,
        error: 'Username and password required' 
      }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    
    // Find user
    const users = await base44.asServiceRole.entities.VTMUser.filter({ username });
    
    if (users.length === 0) {
      return Response.json({ 
        success: false,
        error: 'Invalid username or password' 
      }, { status: 401 });
    }

    const user = users[0];
    
    // Simple password check (in production, use proper hashing)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (hashHex !== user.password_hash) {
      return Response.json({ 
        success: false,
        error: 'Invalid username or password' 
      }, { status: 401 });
    }

    // Generate session token
    const token = crypto.randomUUID();
    
    return Response.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        is_admin: user.is_admin || false
      },
      token
    });
  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});