# Legalese GPT

AI-powered legal document simplifier. Upload, paste, or scan legal documents and get plain-English summaries, section-by-section risk analysis, key date extraction, and AI follow-up chat — no law degree required.

## Features

**Document Input**
- Upload PDF, DOC, DOCX, TXT, or image files
- Paste text directly
- Scan paper documents via camera OCR

**AI Processing**
- Plain-English simplification at 3 complexity levels (Simple / Moderate / Detailed)
- Section-by-section contract analysis with color-coded risk levels
- Key dates and deadlines extraction
- Legal document validation (rejects non-legal text)

**Follow-up & Understanding**
- Chat with AI about your document (e.g. "Can I terminate early?")
- Searchable AI-powered legal glossary

**Document Management**
- Document history with search (persisted via AsyncStorage)
- Bookmarked/saved documents
- Side-by-side or toggle comparison of original vs. simplified text
- Export summaries as `.txt` via native share sheet

**Account & Monetization**
- Clerk authentication with guest mode fallback
- Free tier: 5 scans/day, 2 exports/day, 10 AI chat messages/day
- Premium tier ($4.99/mo): unlimited usage, priority processing
- RevenueCat-ready subscription gating

**Accessibility**
- Dark mode with theme toggle
- Adjustable font size and high-contrast mode
- Text-to-speech toggle
- 3-step onboarding walkthrough for first-time users

## Tech Stack

- **Framework** — Expo SDK 53 + React Native 0.79
- **Navigation** — Expo Router v5 (file-based routing)
- **State** — Zustand v5 with persist middleware
- **Storage** — AsyncStorage (local), Expo SecureStore (token cache)
- **Auth** — Clerk (`@clerk/clerk-expo`) with guest fallback
- **AI** — Custom LLM endpoint (`toolkit.rork.com`)
- **OCR** — ML Kit Text Recognition (native), mock fallback (web)
- **Camera** — `expo-camera`
- **Files** — `expo-document-picker`, `expo-file-system`, `expo-image-picker`
- **Sharing** — `expo-sharing`, React Native `Share` API
- **Icons** — `lucide-react-native`
- **Animations** — `react-native-reanimated`
- **Subscription** — RevenueCat (interface ready in `useSubscriptionStore`)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npx expo`)
- iOS Simulator, Android Emulator, or [Expo Go](https://expo.dev/go) on a physical device

### Installation

```bash
git clone <repo-url>
cd LegaleseGPT
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=<your-clerk-publishable-key>
EXPO_PUBLIC_RORK_API_BASE_URL=<your-api-base-url>
```

### Running the App

```bash
# Start with tunnel (default)
npm start

# Start for web
npm run start-web
```

Then open the app in Expo Go, an emulator, or a web browser.

### Web Deployment

The project includes a `vercel.json` for deploying the web build to Vercel:

```bash
expo export -p web
```

## Project Structure

```
LegaleseGPT/
├── app/                        # Expo Router screens
│   ├── (tabs)/                 # Tab navigator
│   │   ├── index.tsx           #   Home (Simplify tab)
│   │   ├── history.tsx         #   Document history
│   │   ├── saved.tsx           #   Bookmarked documents
│   │   └── profile.tsx         #   Settings & account
│   ├── _layout.tsx             # Root layout (Clerk provider, onboarding redirect)
│   ├── onboarding.tsx          # First-launch walkthrough
│   ├── upload.tsx              # File upload flow
│   ├── paste.tsx               # Text paste flow
│   ├── camera.tsx              # Camera OCR flow
│   ├── results/[id].tsx        # Results (Simplified / Original / Analysis)
│   ├── chat/[id].tsx           # AI follow-up chat
│   ├── compare/[id].tsx        # Side-by-side comparison
│   ├── paywall.tsx             # Premium subscription screen
│   ├── glossary.tsx            # AI legal glossary
│   ├── modal.tsx               # Auth sign-in/sign-up
│   ├── disclaimer.tsx          # Legal disclaimer
│   └── privacy-policy.tsx      # Privacy policy
├── components/                 # Reusable UI components
├── constants/                  # Colors, mock data
├── hooks/                      # Zustand stores
│   ├── useDocumentStore.ts     #   Document history & saved state
│   ├── useSubscriptionStore.ts #   Subscription & rate-limit gates
│   └── useThemeStore.ts        #   Theme, font size, onboarding flag
├── utils/                      # Services & helpers
│   ├── aiService.ts            #   AI API calls, rate limiting, analysis
│   ├── exportService.ts        #   .txt export
│   ├── ocrService.ts           #   Camera OCR via ML Kit
│   ├── documentProcessing.ts   #   File parsing helpers
│   ├── documentUtils.ts        #   Document utility functions
│   ├── authConfig.ts           #   Clerk auth config
│   └── clerkHelpers.ts         #   Clerk provider helpers
├── assets/                     # Images, icons, fonts
├── PRD.md                      # Product Requirements Document
├── app.json                    # Expo config
├── package.json
├── tsconfig.json
└── vercel.json                 # Vercel web deployment config
```

## Architecture Notes

- **No Firebase** — all data is stored locally via AsyncStorage.
- **Expo Go compatible** — no custom native modules beyond what Expo provides.
- **Client-side rate limiting** — enforced via AsyncStorage counters. Server-side enforcement must be added before production.
- **RevenueCat-ready** — `useSubscriptionStore` exposes `canScan()`, `canExport()`, `canChat()` gates. Replace the stub `restorePurchases()` with the RevenueCat SDK when building with EAS.

## License

Proprietary. All rights reserved.
