import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

// 1. WebMCP Official Protocol Icon
export function WebMCPIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
      <path d="M12 3v6" />
      <path d="M12 15v6" />
      <path d="M3 12h6" />
      <path d="M15 12h6" />
      <circle cx="12" cy="3" r="2" />
      <circle cx="12" cy="21" r="2" />
      <circle cx="3" cy="12" r="2" />
      <circle cx="21" cy="12" r="2" />
    </svg>
  );
}

// 2. OpenAI / GPT Icon
export function OpenAIIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
      <path d="m9 8 6 4-6 4V8z" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

// 3. Google Gemini Icon
export function GeminiIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z" />
    </svg>
  );
}

// 4. Anthropic Claude Icon
export function AnthropicIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M7 21h10" />
      <path d="M9 21v-4a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v4" />
      <circle cx="12" cy="7" r="4" fill="currentColor" fillOpacity="0.2" />
    </svg>
  );
}

// 5. Google Chrome Icon
export function ChromeIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" fill="currentColor" fillOpacity="0.15" />
      <line x1="21.17" y1="8" x2="12" y2="8" />
      <line x1="3.95" y1="6.06" x2="8.54" y2="14" />
      <line x1="10.88" y1="21.94" x2="15.46" y2="14" />
    </svg>
  );
}

// 6. Firebase Realtime DB Icon
export function FirebaseIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...props}
    >
      <path d="M4.5 18.5 7.8 2.2a.5.5 0 0 1 .9-.2l3.4 6.4-7.6 10.1Z" fillOpacity="0.6" />
      <path d="M12.5 10.5 15 5.8a.5.5 0 0 1 .9 0l3.6 12.7-7-8Z" fillOpacity="0.8" />
      <path d="m3.6 18.9 7.8 4.4a1.3 1.3 0 0 0 1.2 0l7.8-4.4-7.9-15a.5.5 0 0 0-.9 0L3.6 18.9Z" />
    </svg>
  );
}

// 7. GitHub Icon
export function GitHubIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

// 8. Next.js Icon
export function NextjsIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M16 12 9 3v18l8-10h-6" />
    </svg>
  );
}

// 9. PostgreSQL Icon
export function PostgreSQLIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 2a9 9 0 0 0-9 9c0 4.1 2.8 7.6 6.6 8.6L9 22h6l-.6-2.4C18.2 18.6 21 15.1 21 11a9 9 0 0 0-9-9Z" />
      <path d="M9 10a3 3 0 0 1 6 0c0 2-3 4-3 4" />
      <circle cx="12" cy="17" r="1" />
    </svg>
  );
}

// 10. Redis Icon
export function RedisIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 2 2 7l10 5 10-5-10-5Z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}

// 11. Docker Icon
export function DockerIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4 14h16c.6 0 1-.4 1-1 0-4-3-7-7-7H8c-4 0-7 3-7 7 0 .6.4 1 1 1h2" />
      <path d="M6 10h2v4H6z" />
      <path d="M9 10h2v4H9z" />
      <path d="M12 10h2v4h-2z" />
      <path d="M9 7h2v3H9z" />
      <path d="M12 7h2v3h-2z" />
    </svg>
  );
}

// 12. Python Icon
export function PythonIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M11.9 2c-3.1 0-5 .7-5 2.8v2.1h5.1v.7H4.3c-2.3 0-4.3 1.4-4.3 4.3 0 2.8 1.9 4.3 4.3 4.3h1.4v-2c0-2.3 2-4.3 4.3-4.3h5V7.7c0-2.9-2.3-5.7-5.1-5.7zm-2.8 1.4a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" />
      <path d="M12.1 22c3.1 0 5-.7 5-2.8v-2.1H12v-.7h7.7c2.3 0 4.3-1.4 4.3-4.3 0-2.8-1.9-4.3-4.3-4.3h-1.4v2c0 2.3-2 4.3-4.3 4.3h-5v2.2c0 2.9 2.3 5.7 5.1 5.7zm2.8-1.4a.9.9 0 1 1 0-1.8.9.9 0 0 1 0 1.8z" />
    </svg>
  );
}

