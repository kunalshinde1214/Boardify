import React from 'react';
import * as DevIcons from 'developer-icons';
import { GILBARBARA_LOGOS, getGilbarbaraSvgUrl } from '@/lib/all-logos-catalog';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

export function DynamicGilbarbaraIcon({
  file,
  size = 24,
  className = '',
  style = {},
}: {
  file: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const url = getGilbarbaraSvgUrl(file);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      width={size}
      height={size}
      alt="Tech Logo"
      className={`object-contain select-none pointer-events-none ${className}`}
      style={{ width: `${size}px`, height: `${size}px`, ...style }}
      loading="lazy"
    />
  );
}

// 1. WebMCP Official Protocol Icon (Custom standard)
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

// Adapter wrapper for developer-icons (from https://github.com/xandemon/developer-icons)
function wrapDevIcon(Component: React.ComponentType<any>): React.ComponentType<IconProps> {
  return function DevIconWrapper({ size = 20, className = '', ...props }: IconProps) {
    const numSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 20;
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {Component ? <Component size={numSize} {...props} /> : null}
      </span>
    );
  };
}

// =========================================================================
// AWS ARCHITECTURE SUITE (AUTHENTIC SVG ICONS)
// =========================================================================

// AWS S3 (Simple Storage Service)
export function AWSS3Icon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#569A31" className={className} {...props}>
      <path d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM5 6h14v2H5V6zm14 12H5v-8h14v8z" />
      <circle cx="12" cy="14" r="2" fill="#FFFDF6" />
    </svg>
  );
}

// AWS Lambda (Serverless Compute)
export function AWSLambdaIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF9900" className={className} {...props}>
      <path d="M18.8 2H15l-4.5 12-2.3-6H5l3.8 10L4 22h3.8l4.5-12 2.3 6H19l-3.8-10L18.8 2z" />
    </svg>
  );
}

// AWS DynamoDB (NoSQL Database)
export function AWSDynamoDBIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#4053D6" className={className} {...props}>
      <ellipse cx="12" cy="5" rx="8" ry="3" fill="#4053D6" />
      <path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" stroke="#4053D6" strokeWidth="2" fill="none" />
      <path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" stroke="#4053D6" strokeWidth="2" fill="none" />
      <polygon points="12 8 9 13 12 13 11 17 15 12 12 12 12 8" fill="#FF9900" />
    </svg>
  );
}

// AWS RDS (Relational Database)
export function AWSRDSIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#3B48CC" className={className} {...props}>
      <circle cx="12" cy="12" r="10" fill="#3B48CC" />
      <ellipse cx="12" cy="8" rx="6" ry="2.5" fill="#FFFDF6" />
      <path d="M6 8v8c0 1.38 2.69 2.5 6 2.5s6-1.12 6-2.5V8" stroke="#FFFDF6" strokeWidth="2" fill="none" />
    </svg>
  );
}

// AWS CloudFront (Global CDN)
export function AWSCloudFrontIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#A166FF" className={className} {...props}>
      <circle cx="12" cy="12" r="9.5" stroke="#A166FF" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="4.5" fill="#A166FF" />
      <path d="M12 2.5v19M2.5 12h19" stroke="#A166FF" strokeWidth="2" />
    </svg>
  );
}

// AWS SQS (Simple Queue Service)
export function AWSSQSIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF4F8B" className={className} {...props}>
      <rect x="3" y="4" width="18" height="5" rx="1.5" />
      <rect x="3" y="11" width="18" height="5" rx="1.5" />
      <rect x="3" y="18" width="18" height="3" rx="1.5" />
    </svg>
  );
}

// AWS SNS (Simple Notification Service)
export function AWSSNSIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF4F8B" className={className} {...props}>
      <path d="M12 2a8 8 0 0 0-8 8v4l-2 3v1h20v-1l-2-3v-4a8 8 0 0 0-8-8z" />
      <path d="M10 20a2 2 0 0 0 4 0" stroke="#FFFDF6" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

// AWS ECS (Elastic Container Service)
export function AWSECSIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF9900" className={className} {...props}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="8" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
      <rect x="13" y="13" width="8" height="8" rx="2" />
    </svg>
  );
}

// AWS CloudWatch (Observability)
export function AWSCloudWatchIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#E7157B" className={className} {...props}>
      <circle cx="12" cy="12" r="9" stroke="#E7157B" strokeWidth="2.5" fill="none" />
      <path d="M12 7v5l3.5 3.5" stroke="#E7157B" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// AWS API Gateway
export function AWSAPIGatewayIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#E7157B" className={className} {...props}>
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" stroke="#E7157B" strokeWidth="2" fill="none" />
      <line x1="12" y1="2" x2="12" y2="22" stroke="#E7157B" strokeWidth="2" />
    </svg>
  );
}

// AWS IAM (Identity & Access Management)
export function AWSIAMIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#DD344C" className={className} {...props}>
      <path d="M12 2 3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z" />
      <circle cx="12" cy="10" r="2.5" fill="#FFFDF6" />
      <path d="M12 13.5c-2 0-4 1-4 2.5v1h8v-1c0-1.5-2-2.5-4-2.5z" fill="#FFFDF6" />
    </svg>
  );
}

// AWS Bedrock (Foundation Models)
export function AWSBedrockIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#232F3E" className={className} {...props}>
      <polygon points="12 2 2 9 6 22 18 22 22 9 12 2" fill="#232F3E" />
      <polygon points="12 6 6 11 8 18 16 18 18 11 12 6" fill="#FF9900" />
    </svg>
  );
}

// =========================================================================
// VECTOR DBS & AI TOOLS (AUTHENTIC SVG ICONS)
// =========================================================================

// ChromaDB
export function ChromaDBIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF5E00" className={className} {...props}>
      <circle cx="7" cy="8" r="4" fill="#FF5E00" />
      <circle cx="17" cy="8" r="4" fill="#00D26A" />
      <circle cx="12" cy="16" r="4" fill="#1877F2" />
    </svg>
  );
}

// Qdrant Vector Search
export function QdrantIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#DC2626" className={className} {...props}>
      <polygon points="12 2 22 8.5 22 17.5 12 22 2 17.5 2 8.5 12 2" stroke="#DC2626" strokeWidth="2.5" fill="none" />
      <circle cx="12" cy="12" r="3.5" fill="#DC2626" />
    </svg>
  );
}

// Ollama (Local AI Models)
export function OllamaIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#000000" className={className} {...props}>
      <circle cx="12" cy="10" r="7" stroke="#000000" strokeWidth="2.5" fill="none" />
      <circle cx="9.5" cy="9.5" r="1.5" fill="#000000" />
      <circle cx="14.5" cy="9.5" r="1.5" fill="#000000" />
      <ellipse cx="12" cy="12.5" rx="2" ry="1.2" fill="#000000" />
      <path d="M8 3l2 3M16 3l-2 3M8 17v4M16 17v4" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// Groq (LPU Inference Engine)
export function GroqIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#F55036" className={className} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#F55036" />
      <path d="M15 8h-4a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h4v-3h-4" stroke="#FFFDF6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// Mistral AI
export function MistralAIIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FA520F" className={className} {...props}>
      <rect x="3" y="3" width="3.5" height="3.5" fill="#FA520F" />
      <rect x="17.5" y="3" width="3.5" height="3.5" fill="#FA520F" />
      <rect x="3" y="8" width="8" height="3.5" fill="#FA520F" />
      <rect x="13" y="8" width="8" height="3.5" fill="#FA520F" />
      <rect x="3" y="13" width="18" height="3.5" fill="#FA520F" />
      <rect x="3" y="17.5" width="6" height="3.5" fill="#FA520F" />
      <rect x="15" y="17.5" width="6" height="3.5" fill="#FA520F" />
    </svg>
  );
}

// Perplexity AI
export function PerplexityIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#20B2AA" className={className} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="4" fill="#13343B" />
      <path d="M8 8l8 8M16 8l-8 8M12 4v16M4 12h16" stroke="#20B2AA" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// =========================================================================
// ICONS FROM GILBARBARA/LOGOS (https://github.com/gilbarbara/logos)
// =========================================================================

export function StripeIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M13.9 8.2c0-1.1-.9-1.5-2.2-1.5-2 0-3.5.7-4.5 1.5l-.9-2.2C7.7 5 9.7 4.2 12.2 4.2c3.4 0 5.8 1.8 5.8 5.1 0 5-6.8 4.2-6.8 6.4 0 .9.8 1.4 2.1 1.4 1.7 0 3.7-.8 4.8-1.7l.9 2.2c-1.3 1-3.4 1.8-5.8 1.8-3.6 0-6.1-1.8-6.1-5.1-.1-5.2 6.8-4.4 6.8-6.1z" />
    </svg>
  );
}

export function SentryIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M13.2 2.3a2.4 2.4 0 0 0-2.4 0L1.7 18.2a2.4 2.4 0 0 0 2.1 3.6h18.4a2.4 2.4 0 0 0 2.1-3.6L13.2 2.3zm-1.2 5.5c2.3 0 4.2 1.9 4.2 4.2 0 1.3-.6 2.4-1.5 3.2l2.3 2.3a7.3 7.3 0 0 0 2.4-5.5c0-4.1-3.3-7.4-7.4-7.4s-7.4 3.3-7.4 7.4c0 2.2 1 4.2 2.5 5.5l2.3-2.3a4.2 4.2 0 0 1-1.4-3.2c0-2.3 1.9-4.2 4.2-4.2z" />
    </svg>
  );
}

export function TwilioIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#F22F46" className={className} {...props}>
      <circle cx="12" cy="12" r="11" fill="#F22F46" />
      <circle cx="8" cy="8" r="2.2" fill="#FFFDF6" />
      <circle cx="16" cy="8" r="2.2" fill="#FFFDF6" />
      <circle cx="8" cy="16" r="2.2" fill="#FFFDF6" />
      <circle cx="16" cy="16" r="2.2" fill="#FFFDF6" />
    </svg>
  );
}

export function LinearIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m5 19 14-14" />
      <path d="M19 12a7 7 0 0 1-7 7" />
    </svg>
  );
}

