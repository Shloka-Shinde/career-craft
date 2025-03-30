// 1. Import required modules
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

// 2. Load environment variables
dotenv.config();

// 3. Initialize Express app
const app = express();
const PORT = process.env.PORT || 5003;

// 4. Initialize Supabase admin client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

// 5. Configure middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// 6. Authentication middleware
const authenticateJWT = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  try {
    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// 7. Auth webhook handler
app.post('/auth-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['supabase-signature'];
  const rawBody = req.body.toString('utf8');

  try {
    // Verify webhook signature (optional but recommended)
    const isValid = supabaseAdmin.auth.verifyWebhook(rawBody, sig);
    if (!isValid) return res.status(401).send('Invalid signature');

    const event = JSON.parse(rawBody);
    
    // Handle new user creation
    if (event.type === 'user.created') {
      await supabaseAdmin
        .from('profiles')
        .insert({
          id: event.user.id,
          email: event.user.email,
          created_at: new Date()
        });
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook processing failed');
  }
});

// 8. Protected user profile endpoint
app.get('/api/profile', authenticateJWT, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// 9. Public health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// 10. Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 11. Start server
const startServer = async () => {
  try {
    // Test Supabase connection
    const { data: testData } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1);
    
    console.log('✅ Supabase connected successfully');
    console.log('🔐 Test query result:', testData?.length ? 'Data found' : 'No data');
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize server:', err);
    process.exit(1);
  }
};

// 12. Start the application
startServer();