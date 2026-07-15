# sfpegListCmp Family — List Configuration Reference

Deep-dives: `/help/sfpegListCmp.md`, `/help/sfpegSearchListCmp.md`,
`/help/sfpegFilterableListCmp.md`, `/help/sfpegListMapCmp.md`, `/help/sfpegListTabCmp.md`,
`/help/sfpegListViewCmp.md`.

## 1. Components — what & when

| Component | Purpose |
|---|---|
| **sfpegListCmp** | Core: contextualized, actionable list of records (SOQL/SOSL/Apex) as datatable, tree-grid, tiles or cards. Embed in App Builder. |
| **sfpegListTabCmp** | Addressable LWC wrapper opening a list in its own full tab/page (like "View All"). Opened via a `navigation` action. Use **sfpegListConsoleTabCmp** in console with pinned layouts. |
| **sfpegListViewCmp** | Aura addressable wrapper — same role, when an Aura target is needed. |
| **sfpegSearchListCmp** | List with a **search form** above it (enter criteria → Apply → query). |
| **sfpegFilterableListCmp** | List with a **local filter form** (browser-side filtering of already-fetched rows). |
| **sfpegListMapCmp** | Plots records on a lightning-map; selecting a location filters the list. |
| **sfpegOnDemandListCmp** | List with an expand button so data loads only on demand. |

All wrappers reuse the **sfpegListCmp** configuration; only extra props differ.

## 2. Metadata & App Builder props

Two records drive a list: **`sfpegList__mdt`** (data + display) and an **`sfpegAction__mdt`**
(header and/or row actions — see `actions.md`).

### Key `sfpegList__mdt` fields

| Field | Section | Purpose / values |
|---|---|---|
| Query Type | Query | **SOQL** / **SOSL** / **Apex** |
| Query Class | Query | Apex class extending `sfpegListQuery_SVC` (Apex mode) |
| Query Template | Query | SOQL/SOSL string (or JSON for Apex extensions) with `{{{token}}}`s |
| Query Input | Query | One JSON object of context values feeding the query / Apex (`{{{GEN.recordId}}}` etc.) |
| Bypass FLS? | Query | Skip `Security.stripInaccessible()` on results |
| Bypass Escaping? | Query | Skip quote-escaping of merged input (disables SOQL-injection protection) |
| Bypass Sharing? | Query | Run SOQL/SOSL without sharing |
| Do Pagination? | Pagination | Progressive load (SOQL & Apex only) |
| Query Count | Pagination | `count()` query matching the template |
| Query Order By Field | Pagination | Paging field API name, or literal `OFFSET` |
| Order Direction | Pagination | Ascending / Descending |
| Display Type | Display | **DataTable** / **DataTree** / **CardList** / **TileList** (`Hidden` for map) |
| Display Configuration | Display | The big JSON (columns/title/icon/menu…) — see §3 |
| Flatten Results? | Display | Flatten nested JSON so `Rel__r.Name` / `_length` render |
| Row Actions | Display | Dev name of `sfpegAction__mdt` whose actions are referenced by `name` |

**App Builder (sfpegListCmp):** card title/icon/CSS, `displayHeight`, `buttonSize`, show count,
#header actions before overflow, toggles for filter/sort/export/debug, `showSearch`, `showExport`,
**`Query Context`** (injected as `{{{CONTEXT}}}` so one config serves many uses), plus the
`sfpegList__mdt` and header-`sfpegAction__mdt` selectors.

**Addressable wrappers** receive page-state params: `c__list`, `c__actions`, `c__label`,
`c__title`, `c__icon`, `c__recordId`, `c__objectApiName`, `c__showSearch`, `c__showExport`,
`c__displayHeight`, `c__buttonSize`, `c__contextString`, `c__isDebug`.

**Map extras:** map height, legend, list view (visible/hidden/auto), draggable, zoom/scroll/UI
toggles. **Filterable extra:** `#filter Columns`.

## 3. Display Configuration JSON

Root properties:

