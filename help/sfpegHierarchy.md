# ![Logo](/media/Logo.png) &nbsp; **sfpegHierarchy_SVC** Extension

## Introduction

The **sfpegHierarchy_SVC** Apex Class is an extension to the **[sfpegListCmp](/help/sfpegListCmp.md)** 
component capabilities. It basically enables to fetch data of all records belonging
to the sub-hierarchy of a record by executing the same SOQL query at each sub-level
and formatting the result for display in a tree grid. 

ℹ️ It also generates a truncated Name (named `shortName` in the output) to better handle
standard [tree-grid](https://developer.salesforce.com/docs/component-library/bundle/lightning-tree-grid/documentation) component constraints on the labels of button columns
 (`...` displayed by default when label is larger that the column width instead of a wrapped / truncated label).


## Configuration

Configuration relies on standard **[sfpegListCmp](/help/sfpegListCmp.md)** configuration principles.

In order to leverage this new capability, the `sfpegList` metadata record should be configured as
follows:
* `Query Input` should be a JSON object containing a `RootId` property providing the 
  ID of the record of which the sub-hierarchy should be displayed.
* `Query Type`should be set to `Apex`
* `Query Class` should be set to `sfpegHierarchy_SVC` 
* `Query Template` should contain a JSON object with text properties defining the SOQL
query template to execute, the list of fields of extract... (see below)
* `Display Type` should be set in `TreeGrid` mode
* `Display Configuration` should contain a standard tree grid display configuration

The following properties are available for the `Query Template`:
* `Query`should be a standard SOQL query containing the `:idSet` merge variable in a `IN`
  where clause to provide all fields displayed as well as the Parent lookup field
* `Fields` is a JSON list of all field Names to be returned in the tree grid data
    (e.g. to cope with picklist fields fetched in `TOLABEL()` and/or standard mode)
* `MaxSize` and `SizeStep` (integers) enable to override the default width
  of the `ShortName`field automatically generated from the name field, `SizeStep`
  actually defining the progressive size reduction at each additional level (to 
  cope with standard tree grid indentation) 
* `NameField` enables to override the default field name (`Name`) used as record name
    (e.g. to cope with standard objects having `title`or `subject` as name field)
* `ParentField` defines the API name of the parent lookup field
* `ChildrenList`defines the Name of the children related list (to be used in the tree
    grid configuration)
* `MaxDepth` (integer) enables to override the max depth at which the SOQL queries
  are executed (to prevent system limit errors).


## Configuration Example

The following example shows a **[sfpegListCmp](/help/sfpegListCmp.md)** in a
**Population__c** custom object record page providing its sub-hierarchy.

![Hierarchy Query](/media/sfpegHierarchy.png)



## Technical Details

This class implements only the `getData()` method of the **sfpegListQuery_SVC** interface class. 
This means that pagination is (currently) not supported.

This class comes with the **sfpegHierarchy_TST** test class.