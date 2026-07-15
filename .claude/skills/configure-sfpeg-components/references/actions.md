# sfpegAction Family — Action Configuration Reference

Deep-dives: `/help/sfpegActionBarCmp.md`, `/help/sfpegActionHandlerCmp.md`,
`/help/sfpegActionTriggerCmp.md`, `/help/sfpegActionUtilityCmp.md`,
`/help/sfpegForceNavigationCmp.md`, `/help/sfpegTriggerEventFlw.md`.

## 1. Components — which to use

- **sfpegActionBarCmp** — LWC button/menu bar; also the engine behind row/header actions in
  sfpegListCmp, sfpegCardCmp, etc. Use on pages and as embedded action provider.
- **sfpegActionHandlerCmp** — utility-bar LWC variant; handles `utility` notifications from page
  bars and console/utility-only types (`openTab`, `closeTabs`, `refreshTab`, `minimize`).
- **sfpegActionUtilityCmp** — Aura wrapper around the handler adding Aura-only types (`openPopup`,
  `openFlow`, `fireEvent`). Use only when those are needed. Pick this **or** the handler, not both.
- **sfpegActionTriggerCmp** — headless LWC that auto-fires one named action on instantiation
  (gate with Lightning visibility rules). Also usable inside an Aura Quick Action.
- **sfpegForceNavigationCmp** — headless LWC controlling main/sub-tab opening in console
  (App Builder config only; delegates to handler `openTab`).
- **sfpegTriggerEventFlw** ("SF PEG Notifier") — Flow Screen LWC notifying bars on a channel
  (e.g. refresh a page after Flow DML).

## 2. `sfpegAction__mdt` metadata + App Builder props

Key fields:
- **Actions__c** — the JSON array of action/menu definitions (the core config; §3).
- **ActionControls__c** — JSON map of **server-side** controls for `apex`/`DML` actions (§8).
- **Notification Channels** — JSON list of channel labels the bar registers to for `notify`
  (e.g. `["RefreshList"]`); set only if `notify` must be received.
- **Do Evaluation?** — when on, `hidden`/`disabled` may be string expressions (`eval()`) instead of
  plain booleans.
- **scope** / **Permission** — see `foundations.md`. Leave `scope` empty for row-action records.

App/Site Builder props: **Action configuration** (selector), **CSS Class** (`barClass`, default
`slds-theme_shade slds-grid slds-grid_align-end`), **Max. #Actions** (`maxSize`, overflow into a
menu), **Debug?**. Handler adds **Handle Notifications?** (check on exactly one utility instance)
and the App's **Start automatically**. Trigger adds **Action Name**. ForceNavigation adds
**Main Tab?**, **Parent Field**, **Target Page**.

## 3. Actions__c JSON schema

Array of entries. A **button** has one `action`; a **menu** (`"type":"menu"`) has `items[]` of the
same shape.

```jsonc
[
  {
    "name": "uniqueName",        // logical name (used by Trigger / executeBarAction)
    "label": "Button Label",     // button: label or iconName required; menu item: label required
    "iconName": "utility:edit",  // SLDS icon
    "variant": "brand",          // lightning-button variant
    "iconPosition": "left",      // left | right
    "iconSize": "small",
    "type": "menu",              // on menu entries only
    "align": "auto",             // menu alignment
    "hidden": false,             // boolean, or string expr if Do Evaluation?
    "disabled": false,           // boolean, or string expr if Do Evaluation?
    "items": [ /* same entry shape, each with its own action */ ],
    "action": {
      "type": "<actionType>",    // see §4
      "channel": "ChannelName",  // for notify / action types
      "label": "...",            // e.g. 2nd button label in showDetails.next
      "params": { /* type-specific */ },
      "next": { /* chained action — §5 */ },
      "error": { /* beta: action on failure (e.g. apex) */ }
    }
  }
]
```

`hidden`/`disabled` default `false`. As booleans use tokens like `{{{RCD.IsHidden__c}}}`,
`{{{PERM.MyPerm}}}`, `{{{NPERM.MyPerm}}}`. With **Do Evaluation?** they may be string expressions,
e.g. `"{{{NPERM.TST_Perm}}} || '{{{RCD.OwnerId}}}' != '{{{GEN.userId}}}'"` (runs through `eval()` —
only reference safe fields).

## 4. Supported `action.type` values

**Bar / handler types:**

