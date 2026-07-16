---
name: configure-sfpeg-components
description: Configure SFPEG LIST (PEG_LIST) Lightning components — sfpegListCmp, sfpegActionBarCmp, sfpegCardCmp, sfpegProfileCmp, sfpegKpiListCmp, sfpegMessageListCmp, sfpegRecordDisplayCmp and friends. Use when authoring or editing their custom metadata records (sfpegList__mdt, sfpegAction__mdt, sfpegCard__mdt, sfpegProfile__mdt, sfpegKpiList__mdt, sfpegMessage__mdt, sfpegRecordDisplay__mdt, sfpegConfiguration__mdt), writing the JSON config in their rich-text fields, choosing App Builder / Site Builder properties, using {{{...}}} context merge tokens, or wiring SOQL/SOSL/Apex/REST/search/dependent queries. Covers lists, action bars & all action types, display cards/KPIs/messages, merge tokens and query patterns.
user-invocable: true
---

# Configuring SFPEG LIST (PEG_LIST) Components

The **PEG_LIST** package provides a family of configurable LWC components for the Lightning
App Builder, Experience (Site) Builder and the Utility bar. This skill helps you **configure**
them — author the custom metadata records and the JSON inside their rich-text fields — not
modify the components' source.

## How configuration works (read this first)

Every App/Site Builder component is configured at **two levels**:

1. **App / Site Builder** — a few high-level design props (title, icon, wrapping CSS, debug
   toggle) plus one or more **selectors** that pick a detailed configuration record.
2. **Custom metadata records** — the detailed configuration, usually held in one or more
   large **rich-text JSON** fields. The same metadata record can be reused across many pages,
   objects, record types and profiles.

This split is why most of the real work is editing custom metadata, and why reuse + caching
work well. See `references/foundations.md` for the full configuration model.

Three things recur across **every** component — learn them once:

- **Scope** (`scope` field): space-separated `GLOBAL` (all pages) / `RECORDS` (all record
  pages) / `<ObjectApiName>`. Controls which records appear in App Builder selectors. Leave
  **empty** for `sfpegAction__mdt` records used only as row/header actions of other records.
  For Experience Sites, `GLOBAL` is currently mandatory.
- **Permission** (`Permission` field, optional): a custom permission gating access to the
  record — an extra security layer beyond layout visibility, important when queries/DML bypass
  sharing or FLS.
- **Merge tokens** (`{{{NAMESPACE.path}}}`): contextualize JSON values from the current
  record, user, row, permissions, labels, etc. Evaluated **client-side via LDS**, so the user
  needs read (FLS) access to every merged field. This is the single biggest source of config
  bugs — see `references/merge-tokens-and-queries.md`.

## Pick the right component

| You want to… | Use | Reference |
|---|---|---|
| List records (table / tree / tiles / cards), SOQL/SOSL/Apex, row actions, pagination | **sfpegListCmp** (+ search/filter/map/tab wrappers) | `references/lists.md` |
| A button/menu bar that runs actions (navigate, edit, flow, DML, popup forms, mass ops…) | **sfpegActionBarCmp** (+ Handler/Trigger/Utility) | `references/actions.md` |
| A structured field card with inline LDS edit | **sfpegCardCmp** / **sfpegCardListCmp** / **sfpegAppCardCmp** | `references/display-components.md` |
| A graphical record header (banner, avatar, badges, actions) | **sfpegProfileCmp** | `references/display-components.md` |
| Grouped KPI tiles | **sfpegKpiListCmp** | `references/display-components.md` |
| Conditional contextual messages / warnings | **sfpegMessageListCmp** | `references/display-components.md` |
| Headline + sub-tabs record display (e.g. Knowledge in Communities) | **sfpegRecordDisplayCmp** | `references/display-components.md` |
| Custom merge tokens, or SOQL/SOSL/Apex/REST/search/dependent/JSON queries | (shared) | `references/merge-tokens-and-queries.md` |

Action bars are **embedded inside** the list and display components (header/row actions), so
almost every non-trivial config also needs `references/actions.md`.

## Workflow for authoring a config record

1. **Identify the component** and therefore its metadata object (table above).
2. **Set the common fields**: meaningful `Label`/`Name`, a real `Description`, the correct
   `Scope`, and `Permission` if access must be restricted.
3. **Write the JSON** for the main rich-text field(s) using the schema in the relevant
   reference. Start from one of the faithful example snippets and adapt it.
4. **For `sfpegList__mdt` records** — always ask the user whether an empty-state message
   should be shown when the query returns no data. If yes, add `"emptyMsg"` (text) and
   `"emptyVariant": "info"` (or omit for the default warning icon) to `DisplayConfig__c`.
   Example: `"emptyMsg": "No records found.", "emptyVariant": "info"`.
5. **Add merge tokens** for anything contextual. Confirm the running user has read access to
   every field referenced. Wrap text/rich-text values that may contain `"` in `ESCAPE(((…)))`.
6. **Wire actions** if needed: create/select an `sfpegAction__mdt` record and reference it
   (row actions, header actions, card actions, message actions, profile actions, KPI actions).
6. **Deploy** the custom metadata record(s) (`sf project deploy start --metadata
   CustomMetadata:<Object>.<Name>`), then select them in App/Site Builder.
7. **Verify** with the component's `Debug?` toggle, which surfaces config info and links.

## Authoring conventions for this repo

- Custom metadata source lives under `force-app/**/customMetadata/<Object>.<Name>.md-meta.xml`.
  Org-specific records typically go in `force-app/default/main/default/customMetadata/`.
- In the XML, JSON goes in a `<value xsi:type="xsd:string">` element with all `"` characters
  HTML-escaped as `&quot;` (look at existing records such as `sfpegAction.sfpegEdit` for the
  exact shape before writing a new one).
- The authoritative, exhaustive docs are in `/help/*.md`; each reference file cites the
  specific help page to consult for edge cases.

Load only the reference file(s) you need for the task at hand.