export function PineconeIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#000000" className={className} {...props}>
      <path d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.3 6.8 3.8-3.4 1.9-6.8-3.8L12 4.3zM5.2 8.6l6 3.3v6.7l-6-3.3V8.6zm13.6 6.7-6 3.3v-6.7l6-3.3v6.7z" />
    </svg>
  );
}

export function WeaviateIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FA4646" className={className} {...props}>
      <path d="M2.5 7.5 7 21h3l3.5-9.5L17 21h3l4.5-13.5h-3.2L18.5 16 15 6.5h-3L8.5 16 5.7 7.5H2.5z" />
    </svg>
  );
}

export function LangChainIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1C3C3C" className={className} {...props}>
      <circle cx="9" cy="7" r="5" fill="#2ECC71" />
      <path d="M14 8h6a4 4 0 0 1 4 4v7a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-3" stroke="#1C3C3C" strokeWidth="2" fill="none" />
      <circle cx="9" cy="6" r="1.5" fill="#FFFDF6" />
      <path d="m11 8 3 3H8l3-3z" fill="#E67E22" />
    </svg>
  );
}

export function ZapierIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF4A00" className={className} {...props}>
      <path d="M10.8 1.5h2.4v8.4h8.4v2.4h-8.4v8.4h-2.4v-8.4H2.4v-2.4h8.4V1.5z" transform="rotate(45 12 12)" />
    </svg>
  );
}

export function AirtableIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#18BFFF" className={className} {...props}>
      <path d="m11.5 2.5-9.5 5 9.5 5 9.5-5-9.5-5z" fill="#FCB400" />
      <path d="M12.5 13.5v8l8.5-4.5v-8l-8.5 4.5z" fill="#18BFFF" />
      <path d="M10.5 13.5 2 17v-8l8.5 4.5z" fill="#ED3C40" />
    </svg>
  );
}

export function SegmentIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#52BD95" className={className} {...props}>
      <path d="M6 3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zm0 4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H6z" />
    </svg>
  );
}

export function MixpanelIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#7856FF" className={className} {...props}>
      <circle cx="5" cy="12" r="3" fill="#7856FF" />
      <circle cx="12" cy="8" r="3" fill="#7856FF" />
      <circle cx="19" cy="14" r="3" fill="#7856FF" />
    </svg>
  );
}

export function IntercomIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#1F8CEB" className={className} {...props}>
      <rect x="2" y="4" width="20" height="16" rx="5" fill="#1F8CEB" />
      <path d="M7 9v6m3-8v8m4-8v8m3-6v6" stroke="#FFFDF6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LoomIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#625DF5" className={className} {...props}>
      <circle cx="12" cy="12" r="4" fill="#625DF5" />
      <path d="M12 2v6m0 8v6M2 12h6m8 0h6m-15 7 4.2-4.2m9.6-9.6L20 4.5m-15.5 0 4.2 4.2m9.6 9.6 4.3 4.2" stroke="#625DF5" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export function UpstashIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#00E699" className={className} {...props}>
      <path d="m13 2-9 12h7v8l9-12h-7V2z" />
    </svg>
  );
}

export function TurborepoIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} {...props}>
      <circle cx="12" cy="12" r="10" stroke="#0070F3" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="#FF0080" strokeWidth="3" />
      <circle cx="12" cy="12" r="4" fill="#000000" />
    </svg>
  );
}

export function OktaIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#007DC1" className={className} {...props}>
      <circle cx="12" cy="12" r="10" fill="#007DC1" />
      <circle cx="12" cy="12" r="5" fill="#FFFDF6" />
    </svg>
  );
}

// =========================================================================
// DEVELOPER-ICONS EXPORTS (https://github.com/xandemon/developer-icons)
// =========================================================================

export const NetlifyIcon = wrapDevIcon(DevIcons.Netlify || DevIcons.Netlify2);
export const NextjsIcon = wrapDevIcon(DevIcons.NextJs);
export const OpenAIIcon = wrapDevIcon(DevIcons.OpenAI || DevIcons.ChatGPT);
export const GeminiIcon = wrapDevIcon(DevIcons.Gemini);
export const AnthropicIcon = wrapDevIcon(DevIcons.ClaudeAI || DevIcons.Anthropic);
export const ChromeIcon = wrapDevIcon(DevIcons.Chrome);
export const ReactIcon = wrapDevIcon(DevIcons.React);
export const AWSIcon = wrapDevIcon(DevIcons.AWS || DevIcons.EC2);
export const GoogleCloudIcon = wrapDevIcon(DevIcons.GoogleCloud);
export const AzureIcon = wrapDevIcon(DevIcons.Azure);
export const CloudflareIcon = wrapDevIcon(DevIcons.Cloudflare);
export const DockerIcon = wrapDevIcon(DevIcons.Docker);
export const KubernetesIcon = wrapDevIcon(DevIcons.Kubernetes);
export const PostgreSQLIcon = wrapDevIcon(DevIcons.PostgreSQL);
export const MySQLIcon = wrapDevIcon(DevIcons.MySQL);
export const MongoDBIcon = wrapDevIcon(DevIcons.MongoDB);
export const RedisIcon = wrapDevIcon(DevIcons.Redis);
export const SupabaseIcon = wrapDevIcon(DevIcons.Supabase);
export const FirebaseIcon = wrapDevIcon(DevIcons.Firebase);
export const TailwindIcon = wrapDevIcon(DevIcons.TailwindCSS);
export const TypeScriptIcon = wrapDevIcon(DevIcons.TypeScript);
export const JavaScriptIcon = wrapDevIcon(DevIcons.JavaScript);
export const PythonIcon = wrapDevIcon(DevIcons.Python);
export const RustIcon = wrapDevIcon(DevIcons.RustDark || DevIcons.RustLight);
export const GoIcon = wrapDevIcon(DevIcons.Go);
export const GraphQLIcon = wrapDevIcon(DevIcons.GraphQL);
export const GitHubIcon = wrapDevIcon(DevIcons.GitHubDark || DevIcons.GitHubLight);
export const GitLabIcon = wrapDevIcon(DevIcons.GitLab);
export const VercelIcon = wrapDevIcon(DevIcons.VercelDark || DevIcons.VercelLight);
export const FigmaIcon = wrapDevIcon(DevIcons.Figma);
export const SlackIcon = wrapDevIcon(DevIcons.Slack);
export const DiscordIcon = wrapDevIcon(DevIcons.Discord);
export const NodeJsIcon = wrapDevIcon(DevIcons.NodeJs);
export const BunJsIcon = wrapDevIcon(DevIcons.BunJs);
export const DenoIcon = wrapDevIcon(DevIcons.Deno);
export const NestJSIcon = wrapDevIcon(DevIcons.NestJS);
export const ExpressJsIcon = wrapDevIcon(DevIcons.ExpressJsDark || DevIcons.ExpressJsLight);
export const FastAPIIcon = wrapDevIcon(DevIcons.FastAPI);
export const DjangoIcon = wrapDevIcon(DevIcons.Django);
export const ViteJSIcon = wrapDevIcon(DevIcons.ViteJS);
export const SvelteJSIcon = wrapDevIcon(DevIcons.SvelteJS);
export const VueJsIcon = wrapDevIcon(DevIcons.VueJs);
export const AngularIcon = wrapDevIcon(DevIcons.Angular);
export const SolidityIcon = wrapDevIcon(DevIcons.Solidity);
export const TerraformIcon = wrapDevIcon(DevIcons.Terraform);
export const PrismaIcon = wrapDevIcon(DevIcons.Prisma);
export const TRPCIcon = wrapDevIcon(DevIcons.TRPC);
export const ShadcnUIIcon = wrapDevIcon(DevIcons.ShadcnUI);
export const KafkaIcon = wrapDevIcon(DevIcons.Kafka);
export const ElasticIcon = wrapDevIcon(DevIcons.Elastic);
export const LinuxIcon = wrapDevIcon(DevIcons.Linux);
export const N8nIcon = wrapDevIcon(DevIcons.N8n);
export const CopilotIcon = wrapDevIcon(DevIcons.Copilot || DevIcons.GitHubCopilot);
export const DeepSeekIcon = wrapDevIcon(DevIcons.DeepSeek);
export const PostHogIcon = wrapDevIcon(DevIcons.PostHog);
export const PostmanIcon = wrapDevIcon(DevIcons.Postman);
export const VSCodeIcon = wrapDevIcon(DevIcons.VisualStudioCode);
export const ClerkIcon = wrapDevIcon(DevIcons.Clerk);
export const ConvexIcon = wrapDevIcon(DevIcons.Convex);
export const DatadogIcon = wrapDevIcon(DevIcons.Datadog);
export const GrafanaIcon = wrapDevIcon(DevIcons.Grafana);
export const CPlusPlusIcon = wrapDevIcon(DevIcons.CPlusPlus);
export const CSharpIcon = wrapDevIcon(DevIcons.CSharp);
export const FlutterIcon = wrapDevIcon(DevIcons.Flutter);
export const KotlinIcon = wrapDevIcon(DevIcons.Kotlin);
export const SwiftIcon = wrapDevIcon(DevIcons.Swift);
export const JavaIcon = wrapDevIcon(DevIcons.Java);
export const NotionIcon = wrapDevIcon(DevIcons.Notion);
export const Auth0Icon = wrapDevIcon(DevIcons.Auth0);
export const AppwriteIcon = wrapDevIcon(DevIcons.Appwrite);
export const DigitalOceanIcon = wrapDevIcon(DevIcons.DigitalOcean);
export const HerokuIcon = wrapDevIcon(DevIcons.Heroku);
export const RenderIcon = wrapDevIcon(DevIcons.Render);
export const FlyIoIcon = wrapDevIcon(DevIcons.FlyIo);
export const RailwayIcon = wrapDevIcon(DevIcons.Railway);
export const StorybookIcon = wrapDevIcon(DevIcons.Storybook);
export const PlaywrightIcon = wrapDevIcon(DevIcons.Playwright);
export const CypressIcon = wrapDevIcon(DevIcons.Cypress);
export const JestIcon = wrapDevIcon(DevIcons.Jest);
export const InsomniaIcon = wrapDevIcon(DevIcons.Insomnia);
export const ClickHouseIcon = wrapDevIcon(DevIcons.ClickHouse);
export const CassandraIcon = wrapDevIcon(DevIcons.CassandraDB);
export const BitbucketIcon = wrapDevIcon(DevIcons.Bitbucket);
export const JiraIcon = wrapDevIcon(DevIcons.Jira);
export const HuggingFaceIcon = wrapDevIcon(DevIcons.HuggingFace);
export const ResendIcon = wrapDevIcon(DevIcons.ReSend);
export const AstroIcon = wrapDevIcon(DevIcons.Astro);
export const AnsibleIcon = wrapDevIcon(DevIcons.Ansible);
export const ApacheIcon = wrapDevIcon(DevIcons.Apache);
export const BabelIcon = wrapDevIcon(DevIcons.Babel);
export const BashIcon = wrapDevIcon(DevIcons.Bash);
export const BootstrapIcon = wrapDevIcon(DevIcons.Bootstrap5 || DevIcons.Bootstrap4);
export const DocusaurusIcon = wrapDevIcon(DevIcons.Docusaurus);
export const ElectronIcon = wrapDevIcon(DevIcons.Electron);
export const ElixirIcon = wrapDevIcon(DevIcons.Elixir);
export const ErlangIcon = wrapDevIcon(DevIcons.Erlang);
export const ESLintIcon = wrapDevIcon(DevIcons.ESLint);
export const GatsbyIcon = wrapDevIcon(DevIcons.Gatsby);
export const GitIcon = wrapDevIcon(DevIcons.Git);
export const HaskellIcon = wrapDevIcon(DevIcons.Haskell);
export const HTML5Icon = wrapDevIcon(DevIcons.HTML5);
export const CSS3Icon = wrapDevIcon(DevIcons.CSS3 || DevIcons.CSS);
export const JenkinsIcon = wrapDevIcon(DevIcons.Jenkins);
export const JSONIcon = wrapDevIcon(DevIcons.JSON);
export const LaravelIcon = wrapDevIcon(DevIcons.Laravel);
export const LuaIcon = wrapDevIcon(DevIcons.Lua);
export const MariaDBIcon = wrapDevIcon(DevIcons.MariaDB);
export const MarkdownIcon = wrapDevIcon(DevIcons.Markdown);
export const MaterialUIIcon = wrapDevIcon(DevIcons.MaterialUI);
export const MetaIcon = wrapDevIcon(DevIcons.Meta);
export const MicrosoftIcon = wrapDevIcon(DevIcons.Microsoft);
export const MSSQLIcon = wrapDevIcon(DevIcons.MicrosoftSQLServer || DevIcons.MicrosoftSQLServer2);
export const MiroIcon = wrapDevIcon(DevIcons.Miro);
export const NumPyIcon = wrapDevIcon(DevIcons.NumPy);
export const NuxtJSIcon = wrapDevIcon(DevIcons.NuxtJs);
export const NVIDIAIcon = wrapDevIcon(DevIcons.NVIDIA);
export const OCamlIcon = wrapDevIcon(DevIcons.OCaml);
export const PHPIcon = wrapDevIcon(DevIcons.PHP);
export const PyTorchIcon = wrapDevIcon(DevIcons.PyTorch);
export const RadixUIIcon = wrapDevIcon(DevIcons.RadixUI);
export const RailsIcon = wrapDevIcon(DevIcons.Rails);
export const RedHatIcon = wrapDevIcon(DevIcons.RedHat);
export const ReduxIcon = wrapDevIcon(DevIcons.Redux);
export const RubyIcon = wrapDevIcon(DevIcons.Ruby);
export const ScalaIcon = wrapDevIcon(DevIcons.Scala);
export const SpringIcon = wrapDevIcon(DevIcons.Spring);
export const SwaggerIcon = wrapDevIcon(DevIcons.Swagger);
export const TensorflowIcon = wrapDevIcon(DevIcons.Tensorflow);
export const UbuntuIcon = wrapDevIcon(DevIcons.Ubuntu);
export const VimIcon = wrapDevIcon(DevIcons.Vim);
export const WebAssemblyIcon = wrapDevIcon(DevIcons.WebAssembly);
export const WebpackIcon = wrapDevIcon(DevIcons.Webpack);
export const WordPressIcon = wrapDevIcon(DevIcons.WordPress);
export const ZodIcon = wrapDevIcon(DevIcons.Zod);

