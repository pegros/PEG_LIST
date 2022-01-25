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

The component enables to switch between _view_ and _edit_ modes via an _edit_
button. _Read-Only_ mode is therefore possible by deactivating this button.

---

## Component Configuration

### Global Layout

The **sfpegCardCmp** basically consists in :
* a wrapping **[lightning-card](https://developer.salesforce.com/docs/component-library/bundle/lightning-card/documentation)** 
with a title, icon and set of header actions (via the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component)
* containing a first top set of fields
* followed by a set of sections containing their own set of fields

![Cards on different records](/media/sfpegCard.png) 


### App Builder Configuration

In the App Builder, the configuration of the **sfpegCardCmp** component basically
consists in 
* setting the card title and icon
* selecting one of the available **sfpegCard__mdt** custom metadata record containing the details
of the main fields and sections displayed in the card body
* selecting one of the available **sfpegAction__mdt** custom metadata record containing the 
configuration of the header action button bar (see the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component for details)
* setting various behaviour options (_read only_, _collapsible_...)

![Record Card Configuration](/media/sfpegCardConfiguration.png)


### Metadata Configuration

The **pegCard__mdt** custom Metadata provides the main configuration of the **sfpegCardCmp** components
(target record identification and sections and fields layout).

![Record Card Metadata](/media/sfpegCardMeta.png)

The first **Related Target** section enables to define the actual record to be displayed in the card
* When the card is for the current record, both fields should remain empty
(the component then automatically uses the standard LWC recordId and objectApiName variables)
* Otherwise the _TargetObject_ should contain the API name of the object displayed in the card
and _TargetIdField_ should contain the API Name of the lookup field identifying the target record
on the current record. 

The second **Configuration** section describes the internal field layout of the component,
as a JSON object with the following properties :
* _size_ defines the default size (in portion of 12) for each field
* _density_ defines how the labels are displayed (above vs next to the field value)
* _fields_ defines the main list of fields displayed just below the card header, as a list
of JSON field definition objects
  * Each field definition has a mandatory _name_ property (API name of the field)
  * It may include _disabled_ and _required_ boolean properties to control field interaction
  in edit mode
  * It may also include a _size_ one to override the main default value
* _sections_ defines the sections displayed afterwards in the card, as a list of JSON section
definition objects
  * Each section definition has a mandatory _label_ property (possibly using a Custom Label
  leveraging the `{{{LBL.xxx}}}` merge syntax)
  * It then has a mandatory _fields_ property to define the fields displayed in the section
  (similarly to the main _fields_ property)
  * It may include _isCollapsible_ an _isCollapsed_ boolean properties to set a section
  as collapsible and set its initial state
  * It may also include a _size_ one to override the main default value for the section

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

***TO BE CONTINUED***

---

## Technical Details

Currently, there are some known limitations with email and phone fields: when using a _softPhone_
or using an _email_ global action, the corresponding fields do not behave as in the standard 
record detail / highlight panel / related list components (i.e. do not open the proper popups).
These limitations come from the standard LWC
[output-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-output-field/documentation)
and
[input-field](https://developer.salesforce.com/docs/component-library/bundle/lightning-input-field/documentation)
base components in 
[record-view-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-view-form/documentation)
or
[record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation)
ones, which only display `mailto:` (for email) and `tel:` (for phone) hyperlinks.
