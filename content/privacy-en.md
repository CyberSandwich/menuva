---
title: Privacy Policy
heading: Menuva Privacy Policy
effective: 17 March 2026
updated: 17 March 2026
contact_questions: hello@menuva.co.uk
contact_support: support@menuva.co.uk
---

This Privacy Policy explains how Menuva handles personal data when you use the Menuva iOS app (the "App") and the Menuva web pages we operate (the "Website") (together, the "Service"). Menuva is designed to be accountless and data-minimizing, but some information (especially location data, analytics event data, and online identifiers) can still be personal data under UK GDPR.

> **Key points:**
> - we do not transmit raw latitude/longitude off-device (App only; the Website does not use location)
> - both the App and the Website use analytics for usage measurement
> - analytics does not log free-text search queries, specific dietary or allergen selections, or allergen severity
> - customization identifiers are hashed so analytics cannot identify specific menu choices
> - ad tracking features (ad storage, ad user data, ad personalization) are disabled by default

## 1. Who is responsible for your data

**1.1** **Controller.** Duke DJ Saputra (student-led project, "Menuva").

**1.2** **Emails.** hello@menuva.co.uk (general) and support@menuva.co.uk (support).

**1.3** **Address.** University of Warwick, Scarman Rd, Coventry CV4 7AL, United Kingdom.

**1.4** If you contact us by email, we process the information you include to respond.

## 2. Intended users and territory

**2.1** Menuva is intended for users in the United Kingdom. If you use the Service elsewhere, this policy still applies, and our service providers may process data internationally (see Section 8).

## 3. What data we collect

### A. Precise location (App only, foreground)

**3.A.1** If you grant iOS location permission ("When In Use"), the App collects precise location on your device to:

- show nearby venues, and
- determine which venue's menus to load.

**3.A.2** **How it works.**

- Location updates may run continuously while the App is in the foreground on relevant screens (for example, home/map).
- Distance calculations happen locally on your device.
- The App may cache your last known location and city on-device only (for example, via iOS local storage) for faster loading and fallback behavior.

**3.A.3** **What we do not do.**

- We do not transmit raw latitude/longitude off-device.
- We do not intentionally store your precise location in our databases.
- Analytics receives only a boolean flag (has_location true/false) and the venue identifier (restaurant slug), never coordinates.

**3.A.4** You can disable location access at any time in iOS settings. If you deny location access, manual venue selection remains available. The Website does not use location services.

### B. Dietary and allergen preferences (on-device)

**3.B.1** If you set dietary or allergen preferences in the App, they are stored on-device only and are not synced to our servers. Analytics events for dietary and allergen configuration log only whether the change was made during onboarding or in settings (is_settings_mode). Specific selections are never sent.

### C. Analytics (App and Website)

**3.C.1** The App uses Firebase Analytics and the Website uses Google Analytics (GA4) to understand usage and improve the Service. Both are provided by Google. The App disables automatic screen reporting and uses manual tracking only.

**3.C.2** **Categories of events we collect.** Analytics events fall into the following categories:

- Navigation and discovery: opening menus, using the map, enabling location, starting a search, and navigating between screens.
- Menu browsing: viewing item lists, selecting items, opening item details, scrolling through categories, and toggling subsections.
- Engagement metrics: time spent on each screen (screen dwell), time spent on each menu category (category dwell), and scroll depth percentages (25/50/75/100%) per category.
- E-commerce funnel (standard GA4 events): view_item_list, select_item, view_item, add_to_cart, remove_from_cart, and view_cart.
- Order review: opening the order summary, clearing the basket, and toggling the order language.
- Settings and preferences: opening settings screens, configuring personalization, and changing language or currency.
- Onboarding: completion of each onboarding step (App only).

**3.C.3** **Event parameters.** Events include contextual parameters such as:

- venue identifiers (restaurant slug, location ID),
- boolean flags (for example, has_location, is_open, is_nearest_venue, has_items_in_basket),
- counts (for example, basket count, search result count, filter count),
- currency codes and price values in minor units (for e-commerce funnel analysis),
- static screen and category names,
- time values (dwell seconds), and
- scroll depth percentages.

**3.C.4** **User properties.** The App syncs eight display and locale preferences to analytics as user properties: preferred language, preferred currency, appearance mode, energy unit, and four display toggles (show converted prices, always translate, show menu images, show descriptions). These are preference settings only and do not include dietary or health data.

**3.C.5** **Screen and page tracking.** The App tracks 12 screens with static screen names (for example, "home", "menu", "profile") and dynamic context as custom parameters (for example, restaurant_slug on the menu screen). The Website tracks page views with page path and referrer.

**3.C.6** **Privacy protections in analytics.**

- Free-text search queries are never logged. Search events send only the result count.
- Dietary and allergen configuration events log only is_settings_mode (a boolean indicating onboarding vs. settings). Specific dietary or allergen selections are never sent.
- Allergen subsection interactions log only the subsection identifier and whether it was expanded or collapsed. Severity information is not included.
- Menu customization identifiers (customization and option IDs) are hashed using FNV-1a to opaque values before being sent to analytics. The original names cannot be recovered from analytics data alone.
- Location data in analytics is limited to a boolean flag (has_location) and venue identifiers (restaurant slug). Coordinates are never sent.
- No personal identifiers, names, or email addresses are included in analytics events. We do not set a custom user ID in analytics.

**3.C.7** **Device and technical data.** Firebase Analytics and Google Analytics process device and app information and identifiers used for measurement (for example, an app-instance identifier), plus technical data that may be processed by the analytics provider to deliver the service securely and reliably (such as IP address and request metadata).

**3.C.8** **Ad features.** Ad storage, ad user data, and ad personalization are all disabled by default in both the App and the Website. We do not collect the advertising identifier (IDFA), do not use ATT-based tracking, and do not use analytics for cross-app or cross-site advertising.

