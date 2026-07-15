# Foundations — Configuration Model Shared by All PEG_LIST Components

Source: `/help/configuration.md`, `/help/componentList.md`.

## The two-level configuration model

1. **App / Site Builder** — set a small set of design props and pick detailed config records.
   - Components are prefixed **`SF PEG`** and tagged with the package logo in the component list.
   - Typical props: header `title` & `icon`, wrapper CSS class, **`Debug?`** / **`Debug (fine)?`**
     toggles, one or more **custom-metadata selectors**, plus a few simple custom options.
   - **Experience (Site) Builder** adds context props `recordId` (default `{!recordId}`) and
     `objectApiName` (default `{!objectApiName}`). ⚠️ `{!objectApiName}` is sometimes empty at
     page init — set a fixed test value (e.g. `Account`) when possible.
2. **Custom metadata** — the detailed config, reusable across pages/objects/record types/profiles,
   stored mostly as **rich-text JSON**. Filter them in Setup by the `sfpeg` name prefix.

Benefits: reuse the same detailed config in many layouts; efficient local (browser) caching.

## Common custom-metadata fields (on most config objects)

- `Label` / `Name` — standard identification.
- `Description` — document the record's purpose (do fill it in).
- `Scope` — where the record is applicable (see below).
- `Permission` (optional) — custom permission required to access the record (see below).
- Plus object-specific fields, generally including at least one large **rich-text JSON** field.

## Scope

Space-separated keywords controlling where a record is offered in App/Site Builder selectors
(enforced by the `*Selector_CTL` Apex datasource classes):

- `GLOBAL` — all pages.
- `RECORDS` — all record pages.
- `<ObjectApiName>` — a specific object (e.g. `Account`).

Guidance:
- Set it as **narrow as possible** to keep selector dropdowns clean.
- Leave it **empty** for `sfpegAction__mdt` records only used as **row actions** of other records
  (they only make sense inside a `ROW` context and should not be independently selectable).
- ⚠️ **Experience Sites**: only `GLOBAL` works today — `RECORDS` / `<ObjectApiName>` context is
  not evaluated reliably when rendering a Site record page (known issue).

## Permission (access control)

Many objects expose a `Permission` field naming a **custom permission** the end user must hold to
use the record. This is an API-level safeguard on top of layout visibility — **especially
important** for `sfpegList__mdt` / `sfpegAction__mdt` records that bypass sharing or FLS in their
queries / DML.

## Debug mode

All components have `Debug?` (this component) and sometimes `Debug (fine)?` (this component + its
sub-components such as the action bar and merge utility). They display config info + links to the
metadata records and online docs in the card footer, and emit browser-console logs. Server-side
controllers also log at error/warning/debug/fine levels.

## Contextualisation

Most main JSON properties accept **merge tokens** (`{{{…}}}`) resolved by `sfpegMergeUtl`, mostly
**client-side via LDS** — the user needs read access to every merged field even if never displayed.
See `merge-tokens-and-queries.md`.

## The component & metadata map

App Builder UX components and their metadata:

| Component | Metadata object | Controller / selector |
|---|---|---|
| sfpegListCmp (+ wrappers) | `sfpegList__mdt` | `sfpegList_CTL` / `sfpegListSelector_CTL` |
| sfpegActionBarCmp (+ Handler/Trigger/Utility) | `sfpegAction__mdt` | `sfpegAction_CTL` / `sfpegActionSelector_CTL` |
| sfpegCardCmp | `sfpegCard__mdt` | `sfpegCard_CTL` / `sfpegCardSelector_CTL` |
| sfpegCardListCmp | `sfpegCardList__mdt` | `sfpegCardList_CTL` / `sfpegCardListSelector_CTL` |
| sfpegProfileCmp | `sfpegProfile__mdt` | `sfpegProfile_CTL` / `sfpegProfileSelector_CTL` |
| sfpegKpiListCmp | `sfpegKpiList__mdt` | `sfpegKpiList_CTL` / `sfpegKpiListSelector_CTL` |
| sfpegMessageListCmp | `sfpegMessage__mdt` | `sfpegMessage_CTL` / `sfpegMessageSelector_CTL` |
| sfpegRecordDisplayCmp | `sfpegRecordDisplay__mdt` | `sfpegRecordDisplay_CTL` / `sfpegRecordDisplaySelector_CTL` |
| (custom merge tokens) | `sfpegConfiguration__mdt` | `sfpegMerge_CTL` |

Utility-bar: **sfpegActionHandlerCmp** (LWC) and **sfpegActionUtilityCmp** (Aura) handle
utility/console-only actions. Addressable: **sfpegListViewCmp** (Aura) / **sfpegListTabCmp** (LWC)
open a list in its own page/tab.

### Custom Apex extension points
- `sfpegAction_SVC` — custom Apex for `apex` / `apexForm` action types (via `sfpegAction_CTL`).
- `sfpegListQuery_SVC` — custom query logic for `Apex` query type (via `sfpegListSelector_CTL`).

### Message channels (advanced wiring)
- `sfpegAction` — trigger an action on the utility-bar handler.
- `sfpegCustomAction` — trigger an action on a custom LWC from a bar (`action` type).
- `sfpegCustomNotification` — trigger actions on subscribed bars, e.g. list refresh (`notify` type).

### Static resources (for icons / profiles)
- `sfpegIcons` — SVG sprite for `resource:<name>` icons.
- `sfpegFlagIcons` — flag icons (`flag:<ISO2>`).
- `sfpegBanners` / `sfpegAvatars` — images for `sfpegProfileCmp`.
- ⚠️ These (and custom labels) are **overwritten on package upgrade** — back up customizations.
