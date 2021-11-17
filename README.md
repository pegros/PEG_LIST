# sfpegListComponents
Set of configurable/actionable list components to enhance Lightning UX

Author: [Pierre-Emmanuel Gros](https://github.com/pegros)
Date: Oct. 2021

This package contains a set of LWC components built as contributions/examples for former & ongoing Advisory assignments by [Pierre-Emmanuel Gros](https://github.com/pegros), porting in LWC and optimising (for end-user performances and easier configuration mutualisation among page layouts) some components previously available in a former Aura component package (known as **PEG Components** not available on GitHub). 


* * *

### Component Scope

These components are primarily dedicated to displaying custom lists of information (related records, KPIs, messages, fields...) but are based on some common powerful features required to easily customise the end-user experience (context information merge, action framework, apex logic extension).

They heavily rely on standard Lightning framework features such as the Lightning Data Service (LDS) or the Lightning Message Service (LMS) and try to apply as much as possible the standard Design System (SLDS). The goal was to make them appear as much as possible as standard native Salesforce platform components but override usual limitations of the standard platform.

Experience Cloud is currently not supported but this is in the roadmap and happens mainly for testing reasons than actual technical constraints. Adding support for these usage cases should be relatively easy.

They are not available for Flow Designer but another package with components explicitly dedicated to these use cases is available (see [PEG_FLW](https://github.com/pegros/PEG_FLW) package).

As much attention as possible has been paid to internationalisation requirements (at least languages), leveraging standard mechanisms to translate labels, field names, picklist values...


### Objectives of the Document

As LWC does not provide embedded documentation for the components, this readme file provides an overview of the different elements available within this project, as well as configuration guidelines and examples for the different App Builder components.

Most component may also be embedded in other custom LWC components as well but these use cases are currently not documented here for the time being. You may however look at the source code to see how to reuse some of them (main action bar component, or display or utility ones) or reach out to the author for more informations.


### Package Availability

The package is freely available for use under the MIT license from this GiHub repository.
Periodic upgrades will be posted depending on fixes/evolutions implemented as part of assignments & personal interactions.
For now, all commits are made exclusively by the author.

You may easily deploy it to your Org via a simple SFDX deploy command from the project folder.

```
sfdx force:source:deploy -u <yourOrgAlias> -w 10 --verbose -p force-app
```



* * *

## Package Overview

Although the main purpose of the package is to provide a set of LWC components for the App Builder, a wide variety of other supporting items are included as well


### App Builder Components 

5 main LWC components are available for use in Lightning App Builder

* **[sfpegListCmp](/help/sfpegListCmp.md)** displays a contextualised and actionable list of records in 3 main formats (data table, data tree or tile list), data being retrieved via SOQL or Apex.

![List as tiles!](/media/sfpegListTiles.png) 
![List as cards!](/media/sfpegListCards.png)
![List as data table!](/media/sfpegListTable.png) 
![List as tree grid!](/media/sfpegListTree.png) 


* **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)** displays a conditional, contextualised and actionable list of end-user messages with customisable styles.

![List of messages!](/media/sfpegMessages.png)


* **[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)** displays an actionable list of KPI field values in a structured and  graphical way.

![List of KPIs!](/media/sfpegKpis.png)


* **[sfpegProfileCmp](/help/sfpegProfileCmp.md)** displays an actionable graphical summary of a record, with various lists of fields

![Complete Profile!](/media/sfpegProfile.png) 
![Profile with only details!](/media/sfpegProfileDetails.png)
![Profile with variant!](/media/sfpegProfileInverse.png) 


* **[sfpegCardCmp](/help/sfpegCardCmp.md)** displays a structured card, with a custom
set of fields / sections fetched/displayed via LDS (including edit capability), for the current or related (i.e. via lookups) record.

![Cards on different records!](/media/sfpegCard.png) 


* **[sfpegCardListCmp](/help/sfpegCardListCmp.md)** enables to fetch a list of records
(via a SOQL/Apex query) and display a **[sfpegCardCmp](/help/sfpegCardCmp.md)** for each one.

![Cards List!](/media/sfpegCardList.png) 


* **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** displays an button/menu bar component enabling to
trigger a wide variety of  actions, integrated within the previous list components but also available for standalone use
in Lightning pages.

![Action bar!](/media/sfpegActionBar.png) 


2  additional components are available for use in the Lightning Utility bar

* **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** (LWC) is primarily the same as the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** but displays a menu vertically from the utility bar and handles messages triggered by other components to execute actions from the utility bar instead of within tab (e.g. to enforce the console configuration when opening a page).
* **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)** (Aura) is an Aura wrapper of **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** to handle a few additional actions & utility bar specific behaviours currently not possible from LWC : automatic closing of the utility upon action Trigger, console tab operations (close all tabs, close tab and open another one...), custom/flow popup open...

![Action utility!](/media/sfpegActionUtility.png) 

A last special LWC component (**[sfpegActionTriggerCmp](/help/sfpegActionTriggerCmp.md)**) is also available to be included in Lightning page layouts to trigger a specific action automatically upon instantiation. Leveraging conditional display, it enables to enforce the user to execute a certain operation when opening the page (e.g. opening an Edit popup or a flow). 


### Display Components

There are 5 LWC display components used by the App Builder ones:

* **sfpegCardDsp** displays a record card (for the **sfpegListCmp** in tile mode)
* **sfpegFieldDsp** displays a field with the proper lightning-formatted-XXX according to its type (for the **sfpegCardDsp)**
* **sfpegIconDsp** displays an lightning-icon 
* **sfpegPopupDsp** to display various pop ups, leveraging promises to await user interaction result
* **sfpegWarningDsp** to display error messages

A single Aura display component is used by other Aura components:

* **sfpegFlowDsp** displays a Flow within a modal popup triggered by the **sfpegActionUtilityCmp** utility component

The **sfpegActionBarCmp** component is also included in most other App Builder components to display an action bar.


### Utility Components

There are 3 LWC utility components used by the App Builder ones:

* **sfpegJsonUtl** to execute various operations on JSON objects and lists (flattening, hierarchy init for lightning-datatree component, sorting, filtering, formatting...)
* **sfpegMergeUtl** to manage context merge within text variables, extracting tokens, fetching/caching required data and replacing tokens by data.
* **sfpegCsvUtl** to generate and download a CSV file out of JSON list

The **sfpegActionBarCmp** component is also included in all other App Builder components to provide the customisable action execution utility. It may be explicitely displayed or not.


### LWC Message Channels

3 Messages Channels are available to trigger actions remotely on the **sfActionBarCmp** component family:

* **sfpegAction** enables to trigger an action on the **sfpegActionHandlerCmp** utility component (typically to request the enforcement of the Console configuration when navigating to a record)
* **sfpegCustomAction** to trigger an action on custom LWC components from a **sfActionBarCmp c**omponent (e.g. to trigger a custom action not supported by its framework).
* **sfpegCustomNotification** to trigger an action on **sfActionBarCmp c**omponents configured to subscribe to channels (e.g. to trigger **sfpegListCmp** refreshes) 



### Apex Controllers

For configuration retrieval and possible server side logic execution, a set of Apex classes has been defined:

* **sfpegAction_CTL** enables to retrieve **sfpegAction__mdt** record configuration details and execute DML operations or Apex actions (implementing the **** virtual interface defined by the **sfpegAction_SVC** class)
* **sfpegKpiListSelector__CTL** enables to retrieve **sfpegKpiList__mdt** record configuration details
* **sfpegListSelector_CTL** enables to retrieve  **sfpegListCmp__mdt**  record configuration details and execute DML operations or Apex actions (implementing the **** virtual interface defined by the **sfpegListQuery_SVC** class)
* **sfpegMessageSelector_CTL** enables to retrieve **sfpegMessage__mdt**  record configuration details
* **sfpegProfileSelector_CTL** enables to retrieve **sfpegProfileCmp__mdt** record configuration details


For App Builder configuration user experience, various “***datasource”*** selector classes are also available to select th configuration custom medatata records applicable to the page context:

* **sfpegActionSelector_CTL** provides the configuration of the **sfpegAction__mdt** components (standalone or embedded within other components)
* **sfpegKpiListSelector__CTL** provides configuration for the  **sfpegKpiList__mdt** components (basically the list of fields and how they should be displayed)
* **sfpegListSelector_CTL** provides the configuration for the **sfpegListCmp__mdt**  components (context data required, data request to execute via SOQL / Apex, how list results should be displayed)
* **sfpegMessageSelector_CTL** provides the configuration for the **sfpegMessage__mdt**  components (list of messages with display style, activation conditions and actions)
* **sfpegProfileSelector_CTL** provides the configuration for the **sfpegProfileCmp__mdt** components (basically what is displayed in their banners, avatars


Custom metadata records are systematically filtered by these selector classes according to their ***scope*** ** value (see ***Custom Metadata*** section hereafter) depending on the page type (App/Home page vs Record page) and possible object API Name.


### Apex Service Classes

To implement custom Apex logic, 2 virtual service classes are available:

* **sfpegAction_SVC** to implement custom action logic called via the **sfpegAction_CTL** controller
* **sfpegListQuery_SVC** to implement custom query logic called via the **sfpegListSelector_CTL**  controller.



### Custom Metadata

6 Custom Metadata are defined to store base configuration for the main App Builder components.

* **sfpegAction__mdt** provides the configuration of the **sfActionBarCmp** components (standalone or embedded within other components)
* **sfpegConfiguration__mdt** provides configuration for custom merge tokens to be supported by the **sfpegMergeUtl** utility component (to retrieve and merge Salesforce IDs for specific Object records, such as Dashboards, Reports, Knowledge Articles...)
* **sfpegKpiList__mdt** provides configuration for the  **sfpegKpiListCmp** components (basically the list of fields and how they should be displayed)
* **sfpegList__mdt** provides the configuration for the **sfpegListCmp**  components (context data required, data request to execute via SOQL / Apex, how list results should be displayed)
* **sfpegMessage__mdt** provides the configuration for the **sfpegMessageListCmp**  components (list of messages with display style, activation conditions and actions)
* **sfpegProfileCmp__mdt** provides the configuration for the **sfpegProfileCmp** components (basically what is displayed in their banners, avatars, titles, detail fields, actions)


All custom metadata objects include the following common fields:

* ***description*** to document the usage of each configuration record
* ***scope*** to define the pages for which the configuration record is applicable, i.e. a set of comma separated strings
    * “GLOBAL” keyword  (for all pages),
    * “RECORDS” keyword (for all record pages)
    * *<ObjectApiName>* (for a specific Salesforce Object) 


For each custom metadata, some useful default (or test) records are included (prefixed with 


### Static Resources

3 static resources are included to provide graphical details for the **sfpegIconDsp** and the **sfpegProfileCmp** components**:**

* **sfpegIcons** is a SVG sprite file providing the definition of various icons (in various sizes) to be used as custom icons within the **sfpegIconDsp** component**.**
* **sfpegBanners** is a zip archive containing the set of .png or .jpg files to be used as banner background within the **sfpegProfileCmp** component**.**
* **sfpegAvatars** is a zip archive containing the set of .png or .jpg files to be used as avater image within the **sfpegProfileCmp** component**.**

A base set of elements is provided, which may be extended.


### Custom Labels

Various **sfpegXXX** custom labels are defined to let administrators customise/translate various component messages and labels used by the LWC components. The label names generally start with the name of the LWC component they are used in. 


### Custom Object

A single object (**sfpegTestObject__c**) is included but only used for test purposes (in Apex test classes).
This object has 2 record types.


### Permission Sets

2 Permission sets are included:

* **sfpegListUsage** for standard end-users (to give them access to all necessary controller classes and VF page)
* **sfpegListTest** for apex test (dynamically given to the running user to be able to properly execute the tests)


* * *

## Component Configuration

Configuration is done at 2 levels:

* in the App Builder, to set simple high level configuration elements (such as card title & icon, debug mode activation...) and select one of the available detailed configuration records (see below)
* via custom metadata records, respectively to provide detailed configuration of the components (e.g. layouts, queries & actions to be used in the components), often containing complex JSON configuration stored in richtext fields.

Such an approach enables to easily reuse the same detailed configuration in multiple Lightning page layouts and enables a more efficient local configuration caching (for better performances)
[Image: Screenshot 2021-09-15 at 11.33.23.png]*Example of the **sfpegListCmp** component configuration in the App Builder, referencing 2 custom metadata records (orange zones) respectively for the data fetch/display configuration and for the header actions.*

In the main of metadata records, context merge tokens may be used to dynamically set some values based on the applicable record(s) and user. See the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** for more details about the applicable syntax and all the possible tokens.

“*Debug xxx ?”* properties enable to display some configuration information within the component and activate the debug logs within the browser console.
* “*Debug ?*” applies only to the current component
* “*Debug (fine) ?*” applies to all sub-components used  within the component (e.g. the action bar or the merge utility).


Please refer to the help pages of the different components for details about how to configure each of them.

In addition to what is already available in the help page of each component, a few interesting configuration/customisation examples
are provided **[here](/help/sfpegExamples.md)**.


* * *

## Technical Details

Hereafter are provided various technical details about the way the components have been implemented, which may help better understand their behaviours.


### Aura vs LWC

Most of the logic is implemented in LWC components.

However, in order to be able to leverage some interesting APIs or components not yet available in LWC (workspaceAPI, overlayApi, utilityBarApi, flow...) or some behaviours not supported by LWC (dynamic component instantiation via `$A.createComponent()`), some logic still had to be implemented in the legacy Aura technology for various action types.

All this custom Aura logic has been centralised in the **sfpegActionUtilityCmp** component and its supporting **sfpegFlowDsp** component.


### Local Initialisation Cache of Configuration

In order to optimise initialisation time of the different components, a 2 stage approach has been used:

* cacheable AuraEnabled Apex methods have been used to fetch custom metadata records (leveraging the standard Lightning cache)
* any fetched / parsed configuration is also stored in a static map variable per component (enabling to execute the initialisation only once and only fetch the missing elements or initialise the specific items)

This approach enables to dramatically reduce initialisation times when the same configuration is used in multiple pages. E.g. when opening Account pages

* the configuration is loaded first then all contextual data requested when opening the first Account page 
* the configuration is reused and contextual data directly fetched when opening the later Account pages.



### Lightning Data Service vs DMLs

Lightning Data Service (via `@wire` methods or `lightning-record-form` components) is heavily used in the components to execute actions or fetch/display record data.

* It is used also to display input forms for mass actions (as temporary creation forms), although no LDS operation is actually executed, mass operations being done via DMLs.
* This works perfectly for all objects supported by LDS, usual exceptions being Task, Event and Knowledge for which DML actions are always required (unless opening the standard creation / edit pages)
* LDS updates are very useful as they automatically propagate to other components and avoid reloading/refreshing the page.



### Lightning Message Service Based Communication

In order to integrate the action framework with custom LWC components, the[Lightning Message Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.use_message_channel) has been leveraged to support bi-directional communication between components in this package and custom external logic.
This mechanism relies on a set of “*message channels*“ for inbound / outbound communication with the package components.

This mechanism is also used internally to communicate from a tab component to the utility **sfpegActionHandlerCmp** component via “*utility*” actions and may be used to propagate “*refresh*” requests to multiple **sfpegListCmp** in a tab after an update action via “*notify*” actions.


### Apex Extensibility

In order to extend the standard capabilities made available in the package, an extension framework (via virtual classes and` forname()` class instantiation) has been implemented to let developers implement and integrate additional custom Apex logic.

This applies to the following features:

* actions (see **sfpegAction** configuration) leveraging the **sfpegAction_SVC** virtual class
* list queries (see **sfpegList** configuration) leveraging the **sfpegListQuery_SVC** virtual class