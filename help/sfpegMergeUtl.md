---
# sfpegMergeUtl Utility
---

## Introduction

The **sfpegMergeUtl** component basically enables to merge contextual data within a string. It
* identifies the tokens within the string using a predefined `{{{TOKEN}}}` format
* fetches the data (or uses contextual data provided by the calling component) depending on the type of token (see below for available ones).
* replaces all found tokens by their appropriate values.

All this process is handled on client side in the LWC components using them.


## Available Default Merge Tokens

As a baseline, the **sfpegMergeUtl** component provides the following set of token types:
* **GEN.xxx** to fetch some generic elements :
    * `GEN.objectApiName` and `GEN.recordId` for the Object name and Salesforce record Id of the current page (when applicable)
    * `GEN.userId` for the Salesforce record Id of the current User
    * `GEN.now` to get current timestamp (in ISO format)
    * `GEN.today`, `GEN.yesterday`, `GEN.tomorrow`, `GEN.lastWeek`, `GEN.nextWeek`,  `GEN.lastMonth`, `GEN.nextMonth`,  `GEN.lastQuarter`, `GEN.nextQuarter`,  `GEN.lastYear`, `GEN.nextYear` to get dates in delta to current day, value being provided in ISO format
        * To get these values in user local format (e.g. for message display), `Local` should be appended to the token name (e.g. `GEN.todayLocal`).