### D. Feedback (optional, Website)

**3.D.1** If you submit feedback at menuva.co.uk/feedback, your submission may include:

- your responses, and
- optional contact details (only if you choose to provide them).

**3.D.2** If you include contact details, they are personal data.

### E. Technical and network data (Service delivery)

**3.E.1** When your device or browser connects to Firebase/Google infrastructure to fetch menus and images, technical data such as IP address and request metadata may be processed by service providers to deliver content, maintain security, and prevent abuse.

### F. Website analytics (Google Analytics)

**3.F.1** The Website runs Google Analytics (GA4) to measure page views and menu interactions. The Website collects a subset of the analytics events described in Section 3.C above. Features that are specific to the App (such as location, onboarding, map interactions, and on-device preferences) are not collected on the Website.

**3.F.2** Our hosting provider may also process technical log data (IP address and request metadata) to deliver the Website securely.

## 4. What we do not collect

**4.1** Across both the App and the Website:

- no account registration, and no sign-in,
- no names, emails, or phone numbers unless you voluntarily provide them via feedback or email,
- no free-text search queries in analytics (only result counts),
- no specific dietary or allergen selections in analytics (only a boolean flag),
- no allergen severity information in analytics,
- no advertising identifier (IDFA) collection, and no ATT-based tracking, and
- no cross-app or cross-site tracking for advertising.

## 5. How we use data and our legal bases

UK GDPR requires a lawful basis for processing.

| Purpose | Data | Lawful basis |
| --- | --- | --- |
| Provide nearby venue discovery and load correct menus | Precise location (on-device, App only) | Consent (you enable location permission in iOS) |
| Provide the Service reliably and securely | Technical/network data handled by providers | Legitimate interests (operate a secure, reliable service) |
| Understand usage and improve the Service | Analytics event data (App and Website) | Legitimate interests (product improvement and pilot evaluation) |
| Measure menu browsing and order patterns | E-commerce funnel events, engagement metrics | Legitimate interests (product improvement) |
| Receive and respond to feedback | Feedback content; optional contact details | Consent (you choose what to submit) and/or legitimate interests (improving the Service) |

You can withdraw consent for location processing at any time by disabling location permissions in iOS settings.

## 6. Who we share data with

**6.1** We share data only as needed to run the Service.

### A. Google Firebase / Google Cloud / Google Analytics

**6.A.1** We use Google services:

- Firebase Storage (menus and images delivery),
- Firebase Firestore (read-only menu metadata),
- Firebase Analytics (App usage analytics),
- Google Analytics / GA4 (Website usage analytics),
- Firebase App Check (abuse prevention, for example validating requests using Apple's device attestation mechanisms).

**6.A.2** Google processes data as needed to provide and secure these services.

### B. Google Forms (feedback)

**6.B.1** If you submit feedback via Google Forms, Google processes that submission as the form provider.

### C. Apple

**6.C.1** Apple processes App Store distribution and provides developers with aggregated App Store metrics.

### D. Participating venues (aggregated only)

**6.D.1** We may share aggregated pilot reporting with participating venues. We do not share precise location data or per-device analytics.

**6.D.2** As of the "Last updated" date, venue partners do not have access to our analytics dashboards. If we enable partner access in the future, we will update this policy first (see Section 12).

**6.D.3** We do not sell personal data.

## 7. Data retention

**7.1** We keep data only as long as needed:

- **Precise location:** used on-device; not stored in our databases; last known location/city may be cached locally until you delete the App or reset preferences
- **On-device preferences and caches:** stored locally until you delete the App or clear browser data
- **Analytics (Firebase/GA4):** retained for 14 months (per our current analytics retention configuration)
- **Feedback submissions (Google Forms):** we periodically review feedback and delete or anonymize it when no longer needed, typically within 24 months, unless we need to keep it longer to resolve issues or for legitimate record-keeping
- **Service-provider logs:** may exist within third-party infrastructure for security and operational reasons and are retained per provider configuration

## 8. International transfers

**8.1** Our service providers may process data outside the UK. Where required, transfers are protected using appropriate safeguards (such as contractual protections) consistent with UK data protection requirements.

## 9. Security

**9.1** We use reasonable technical and organizational measures to protect data, including encryption in transit and at rest where supported, and restricted administrative access.

## 10. Children

**10.1** The Service is intended for users aged 13+. We do not knowingly collect personal data from children under 13. The App does not currently implement age verification.

## 11. Your rights and how they work in an accountless service

**11.1** Depending on your circumstances, you may have rights including access, deletion, correction, restriction, portability, and objection. You also have the right to complain to the UK supervisory authority (the Information Commissioner's Office).

**11.2** **Accountless limitation.** Because the Service does not use accounts and does not collect direct identifiers, we may not be able to identify or retrieve data about you beyond:

- feedback you submitted (if you provided contact details or sufficient context to locate it), and
- correspondence you send us by email.

**11.3** **Objecting to analytics.** You can object to analytics processing by contacting us. Because analytics is not tied to an account identity, we generally cannot reliably locate or delete past analytics records associated with a specific person. On the App, deleting it stops further analytics events from that device. On the Website, you can use browser settings or extensions to block analytics scripts.

## 12. Changes to this Privacy Policy

**12.1** If we change how we process data (for example, adding new analytics events or SDKs, introducing user accounts, changing analytics retention settings, or expanding who can access analytics dashboards), we will update this policy and, where appropriate, provide in-app or Website notice. Apple also requires keeping App Privacy disclosures accurate.

## 13. Contact

**13.1** Questions or requests: hello@menuva.co.uk

**13.2** Support: support@menuva.co.uk

**13.3** Privacy Policy page: menuva.co.uk/privacy
