# Security Policy — Boardify

## 🛡️ Supported Versions

We provide security updates and patches for the following versions of Boardify:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## 🔒 Security Architecture & WebMCP Sandboxing

Boardify is built natively for the **WebMCP standard** (`document.modelContext.registerTool`). We treat agent interaction and security with strict isolation:

### 1. In-Browser Model Context Isolation
- All 12 WebMCP tools execute inside the browser's origin boundary.
- Tools do **not** have access to arbitrary local system shell commands or filesystem access beyond standard browser sandboxing.
- Destructive canvas operations (e.g. `clear_canvas`) are protected with parameter confirmation flags (`{ confirm: true }`).

### 2. Client-Side API Key Privacy
- User-provided API keys (OpenAI, Gemini, Anthropic) are stored strictly in `window.localStorage` within the user's browser origin.
- Keys are **never** proxied, logged, or transmitted to any third-party intermediate backend server.

### 3. Real-Time Collaboration & Firestore Rules
- State syncing with Firebase Firestore enforces schema typing on node coordinates, author tags, and connection wire edges.
- Unsanitized HTML/script payloads inside node titles and bodies are sanitized and escaped prior to rendering.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within Boardify, please do **not** file a public GitHub issue. 

Please follow these steps:
1. Email your report directly to the maintainers or open a **Private Vulnerability Report** via GitHub Security Advisories.
2. Include a detailed description of the vulnerability, reproduction steps, and potential exploit vectors.
3. We will acknowledge receipt of your report within **48 hours** and provide a resolution timeline.

Thank you for keeping Boardify and the open WebMCP standard safe!
