---
# sfpegRecordDisplayCmp Component
---

## Introduction

The **sfpegRecordDisplayCmp** component enables to display record fields in a structured way, with
a first top header section followed by a set of tabs displaying record fields or a related list
(via the **[sfpegListCmp](/help/sfpegListCmp.md)**) component).

Its primary purpose is for the display of Knowledge articles in Communities (Salesforce Experience Cloud).
It aims at providing a User friendly and nice looking display for these objects (far better than the standard
_record details_ component). It is also meant (ROADMAP) to support dynamic variations by Record Type and 
conditional display of content.

One key feature is also its ability to use SOQL instead of Lightning Data Service (LDS) to fetch the displayed
record information (for objects not supported by LDS yet).


## Component Configuration

### Global Layout

The **sfpegRecordDisplayCmp** is built as a standard [lightning-card](https://developer.salesforce.com/docs/component-library/bundle/lightning-card/documentation) container, in which the following elements may be 
defined:
* the card title and icon
* the card header action set (via the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component)
* a first content section containing a list of fields
* a second content section structured as a set of tabs (see [lightning-tabset](https://developer.salesforce.com/docs/component-library/bundle/lightning-tabset/documentation) containing
    * a list of fields

![Record Display Example](/media/sfpegRecordDisplay.png)

    * a possible record list (via the **[sfpegListCmp](/help/sfpegCardCmp.md)** component)

![Record Display Example with sub-list](/media/sfpegRecordDisplayList.png)


### App Builder Configuration

Within the App Builder, the configuration is quite simple and mainly consists in
* choosing a **sfpegRecordDisplay__mdt** custom metadata record for global layout cconfiguration
* selecting a **sfpegAction__mdt** custom metadata for header actions
* opting for LDS / SOQL data retrieval mode

![Record Display Configuration](/media/sfpegRecordDisplayConfig.png)

Other properties enable to activate debug mode and slightly adapt the CSS for the wrapping container.


### Metadata Configuration

The **sfpegRecordDisplay__mdt** custom metadata provides most of the configuration of the
**sfpegRecordDisplayCmp** components (fields, tabs, lists displayed).

For the displayed example, the configuration is the following.
```
{
    "title":"{{{RCD.Name}}}", "icon":"standard:campaign",
    "fields":[
        {"value":"{{{RCD.Description}}}","type":"richText","label":"Objectives"},
        {"value":"{{{RCD.Status}}}","label":"Status"}],
    "tabs":[
        {   "label":"Description",
            "fields":[
                {"value":"{{{RCD.Objectives__c}}}","type":"richText","label":"Objectives","size":6},
                {"value":"{{{RCD.Messages__c}}}","type":"richText","label":"Messages","size":6}] },
        {   "label":"Operations",
            "fields":[
                {"value":"{{{RCD.Conditions__c}}}","type":"richText"}],
            "list":{"name":"soslList","title":"SOSL List"}}
    ]
}
```


## Configuration Examples

to be continued...


## Technical Details

It relies on the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component to fetch record data, either
via Lightning Data Service (recommended) or via direct SOQL (for LDS unsupported objects).