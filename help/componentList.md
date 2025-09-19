# ![Logo](/media/Logo.png) &nbsp; SFPEG **LIST** Components

This page lists all the components included in the **[PEG_LIST](/README.md)** repository.


## Main UX Components

The **PEG_LIST** package provides a whole set of LWC components for the App Builder, as
well as some Aura ones. They are summarized hereafter by use case with links to their dedicated
description pages.


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
* **[sfpegRecordDisplayCmp](/help/sfpegRecordDisplayCmp.md)** displays data about the current record
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


## Core Utility Components

All UX components heavily rely on the following features provided by utility components:
* context adaptation via the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component
* global/row level action capabilities via the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**
component.


## Display Components

There are some LWC display components used by the App Builder ones:
* **sfpegTileDsp** displays a record tile (for the **sfpegListCmp** component in tile mode)
* **sfpegFieldDsp** displays a field with the proper lightning-formatted-XXX according to its type
(for the **sfpegCardDsp** component)
* **[sfpegIconDsp](/help/sfpegIconDsp.md)** displays an lightning-icon 
* **sfpegPopupDsp** to display various pop ups, leveraging promises to await user interaction result
* **sfpegWarningDsp** to display error messages


A single Aura display component is used by other Aura components:
* **sfpegFlowDsp** displays a Flow within a modal popup triggered by the **sfpegActionUtilityCmp** utility component

The **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component is also included in most other App Builder components to display an action bar.


## Utility Components

There are 3 LWC utility components used by the App Builder ones:
* **sfpegJsonUtl** to execute various operations on JSON objects and lists (flattening, hierarchy init for lightning-datatree component, sorting, filtering, formatting...)
* **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** to manage context merge within text variables, extracting tokens, fetching/caching required data and replacing tokens by data.
* **sfpegCsvUtl** to generate and download a CSV file out of JSON list

The **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component is also included in all other App Builder components to provide the customisable action execution utility. It may be explicitely displayed or not.


## LWC Message Channels

3 Messages Channels are available to trigger actions remotely on the **sfActionBarCmp** component family:
* **sfpegAction** enables to trigger an action on the **sfpegActionHandlerCmp** utility component
(typically to request the enforcement of the Console configuration when navigating to a record).
* **sfpegCustomAction** to trigger an action on custom LWC components from a **sfActionBarCmp**
component (e.g. to trigger a custom action not supported by its framework).
* **sfpegCustomNotification** to trigger an action on **sfActionBarCmp** components configured to
subscribe to channels (e.g. to trigger **sfpegListCmp** refreshes).


## Apex Aura Controllers

For configuration retrieval and component specific server side logic execution,
a set of Aura enabled Apex controller classes has been defined:
* **sfpegAction_CTL** enables to retrieve **sfpegAction__mdt** record configuration details and
execute DML operations or Apex actions (implementing the **** virtual interface defined by the **sfpegAction_SVC** class)
* **sfpegCard__CTL** enables to retrieve **sfpegCard__mdt** record configuration details
* **sfpegCardList__CTL** enables to retrieve **sfpegCardList__mdt** record configuration details
* **sfpegKpiList__CTL** enables to retrieve **sfpegKpiList__mdt** record configuration details
* **sfpegList_CTL** enables to retrieve  **sfpegList__mdt**  record configuration details
and execute DML operations or Apex actions (implementing the virtual interface defined by
the **sfpegListQuery_SVC** class)
* **sfpegMerge_CTL** enables to retrieve various metadata to be used within _merge tokens_ by
the **sfpegMergeUtl** component (including data from the **sfpegConfiguration__mdt** records)
* **sfpegMessage_CTL** enables to retrieve **sfpegMessage__mdt** record configuration details
* **sfpegProfile_CTL** enables to retrieve **sfpegProfile__mdt** record configuration details
* **sfpegRecordDisplay_CTL** enables to retrieve **sfpegRecordDisplay__mdt** record configuration details


## Apex Datasource Controllers

For App Builder configuration user experience, various _datasource_ selector classes are also available to select th configuration custom medatata records applicable to the page context:
* **sfpegActionSelector_CTL** provides the configuration of the **sfpegAction__mdt** components
(standalone or embedded within other components)
* **sfpegCardSelector_CTL** provides the configuration of the **sfpegCard__mdt** components
(basically the different sections and their contents)
* **sfpegCardListSelector_CTL** provides the configuration of the **sfpegCardList__mdt** components
(basically the way to retrieve the records and the card configurations to apply)
* **sfpegKpiListSelector__CTL** provides configuration for the  **sfpegKpiList__mdt** components
(basically the list of fields and how they should be displayed)
* **sfpegListSelector_CTL** provides the configuration for the **sfpegListCmp__mdt**  components
(context data required, data request to execute via SOQL/Apex..., how list results should be displayed)
* **sfpegMessageSelector_CTL** provides the configuration for the **sfpegMessage__mdt**  components (list of messages with display style, activation conditions and actions)
* **sfpegProfileSelector_CTL** provides the configuration for the **sfpegProfileCmp__mdt** components (basically what is displayed in their banners, avatars...)
* **sfpegRecordDisplaySelector_CTL** provides the configuration for the **sfpegRecordDisplay__mdt** components (basically the content of the header section and different sub-tabs)

