# ![Logo](/media/Logo.png) &nbsp; **sfpegDependentQueries_SVC** Query Extension

This extension is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegDependentQueries.md).


## Introduction

The **sfpegDependentQueries_SVC** Apex Class is an extension to the **[sfpegListCmp](/help/sfpegListCmp.md)** 
component capabilities. It basically enables to execute multiple different SOQL subqueries
to extract lists of IDs or String values to be used in `IN` conditions of a main SOQL query.

This enables to workaround various limitations of standard SOQL subqueries, e.g.
when both query and subquery operate on the same SObject.


## Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

This Apex class may be leveraged within standard **[sfpegListCmp](/help/sfpegListCmp.md)** configuration.
In order to use it, the `sfpegList` metadata record should be configured as follows:
* `Query Type`should be set to `Apex`
* `Query Class` should be set to `sfpegDependentQueries_SVC` 
* `Query Template` should contain a JSON object with the following properties
    * `query`: main SOQL template merging data from the context and from the subqueries
    * `subqueries`: JSON object providing, per result merge token, the subquery template 
        to execute (and possibly the field providing the information to extract from the subquery)

ℹ️ There is a single main SOQL query but there may be multiple subqueries (with different merge token names).


## Configuration Example

The following example applies to a **[sfpegListCmp](/help/sfpegListCmp.md)**
in a **TrnCourse** (standard **Public Sector Solution** Industry object) record page
and enables to implement a query not supported in standard SOQL.
* the **TrnCourse** records have a N-N relationship with a custom **Catalogue__c**
object via a custom  **CatalogueCourse__c** relation object.
* the query enables to list all other **TrnCourse** contained in any of the **Catalogue__c** the current **TrnCourse** is member of (via the **CatalogueCourse__c** relation).

This configuration enables 
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

This class implements only the `getData()` method of the **sfpegListQuery_SVC** interface class. This means that pagination is (currently) not supported.

⚠️ **Beware** that, when a subquery returns no value, the resulting statement leveraging its result is `IN ('')`.

This class comes with the **sfpegDependentQueries_TST** test class requiring 3 test custom metadata
(**sfpegTestDependentQueriesOK**, **sfpegTestDependentQueriesKOparse**, **sfpegTestDependentQueriesKOquery**).

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.