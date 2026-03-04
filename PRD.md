# Legalese GPT — Product Requirements Document

**Version:** 2.0.0
**Date:** March 4, 2026
**Status:** Pre-Launch

---

## 1. Product Overview

Legalese GPT is a mobile-first AI-powered legal document simplifier. Users upload, paste, or scan legal documents and receive plain-English summaries, section-by-section risk analysis, key date extraction, and the ability to ask follow-up questions via AI chat — all without needing a law degree.

### Target Audience
- Consumers signing leases, employment contracts, NDAs
- Small business owners reviewing vendor/service agreements
- Freelancers evaluating client contracts
- Anyone confronted with Terms of Service or Privacy Policies

---

## 2. Feature List

### P0 — Core (Launch Requirements)

| # | Feature | Status |
|---|---------|--------|
| 1 | **Three input methods** — Upload file, Paste text, Camera OCR | ✅ Complete |
| 2 | **AI text simplification** — 3 complexity levels (Simple / Moderate / Detailed) | ✅ Complete |
| 3 | **AI contract analysis** — Section-by-section with risk levels (low/medium/high) | ✅ Complete |
| 4 | **Legal document validation** — Rejects non-legal text before processing | ✅ Complete |
| 5 | **Document history** — Persisted via AsyncStorage with search | ✅ Complete |
| 6 | **Saved/bookmarked documents** — Separate tab with search | ✅ Complete |
| 7 | **Results screen** — Tabs for Simplified, Original, and AI Analysis views | ✅ Complete |
| 8 | **Authentication** — Clerk sign-in/sign-up with guest mode fallback | ✅ Complete |
| 9 | **Onboarding flow** — 3-step first-launch walkthrough | ✅ Complete |
| 10 | **Paywall & subscription gating** — RevenueCat-ready premium tier | ✅ Complete |
| 11 | **Rate limiting** — 5 scans/day free, 1/minute cooldown | ✅ Complete |
| 12 | **Dark mode + accessibility** — Theme toggle, font size, high contrast, TTS toggle | ✅ Complete |
| 13 | **Legal disclaimer & privacy policy** — Dedicated screens | ✅ Complete |

### P1 — High Impact (Retention & Monetization)

| # | Feature | Status |
|---|---------|--------|
| 14 | **Ask AI follow-up questions** — Chat interface per document | ✅ Complete |
| 15 | **Export document** — Share as .txt file via native share sheet | ✅ Complete |
| 16 | **Key dates & deadlines extraction** — AI extracts dates, displays in analysis tab | ✅ Complete |
| 17 | **Document comparison view** — Side-by-side or toggle original vs. simplified | ✅ Complete |
| 18 | **Share & copy** — Native share sheet + clipboard copy | ✅ Complete |
| 19 | **AI glossary** — Searchable legal term definitions | ✅ Complete |

### P2 — Competitive Differentiators (Nice-to-Have)

| # | Feature | Status |
|---|---------|--------|
| 20 | Multi-language document support | ✅ Complete |
| 21 | In-document annotation / highlighting | ✅ Complete |

### P3 — Future Roadmap

| # | Feature | Status |
|---|---------|--------|
| 22 | Collaborative document review (share with others) | 🔲 Planned |
| 23 | Legal professional connect marketplace | 🔲 Planned |
| 24 | Push notification reminders for contract deadlines | 🔲 Planned |

---

## 3. User Stories

### Onboarding
- **US-1:** As a new user, I see a 3-step walkthrough explaining the app's value before reaching the home screen, so I understand how to use it.
- **US-2:** As a returning user, I skip onboarding and land directly on the home tab.

### Document Input
- **US-3:** As a user, I can upload a PDF, DOC, DOCX, TXT, or image file from my device.
- **US-4:** As a user, I can paste legal text directly into a text field.
- **US-5:** As a user, I can scan a paper document with my camera and have text extracted via OCR.

### AI Processing
- **US-6:** As a user, I receive a plain-English simplified version of my legal document within seconds.
- **US-7:** As a user, I see a section-by-section risk analysis with confidence scores and color-coded risk levels.
- **US-8:** As a user, I see key dates and deadlines extracted from my document.
- **US-9:** As a user, I can choose between 3 simplification levels (Simple, Moderate, Detailed).

### Follow-up & Understanding
- **US-10:** As a user, I can chat with the AI about my document to ask specific questions like "Can I terminate early?" or "What are the penalties?"
- **US-11:** As a user, I can look up legal terms in the AI-powered glossary.

### Document Management
- **US-12:** As a user, I can view my processing history with search.
- **US-13:** As a user, I can save/bookmark documents for quick access.
- **US-14:** As a user, I can export a complete document summary as a .txt file.
- **US-15:** As a user, I can compare original vs. simplified text side-by-side or via toggle.
- **US-16:** As a user, I can share document results via the native share sheet.

### Monetization
- **US-17:** As a free user, I get 5 document scans per day, 2 exports, and 10 AI chat messages.
- **US-18:** As a free user who hits a limit, I see a paywall screen explaining premium benefits.
- **US-19:** As a premium user, I have unlimited scans, exports, chat messages, and priority processing.

