# ![Logo](/media/Logo.png) &nbsp; SFPEG List Org Utilities

This page details some **sfpegListCmp** configurations provided as part of the 
the [`sfpegList-extensions`](/help/sfpegListPkgExtensions.md) package of the
**[PEG_LIST](/README.md)** repository.

⚠️ It applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some components and features listed here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.


## Introduction

The **extensions** package provides various off-the-shelf system admin utilities
consisting in a set of **sfpegList** configurations with underlying Apex extensions
(for data fetch) and related Lightning tabs (for display in Lightning UX).
They provide Salesforce administrators with a quick and filterable access to various
interesting technical information about their Org:
* the current status of all **Governor Limits**
* the list of all available **Objects** (and corresponding key prefixes)


## Org Utilities

### Governor Limits

The `Governor Limits` tab enables system admins to access the current status of all
Apex governor limits available on their Org, as available from the standard
**[OrgLimits.getMap()](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_class_System_OrgLimits.htm)** Apex method. They may easily identify the
limits in critical state (in red) and filter on those they are interested in.

![Org Limits Tab](/media/sfpegOrgLimitsTab.png)

This tab relies on:
* the **sfpegOrgLimits** **sfpegList** list metadada record
* the underlying **sfpegOrgLimits_SVC** Apex extension class (and its test class)
* the associated **sfpegGovernorLimitsPage** Lightning page and **sfpegGovernorLimitsTab** tab


### Object Catalog

The `Object Vatalog` tab enables system admins to access the set of all
Objects, Custom Settings, Custom Metadata, Events... defined on their Org, 
as available form the standard **[Schema.getGlobalDescribe()](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_methods_system_schema.htm#apex_System_Schema_getGlobalDescribe)** Apex method.
One of its key use cases is to identify the actual Object corresponding 
to a record ID found in a log by leveraging its key prefix. It also provides the number of Record Types defined for each Object.

![Object Catalog Tab](/media/sfpegObjectCatalogTab.png)

This tab relies on:
* the **sfpegObjectDescriptions** **sfpegList** list metadada record
* the underlying **sfpegObjectKeys_SVC** Apex extension class (and its test class)
* the associated **sfpegObjectCatalogPage** Lightning page and **sfpegObjectCatalogTab** tab


## Technical Details

⚠️ Access to the different Tabs may need to be granted to the users interested.

Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more information about the way the components have been implemented, which may help 
better understand their behaviours. 
