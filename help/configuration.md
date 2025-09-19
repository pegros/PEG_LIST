# ![Logo](/media/Logo.png) &nbsp; SFPEG **LIST** Component Configuration

This page describes the configuration principles applicable to most if not all components included
in the **[PEG_LIST](/README.md)** repository.


## Introduction

For all App / Site Builder components, configuration is done at 2 levels:
* in the **App / Site Builder**, to set simple high level configuration elements (such as card title & icon,
debug mode activation...) and select one of the available detailed configuration records (see below)
* via **custom metadata** records (often specific to the component), to provide detailed configuration of the
components (e.g. layouts, queries & actions to be used in the components), often containing complex JSON
configuration stored in richtext fields.

Such an approach enables to easily reuse the same detailed configuration (i.e. the one in the **custom metadata**
records) in multiple Lightning page layouts (when using variations per App, record type or profile) and even
between objects while leveraging **App / Site Builder** for quick layout adaptations.

It also provides a more efficient local configuration caching for better UX performances.


## App / Site Builder Configuration

All components for App / Site Builder may be easily identified / filtered in the custom component list, as
* their names are prefixed with `SF PEG` 
* they are tagged with the same package logo.
<p align="center" >
<img src="/media/Logo.png" alt="App/Site Builder Logo" title="App / Site Builder logo" />
</p>

Within App / Site Builder, a reduced set of standard design parameters are usually available:
* component header `title` and `icon`
* component wrapper CSS
* debug mode activation (see further below)

These are then usually extended with
* one or many **custom metadata** records selectors to choose a more complex configuration
* some optional simple custom configuration elements (usually checkboxes)
* some context setting parameters (especially for Site Builder, see further below)

The following example illustrate the configuration of the **[sfpegListCmp](/help/sfpegListCmp.md)**
component in the App Builder, referencing 2 custom metadata records (orange zones) respectively for the data
query & display configuration and for the header actions.

<p align="center" >
<img src="/media/sfpegListConfiguration.png" alt="App Builder Config" title="List App Builder Configuration Example" />
</p>


### Debug Mode Activation

All App / Site Builder components include `Debug xxx ?` properties to:
* force the display of some configuration information within the component (usually in its wrapping card footer) 
as well as links to applicable metadata records and online documentations
* activate debug logs within the browser console, possibly at 2 levels:
  * `Debug ?` applies only to the current component
  * `Debug (fine) ?` (when available) applies to all sub-components used  within the component (e.g. the action bar or the merge utility).

ℹ️ On server side, all controllers have Apex debug logs implemented at various levels
(error, warning, debug, fine...).
It is planned to let them leverage the **sfpegApex-debug** utility of the **[PEG_APEX](https://github.com/pegros/PEG_APEX)** package in a later release.


### External Site (Community) Configuration 

For component usage in External Sites (Communities), 2 additional context properties are usually displayed at
the bottom of the component configuration panel in Site Builder:
* `recordId` to feed the ID of the current record (via the default `{!recordId}` value)
* `objectApiName` to feed the Object API Name of the current record (via the default `{!objectApiName}` value)

⚠️ **Warning**: The `{!objectApiName}` default value sometimes has no value when _connecting_ the components 
at page initialization. In order to mitigate this, setting a fixed test value in Site Builder (e.g. `Account`)
is often preferrable (when possible).


## Custom Metadata Configuration

All custom metadata for **PEG_LIST** component configuration may be easily identified / filtered in 
the **Custom Metadata** setup page as their names are prefixed with `sfpeg`.

Configuration is simply done by managing the records for the proper **custom metadata**:
* `sfpegAction` for list of actions (for action bars, list header / footer / row actions...)
* `sfpegList` for list query and result layout configuration (for custom lists)
* ...

Most configuration **custom metadata** include a base set of properties 
* Standard record `Label`and `Name` identification fields
* a `Description` long text to provide documentation about the record's purpose
* a `Scope` to define where the record should be available (see further below)
* an optional `Permission` to control end user access to the record (see further below)

They are then extended with additional custom fields, with generally at least one large text
field providing complex JSON formatted configuration. The format of such JSON is described 
in the help page of each applicable component.

<p align="center" >
<img src="/media/sfpegCardMeta.png" alt="Custom Metadata Configuration" title="Card Custom Metadata Configuration Example" />
</p>


### Configuration Scoping

All configuration **custom metadata** objects include a `Scope` property to define the pages for which each
individual record is applicable, as a set of space separated strings with the following possible values:
* `GLOBAL` keyword  (for all pages),
* `RECORDS` keyword (for all record pages)
* `<ObjectApiName>` (for a specific Salesforce Object) 

ℹ️ Please set this value properly to limit the list of possible **custom metadata** configuration records
displayed when configuring the component in the App / Site Builder.
It is indeed used by the **Datasource** Apex controllers to filter only the records applicable to the
current page context. 

ℹ️ Setting a `Scope` is also optional. Leaving its value empty is recommended e.g. for all 
**sfpegAction__mdt** records used only as row actions of other **custom metadata** configuration
records (e.g. **sfpegList__mdt**), as usually they may not be used out of a `ROW` context 
(see the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component for more information).

⚠️ **Warning**: For External Sites (Communities), the `GLOBAL` scope value is mandatory for now,
as `RECORDS` and `<ObjectApiName>` context are not properly evaluated when rendering a record page
(KNOWN ISSUE).


### Configuration Access Control

Many **custom metadata** objects include a `Permission` property to define the **custom permission** required
by the end user to access the configuration record.

Even though page layout may be configured not to display the configuration using the **custom metadata** 
record by leveraging conditional display on end user **custom permission**, this adds an extra layer of
security to prevent anyone to access the configuration / the actions directly via API.

This is especially applicable to **sfpegList** and **sfpegAction** records when bypassing Sharing and / or FLS
in the queries or DMLs (creations, updates, deletions).


### Configuration Contextualisation

In the main property of most metadata records, context **merge tokens** may be used to dynamically set some values
based on the applicable record(s) and user. This depends on the component and even the configuration property.

There is an extensive (and extensible) set of **merge tokens** available provided by the
**[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component. Please refer to it for more details
about the applicable syntax and all the possible tokens.

⚠️ **Warning**: **Merge tokens** are mostly evaluated on browser side leveraging the **Lightning Data Service**.
The end user therefore needs to have read access to the underlying information (object and field) even if never
displayed in the application pages and reports.