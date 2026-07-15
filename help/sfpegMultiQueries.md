# ![Logo](/media/Logo.png) &nbsp; **sfpegMultiQueries_SVC** Extension

This component is part of the [`sfpegList-utilities`](/help/sfpegListPkgUtilities.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegMultiQueries.md).


## Introduction

The **sfpegMultiQueries_SVC** Apex Class is an extension to the **[sfpegListCmp](/help/sfpegListCmp.md)** 
component capabilities. It basically enables to execute multiple different SOQL
queries and group their results in a single list (similarly to a UNION in SQL).

This enables to implement complex `WHERE` SOQL clauses not achievable within a single statement,
e.g. to fetch the records (if any) just before and after the current record in a date ordered list.

ℹ️ Each result is tagged with a `Query` property to identify the actual query having provided it.


## Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

This Apex class may be leveraged within standard **[sfpegListCmp](/help/sfpegListCmp.md)** configuration.
In order to use it, the `sfpegList` metadata record should be configured as follows:
* `Query Type`should be set to `Apex`
* `Query Class` should be set to `sfpegMultiQueries_SVC` 
* `Query Template` should contain a JSON object with text properties defining the names and SOQL
query templates to execute.

Optionally, the following properties of the `pagination` section may also be used to globally sort
the results of the different queries
* `Query OrderBy Field` should then be set to the API name of the common field to use for sorting 
* `Order Direction` should then be set to specify the sorting, `null` values being always last

⚠️ You may need to create formula fields with same API Names in the different SObjects used in your
queries to leverage this unified sorting feature.


## Configuration Example

### Baseline Example - Previous and Next Records

The following example shows a **[sfpegListCmp](/help/sfpegListCmp.md)** in a **CourseOffering** record page
providing the previous and next **CourseOffering** for the same parent **TrnCourse** record based on 
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


### Order By Example - Custom Activity

The following example shows a **[sfpegListCmp](/help/sfpegListCmp.md)** in an **Account** record page
providing a custom list of related **Tasks** and **Events** ordered by descending `ActivityDate`.

![Multi SOQL Queries with Sorting](/media/sfpegMultiQueriesActivities.png)


For this result, the **sfpegList** metadata record should be configured as follows:
* `Query Class` set to `sfpegMultiQueries_SVC`
* `Query Template` set to
```
{
    "Tasks": "SELECT Id, Subject, TypeIcon__c, Status, ActivityDate, Description, OwnerId, Owner.Name FROM Task WHERE WhatId = '{{{ID}}}' AND CreatedDate = LAST_N_DAYS:7 ORDER BY ActivityDate DESC NULLS LAST",
    "Events": "SELECT Id, Subject, TypeIcon__c, ActivityDate, Description, OwnerId, Owner.Name FROM Event WHERE WhatId = '{{{ID}}}' AND CreatedDate = LAST_N_DAYS:7 ORDER BY ActivityDate DESC NULLS LAST"
}
```
* `Query OrderBy Field` set to `ActivityDate`
* `Order Direction` set to  `Descending`
* `Display Type` set to `TileList`
* `Display Configuration` set to 
```
{
    "keyField": "Id",
    "variant": "timeline",
    "stacked":true,
    "title": { "fieldName": "Subject", "label": "Subject", "action": "showDetails",
                "sortable": true, "lookup": "Id" },
    "icon": { "fieldName": "TypeIcon__c", "size": "small" },
    "columns": [
        { "fieldName": "Status", "label": "Status", "sortable": true },
        { "fieldName": "ActivityDate", "label": "Due Date", "type": "date-local", "sortable": true },
        { "type": "lookup", "fieldName": "Owner.Name", "label": "Owner",
            "typeAttributes": { "lookup": { "fieldName": "OwnerId" } }, "sortable": true }
    ],
    "details": [
        { "fieldName": "Description", "label": "Description", "wrapText": true }
    ]
}
```

ℹ️ The icon displayed relies on the `TypeIcon__c` formula field defined on the
`Activity` object (handling `Task` and `Event` customisation). Its formula is the 
following:
```
IF( IsTask,
    CASE(TEXT(ActivitySubtype),
        "Call", "standard:log_a_call",
        "Email", "standard:email",
        "standard:task"
    ),
    "standard:event"
)
```


## Technical Details

This class implements only the `getData()` method of the **sfpegListQuery_SVC** interface class. 
This means that pagination is (currently) not supported.

There is also no record deduplication between queries, all results of each individual query being
appended to the global result list.

This class comes with the **sfpegMultiQueries_TST** test class requiring 3 test custom metadata
(**sfpegTestMultiQueriesOK**, **sfpegTestMultiQueriesKOparse**, **sfpegTestMultiQueriesKOquery**).

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.