_Note_: Custom metadata records are systematically filtered by these selector classes according
to their _scope_ value (see **Custom Metadata** section hereafter) depending on the page type
(App/Home page vs Record page) and possible Object API Name.


## Apex Service Classes

To implement custom Apex logic, 2 virtual service classes are available:
* **sfpegAction_SVC** to implement custom action logic called via the **sfpegAction_CTL** controller
* **sfpegListQuery_SVC** to implement custom query logic called via the **sfpegListSelector_CTL**  controller.


## Visualforce Page

The **sfpegMergeLabels_VFP** visualforce page (and its **sfpegMergeLabels_CTL** controller)
are available to the **sfpegMerge_CTL** Aura controller to dynamically fetch custom label
values (in the user language) and provide them as _merge token_ values to the 
**[sfpegMergeUtl](/help/sfpegMergeUtl.md)** LWC component.


## Custom Metadata

Various Custom Metadata are defined to store base configuration for the main App Builder components.
* **sfpegAction__mdt** provides the configuration of the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**
components (standalone or embedded within other components)
* **sfpegCard__mdt** provides the configuration of the **[sfpegCardCmp](/help/sfpegCardCmp.md)**
components (list of sections and fields)
* **sfpegCardList__mdt** provides the configuration of the **[sfpegCardlistCmp](/help/sfpegCardListCmp.md)**
components (the way to retrieve the records and the card configurations to apply)
* **sfpegConfiguration__mdt** provides configuration for custom _merge tokens_ to be supported by
the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component (to retrieve and merge
Salesforce IDs for specific Object records, such as Dashboards, Reports, Knowledge Articles...)
* **sfpegKpiList__mdt** provides configuration for the **[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)**
components (basically the list of fields and how they should be displayed)
* **sfpegList__mdt** provides the configuration for the **[sfpegListCmp](/help/sfpegListCmp.md)** 
components (context data required, data request to execute via SOQL / Apex,
how list results should be displayed)
* **sfpegMessage__mdt** provides the configuration for the **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)**
components (list of messages with display style, activation conditions and actions)
* **sfpegProfile__mdt** provides the configuration for the **[sfpegProfileCmp](/help/sfpegProfileCmp.md)**
components (basically what is displayed in their banners, avatars, titles, detail fields, actions)
* **sfpegRecordDisplay__mdt** provides the configuration for the **[sfpegProfileCmp](/help/sfpegProfileCmp.md)**
components (basically the content of the header and sub-tabs)


_Note_: All custom metadata objects include the following common fields:
* `description` to document the usage of each configuration record
* `scope` to define the pages for which the configuration record is applicable, i.e. a set of comma separated strings
    * `GLOBAL` keyword  (for all pages),
    * `RECORDS` keyword (for all record pages)
    * `<ObjectApiName>` (for a specific Salesforce Object) 

For each custom metadata, some useful default (or test) records are included (prefixed with `sfpeg`)


## Static Resources

3 static resources are included to provide graphical details for the **[sfpegIconDsp](/help/sfpegIconDsp.md)**
and the **[sfpegProfileCmp](/help/sfpegProfileCmp.md)** components:
* `sfpegIcons` is a SVG sprite file providing the definition of various icons (in various sizes)
to be used as custom icons within the **sfpegIconDsp** component.
* `sfpegBanners` is a zip archive containing the set of .png or .jpg files to be used as banner
background within the **sfpegProfileCmp** component.
* `sfpegAvatars` is a zip archive containing the set of .png or .jpg files to be used as avatar
image within the **sfpegProfileCmp** component.

_Note_: For all these resources, a base set of items is provided, which may be extended.

⚠️ **Beware** when deploying new versions of the package on an Org where it is already installed
as the new version may override modified items!

## Custom Labels

Various `sfpegXXX` custom labels are defined to let administrators customise/translate a whole set 
of component messages and labels used by the LWC components.
The label names generally start with the name of the LWC component they are used in. 

⚠️ **Beware** when deploying new versions of the package on an Org where it is already installed
as the new version may override modified labels!

## Custom Object

A single object (**sfpegTestObject__c**) is included but only used for test purposes (in Apex test classes).
This object has 2 record types.


## Permission Sets

For each package, two **Permission Sets** are usually included (depends on the package):
* a `sfpegListXxxUsage` one for standard end-users (to give them access to all necessary controller classes and VF page)
* a `sfpegListXxxTest` for apex test (dynamically given to the running user to be able to properly execute the tests)