| type | What it does | Key params |
|---|---|---|
| `navigation` | Navigate via lightning-navigation | `type`, `attributes`, `state` |
| `open` | Open selected row's record | — |
| `edit` | Standard edit popup of current/selected record | — |
| `openURL` | `window.open()` a URL | `url`, `target` (default `_blank`); `SUBSTR()`/`LEFT()` directives (beta) |
| `showDetails` | Read-only popup | `title`, `message`, `size`, `columns`, `fields[]`; `next` adds a 2nd button |
| `LDS` | Single record create/update/delete via LDS | `type` (create/update/delete), `title`, `message`, `bypassConfirm`, nested `params` (uiRecordApi payload) |
| `DML` | insert/update/delete via Apex | `title`,`message`,`bypassConfirm`, nested `params`={`operation`,`records[]`} |
| `apex` | Run Apex implementing `sfpegAction_SVC` | `name` (class or `Class.Method`), `title`,`message`,`bypassConfirm`, nested `params`; supports `error` |
| `ldsForm` | Popup edit form via lightning-record-edit-form (LDS save) | `title`,`message`,`size`,`height`,`columns`, `record` (`Id`/`RecordTypeId`/`ObjectApiName`+defaults), `fields[]` (`name`,`disabled`/`required`/`hidden`). Edit vs create = presence of `Id`. **Any field pre-filled via `record` that must be submitted must also appear in `fields[]` with `"hidden":true`** — otherwise LDS does not include it in the save payload. |
| `dmlForm` | Same form, save via DML (non-LDS objects) | `formRecord`+`formFields` for the form, `record` for the DML target, optional `fieldMapping` |
| `apexForm` | Form then Apex (`sfpegJsonAction_SVC`) | `formRecord`, `formFields`, `name`, nested `params` |
| `upload` | File upload popup | `title`,`message`,`size`,`label`,`recordId`,`formats[]`,`allowMultiple` |
| `massForm` | Mass edit form on selected records | like `ldsForm` + `removeRT` |
| `massDML` | Mass insert/update/delete on selection | `operation`,`title`,`message`,`bypassConfirm`,`record` (for insert also `lookup`) |
| `massApex` | Mass Apex on selection (selection added as `_selection`) | like `apex` |
| `download` | Download files via shepherd URLs | `documentId`/`versionId` (unitary) or `selectedVersions` (mass) |
| `reload` | LDS refresh of one record | `recordId` |
| `done` | Invoke an action on the parent component (e.g. list refresh) | `type` (e.g. `refresh`) |
| `toast` | Show a toast | `title`,`message`,`variant` (info/success/warning/error) |
| `clipboard` | Copy to clipboard | `params` is the text string itself |
| `utility` | Relay an inner action to the utility-bar handler | inner action in `params` |
| `action` | Notify a custom LWC (sfpegCustomAction channel) | `channel`, `params` |
| `notify` | Notify other bars (sfpegCustomNotification channel) | `channel`, `params` (inner action) |

**Console / utility-only (sfpegActionHandlerCmp; from page bars wrap in a `utility` action):**
`openTab` (`targetId`,`targetObject`,`isTargetMain`,`sourceTab`,`targetPage`), `closeTabs`
(`closeAll`), `refreshTab` (—), `minimize` (—).

**Aura-only (sfpegActionUtilityCmp; via `utility`):** `openPopup` (`name`,`params`,`header`,
`doRefresh`), `openFlow` (`name`,`params[]`,`header`,`doRefresh`,`class`,`selection`),
`fireEvent` (`type`,`params`).

## 5. Action chaining (`next` / `error`)

`next` chains a follow-on action. Placement matters:
- `next` at **action level** (sibling of `params`) → fires once the first action is *launched*
  (fire-and-forget, e.g. after navigation).
- `next` **inside `params`** → fires only on *successful completion* (types that detect success;
  not navigation).

Chains nest. `error` (beta) runs on failure and suppresses the default error toast.

```json
"action": {
  "type": "massDML",
  "params": {
    "operation": "delete",
    "next": {
      "type": "reload", "params": { "recordId": "{{{GEN.recordId}}}" },
      "next": { "type": "done", "params": { "type": "refresh" } }
    }
  }
}
```

## 6. Faithful examples

**Navigation / open:** `{ "name":"open","label":"Open","iconName":"utility:open","action":{"type":"open"} }`

**LDS update with confirm:**
```json
{ "name":"activate","label":"Activate","iconName":"utility:edit",
  "action":{ "type":"LDS",
    "params":{ "type":"update","title":"Updating Row State","message":"Please confirm.",
      "params":{ "fields":{ "Id":"{{{ROW.Id}}}","state__c":true } } } } }
```

**DML update of a row:**
```json
{ "name":"close","label":"Close",
  "action":{ "type":"DML",
    "params":{ "title":"Close the Task","message":"Please confirm the closing",
      "params":{ "operation":"update",
        "records":[{ "Id":"{{{ROW.Id}}}","sobjectType":"Task","Status":"Done" }] } } } }
```