// ==========================================
// ROAD & STATUS SIGNS (PURE SVGs)
// ==========================================

export function WarningSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" fill="#F59E0B" fillOpacity="0.25" />
      <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2.5" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

export function StopSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" fill="#EF4444" fillOpacity="0.25" />
      <line x1="7.5" y1="12" x2="16.5" y2="12" strokeWidth="3" stroke="#EF4444" />
    </svg>
  );
}

export function SuccessSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#10B981" fillOpacity="0.25" />
      <path d="m9 12 2 2 4-4" strokeWidth="2.5" stroke="#10B981" />
    </svg>
  );
}

export function GoalSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="10" fill="#6366F1" fillOpacity="0.2" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" fill="#6366F1" />
    </svg>
  );
}

export function LaunchSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#E24E1B" fillOpacity="0.25" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

export function IdeaSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" fill="#FBBF24" fillOpacity="0.3" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

export function CriticalSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="#DC2626" fillOpacity="0.3" />
    </svg>
  );
}

export function ConstructionSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="2" y="6" width="20" height="8" rx="1" fill="#F59E0B" fillOpacity="0.25" />
      <path d="M17 14v7" />
      <path d="M7 14v7" />
      <path d="M17 3v3" />
      <path d="M7 3v3" />
      <path d="M10 14 2.3 6.3" />
      <path d="M14 6 6.3 13.7" />
      <path d="M18 6 10.3 13.7" />
      <path d="M21.7 9.7 17.4 14" />
    </svg>
  );
}

export function SecuritySignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#0284C7" fillOpacity="0.25" />
      <circle cx="12" cy="11" r="2" />
      <path d="M12 13v3" />
    </svg>
  );
}

export function PinnedSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="12" y1="17" x2="12" y2="22" />
      <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" fill="#F43F5E" fillOpacity="0.3" />
    </svg>
  );
}

export function LoopSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}

export function ExperimentSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.55a1 1 0 0 0 .9 1.45h12.76a1 1 0 0 0 .9-1.45l-5.069-10.127A2 2 0 0 1 14 9.527V2" fill="#8B5CF6" fillOpacity="0.25" />
      <path d="M8.5 2h7" />
      <path d="M7 16h10" />
    </svg>
  );
}

export function BugSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect width="8" height="14" x="8" y="6" rx="4" fill="#EF4444" fillOpacity="0.2" />
      <path d="m19 7-3 2" />
      <path d="m5 7 3 2" />
      <path d="m19 19-3-2" />
      <path d="m5 19 3-2" />
      <path d="M20 13h-4" />
      <path d="M4 13h4" />
      <path d="m10 4 1 2" />
      <path d="m14 4-1 2" />
    </svg>
  );
}

export function FlameHotfixSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" fill="#F97316" fillOpacity="0.3" />
    </svg>
  );
}

export function MilestoneSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="#3B82F6" fillOpacity="0.25" />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

export function TrafficConeSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="m9.3 6.2 1.4-4.2a1.3 1.3 0 0 1 2.6 0l1.4 4.2" fill="#F97316" fillOpacity="0.3" />
      <path d="m14.7 6.2 2 6" />
      <path d="m9.3 6.2-2 6" />
      <path d="M6 16.5 4.5 21a1 1 0 0 0 .9 1.4h13.2a1 1 0 0 0 .9-1.4L18 16.5" />
      <path d="M2 22h20" />
      <path d="M7.3 12.2h9.4" />
      <path d="M6 16.5h12" />
    </svg>
  );
}

export function HeartbeatSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="#10B981" strokeWidth="2.5" />
    </svg>
  );
}

export function KeySecretSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="m21 2-2 2m-1.5 1.5L14 9l-1.5-1.5L10 10l-1.5-1.5L7 10l-1.5-1.5" />
      <circle cx="7.5" cy="15.5" r="5.5" fill="#EAB308" fillOpacity="0.25" />
    </svg>
  );
}

export function CompassSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#6366F1" fillOpacity="0.3" />
    </svg>
  );
}

export function BellAlertSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" fill="#F59E0B" fillOpacity="0.25" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export function GitBranchSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" fill="#8B5CF6" fillOpacity="0.25" />
      <circle cx="6" cy="18" r="3" fill="#8B5CF6" fillOpacity="0.25" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}

export function DatabaseAlertSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" fill="#3B82F6" fillOpacity="0.2" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

export function CoffeeBreakSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" fill="#D97706" fillOpacity="0.25" />
      <line x1="6" y1="1" x2="6" y2="4" />
      <line x1="10" y1="1" x2="10" y2="4" />
      <line x1="14" y1="1" x2="14" y2="4" />
    </svg>
  );
}

