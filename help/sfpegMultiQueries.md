# ![Logo](/media/Logo.png) &nbsp; **sfpegMMultiQueries_SVC** Extension

## Introduction

The **sfpegMultiQueries_SVC** Apex Class is an extension to the **[sfpegListCmp](/help/sfpegListCmp.md)** 
component capabilities. It basically enables to execute multiple different SOQL
queries and group their results in a single list (similarly to a UNION in SQL).

This enables to implement complex `WHERE` SOQL clauses not achievable within a single statement,
e.g. to fetch the records (if any) just before and after the current record in a date ordered list.

ℹ️ Each result is tagged with a `Query` property to identify the actual query having provided it.


## Configuration

Configuration relies on standard **[sfpegListCmp](/help/sfpegListCmp.md)** configuration principles.

In order to leverage this new capability, the `sfpegList` metadata record should be configured as
follows:
* `Query Type`should be set to `Apex`
* `Query Class` should be set to `sfpegMultiQueries_SVC` 
* `Query Template` should contain a JSON object with text properties defining the names and SOQL
query templates to execute.


## Configuration Example

The following example shows a **[sfpegListCmp](/help/sfpegListCmp.md)** in a **CourseOffering** record page
providing the the previous and next **CourseOffering** for the same parent **TrnCourse** record based on 
their `StartDate` values (these are standard **Public Sector Solution** Industry objects).

![Multi SOQL Queries](/media/sfpegMultiQueries.png)

For this result, the **sfpegList** metadata record should be configured as follows:
* `Scope`set to `CourseOffering`
* `Query Type`set to `Apex`
* `Query Input` set to 
```
{
    "DATE":"{{{RCD.StartDate}}}",
    "COURSE":"{{{RCD.CourseNameId}}}"
}
```
* `Query Class` set to `sfpegMultiQueries_SVC`
* `Query Template` set to
```
{
    "Previous":"SELECT Name, StartDate, TOLABEL(Statut__c) FROM CourseOffering WHERE CourseNameId = '{{{COURSE}}}' and StartDate < {{{DATE}}} ORDER BY StartDate desc LIMIT 1",
    "Next":"SELECT Name, StartDate, TOLABEL(Statut__c) FROM CourseOffering WHERE CourseNameId = '{{{COURSE}}}' and StartDate > {{{DATE}}} ORDER BY StartDate asc LIMIT 1"
}
```
* `Display Type` set to `DataTable`
* `Display Configuration` set to 
```
{
    "keyField": "Id",
    "columns":[
        {"label":"Type","fieldName":"Query","sortable":true},
        {"label":"Name","fieldName":"Name","sortable":true},
        {"label":"Status","fieldName":"Statut__c","sortable":true},
        {"label":"StartDate","fieldName":"StartDate","type":"date","sortable":true}
    ]
}
```

## Technical Details

This class implements only the `getData()` method of the **sfpegListQuery_SVC** interface class. 
This means that pagination is (currently) not supported.

There is also no record deduplication between queries, all results of each individual query being
appended to the global result list.

This class comes with the **sfpegMultiQueries_SVC** test class requiring 3 test custom metadata
(**sfpegTestMultiQueriesOK**, **sfpegTestMultiQueriesKOparse**, **sfpegTestMultiQueriesKOquery**).