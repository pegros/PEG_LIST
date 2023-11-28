# ![Logo](/media/Logo.png) &nbsp; SFPEG **LIST** Components


## Introduction

This package contains a set of LWC components primarily dedicated to the display of custom lists of information
(related records, KPIs, messages, fields...). They are based on some common powerful features required to easily
customise the end-user experience (context information merge, action framework, apex logic extension).

![List View](/media/sfpegListTable.png)

These components were built as contributions/examples for former & ongoing Advisory assignments by 
[Pierre-Emmanuel Gros](https://github.com/pegros), porting in LWC and optimising (for end-user performances 
and easier configuration mutualisation among page layouts) some components previously available in a former 
Aura component package (known as **PEG Components** not available on GitHub). 

They heavily rely on standard Lightning framework features such as the **Lightning Data Service (LDS)** 
or the **Lightning Message Service (LMS)** and try to apply as much as possible the standard **Salesforce Lightning Design System (SLDS)**. 
The goal was to make them appear as much as possible as standard native Salesforce platform components 
while overriding usual limitations of the standard platform.

Communities (Experience Cloud) are now supported and requires the `Object API Name` and the `Record ID` to be explicitly
set when configuring the components within Experience Cloud pages.

They are not available for Flow Designer but another package with components explicitly dedicated to
these use cases is available (see [PEG_FLW](https://github.com/pegros/PEG_FLW) package).

As much attention as possible has been paid to internationalisation requirements (at least languages),
leveraging standard mechanisms to translate labels, field names, picklist values...


### Package Documentation

This readme document provides an overview of the different elements available in the package as well as some
general configuration guidelines and technical implementation principles.

As LWC does not provide embedded documentation for the components, this readme file provides links to component
dedicated sub-pages providing detailed information about their configurations and various implementation examples.
This applies to the different App Builder components, but some more technical ones are also described (e.g. merge utility).
Direct links to these component help pages are also available in the component footers when activating _debug_ mode.

For the few Aura components, you may have a look at their standard _.auradoc_ and for Apex classes a
_@ApexDoc_ like approach (with `@description`... tags) has been used.

Most components may also be embedded in other custom LWC components but these use cases are currently
not documented for the time being. You may however look at the source code to see how to reuse some of them
(main action bar component, or display or utility ones) or reach out to the author for more informations.


### Package Availability

The package is freely available for use under the MIT license from this GiHub repository.
Periodic upgrades will be posted depending on fixes/evolutions implemented as part of assignments & personal interactions.

For now, all commits are made exclusively by the author but you may push Pull Requests that 
may then be then merged after review.


### Package Installation

#### Git Deployment

To retrieve the SFDX project, you may simply execute a git clone from the GitHub repository.
```
git clone git@github.com:pegros/PEG_LIST.git
```

Via SFDX you may then deploy it on you Org
```
sfdx force:source:deploy -u <yourOrgAlias> -w 10 --verbose -p force-app

⚠️ **Beware** when deploying new versions of the package on an Org where it is already installed!

If you have already customized on your Org the custom labels or static resources included in the package, you may need to retrieve first a copy of their current situations before the new package version deployment and redeploy them afterwards.

#### Quick Direct Deploy

For a quick and easy deployment, you may alternatively use the following deploy button
leveraging the **[GitHub Salesforce Deploy Tool](https://github.com/afawcett/githubsfdeploy)**
implemented by [Andrew Fawcett](https://andyinthecloud.com/2013/09/24/deploy-direct-from-github-to-salesforce/).

To deploy only the whole package to your Org, you may use the following button.

<a href="https://githubsfdeploy.herokuapp.com?ref=master">
  <img alt="Deploy Package to Salesforce"
       src="https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/deploy.png">
</a>


### Usage Prerequisite

Please assign to your users the **sfpegListUsage** permission set
provided in the package!

Otherwise component initialisations and data fetches will systematically fail
as users will be denied any execution of Apex controller logic.


* * *

## Package Overview

The **PEG_LIST** package provides a whole set of LWC components for the App Builder, as
well as some Aura ones. They are summarized hereafter by use case with links to their dedicated
description pages.

All these components rely on various configuration custom metadata also included in the package,
the detail of which is provided [here](/help/sfpegComponentList.md). They also heavily reuse two
powerful features:
* context adaptation via the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component
* global/row level action capabilities via the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**
component.

### App Builder Components 

A main set of LWC components is available for use in Lightning App Builder:
* **[sfpegListCmp](/help/sfpegListCmp.md)** displays a contextualised and actionable list of records in 3 main formats (data table, data tree or tile list), data being retrieved via SOQL, Apex...
* **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)** displays a conditional, contextualised and actionable list
of end-user messages with customisable styles.
* **[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)** displays an actionable list of KPI field values in a structured and
graphical way.
* **[sfpegProfileCmp](/help/sfpegProfileCmp.md)** displays an actionable graphical summary of a record, with various
lists of fields
* **[sfpegCardCmp](/help/sfpegCardCmp.md)** displays a structured card, with a custom
set of fields / sections fetched/displayed via LDS (including edit capability), for the current or related
(i.e. via lookups) record.
* **[sfpegCardListCmp](/help/sfpegCardListCmp.md)** enables to fetch a list of records
(via a SOQL, Apex... query) and display a **[sfpegCardCmp](/help/sfpegCardCmp.md)** for each one.
* **[sfpegRecordDisplayCmp](/help/sfpegRecordDisplayCmp.md)** displays data abouyt the current record
in a structured way (headline section + sub-tabs), data being fetched either via LDS or SOQL
(e.g. for Kbnowledge articles).
* **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** displays an button/menu bar component enabling to
trigger a wide variety of  actions, integrated within the previous list components but also available
for standalone use in Lightning pages.
* **[sfpegActionTriggerCmp](/help/sfpegActionTriggerCmp.md)** has no actual display but enables 
to trigger a specific action automatically upon instantiation (e.g. leveraging conditional
display, it enables to enforce the user to execute a certain operation, such as opening an Edit popup,
when opening the page). 


### Utility Bar Components 

Some additional components are available for use in the Lightning Utility bar 
* **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** (LWC) is primarily the same as the
**[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** but displays a menu vertically from the utility bar
and handles messages triggered by other components to execute actions from the utility bar instead of
within tab (e.g. to enforce the console configuration when opening a page).
* **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)** (Aura) is an Aura wrapper of
**[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** to handle a few additional actions & utility
bar specific behaviours currently not possible from LWC: automatic closing of the utility menu upon action
trigger, console tab operations (close all tabs, close tab and open another one...),
custom/flow popup open... (_Note_: this component may be used in Community page footer as well)

### Addressable Aura Components

There is a single Aura Addressable component available for use in navigation actions:
* **[sfpegListViewCmp](/help/sfpegListViewCmp.md)** enables to display the LWC
**[sfpegListCmp](/help/sfpegListCmp.md)** component in a dedicated page (similarly to 
the list opened via the _see all_ action on standard related lists).


* * *

## Component Configuration

Configuration is done at 2 levels:
* in the **App Builder**, to set simple high level configuration elements (such as card title & icon, debug mode activation...)
and select one of the available detailed configuration records (see below)
* via **custom metadata** records, respectively to provide detailed configuration of the components (e.g. layouts,
queries & actions to be used in the components), often containing complex JSON configuration stored in richtext fields.

Such an approach enables to easily reuse the same detailed configuration in multiple Lightning page layouts and
enables a more efficient local configuration caching (for better performances).

The following example illustrate the configuration of the **[sfpegListCmp](/help/sfpegListCmp.md)** component
in the App Builder, referencing 2 custom metadata records (orange zones) respectively for the data
fetch/display configuration and for the header actions.

<p align="center" >
<img src="/media/sfpegListConfiguration.png" alt="App Builder Config" title="List App Builder Configuration Example" />
</p>

***Beware** to add yourself (and all users accessing the components) the proper `sfpegListUsage` permission set
in order to access all the underlying Apex controller classes.


### Configuration Contextualisation

In the main property of most metadata records, context ***merge tokens*** may be used to dynamically set some values
based on the applicable record(s) and user. See the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** for more details
about the applicable syntax and all the possible tokens.


### Configuration Scoping

All custom metadata objects include a `Scope` property to define the pages for which the configuration record
is applicable, i.e. a set of space separated strings
* `GLOBAL` keyword  (for all pages),
* `RECORDS` keyword (for all record pages)
* `<ObjectApiName>` (for a specific Salesforce Object) 

This value is then taken into account by the **Datasource** Apex controllers to let the users only choose
the appropriate records when cconfiguring a component in the App Builder.

Setting a `Scope` is optional, e.g. for **sfpegAction__mdt** records used as row actions of other component
metadata records (e.g. **sfpegList__mdt**).

_Note_: for Communities (Experience Cloud), the `GLOBAL` scope is mandatory for now, the scope not being
properly evaluated when rendering a record page (KNOWN ISSUE).


### Debug Mode Activation

All App Builder components include `Debug xxx ?` properties to enable to display some configuration information
within the component (usually in its wrapping card footer) and activate debug logs within the browser console.
* `Debug ?` applies only to the current component
* `Debug (fine) ?` applies to all sub-components used  within the component (e.g. the action bar or the merge utility).

On server side, all controllers have Apex debug logs implemented at various levels (error, warning, debug, fine...).


* * *

## Technical Details

Hereafter are provided various technical details about the way the components have been implemented,
which may help better understand their behaviours.


### Aura vs LWC

Most of the logic is implemented in LWC components.

However, in order to be able to leverage some interesting APIs or components not yet available in LWC
(workspaceAPI, overlayApi, utilityBarApi, flow...) or some behaviours not supported by LWC
(dynamic component instantiation via `$A.createComponent()`), some logic still had to be implemented
in the legacy Aura technology for various action types.

All this custom Aura logic has been centralised in the **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)**
component and its supporting **sfpegFlowDsp** component.


### Local Initialisation Cache of Configuration

In order to optimise initialisation time of the different components, a 2 stage approach has been used:
* cacheable AuraEnabled Apex methods have been used to fetch custom metadata records
(leveraging the standard Lightning cache)
* any fetched / parsed configuration is also stored in a static map variable per component
(enabling to execute the initialisation only once and only fetch the missing elements or initialise the specific items)

This approach enables to dramatically reduce initialisation times when the same configuration is used in multiple pages. E.g. when opening Account pages
* the configuration is loaded first then all contextual data requested when opening the first Account page 
* the configuration is reused and contextual data directly fetched when opening the later Account pages.


### Lightning Data Service vs DMLs

Lightning Data Service (via
**[@wire](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/data_wire_service_about)** methods or
**[lightning-record-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-form/documentation)**
components) is heavily used in the components to execute actions or fetch/display record data.
* It is used also to display input forms for mass actions (as temporary creation forms),
although no LDS operation is actually executed, mass operations being done via DMLs.
* This works perfectly for all objects supported by LDS, usual exceptions being Task, Event and Knowledge
for which DML actions are always required (unless opening the standard creation / edit pages)
* LDS updates are very useful as they automatically propagate to other components and avoid reloading/refreshing the page.


### Lightning Message Service Based Communication

In order to integrate the action framework with custom LWC components,
the [Lightning Message Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_message_channel)
has been leveraged to support bi-directional communication between components in this package and custom external logic.
This mechanism relies on a set of _message channels_ for inbound / outbound communication with the package components.

This mechanism is also used internally to communicate from a tab component to the utility
**[sfpegActionHandlerCmp](/help/sfpegListCmp.md)** component via _utility_ actions and
may be used e.g. to propagate _refresh_ requests to multiple **[sfpegListCmp](/help/sfpegListCmp.md)** 
components in a tab after an update action via _notify_ actions.


### Apex Extensibility

In order to extend the standard capabilities made available in the package, an extension framework
(via virtual classes and `forname()` class instantiation) has been implemented to let developers
implement and integrate additional custom Apex logic.

This applies to the following features:
* actions (see **sfpegAction__mdt** configuration) leveraging the **sfpegAction_SVC** virtual class
* list queries (see **sfpegList__mdt** configuration) leveraging the **sfpegListQuery_SVC** virtual class


### Community Usage 

For component usage in Communities (Experience Cloud), 2 additional properties are displayed at the bottom
of the component configuration panel in the Experience Builder:
* `recordId` to feed the ID of the current record (via the default `{!recordId}` value)
* `objectApiName` to feed the Object API Name of the current record (via the default `{!objectApiName}` value)

_Note_: The `{!objectApiName}` value seems to be sometimes not valued when initializing the components. In order 
to mitigate such issues, and if possible, a fixed test value (e.g. `Account`)is then preferrable.