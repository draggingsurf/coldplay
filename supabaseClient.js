// Simplified Supabase Client for Coldplay Canoodlers Game
// ======================================================

// Basic logging configuration
const LOG_CONFIG = {
  enabled: true,
  prefix: '[SUPABASE]'
};

// Simple logging function
function log(level, message, data = null) {
  if (!LOG_CONFIG.enabled) return;
  
  const logMessage = `${LOG_CONFIG.prefix} [${level.toUpperCase()}] ${message}`;
  
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
}

// Simple connection state
const connectionState = {
  status: 'initializing',
  lastConnected: null,
  lastError: null
};

// Supabase configuration
const supabaseUrl = 'https://hyprwxypazqoduoxpcqx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5cHJ3eHlwYXpxb2R1b3hwY3F4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxMTA0NDEsImV4cCI6MjA2ODY4NjQ0MX0.N4sCKTddBKdtsgIHe9hTPfa61CmhAd6D9G4A1GFf_YI';

log('info', 'Initializing simplified Supabase client');

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  const error = new Error('Missing Supabase environment variables');
  log('error', 'Configuration validation failed');
  throw error;
}

log('info', 'Configuration validation passed');

// Check if Supabase library is available
let supabase;

if (typeof window === 'undefined') {
  const error = new Error('Window object not available - running in non-browser environment');
  log('error', 'Environment check failed');
  throw error;
}

if (!window.supabase) {
  const error = new Error('Supabase library not loaded. Make sure to include the CDN script.');
  log('error', 'Supabase library not found');
  throw error;
}

log('info', 'Supabase library detected, creating client instance');

// Create Supabase client
try {
  connectionState.status = 'connecting';
  log('info', 'Creating Supabase client connection');
  
  supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'implicit'
    },
    global: {
      headers: {
        'X-Client-Info': 'coldplay-canoodlers-game'
      }
    }
  });

  connectionState.status = 'connected';
  connectionState.lastConnected = new Date();
  
  log('info', 'Supabase client created successfully');

} catch (error) {
  connectionState.status = 'error';
  connectionState.lastError = error;
  log('error', 'Failed to create Supabase client', error.message);
  throw error;
}

// Simple authentication state monitoring
supabase.auth.onAuthStateChange((event, session) => {
  log('info', `Authentication state changed: ${event}`, {
    sessionExists: !!session,
    userId: session?.user?.id
  });
});

// Export connection state for external monitoring
const getConnectionState = () => ({ ...connectionState });

// Simple cleanup function
const cleanup = () => {
  log('info', 'Cleaning up Supabase client resources');
};

// Log successful initialization
log('info', 'Simplified Supabase client initialized successfully', {
  status: connectionState.status
});

export {
  supabase,
  getConnectionState,
  cleanup,
  log as supabaseLog
};
