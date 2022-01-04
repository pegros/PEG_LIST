---
# sfpegListCmp Component
---

## Introduction

The **sfpegListCmp** component displays a contextualised and actionable list of records in 3 main formats
(data table, data tree or tile list), data being retrieved via SOQL, Apex...

As a baseline, in SOQL data-table mode, it provides a powerful alternative solution to the standard Lightning
related lists by offering more flexibility in:
* the selection of the records to display (e.g. filtered related list, sub-related list...)
* the actions available on this record selection (more than the standard edit/delete)

It further extends these capabilities by providing:
* a wide variety of alternative record fetch methods (SOQL, SOSL, SAQL or custom Apex)
* the ability to handle completely custom data sets (as Apex `Map<String,Object>` lists converted as JSON objects)
e.g. fetched via callouts to external systems (without the need for external objects) or built from custom
Apex logic (combining multiple related records, rebuilding record hierarchies...)
* a extended set of display options (tiles, tree-grid) to handle cases where data-table are not suitable
from a UX perspective
* out-of-the-box record set filtering, sorting and CSV export capabilities
* the option to load records progressively (pagination) for potentially large data sets (the total count being
automatically fetched upon instantiation, a _load more_ button being displayed in the component's footer as long
as this total count has not been loaded)

In order to offer these features, it heavily relies on two other **[PEG_LIST](https://github.com/pegros/PEG_LIST)**
LWC components:
* **[sfpegActionBarCmp](/help/sfpegActionBar.md)** for the header and row actions
* **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** for the data fetch contextualisation (leveraging a wide variety of
_merge tokens_)


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

![List as data table](/media/sfpegListTable.png)<br/>
_Display as Data Table_

![List as tree grid](/media/sfpegListTree.png) <br/>
_Display as Tree Grid_

_Note_:In the last _tree grid_ example, fetching data with custom Apex enables to fetch
a whole multi-level record hierarchy in a single call (while SOQL only supports 1 level of
embedded subqueries)


### App Builder Configuration

For the **sfpegListCmp** component, a lot of properties may be set directly in the App Builder:
* Wrapping card customisation properties (title, icon, CSS, max-height, built-in action button size,
display of record number...)
* Built-in actions activation (filter, sort, export, debug...)

However, most of the configuration lies in two custom metadata referenced records (see orange zones below):
* a **sfpegList__mdt** record for the data fetch & display
* a **sfpegAction__mdt** record for the custom header actions (see **[sfpegActionBarCmp](/help/sfpegActionBar.md)** for details)

![List App Builder Configuration](/media/sfpegListConfiguration.png)


### Metadata Configuration

The **sfpegList__mdt** custom metadata provides the most important configuration items of the **sfpegListCmp**
components. It contains multiple sections of properties to respectively configure the way how:
* data are fetched
* pagination is handled (if applicable)
* data are displayed (including row level actions)

![Main List Metadata Record](/media/sfpegListConfigMeta.png)

_Note_: Context merge is systematically applied to the _query input_ property upon initial load/refresh
(see **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component) to adapt the query context to the display environment.
Label related _merge tokens_ are also evaluated in the _Display Configuration_ property to adapt labels to the 
user language.


The **Query** section defines how data are retrieved: 
* Query or Apex class to be applied
    * _Query Type_ to select a fetch mode (SOQL, SOSL, SAQL, Apex)
    * _Query Class_ (if _Apex_ mode is chosen) to specify the name of the Apex class to call 
    (implementing **sfpegListQuery_SVC** virtual class) 
    * _Query SOQL_ (to be renamed as _Query_) to specify the SOQL/SOSL/SAQL query to execute (when these modes are chosen).
* Inputs required to contextualise the fetch 
    * _Query Input_ to specify a single JSON context object to contextualise the query or
    be passed as input to the Apex class fetch method
    * For the _Query SOQL_, the properties of this JSON object are to be merged via 
    `{{{propertyName}}}` tokens in the query string  (e.g. `{{{ID}}}` in the example
    above to fetch the ID property value of the input object)
    * The values of this JSON object may be initialized via any `{{{mergeToken}}}` supported
    by the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component
    (e.g. `{{{GEN.recordId}}}` in the example above to fetch the Salesforce ID of the current page record)

_Note_: Additional security related parameters will be soon added for the SOQL mode, such as _enforce FLS_ and _bypass sharing_.


The **PaginationHandling** section defines how pagination (for progressive data load for large data sets) should work:
* _Do Pagination ?_ to check to activate pagination (supported only in SOQL and Apex modes for now)
* _Query Count_ to provide a SOQL `count()` query corresponding to the _Query SOQL_ (if SOQL mode retrieval is used)
* _Query Order By Field_ and _Order Direction_ to let the component properly manage the pagination (the feature not
relying in the standard SOQL `OFFSET` mechanism but on explicit `WHERE` clause statements).
* When pagination mode is activated in SOQL mode, the _Query SOQL_ should then include 
    * a specific `{{{PAGE}}}` merge token within its `WHERE` clause to set the page range limit (lower or higher depending on direction)
    * a `LIMIT` clause to set the page size (in number of records)
    * an `ORDER BY` clause corresponding to the specified _Query Order By Field_ and _Order Direction_ properties
* When pagination mode is activated in Apex mode, the called _Query Class_ should then implement the  `getCount()`
and `getPaginatedData()` methods instead of the base `getData()` one.


The **Display** section defines how data are displayed in the component:
* _Display Type_ to choose among the four display modes supported (_DataTable_, _DataTree_, _CardList_, _TileList_),
most of the configuration element being shared among them (or simply ignored)
* _Display Configuration_ to define how data are displayed, as a single JSON object structure leveraging (and extending)
the JSON display configuration of the standard
[lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) and
[lightning-tree-grid](https://developer.salesforce.com/docs/component-library/bundle/lightning-tree-grid/documentation) base components.
    * This is especially applicable to the _columns_ property
    * Additional root properties have been added for the _CardList_ and _TileList_ modes to tune their specific layouts
        * _title_ and _icon_ to configure the title and optional icon for each tile displayed in these modes,
        icon name being either static (by providing a _name_ property) or dynamic (by providing a _fieldName_ property,
        this field containing the actual icon name to be used) 
        * _cardNbr_ and _fieldNbr_ to respectively set the number per row of tiles and fields (within a tile,
        if _CardList_ mode is used) 
    * An optional  _menu_ property describing the row action menu (_name_, _mabel_ and optional _icon_ of each menu
    item) to be displayed in each tile / at the end of each data-table /tree-grid row (see _Row Actions_ below).
* _Flatten Results?_ to activate fetched data JSON structure _flattening_ in order to let related record data being
properly displayed within _DataTree_ or _TreeGrid_ components (which do not support displaying data from JSON sub-objects,
as when related record fields are fetched)
* _Row Actions_ definining the actions available at row level 
    * It should simply provide the developer name of a **sfpegAction__mdt** custom metadata record containing the actions
    used within the _Display Configuration_ property (identified by their _name_ properties).
    * This may apply to _button_ or _action_ items of the _columns_ property (see
    [lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation)
    for details)
    * This may also apply to the _menu_ property defining the tile menu for the _TileList_ and _CardList_ display modes or
    the appended last column menu in _DataTable_ and _TreeGrid_ modes.
    * This at last applies to the _action_ sub-property of the _title_ property for the _TileList_ and _CardList_ display
    modes (to activate an action link on the tile title)
    * Beware that conditional activation of actions does not work for _action_ entries in the _DataTable_ and _TreeGrid_
    columns (i.e. only for _button_ ones), while they properly work in the menu for the _TileList_ and _CardList_ modes.

Hereafter is an example of the **sfpegAction__mdt** record used for row level actions in the previous example.<br/>
![Row Action Metadata Record](/media/sfpegListConfigMetaAction.png)


### Special Paginated Use Cases

When using the pagination, this example should be modified the following way:
* _Query SOQL_ should be modified to :<br/>
```
SELECT...  WHERE  WhatId = '{{{RECORD}}}' and IsClosed = false and RecordType.DeveloperName = 'NBA' and {{{PAGE}}} order by Id desc limit 5
```
* _Query Count_ should be set to : <br/>
```
SELECT count() FROM Task WHERE  WhatId = '{{{ID}}}' and IsClosed = false and RecordType.DeveloperName = 'NBA'
```
* _Query OrderBy Field_ should be set to `Id`
* _Order Direction_ should be set to `Descending`


### Specific Action Features

The **sfpegListCmp** includes some specific features concerning the action functionality provided
by the **[sfpegActionBarCmp](/help/sfpegActionBar.md)**
* When selection is enabled on the component, it sets/updates the list of selected records in
the header action component to support the trigger of mass actions on this base
(e.g. to mass edit selected records)
* It provides a specific _refresh_ action type to force a reload of the displayed data,
usually called within a _next_ action property (e.g. to execute a list reload after a
record creation or row update)

Hereafter is an example of a mass update form with a refresh after update.
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


## Configuration Examples

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

## Technical Details

This component heavily relies on the standard
[lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) and
[lightning-tree-grid](https://developer.salesforce.com/docs/component-library/bundle/lightning-tree-grid/documentation)
base components to display data in _DataTable_ and _DataTree_ modes.
A lot of their configuration elements may therefore be set within the _Display Configuration_ property of the 
**sfpegList__mdt** custom metadata, both at root, _menu_ and _columns_ levels.
