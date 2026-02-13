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

    if (username.length < 3) {
      return Response.json({ 
        success: false,
        error: 'Username must be at least 3 characters' 
      }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ 
        success: false,
        error: 'Password must be at least 6 characters' 
      }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    
    // Check if username exists
    const existing = await base44.asServiceRole.entities.VTMUser.filter({ username });
    
    if (existing.length > 0) {
      return Response.json({ 
        success: false,
        error: 'Username already taken' 
      }, { status: 400 });
    }

    // Hash password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Create user
    const user = await base44.asServiceRole.entities.VTMUser.create({
      username,
      password_hash: passwordHash,
      is_admin: false
    });

    // Create account
    await base44.asServiceRole.entities.UserAccount.create({
      cash_balance: 10000,
      initial_balance: 10000,
      free_stocks_available: 3,
      created_by: user.id
    });

    // Generate session token
    const token = crypto.randomUUID();
    
    return Response.json({ 
      success: true,
      user: {
        id: user.id,
        username: user.username,
        is_admin: false
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