### Settings
- **US-20:** As a user, I can toggle dark mode, adjust font size, and set my preferred simplification level.
- **US-21:** As a user, I can view my subscription status and upgrade from the profile screen.

---

## 4. Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo SDK 53 + React Native 0.79 |
| Navigation | Expo Router v5 (file-based) |
| State Management | Zustand v5 + persist middleware |
| Local Storage | AsyncStorage |
| Authentication | Clerk (`@clerk/clerk-expo`) with guest fallback |
| AI API | Custom LLM endpoint (`toolkit.rork.com`) |
| OCR | ML Kit Text Recognition (native), mock fallback (web) |
| Icons | `lucide-react-native` |
| Camera | `expo-camera` |
| File Handling | `expo-document-picker`, `expo-file-system`, `expo-image-picker` |
| Sharing | `expo-sharing`, React Native `Share` API |
| Secure Storage | `expo-secure-store` (token cache) |
| Animations | `react-native-reanimated` |
| Subscription (planned) | RevenueCat — interface ready in `useSubscriptionStore` |

### Key Architecture Decisions
- **No Firebase dependency** — all data stored locally via AsyncStorage.
- **Expo Go compatible** — no custom native modules beyond what Expo provides.
- **RevenueCat-ready** — `useSubscriptionStore` provides `canScan()`, `canExport()`, `canChat()` gates. Replace stub `restorePurchases()` with RevenueCat SDK when building with EAS.
- **Client-side rate limiting** — enforced via AsyncStorage counters. Must add server-side enforcement before production launch.

---

## 5. Monetization Strategy

### Free Tier
- 5 document scans per day
- 2 document exports per day
- 10 AI chat messages per day
- Basic key dates extraction
- Full AI analysis on scanned documents

### Premium Tier — $4.99/month
- Unlimited document scans
- Unlimited exports
- Unlimited AI chat messages
- Full key dates extraction
- Document comparison view
- Priority AI processing
- No ads (future)

### Integration
- `useSubscriptionStore.ts` manages subscription state.
- All premium features wrapped with `canScan()`, `canExport()`, `canChat()` checks.
- Paywall screen at `app/paywall.tsx` with feature comparison and subscribe CTA.
- Restore purchases placeholder ready for RevenueCat.

---

## 6. Screen Map

```
/ (Root Layout)
├── /onboarding          — First-launch walkthrough
├── /(tabs)
│   ├── /                — Home (Simplify tab)
│   ├── /history         — Document history
│   ├── /saved           — Bookmarked documents
│   └── /profile         — Settings & account
├── /upload              — File upload flow
├── /paste               — Text paste flow
├── /camera              — Camera OCR flow
├── /results/[id]        — Document results (Simplified / Original / Analysis)
├── /chat/[id]           — AI follow-up chat per document
├── /compare/[id]        — Side-by-side comparison view
├── /paywall             — Premium subscription screen
├── /glossary            — AI legal glossary
├── /modal               — Auth sign-in/sign-up
├── /disclaimer          — Legal disclaimer
└── /privacy-policy      — Privacy policy
```

---

## 7. Launch Checklist

- [x] All P0 features implemented and functional
- [x] All P1 features implemented and functional
- [x] Onboarding flow for first-time users
- [x] Paywall screen with feature comparison
- [x] Subscription gating on premium features
- [x] Dark mode and accessibility support
- [x] Legal disclaimer and privacy policy screens
- [x] Error handling and loading states on all flows
- [x] TypeScript compiles with zero errors
- [ ] Replace client-side rate limiting with server-side enforcement
- [ ] Integrate RevenueCat SDK (requires EAS build)
- [ ] Add App Store / Play Store metadata and screenshots
- [ ] Conduct security audit on API endpoint usage
- [ ] Add analytics (Mixpanel / Amplitude)
- [ ] Beta test with 50+ users
- [ ] Submit to App Store and Google Play

---

## 8. File Structure (New & Modified Files)

### New Files
- `app/onboarding.tsx` — Onboarding walkthrough
- `app/paywall.tsx` — Premium subscription screen
- `app/chat/[id].tsx` — AI follow-up chat
- `app/compare/[id].tsx` — Document comparison view
- `hooks/useSubscriptionStore.ts` — Subscription state management
- `utils/exportService.ts` — Document export functionality
- `PRD.md` — This document

### Modified Files
- `hooks/useThemeStore.ts` — Added `hasOnboarded` flag
- `hooks/useDocumentStore.ts` — Added `KeyDate` interface, `keyDates` field, `updateDocumentKeyDates`
- `utils/aiService.ts` — Added `extractKeyDates()` function
- `app/_layout.tsx` — Registered new screens, added onboarding redirect
- `app/results/[id].tsx` — Added Chat, Export, Compare, Key Dates, Upgrade buttons
- `app/(tabs)/profile.tsx` — Added Subscription section with upgrade CTA