**LDS form edit (current user):**
```json
{ "name":"editUser","label":"Edit User",
  "action":{ "type":"ldsForm",
    "params":{ "title":"User Record Update","columns":2,
      "record":{ "Id":"{{{GEN.userId}}}","ObjectApiName":"User" },
      "fields":[ { "name":"LastName","disabled":true }, { "name":"Title","required":true } ] } } }
```

**Flow launch (via addressable Flow component):**
```json
{ "label":"New Individual","iconName":"utility:new","variant":"brand",
  "action":{ "type":"navigation",
    "params":{ "type":"standard__component",
      "attributes":{ "componentName":"c__sfpegFlowEmbed_CMP" },
      "state":{ "c__flow":"CreateBusinessAccount","c__recordId":"null",
        "c__target":"NewAccountId","c__label":"Business Creation" } } } }
```

**Toast as a `next`:**
```json
"next": { "type":"toast",
  "params":{ "title":"Operation Success","message":"Record created.","variant":"success" } }
```

## 7. Gotchas

- **scope** — empty for row/header-action records; display props (variant, iconSize…) are ignored
  when a record is used for row/header actions.
- **Console-only types need the handler/utility** — `openTab`/`closeTabs`/`refreshTab`/`minimize`/
  `openPopup`/`openFlow`/`fireEvent` only run in the utility bar. From a page bar, wrap them in a
  `utility` action; the utility component must have **Handle Notifications?** + **Start automatically**.
- **One utility instance** — check **Handle Notifications?** on exactly one; include only one of
  sfpegActionUtilityCmp / sfpegActionHandlerCmp.
- **`notify` routing** — only reaches bars whose **Notification Channels** lists the `channel`.
- **open/edit fail in LWR** — use `navigation` with an explicit `objectApiName`.
- **Do Evaluation? safety** — string `hidden`/`disabled` run through `eval()`; reference only safe
  fields. Without it, those props must be plain booleans.
- **bypassConfirm** — set `true` on LDS/DML/apex/massDML/massApex to skip the confirmation popup.
- **Merge tokens** — applied on load/refresh; see `merge-tokens-and-queries.md` for `RCD`/`ROW`/
  `GEN`/`USR`/`PERM`/`CTX`/etc.

## 8. Server-side action controls (`ActionControls__c`)

Source of truth: the field definition and `sfpegAction_CTL.cls` (`hasControlConfig`,
`mayExecuteApex`, `mayExecuteDML`, `isDmlOK`, `hasPermission`). Example: the `sfpegTest` record.

`ActionControls__c` adds an **Apex-side** security layer for `apex` and `DML`/`massDML` actions —
checked in the `sfpegAction_CTL` controller, independent of client-side `hidden`/`disabled`. It is
a JSON **map keyed by action name** (for `apex` the key is the class / `Class.Method` name; for DML
it is the action's `name`). A key is only enforced if present; actions with no matching key run
under the **standard** rights checks.

Per-action control properties:
- `permission` — custom permission the user must hold to run the action (checked via
  `FeatureManagement.checkPermission`). Applies to both `apex` and DML actions.
- `operation` (DML) — the only DML operation allowed for this action (`insert`/`update`/`delete`);
  a mismatched request is rejected.
- `objects` (DML) — map of `ObjectApiName → [allowed field API names]`. Every record's object must
  be listed and every populated field must be in its allow-list (`Id`/`id` always permitted), else
  the DML is rejected. This **whitelists** exactly what a sharing/FLS-bypassing action may touch.
- `bypassFLS` (DML, boolean) — when `true`, skip the standard create/update FLS rights check
  (`hasDmlRights`). Pair with `objects` so the bypass is constrained to known object/field sets.

```json
{
  "sfpegActionTest_SVC.NoAccess": { "permission": "sfpegTestPermission" },
  "noDmlAccess":  { "permission": "sfpegTestPermission" },
  "bypassedDml":  { "bypassFLS": true, "operation": "update",
                    "objects": { "sfpegTestObject__c": ["Id","Name"], "Account": ["Id","Name"] } }
}
```

Notes:
- For `apex`, the controller also verifies the action key is actually referenced in `Actions__c`
  before running (`mayExecuteApex`).
- These controls are **only** evaluated for server-executed action types (`apex`, `DML`,
  `massApex`, `massDML`). Client-only types (navigation, ldsForm/LDS, toast…) are unaffected.
- Malformed JSON here makes the controller throw at execution time — validate before deploying.