| Property | Applies to | Purpose |
|---|---|---|
| `keyField` | all | **Required** unique id field (usually `"Id"`) |
| `columns` | all | Array of column defs (extends lightning-datatable/tree-grid) |
| `widthMode` | table/tree | e.g. `"auto"` |
| `hideCheckboxColumn` / `maxRowSelection` | table/tree | Row selection → enables mass actions |
| `hierarchyFields` | DataTree | Relationship field(s) defining child rows, e.g. `["Quotes"]` |
| `expandAll` | DataTree | Force all rows expanded |
| `title` | tile/card | `{label, fieldName, sortable, action, lookup, useName}` — **always set `label`, `sortable:true`, and `lookup:"Id"` (or the relevant ID field) unless there is a specific reason not to** |
| `icon` | tile/card | `{name}` or `{fieldName}` + `size`, `variant` |
| `cardNbr` / `fieldNbr` | card/tile | Tiles per row / fields per tile |
| `variant` | tile/card | `base` (default) or `timeline` |
| `details` | tile/card | Second field list shown on expand (same shape as `columns`) |
| `menu` | all | Row-action menu items `{name, label, iconName, disabled, hidden}` |
| `isDynamicMenu` / `isDynamicCondition` | tile/card | Per-row dynamic `disabled`/`hidden` (latter via `eval()`) |
| `filter` | all | Preset browser-side filter `{scope, string}` |
| `emptyMsg` / `emptyVariant` | all | No-data message (supports `{{{LBL.x}}}`; `infoLight` drops the icon) |
| `searchForm` | search list | Search form (see recipe F) |
| `map` | map cmp | Map config (see recipe G) |

**Column object:** `{label, fieldName, type, sortable, initialWidth, wrapText, typeAttributes,
cellAttributes}`. Action columns use `type:"button"` / `"button-icon"` / `"action"`.
**Default all data columns to `"sortable":true`** unless the column is an action button or a type that cannot meaningfully sort (e.g. `richText`, `multi-value`).

**Custom `type` values** (beyond standard): `richText`, `percent-fixed` (no ×100; `size` = min
fraction digits), `badge` (`iconName`,`variant`), `avatar`, `icon` (dynamic via `fieldName`),
`multi-value` (`variant`: csv/badge/icon/avatar), `lookup` (`typeAttributes.lookup.fieldName` = ID
field → auto link + hover compact layout).

### Minimal example — DataTable with a row button
```json
{
  "keyField": "Id",
  "columns": [
    { "type":"button", "fieldName":"Name", "label":"Nom",
      "typeAttributes":{"label":{"fieldName":"Name"},"name":"open","variant":"base"} },
    { "fieldName":"RecordType.Name", "label":"Type" },
    { "type":"button",
      "typeAttributes":{"label":"Edit","name":"editDml","variant":"base",
                        "disabled":{"fieldName":"HasReason__c"}} }
  ]
}
```
Referenced Row-Actions `sfpegAction__mdt`: `[{"name":"open","action":{"type":"open"}},
{"name":"edit","action":{"type":"edit"}}]` (the off-the-shelf `sfpegOpenEdit` covers both).

## 4. Query types

- **SOQL** — query in `Query Template`, token values in `Query Input`. Supports one level of
  subqueries. Pagination supported.
- **SOSL** — `FIND … RETURNING …` in `Query Template`; auto-populates an `ObjectIcon` field. No
  pagination.
- **Apex** — `Query Class` extends `sfpegListQuery_SVC` (`getData(input, query)`); `Query Input` →
  `input`. For pagination implement `getCount()` + `getPaginatedData()`. Ships with extensions
  (`sfpegSearch_SVC`, `sfpegMultiQueries_SVC`, `sfpegDependentQueries_SVC`, `sfpegRestQueries_SVC`,
  `sfpegJsonList_SVC`, `sfpegOrgLimits_SVC`, `sfpegHierarchy_SVC`) — see
  `merge-tokens-and-queries.md`.

Useful tokens in queries: `{{{GEN.recordId}}}`, `{{{GEN.objectApiName}}}`, `{{{RCD.Field__c}}}`,
`{{{CONTEXT}}}` (App Builder Query Context), `{{{CTX.x}}}` (parent/search form), `{{{PAGE}}}`
(pagination), and `LIST((({{{VALUES}}}|||;)))` to turn a `;`-separated value into a SOQL `IN` list.

