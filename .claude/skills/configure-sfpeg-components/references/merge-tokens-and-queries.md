# Merge Tokens & Query Configuration — Shared "Glue"

The cross-cutting knowledge used by every PEG_LIST component. Merge tokens contextualize config
strings; query extensions feed data into list components.

Deep-dives: `/help/sfpegMergeUtl.md`, `sfpegJson.md`, `sfpegMultiQueries.md`,
`sfpegDependentQueries.md`, `sfpegRestQueries.md`, `sfpegSearchQueries.md`, `sfpegListOrgUtilities.md`.

## 1. Merge token syntax & evaluation

`sfpegMergeUtl` finds `{{{NAMESPACE.path}}}` tokens, fetches the data, and substitutes it.

**It runs client-side via Lightning Data Service**, so:
- The user needs **read (FLS) access** to every field merged via `RCD`/`USR`/`ROW`/`CTX`.
- The object must be **LDS-supported** — **Task, Event, Knowledge__kav are NOT** (cannot use
  `RCD`/`USR` field tokens on them).

**Quoting:** do **not** wrap boolean/numeric tokens in quotes (else they become strings):
`{"isActive":{{{RCD.IsActive__c}}}}`. Picklist tokens merge the **code** by default; append `.LBL`
for the translated **label**: `{{{RCD.Status__c.LBL}}}`.

## 2. Token namespaces

### GEN — generic page/app/date
`{{{GEN.objectApiName}}}`, `{{{GEN.recordId}}}` (prefer over `RCD.Id` — far more efficient),
`{{{GEN.userId}}}`, `{{{GEN.baseUrl}}}`, `{{{GEN.now}}}`, `{{{GEN.lang}}}`. Relative dates (ISO):
`today`, `yesterday`, `tomorrow`, `lastWeek`, `nextWeek`, `lastMonth`, `nextMonth`, `lastQuarter`,
`nextQuarter`, `lastYear`, `nextYear` — append `Local` for user-local format (e.g. `GEN.todayLocal`).

### RCD — current record fields (LDS)
`{{{RCD.fieldName}}}`; lookups traverse (`{{{RCD.Owner.Profile.Name}}}`); `.LBL` for picklist label.

### USR — current user fields (LDS)
`{{{USR.fieldName}}}` — like `RCD` for the running user (`{{{USR.Name}}}`).

### ROW — row record fields (lists)
`{{{ROW.fieldName}}}` — for row-level actions; the field must be fetched by the query (even if not
displayed).

### CTX — extra usage context
`{{{CTX.fieldName}}}` — extra context (e.g. parent record). Currently only from sfpegActionBarCmp
via its `parentContext` property (also carries search-form values, e.g. `{{{CTX.OrderBy}}}`).

### Other namespaces
- `{{{LBL.labelName}}}` — custom label (user language).
- `{{{RT.objectApiName.developerName}}}` — record type Id.
- `{{{PERM.permissionName}}}` / `{{{NPERM.permissionName}}}` — boolean has / hasn't custom permission.
- `{{{VFP.pageName}}}` — full VF page URL incl. CSRF token.
- `{{{CST.settingApiName.fieldName}}}` — hierarchical Custom Setting field (Org>Profile>User).
- `{{{DMN.siteName}}}` — root URL of a Site (Guest-mode redirects).
- `{{{FLBL.ObjectName.FieldName}}}` — object field label, merged **server-side** (see §6).

### Post-merge modifiers
- `ESCAPE(((…)))` — escape `"`→`\"` and `\r`/`\n`/`\t`→space, so text/rich-text values don't break
  JSON. Place inside the field's quotes: `{"value":"ESCAPE((({{{RCD.Description}}})))"}`.
