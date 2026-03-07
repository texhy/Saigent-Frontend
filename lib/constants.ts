export const BRAND = {
  name: 'sAIgent',
  tagline: 'AI-Powered Social Messaging',
};

export const COLORS = {
  // Modern, minimal palette
  primary: '#0F172A',      // Slate 900
  secondary: '#64748B',    // Slate 500
  accent: '#3B82F6',       // Blue 500
  success: '#10B981',      // Emerald 500
  warning: '#F59E0B',      // Amber 500
  error: '#EF4444',        // Red 500
  background: '#FAFAFA',   // Neutral 50
  card: '#FFFFFF',
  border: '#E2E8F0',       // Slate 200
};

export const CHANNELS = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: 'Instagram',
    color: '#E4405F',
    description: 'Connect your Instagram Business account to receive and respond to DMs automatically.',
  },
  messenger: {
    id: 'messenger',
    name: 'Messenger',
    icon: 'MessageCircle',
    color: '#0084FF',
    description: 'Connect your Facebook Page to manage Messenger conversations with AI assistance.',
  },
} as const;

export const POLLING_INTERVAL = 5000; // 5 seconds for message polling

export const FILE_UPLOAD = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['.pdf', '.docx', '.txt', '.doc', '.md', '.csv'],
  allowedMimeTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/msword',
    'text/markdown',
    'text/csv',
  ],
};

export const ROUTES = {
  home: '/',
  channels: '/channels',
  register: '/register',
  login: '/login',
  knowledge: '/setup/knowledge',
  dashboard: '/dashboard',
} as const;

