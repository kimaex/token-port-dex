## Settings Page Redesign

Redesign the Settings page with a modern Web3/crypto mobile-first layout. Existing Referral modal and Logout button stay untouched — only the sections above them change.

### New Layout (top → bottom)

**1. Profile Card (top center)**
- Circular avatar with camera-icon overlay (bottom-right) to upload
- Username: `jibkid`
- Verification badge: `Tier 3 Verified` (green pill)
- `Edit Profile` button (opens existing Profile & KYC modal)

**2. Personal Information Card**
Two-column list rows (label left, value right, chevron `>`):
- Full Name → Jibrin Ibrahim
- Nickname → jibkid
- Gender → Male
- Date of Birth → //2010
- Email → i***@gmail.com (masked)

Tapping any row opens the existing Profile modal.

**3. Grouped Setting Cards** — each group titled, rows inside share one card:

- **Security**: Change Password · Biometric Login · Two-Factor Authentication · Recovery Phrase Backup
- **Verification**: KYC Status · Identity Verification
- **Wallet Settings**: Manage Wallets · Connected Accounts · Export Wallet · Transaction History
- **Preferences**: Language · Currency · Theme (Light/Dark toggle switch) · Notifications
- **Support**: Help Center · Contact Support · Terms & Conditions · Privacy Policy

Icons per row (Lucide), chevron on right, switch on Theme row.

**4. Referral section** — unchanged (existing card + modal wired to `showReferralModal`).

**5. Logout button** — unchanged (bottom-right, destructive style, clears localStorage → `/auth`).

### Wiring
- Language → opens existing language modal
- Currency → opens existing currency modal
- Theme → toggles `darkMode` (existing handler)
- Connected Accounts → opens existing connected dApps modal
- Profile rows / Edit Profile / KYC Status / Identity Verification → open existing Profile & KYC modal
- Contact Support / Help Center → open existing customer care modal
- Remaining rows (Change Password, Biometric, 2FA, Recovery Phrase, Manage Wallets, Export Wallet, Transaction History, Notifications, Terms, Privacy) → `toast.info("Coming soon")` placeholder for now (no new pages this pass — user said "name the way I started it")

### Technical notes
- Only `src/pages/Settings.tsx` is modified
- Keep all existing state, modals, and handlers intact
- Use semantic tokens (`bg-card`, `text-foreground`, `bg-gradient-primary`, `shadow-glow`) — no hardcoded colors
- Profile photo, name, DOB, email pulled from existing `profile` state + Supabase user (already available) — fall back to the exact mock values shown above when empty