* **RCD.fieldName** for data about the current record (if its object is supported by the Lightning Data Service)
    * `fieldName` should correspond to the API name of the field value to fetch, e.g. RCD.Name for the record Name
    * Lookups may be leveraged, e.g. `{{{RCD.Owner.Profile.Name}}}`.
    * Note: `GEN.recordId` is far more efficient than `RCD.Id` to fetch the current record Id
    * Values are fetched via the **[Lightning Data Service](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.data_ui_api)** and this token type only works with
    [LDS supported objects](https://developer.salesforce.com/docs/atlas.en-us.uiapi.meta/uiapi/ui_api_all_supported_objects.htm) (e.g. Tasks, Events, Knowledge__kav are not) 
* **USR.fieldName** for data about the current user
    * It behaves exactly like the **RCD** token
* **ROW.fieldName** for data about a specific record context
    * This usually applies to a given record displayed in a list component, typically to contextualise row-level actions, values being used in tokens needing to have been fetched even if not displayed in the list
    * Syntax is similar to **RCD** and **USR** tokens.
* **CTX.fieldName** for data about a specific usage context
    * This usually applies when a component uses additional contextual data (e.g. a parent record) in addition 
    to other record / user / row data. Currently possible from the **sfpegActionBarCmp** component only via its
    `parentContext` property (more to come soon).
    * Syntax is similar to **ROW**, **RCD** and **USR** tokens.
* **LBL.labelName** to retrieve a custom label value in the user language
* **RT.objectApiName.developerName** to retrieve the Salesforce ID for a given Record Type of an Object
* **PERM.permissionName** to check if the current user has a given custom permission in its habilitations
    * The result is boolean and is usually used to control the activation of an action/menu
    * The **NPERM** prefix may be used instead of **PERM** to check the opposite (user has not the permission)
* **VFP.pageName** to get the full URL of a VF page, i.e. including the security token
    * This is required when the target page has CSRF protection activated

As an example, the following configuration of a **[sfpegActionBarCmp](/help/sfpegListCmp.md)** component
leverages multiple tokens.
```
[
    {
        "name":"warn", "label":"Warn (if not permission)",
        "disabled":{{{NPERM.TST_Perm}}},
        "action":{
            "type":"toast",
            "params":{
                "title":"Beware {{{USR.Name}}}!",
                "message":"This is a warning message for {{{RCD.Name}}}.",
                "variant":"warning"
            }
        }
    }
]
```

_Note_:
* When using merge **tokens** for _picklist_ fields in **USR** of **RCD** tokens, the value _code_ is merged.
In order to merge the value _label_ instead, please add `.LBL` at the end of the field name
(e.g. `{{{RCD.Status__c}}}` for the status code vs `{{{RCD.Status__c.LBL}}}` for the status label)
* When merging _boolean_ or _numeric_ fields in a configuration, double quotes should not be set around
the merge **token**, as it would result in a string instead of a boolean/number
(e.g. `{"isActive":{{{RCD.IsActive__c}}} }` to get `{"isActive":true }` after merge)


---

## Post Merge Modifier - Double Quotes **Escape**

As a baseline, the **sfpegMergeUtl** component directly replaces the tokens by their value.

However, in some cases, some issues may arise when parsing the resulting merged
string as a JSON list or object. Main origin are the double quotes (") within
text fields which then break the JSON parsing operation.

Richtext fields are a key source of problems, e.g. for the **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)** 
or the **[sfpegRecordDisplayCmp](/help/sfpegRecordDisplayCmp.md)** components, especially the 
double quotes induced by HTML formatting.
```
<p>These are the <b style="color: rgb(176, 8, 8);"><i><u>conditions</u></i></b> for the <b>campaign:</b></p>
```

Text fields may also raise the same issue, as double quotes in their content are indeed not escaped (via '&quot;')
as in the richtext field case. 

In order to prevent these fields to break the configuration parsing, a special **ESCAPE(((...)))** directive
is available. Such a directive is applied after the initial merge and replaces all '"' character occurrences
by '\\"' ones. This enables to escape these double quotes for the JSON parsing and restore their original
value for display afterwards.

The following **[sfpegRecordDisplayCmp](/help/sfpegRecordDisplayCmp.md)** configuration example describes
how to use the **ESCAPE(((...)))** directive. It is positionned around the merge **token** but inside the
field attribute double quotes, escaping the double quotes only within the **token** value and letting the 
global JSON parsing be executed correctly. Escaping is here applied only to text and richtext fields.
```
{
    "title":"{{{RCD.Name}}}",
    "icon":"standard:campaign",
    "fields":[
        {"value":"ESCAPE((({{{RCD.Description}}})))","type":"text","label":"Objectives"},
        {"value":"{{{RCD.Status}}}","label":"Status"}
    ],
    "tabs":[
        {
            "label":"Description",
            "fields":[
                {"value":"ESCAPE((({{{RCD.Objectives__c}}})))","type":"richText","label":"Objectives","size":6},
                {"value":"ESCAPE((({{{RCD.Messages__c}}})))","type":"richText","label":"Messages","size":6}
            ]
        },
        ...
    ]
}
```

_Note_: This feature has been extended to also replace by a white space other characters breaking
the Javascript JSON parsing, such as `\r`, `\n`, `\t`.


---

## Merge Tokens Extension

This base set of token types may be extended by leveraging the **sfpegConfiguration** custom metadata.
These records enable to easily retrieve and merge Salesforce IDs for specific Object records,
facilitating the deployment of Salesforce configuration artefacts between environments.
By default a set of predefined metadata records is provided : 
* **RPT** for report IDs (the merge token being then `RPT.DeveloperName`)
* **DBD** for Dashboard IDs  (the merge token being then `DBD.DeveloperName`)
* **FLD** for Folder IDs  (the merge token being then `FLD.DeveloperName`)

E.g. when configuring an action to navigate to the `LeadOpportunityDashboard` dashboard,
the **DBD** token base may be used as follows (see also **[sfpegActionBarCmp](/help/sfpegListCmp.md)**).
```
{
    "label": "Leads & Opportunities",
    "iconName": "utility:high_velocity_sales",
    "action": {
        "type": "navigation",
        "params": {
            "type": "standard__recordPage",
            "attributes": {
                "recordId": "{{{DBD.LeadOpportunityDashboard}}}",
                "objectApiName": "Dashboard",
                "actionName": "view"
            }
        }
    }
}
```


Specific Org records may then be added to the configuration (e.g. the Knowledge Articles or FSC Reciprocal Roles in the example below).<br/>
![Custom Merge Tokens List](/media/sfpegMergeConfiguration.png)

The configuration of it is quite simple.<br/>
![Custom Merge Token Configuration](/media/sfpegMergeConfigExample.png)

In this example, roles may be referenced in creation actions with the `{{{ROLE.<SourceSystemId__c>}}}` keyword.
* _Name_ should contain the token prefix (here `ROLE`).
* _Field_ should indicate which field identifies the token value in the merge syntax for the considered token prefix (here `SourceSystemId__c`).
* _Query_ should provide the SOQL query template to be used by the **sfpegMergeUtl** component to fetch the values (the list of field values requested being automatically added after the `in` keyword).


---

## Server Side Merge Logic for Label Tokens

In the **[sfpegListCmp](/help/sfpegListCmp.md)**  and 
**[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)** components, some token merge logic
(leveraging the **sfpegMerge_CTL** class) takes place on server side when fetching the
configuration metadata.

This applies to **LBL** and **FLBL** (for object field labels, as `FLBL.ObjectName.FieldName`) tokens
in their display configurations to localise column labels to the end-user language.