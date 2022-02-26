---
# sfpegCardCmp Component
---

## Introduction

The **sfpegCardCmp** component displays a structured card, with a custom
set of fields / sections fetched/displayed via LDS (including edit capability),
for the current or a directly related (i.e. via lookups) record.

It basically provides:
* more consistency (non Access right dependent UI) and flexibility
(all fields available) than the standard **Related Record** App Builder component 
* a more consistent and dense UI than the new Lightning **Flexible Layout** feature. 

The component enables to switch between `view` and `edit` modes via an `edit`
button. `Read-Only` mode is therefore possible by deactivating this button.

---

## Component Configuration

### Global Layout

The **sfpegCardCmp** basically consists in :
* a wrapping **[lightning-card](https://developer.salesforce.com/docs/component-library/bundle/lightning-card/documentation)** 
with a title, icon and set of header actions (via the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component)
* containing a first top set of fields
* followed by a set of sections containing their own set of fields

The following snapshot presents two successive instances of the component, the first one
applying to the current record and the second to a parent record (identified via a lookup
field on the current record).

![Cards on different records](/media/sfpegCard.png) 

Cards may also include icons next to the fields, the example below being in read-only mode on 
an Experience/Community Site.

![Card with icons](/media/sfpegCardIcons.png) 


### App Builder Configuration

In the App Builder, the configuration of the **sfpegCardCmp** component basically
consists in 
* setting the card title and icon
* selecting one of the available **sfpegCard__mdt** custom metadata record containing the details
of the main fields and sections displayed in the card body
* selecting one of the available **sfpegAction__mdt** custom metadata record containing the 
configuration of the header action button bar (see the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component for details)
* setting various behaviour options (`read only`, `collapsible`...)

![Record Card Configuration](/media/sfpegCardConfiguration.png)


### Metadata Configuration

The **pegCard__mdt** custom Metadata provides the main configuration of the **sfpegCardCmp** components
(target record identification and sections and fields layout).<br/>
![Record Card Metadata](/media/sfpegCardMeta.png)

The first **Related Target** section enables to define the actual record to be displayed in the card
* When the card is for the current record, both fields should remain empty
(the component then automatically uses the standard LWC recordId and objectApiName variables)
* Otherwise the `TargetObject` should contain the API name of the object displayed in the card
and `TargetIdField` should contain the API Name of the lookup field identifying the target record
on the current record. 

The second **Configuration** section describes the internal field layout of the component,
as a JSON object with the following properties :
* `size` defines the default size (in portion of 12) for each field
* `iconSize` defines the size of the icons displayed (if any), as "small", "medium"...)
* `density` defines how the labels are displayed (above vs next to the field value, see **lightning-record-view-form** or **lightning-record-edit-form**)
* `variant` may be alternatively defined for similar  (see **lightning-input-field** or **lightning-output-field**)
* `fields` defines the main list of fields displayed just below the card header, as a list
of JSON field definition objects
  * Each field definition has a mandatory `name` property (API name of the field)
  * It may include `disabled` and `required` boolean properties to control field interaction
  in edit mode
  * It may also include a `size` one to override the main default value
  * It may also include an `icon` one to display next to the field
* `sections` defines the sections displayed afterwards in the card, as a list of JSON section
definition objects
  * Each section definition has a mandatory `label` property (possibly using a Custom Label
  leveraging the `{{{LBL.xxx}}}` merge syntax)
  * It then has a mandatory _fields_ property to define the fields displayed in the section
  (similarly to the main _fields_ property)
  * It may include `isCollapsible` an `isCollapsed` boolean properties to set a section
  as collapsible and set its initial state
  * It may also include a `size` one to override the main default value for the section

```
{
  "size":12,
  "fields":[
    {"name":"Name"},
    {"name":"OwnerId","disabled":true}
  ],
  "sections":[
    { "label": "{{{LBL.PEG_TEST}}}", "size":"6",
      "fields":[
        {"name":"Motif__c","size":4},
        {"name":"DueDate__c","required":true},
        {"name":"TriggerFlow__c","size":4}
      ]
    },
    { "label":"Configuration", "size":"6",
      "isCollapsible":true,
      "isCollapsed":true,
      "fields":[
       {"name":"Icon__c"}
      ]
    }
  ]
}
```

---

## Configuration Examples

### Card with Icons

For the example provided below on the Account object

![Card with icons](/media/sfpegCardIcons.png) 

the configuration in the **sfpegCard** custom metadata should be 
```
{
  "size":6,
  "iconSize":"medium",
  "variant":"label-stacked",
  "fields":[
    {"name":"Name","icon":"resource:nom"},
    {"name":"Mail__c","icon":"resource:email"},
    {"name":"Phone","icon":"resource:telephone"},
    {"name":"Industry","icon":"resource:activity"}
  ]
} 
```

_Note_: The names of the icons are here custom ones added to the **sfpegIcons** static resource
(see **[sfpegIconDsp](/help/sfpegIconDsp.md)** component for details).
All standard **[SLDS](https://www.lightningdesignsystem.com/icons/)** icon names may also be used
(e.g. `utility:info` or `standard:account`). Dynamic icons are not supported.


---

## Technical Details

This component relies on:
* **[record-view-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-view-form/documentation)** and **[record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation)** standard components to fetch / update record data
* **[output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation)** and **[input-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-input-field/documentation)** standard components to display / update record fields
* **[sfpegIconDsp](/help/sfpegIconDsp.md)** to display icons.

_Note_: Currently, there are some known limitations with email and phone fields: when using a `softPhone`
or using an `email` global action, the corresponding fields do not behave as in the standard 
record detail / highlight panel / related list components (i.e. do not open the proper popups).
These limitations come from the standard LWC
[output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation)
and
[input-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-input-field/documentation)
base components, which only display `mailto:` (for email) and `tel:` (for phone) hyperlinks.
