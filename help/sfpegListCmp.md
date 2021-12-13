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

<p align="center">
![Main List Metadata Record!](/media/sfpegListConfigMeta.png)<br/>
Main *sfpegList* record

![Row Action Metadata Record!](/media/sfpegListConfigMetaAction.png)<br/>
Referenced *sfpegAction* record for row level actions
</p>

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

TO BE CONTINUED