# ![Logo](/media/Logo.png) &nbsp; **sfpegDependentQueries_SVC** Extension

## Introduction

The **sfpegDependentQueries_SVC** Apex Class is an extension to the **[sfpegListCmp](/help/sfpegListCmp.md)** 
component capabilities. It basically enables to execute multiple different SOQL subqueries
to extract lists of IDs or String values to be used in `IN` conditions of a main SOQL query.

This enables to workaround various limitations of standard SOQL subqueries, e.g. when both
query and subquery operate on the same SObject.


## Configuration

Configuration relies on standard **[sfpegListCmp](/help/sfpegListCmp.md)** configuration principles.

In order to leverage this new capability, the `sfpegList` metadata record should be configured as
follows:
* `Query Type`should be set to `Apex`
* `Query Class` should be set to `sfpegDependentQueries_SVC` 
* `Query Template` should contain a JSON object with the following properties
    * `query`: main SOQL template merging data from the context and from the subqueries
    * `subqueries`: JSON object providing, per result merge token, the subquery template 
        to execute (and possibly the field providing the information to extract from the subquery)

ℹ️ There is a single main SOQL query but multiple subqueries (with different merge token names).


## Configuration Example

The following example shows a **[sfpegListCmp](/help/sfpegListCmp.md)** in a **TrnCourse** record page
providing the other **TrnCourse** contained in any of the **Catalogue__c** the current  **TrnCourse** 
is member of (via a **CatalogueCourse__c** relation object).
FYI, **TrnCourse** is a standard **Public Sector Solution** Industry object.

![Dependent SOQL Queries](/media/sfpegDependentQueries.png)

For this result, the **sfpegList** metadata record should be configured as follows:
* `Scope`set to `CourseOffering`
* `Query Type`set to `Apex`
* `Query Input` set to 
```
{
    "ID":"{{{GEN.recordId}}}"
}
```
* `Query Class` set to `sfpegDependentQueries_SVC`
* `Query Template` set to
```
{
    "query": "SELECT Id, Name FROM TrnCourse WHERE Id IN (SELECT CourseId__c FROM CatalogueCourse__c WHERE CatalogueId__c IN({{{CAT_LIST}}}))",
    "subqueries": {
        "CAT_LIST": {
            "query":"SELECT CatalogueId__c FROM CatalogueCourse__c WHERE CourseId__c = '{{{ID}}}'", 
            "field":"CatalogueId__c"
        }
    }
}
```
* `Bypass Escaping` checked
* `Display Type` set to `DataTable`
* `Display Configuration` set to 
```
{
    "keyField": "Id",
    "columns":[
        {"label":"Name","fieldName":"Name","sortable":true}
    ]
}
```

## Technical Details

This class implements only the `getData()` method of the **sfpegListQuery_SVC** interface class. 
This means that pagination is (currently) not supported.

ℹ️ Beware that, when a subquery returns no value, the resulting statement leveraging its result is `IN ('')`.

This class comes with the **sfpegDependentQueries_TST** test class requiring 3 test custom metadata
(**sfpegTestDependentQueriesOK**, **sfpegTestDependentQueriesKOparse**, **sfpegTestDependentQueriesKOquery**).