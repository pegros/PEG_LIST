---
# sfpegCardCmp Component
---

## Introduction

The **sfpegCardCmp** component displays a structured card, with a custom
set of fields / sections fetched/displayed via LDS (including edit capability),
for the current or related (i.e. via lookups) record.

![Cards on different records!](/media/sfpegCard.png) 

It basically provides:
* more consistency (non Access right dependent UI) and flexibility
(all fields available) than the standard **related Record** App Builder component 
* a more constent UI than the new **Flexible Layout** feature. 


## Configuration

The **pegCard__mdt** custom Metedata provides the configuration of the **sfpegCardCmp** components (sections and fields in the card, header action menu).

From the App Builder, the main configuration records may be selected (Card Content & Header Actions) as well as various display options.

![Record Card Configuration!](/media/sfpegCardConfiguration.png)

Within the custom metadata, each card element has its own configuration field:

* Two target fields enable to define the actual record to be displayed
    * When the card is for the current record, both fields should remain empty (the component then automatically uses the standard LWC recordId and objectApiName variables)
    * Otherwise the “TargetObject” should contain the API name of the object displayed in the card and “TargetIdField” should contain the lookup field providing the ID of the target record on the current record. 

![Record Card Metadata!](/media/sfpegCardMeta.png)

* the Configuration provides the main display options as a JSON object containing the following attributes:
    * the main _size_ property defines the default size (in portion of 12) for each field
    * “fields” is a JSON list of field configurations for the set of fields displayed just below the card header
        * for each field, the _name_ attribute must be provided, with also _disabled_, _required_ 
        and _size_ optional ones to override the default behaviour. 
    * “sections” is a JSON list of section configurations for the various sections displayed afterwards in the card
        * Each section has a _label_ (possibly coming from a Custom Label leveraging the  {{{LBL.xxx}}}
        merge syntax) and may define a default field _size_ 
        * It then has its own list of _fields_
        * Eacch section may also be set to collapsible and collapsed by default (via _isCollapsible_ and
        _isCollapsed_ boolean properties)
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