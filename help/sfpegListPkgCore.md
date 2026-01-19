# ![Logo](/media/Logo.png) &nbsp; SFPEG List Core Components

This page presents the content of the `sfpegList-core` package of the **[PEG_LIST](/README.md)** repository.

⚠️ It applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some components and features listed here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.


## Introduction

The **core** package of the **PEG_LIST** repository provides the base components to configure
actionable and contextualised lists within Lightning Apps or Experience Sites.

![List View](/media/sfpegListTable.png)

In addition to the configurable list component, it includes some common powerful features required to easily
customise the end-user experience (context information merge, action framework, apex logic extension).


## Installation 

It may be installed and upgraded as the `sfpegList-core` unlocked package directly on your Org
via the installation links provided in the [release notes](#release-notes).

ℹ️ It will later require the **[sfpegApex-debug](https://github.com/pegros/PEG_APEX/help/sfpegDebugUtility.md)**
package to be already installed on your Org (as it relies on it for Apex debug logs).

⚠️ After installation, you need to grant the `sfpegListCoreUsage` permission set to users in order to
let them use the included components.

ℹ️ This Package may be extended with some elements from the **[sfpegList-utilities](/help/sfpegListPkgUtilities.md)**
or **[sfpegList-examples](/help/sfpegListPkgExamples.md)** packages of the same repository.


## Solution Principles

Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more information about the way the included components may be configured. 


## Package content

The following set of LWC components is available for use in Lightning _App Builder_ or _Site Builder_:
* **[sfpegListCmp](/help/sfpegListCmp.md)** displays a contextualised and actionable list of records
in 3 main formats (data table, data tree or tile list), data being retrieved via SOQL, Apex...
* **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** displays an button/menu bar component enabling to
trigger a wide variety of  actions, integrated within the previous list components but also available
for standalone use in Lightning pages.
* **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** is primarily the same as the
**[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** but displays a menu vertically from the utility bar,
handles messages triggered by other components to execute actions from the utility bar instead of
within tab (e.g. to enforce the console configuration when opening a page) and provides additional
utility bar specific action types.
* **[sfpegActionTriggerCmp](/help/sfpegActionTriggerCmp.md)** has no actual display but enables 
to trigger a specific action automatically upon instantiation (e.g. leveraging conditional
display, it enables to enforce the user to execute a certain operation, such as opening an Edit popup,
when opening the page). 
* **[sfpegForceNavigationCmp](/help/sfpegForceNavigationCmp.md)** has no actual display but
enables to control the tab display mode of a record and trigger a repoen if the same record in 
way consistent with a console navigation configuration.
* **[sfpegListTabCmp](/help/sfpegListTabCmp.md)** adressable LWC
component enabling to display a **sfpegListCmp** in a dedicated independent Lightning tab/page
based on originating context (similarly to the list opened via the _see all_ action on standard related lists).

It also includes various frameworks, such as:
* the context adaptation framework via the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)**
utility LWC component
* the custom icon framework via the **[sfpegIconDsp](/help/sfpegIconDsp.md)** LWC component
* the field display framework for tiles via the **[sfpegFieldDsp](/help/sfpegFieldDsp.md)** LWC component

At last, it provides a wide range of Apex query extension classes for the
**[sfpegListCmp](/help/sfpegListCmp.md)** component configuration:
*  **[sfpegDependentQueries](/help/sfpegDependentQueries.md)** to chain multiple SOQL
queries together, e.g. when sub-queries are not possible.
*  **[sfpegHierarchy](/help/sfpegHierarchy.md)** to fetch at once a whole sub-hierarchy
of records, e.g. for datatree display mode.
*  **[sfpegMultiQueries](/help/sfpegMultiQueries.md)** to group together the results of
multiple SOQL queries, e.g. to simplify the `WHERE` clause.
*  **[sfpegSearchQueries](/help/sfpegSearchQueries.md)** to dynamically choose between
SOSL and SOQL depending on the presence of a search `term` and dynamically build the filtering `WHERE`
based on the provided non-null criteria.
*  **[sfpegRestQueries](/help/sfpegRestQueries.md)** to fetch data via a REST callout
to an external system and display them in a **sfpegListCmp**.


## Technical Details

Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more information about the way the components have been implemented, which may help 
better understand their behaviours. 


## Release Notes

### September 2025 - v1.0.0

First version with the new unlocked package structure.

Install it:
* from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xHDBIA2) for production orgs,
* from [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xHDBIA2) for sandboxes,
* or by adding the following relative URL to your Org domain: `/packaging/installPackage.apexp?p0=04tJ7000000xHDBIA2`


### November 2025 - v1.1.0

Version content:
* many custom field types added for **[sfpegListCmp](/help/sfpegListCmp.md)**
component to enhance results display in all modes (datatable, data-tree, tiles...):
`richText`, `percent-fixed`, `badge`, `avatar`, `multi-value`, `lookup`.
* workaround implemented for **[sfpegListTabCmp](/help/sfpegListTabCmp.md)**
when using _pinned_ Lightning page layouts in console mode.
* standard **SOQL** `OFFSET` statements now supported for paginated queries
to handle situations where issues arise with the `ORDER BY` field values
and the query result size is compatible with SOQL offset limits.
* better handling of _AggregateResults_ (FLS bypassed)
* **sfpegIconDsp** extended with various custom icons (available
as `resource:xxx`) and country flags (available as `flag:xxx`, with
also out-of-the-box picklist value sets for country ISO codes). See
the **sfpegIconCatalog** Lightning App page for details.
* **sfpegRestQueries_SVC** query extension class added, to fetch
data from external systems via REST callouts and display them
in a **sfpegListCmp**.

Install it:
* from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xIh3IAE) for production orgs,
* from [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xIh3IAE) for sandboxes,
* or by adding the following relative URL to your Org domain: `/packaging/installPackage.apexp?p0=04tJ7000000xIh3IAE`


### Jan 2026 - v1.2.0

Version content:
* modified the **Country global value sets** to change the codes for non registered countries or organisations:
England, Wales, Scotland, Northern Ireland, United Nations Organisation and Europe.
* added the flag SVG icon for Northern Ireland
* upgraded the **sfpegTileDsp** component to let its title behave as a lookup with on-hover display
of compact layout as well as automatic naigation link to the record
* upgraded the **sfpegListCmp** to support external injection of a filter method for more complex
use cases (see **[sfpegFilterableListCmp](/help/sfpegListOrgUtilities.md)** wrapper component)
* minor fixes/enhacements to the **sfpegLookupDsp** component on positioning and object icon


Install it:
* from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=tbd) for production orgs,
* from [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=tbd) for sandboxes,
* or by adding the following relative URL to your Org domain: `/packaging/installPackage.apexp?p0=04tJ7000000xIh3IAE`

⚠️ If you deploy this version as an upgrade to the `Nov 2025` (v1.1.0) version, you need to first delete the entries
for the modified country codes in both `sfpegCountries` and `sfpegCountryCodes` global picklists. It is indeed
impossible to change the code of an existing picklist label.
