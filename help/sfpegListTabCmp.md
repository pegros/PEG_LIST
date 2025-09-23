# ![Logo](/media/Logo.png) &nbsp; **sfpegListTabCmp** Component

This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
It is not available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.


## Introduction

The **sfpegListTabCmp** addressable component enables to display the **[sfpegListCmp](/help/sfpegListCmp.md)**
list component within a dedicated independent tab. Among others, it enables to mimic the _view all_
footer actions on related lists and redirect the user from a short and narrow related list to a wide
and more exhaustive table display of the same related list.

![sfpegListTabCmp Display](/media/sfpegListTabCmp.md)


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

It may not be included directly in any Lightning page from the **App Builder** (or **Site Builder**)
but should be opened e.g. by leveraging *navigation* actions of the  **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**
component (using a [page reference](https://developer.salesforce.com/docs/platform/lwc/guide/reference-page-reference-type.html) of `standard__component` type).

This addressable component provides the following properties to be set in the page `state` at 
navigation:
* `c__list`: Developer name of the **sfpegList__mdt** custom metadata record to be used to fetch
the and display the records in the **sfpegListCmp** component
* `c__actions`: Developer name of the **sfpegAction__mdt** custom metadata record to be used as
header actions of the **sfpegListCmp** component
* `c__label`: Label to be set on the adressable component tab
* `c__title`: Title to be set on the card wrapping the list
* `c__icon`: Icon name (SLDS) to be set on the card wrapping the list and as tab icon
* `c__icon`: Icon name (SLDS) to be set on the card wrapping the list
* `c__recordId`: Id of the record to be provided as input to contextualise the list query
* `c__objectApiName`: API Name of the record to be provided as input to contextualise to the list query
* `c__showSearch`: Boolean flag to display search button in the **sfpegListCmp** component
* `c__showExport`: Boolean flag to display export button in the **sfpegListCmp** component
* `c__displayHeight`: Display height to apply on the **sfpegListCmp** component to trigger scrollbar
* `c__buttonSize`: SLDS size of the header buttons on the **sfpegListCmp** component
* `c__contextString`: custom context to be provided as input to contextualise to the list query
* `c__isDebug`: Flag to set the component in debug mode


## Configuration Examples

A standard **sfpegAction** configuration is the following:
```
{
    "name": "ViewAll",
    "label": "View All",
    "title": "Display all related files in a separate tab",
    "variant": "base",
    "action": {
        "type": "navigation",
        "params": {
            "type": "standard__component",
            "attributes": {
                "componentName": "c__sfpegListTabCmp"
            },
            "state": {
                "c__list": "RelatedFilesTab",
                "c__actions":"RelatedFilesHeaderActions",
                "c__buttonSize": "medium",
                "c__showExport": "false",
                "c__label": "Files",
                "c__title": "All Related Files for Record {{{RCD.Name}}}",
                "c__icon": "standard:file",
                "c__recordId": "{{{GEN.recordId}}}",
                "c__objectApiName": "{{{GEN.objectApiName}}}",
                "c__isDebug":true
            }
        }
    }
}
```

## Technical Details

This component implements the standard LWC **[Addressable](https://developer.salesforce.com/docs/platform/lwc/guide/use-navigate-url-addressable.html?q=lightning__UrlAddressable)** target.

It also relies on the **[sfpegListCmp](/help/sfpegListCmp.md)** and **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**
of the **PEG_LIST** package.

⚠️ A strange behaviour has been identified with _Pinned_ Lightning Page Layouts in console mode.
User may need to refresh from the action available in the sub-tab for the list to be display correctly.
The problem does not arise with other layout types and a Case has been registered.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.