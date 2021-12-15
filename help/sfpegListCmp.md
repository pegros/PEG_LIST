---
# sfpegListCmp Component
---

## Introduction

The **sfpegListCmp** component displays a contextualised and actionable list of records in 3 main formats (data table, data tree or tile list), data being retrieved via SOQL or Apex.

![List as tiles!](/media/sfpegListTiles.png) 
![List as cards!](/media/sfpegListCards.png)
![List as data table!](/media/sfpegListTable.png) 
![List as tree grid!](/media/sfpegListTree.png) 



## Component Configuration

For the *sfpegListCmpt* component, a lot of properties may be set directly in the App Builder:
* Wrapping card customisation properties (title, icon, CSS, max-height, built-in action button size, display of record number...)
* Built-in actions activation (filter, sort, export, debug...)

However, most of the configuration lies in two custom metadata referenced records (see orange zones below):
* a *sfpegList__mdt* record for the data fetch & display
* a  *sfpegAction__mdt* record for the custom header actions (see dedicated section for details)

![List App Builder Configuration!](/media/sfpegListConfiguration.png)


The *sfpegList__mdt* custom metadata records basically configure:
* How data are retrieved
    * SOQL query or Apex class (implementing the *sfpegListQuery_SVC* virtual class) to be applied
        * “Query Type” to select a fetch mode
        * “Query Class” to specify the name of the Apex class (implementing *sfpegListQuery_SVC* virtual class) to call
        * “Query SOQL” to specify the SOQL query to execute.
    * Inputs required to contextualise the fetch 
        * “Query Input” to specify a single JSON context object to contextualise the SOQL query or be passed as input to the Apex class fetch method
        * For the SOQL query, the properties of this JSON object are to be merged via {{{propertyName}}} in the query string  (e.g. {{{ID}}} in the example below to fetch the ID property value of the input object)
        * The values of this JSON object may be initialized via any {{{mergeToken}}} supported by the *sfpegMergeUtl* utility component (e.g. {{{GEN.recordId}}} in the example below to fetch the Salesforce ID of the current page record)
    * Possible activation of pagination for large data sets (with an additional global count() query)  
        * “Do Pagination ?” to check to activate pagination
        * “Query Count” to provide a SOQL count() query corresponding to the “Query SOQL” if SOQL mode retrieval is used (a single number being returned instead of a record list)
        * “Query Order By Field” and “Order Direction” to let the component property manage the pagination (the feature not relying in the SOQL offset feature but on explicit where clause statements).
        * Beware that, when using pagination,  the configured “Query SOQL” property must include:
            *  a {{{PAGE}}} merge token within its WHERE clause to set the page limit (lower or higher depending on direction)
            * a LIMIT clause to set the page size (in number of records)
            * an ORDER BY clause corresponding to the specified “Query Order By Field” and “Order Direction”
    * → probable later addition of security related parameters, such as “enforce FLS” and “bypass sharing“ for the SOQL mode.
* How they are displayed

    * Choosing among the four display modes supported (DataTable, DataTree, CardList, TileList), most of the configuration element being shared among them (or simply ignored)
    * Configuring the display via a single JSON object within the “Display Configuration” attribute, the leveraging (and extending) the JSON configuration of the standard [lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) and [lightning-tree-grid](https://developer.salesforce.com/docs/component-library/bundle/lightning-tree-grid/documentation) base components.
        * This is especially applicable to the “columns” property
        * Additional root properties have been added for the “CardList” and “TileList” modes to tune their display:
            * “title” and “icon” to configure the title and optional icon for each tile displayed in these modes
                * icon name being either static (by providing a “name” property) or dynamic (by providing a “fieldName“ property, this field containing the actual icon name to be used) 
            * “cardNbr” and “fieldNbr” to respectively set the number of tiles and fields (within a tile, if “CardList” mode is used) per row
            * Other options to check
    * Possibly “flattening” the JSON data fetched in order to let related record data being properly displayed within DataTree or TreeGrid components (which do not support displaying data from JSON sub-objects)
* Which actions are available at row level
    * leveraging a *sfpegAction__mdt* custom metadata record containing only actions (no menus) identified by their names within the “Display Configuration” property.
        * within “button” or “action” items of the “columns” property (see [lightning-datatable](https://developer.salesforce.com/docs/component-library/bundle/lightning-datatable/documentation) documentation)
        * within a dedicated “menu” property defining the menu for the “TileList” and “CardList” display modes or an appended last column menu in “DataTable” and “TreeGrid” modes, a display configuration being required in such a cas (with label / icon)
        * within the “action” sub-property of the “title” property for the “TileList” and “CardList” display modes
    * Beware that conditional activation of actions does not work for “action” entries in the  “DataTable” and “TreeGrid” columns (i.e. only for “button” ones), while they properly work in the menu for the “TileList” and “CardList” modes.

![Main List Metadata Record!](/media/sfpegListConfigMeta.png)<br/>
Main *sfpegList* record

![Row Action Metadata Record!](/media/sfpegListConfigMetaAction.png)<br/>
Referenced *sfpegAction* record for row level actions

## Special Paginated Use Cases

When using the pagination, this example should be modified the following way:

* “Query SOQL” should be modified to :
```
SELECT...  WHERE  WhatId = '{{{RECORD}}}' and IsClosed = false and RecordType.DeveloperName = 'NBA' and {{{PAGE}}} order by Id desc limit 5
```

* “Query Count” should be set to : 
```
SELECT count() FROM Task WHERE  WhatId = '{{{ID}}}' and IsClosed = false and RecordType.DeveloperName = 'NBA'
```

* “Query OrderBy Field” should be set to “Id”
* “Order Direction” should be set to “Descending“

## Other Configuration Examples

### Apex List Retrieval and OpenURL Action with Rework 

In that example, the **sfpegListCmp** component is configured in _DataTable_ mode and leverages
an Apex Class to fetch metadata about the different attributes of a given SObject.
It is displayed in a Knowledge Article and leverages a custom field identifying a given SObject.

![Object Attributes List!](/media/sfpegListObjectAttributes.png)

The Query is configured as an Apex fetch, with a class fetches leveraging the
**Schema.describe()** methods to provide the proper information.

![Object Attributes List Metadata!](/media/sfpegListObjectAttributesMeta.png)

The display is configured as follows:
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

The row action provides a direct link to the Setup page for each attribute (via an **openURL** 
action with rework feature activated).
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

In that example, the **sfpegListCmp** component is configured in **TreeGrid** mode and
relies on an Apex class to fetch the whole sub-hierarchy of the current record.

![List in DataTree mode!](/media/sfpegListHierarchy.png)

The Query configuration in the **sfpegList** custom metadata record is done as follows:

![List in DataTree mode!](/media/sfpegListHierarchyMeta.png)

Data are fetched via a custom Apex class implementing the **sfpegListQuery_SVC** virtual class:
* The main method to implement is **getData**.
* Its Object input parameter contains the “Query Input” JSON object configured above
* It returns a list of BranchUnit SObjects fetched via an optimised recursive subtree fetch and
cast as a standard list of Object (enabling to return whatever data structure to the list component).
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

The **TreeGrid** layout configuration looks as follows:
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