import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boardify — The Spatial Whiteboard Where Agents Pull Up a Chair',
  description:
    'Boardify is an open WebMCP-powered spatial collaborative canvas. AI browser agents in ChatGPT and Google Chrome read, build, connect, and organize thoughts in real time alongside humans.',
  keywords: [
    'WebMCP',
    'AI Whiteboard',
    'Spatial Canvas',
    'ChatGPT in-app browser',
    'document.modelContext',
    'AI Agents',
    'Multiplayer Collaborative Canvas',
    'Open Source',
  ],
  authors: [{ name: 'Boardify Team' }],
  openGraph: {
    title: 'Boardify — The Spatial Whiteboard Where Agents Pull Up a Chair',
    description:
      'The premier WebMCP spatial whiteboard where humans and AI browser agents co-create on a shared infinite canvas.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..700&family=Kalam:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/json"
          id="agent-guide"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              app: 'Boardify',
              protocol: 'WebMCP (document.modelContext)',
              summary:
                'A shared infinite whiteboard. 12 structured tools are exposed on document.modelContext when opened in a WebMCP browser.',
              suggested_prompts: [
                'Read my canvas state and expand the selected idea with 4 actionable sub-branches.',
                'Critique the board for logical gaps and highlight any orphan notes.',
                'Organize these sticky notes into structured cluster columns and export to Markdown.',
              ],
            }),
          }}
        />
      </head>
      <body className="antialiased selection:bg-[#E24E1B]/20 bg-[#F4EFE4] text-[#1D1A16] min-h-screen">
        {children}
      </body>
    </html>
  );
}
