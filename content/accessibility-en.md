---
title: Accessibility Statement
heading: Menuva Accessibility Statement
effective: 17 March 2026
updated: 19 April 2026
contact_questions: hello@menuva.co.uk
contact_support: support@menuva.co.uk
---

This is a voluntary accessibility statement for Menuva, a non-commercial, student-led prototype developed at the University of Warwick. As Menuva is not a public-sector service or commercial product, a formal statement under the Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018 is not legally required. In support of Warwick's commitment to digital inclusion, this statement describes what we have done so far, where we still have work to do, and how to tell us when something falls short.

> **Key points.**
> - Menuva is available as an iOS app and a web application at menuva.co.uk
> - both platforms are designed with accessibility in mind, including Dynamic Type, good contrast, keyboard access, and simple hierarchy
> - we aim for Web Content Accessibility Guidelines (WCAG) 2.2 Level AA on the web, but as a student pilot without the budget for formal third-party certification we cannot guarantee full AA compliance across every page
> - in April 2026 we completed an internal WCAG 2.2 AA audit of the web application and shipped fixes covering the vast majority of findings
> - if anything does not work for you, please email support@menuva.co.uk and we will try our best to put it right

## 1. iOS application

**1.1** The Menuva iOS app is designed in accordance with Apple's Human Interface Guidelines and built to work with iOS accessibility features.

**1.2** **Supported accessibility features.**

- Dynamic Type (tested at minimum and maximum sizes)
- system Dark and Light Mode
- VoiceOver
- switch and eye-tracking input where enabled

**1.3** Interfaces are intentionally simple, with clear hierarchy and minimal on-screen complexity to reduce cognitive and visual load when browsing menus, filtering dietary information, or navigating between sections.

## 2. Web application

**2.1** In April 2026 we completed an internal WCAG 2.2 Level AA audit covering the homepage, menus page, more page, every content page, and the 404 fallback. The audit surfaced 73 findings; most have now been fixed. The sections below summarise what is in place and what it means for you in practice.

**2.2** **Screen reader support.** The site works with VoiceOver, NVDA, and JAWS.

- each page has a single top-level heading and a consistent outline, so you can jump section to section
- decorative icons are hidden from screen readers, and every button has a clear name (for example, the basket "Add" button reads the item name, not just "Add")
- data tables declare column headers so table navigation works as expected
- loading, error, and offline states are announced the moment they happen
- filter chips and disclosure toggles expose their pressed or expanded state, so you know whether a filter is on
- the analytics opt-out is exposed as a proper switch control

**2.3** **Keyboard access.** You can use the whole site without a mouse.

- every interactive element is reachable with Tab and activatable with Enter or Space
- dialogs (QR code, command palette, basket, item customisation) trap focus while open and return focus to where you were when they close
- a skip-to-main-content link appears at the top of every page when you press Tab
- single-character shortcuts (1, 2, 3, L, /, ?) now require the Alt key so they no longer collide with screen-reader commands
- a visible focus ring is shown whenever you navigate with the keyboard

**2.4** **Language.**

- the page's language attribute updates the moment you switch between English and 中文, so screen readers use the correct voice
- language changes are announced politely so you know the switch took effect
- English and Chinese content is kept structurally parallel

**2.5** **Motion and structural clarity.**

- animations reduce or stop when you have "Reduce Motion" turned on in your operating system
- frequently-asked questions render as real headings, step-by-step guides render as ordered lists, and key names on the shortcuts page render as keyboard glyphs
- the 404 page renders its content as plain HTML before any JavaScript runs, so you can read it and escape even if scripts fail

## 3. Language and comprehension

**3.1** To address language and comprehension barriers, the pilot version of Menuva launches with English and Simplified Chinese support, allowing menu content to be displayed in either language for participating venues. This reduces reliance on staff for ad-hoc translation and supports international students and visitors who may otherwise struggle with English-only menus.

**3.2** Currency comprehension is supported through automatic conversion between GBP and 160+ currencies (currently 163), with rates updated daily via an open-source exchange-rate provider, used in accordance with its licence and terms of use. This allows diners to understand pricing without manual calculations or external tools.

## 4. Our WCAG 2.2 AA aim

**4.1** We target WCAG 2.2 Level AA across the web application and Apple's Human Interface Guidelines on iOS. We are a student-led pilot with no budget for a formal third-party certification, so we do not claim to be certified at AA. Our April 2026 internal audit is the best evidence we can offer today.

**4.2** If you find something on the site that prevents you from using Menuva, or that you believe falls short of WCAG 2.2 AA, please email support@menuva.co.uk. We take accessibility feedback seriously and will try our best to improve our services as we go.

## 5. Known limitations

**5.1** Some interface elements on the web application may not yet meet the WCAG 2.2 AA thresholds for colour contrast or minimum target size. The remediations change the site's visual design and have been deferred until a dedicated visual-design review.

**5.2** The iOS app relies on Apple's platform accessibility features and our own manual testing; it has not had a separate formal WCAG audit.

**5.3** We do not control the accessibility of restaurant-provided menu images or other third-party content embedded within menus.

**5.4** A full end-to-end VoiceOver pass on a real iOS device, for every flow on the web application, is planned but not yet complete.

## 6. Feedback and contact

**6.1** If you experience an accessibility barrier using Menuva, or have suggestions for improvement, please contact us. We take accessibility feedback seriously and will work to address issues promptly.

**6.2** **General enquiries:** hello@menuva.co.uk

**6.3** **Support:** support@menuva.co.uk