// 13. TypeScript Icon
export function TypeScriptIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="2" y="2" width="20" height="20" rx="3" />
      <path d="M7 8h6m-3 0v8" />
      <path d="M14 15c1 1 2 1 3 0s0-2-1-2-2-1-2-2 1-2 2-2 2 1 2 1" />
    </svg>
  );
}

// 14. Stripe Icon
export function StripeIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M13.9 8.2c0-1.1-.9-1.5-2.2-1.5-2 0-3.5.7-4.5 1.5l-.9-2.2C7.7 5 9.7 4.2 12.2 4.2c3.4 0 5.8 1.8 5.8 5.1 0 5-6.8 4.2-6.8 6.4 0 .9.8 1.4 2.1 1.4 1.7 0 3.7-.8 4.8-1.7l.9 2.2c-1.3 1-3.4 1.8-5.8 1.8-3.6 0-6.1-1.8-6.1-5.1-.1-5.2 6.8-4.4 6.8-6.1z" />
    </svg>
  );
}

// 15. Slack Icon
export function SlackIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M6 15a2 2 0 1 1-2-2h2v2zm1 0a2 2 0 1 1 4 0v5a2 2 0 1 1-4 0v-5zm2-8a2 2 0 1 1 2-2v2H9zm0 1a2 2 0 1 1 0 4H4a2 2 0 1 1 0-4h5zm8 2a2 2 0 1 1 2 2h-2v-2zm-1 0a2 2 0 1 1-4 0V5a2 2 0 1 1 4 0v5zm-2 8a2 2 0 1 1-2 2v-2h2zm0-1a2 2 0 1 1 0-4h5a2 2 0 1 1 0 4h-5z" />
    </svg>
  );
}

// 16. Discord Icon
export function DiscordIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M20.3 4.4A19.6 19.6 0 0 0 15.5 3c-.2.4-.4.9-.6 1.4a18.2 18.2 0 0 0-5.8 0c-.2-.5-.4-1-.6-1.4a19.5 19.5 0 0 0-4.8 1.4C1 9.9.2 15.2.6 20.4a19.7 19.7 0 0 0 6 3c.5-.7.9-1.4 1.3-2.1-2.1-.8-2.6-2-2.6-2 .2.1.4.3.5.4 3.9 2.4 8.7 2.4 12.6 0 .2-.1.4-.3.6-.4 0 0-.5 1.2-2.6 2 .4.7.8 1.4 1.3 2.1a19.7 19.7 0 0 0 6-3c.5-6.1-.9-11.3-3.4-16zM8.5 16.5c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3zm7 0c-1.1 0-2-1-2-2.3s.9-2.3 2-2.3 2 1 2 2.3-.9 2.3-2 2.3z" />
    </svg>
  );
}

// 17. Figma Icon
export function FigmaIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M8 2a4 4 0 0 0 0 8h4V2H8zm8 4a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 10a4 4 0 1 0 4 4v-4H8zm8 4a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM8 18a4 4 0 0 0 4 4v-4H8z" />
    </svg>
  );
}

// 18. Linear Icon
export function LinearIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m5 19 14-14" />
      <path d="M19 12a7 7 0 0 1-7 7" />
    </svg>
  );
}

// 19. Vercel Icon
export function VercelIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="m12 2 10 18H2L12 2z" />
    </svg>
  );
}

// 20. Supabase Icon
export function SupabaseIcon({ size = 16, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M13.8 2.3c-.6-.7-1.8-.3-1.8.7v8.5H3.5c-.9 0-1.4 1.1-.8 1.7l8.5 10.5c.6.7 1.8.3 1.8-.7v-8.5h8.5c.9 0 1.4-1.1.8-1.7L13.8 2.3z" />
    </svg>
  );
}

// Category badges (Vivid-style duotone vector badges)
export function DatabaseBadgeIcon({ size = 14, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

export function ApiBadgeIcon({ size = 14, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" strokeWidth="3" />
      <line x1="6" y1="18" x2="6.01" y2="18" strokeWidth="3" />
    </svg>
  );
}

export function AgentBadgeIcon({ size = 14, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="3" />
      <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="3" />
    </svg>
  );
}

export function ToolBadgeIcon({ size = 14, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function AuthBadgeIcon({ size = 14, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function TriggerBadgeIcon({ size = 14, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  );
}

export function UIBadgeIcon({ size = 14, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}
