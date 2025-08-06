# ![Logo](/media/Logo.png) &nbsp; **sfpegListCmp** Component

## Introduction

The **sfpegListCmp** component displays a contextualised and actionable list of records in 3 main formats
(data table, data tree or tile list), data being retrieved via SOQL, Apex...

As a baseline, in SOQL data-table mode, it provides a powerful alternative solution to the standard Lightning
related lists by offering more flexibility in:
* the selection of the records to display (e.g. filtered related list, sub-related list...)
* the actions available on this record selection (more than the standard edit/delete)

It further extends these capabilities by providing:
* a wide variety of alternative record fetch methods (SOQL, SOSL or custom Apex)
* the ability to handle completely custom data sets (as Apex `Map<String,Object>` lists converted as JSON objects)
e.g. fetched via callouts to external systems (without the need for external objects) or built from custom
Apex logic (combining multiple related records, rebuilding record hierarchies...)
* a extended set of display options (tiles, tree-grid) to handle cases where data-table are not suitable
from a UX perspective
* out-of-the-box record list filtering, sorting and CSV export capabilities
* the option to load records progressively (pagination) for potentially large data sets (the total count being
automatically fetched upon instantiation, a _load more_ button being displayed in the component's footer as long
as this total count has not been loaded)

ℹ️ If you wish to actually load the data only when the user explicitly requests it, you
may use the **sfpegOnDemandListCmp** _wrapper_ component (see in the examples) which
includes an _expand_ button icon to control the actual display of a **sfpegListCmp**.

---

## Component Configuration

### Global Layout

