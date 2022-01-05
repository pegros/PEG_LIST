---
# SFPEG LIST Components
---


## Introduction

This package contains a set of LWC components primarily dedicated to the display of custom lists of information
(related records, KPIs, messages, fields...). They are based on some common powerful features required to easily
customise the end-user experience (context information merge, action framework, apex logic extension).

These components were built as contributions/examples for former & ongoing Advisory assignments by 
[Pierre-Emmanuel Gros](https://github.com/pegros), porting in LWC and optimising (for end-user performances 
and easier configuration mutualisation among page layouts) some components previously available in a former 
Aura component package (known as **PEG Components** not available on GitHub). 

They heavily rely on standard Lightning framework features such as the Lightning Data Service (LDS) 
or the Lightning Message Service (LMS) and try to apply as much as possible the standard Design System (SLDS). 
The goal was to make them appear as much as possible as standard native Salesforce platform components 
but override usual limitations of the standard platform.

Experience Cloud is now supported and requires the Object API Name and the Record ID to be explicitly
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

For the few Aura components, you may have a look at their standard _.auradoc_ and for Apex classes a
_@ApexDoc_ like approach (with `@description`... tags) has been used.

Most components may also be embedded in other custom LWC components but these use cases are currently
not documented for the time being. You may however look at the source code to see how to reuse some of them
(main action bar component, or display or utility ones) or reach out to the author for more informations.


### Package Availability

The package is freely available for use under the MIT license from this GiHub repository.
Periodic upgrades will be posted depending on fixes/evolutions implemented as part of assignments & personal interactions.
For now, all commits are made exclusively by the author.

You may easily deploy it to your Org via a simple SFDX deploy command from the project folder.
> sfdx force:source:deploy -u <yourOrgAlias> -w 10 --verbose -p force-app


* * *

## Package Overview

The **PEG_LIST** package provides a whole series of LWC components for the App Builder, as
well as some Aura ones. They are summarized hereafter with links to their dedicated
description pages.

All these components rely on a whole set of metadata also included in the package, the detail
of which is provided [here](/help/sfpegComponentList.md).


### App Builder Components 

A main set of LWC components is available for use in Lightning App Builder:

* **[sfpegListCmp](/help/sfpegListCmp.md)** displays a contextualised and actionable list of records in 3 main formats
(data table, data tree or tile list), data being retrieved via SOQL, Apex...

<p style="align:center;" title="List as tiles">
<img src="/media/sfpegListTiles.png" alt="List as tiles"  />
</p>

![List as tiles!](/media/sfpegListTiles.png) 
![List as cards!](/media/sfpegListCards.png)
![List as data table!](/media/sfpegListTable.png) 
![List as tree grid!](/media/sfpegListTree.png) 

* **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)** displays a conditional, contextualised and actionable list
of end-user messages with customisable styles.<br/>
![List of messages!](/media/sfpegMessages.png)
![List of messages with dynamic icons!](/media/sfpegMessageExample.png)

* **[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)** displays an actionable list of KPI field values in a structured and
graphical way.<br/>
![List of KPIs!](/media/sfpegKpis.png)

* **[sfpegProfileCmp](/help/sfpegProfileCmp.md)** displays an actionable graphical summary of a record, with various
lists of fields<br/>
![Complete Profile!](/media/sfpegProfile.png) 
![Profile with only details!](/media/sfpegProfileDetails.png)
![Profile with variant!](/media/sfpegProfileInverse.png) 

* **[sfpegCardCmp](/help/sfpegCardCmp.md)** displays a structured card, with a custom
set of fields / sections fetched/displayed via LDS (including edit capability), for the current or related
(i.e. via lookups) record.<br/>
![Cards on different records!](/media/sfpegCard.png) 

* **[sfpegCardListCmp](/help/sfpegCardListCmp.md)** enables to fetch a list of records
(via a SOQL, Apex... query) and display a **[sfpegCardCmp](/help/sfpegCardCmp.md)** for each one.<br/>
![Cards List!](/media/sfpegCardList.png) 

* **[sfpegRecordDisplayCmp](/help/sfpegRecordDisplayCmp.md)** displays data abouyt the current record
in a structured way (headline section + sub-tabs), data being fetched either via LDS or SOQL
(e.g. for Kbnowledge articles).<br/>
![Reccord Display!](/media/sfpegRecordDisplay.png) 

* **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** displays an button/menu bar component enabling to
trigger a wide variety of  actions, integrated within the previous list components but also available
for standalone use in Lightning pages.<br/>
![Action bar!](/media/sfpegActionBar.png) 

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

![Action utility!](/media/sfpegActionUtility.png) 


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
enables a more efficient local configuration caching (for better performances)

![List App Builder Configuration Example!](/media/sfpegListConfiguration.png)<br/>
_Example of the **[sfpegListCmp](/help/sfpegListCmp.md)** component configuration in the App Builder, referencing 2 custom metadata records (orange zones) respectively for the data fetch/display configuration and for the header actions_


### Configuration Contextualisation

In the main property of most metadata records, context __merge tokens__ may be used to dynamically set some values
based on the applicable record(s) and user. See the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** for more details
about the applicable syntax and all the possible tokens.


### Configuration Scoping

All custom metadata objects include a _scope_ property_ to define the pages for which the configuration record
is applicable, i.e. a set of comma separated strings
* _GLOBAL_ keyword  (for all pages),
* _RECORDS_ keyword (for all record pages)
* _<ObjectApiName>_ (for a specific Salesforce Object) 

This value is then taken into account by the **Datasource** Apex controllers to let the users only choose
the appropriate records when cconfiguring a component in the App Builder.

Setting a _Scope_ is optional, e.g. for **sfpegAction__mdt** records used as row actions of other component
metadata records (e.g. **sfpegList__mdt**).


### Debug Mode Activation

All App Builder components include _Debug xxx ?_ properties to enable to display some configuration information
within the component (usually in its wrapping card footer) and activate debug logs within the browser console.
* _Debug ?_ applies only to the current component
* _Debug (fine) ?_ applies to all sub-components used  within the component (e.g. the action bar or the merge utility).

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

This approach enables to dramatically reduce initialisation times when the same configuration is used in multiple pages.
E.g. when opening Account pages
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
