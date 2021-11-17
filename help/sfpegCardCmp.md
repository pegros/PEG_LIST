---
# sfpegCardCmp Component
---

## Introduction


Card Configuration (*sfpegCard__mdt)*

*pegCard__mdt* provides the configuration of the *sfpegCardCmp* components (sections and fields in the card, header action menu).

From the App Builder, the main configuration records may be selected (Card Content & Header Actions) as well as various display options.


Within the custom metadata, each card element has its own configuration field:

* Two target fields enable to define the actual record to be displayed
    * When the card is for the current record, both fields should remain empty (the component then automatically uses the standard LWC recordId and objectApiName variables)
    * Otherwise the “TargetObject” should contain the API name of the object displayed in the card and “TargetIdField” should contain the lookup field providing the ID of the target record on the current record. 

[Image: Screenshot 2021-11-10 at 16.50.50.png]
* the Configuration provides the main display options as a JSON object containing the following attributes:
    * the main “size” property defines the default size (in portion of 12) for each field
    * “fields” is a JSON list of field configurations for the set of fields displayed just below the card header
        * for each field, the “name” attribute must be provided, with also “disabled”, “required” and “size“ optional ones to override the default behaviour. 
    * “sections” is a JSON list of section configurations for the various sections displayed afterwards in the card
        * Each section has a “label“ (possibly coming from a Custom Label leveraging the  {{{LBL.xxx}}} merge syntax) and may define a default field ”size“ 
        * It then has its own list of “fields”

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
      "fields":[
       {"name":"Icon__c"}
      ]
    }
  ]
}