The **sfpegListCmpt** component consists in a single
[lightning-card](https://developer.salesforce.com/docs/component-library/bundle/lightning-card/documentation):
* displaying a list of records in different display formats (see above) with (optional) row actions
* providing global actions from its header (e.g. to launch flows, create new records, execute mass actions
on selected rows, navigate to a report or dashboard...)

Hereafter are provided examples of various display types.

![List as tiles](/media/sfpegListTiles.png)<br/>
_Display as list of Tiles (1 tile per row)_

![List as tile cards](/media/sfpegListCards.png)<br/>
_Display as list of Tile Cards (2 tiles per row)_

![List as timeline](/media/sfpegListTimeline.png)<br/>
_Display as list of Tiles in timeline variant (1 tile per row)_

![List as data table](/media/sfpegListTable.png)<br/>
_Display as Data Table_

![List as tree grid](/media/sfpegListTree.png) <br/>
_Display as Tree Grid_

_Note_:In the last _TreeGrid_ example, fetching data with custom Apex enables to fetch
a whole multi-level record hierarchy in a single call (while SOQL only supports 1 level of
embedded subqueries)


### App Builder Configuration

For the **sfpegListCmp** component, a lot of properties may be set directly in the App Builder:
* Wrapping card customisation properties (title, icon, CSS, max-height, built-in action button size,
display of record number, number of header actions displayed before overflow...)
* Built-in actions activation (filter, sort, export, debug...)

However, most of the configuration lies in two custom metadata referenced records (see orange zones below):
* a **sfpegList__mdt** record for the data fetch & display
* a **sfpegAction__mdt** record for the custom header and footer actions (see **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** for details)

![List App Builder Configuration](/media/sfpegListConfiguration.png)


### Metadata Configuration

The **sfpegList__mdt** custom metadata provides the most important configuration items of the **sfpegListCmp**
components. It contains multiple sections of properties to respectively configure the way how:
* data are fetched
* pagination is handled (if applicable)
* data are displayed (including row level actions)

![Main List Metadata Record](/media/sfpegListConfigMeta.png)

_Note_: Context merge is systematically applied to the `query input` property upon initial load/refresh
(see **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component) to adapt the query context to the display environment.
Label related ***merge tokens*** are also evaluated in the `Display Configuration` property to adapt
labels to the user language.


The **Query** section defines how data are retrieved: 
* Query or Apex class to be applied
    * `Query Type` to select a fetch mode (SOQL, SOSL, Apex)
    * `Query Class` (if _Apex_ mode is chosen) to specify the name of the Apex class to call 
    (implementing **sfpegListQuery_SVC** virtual class) 
    * `Query Template` (formely `Query SOQL`) to specify the SOQL/SOSL query to execute (when these modes are chosen).
    * `Bypass FLS ?` to bypass FLS controls (see standard **[Security.stripInaccessible()](https://developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_classes_with_security_stripInaccessible.htm)** method) in the SOQL or SOSL results.
    * `Bypass Escaping ?` to bypass quote escaping when merging Input data in the Query template (protection against SOQL injection).
    * `Bypass Sharing ?` to bypass Sharing when executing a SOSL or SOQL query.
* Inputs required to contextualise the fetch
    * `Query Input` to specify a single JSON context object to contextualise the query or
    be passed as input to the Apex class fetch method
    * For the `Query Template`, the properties of this JSON object are to be merged via 
    `{{{propertyName}}}` tokens in the query string  (e.g. `{{{ID}}}` in the example
    above to fetch the ID property value of the input object)
    * The values of this JSON object may be initialized via any `{{{mergeToken}}}` supported
    by the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component
    (e.g. `{{{GEN.recordId}}}` in the example above to fetch the Salesforce ID of the current page record)

_Note_: Additional security related parameters will be soon added for the SOQL mode, such as `enforce FLS` and `bypass sharing`.


The **PaginationHandling** section defines how pagination (for progressive data load for large data sets) should work:
* `Do Pagination ?` to check to activate pagination (supported only in SOQL and Apex modes for now)
* `Query Count` to provide a SOQL `count()` query corresponding to the _Query SOQL_ (if SOQL mode retrieval is used)
* `Query Order By Field` and `Order Direction` to let the component properly manage the pagination (the feature not
relying in the standard SOQL `OFFSET` mechanism but on explicit `WHERE` clause statements).
* When pagination mode is activated in SOQL mode, the _Query SOQL_ should then include 
    * a specific `{{{PAGE}}}` merge token within its `WHERE` clause to set the page range limit (lower or higher depending on direction)
    * a `LIMIT` clause to set the page size (in number of records)
    * an `ORDER BY` clause corresponding to the specified _Query Order By Field_ and _Order Direction_ properties
* When pagination mode is activated in Apex mode, the called _Query Class_ should then implement the  `getCount()`
and `getPaginatedData()` methods instead of the base `getData()` one.


The **Display** section defines how data are displayed in the component:
* `Display Type` to choose among the four display modes supported (_DataTable_, _DataTree_, _CardList_, _TileList_),
most of the configuration element being shared among them (or simply ignored)
* `Display Configuration` to define how data are displayed, as a single JSON object structure leveraging (and extending)
the JSON display configuration of the standard
[lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) and
[lightning-tree-grid](https://developer.salesforce.com/docs/component-library/bundle/lightning-tree-grid/documentation) base components.
    * This is especially applicable to the _columns_ property
    * Additional root properties have been added for the _CardList_ and _TileList_ modes to tune their specific layouts
        * `title` and `icon` to configure the title and optional icon for each tile displayed in these modes,
        icon name being either static (by providing a `name` property) or dynamic (by providing a `fieldName` property,
        this field containing the actual icon name to be used) 
        * `cardNbr` and `fieldNbr` to respectively set the number per row of tiles and fields (within a tile,
        if _CardList_ mode is used) 
    * An optional `menu` property describing the row action menu (`name`, `label` and optional `icon` of each menu
    item) to be displayed in each tile / at the end of each _DataTable_/_TreeGrid_ row (see `Row Actions` below).
    * An optional `variant` property enables to alter the display of the tiles
        * For now, two values are available, i.e. _base_ for default tile box display or _timeline_ for timeline like display (no box, vertical grey border under the icon)
    * An optional `details` property enabling to set a second list of fields (similar to the `columns` one)
        * setting this property activates an expand/collapse on the tile content
        * when expanded, the fields of this list are displayed below the main ones in a _cardList_ mode
    * An optional `expandAll` property enabling to force all rows of a _TreeGrid_ to be fully expanded by default.
    * An optional `stacked` property enabling to enforce a stacked field display (with labels above values)
    for `details` and `columns` fields (when in _cardList_ mode for the second)
* `Flatten Results?` to activate fetched data JSON structure ***flattening*** in order to let related record data being
properly displayed within _DataTable_ or _TreeGrid_ components (which do not support displaying data from JSON sub-objects,
as when related record fields are fetched)
* `Row Actions` definining the actions available at row level 
    * It should simply provide the developer name of a **sfpegAction__mdt** custom metadata record containing the actions
    used within the `Display Configuration` property (identified by their `name` properties).
    * This may apply to _button_ or _action_ items of the `columns` property (see
    [lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation)
    for details)
    * This may also apply to the `menu` property defining the tile menu for the _TileList_ and _CardList_ display modes or
    the appended last column menu in _DataTable_ and _TreeGrid_ modes.
    * This at last also applies to the `action` sub-property of the `title` property for the _TileList_ and _CardList_ display
    modes (to activate an action link on the tile title)
    * Beware that conditional activation of actions does not work for _action_ entries in the _DataTable_ and _TreeGrid_
    columns (i.e. only for _button_ ones), while they properly work in the menu for the _TileList_ and _CardList_ modes.

Hereafter is an example of the **sfpegAction__mdt** record used for row level actions in the previous example.<br/>
![Row Action Metadata Record](/media/sfpegListConfigMetaAction.png)


### No Data Display Handling

By default, the component only displays the card header with header actions when
there is no data to display (and no error).

![List with no data](/media/sfpegListNoData.png)

It is however possible to change this behaviour and specify a default message
displayed when no data is available via the `emptyMsg` property in the
`Display Configuration`.

![List with no data and message](/media/sfpegListNoDataMsg.png)

_Notes_:
* ⚠️ For proper display of the _no data_ layout, beware to include the `slds-theme_shade`
class in the `Card CSS Class` App Builder property when using the `slds-card_boundary`
card border class!
* Custom labels may be used for the `emptyMsg` property leveraging the **LBL** merge
token.
* It is also possible to slightly alter the appearance of this message via the
`emptyVariant` property (e.g. replacing the default `info` by `infoLight` to remove
the information icon).

Hereafter is such an example.
```
{
    "keyField":"Id",
    "emptyMsg":"{{{LBL.EmptyListCustomLabelName}}}",
    "emptyVariant":"infoLight",
    ...
}
```

### Special Paginated Use Cases

When using the pagination, this example should be modified the following way:
* `Query Template` should be modified to :<br/>
```
SELECT...  WHERE  WhatId = '{{{RECORD}}}' and IsClosed = false and RecordType.DeveloperName = 'NBA' and {{{PAGE}}} order by Id desc limit 5
```
* `Query Count` should be set to : <br/>
```
SELECT count() FROM Task WHERE  WhatId = '{{{ID}}}' and IsClosed = false and RecordType.DeveloperName = 'NBA'
```
* `Query OrderBy Field` should be set to `Id`
* `Order Direction` should be set to `Descending`


### Special Preset List Filter

It is also possible to preset a filter applied on the list of records, this filtering being
automatically applied on browser side after data fetch. 

You just need to include a `filter` property in the `Display Configuration` parameter, specifying
filter `scope` and `string` to be applied.
```
    ...
    "filter":{
        "scope": "CheckBox__c",
        "string": "true"
    }
    ...
```

_Note_: if no scope is defined, the default _ALL_ scope is used.


### Row Selection and Mass Action Handling

When using the `DataTable` or `DataTree` display modes (not supported in `TileList` or `CardList` yet),
it is possible to activate the row selection feature and trigger mass actions from the **sfpegListCmp**
header action bar.

In order to activate the row selection feature, it is necessary to add the following properties in the 
**Display** configuration:
```
...
    "hideCheckboxColumn": false,
    "maxRowSelection": 10,
...
```

Otherwise, all records displayed in the component (or only the first level ones in `DataTree` mode) are
considered for any mass action triggered. If pagination is used, only the loaded ones are considered as
well.

This list of row selected rows is then automatically made available (and updated) to
the header action component to support the trigger of ***mass actions*** on this base (see 
**[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** for details), e.g. to mass edit selected records.

Hereafter is an example of a mass update form with a ***refresh*** after update.
```
{
    "name": "closeForm", "label": "Close Selected", "iconName": "utility:close",
    "action": {
        "type": "massForm",
        "params": {
            "title": "Close the Actions",
            "message": "Please fill in the following information",
            "removeRT": true,
            "columns": 2,
            "record": {
                "ObjectApiName": "TST_Action__c",
                "RecordTypeId": "RT.TST_Action__c.RT1",
                "Done__c": true
            },
            "fields": [
                { "name": "Reason__c", "required": true},
                { "name": "Done__c", "disabled": true }
            ],
            "next": {
                "type": "done",
                "params": {
                    "type": "refresh"
                }
            }
        }
    }
}
```

### Specific Action Features

The **sfpegListCmp** includes some specific features concerning the action functionality provided
by the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**

* It provides a specific ***refresh*** action type to force a reload of the displayed data,
usually called within a `next` action property (e.g. to execute a list reload after a
record creation or row update, see mass action example above)
* It also provides a specific ***filter*** action type to quickly set/unset the **sfpegListCmp** filter value.

Hereafter is an example of a set of ***filter*** actions to set / unset specific filter conditions.<br/>
![List Filter Action Menu](/media/sfpegListFilterAction.png)

```
...{
    "name": "selectionMenu", "iconSize": "small",
    "items": [
    {   "label": "SMS", "iconName": "utility:filter",
        "action": { "type": "done",
                    "params": { "type": "filter",
                                "params": { "scope": "Channel", "string": "SMS"}
                    }
        }
    },
    {   "label": "Email", "iconName": "utility:filter",
        "action": { "type": "done",
                    "params": { "type": "filter",
                                "params": { "scope": "Channel", "string": "EMAIL" }
                    }
        }
    },
    {   "label": "Courrier", "iconName": "utility:filter",
        "action": { "type": "done",
                    "params": { "type": "filter",
                                "params": {"scope": "Channel", "string": "MAIL" }
                    }
        }
    },
    {   "label": "All", "iconName": "utility:filter",
        "action": { "type": "done",
                    "params": { "type": "filter",
                                "params": { "scope": "ALL", "string": "" }
                    }
        }
    }]
}...
```

### Context Merge Upon Query

Context merge is systematically applied to the `query input` property upon initial load/refresh of the **sfpegListCmp** component to gather information about the display context. This information is then
provided when collecting data and `{{{XXX}}}` tokens present in the query templates replaced by the 
corresponding fields of this `query input` object.

A special `{{{CONTEXT}}}` token is also available, the value of which may be set via the `Query Context`
string property in the App Builder. This enables to reuse the same **sfpegList** configuration for
various use cases, when multiple queries only vary by one parameter.
An example is the **sfpegRecordShares** configuration provided in the example folder, which list
the sharing rows related to the record of the current page:
* record ID is fetched via the `query input` property set in the **sfpegList** configuration as `{"ROW":"{{{GEN.recordId}}}"}`
* sharing object API name is provided via the `Query Context` property set in the App Builder, e.g. as `MyCustomObject__share`
* the `query template` in the **sfpegList** configuration then merges the 2 tokens at their proper place
in the SOQL query as `Select Id, UserOrGroupId, UserOrGroup.Name, RowCause, AccessLevel from {{{CONTEXT}}} where ParentId = '{{{ROW}}}'`

For multi-picklist or CSV like text fields, a special post-processing may also be executed after token
merge via the `LIST(((xxxx|||y)))` syntax. It converts a CSV like text value `xxxx` using `y`as separator
into a valid value list for a `IN` where clause.
The following **sfpegList** configuration illustrates the use-case:
* current record's multi-picklist field value is fetched via the `query input` property set as
`{"VALUES":"{{{RCD.MultiPicklist__c}}}"}`
* another target custom object uses the same value set on a picklist field and matching records are
fetched via the `query template` property set as
`SELECT Name, Picklist__c FROM TargetObject__c WHERE Picklist__c IN LIST((({{{VALUES}}}|||;)))`
* a resulting SOQL query after merge would be `SELECT Name, Picklist__c FROM TargetObject__c WHERE Picklist__c IN ('value1','value2')`

A technical `parent context` property (not available in App Builder) also enables a parent component
to inject additional context information to be leveraged as additional `{{{CTX.xxx}}}` tokens when the
**sfpegListCmp** component is included in another custom component (see also **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component).


---

## Configuration Examples

### Lookup Field Handling 

Lookup fields do not work natively in the component. Depending on the display mode selected, different
workarounds are available.

For the `Datatable` and `DataTree` modes, the strategy consists in configuring a button in `base` variant,
this button having the name of the target record as label and triggering a `navigation` action (or simply `open`
addressing the current row)
```
"columns": [
    ...
    {
        "label":"Nom",
        "fieldName":"Name",
        "type":"button",
        "sortable":"true",
        "typeAttributes":{
            "label":{"fieldName":"Name"},
            "title":{"fieldName":"RecordSummary__c"},
            "name":"open",
            "variant":"base"
        }
    }
    ...
]
```
_Notes_:
* in the example above the `Name` field displayed is specified twice in the configuration, once as root `fieldName`
to be used for sorting and a second time within the `label` property of the button `typeAttributes` to be 
actually displayed in the button.
* the button `title` may also be specified dynamically to display contextual additional information upon
hovering (no compact layout preview available for now but PLANNED).
* the `name` property in the button `typeAttributes` should identify the name of the row action to be triggered
(which should match one of the actions available in the **sfpegAction__mdt** record referenced in the `Row Actions`
property of the current **sfpegList__mdt** record)


For the `CardList` and `TileList` modes, the solution is slightly different
* an action may be specified for the tile title (referencing one of the row actions)
```
    ...
    "title": {
        "fieldName": "Name",
        "sortable": true,
        "action": "open"
    },
    ...   
```
* other navigation actions may be specified in the menu (referencing any row action),
a generic button icon menu being displayed if more than one option is configured
(single button or button icon otherwise).
```
"menu": [
    ...
    {
        "name": "openAccount",
        "label": "Open Account",
        "iconName": "utility:open"
    },
    ...
]
```

?

As a workaround for record previews, the `showPreview` action type may be used instead of the `navigation`
one (see **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**) to display a summary of the record.

### Display Image In Datatable Column

For the `Datatable` mode, The `customImage` type can be used to display images directly within the Lightning datatable cells. Instead of showing plain text or links, custom images(e.g png,svg,jpg,etc.) can be used.

To add an image column to the datatable, the 'customImage' type should be set within `Display Configuration` JSON :

```
{
    "label" : "Profile Picture",
    "type" : "customImage",
    "fieldName" : "profilePicture",
    "sortable" : "true",
    "typeAttributes" : {
        "imageUrl" : {
            "fieldName" : "profilePicture"
        }
    },
    "cellAttributes" : {
        "alignment" : "center"
    }
}
```

_Notes_:

* The property `imageUrl` is always mandatory as it indicates from which field it is going to read the image url. Hence, the field value should be in the form of `"/resource/example/image.png"`.

* in the example above the `fieldName` field displayed is specified twice in the configuration, once as root
to be used for sorting and filtering, secondly within the `typeAttributes` property of the `imageUrl` attribute.

### Timeline Configuration

The **sfpegListCmp** may be configured to look as follows:<br/>
![List as timeline](/media/sfpegListTimeline.png)<br/>
_Display as list of Tiles in timeline variant with expandable section_

In this example, within the related **sfpegList__mdt** custom metadata
* the **Display Type** must be set in `TileList` (selected option in the example) or `CardList` mode.
* the **Display Configuration** should activate both:
    * the `timeline` variant (via the `variant` property)
    * an expandable section displaying additional detail fields for each tile (via the `details` property). 
```
{
    "keyField":"Code_Campagne",
    "cardNbr":1,
    "fieldNbr":2,
    "variant":"timeline",
    "title":{"label":"Code_Campagne", "fieldName":"Code_Campagne","sortable":true,"action":"showDetails"},
    "icon":{"size":"x-small","name":"standard:event"},
    "columns":[
        {"label":"DateEnvoi","fieldName":"DateEnvoi","sortable":true,"type":"dateTime"},
        {"label":"TypeCanal","fieldName":"TypeCanal","sortable":true},
        {"label":"Segment","fieldName":"Segment","sortable":true},
        {"label":"Open?","fieldName":"isOpened","type":"boolean","sortable":true}
    ],
    "details":[
        {"label":"Domaine","fieldName":"Domain"},
        {"label":"Segment","fieldName":"Segment"},
        {"label":"Type de Canal","fieldName":"TypeCanal"},
        {"label":"Objectif","fieldName":"Objectif"}
    ]
}
```

_Notes_:
* In `timeline` mode, an icon is always displayed within each tile (default value being `utility:info_alt`).
* More generally, for the `icon` property, it is possible to set a fixed or a record dependent icon name via respectively the `name` or `fieldName` properties. For _utility_ icons, it is also possible to dynamically set the variant (color) by setting the `variant` property to `{"fieldName":"fieldApiName__c"}` instead of a string fixed variant name. 


### Apex List Retrieval and OpenURL Action with Rework 

In that example, the **sfpegListCmp** component is configured in _DataTable_ mode and leverages
an Apex Class to fetch metadata about the different attributes of a given SObject.
It is displayed in a Knowledge Article and leverages a custom field identifying a given SObject.<br/>
![Object Attributes List](/media/sfpegListObjectAttributes.png)

The Query is configured as an Apex fetch, with a class leveraging the
**Schema.describe()** methods to provide the proper information.<br/>
![Object Attributes List Metadata](/media/sfpegListObjectAttributesMeta.png)

The display is configured as follows:<br/>
```
{
    "keyField":"QualifiedApiName",
    "widthMode":"auto",
    "columns":[
        {"label":"Label","fieldName":"Label","sortable":true},
        {"label":"Description","fieldName":"Description","sortable":true},
        {"label":"Type","fieldName":"DataType","sortable":true},
        {"label":"Status","fieldName":"BusinessStatus","sortable":true},
        {"label":"Compliance","fieldName":"ComplianceGroup","sortable":true}
        {"label":"Security","fieldName":"SecurityClassification","sortable":true},
        {"label":"API Name","fieldName":"QualifiedApiName","sortable":true},
        {"type": "button-icon", "initialWidth": 50,
            "typeAttributes": {
                "name": "open", "variant":"bare","iconName": "utility:open"}
        }
    ]
}
```

The row action provides a direct link to the Setup page for each attribute (via an _openURL_ 
action with rework feature activated).<br/>
```
{
    "name":"open",
    "action":{
        "type":"openURL",
        "params":{
            "url":"/lightning/setup/ObjectManager/{{{ROW.EntityDefinitionId}}}/FieldsAndRelationships/SUBSTR({{{ROW.DurableId}}},'.',1)/view",
            "reworkURL":true
        }
    }
}
```

### Custom Experience Site Result Search Page

In that example, the query template is based on a SOSL multi-object request to filter the **Files** and **Knowledge** articles
applicable to the considered Experience Site. By default, Salesforce Search returns all possible results the user has access
to and this induce the possible display of records corresponding to other Experience Sites (depending on record sharing).

![Experience Site Search Results](/media/sfpegListExperienceSearch.png)

The solution consists in using the **sfpegListCmp** in the Search result page while injecting the search terms set by the 
user into the input context to a SOSL query leveraging additional standard filtering capabilities (via `WHERE` clauses).

In the **Experience Builder**, the most important configuration is to set the value of the `Query Context` property to
the Experience Search Site page `{!term}` variable, as shown below.

![Experience Site Search Configuration](/media/sfpegListExperienceSearchConfig.png)

This context may then be reused as input to the SOSL query in the **sfpegList** record's `Query Template`property
via the `{{{CONTEXT}}}` merge token.
```
FIND '{{{CONTEXT}}}' IN ALL FIELDS RETURNING
Knowledge__kav(Title,CreatedDate,TOLABEL(Niveau__c), Summary,Description__c WHERE Type__c = 'FAQ'),
ContentDocument(Title, FileType, Description, ContentSize WHERE FileType IN ('PDF','DOCX','PPTX') and Type__c = 'FAQ' )
```

Filtering relies here on custom `Type__c` fields set on Files and Knowledge articles to define the visibility scope
(this Experience Site displaying only **FAQ** records).

The Display configuration leverages the `ObjectIcon` field automatically set when executing the SOSL query. This
configuration may be used in _DataTable_ or _TileList_ modes (the second being used in the example displayed before).
```
{
    "keyField": "Id",
    "hideCheckboxColumn": true,
    "widthMode": "auto",
    "cardNbr": 1,
    "title": {"label": "Titre","fieldName": "Title","action": "open"},
    "icon": {"label": "Type","fieldName": "ObjectIcon"},
    "columns": [
        {"label": "Titre","fieldName": "Title","sortable": "true","wrapText": false,
            "cellAttributes": {"iconName": {"fieldName": "ObjectIcon"}}},
        {"label": "Date de création","fieldName": "CreatedDate","type": "date","initialWidth": 150,"sortable": true},
        {"label": "Niveau","fieldName": "Niveau__c","initialWidth": 150,"sortable": true},
        {"label": "Type","fieldName": "FileType","initialWidth": 100, "sortable": true},
        {"label": "Taille (en Octets)","fieldName": "ContentSize","type": "number","initialWidth": 150,"sortable": true},
        {"type": "button-icon","initialWidth": 50,
            "typeAttributes": {"iconName": "utility:open","name": "open","variant": "bare","iconClass": "slds-text-color_success"}}
    ],
    "details": [
        {"label": "Sommaire","fieldName": "Description__c","sortable": true,"type" : "richText"},
        {"label": "Description","fieldName": "Description","sortable": true}
    ]
}
```

The `Row Actions` may be set to `sfpegOpenEdit` in order to support the **open** actions configured.

_Notes_:
* When handling SObjects with different Name fields (e.g. Title, Subject and standard Name) as results 
of a same SOSL query, you may specify `"title":{"useName":true}` to automatically set the 
tile title with the proper Name field value depending on the SObject. Alternatively, you may define
custom fields with exactly same names on the different SObjects.
* If the `ObjectIcon` value returned by the SOSL search is empty or incorrect, you may need to 
define a custom tab for the custom object for the Apex logic to find it or register the actual
valid icon name for the standard object in the `OBJECT_ICON_MAP` static map of the `sfpegList_CTL` class
(this may often happen with Industry or technical standard objects).

### Simple SOQL Based DataTree Display Configuration

In that example,the **sfpegListCmp** component is configured in _TreeGrid_ mode to 
display the set of Opportunities and Quotes related to an Account. From this component,
the user may directly open a record by clicking on its name, edit it (via the standard
edit layout in a popup) via the edit button icon or even directly change the quote
synced with the opportunity via the sync button icon (available depending on the 
quote synch status).

![SOQL DataTree](/media/sfpegListDataTreeSOQL.png)

The configuration of this component relies on a simple SOQL query with embedded
subqueries (`Query Template`property);
```
SELECT Name, Amount__c, StageStatus__c, inactiveSync__c,
(select Name, Amount__c, StageStatus__c, IsSyncing, inactiveSync__c, OpportunityId from Quotes)
FROM Opportunity
WHERE AccountId = '{{{ID}}}'
```
The ID of the current Account is fetched by setting the `Query Input` property to 
```
{"ID":"{{{GEN.recordId}}}"}
```

As Quotes and Opportunities have different names for Amounts and Stage/Status, the 
strategy is to define formula fields with exactly the same API name on both objets:
* `StageStatus__c` respectively mapped to the Opportunity `StageName` and Quote `Status` 
* `Amount__c` respectively mapped to the Opportunity `Amount` and Quote `TotalPrice`

In order to deactivate the synch button for all Opportunity records, another `DisableSync__c`
formula field is defined  
* always _true_ for Opportunity
* equal to `IsSynced` for Quote

The `Display Configuration` may then be set as follows:
```
{
    "keyField":"Id",
    "widthMode":"auto",
    "hideCheckboxColumn": true,
    "hierarchyFields":["Quotes"],
    "widthMode":"auto",
    "columns": [
        { "label":"Name", "fieldName": "Name", "type": "button", "sortable": "true", "initialWidth": 250,
            "typeAttributes":{"label":{"fieldName": "Name"},"name":"open","variant":"base"}},
        { "label": "Stage / Status", "fieldName": "StageStatus__c", "sortable": true},
        { "label": "Amount", "fieldName": "Amount__c", "type":"currency", "sortable": true},
        { "label": "#Quotes", "fieldName": "Quotes._length", "type":"number", "sortable": true},
        { "label": "Synced?", "fieldName": "IsSyncing", "type":"boolean"},
        { "iconName":"utility:settings","type": "button-icon", "initialWidth": 10,
            "typeAttributes": {"title": "Edit record","name": "edit","iconName": "utility:edit","variant": "bare" }},
        { "type": "button-icon", "initialWidth": 10,
            "typeAttributes": {"title": "Synchronize Quote","name": "synchQuote","iconName": "utility:sync","variant": "bare","disabled": { "fieldName": "DisableSync__c" } }}
    ]
}
```

The `Row Actions` should provide the name of a **sfpegAction** metadata record containing the
actual definition of the 3 actions used, i.e. _open_, _edit_ and _synchQuote_.
```
[
    {"name": "open","action": {"type": "open"}},
    {"name": "edit","action": {"type": "edit"}},
    {"name": "synchQuote",
        "action": {"type": "LDS",
            "params": {"type": "update",
                "title": "Synchronizing the Quote with its parent opportunity",
                "bypassConfirm": true,
                "params": {"fields": {"Id": "{{{ROW.OpportunityId}}}","SyncedQuoteId": "{{{ROW.Id}}}"}},
                "next": {"type": "done","params": {"type": "refresh"} } } } }
]
```

_Notes_:
* ***Beware*** to check the `Flatten Results ?` checkbox to let the relationships properly map
in the data-tree (and generate the `Quotes._length`property)
* You may here use the out-of-the-box _sfpegOpenEdit_ action configuration as `Row Actions` if you 
only need the _open_ and _edit_ actions.

### DataTree Display Configuration & Apex Data Fetch

In that example, the **sfpegListCmp** component is configured in _TreeGrid_ mode and
relies on an Apex class to fetch the whole sub-hierarchy of the current record.<br/>
![List in DataTree mode](/media/sfpegListHierarchy.png)

The Query configuration in the **sfpegList__mdt** custom metadata record is done as follows:<br/>
![List in DataTree mode](/media/sfpegListHierarchyMeta.png)

Data are fetched via a custom Apex class implementing the **sfpegListQuery_SVC** virtual class:
* The main method to implement is `getData()`.
* Its Object input parameter contains the _Query Input_ JSON object configured above
* It returns a list of BranchUnit SObjects (FSC specific) fetched via an optimised recursive subtree
fetch and cast as a standard list of Object (enabling to return whatever data structure to the list component).<br/>
```
public with sharing class BranchUnitListQueries_SVC extends sfpegListQuery_SVC {
            
    public override List<Object> getData(final Object input, final String query) {
        System.debug('getData: START BranchUnitListQueries_SVC implementation');
        
        Map<Object,Object> inputData = (Map<Object,Object>) input;
        ID recordId = (ID)(inputData.get('GEN.recordId'));
        System.debug('getData: recordId fetched ' + recordId);
        
        Set<ID> baseSet = new set<ID>();
        baseSet.add(recordId);
        Map<ID,Object> resultMap = fetchDetails(baseSet,0);

        System.debug('getData: END with #records on 1st level ' + resultMap.size());
        return resultMap.values();
    }
    
    private Map<ID,Object> fetchDetails(Set<ID> buIdSet, Integer depth) {
    ...
    }
}
```

The _TreeGrid_ layout configuration looks as follows:<br/>
```
{
    "keyField":"Id",
    "hierarchyFields":["BranchUnitParentBranchUnit"],
    "widthMode":"auto",
    "columns": [
        {"label":"Name", "fieldName": "Name", "type": "button", "sortable": "true", "initialWidth": 250,
            "typeAttributes":{"label":{"fieldName": "Name"},"name":"open","variant":"base"}},
        { "label": "BranchCode", "fieldName": "BranchCode"},
        { "label": "Type", "fieldName": "Type","sortable": true},
        { "label": "IsActive?", "fieldName": "IsActive", "type":"boolean"},
        { "label": "#Children", "fieldName": "BranchUnitParentBranchUnit._length", "sortable": true},
        {"type":"action","typeAttributes":{"class":"slds-scrollable_none",
            "rowActions": [
                {"label":"Open","iconName":"utility:open","name":"open"},
                {"label":"Edit","iconName":"utility:edit","name":"edit"},
                {"label":"Delete","iconName":"utility:delete","name":"delete"}],
            "menuAlignment":"auto"}
        }
    ]
}
```

### Hierarchy Query Execution

Please refer to **[sfpegHierarchy_SVC](/help/sfpegHierarchy.md)** extension Apex class
to get an example about how to easily generate a tree-grid with all the sub-hierarchy
of a record.


### Dynamically Disabled Row Actions

In that example, the **sfpegListCmp** component is configured in _DataTable_ mode and
relies on a custom boolean formula field to activate an action or not on a per row basis.<br/>
![List with row level conditional actions](/media/sfpegListRowActionsExample.png)

The query should include the boolean formula field (here *HasReason__c*) to be used for action activation 
```
select Id, Name, RecordType.Name, TOLABEL(Motif__c), TST_ACL__c, TST_ACL__r.Name, ReasonCode__c, HasReason__c
from TST_PEG__c
where TST_ACL__c = '{{{ID}}}'
```

The _DataTable_ configuration layout looks as follows:<br/>
```
{
    "keyField": "Id",
    "columns": [
        {   "type":"button", "fieldName": "Name", "label": "Nom",
            "typeAttributes":{"label":{"fieldName":"Name"},"name":"open","variant":"base"} },
        {   "fieldName": "RecordType.Name", "label": "Type" },
        {   "fieldName": "Motif__c", "label": "Reason" },
        {   "fieldName": "TST_ACL__r.Name", "label": "Parent" },
        {   "fieldName": "HasReason__c", "label": "Has Reason?", "type":"boolean" },
        {   "type":"button",
            "typeAttributes":{"label": "Edit","name":"editDml","variant":"base","disabled":{"fieldName":"HasReason__c"}} }
    ]
}
```

_Notes_:
* Beware that in the example above, the `Flatten Results?` checkbox should be selectd in the **sfpegList** custom 
metadata component on order for the compound fields (e.g. `TST_ACL__r.Name`)  to be properly displayed.
* Beware that in _DataTable_ and _TreeGrid_ modes, the `disabled` property only works for `button` or `button-icon`
column types. Among others it does not for row actions set in the `menu` property due to a current 
**[lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation)** component limitation.


For the _CardList_ and _TileList_ modes, any entry in the `menu` property may be dynamically _disabled_
or _hidden_ in a similar way. However the `isDynamicMenu` boolean property needs to be explicitly set
to `true` in the configuration:
```
...
"isDynamicMenu":true,
"menu": [
    ...
    {
        "label": "Set Reason", "name": "editReason",
        "disabled":{"fieldName":"HasReason__c"}
    },
    {
        "label": "Edit", "name": "edit", "iconName":"utility:edit",
        "hidden":{"fieldName":"IsTerminated__c"}
    }
    ...
]
...
```

In addition, by setting `"isDynamicCondition":true` in addition to `"isDynamicMenu":true`
in the configuration, the `disabled` and `hidden` parameters may be dynamically evaluated
(via `eval()` statement) out of a textual condition instead of a pure boolean value. 


### List Refresh after Flow Popup Execution

Please refer to **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)** to see an example combining a flow popup
triggering via a `utility` action type followed by a `notify` one to refresh the originating
**sfpegListCmp** component.


### Main Record Reload and List Refresh Action Chaining

Please refer to **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** to see an example combining a `massDML`
action on the list selected records followed by a `reload` to update the page record and a `refresh` to 
reload the component list.


### Multi-SOQL Query Execution

Please refer to **[sfpegMultiQueries_SVC](/help/sfpegMultiQueries.md)** Apex extension class to get an example 
about how to group the results of multiple SOQL queries in a single list.


### JSON Object List Field Display

Please refer to **[sfpegJsonList_SVC](/help/sfpegJson.md)** Apex extension class to get an example 
about how to display information stored in a standard text field and containing a stringified
JSON object list as a standard related list.


### Dependent SOQL Queries Execution

Please refer to **[sfpegDependentQueries_SVC](/help/sfpegDependentQueries.md)** Apex extension class to get an example 
about how to workaround various limitations of standard SOQL subqueries and leverage independent SOQL subqueries to
fill in criteria of `IN` conditions.


### SOSL with SOQL Fallback Queries Execution

Please refer to **[sfpegSearch_SVC](/help/sfpegSearchQueries.md)** Apex extension class to get an example 
about how to implement a SOSL query with a SOQL fallback query if no (or a a too short) search term is provided.
It also provides the ability to dynamically build `WHERE` clauses based on filtering criteria actually
provided in the context.


### Current Org Limits Status

In order to display in an App page the current state of the Org Limits,
two elements are available off-the-shelf in the examples:
* the **sfpegOrgLimits_SVC** Apex extension class (calling see **[OrgLimits.getMap()](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_class_System_OrgLimits.htm)**)
* the **sfpegOrgLimits** **sfpegList** list medatada record

![List as tiles](/media/sfpegOrgLimits.png)<br/>
_Monitoring of the Org limits_


---

## Technical Details

This component heavily relies on the standard
[lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) and
[lightning-tree-grid](https://developer.salesforce.com/docs/component-library/bundle/lightning-tree-grid/documentation)
base components to display data in _DataTable_ and _DataTree_ modes.
A lot of their configuration elements may therefore be set within the _Display Configuration_ property of the 
**sfpegList__mdt** custom metadata, both at root, _menu_ and _columns_ levels.

It also relies on the following **[PEG_LIST](https://github.com/pegros/PEG_LIST)** components:
* **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** for the data fetch contextualisation (leveraging a wide variety of
_merge tokens_)
* **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** for header and row actions
* **sfpegTileDsp** for record tile display (thus also **[sfpegIconDsp](/help/sfpegIconDsp.md)** for tile icons)
* **sfpegCsvUtl** for CSV list export
* **sfpegJsonUtl** for various JSON operations (e.g. data _flattening_)