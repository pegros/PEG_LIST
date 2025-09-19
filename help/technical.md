# ![Logo](/media/Logo.png) &nbsp; SFPEG **LIST** Technical Details

This page provides various technical details about the way the components included
in the **[PEG_LIST](/README.md)** repository have been implemented, which may help 
better understand their behaviours. 


## Salesforce Standard Compatibility

From an implementation perspecthese, the components heavily rely on standard Lightning
framework features such as:
* **[Lightning Data Service (LDS)](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/data_service.htm)** for data fetch and update, 
* base **[Lightning components and services](https://developer.salesforce.com/docs/component-library/overview/components)** for data fetch and display,
* **[Lightning Message Service (LMS)](https://developer.salesforce.com/docs/platform/lwc/guide/use-message-channel.html)** for inter component communication

From an UX perspective, they also try to be as compliant as possible to the standard
**[Salesforce Lightning Design System (SLDS)](https://www.lightningdesignsystem.com/)**.
They are therefore relatively well compatible with its V2 version gone live for the Spring 25
release. The goal is to rovide a UW as close as possible to standard components provided
by Salesforce.


## Client vs Server Side Logic

The base approach was to focus on client side Javascript code and rely on server side
only to fetch / update data when not possible with standard Lightning Data Service.
* Context evaluation is done client side and passed to the server when query / operations 
need to be executed
* Server side logic is involved when retrieving configuration, fetching lists of records,
executing DMLs on multiple records, invoking custom Apex requests or actions...


## Lightning Data Service vs DMLs

Lightning Data Service (via
**[@wire](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/data_wire_service_about)** methods or
**[lightning-record-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-form/documentation)**
components) is heavily used in the components to execute actions or fetch/display record data.
* It is used also to display input forms for mass actions (as temporary creation forms),
although no LDS operation is actually executed, mass operations being done via DMLs.
* This works perfectly for all objects supported by LDS, usual exceptions being Task, Event and Knowledge
for which DML actions are always required (unless opening the standard creation / edit pages)
* LDS updates are very useful as they automatically propagate to other components and avoid reloading/refreshing the page.


## Aura vs LWC

In the new packaging approach, most of not all Aura components from previous
**[v0](https://github.com/pegros/PEG_LIST/tree/v0)** branch have been removed and their features
migrated to LWC, leveraging the latest enhancements to LWC Lightning library.

ℹ️ The objective is to remove all of them for compatibility, maintainability, performance 
as well as security reasons.


## Client Side Configuration Initialisation

In order to optimise initialisation time of the different components, a 2 stage approach has been used:
* cacheable AuraEnabled Apex methods have been used to fetch custom metadata records
(leveraging the standard Lightning cache)
* any fetched / parsed configuration is also stored in a static map variable per component
(enabling to execute the initialisation only once and only fetch the missing elements or initialise the specific items)

This approach enables to dramatically reduce initialisation times when the same configuration is used in multiple pages. E.g. when opening Account pages
* the configuration is loaded first then all contextual data requested when opening the first Account page 
* the configuration is reused and contextual data directly fetched when opening the later Account pages.


## Lightning Message Service Based Communication

In order to integrate the action framework with custom LWC components,
the [Lightning Message Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_message_channel)
has been leveraged to support bi-directional communication between components in this package and custom external logic.
This mechanism relies on a set of _message channels_ for inbound / outbound communication with the package components.

This mechanism is also used internally to communicate from a tab component to the utility
**[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** component via _utility_ actions and
may be used e.g. to propagate _refresh_ requests to multiple **[sfpegListCmp](/help/sfpegListCmp.md)** 
components in a tab after an update action via _notify_ actions.


## Apex Extensibility

In order to extend the standard capabilities available in the package, an extension framework
(via virtual classes and `forname()` class instantiation) has been implemented to let developers
implement and integrate additional custom Apex logic.

This applies to the following features:
* actions (see **sfpegAction__mdt** configuration) leveraging the **sfpegAction_SVC** virtual class
* list queries (see **sfpegList__mdt** configuration) leveraging the **sfpegListQuery_SVC** virtual class


## LWC Extensibility

In order to extend the standard LWC components available in the package, it is possible to create
custom **wrapper** LWC components instantiating the standard **SFPEG LIST** components and e.g.
* passing input context fetched/input via other ways than the out-of-the-box ways (e.g. to add 
a filtering form above a list and pass the input values as context to a **sfpegListCmp**)
* invoking actions from a custom logic or when handling an event in a more complex component (e.g.
to reuse an existing **sfpegAction** configuration within a Quick Action)
* implement a completely different UX (e.g. for an External Site) but reuse data retrieval (and
display configuration) from a **sfpegListCmp** component or actions from a **sfpegActionBarCmp**
component.


## Community Usage 

For component usage in Communities (Experience Cloud), 2 additional properties are displayed at the bottom
of the component configuration panel in the Experience Builder:
* `recordId` to feed the ID of the current record (via the default `{!recordId}` value)
* `objectApiName` to feed the Object API Name of the current record (via the default `{!objectApiName}` value)

_Note_: The `{!objectApiName}` value seems to be sometimes not valued when initializing the components. In order 
to mitigate such issues, and if possible, a fixed test value (e.g. `Account`)is then preferrable.


## Flow Usage

The main components are still not available for Flow Designer as another configuration approach
(and set of components) has been provided in another Screen Flow dedicated package
(see [PEG_FLW](https://github.com/pegros/PEG_FLW)).

The repository however includes a few components for Flow usage, e.g. to trigger Lightning Messages
to refresh **sfpegListCmp** components displayed at the UI (e.g. when running Flow in a popup or
in a different tab in console mode).


## Internationalization

As much attention as possible has been paid to internationalisation requirements (at least languages),
leveraging standard mechanisms to translate labels, field names, picklist values...


## Packaging

This repository has been recently repackaged as a set of standard unlocked packages to better isolate
the core components from add-ons, useful extensions and configuration examples.
* source code for each unlocked package is stored in a dedicated folder in the repository.
* most unlocked packages have a dependency to the core one (even if only because of the test custom object)
* each package comes with its dedicated _sfpegListXxxUsage_ `PermissionSet` which needs to be assigned to
users using the components (granting access to Apex controllers, metadata...)

⚠️ **Beware** when deploying new versions of the package on an Org where it is already installed (whatever the option used) !
    If you have already customized on your Org the custom labels or static resources included in the package, you may need to retrieve first a copy of their current situations before the new package version deployment and redeploy them afterwards.

ℹ️ If you forget to assign the _sfpegListXxxUsage_ `PermissionSet` to your users, component initialisations
and data fetches will systematically fail as users will be denied any access to the necessary Apex
controller logic.

You may either deploy the whole repository or part of it via **Git** and **SF CLI** or leverage individual
unlocked package installation links available in the _Release Notes_ section of each
package's introduction page.  


### Git and SF CLI Deployment

If you want fine grained control of the component source codes and their evolutions, you
may opt for a GitHub + SF CLI deployment option.

First you need to retrieve the projectby simply executing a `git clone`command from the GitHub repository.
```
git clone git@github.com:pegros/PEG_LIST.git
```

Then, via SF CLI, you may deploy it on your target Org
```
sf project deploy start -o <yourOrgAlias> -w 10 --verbose -d ./force-app
```

### Unlocked Package Deployment

For a deployment as unlocked packages in your Org, please use the links provided in the 
_Release Notes_ sections at the bottom of their documentation pages.

⚠️ **Beware** that there are different links for production orgs vs sandboxes.

⚠️ Pay attention to the possible dependencies.


## Component Documentation

As LWC does not provide embedded documentation for the components, each component available in the
_App Builder_ or _Site Builder_ gets its own dedicated _help_ page to provide information about their
behaviours and configurations as well as some usual configuration examples.
This _help_ page may be reached directly from the component footer when you activate their _debug_ mode.

Some additional  _help_ pages are also available for some more technical components providing 
framework services to others and not available from _App Builder_ or _Site Builder_

Most components may also be embedded in other custom LWC components but these use cases are currently
not documented for the time being. You may however look at the source code to see how to reuse some of them
(main action bar component, or display or utility ones) or reach out to the author for more informations.
