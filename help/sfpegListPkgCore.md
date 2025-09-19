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


## Technical Details

Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more information about the way the components have been implemented, which may help 
better understand their behaviours. 


## Release Notes

### September 2025 - v1.0.0
* First version with the new unlocked package structure.
* Install it from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xHDBIA2) for production orgs
or [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xHDBIA2) for sandboxes.
