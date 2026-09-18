# SME Ready — Telegram Mini App concept (v0.1)

A **runnable, front-end-only** bilingual (English / Khmer) prototype inspired by the SME Ready project idea. Built with React, TypeScript (strict), Vite and Telegram's official Mini App JavaScript bridge. **This is a concept demo, not a banking, credit-scoring, document-processing, or loan application service.**

## Try the prototype locally

1. Install Node.js 20.19+ or 22.12+ and npm.
2. In a terminal, run:
   ```bash
   cd sme-ready-telegram-mini-app
   npm install
   npm run dev
   ```
3. Open the local URL Vite prints (usually `http://localhost:5173`). This browser mode works without a Telegram bot.
4. The opening example is **fictional**. Select **Start fresh** to clear it, then add your business details under **Profile**, record transactions under **Records**, review **Readiness**, and use **Print / save PDF** under **Profile**.
5. Run `npm test` and `npm run build` to verify core calculations and production compilation.

## What actually works

- Five interactive tabs: Home, Records, Readiness, Profile, Learn.
- English / Khmer language toggle.
- Editable business profile and manually entered sales/expense transactions; KHR and USD kept **separate** (no fabricated exchange rate). Current-month totals only; difference is not profit.
- Select up to five PNG/JPG/WebP/PDF supporting files, each at most 5 MiB. They are accessible via temporary in-browser object URLs. **There is no OCR, upload, server storage, lender connection, or verification.** Do not upload sensitive identity documents.
- Illustrative, transparent 100-point preparation checklist: business name/activity (15), location/operating history (10), three income records (20), three expense records (15), one supporting record (10), identity document available (10), account or mobile-money history available (20), with business registration as an unscored optional item. Identity and registration are marked as available **without uploading them**. The optional registration item does not lower the preparation score for informal businesses. Check requirements with each lender; the scoring weights are design examples, **not validated underwriting criteria**.
- Owner-controlled textual summary: copy to clipboard or **Print / save PDF** using the browser's print dialog.
- Three introductory financial-learning topics and reset / reload-fictional-demo actions.
- Telegram `ready`, `expand`, and back-button behavior if launched inside Telegram. Browser fallback still works.

**No account, backend, persistent storage, automatic image reading, bank integration, lender matching, credit score, loan approval, or actual PDF generation service is implemented.** The print button uses the browser's print-to-PDF capability. Data is held in memory; reloading the page clears entries and attachments and loads the clearly labeled fictional example again. The code does not transmit user documents to a server.

## Run inside Telegram

1. Deploy the built static site to a host that serves it over **HTTPS**. Run `npm run build`; publish the contents of `dist/` to your HTTPS host (for example, use its static-site deployment instructions).
2. In Telegram, open **@BotFather**, issue `/newbot`, and create a bot. Keep its bot token private. **The frontend does not need or use a bot token.**
3. To launch the site from the bot's chat, use BotFather `/setmenubutton`, select your bot, enter your deployed `https://...` URL, and set the button text to `Open SME Ready`.
4. Optionally configure your bot's **Main Mini App** in BotFather so a Launch App button appears on its profile. Test the app inside Telegram on Android, iOS and Desktop; verify the Telegram back button navigates home from secondary tabs.
5. When users start using real records, build a secure backend first. Do **not** deploy the session-only concept as a production financial service.

Official setup references: [Telegram Mini Apps](https://core.telegram.org/bots/webapps) and [BotFather](https://t.me/BotFather).

## Privacy and production work before a real pilot

1. Validate Telegram `initData` **on your server** and enforce freshness, session management and authorization. Never trust `initDataUnsafe` as an authentication proof or embed the bot token in frontend code. The current prototype does not authenticate users.
2. Define consent, retention/deletion, per-user access restrictions and encryption for business records and photos; limit file types/sizes, scan untrusted uploads, and avoid collecting national ID images unless truly needed.
3. Integrate OCR only after securing consent and build a human correction step with a reviewable audit trail. Do not treat OCR output as verified financial facts.
4. Specify a transparent, validated readiness *preparation* rubric with Cambodian SMEs and participating lenders. Never market this illustrative checklist as a credit score or approval predictor.
5. Research local legal, privacy, consumer-protection and financial-partnership requirements with qualified Cambodian advisers and the relevant institutions before public rollout.
6. Add accessibility testing with Khmer speakers, low-bandwidth testing, error recovery, secure export and a data deletion flow.

## Files

```text
index.html          Telegram bridge and app mount
src/App.tsx         Five screens and interactive prototype state
src/model.ts        Pure checklist, sample data, money totals and profile text
src/types.ts        Strict TypeScript data model
src/telegram.ts     Optional Telegram Mini App bridge
src/styles.css      Responsive mobile-first design and print stylesheet
tests/model.test.ts Unit tests for score and currency-separated calculations
```

## Suggested pitch demo (2–3 minutes)

1. Open Home and point out that the example is fictional.
2. Open Records, add a cash sale, and show the cash-flow numbers update.
3. Select a supporting cashbook image and explain that **real OCR would be a future integration**, not part of this demo.
4. Open Readiness to show exactly why the illustrative checklist changed.
5. Open Profile, edit a business detail, and use Print / save PDF to demonstrate the owner-controlled lender summary.
6. Finish in Learn, emphasizing responsible borrowing and that lender eligibility is independent from the demo score.
