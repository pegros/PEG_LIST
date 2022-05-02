---
# sfpegListViewCmp component
---

## Introduction

The **sfpegListViewCmp** component is an [adressable](https://developer.salesforce.com/docs/component-library/bundle/lightning:isUrlAddressable/documentation) Aura component enabling to display a
**[sfpegListCmp](/help/sfpegListCmp.md)** component in a dedicated independent tab/page.

Among others, it enables to mimic the _view all_ footer action on the standard Lightning
related list components from within this LWC component.

It also enables to expand a **[sfpegListCmp](/help/sfpegListCmp.md)** component displayed in
a record page layout section (often 2/3 or less of the page width) into a full width page.

---

## Component Configuration

### Global Layout

The **sfpegListViewCmp** basically displays a single **[sfpegListCmp](/help/sfpegListCmp.md)** component 
in a dedicated page.<br/>
![List View](/media/sfpegListView.png) 


### Component Parameters

As an [adressable](https://developer.salesforce.com/docs/component-library/bundle/lightning:isUrlAddressable/documentation) Aura component, it relies entirely on URL parameters to customise:
* the Lightning page tab label, via the *c__label* parameter
* the configuration of the embedded **[sfpegListCmp](/help/sfpegListCmp.md)** component (i.e. what data are displayed, how they are displayed and what actions are available)
    * *c__list*: Developer name of the **sfpegList__mdt** custom metadata record to be used to fetch the and display the records.
    * *c__actions*: Developer name of the **sfpegAction__mdt** custom metadata record to be used as header actions.
    * *c__actions*: Developer name of the **sfpegAction__mdt** custom metadata record to be used as header actions.
    * *c__showSearch*: Same boolean flag as for the **sfpegListCmp** component (displayed by default).
    * *c__showExport*: Same boolean flag as for the **sfpegListCmp** component (false by default).
    * *c__displayHeight*: Same property as for the **sfpegListCmp** component.
    * *c__buttonSize*: Same property as for the **sfpegListCmp** component.
    * *c__contextString*: Same property as for the **sfpegListCmp** component.
    * *c__title*: title to be set on the card wrapping the list
    * *c__icon*: name of the icon (see [SLDS](https://www.lightningdesignsystem.com/icons/)) to be set on the card wrapping the list
    * *c__recordId*: Id of the record to be provided as input to the list query
    * *c__objectApiName*: Object API Name of the record to be provided as input to the list query
    * *c__isDebug*: flag to set the component in debug mode

---

## Configuration Example

A typical action to open the **sfpegListViewCmp** component may be easily configured in an **sfpegAction__mdt**
custom metadata record (e.g. for **[sfpegListCmp](/help/sfpegListCmp.md)** component) as follows:
```
[{
    "name": "OpenList", "label": "Open List", "title":"Open List in other Tab",
    "action": {
        "type":"navigation",
        "params": {
            "type": "standard__component",
            "attributes": {
                "componentName": "c__sfpegListViewCmp"
            },
            "state": {
                "c__list": "TSTsListPage",
                "c__actions": "TSTsListHeader",
                "c__buttonSize": "medium",
                "c__showExport": "true",
                "c__label": "TSTsList",
                "c__title": "List of TST records",
                "c__icon": "standard:account",
                "c__recordId": "{{{GEN.recordId}}}",
                "c__objectApiName": "{{{GEN.objectApiName}}}",
                "c__isDebug": true
            }
        }
    }
}]
```

---

## Technical Details

This is an Aura component because LWC does not support the _adressable_ feature yet.

The rendering cycle is quite tricky as the _init_ phase of the **sfpegListViewCmp**
is not systematically triggered. Therefore, some of the initialisation logic has been
moved in the _afterRender_ (via a
[aura:doneRendering](https://developer.salesforce.com/docs/component-library/bundle/aura:doneRendering/documentation)
event handler) in order to properly apply the parameters provided in the URL.
