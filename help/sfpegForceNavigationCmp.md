# ![Logo](/media/Logo.png) &nbsp; **sfpegForceNavigationCmp** Component

This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
It is not available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.


## Introduction

The **sfpegForceNavigationCmp** component has no display layout (except in debug mode) but controls
the display of a record in a main tab or sub-tab of a console App.

It enables to work around some default behaviour of the console mode, which systematically opens records
referenced in a loookup or related list as sub-tab of the current main tab, bypassing the console navigation
configuration.

This component e.g. enables to:
* enforce the opening of an Account as main tab, which is very helpful when using _pinned_ Lightning layouts
to display Account summaries next to Opportunity or Case records
* enforce the reopening of a Case as sub-tab of an Account, as soon as it has been linked to it (i.e. display
as main tab when no `AcccountId` value set, as sub-tab of Account once set).
* enforce the systematic opening of a junction record as a sub-tab of one of its referenced record (e.g. in
the `from` record main tab instead of `from` or `to` one depending on where it was opened from).
* redirect the user to the converted Opportunity once a Lead has been converted. 

⚠️ It relies on the `openTab` action type provided by the **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** 
utility bar component to execute the logic. This component must therefore be present in the utility bar
and ready to listen to **utility** notification messages.


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

All of its configuration is done in App / Site Builder as follows:

![sfpegForceNavigationCmp](/media/sfpegForceNavigationConfig.png)

The following properties are available:
* `Main Tab?` to indicate that the record should be displayed in a main tab (vs sub-tab) in console mode
* `Parent Field` (optional) to set the API Name of the lookup field providing the expected Parent ID (if subtab of console mode)
* `Target Page` (optional) to set the [page reference](https://developer.salesforce.com/docs/platform/lwc/guide/reference-page-reference-type.html)
to navigate to if not the same record page (with lookup field API Name as `recordId` property if of record page type)
* `Debug?` to activate debug information (and logs)

ℹ️ Standard Lightning conditional display may be configured to set the conditions when the component should be actually
instantiated in the page (and its logic automatically executed).


## Configuration Examples

### Simple opening of Account as Main Tab

* `Main Tab?` set to `true`
* `Parent Field` empty
* `Target Page` empty

### Opening of Case with Account as SubTab

* `Main Tab?` set to `false`
* `Parent Field` set to `AccountId` (to make sure the Case is opened under its parent Account)
* `Target Page` empty
* Conditional Display rule set to `Record > Account Name > Account Name No Equal` (i.e. non empty `AccountId`)

### Opening of Case without Account as Main Tab

* `Main Tab?` set to `true`
* `Parent Field` empty
* `Target Page` empty
* Conditional Display rule set to `Record > Account Name > Account Name Equals` (i.e. empty `AccountId`)

### Redirection to Converted Account of Converted Lead

* `Main Tab?` set to `true`
* `Parent Field` empty
* `Target Page` set to `{"type":"standard__recordPage","attributes":{"recordId":"ConvertedAccount__c","objectApiName":"Account","actionName":"view"}}`
(assuming a `ConvertedAccount__c`custom field has been set on the Lead object to identify the Account related to the Converted Lead)
* Conditional Display rule set to `Record > Converted Account > Account Name Equals` (i.e. non empty `ConvertedAccount__c`)


## Technical Details

This component relies on various standard Lightning frameworks to execute its logic:
* the standard Lightning Data Service **[getRecord](https://developer.salesforce.com/docs/platform/lwc/guide/reference-wire-adapters-record.html)**
wire service to fetch related parent or lookup record IDs
* the standard **[workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning-platform-workspace-api)** to
fetch current (and possible parent) tab information
* the standard **[Lightning Messaging Service](https://developer.salesforce.com/docs/component-library/bundle/lightning-message-service/documentation)**
to communicate with the **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** utility bar component

It also uses the **sfpegAction** message channel to send `openTab` actions to this utility component.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.