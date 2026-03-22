---
title: Cookie Policy
heading: Cookie Policy
effective: 22 March 2026
updated: 22 March 2026
---

This Cookie Policy explains how menuva.co.uk ("the Website") uses cookies, local storage, and similar technologies. It should be read alongside our [Privacy Policy](/privacy/).

## 1. What are cookies and similar technologies

Cookies are small text files stored on your device by your browser. Local storage and session storage are similar browser mechanisms that store data locally. We use these technologies to operate the Website, remember your preferences, and understand how the Website is used.

## 2. Technologies we use

### A. Analytics cookies (require your consent)

These cookies are set by Google Analytics (GA4) when analytics is enabled. They help us understand how visitors use the Website so we can improve it. No personal data is collected. You can opt out at any time using the analytics toggle in the footer.

| Cookie | Purpose | Duration | Set by |
| --- | --- | --- | --- |
| `_ga` | Distinguishes unique visitors using a randomly generated identifier | 2 years | Google |
| `_ga_*` | Maintains session state for Google Analytics | 2 years | Google |

These cookies are only set when analytics is enabled. If you opt out via the footer toggle, these cookies are not set on future visits. To delete existing cookies, use your browser settings (see Section 4).

### B. Security cookies (strictly necessary)

| Cookie | Purpose | Duration | Set by |
| --- | --- | --- | --- |
| `_GRECAPTCHA` | Used by Google reCAPTCHA v3 on the menus page for bot detection and protecting our backend services from abuse | 6 months | Google |

This cookie is strictly necessary to prevent automated abuse of our menu data services. It is only set on the menus page where Firebase App Check is active.

### C. Local storage (strictly necessary)

These items are stored in your browser's local storage for functionality and performance. They do not track you and are not transmitted to our servers.

| Key | Purpose | Duration | Set by |
| --- | --- | --- | --- |
| `lang` | Your language preference (English or Chinese) | Until cleared | Menuva |
| `analytics_consent` | Records whether you have opted out of analytics | Until cleared | Menuva |
| `swr_*` | Cached JSON responses (page content, link lists) to reduce loading times | Until cleared | Menuva |
| `md12_*` | Cached and versioned page content for faster navigation | Until version bump | Menuva |
| `mlist_raw`, `mlist_ts` | Cached restaurant list and its fetch timestamp | Until cleared | Menuva |
| `menu_json_*` | Cached menu data (up to 5–7 menus, oldest evicted automatically) | LRU eviction | Menuva |
| `menu_sha_*` | Content hash for cache validation (checks if menu has changed) | LRU eviction | Menuva |
| `menu_doc_*` | Cached Firestore document metadata for each menu | LRU eviction | Menuva |
| `menu_ts_*` | Timestamp of when each menu was last cached | LRU eviction | Menuva |
| `bsk-banner-dismissed` | Records that you have dismissed the ordering disclaimer on the menus page | Until cleared | Menuva |

### D. Session storage (strictly necessary)

| Key | Purpose | Duration | Set by |
| --- | --- | --- | --- |
| `_menuPrefetch` | Temporary navigation hint used to speed up menu loading when following a direct link | Tab close | Menuva |

Session storage is automatically cleared when you close the browser tab.

## 3. Your analytics choice

We use the DUAA Reg 6(2A) analytics exception. Analytics is enabled by default for the sole purpose of statistical analysis to improve the service. Google data sharing is disabled, and no personal data is collected.

You can opt out at any time:

- **On this website:** Use the **Manage Analytics** link in the footer of any page. Your choice is saved immediately and respected on all future visits.
- **In your browser:** Most browsers allow you to block or delete cookies via settings. See Section 4 below.

Once you opt out, no analytics cookies will be set and no usage data will be collected on future visits.

## 4. Managing cookies and local storage

You can manage or delete cookies and local storage through your browser settings:

- **Safari:** Settings → Privacy → Manage Website Data
- **Chrome:** Settings → Privacy and Security → Cookies and other site data
- **Firefox:** Settings → Privacy & Security → Cookies and Site Data
- **Edge:** Settings → Cookies and site permissions → Cookies and site data

Clearing cookies or local storage will reset your language preference, cached menu data, and analytics opt-out choice. You will need to set your preferences again.

## 5. Changes to this policy

If we add new cookies or storage technologies, we will update this policy and note the change date above.

## 6. Contact

Questions about this Cookie Policy: [hello@menuva.co.uk](mailto:hello@menuva.co.uk)

For full details on how we handle personal data, see our [Privacy Policy](/privacy/).
