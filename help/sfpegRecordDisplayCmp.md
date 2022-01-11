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

---

## Component Configuration

### Global Layout

The **sfpegRecordDisplayCmp** is built as a standard [lightning-card](https://developer.salesforce.com/docs/component-library/bundle/lightning-card/documentation) container, in which the following elements may be 
defined:
* the card title and icon
* the card header action set (via the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component)
* a first content section containing a list of fields
* a second content section structured as a set of tabs (see [lightning-tabset](https://developer.salesforce.com/docs/component-library/bundle/lightning-tabset/documentation) containing
    * a list of fields
    * a possible record list (via the **[sfpegListCmp](/help/sfpegCardCmp.md)** component)

![Record Display Example](/media/sfpegRecordDisplay.png)<br/>
_Tab with only fields_

![Record Display Example with sub-list](/media/sfpegRecordDisplayList.png)
_Tab with fields and list_


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

![Record Display Configuration Metadata](/media/sfpegRecordDisplayConfigMeta.png)

The main _Display Configuration_ property is a JSON object with the following properties:
* _title_ and _icon_ to respectively set the title and icon of the containing [lightning-card](https://developer.salesforce.com/docs/component-library/bundle/lightning-card/documentation)
* _fields_ provides the list of fields displayed in the header section, each field being described as a JSON object with the following properties:
    * _value_ is mandatory and provides the field value (usually leveraging merge **tokens**)
    * _type_ provides the type of field (see **[sfpegFieldDsp](/help/sfpegFieldDsp.md)**) for details about supported values, default being `text`.
    * _label_ (optional) provides the label displayed above the displayed field.
    * _title_ (optional) provides the title displayed when hovering above the displayed field.
    * _size_ (optional) provides the size of the field value display, within a 12 unit grid system, default being 12.
* _tabs_ provides the set of tabs to be displayed below, each tab being described as a JSON object with the following properties
    * _label_ for the tab label
    * _fields_ for the list of fields displayed in the tab, described in the same war as the main _fields_ property
    * _list_ for the optional **[sfpegListCmp](/help/sfpegListCmp.md)** component displayed below the tab fields, as a JSON object with the following properties
        * _title_ and _icon_ (optional) respectively provide the label and icon displayed in the list card header
        * _name_ provides the developer name of the **sfpegList__mdt** custom metadata record to use for the list
        * _actions_ (optional) provides the developer name of the **sfpegAction__mdt** custom metadata record to use for the list header actions

⚠️ **Beware** : when using **merge** tokens (see **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** ),
please pay attention to the possible double quotes within the field values, which completely break the JSON parsing after merge.
In such cases, explicit **ESCAPE(((...)))** directives are required required. This is especially relevant 
when using this component especially meant to display text or richtext areas.

---

## Configuration Examples

For the displayed component example, the configuration is the following.
```
{
    "title":"{{{RCD.Name}}}", "icon":"standard:campaign",
    "fields":[
        {"value":"ESCAPE((({{{RCD.Description}}})))","type":"richText","title":"Objectives"},
        {"value":"{{{RCD.Status}}}","label":"Status"}],
    "tabs":[
        {   "label":"Description",
            "fields":[
                {"value":"ESCAPE((({{{RCD.Objectives__c}}})))","type":"richText","label":"Objectives","size":6},
                {"value":"ESCAPE((({{{RCD.Messages__c}}})))","type":"richText","label":"Messages","size":6}] },
        {   "label":"Operations",
            "fields":[
                {"value":"ESCAPE((({{{RCD.Conditions__c}}})))","type":"richText","title":"Conditions"}],
            "list":{"name":"soslList","title":"SOSL List"}}
    ]
}
```

---

## Technical Details

It relies on the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component to fetch record data, either
via Lightning Data Service (recommended) or via direct SOQL (for LDS unsupported objects).
