# Display Components — Cards, Profiles, KPIs, Messages, Record Display

Deep-dives: `/help/sfpegCardCmp.md`, `sfpegCardListCmp.md`, `sfpegAppCardCmp.md`,
`sfpegProfileCmp.md`, `sfpegKpiListCmp.md`, `sfpegMessageListCmp.md`, `sfpegRecordDisplayCmp.md`,
`sfpegFieldDsp.md`, `sfpegIconDsp.md`.

All are App/Site Builder LWC. JSON config supports `{{{RCD.Field__c}}}`, `{{{LBL.Label}}}`,
`{{{NPERM.Perm}}}` merge tokens, and `ESCAPE(((…)))` to protect embedded `"` from breaking JSON.

---

## sfpegCardCmp — LDS card with inline edit

Structured card of fields/sections for the current or a lookup-related record, fetched/updated via
LDS. Supports `view`/`edit` toggle.

**`sfpegCard__mdt`:** `TargetObject` (object shown; empty = current record), `TargetIdField`
(lookup field identifying a related target record), `DisplayConfig` (JSON layout).

**Config JSON:** top-level `size` (field width /12), `iconSize`, `density`, `variant`,
`description`, `help`. `fields[]` (each `name` required; `disabled`/`required`/`size`/`icon`;
`isSpace` reserves a grid zone). `sections[]` (each `label` required + `fields[]`;
`isCollapsible`/`isCollapsed`/`size`). `context[]` (hidden fields loaded in edit mode, e.g.
controlling picklists; only `name`).
```json
{ "size":6, "iconSize":"medium", "variant":"label-stacked",
  "fields":[ {"name":"Name","icon":"resource:nom"}, {"name":"OwnerId","disabled":true} ],
  "sections":[
    { "label":"{{{LBL.PEG_TEST}}}", "size":"6", "help":"Most important fields.",
      "fields":[ {"name":"Motif__c","size":4}, {"name":"DueDate__c","required":true} ] },
    { "label":"Configuration","isCollapsible":true,"isCollapsed":true,
      "fields":[{"name":"Icon__c"}] } ] }
```
**App Builder:** title, icon, mdt selection, header `sfpegAction__mdt` + max actions, `Read only`,
`collapsible`, `Use DML?` (without-sharing DML instead of LDS), `Confirm Pending Changes?` (console
only). **Gotchas:** no dynamic icons; email/phone only render `mailto:`/`tel:`; confirm-pending
works only in console; offers a bypass DML on duplicate-rule errors.

---

## sfpegCardListCmp — list of cards

Fetches records via a sfpegList query, renders one sfpegCardCmp each, with per-record object/icon/
card config.

**`sfpegCardList__mdt`** (each "…Field" reads from the query row; the non-Field twin is a fixed
default): `Query` (sfpegList__mdt name), `Record ID Field` (`Id`), `Record Name Field` (`Name`),
`Icon Name Field`/`Icon Name`, `Object Name Field`/`Object Name`, `Card Config Field`/`Card Config`
(sfpegCard__mdt), `Card Actions Field`/`Card Actions` (sfpegAction__mdt), `Card Context` (reserved).

**App Builder:** title/icon/CSS, per-card CSS & size, mdt selector, global header action + max
actions (global + card), `Read-Only?`, `Button Size`, `Show #Records?`, `Show Refresh?`.
**Gotcha:** each card does its own record fetch — use only on **small** lists.

---

## sfpegAppCardCmp — card on Home/App pages

Wrapper over sfpegCardCmp injecting a `recordId` from global context (no current record). Reuses
`sfpegCard__mdt` + `sfpegAction__mdt`, which **must be `GLOBAL` scope**.

**App Builder (Home/App only):** all sfpegCardCmp props plus `Object API Name` and `Record ID`
(supports merge tokens **except** `RCD`/`ROW`/`CTX`; e.g. a query template on a Knowledge `UrlName`).
The header action's `RCD` context is available. **Gotcha:** if `Record ID` resolves empty, no card.

---

## sfpegProfileCmp — graphical record header

Banner + avatar + badge/title/detail fields + action bar + detail section. LDS-only.

**`sfpegProfile__mdt`:**
- `Profile Banner` — file name in `sfpegBanners` static resource, or JSON for dynamic
  (`fileFieldName`→ContentDocument Id, `assetFieldName`, `fieldName`→image name; precedence
  file→asset→fieldName). Empty hides it.
- `Profile Avatar` — same, using `sfpegAvatars`.
- `Profile Header` — JSON `{title, badge, badgeClass, details[]}` (all field API names).
- `Profile Actions` — sfpegAction__mdt name.
- `Profile Details` — JSON `{variant (list|base|table|media), columns (÷12), iconSize, fields}`;
  for `media`, fields are `{fieldName, iconName}` objects.
```json
{ "title":"Name","badge":"KPI3__c",
  "badgeClass":"slds-badge slds-badge_inverse slds-text-color_inverse",
  "details":["KPI1__c","KPI2__c"] }
```
**App Builder:** mdt, wrapping CSS, display/padding size, action alignment (place actions next to
title to save height), `Inverse Mode?` (light text on dark banners). **Gotchas:** LDS-only; even
dynamic banner/avatar field values are fetched via hidden fields, so those must be accessible;
custom images in the static resources are overwritten on upgrade.

---

## sfpegKpiListCmp — grouped KPI tiles