export function LockSignIcon({ size = 20, className = '', ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="#0284C7" fillOpacity="0.25" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

// ==========================================
// REGISTRIES & RESOLVERS (120+ DEVELOPER ICONS)
// ==========================================

export interface LogoMeta {
  id: string;
  name: string;
  category: 'cloud' | 'ai' | 'framework' | 'database' | 'infra' | 'tool' | 'language' | 'analytics' | 'payments';
  icon: React.ComponentType<IconProps>;
  color: string;
  defaultTitle: string;
  defaultBody: string;
}

export const AVAILABLE_LOGOS: LogoMeta[] = [
  // AWS Architecture Services
  { id: 'aws', name: 'AWS Cloud', category: 'cloud', icon: AWSIcon, color: '#FF9900', defaultTitle: 'AWS Cloud', defaultBody: 'Scalable cloud infrastructure, virtual VPC networking, and global regions.' },
  { id: 'awss3', name: 'AWS S3', category: 'cloud', icon: AWSS3Icon, color: '#569A31', defaultTitle: 'Amazon S3', defaultBody: 'Object storage for static assets, backups, data lakes, and media uploads.' },
  { id: 'awslambda', name: 'AWS Lambda', category: 'cloud', icon: AWSLambdaIcon, color: '#FF9900', defaultTitle: 'AWS Lambda', defaultBody: 'Serverless event-driven compute executing microservices and background jobs.' },
  { id: 'awsdynamodb', name: 'AWS DynamoDB', category: 'database', icon: AWSDynamoDBIcon, color: '#4053D6', defaultTitle: 'Amazon DynamoDB', defaultBody: 'Fully managed key-value and document NoSQL database with single-digit millisecond latency.' },
  { id: 'awsrds', name: 'AWS RDS', category: 'database', icon: AWSRDSIcon, color: '#3B48CC', defaultTitle: 'Amazon RDS', defaultBody: 'Managed relational database service for Postgres, MySQL, and Aurora.' },
  { id: 'awscloudfront', name: 'AWS CloudFront', category: 'cloud', icon: AWSCloudFrontIcon, color: '#A166FF', defaultTitle: 'Amazon CloudFront', defaultBody: 'Global content delivery network (CDN) with edge caching and TLS termination.' },
  { id: 'awssqs', name: 'AWS SQS', category: 'infra', icon: AWSSQSIcon, color: '#FF4F8B', defaultTitle: 'Amazon SQS', defaultBody: 'Fully managed distributed message queuing service for decoupled services.' },
  { id: 'awssns', name: 'AWS SNS', category: 'infra', icon: AWSSNSIcon, color: '#FF4F8B', defaultTitle: 'Amazon SNS', defaultBody: 'Pub/Sub messaging service for fanout notifications, SMS, and webhook triggers.' },
  { id: 'awsecs', name: 'AWS ECS', category: 'infra', icon: AWSECSIcon, color: '#FF9900', defaultTitle: 'Amazon ECS', defaultBody: 'Highly scalable container orchestration running Docker microservices on Fargate.' },
  { id: 'awscloudwatch', name: 'AWS CloudWatch', category: 'analytics', icon: AWSCloudWatchIcon, color: '#E7157B', defaultTitle: 'Amazon CloudWatch', defaultBody: 'Real-time observability, metric alarms, and application log streams.' },
  { id: 'awsapigateway', name: 'AWS API Gateway', category: 'infra', icon: AWSAPIGatewayIcon, color: '#E7157B', defaultTitle: 'Amazon API Gateway', defaultBody: 'Managed API gateway handling REST, WebSocket, and HTTP traffic at scale.' },
  { id: 'awsiam', name: 'AWS IAM', category: 'tool', icon: AWSIAMIcon, color: '#DD344C', defaultTitle: 'AWS IAM', defaultBody: 'Fine-grained access control, role assumption, and policy evaluation.' },
  { id: 'awsbedrock', name: 'AWS Bedrock', category: 'ai', icon: AWSBedrockIcon, color: '#232F3E', defaultTitle: 'Amazon Bedrock', defaultBody: 'Serverless foundation model access for generative AI agents and reasoning.' },

  // AI, LLMs & Vector Databases
  { id: 'openai', name: 'OpenAI GPT', category: 'ai', icon: OpenAIIcon, color: '#10A37F', defaultTitle: 'OpenAI GPT-4o', defaultBody: 'Multimodal intelligence model powering WebMCP agents and spatial reasoning.' },
  { id: 'claude', name: 'Claude AI', category: 'ai', icon: AnthropicIcon, color: '#D97706', defaultTitle: 'Claude 3.7 Sonnet', defaultBody: 'Extended thinking and architectural synthesis across graph nodes.' },
  { id: 'gemini', name: 'Google Gemini', category: 'ai', icon: GeminiIcon, color: '#4F46E5', defaultTitle: 'Gemini 2.5 Flash', defaultBody: 'Multimodal vision and ultra low-latency WebMCP tool execution.' },
  { id: 'deepseek', name: 'DeepSeek', category: 'ai', icon: DeepSeekIcon, color: '#1E40AF', defaultTitle: 'DeepSeek R1', defaultBody: 'Open reasoning architecture and code intelligence.' },
  { id: 'copilot', name: 'GitHub Copilot', category: 'ai', icon: CopilotIcon, color: '#6E40C9', defaultTitle: 'GitHub Copilot', defaultBody: 'AI pair programmer assisting with repository code synthesis.' },
  { id: 'ollama', name: 'Ollama AI', category: 'ai', icon: OllamaIcon, color: '#000000', defaultTitle: 'Ollama Local LLM', defaultBody: 'Run Llama 3, Mistral, and DeepSeek locally with private weights.' },
  { id: 'groq', name: 'Groq LPU', category: 'ai', icon: GroqIcon, color: '#F55036', defaultTitle: 'Groq LPU Engine', defaultBody: 'Ultra high-speed tensor streaming inference engine for instant token output.' },
  { id: 'mistral', name: 'Mistral AI', category: 'ai', icon: MistralAIIcon, color: '#FA520F', defaultTitle: 'Mistral Large', defaultBody: 'High efficiency open-weight frontier models for multilingual workflows.' },
  { id: 'perplexity', name: 'Perplexity', category: 'ai', icon: PerplexityIcon, color: '#20B2AA', defaultTitle: 'Perplexity Search', defaultBody: 'Real-time conversational web index and factual citation engine.' },
  { id: 'langchain', name: 'LangChain', category: 'ai', icon: LangChainIcon, color: '#1C3C3C', defaultTitle: 'LangChain Orchestrator', defaultBody: 'Agent memory, retrieval augmented generation (RAG), and tool chains.' },
  { id: 'huggingface', name: 'Hugging Face', category: 'ai', icon: HuggingFaceIcon, color: '#FFD21E', defaultTitle: 'Hugging Face Hub', defaultBody: 'Open-source transformer models, datasets, and inference endpoints.' },
  { id: 'webmcp', name: 'WebMCP Standard', category: 'ai', icon: WebMCPIcon, color: '#E24E1B', defaultTitle: 'WebMCP Bridge', defaultBody: 'Browser-native tool registration via document.modelContext.' },
  { id: 'pinecone', name: 'Pinecone', category: 'database', icon: PineconeIcon, color: '#000000', defaultTitle: 'Pinecone Vector DB', defaultBody: 'Managed high-scale vector index for semantic embedding search.' },
  { id: 'weaviate', name: 'Weaviate', category: 'database', icon: WeaviateIcon, color: '#FA4646', defaultTitle: 'Weaviate Vector Search', defaultBody: 'Open-source vector database with hybrid keyword & vector retrieval.' },
  { id: 'chroma', name: 'ChromaDB', category: 'database', icon: ChromaDBIcon, color: '#FF5E00', defaultTitle: 'ChromaDB Embeddings', defaultBody: 'Open-source embedding database for AI application development.' },
  { id: 'qdrant', name: 'Qdrant', category: 'database', icon: QdrantIcon, color: '#DC2626', defaultTitle: 'Qdrant Vector Engine', defaultBody: 'Rust-powered high performance vector similarity engine with payload filtering.' },

  // Cloud & Edge Hosting
  { id: 'netlify', name: 'Netlify', category: 'cloud', icon: NetlifyIcon, color: '#00C7B7', defaultTitle: 'Netlify Edge', defaultBody: 'Instant frontend hosting, edge serverless functions, and global CDN deployment.' },
  { id: 'googlecloud', name: 'Google Cloud', category: 'cloud', icon: GoogleCloudIcon, color: '#4285F4', defaultTitle: 'Google Cloud Platform', defaultBody: 'Compute Engine, Cloud Run, and BigQuery data analytics.' },
  { id: 'azure', name: 'Microsoft Azure', category: 'cloud', icon: AzureIcon, color: '#0089D6', defaultTitle: 'Microsoft Azure', defaultBody: 'Enterprise cloud services, Blob Storage, and Azure Functions.' },
  { id: 'cloudflare', name: 'Cloudflare', category: 'cloud', icon: CloudflareIcon, color: '#F38020', defaultTitle: 'Cloudflare Workers', defaultBody: 'Ultra-low latency edge compute, DDoS mitigation, and R2 storage.' },
  { id: 'vercel', name: 'Vercel', category: 'cloud', icon: VercelIcon, color: '#000000', defaultTitle: 'Vercel Edge', defaultBody: 'Serverless deployment platform optimized for Next.js and frontend stacks.' },
  { id: 'railway', name: 'Railway', category: 'cloud', icon: RailwayIcon, color: '#0B0D0E', defaultTitle: 'Railway Infrastructure', defaultBody: 'Instant full-stack application and microservice deployments.' },
  { id: 'render', name: 'Render', category: 'cloud', icon: RenderIcon, color: '#46E3B7', defaultTitle: 'Render Cloud', defaultBody: 'Fast web service, static site, and background worker hosting.' },
  { id: 'flyio', name: 'Fly.io', category: 'cloud', icon: FlyIoIcon, color: '#24185B', defaultTitle: 'Fly.io Compute', defaultBody: 'Deploy full servers and machines close to global users.' },
  { id: 'digitalocean', name: 'DigitalOcean', category: 'cloud', icon: DigitalOceanIcon, color: '#0080FF', defaultTitle: 'DigitalOcean Droplets', defaultBody: 'Cloud computing VPS droplets and managed Kubernetes clusters.' },
  { id: 'heroku', name: 'Heroku', category: 'cloud', icon: HerokuIcon, color: '#430098', defaultTitle: 'Heroku Dynos', defaultBody: 'Cloud PaaS application runtime with add-on marketplace.' },

  // Databases & Storage
  { id: 'supabase', name: 'Supabase', category: 'database', icon: SupabaseIcon, color: '#3ECF8E', defaultTitle: 'Supabase Postgres', defaultBody: 'Relational data store with row-level security and realtime subscriptions.' },
  { id: 'firebase', name: 'Firebase', category: 'database', icon: FirebaseIcon, color: '#FFCA28', defaultTitle: 'Firebase Firestore', defaultBody: 'Real-time multi-client state replication with local-first cache.' },
  { id: 'postgres', name: 'PostgreSQL', category: 'database', icon: PostgreSQLIcon, color: '#336791', defaultTitle: 'PostgreSQL', defaultBody: 'ACID compliant structured relational data storage.' },
  { id: 'mysql', name: 'MySQL', category: 'database', icon: MySQLIcon, color: '#4479A1', defaultTitle: 'MySQL Database', defaultBody: 'Reliable open-source relational database management.' },
  { id: 'mongodb', name: 'MongoDB', category: 'database', icon: MongoDBIcon, color: '#47A248', defaultTitle: 'MongoDB Atlas', defaultBody: 'Document-based flexible NoSQL database for unstructured payloads.' },
  { id: 'redis', name: 'Redis', category: 'database', icon: RedisIcon, color: '#DC2626', defaultTitle: 'Redis Cache', defaultBody: 'In-memory key-value cache and pub/sub message broker.' },
  { id: 'upstash', name: 'Upstash', category: 'database', icon: UpstashIcon, color: '#00E699', defaultTitle: 'Upstash Serverless', defaultBody: 'Serverless Redis, Kafka, and QStash with pay-per-request pricing.' },
  { id: 'convex', name: 'Convex', category: 'database', icon: ConvexIcon, color: '#F97316', defaultTitle: 'Convex Backend', defaultBody: 'Reactive full-stack TypeScript backend with automatic sync.' },
  { id: 'prisma', name: 'Prisma ORM', category: 'database', icon: PrismaIcon, color: '#2D3748', defaultTitle: 'Prisma ORM', defaultBody: 'Type-safe database client and schema migration workflow.' },
  { id: 'clickhouse', name: 'ClickHouse', category: 'database', icon: ClickHouseIcon, color: '#FFCC00', defaultTitle: 'ClickHouse Analytics', defaultBody: 'Column-oriented DBMS for real-time analytical reporting.' },
  { id: 'mariadb', name: 'MariaDB', category: 'database', icon: MariaDBIcon, color: '#003545', defaultTitle: 'MariaDB Server', defaultBody: 'High-performance open source drop-in replacement for MySQL.' },
  { id: 'mssql', name: 'Microsoft SQL', category: 'database', icon: MSSQLIcon, color: '#CC292B', defaultTitle: 'SQL Server', defaultBody: 'Enterprise relational database management system.' },

  // Payments & Identity
  { id: 'stripe', name: 'Stripe', category: 'payments', icon: StripeIcon, color: '#635BFF', defaultTitle: 'Stripe Billing', defaultBody: 'Payment infrastructure, usage-based billing, and webhooks.' },
  { id: 'auth0', name: 'Auth0', category: 'tool', icon: Auth0Icon, color: '#EB5424', defaultTitle: 'Auth0 by Okta', defaultBody: 'Universal identity provider, JWT token verification, and SSO.' },
  { id: 'okta', name: 'Okta', category: 'tool', icon: OktaIcon, color: '#007DC1', defaultTitle: 'Okta Enterprise Auth', defaultBody: 'Workforce identity management and SAML single sign-on.' },
  { id: 'clerk', name: 'Clerk Auth', category: 'tool', icon: ClerkIcon, color: '#6C47FF', defaultTitle: 'Clerk Authentication', defaultBody: 'User management, session auth, and multi-tenant organizations.' },

  // Monitoring, Analytics & Telemetry
  { id: 'sentry', name: 'Sentry', category: 'analytics', icon: SentryIcon, color: '#362D59', defaultTitle: 'Sentry Error Tracking', defaultBody: 'Application error monitoring, breadcrumbs, and release health.' },
  { id: 'posthog', name: 'PostHog', category: 'analytics', icon: PostHogIcon, color: '#FF7000', defaultTitle: 'PostHog Product Analytics', defaultBody: 'Product analytics, feature flags, session replay, and heatmaps.' },
  { id: 'segment', name: 'Segment', category: 'analytics', icon: SegmentIcon, color: '#52BD95', defaultTitle: 'Twilio Segment CDP', defaultBody: 'Customer data platform routing telemetry across destinations.' },
  { id: 'mixpanel', name: 'Mixpanel', category: 'analytics', icon: MixpanelIcon, color: '#7856FF', defaultTitle: 'Mixpanel Analytics', defaultBody: 'Event analytics, funnel conversion, and retention cohort tracking.' },
  { id: 'datadog', name: 'Datadog', category: 'analytics', icon: DatadogIcon, color: '#632CA6', defaultTitle: 'Datadog APM', defaultBody: 'Cloud monitoring, application telemetry, and distributed tracing.' },
  { id: 'grafana', name: 'Grafana', category: 'analytics', icon: GrafanaIcon, color: '#F46800', defaultTitle: 'Grafana Dashboards', defaultBody: 'Metric visualization and alert monitoring dashboards.' },
  { id: 'twilio', name: 'Twilio', category: 'tool', icon: TwilioIcon, color: '#F22F46', defaultTitle: 'Twilio Communications', defaultBody: 'Programmable SMS, voice calls, and two-factor verification APIs.' },
  { id: 'resend', name: 'Resend', category: 'tool', icon: ResendIcon, color: '#000000', defaultTitle: 'Resend Email API', defaultBody: 'Developer-first transactional email delivery with React Email.' },
  { id: 'intercom', name: 'Intercom', category: 'tool', icon: IntercomIcon, color: '#1F8CEB', defaultTitle: 'Intercom Messenger', defaultBody: 'AI customer service and in-app user onboarding messaging.' },

  // Collaboration, Docs & Productivity
  { id: 'linear', name: 'Linear', category: 'tool', icon: LinearIcon, color: '#5E6AD2', defaultTitle: 'Linear Issues', defaultBody: 'Sprint tracking, roadmap milestones, and issue automation.' },
  { id: 'notion', name: 'Notion', category: 'tool', icon: NotionIcon, color: '#000000', defaultTitle: 'Notion Workspace', defaultBody: 'Technical documentation, engineering specs, and team wiki.' },
  { id: 'airtable', name: 'Airtable', category: 'tool', icon: AirtableIcon, color: '#18BFFF', defaultTitle: 'Airtable Database', defaultBody: 'Low-code relational database and internal workflow automation.' },
  { id: 'zapier', name: 'Zapier', category: 'tool', icon: ZapierIcon, color: '#FF4A00', defaultTitle: 'Zapier Webhooks', defaultBody: 'Automated integration zaps across 5,000+ SaaS apps.' },
  { id: 'n8n', name: 'n8n Workflow', category: 'tool', icon: N8nIcon, color: '#EA4B71', defaultTitle: 'n8n Automation', defaultBody: 'Workflow automation platform connecting APIs and AI agents.' },
  { id: 'loom', name: 'Loom', category: 'tool', icon: LoomIcon, color: '#625DF5', defaultTitle: 'Loom Video', defaultBody: 'Async video walkthroughs and screen recordings.' },
  { id: 'slack', name: 'Slack', category: 'tool', icon: SlackIcon, color: '#4A154B', defaultTitle: 'Slack Webhook', defaultBody: 'Channel alerts, incident notifications, and agent digests.' },
  { id: 'discord', name: 'Discord', category: 'tool', icon: DiscordIcon, color: '#5865F2', defaultTitle: 'Discord Community', defaultBody: 'Community support, agent bot triggers, and developer chat.' },
  { id: 'figma', name: 'Figma', category: 'tool', icon: FigmaIcon, color: '#F24E1E', defaultTitle: 'Figma Design', defaultBody: 'Component specifications, design system tokens, and UX wireframes.' },
  { id: 'jira', name: 'Jira', category: 'tool', icon: JiraIcon, color: '#0052CC', defaultTitle: 'Atlassian Jira', defaultBody: 'Agile issue tracking and sprint planning for software teams.' },
  { id: 'miro', name: 'Miro', category: 'tool', icon: MiroIcon, color: '#FFD02F', defaultTitle: 'Miro Canvas', defaultBody: 'Visual brainstorming and system architecture whiteboards.' },

  // Frameworks & UI
  { id: 'nextjs', name: 'Next.js', category: 'framework', icon: NextjsIcon, color: '#000000', defaultTitle: 'Next.js 16', defaultBody: 'React Server Components, App Router, and lightning fast streaming responses.' },
  { id: 'react', name: 'React', category: 'framework', icon: ReactIcon, color: '#06B6D4', defaultTitle: 'React 19', defaultBody: 'Declarative component rendering with optimistic UI updates.' },
  { id: 'tailwind', name: 'Tailwind CSS', category: 'framework', icon: TailwindIcon, color: '#38BDF8', defaultTitle: 'Tailwind CSS', defaultBody: 'Utility-first styling with responsive design tokens.' },
  { id: 'shadcnui', name: 'shadcn/ui', category: 'framework', icon: ShadcnUIIcon, color: '#000000', defaultTitle: 'shadcn/ui', defaultBody: 'Accessible, customizable component primitives built with Radix.' },
  { id: 'radix', name: 'Radix UI', category: 'framework', icon: RadixUIIcon, color: '#161618', defaultTitle: 'Radix Primitives', defaultBody: 'Unstyled, accessible UI components for React applications.' },
  { id: 'astro', name: 'Astro', category: 'framework', icon: AstroIcon, color: '#FF5D01', defaultTitle: 'Astro Islands', defaultBody: 'Content-driven web framework with zero-JS island architecture.' },
  { id: 'svelte', name: 'Svelte', category: 'framework', icon: SvelteJSIcon, color: '#FF3E00', defaultTitle: 'Svelte 5', defaultBody: 'Runes reactivity and compiled zero-runtime components.' },
  { id: 'vue', name: 'Vue.js', category: 'framework', icon: VueJsIcon, color: '#42B883', defaultTitle: 'Vue 3', defaultBody: 'Progressive JavaScript framework with Composition API.' },
  { id: 'angular', name: 'Angular', category: 'framework', icon: AngularIcon, color: '#DD0031', defaultTitle: 'Angular', defaultBody: 'Component-based framework for scalable enterprise web applications.' },
  { id: 'flutter', name: 'Flutter', category: 'framework', icon: FlutterIcon, color: '#02569B', defaultTitle: 'Flutter', defaultBody: 'Cross-platform native mobile and desktop rendering.' },
  { id: 'laravel', name: 'Laravel', category: 'framework', icon: LaravelIcon, color: '#FF2D20', defaultTitle: 'Laravel PHP', defaultBody: 'Web artisan framework with Eloquent ORM and Artisan CLI.' },
  { id: 'rails', name: 'Ruby on Rails', category: 'framework', icon: RailsIcon, color: '#CC0000', defaultTitle: 'Rails Framework', defaultBody: 'Convention over configuration full-stack web application framework.' },
  { id: 'spring', name: 'Spring Boot', category: 'framework', icon: SpringIcon, color: '#6DB33F', defaultTitle: 'Spring Boot', defaultBody: 'Enterprise Java microservice framework with dependency injection.' },

  // Languages & Runtimes
  { id: 'typescript', name: 'TypeScript', category: 'language', icon: TypeScriptIcon, color: '#3178C6', defaultTitle: 'TypeScript 5', defaultBody: 'Strict static type validation across client and WebMCP bridge.' },
  { id: 'javascript', name: 'JavaScript', category: 'language', icon: JavaScriptIcon, color: '#F7DF1E', defaultTitle: 'JavaScript ESNext', defaultBody: 'Dynamic client scripting and browser runtime execution.' },
  { id: 'python', name: 'Python', category: 'language', icon: PythonIcon, color: '#3776AB', defaultTitle: 'Python Services', defaultBody: 'Data analysis, embedding generation, and backend agent workers.' },
  { id: 'rust', name: 'Rust', category: 'language', icon: RustIcon, color: '#DEA584', defaultTitle: 'Rust Core', defaultBody: 'Memory-safe high performance systems programming and WebAssembly.' },
  { id: 'go', name: 'Golang', category: 'language', icon: GoIcon, color: '#00ADD8', defaultTitle: 'Go Microservices', defaultBody: 'High-concurrency microservice APIs with lightweight goroutines.' },
  { id: 'nodejs', name: 'Node.js', category: 'language', icon: NodeJsIcon, color: '#339933', defaultTitle: 'Node.js Runtime', defaultBody: 'Asynchronous event-driven server runtime environment.' },
  { id: 'bun', name: 'Bun', category: 'language', icon: BunJsIcon, color: '#FBF0DF', defaultTitle: 'Bun Runtime', defaultBody: 'Fast all-in-one JavaScript runtime, bundler, and package manager.' },
  { id: 'deno', name: 'Deno', category: 'language', icon: DenoIcon, color: '#000000', defaultTitle: 'Deno Runtime', defaultBody: 'Secure runtime for JavaScript and TypeScript with web standards.' },
  { id: 'solidity', name: 'Solidity', category: 'language', icon: SolidityIcon, color: '#363636', defaultTitle: 'Solidity Smart Contracts', defaultBody: 'EVM smart contract protocol and cryptographic settlement.' },
  { id: 'kotlin', name: 'Kotlin', category: 'language', icon: KotlinIcon, color: '#7F52FF', defaultTitle: 'Kotlin Multiplatform', defaultBody: 'Modern expressive language for Android and shared server logic.' },
  { id: 'swift', name: 'Swift', category: 'language', icon: SwiftIcon, color: '#F05138', defaultTitle: 'Swift / iOS', defaultBody: 'High-performance Apple platform app and server programming.' },
  { id: 'java', name: 'Java', category: 'language', icon: JavaIcon, color: '#007396', defaultTitle: 'Java JVM', defaultBody: 'Enterprise JVM backend services and distributed pipelines.' },
  { id: 'cpp', name: 'C++', category: 'language', icon: CPlusPlusIcon, color: '#00599C', defaultTitle: 'C++ Systems', defaultBody: 'Low-level hardware control, graphics, and real-time computation.' },
  { id: 'csharp', name: 'C#', category: 'language', icon: CSharpIcon, color: '#239120', defaultTitle: 'C# .NET', defaultBody: 'Modern cross-platform .NET cloud and enterprise applications.' },
  { id: 'ruby', name: 'Ruby', category: 'language', icon: RubyIcon, color: '#CC342D', defaultTitle: 'Ruby Language', defaultBody: 'Dynamic, object-oriented language focused on simplicity.' },
  { id: 'php', name: 'PHP', category: 'language', icon: PHPIcon, color: '#777BB4', defaultTitle: 'PHP 8', defaultBody: 'Server-side web scripting language powering web backends.' },
  { id: 'elixir', name: 'Elixir', category: 'language', icon: ElixirIcon, color: '#4E2A8E', defaultTitle: 'Elixir BEAM', defaultBody: 'Concurrent functional language running on the Erlang VM.' },
  { id: 'scala', name: 'Scala', category: 'language', icon: ScalaIcon, color: '#DC322F', defaultTitle: 'Scala Language', defaultBody: 'Object-oriented and functional language for scalable big data pipelines.' },
  { id: 'lua', name: 'Lua', category: 'language', icon: LuaIcon, color: '#000080', defaultTitle: 'Lua Scripting', defaultBody: 'Lightweight, embeddable scripting language.' },
  { id: 'bash', name: 'Bash Shell', category: 'language', icon: BashIcon, color: '#4EAA25', defaultTitle: 'Bash CLI', defaultBody: 'Unix shell and command language for build scripts and automation.' },

  // Infrastructure, Monorepo & Testing
  { id: 'docker', name: 'Docker', category: 'infra', icon: DockerIcon, color: '#2496ED', defaultTitle: 'Docker Containers', defaultBody: 'Containerized agent runtime and microservice sandboxes.' },
  { id: 'kubernetes', name: 'Kubernetes', category: 'infra', icon: KubernetesIcon, color: '#326CE5', defaultTitle: 'Kubernetes Cluster', defaultBody: 'Container orchestration, autoscaling, and zero-downtime rollouts.' },
  { id: 'turborepo', name: 'Turborepo', category: 'infra', icon: TurborepoIcon, color: '#0070F3', defaultTitle: 'Turborepo Monorepo', defaultBody: 'High-speed build system for JavaScript and TypeScript monorepos.' },
  { id: 'graphql', name: 'GraphQL', category: 'infra', icon: GraphQLIcon, color: '#E10098', defaultTitle: 'GraphQL API', defaultBody: 'Typed query and mutation interface for federated graph endpoints.' },
  { id: 'trpc', name: 'tRPC', category: 'infra', icon: TRPCIcon, color: '#2596BE', defaultTitle: 'tRPC Endpoints', defaultBody: 'End-to-end typesafe APIs without code generation.' },
  { id: 'fastapi', name: 'FastAPI', category: 'infra', icon: FastAPIIcon, color: '#009688', defaultTitle: 'FastAPI Python', defaultBody: 'High performance async Python REST APIs with OpenAPI docs.' },
  { id: 'django', name: 'Django', category: 'infra', icon: DjangoIcon, color: '#092E20', defaultTitle: 'Django Backend', defaultBody: 'Batteries-included web framework with robust ORM and admin.' },
  { id: 'nestjs', name: 'NestJS', category: 'infra', icon: NestJSIcon, color: '#E0234E', defaultTitle: 'NestJS Architecture', defaultBody: 'Progressive Node.js framework with TypeScript decorators.' },
  { id: 'express', name: 'Express.js', category: 'infra', icon: ExpressJsIcon, color: '#000000', defaultTitle: 'Express Server', defaultBody: 'Minimalist and flexible Node.js web application framework.' },
  { id: 'kafka', name: 'Apache Kafka', category: 'infra', icon: KafkaIcon, color: '#231F20', defaultTitle: 'Kafka Event Bus', defaultBody: 'Distributed event streaming platform for high-throughput pipelines.' },
  { id: 'elastic', name: 'Elasticsearch', category: 'infra', icon: ElasticIcon, color: '#005571', defaultTitle: 'Elasticsearch Cluster', defaultBody: 'Distributed JSON search and real-time observability engine.' },
  { id: 'terraform', name: 'Terraform', category: 'infra', icon: TerraformIcon, color: '#7B42BC', defaultTitle: 'Terraform IaC', defaultBody: 'Infrastructure as code for provisioning cloud resources.' },
  { id: 'ansible', name: 'Ansible', category: 'infra', icon: AnsibleIcon, color: '#EE0000', defaultTitle: 'Ansible Automation', defaultBody: 'Agentless IT automation and configuration management engine.' },
  { id: 'linux', name: 'Linux', category: 'infra', icon: LinuxIcon, color: '#FCC624', defaultTitle: 'Linux OS', defaultBody: 'Open-source kernel powering cloud containers and server nodes.' },
  { id: 'ubuntu', name: 'Ubuntu', category: 'infra', icon: UbuntuIcon, color: '#E95420', defaultTitle: 'Ubuntu Server', defaultBody: 'Enterprise Linux distribution for cloud workloads.' },
  { id: 'playwright', name: 'Playwright', category: 'tool', icon: PlaywrightIcon, color: '#2EAD33', defaultTitle: 'Playwright E2E', defaultBody: 'Reliable end-to-end browser automation and visual testing.' },
  { id: 'cypress', name: 'Cypress', category: 'tool', icon: CypressIcon, color: '#17202C', defaultTitle: 'Cypress Testing', defaultBody: 'Fast, easy component and end-to-end browser testing.' },
  { id: 'jest', name: 'Jest', category: 'tool', icon: JestIcon, color: '#C21325', defaultTitle: 'Jest Unit Testing', defaultBody: 'Delightful JavaScript testing framework with snapshot support.' },
  { id: 'storybook', name: 'Storybook', category: 'tool', icon: StorybookIcon, color: '#FF4785', defaultTitle: 'Storybook Sandbox', defaultBody: 'Component catalog for isolated UI development and documentation.' },
  { id: 'vite', name: 'Vite', category: 'tool', icon: ViteJSIcon, color: '#646CFF', defaultTitle: 'Vite Bundler', defaultBody: 'Lightning fast ESM dev server and optimized rollup bundler.' },
  { id: 'webpack', name: 'Webpack', category: 'tool', icon: WebpackIcon, color: '#8DD6F9', defaultTitle: 'Webpack Bundler', defaultBody: 'Module bundler for complex JavaScript and web applications.' },
  { id: 'github', name: 'GitHub', category: 'tool', icon: GitHubIcon, color: '#24292F', defaultTitle: 'GitHub Actions', defaultBody: 'Continuous integration, branch testing, and automated release pipeline.' },
  { id: 'gitlab', name: 'GitLab', category: 'tool', icon: GitLabIcon, color: '#FC6D26', defaultTitle: 'GitLab DevOps', defaultBody: 'Unified DevOps platform for source code and container registry.' },
  { id: 'bitbucket', name: 'Bitbucket', category: 'tool', icon: BitbucketIcon, color: '#0052CC', defaultTitle: 'Bitbucket Cloud', defaultBody: 'Git code management with Jira integration and pipelines.' },
  { id: 'vscode', name: 'VS Code', category: 'tool', icon: VSCodeIcon, color: '#007ACC', defaultTitle: 'VS Code Editor', defaultBody: 'Extensible code editor with LSP and integrated debugging.' },
  { id: 'postman', name: 'Postman', category: 'tool', icon: PostmanIcon, color: '#FF6C37', defaultTitle: 'Postman API Client', defaultBody: 'API platform for building, testing, and mocking REST/GraphQL endpoints.' },
  { id: 'insomnia', name: 'Insomnia', category: 'tool', icon: InsomniaIcon, color: '#5849BE', defaultTitle: 'Insomnia REST/GraphQL', defaultBody: 'Leading open source API client for debugging and design.' },
  { id: 'swagger', name: 'Swagger', category: 'tool', icon: SwaggerIcon, color: '#85EA2D', defaultTitle: 'Swagger OpenAPI', defaultBody: 'Interactive API documentation and schema specification.' },
  { id: 'zod', name: 'Zod', category: 'tool', icon: ZodIcon, color: '#3E67B1', defaultTitle: 'Zod Validation', defaultBody: 'TypeScript-first schema declaration and runtime validation.' },
];

export interface SignMeta {
  id: string;
  name: string;
  icon: React.ComponentType<IconProps>;
  color: string;
  badgeBg: string;
  badgeText: string;
  defaultTitle: string;
  defaultBody: string;
}

export const AVAILABLE_SIGNS: SignMeta[] = [
  { id: 'warning', name: 'Warning Hazard', icon: WarningSignIcon, color: '#F59E0B', badgeBg: 'bg-amber-500', badgeText: 'text-black', defaultTitle: 'CAUTION / RISK', defaultBody: 'Identified potential bottleneck or dependency risk to mitigate.' },
  { id: 'stop', name: 'Hard Blocker', icon: StopSignIcon, color: '#EF4444', badgeBg: 'bg-red-600', badgeText: 'text-white', defaultTitle: 'HARD BLOCKER', defaultBody: 'Execution blocked pending resolution or security clearance.' },
  { id: 'launch', name: 'Ship & Launch', icon: LaunchSignIcon, color: '#E24E1B', badgeBg: 'bg-[#E24E1B]', badgeText: 'text-white', defaultTitle: 'SHIP & LAUNCH', defaultBody: 'Ready for public deployment, announcement, and go-to-market.' },
  { id: 'goal', name: 'Primary Objective', icon: GoalSignIcon, color: '#6366F1', badgeBg: 'bg-indigo-600', badgeText: 'text-white', defaultTitle: 'PRIMARY OBJECTIVE', defaultBody: 'Key milestone metric to achieve for this iteration cycle.' },
  { id: 'idea', name: 'Innovation Idea', icon: IdeaSignIcon, color: '#FBBF24', badgeBg: 'bg-amber-400', badgeText: 'text-black', defaultTitle: 'INNOVATION / IDEA', defaultBody: 'High-leverage experiment or creative product concept.' },
  { id: 'critical', name: 'Top Priority', icon: CriticalSignIcon, color: '#DC2626', badgeBg: 'bg-rose-700', badgeText: 'text-white', defaultTitle: 'TOP PRIORITY', defaultBody: 'Requires immediate triage and agent action within 24h.' },
  { id: 'success', name: 'Verified Sign', icon: SuccessSignIcon, color: '#10B981', badgeBg: 'bg-emerald-600', badgeText: 'text-white', defaultTitle: 'VERIFIED & SIGNED', defaultBody: 'Architectural design reviewed and approved by lead engineer.' },
  { id: 'construction', name: 'In Progress', icon: ConstructionSignIcon, color: '#F59E0B', badgeBg: 'bg-yellow-500', badgeText: 'text-black', defaultTitle: 'UNDER CONSTRUCTION', defaultBody: 'Work in progress: active development underway.' },
  { id: 'security', name: 'Security Audit', icon: SecuritySignIcon, color: '#0284C7', badgeBg: 'bg-sky-600', badgeText: 'text-white', defaultTitle: 'SECURITY AUDIT', defaultBody: 'Auth tokens, encryption keys, and permission boundaries check.' },
  { id: 'pinned', name: 'Sticky Memo', icon: PinnedSignIcon, color: '#F43F5E', badgeBg: 'bg-rose-500', badgeText: 'text-white', defaultTitle: 'STICKY MEMO', defaultBody: 'Important context pinned for team members and browser agents.' },
  { id: 'loop', name: 'Feedback Loop', icon: LoopSignIcon, color: '#8B5CF6', badgeBg: 'bg-purple-600', badgeText: 'text-white', defaultTitle: 'ITERATION LOOP', defaultBody: 'Continuous feedback cycle from telemetry to product backlog.' },
  { id: 'experiment', name: 'A/B Experiment', icon: ExperimentSignIcon, color: '#EC4899', badgeBg: 'bg-pink-600', badgeText: 'text-white', defaultTitle: 'LAB EXPERIMENT', defaultBody: 'Hypothesis testing with control and variant user cohorts.' },
  { id: 'bug', name: 'Bug Defect', icon: BugSignIcon, color: '#EF4444', badgeBg: 'bg-red-500', badgeText: 'text-white', defaultTitle: 'BUG REPORT', defaultBody: 'Known defect or edge-case behavior undergoing investigation.' },
  { id: 'hotfix', name: 'Hotfix Flame', icon: FlameHotfixSignIcon, color: '#F97316', badgeBg: 'bg-orange-600', badgeText: 'text-white', defaultTitle: 'PRODUCTION HOTFIX', defaultBody: 'Emergency patch deployed directly to production cluster.' },
  { id: 'milestone', name: 'Milestone Flag', icon: MilestoneSignIcon, color: '#3B82F6', badgeBg: 'bg-blue-600', badgeText: 'text-white', defaultTitle: 'SPRINT MILESTONE', defaultBody: 'Major checkpoint delivering key platform capabilities.' },
  { id: 'cone', name: 'Safety Cone', icon: TrafficConeSignIcon, color: '#F97316', badgeBg: 'bg-orange-500', badgeText: 'text-white', defaultTitle: 'HAZARD ZONE', defaultBody: 'Refactoring area: unstable API contracts under migration.' },
  { id: 'heartbeat', name: 'Heartbeat Health', icon: HeartbeatSignIcon, color: '#10B981', badgeBg: 'bg-emerald-600', badgeText: 'text-white', defaultTitle: 'SYSTEM HEALTH', defaultBody: '99.99% uptime, zero deadlocks, all agent workers active.' },
  { id: 'secret', name: 'API Secret Key', icon: KeySecretSignIcon, color: '#EAB308', badgeBg: 'bg-amber-600', badgeText: 'text-white', defaultTitle: 'SECRET / CREDENTIALS', defaultBody: 'Encrypted environment variables and service credentials.' },
  { id: 'compass', name: 'Architecture North', icon: CompassSignIcon, color: '#6366F1', badgeBg: 'bg-indigo-600', badgeText: 'text-white', defaultTitle: 'ARCHITECTURE NORTH', defaultBody: 'Long-term strategic architectural vision and design principles.' },
  { id: 'alert', name: 'Incident Alert', icon: BellAlertSignIcon, color: '#F59E0B', badgeBg: 'bg-amber-500', badgeText: 'text-black', defaultTitle: 'INCIDENT ALERT', defaultBody: 'Telemetry threshold exceeded: triage required.' },
  { id: 'branch', name: 'Git Branch', icon: GitBranchSignIcon, color: '#8B5CF6', badgeBg: 'bg-purple-600', badgeText: 'text-white', defaultTitle: 'FEATURE BRANCH', defaultBody: 'Isolated branch development with peer code review.' },
  { id: 'database_sync', name: 'Database Sync', icon: DatabaseAlertSignIcon, color: '#3B82F6', badgeBg: 'bg-blue-600', badgeText: 'text-white', defaultTitle: 'DB REPLICATION', defaultBody: 'Multi-region replica synchronization and failover plan.' },
  { id: 'coffee', name: 'Team Retro', icon: CoffeeBreakSignIcon, color: '#D97706', badgeBg: 'bg-amber-700', badgeText: 'text-white', defaultTitle: 'TEAM RETRO', defaultBody: 'Sprint retrospective reflection: what worked and what to improve.' },
  { id: 'lock', name: 'Vault Security', icon: LockSignIcon, color: '#0284C7', badgeBg: 'bg-sky-700', badgeText: 'text-white', defaultTitle: 'VAULT ACCESS', defaultBody: 'Protected area requiring multi-factor auth and role grants.' },
];

export const AVAILABLE_STAMPS = [
  { id: 'APPROVED', label: 'APPROVED', color: 'border-emerald-600 text-emerald-700 bg-emerald-50' },
  { id: 'MVP', label: 'MVP RELEASE', color: 'border-indigo-600 text-indigo-700 bg-indigo-50' },
  { id: 'URGENT', label: 'URGENT PRIORITY', color: 'border-red-600 text-red-700 bg-red-50' },
  { id: 'WIP', label: 'WORK IN PROGRESS', color: 'border-amber-600 text-amber-800 bg-amber-50' },
  { id: 'HIGH IMPACT', label: 'HIGH IMPACT', color: 'border-orange-600 text-orange-700 bg-orange-50' },
  { id: 'SECURITY RISK', label: 'SECURITY RISK', color: 'border-rose-700 text-rose-800 bg-rose-50' },
  { id: 'DEPRECATED', label: 'DEPRECATED', color: 'border-gray-500 text-gray-700 bg-gray-100 line-through' },
];

export function resolveBrandOrSignIcon(query: string): React.ComponentType<IconProps> | null {
  const q = query.toLowerCase();
  
  // 1. Check signs
  for (const s of AVAILABLE_SIGNS) {
    if (q.includes(s.id) || q.includes(s.name.toLowerCase())) return s.icon;
  }
  
  // 2. Check logos
  for (const l of AVAILABLE_LOGOS) {
    if (q.includes(l.id) || q.includes(l.name.toLowerCase())) return l.icon;
  }

  // 3. Fallbacks
  if (q.includes('s3')) return AWSS3Icon;
  if (q.includes('lambda')) return AWSLambdaIcon;
  if (q.includes('dynamodb')) return AWSDynamoDBIcon;
  if (q.includes('rds')) return AWSRDSIcon;
  if (q.includes('cloudfront')) return AWSCloudFrontIcon;
  if (q.includes('sqs')) return AWSSQSIcon;
  if (q.includes('sns')) return AWSSNSIcon;
  if (q.includes('ecs')) return AWSECSIcon;
  if (q.includes('cloudwatch')) return AWSCloudWatchIcon;
  if (q.includes('api gateway')) return AWSAPIGatewayIcon;
  if (q.includes('iam')) return AWSIAMIcon;
  if (q.includes('bedrock')) return AWSBedrockIcon;
  if (q.includes('chroma')) return ChromaDBIcon;
  if (q.includes('qdrant')) return QdrantIcon;
  if (q.includes('ollama')) return OllamaIcon;
  if (q.includes('groq')) return GroqIcon;
  if (q.includes('mistral')) return MistralAIIcon;
  if (q.includes('perplexity')) return PerplexityIcon;
  if (q.includes('stripe') || q.includes('billing')) return StripeIcon;
  if (q.includes('sentry')) return SentryIcon;
  if (q.includes('twilio')) return TwilioIcon;
  if (q.includes('pinecone')) return PineconeIcon;
  if (q.includes('weaviate')) return WeaviateIcon;
  if (q.includes('langchain')) return LangChainIcon;
  if (q.includes('zapier')) return ZapierIcon;
  if (q.includes('airtable')) return AirtableIcon;
  if (q.includes('segment')) return SegmentIcon;
  if (q.includes('mixpanel')) return MixpanelIcon;
  if (q.includes('intercom')) return IntercomIcon;
  if (q.includes('loom')) return LoomIcon;
  if (q.includes('upstash')) return UpstashIcon;
  if (q.includes('turborepo') || q.includes('turbo')) return TurborepoIcon;
  if (q.includes('okta')) return OktaIcon;
  if (q.includes('netlify')) return NetlifyIcon;
  if (q.includes('aws') || q.includes('amazon')) return AWSIcon;
  if (q.includes('gcp') || q.includes('google cloud')) return GoogleCloudIcon;
  if (q.includes('azure')) return AzureIcon;
  if (q.includes('cloudflare')) return CloudflareIcon;
  if (q.includes('react')) return ReactIcon;
  if (q.includes('tailwind')) return TailwindIcon;
  if (q.includes('openai') || q.includes('gpt') || q.includes('chatgpt')) return OpenAIIcon;
  if (q.includes('gemini')) return GeminiIcon;
  if (q.includes('claude') || q.includes('anthropic')) return AnthropicIcon;
  if (q.includes('deepseek')) return DeepSeekIcon;
  if (q.includes('copilot')) return CopilotIcon;
  if (q.includes('firebase') || q.includes('firestore')) return FirebaseIcon;
  if (q.includes('github')) return GitHubIcon;
  if (q.includes('gitlab')) return GitLabIcon;
  if (q.includes('next.js') || q.includes('nextjs')) return NextjsIcon;
  if (q.includes('postgres') || q.includes('postgresql') || q.includes('sql')) return PostgreSQLIcon;
  if (q.includes('mysql')) return MySQLIcon;
  if (q.includes('mongo')) return MongoDBIcon;
  if (q.includes('redis')) return RedisIcon;
  if (q.includes('docker') || q.includes('container')) return DockerIcon;
  if (q.includes('kubernetes') || q.includes('k8s')) return KubernetesIcon;
  if (q.includes('python')) return PythonIcon;
  if (q.includes('rust')) return RustIcon;
  if (q.includes('golang') || q.includes('go')) return GoIcon;
  if (q.includes('typescript') || q.includes('ts')) return TypeScriptIcon;
  if (q.includes('javascript') || q.includes('js')) return JavaScriptIcon;
  if (q.includes('node')) return NodeJsIcon;
  if (q.includes('bun')) return BunJsIcon;
  if (q.includes('deno')) return DenoIcon;
  if (q.includes('graphql')) return GraphQLIcon;
  if (q.includes('trpc')) return TRPCIcon;
  if (q.includes('fastapi')) return FastAPIIcon;
  if (q.includes('django')) return DjangoIcon;
  if (q.includes('nestjs')) return NestJSIcon;
  if (q.includes('express')) return ExpressJsIcon;
  if (q.includes('slack')) return SlackIcon;
  if (q.includes('discord')) return DiscordIcon;
  if (q.includes('figma')) return FigmaIcon;
  if (q.includes('linear')) return LinearIcon;
  if (q.includes('notion')) return NotionIcon;
  if (q.includes('auth0')) return Auth0Icon;
  if (q.includes('vercel')) return VercelIcon;
  if (q.includes('supabase')) return SupabaseIcon;
  if (q.includes('convex')) return ConvexIcon;
  if (q.includes('prisma')) return PrismaIcon;
  if (q.includes('shadcn')) return ShadcnUIIcon;
  if (q.includes('astro')) return AstroIcon;
  if (q.includes('svelte')) return SvelteJSIcon;
  if (q.includes('vue')) return VueJsIcon;
  if (q.includes('angular')) return AngularIcon;
  if (q.includes('flutter')) return FlutterIcon;
  if (q.includes('kotlin')) return KotlinIcon;
  if (q.includes('swift')) return SwiftIcon;
  if (q.includes('java')) return JavaIcon;
  if (q.includes('c++') || q.includes('cpp')) return CPlusPlusIcon;
  if (q.includes('c#') || q.includes('csharp')) return CSharpIcon;
  if (q.includes('solidity')) return SolidityIcon;
  if (q.includes('terraform')) return TerraformIcon;
  if (q.includes('kafka')) return KafkaIcon;
  if (q.includes('elastic')) return ElasticIcon;
  if (q.includes('linux')) return LinuxIcon;
  if (q.includes('n8n')) return N8nIcon;
  if (q.includes('posthog')) return PostHogIcon;
  if (q.includes('postman')) return PostmanIcon;
  if (q.includes('insomnia')) return InsomniaIcon;
  if (q.includes('playwright')) return PlaywrightIcon;
  if (q.includes('cypress')) return CypressIcon;
  if (q.includes('jest')) return JestIcon;
  if (q.includes('storybook')) return StorybookIcon;
  if (q.includes('railway')) return RailwayIcon;
  if (q.includes('render')) return RenderIcon;
  if (q.includes('fly.io') || q.includes('flyio')) return FlyIoIcon;
  if (q.includes('digitalocean')) return DigitalOceanIcon;
  if (q.includes('heroku')) return HerokuIcon;
  if (q.includes('appwrite')) return AppwriteIcon;
  if (q.includes('huggingface') || q.includes('hugging face')) return HuggingFaceIcon;
  if (q.includes('resend')) return ResendIcon;
  if (q.includes('vscode')) return VSCodeIcon;
  if (q.includes('clerk')) return ClerkIcon;
  if (q.includes('datadog')) return DatadogIcon;
  if (q.includes('grafana')) return GrafanaIcon;
  if (q.includes('webmcp')) return WebMCPIcon;
  if (q.includes('warn') || q.includes('hazard')) return WarningSignIcon;
  if (q.includes('stop') || q.includes('block')) return StopSignIcon;
  if (q.includes('launch') || q.includes('ship')) return LaunchSignIcon;
  if (q.includes('goal') || q.includes('target')) return GoalSignIcon;
  if (q.includes('idea') || q.includes('bulb')) return IdeaSignIcon;
  if (q.includes('bug') || q.includes('defect')) return BugSignIcon;
  if (q.includes('hotfix') || q.includes('fire') || q.includes('flame')) return FlameHotfixSignIcon;
  if (q.includes('milestone') || q.includes('flag')) return MilestoneSignIcon;
  if (q.includes('cone') || q.includes('traffic')) return TrafficConeSignIcon;
  if (q.includes('health') || q.includes('pulse') || q.includes('heartbeat')) return HeartbeatSignIcon;
  if (q.includes('secret') || q.includes('key')) return KeySecretSignIcon;
  if (q.includes('compass') || q.includes('north')) return CompassSignIcon;
  if (q.includes('bell') || q.includes('alert')) return BellAlertSignIcon;
  if (q.includes('branch') || q.includes('git')) return GitBranchSignIcon;
  if (q.includes('coffee') || q.includes('retro')) return CoffeeBreakSignIcon;
  if (q.includes('lock') || q.includes('vault')) return LockSignIcon;

  // Check 1,876 Gilbarbara Logos catalog
  const cleanQ = q.replace(/^gil-/, '');
  const gilMatch = GILBARBARA_LOGOS.find(
    g => g.id === cleanQ || g.file === cleanQ || g.file.replace('.svg', '') === cleanQ || g.name.toLowerCase() === cleanQ
  );
  if (gilMatch) {
    return (props: IconProps) => (
      <DynamicGilbarbaraIcon file={gilMatch.file} size={props.size || 24} className={props.className} />
    );
  }

  return null;
}
