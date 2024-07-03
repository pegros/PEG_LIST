# ![Logo](/media/Logo.png) &nbsp; **sfpegMergeUtl** Utility

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
    * `GEN.baseUrl` for the Salesforce base URL of the current application
    * `GEN.now` to get current timestamp (in ISO format)
    * `GEN.today`, `GEN.yesterday`, `GEN.tomorrow`, `GEN.lastWeek`, `GEN.nextWeek`,  `GEN.lastMonth`, `GEN.nextMonth`,  `GEN.lastQuarter`, `GEN.nextQuarter`,  `GEN.lastYear`, `GEN.nextYear` to get dates in delta to current day, value being provided in ISO format
        * To get these values in user local format (e.g. for message display), `Local` should be appended to the token name (e.g. `GEN.todayLocal`).
    * `GEN.lang` to get the current user langage locale
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
* **CST.settingApiName.fieldName** to get a field value for a hierarchical Custom Setting, applying the Org > Profile > User overrides
    * This may be useful for conditional display of items depending on Org conditions.
* **DMN.siteName** to get the root URL of a Site from its name (or at least one of the possible ones)
    * This may be useful to redirect to another site when in Guest mode; Network switching (see below) indeed does not work in such a case.

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

## Post Merge Modifier

As a baseline, the **sfpegMergeUtl** component directly replaces the tokens by their value.

However, in some cases, some issues may arise when parsing the resulting merged
string as a JSON list or object. 


### Double Quotes **ESCAPE**

Main JSON parsing issues arise from double quotes (") within text fields which then break the JSON parsing operation.

Richtext fields are a key source of problems, e.g. for the **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)** 
or the **[sfpegRecordDisplayCmp](/help/sfpegRecordDisplayCmp.md)** components, especially the 
double quotes induced by HTML formatting.
```
<p>These are the <b style="color: rgb(176, 8, 8);"><i><u>conditions</u></i></b> for the <b>campaign:</b></p>
```

Text fields may also raise the same issue, as double quotes in their content are indeed not escaped (via '&quot;')
as in the richtext field case. 

In order to prevent these fields to break the configuration parsing, a special `ESCAPE(((...)))` directive
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

***Note***: This feature has been extended to also replace by a white space other characters breaking
the Javascript JSON parsing, such as `\r`, `\n`, `\t`.


### **UTF** Special Characters Replacement

In some special cases, issues arise from some special characters (such as comma, plus sign, backslash)
breaking the JSON parsing or ignored.

This arises among others when setting default values for `navigation` actions within
**[sfpegActionBarCmp](/help/sfpegMessageListCmp.md)** configurations. The following
configuration would indeed:
* ignore the plus sign in the resulting _Subject_ string
* cut the _Subject_ string after the comma
* actually fail JSON parsing because of the backslash
```
    "state": {
        "defaultFieldValues": "WhatId=a1F5E00000JVRaXUAX,Subject=Start + middle1 \ middle2 , end",
        "nooverride": "1"
    }
```

In order to prevent these fields to break the configuration parsing, a special `UTF(((...)))` directive
is available. Such a directive is applied after the initial merge and replaces the special character occurrences
by their UTF codes.

In the previous example, the following configuration 
```
"state": {
    "defaultFieldValues": "WhatId={{{GEN.recordId}}},Subject=UTF((({{{RCD.Description__c}}})))",
    "nooverride": "1"
}
```
would lead to the following properly acceptable output for the navigation action: 
```
    "state": {
        "defaultFieldValues": "WhatId=a1F5E00000JVRaXUAX,Subject=Start %2B middle1 %5C middle2 %2C end",
        "nooverride": "1"
    }
```


### Picklist Value **ADD** / **RMV**

When dealing with multi-picklist fields (or any CSV like text field), it is possible to easily
add or remove a specific value via the `ADD(((xxxxxx|||yyy|||z)))` or `RMV(((xxxxxx|||yyy|||z)))` syntaxes.