## 5. Display modes

Set via `Display Type`: **DataTable** (table; supports selection+mass actions), **DataTree**
(tree-grid; needs `hierarchyFields` + `Flatten Results?`), **TileList** (single column of tiles;
`timeline`/`details`/`menu`), **CardList** (multiple tiles per row via `cardNbr`/`fieldNbr`),
**Hidden** (map only).

## 6. Recipes

**A. Filtered related list (SOQL):** `Query Input={"ID":"{{{GEN.recordId}}}"}`,
`Query Template = SELECT Name, Amount, StageName FROM Task WHERE WhatId='{{{ID}}}' AND IsClosed=false`.

**B. Tree display:** `Display Type=DataTree`, `Flatten Results?`=on, SOQL with a child subquery,
config `"hierarchyFields":["Quotes"]` + a `Quotes._length` count column. Deep hierarchies → Apex.

**C. Timeline tiles with expandable details:** `Display Type=TileList`,
`{"variant":"timeline","title":{"fieldName":"Subject","label":"Subject","sortable":true,"lookup":"Id","action":"showDetails"},"icon":{...},"columns":[…],"details":[…]}`.
Always include `label`, `sortable:true`, and `lookup:"Id"` on the `title`; add `"sortable":true` to every data column.

**D. Mass action:** add `"hideCheckboxColumn":false,"maxRowSelection":10` and a `massForm`/`massDML`
header action with `next:{type:"done",params:{type:"refresh"}}`.

**E. Open list in its own tab:** header `navigation` action to `standard__component`,
`componentName:"c__sfpegListTabCmp"`, state carrying `c__list`, `c__actions`, `c__recordId`…

**F. Search page (sfpegSearchListCmp):** `Query Type=Apex`, `Query Class=sfpegSearch_SVC`, map form
fields via `{{{CTX.Field__c}}}`, and add a `searchForm` to Display Config:
```json
"searchForm": {
  "objectApiName":"ContentProxy__c", "size":6,
  "fields":[ {"name":"Name"}, {"name":"Comment__c"}, {"name":"Types__c","size":12} ],
  "sort": { "options":[{"value":"Name","label":"Nom"}],
            "default":{"field":"Name","direction":"DESC"} }
}
```
With sort active, the selection is exposed as `{{{CTX.OrderBy}}}` (e.g. `Name ASC`).

**G. Map (sfpegListMapCmp):** add `map` to Display Config (every field must be in the query):
```json
"map":{ "title":"City__c", "value":"ExternalID_c__c",
  "location":{"City":"City__c","Country":"Country__c","Latitude":"Latitude__c","Longitude":"Longitude__c"},
  "description":["City__c","Country__c"] }
```

## 7. Gotchas

- **`Flatten Results?`** must be on for relationship fields (`Parent__r.Name`), `hierarchyFields`,
  or `_length` counts.
- **Conditional row actions**: `disabled`/`hidden` work only on `button`/`button-icon` column types
  in table/tree (not `action`-type or `menu`). In Tile/Card `menu` set `"isDynamicMenu":true`
  (and `"isDynamicCondition":true` for `eval()` conditions).
- **Row selection / mass actions**: DataTable & DataTree only. Without `maxRowSelection` all loaded
  rows are targeted; with pagination only loaded rows count.
- **Pagination**: SOQL & Apex only. OFFSET mode → `Query Order By Field=OFFSET` + `{{{PAGE}}}` at
  query end; custom mode → unique-valued field, `{{{PAGE}}}` in WHERE, matching `ORDER BY`/`LIMIT`.
  Apex needs `getCount()`+`getPaginatedData()`.
- **Security**: the three `Bypass …?` flags weaken default protections — leave off unless required.
- **SOSL multi-object name fields**: use `"title":{"useName":true}` or identically-named fields.
- **Empty `ObjectIcon` in SOSL**: define a custom tab or register the icon in `OBJECT_ICON_MAP`.
- **Console + pinned layouts**: use `c__sfpegListConsoleTabCmp` to avoid a context-init bug.
- **Map** relies on lightning-map (beta); every `map` field must be returned by the query.