- `UTF(((…)))` — replace special chars (`,`→`%2C`, `+`→`%2B`, `\`→`%5C`…) for navigation `state`.
- `ADD(((value|||item|||sep)))` / `RMV(((…)))` — add/remove a value in a multi-value (e.g.
  multi-picklist with `;`); fault-tolerant. Used with `LDS` actions.

## 3. sfpegConfiguration__mdt — custom merge tokens

Extends the token set: each record defines a new prefix that resolves Salesforce IDs for specific
records. Predefined: `RPT` (reports), `DBD` (dashboards), `FLD` (folders) — e.g. `{{{DBD.MyDash}}}`.

Record fields: **Name** (prefix, e.g. `ROLE`), **Field** (identifier field referenced in the token,
e.g. `SourceSystemId__c`), **Target Field** (resolved value, usually `Id`), **Query** (SOQL
template; the requested values are auto-appended after `IN`):
```
SELECT <Target Field>, <Field> FROM <OBJECT> WHERE <Field> IN
```
Dashboard navigation example: `"recordId":"{{{DBD.LeadOpportunityDashboard}}}"`.

## 4. Query extensions (Apex query types)

All implement `getData()` of `sfpegListQuery_SVC`, wired via `sfpegList__mdt`:
`Query Type=Apex`, `Query Class=<extension>`, `Query Input`=JSON context, `Query Template`=class
JSON config (with `{{{token}}}`s from Query Input). ⚠️ **None support pagination.**

### Multi-Queries — `sfpegMultiQueries_SVC`
Concatenate several SOQL results (UNION-like); each row tagged with a `Query` property; **no dedup**.
```json
{ "Previous":"SELECT … WHERE … AND StartDate < {{{DATE}}} ORDER BY StartDate desc LIMIT 1",
  "Next":"SELECT … WHERE … AND StartDate > {{{DATE}}} ORDER BY StartDate asc LIMIT 1" }
```

**Global cross-query sorting** (optional): set `Query OrderBy Field` to the API name of a field
common to all queries, and `Order Direction` to `Ascending` or `Descending` (nulls always last).
⚠️ If the objects differ, create formula fields with the **same API name** on each SObject so all
rows carry the sort field.

**Example — Activity timeline** (Tasks + Events ordered by `ActivityDate DESC`):
- `Query OrderBy Field` = `ActivityDate`, `Order Direction` = `Descending`
- `Query Template`:
```json
{
  "Tasks": "SELECT Id, Subject, TypeIcon__c, Status, ActivityDate, Description, OwnerId, Owner.Name FROM Task WHERE WhatId = '{{{ID}}}' AND CreatedDate = LAST_N_DAYS:7 ORDER BY ActivityDate DESC NULLS LAST",
  "Events": "SELECT Id, Subject, TypeIcon__c, ActivityDate, Description, OwnerId, Owner.Name FROM Event WHERE WhatId = '{{{ID}}}' AND CreatedDate = LAST_N_DAYS:7 ORDER BY ActivityDate DESC NULLS LAST"
}
```
- `Display Type` = `TileList`, `Display Configuration` (timeline variant with sortable fields + title lookup):
```json
{
  "keyField": "Id",
  "variant": "timeline",
  "stacked": true,
  "title": { "fieldName": "Subject", "label": "Subject", "sortable": true, "lookup": "Id", "action": "showDetails" },
  "icon": { "fieldName": "TypeIcon__c", "size": "small" },
  "columns": [
    { "fieldName": "Status", "label": "Status", "sortable": true },
    { "fieldName": "ActivityDate", "label": "Due Date", "type": "date-local", "sortable": true },
    { "type": "lookup", "fieldName": "Owner.Name", "label": "Owner", "typeAttributes": { "lookup": { "fieldName": "OwnerId" } }, "sortable": true }
  ],
  "details": [
    { "fieldName": "Description", "label": "Description", "wrapText": true }
  ]
}
```

### Dependent Queries — `sfpegDependentQueries_SVC`
Run subqueries to extract Id/String lists, inject into the main query's `IN(...)`. Set **Bypass
Escaping** (results merged into SOQL). Empty subquery → `IN ('')`.
```json
{ "query":"SELECT Id, Name FROM TrnCourse WHERE Id IN (SELECT CourseId__c FROM CatalogueCourse__c WHERE CatalogueId__c IN({{{CAT_LIST}}}))",
  "subqueries":{ "CAT_LIST":{ "query":"SELECT CatalogueId__c FROM CatalogueCourse__c WHERE CourseId__c='{{{ID}}}'","field":"CatalogueId__c" } } }
```

### REST Queries — `sfpegRestQueries_SVC`
Callout to an external endpoint. `Query Template`: `endPoint` (supports `callout:Named/…`), `header`,
`method`, optional `body`, `resultField` (list field in the response). Merge applies to the whole
template. Pair with **Flatten Results?**. Keep **Bypass Escaping off**.

### Search Queries — `sfpegSearch_SVC`
Switches SOSL (term >2 chars, last char not `?`/`*`) vs fallback SOQL, building dynamic WHERE
clauses. `Query Template`={`sosl`,`soql`}; each has a `where` map of clause objects: `AND`/`OR`
lists of `RAW` (literal), `EQ` (`=`/`!=`), `IN` (`;`-list), `INCL` (multi-picklist INCLUDES). A
clause whose value resolves empty is omitted. Used by **sfpegSearchListCmp**. Keep **Bypass
Escaping off**.

### JSON-as-list — `sfpegJsonList_SVC` / `sfpegJsonAction_SVC`
Store a JSON-object list in a text/rich-text field and show it as a related list (no child object).
`Query Class=sfpegJsonList_SVC`; an `index` property keys each object; `apexForm` add/update/remove
via `sfpegJsonAction_SVC` (params: `operation` add/update/remove, `objectApiName`, `fieldName`,
`recordId`, `index`); set the display `keyField` to `index`; refresh via `next` (reload→done/refresh).

### Hierarchy — `sfpegHierarchy_SVC`
Tree-grid sub-hierarchies. `Query Template` props: `Query`, `Fields`, `ParentField`, `ChildrenList`,
`NameField`, `MaxDepth`, `MaxSize`, `SizeStep`.

### Org Utilities (ready-made)
`sfpegOrgLimits` (`sfpegOrgLimits_SVC`, from `OrgLimits.getMap()`) and `sfpegObjectDescriptions`
(`sfpegObjectKeys_SVC`, from `Schema.getGlobalDescribe()` — objects, key prefixes, RT counts).

## 5. Result shaping
- **Flatten Results?** — flatten nested JSON (e.g. `Owner.Name`) so dotted paths work as DataTable
  `fieldName`s. Needed for REST results, relationship fields, `_length` counts.
- Columns support `"sortable":true`; multi-query `Query` field is a sortable grouping column;
  `resultField` extracts the list from a nested response field; `keyField` is required.

## 6. Gotchas
- **FLS / read access** required for every `RCD`/`USR`/`ROW`/`CTX` field (fetched via LDS).
- **LDS-only objects** for `RCD`/`USR`: not Task / Event / Knowledge__kav.
- Prefer **`GEN.recordId`** over `RCD.Id`.
- Don't quote boolean/numeric tokens; use `.LBL` for picklist labels.
- Wrap text/rich-text in **`ESCAPE(((…)))`**; use **`UTF(((…)))`** in navigation `state`.
- **Bypass Escaping**: off for REST & Search (injection protection); intentionally **on** for
  Dependent Queries (subquery results merged into SOQL).
- No pagination in Apex query extensions; multi-queries don't dedup.
- **Server-side merge**: in sfpegListCmp & sfpegKpiListCmp, `LBL`/`FLBL` tokens in display configs
  are merged server-side (via `sfpegMerge_CTL`) to localize column labels — distinct from the
  client-side merge for everything else.