Dense, actionable KPI display grouped by domain. LDS-only. All config in `Display Config` JSON:
`{ "groups":[…] }`. Each group: `label`, `iconName`, `size` (÷12), `border`, `kpiAlign`
(middle|start|end), `actions` (sfpegAction__mdt), `actionMaxSize`, `actionHidden`, and `kpis[]`.
Each KPI: `name` (main field), `icon` (`name` static OR `fieldName` dynamic; `variant`/`variantField`,
`value`/`valueField`, `size`), `label`, `title`, `action` (matches an action `name` in the group's
`actions`, fired via the icon), `related` (smaller field values next to the main one).
```json
{ "groups":[{
  "label":"Situation","iconName":"custom:custom19","border":true,"size":"12","actions":"newsActions",
  "kpis":[
    { "name":"Ratio__c","label":"Ratio","title":"Ratio","action":"edit",
      "icon":{"name":"dynamic:strength","valueField":"ViewScore__c"},"related":["ViewScore__c"] },
    { "name":"Views__c","label":"Views",
      "icon":{"name":"dynamic:progress","valueField":"ViewsRatio__c","size":"large"} } ] }]}
```
**App Builder:** mdt + wrapping CSS. **Gotchas:** LDS-only; KPI action fires only through the icon
and only when the group defines `actions`; `LBL`/`FLBL` translate labels.

---

## sfpegMessageListCmp — conditional messages

Conditional, contextual, actionable messages with optional progress widget and dynamic icons.

**`sfpegMessage__mdt`:** `Message Display` (JSON list), `Message Actions` (sfpegAction__mdt holding
referenced actions). Message props: `header`, `message` (rich text), `variant`
(base/notif/info/infoLight/warning/warningLight/error/errorLight/success/successLight), `size` (÷12),
icon overrides (`iconName`/`iconSize`/`iconVariant`/`iconValue`/`iconTitle`), `msgClass`,
`path`/`progress`, `action` (`{name,label|iconName,…}`), `isHidden` (boolean OR string JS formula —
message shows when it evaluates **false**).
```json
[ { "variant":"warningLight","size":"12","header":"Attention: Canaux non sélectionnés!",
    "message":"Veuillez sélectionner a minima un canal principal.",
    "isHidden":"'{{{RCD.Stage__c}}}' == 'CHANNEL' || '{{{RCD.SelectedChannels__c}}}' == ''" } ]
```
**App Builder:** mdt, wrapping CSS, debug. **Gotchas:** merge applied on every load/refresh;
`isHidden` string formulas run through `eval()` — use only safe fields; `path`/`progress` values
must match what the base Lightning component expects.

---

## sfpegRecordDisplayCmp — headline + sub-tabs

Header field section + tabset (each tab = fields and/or an embedded sfpegListCmp). Fetch via LDS or
SOQL (for non-LDS objects). Primary use: Knowledge articles in Communities.

**`sfpegRecordDisplay__mdt`** `Display Configuration` JSON: `title`, `icon`, `variant` (tabset),
`innerClass`; `fields[]` (header — each `value` required, `type` (see sfpegFieldDsp), `label`,
`title`, `size` ÷12, `hidden`); `tabs[]` (each `label`, `hidden`, `fields[]`, optional `list`
`{name (sfpegList__mdt), title, icon, actions (sfpegAction__mdt)}`).
```json
{ "title":"{{{RCD.Name}}}","icon":"standard:campaign",
  "fields":[ {"value":"ESCAPE((({{{RCD.Description}}})))","type":"richText","title":"Objectives"} ],
  "tabs":[
    { "label":"Description",
      "fields":[{"value":"ESCAPE((({{{RCD.Objectives__c}}})))","type":"richText","label":"Objectives","size":6}] },
    { "label":"Operations","fields":[…],"list":{"name":"soslList","title":"SOSL List"} } ] }
```
**App Builder:** mdt, header action, LDS/SOQL mode, `Layout Mode` (`auto` respects density), debug,
CSS. **Gotcha:** wrap text/rich-text merge values in `ESCAPE(((…)))`.

---

## sfpegFieldDsp — field display helper (defines the `type` values)

Renders a value by `type` via the right `lightning-formatted-*`. Used by sfpegRecordDisplayCmp /
sfpegTileDsp. **Types:** `boolean`, `email`, `phone`, `number`, `percent`, `percentFixed`,
`currency`, `date`, `dateLocal`, `dateTime`, `richText`, `text` (default).
**Gotcha:** `percent` no longer ÷100 — use **`percentFixed`** for standard percent fields.

---

## sfpegIconDsp — icon helper (defines `iconName` syntax)

`iconName` forms: SLDS (`utility:check`, `standard:account`, `custom:custom12`; `iconVariant` only
for `utility:`); custom SVG `resource:<name>` (from `sfpegIcons`); flags `flag:<ISO2>` (from
`sfpegFlagIcons`, matches State/Country picklist codes); dynamic `dynamic:score|strength|trend`
(need `iconValue`, no size/variant); progress ring `dynamic:progress` (needs `iconValue`, optional
size/variant). Other props: `iconSize` (small default), `iconVariant`, `iconTitle`, `iconValue`,
`actionName` (clickable → fires `action`). **Gotcha:** custom icons/flags require editing the static
resources, overwritten on upgrade.

---

### Related but not display components
- **sfpegHierarchy** (`/help/sfpegHierarchy.md`) — `sfpegHierarchy_SVC` is a sfpegListCmp **query**
  extension for tree-grid sub-hierarchies. See `lists.md` / `merge-tokens-and-queries.md`.
- **sfpegSearchPopupCmp** (`/help/sfpegSearchPopupCmp.md`) — modal search/select (handles
  `sfpegCustomAction`); docs stubbed, no detailed config available.