They respectively enable to add (`ADD`) or remove (`RMV`) a specific unitary `yyyy`value from the 
current `xxxxxx` multi-value leveraging `z` as separator (e.g. `;` for standard multi-picklists).

For instance,
* `ADD(((value1;value2|||value3|||;)))"` is converted into `value1;value2;value3`
* `RMV(((value1;value2;value3|||value2|||;)))"` is converted into `value1;value3`

_Note_: the operations are fault tolerant, i.e.
* adding twice a same value results in a single value in the output
* removing a value not present results in an output equal to the original 

This may be used in row level **[sfpegAction](/help/sfpegActionBarCmp.md)** `LDS` action to
add / remove values in a `MultiPicklist__c` field of a page record from a list of reference
record using the same value set in a `Picklist__c` field:
```
[
    {
        "name": "removeValue",
        "action": {
            "type": "LDS",
            "params": {
                "type": "update",
                "params": {
                    "fields": {
                        "Id": "{{{GEN.recordId}}}",
                        "MultiPicklist__c": "RMV((({{{RCD.MultiPicklist__c}}}|||{{{ROW.Picklist__c}}}|||;)))"
                    }
                }
            }
        }
    },
    {
        "name": "addValue",
        "action": {
            "type": "LDS",
            "params": {
                "type": "update",
                "params": {
                    "fields": {
                        "Id": "{{{GEN.recordId}}}",
                        "MultiPicklist__c": "ADD((({{{RCD.MultiPicklist__c}}}|||{{{ROW.Picklist__c}}}|||;)))"
                    }
                }
            }
        }
    }
]
```


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
* _Target Field_ should indicate which field provides the token value in the merge syntax for the considered token prefix (usually `Id`).
* _Query_ should provide the SOQL query template to be used by the **sfpegMergeUtl** component to fetch the values (the list of field values requested being automatically added after the `in` keyword).

ℹ️ The SOQL query should typically look like:
```
SELECT _Target Field_, _Field_ FROM <OBJECT> WHERE _Field_ IN
```


### Network Token Example

An interesting use case is to leverage the standard **Network** object to retrieve the IDs of the Experience Sites
(e.g. in a **NW** merge token) in order to be able redirections between sites with automatic session revalidation,
leveraging the network switch endpoint (`/servlet/networks/switch`) and using the **urlPathPrefix** to safely
identify Experience Sites (remains constant among Orgs).

The **sfpegConfiguration** record should be configured as follows
    * `label`: `Networks`
    * `Name` : `NTW`
    * `Field` : `urlPathPrefix`
    * `Query` : `SELECT Id, urlPathPrefix FROM Network WHERE urlPathPrefix IN`

**[sfpegAction](/help/sfpegActionBar.md)** records may be configured with  **openURL** actions, e.g. to
* _preview_ a record in an Experience Site from standard Lightning App
```
{
    "name":"preview",
    "label":"Preview on Site",
    "iconName":"utility:preview",
    "action":{
        "type":"openURL",
        "params":{
            "reworkURL":true,
            "url":"{{{GEN.baseUrl}}}/servlet/networks/switch?networkId=LEFT({{{NTW.ExperienceSiteUrlPathPrefix}}},15)&startURL=/offreemploi/{{{GEN.recordId}}}"
    }
}
```
* _redirect_ a user from an Experience Site to another
```
{
    "name": "openSiteB",
    "label": "Open Site B",
    "iconName":"utility:open",
    "action": {
        "type": "openURL",
        "params": {
            "reworkURL": true,
            "target": "_self",
            "url": "/servlet/networks/switch?networkId=LEFT({{{NTW.ExperienceSiteUrlPathPrefix}}},15)&startURL=/"
        }
    }
},
```


---

## Server Side Merge Logic for Label Tokens

In the **[sfpegListCmp](/help/sfpegListCmp.md)**  and 
**[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)** components, some token merge logic
(leveraging the **sfpegMerge_CTL** class) takes place on server side when fetching the
configuration metadata.

This applies to **LBL** and **FLBL** (for object field labels, as `FLBL.ObjectName.FieldName`) tokens
in their display configurations to localise column labels to the end-user language.