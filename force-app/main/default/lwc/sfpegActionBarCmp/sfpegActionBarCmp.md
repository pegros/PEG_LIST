---
# sfpegActionBarCmp Component
---
## Introduction
Component providing a set of enhance Lightning UX



### Action Configuration (**sfpegAction__mdt)**

**pegAction__mdt** provides the configuration of the **sfActionBarCmp** components (buttons & menus in an action bar, with underlying actions triggered).

The action bar basically consists in a single list of buttons and menus (within a [lightning-button-group](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-group/documentation)container).

* A button contains a single action configuration
* A menu contains a drop-down list of multiple action configuration items. 

[Image: Screenshot 2021-09-13 at 17.15.41.png]*Display of a **sfActionBarCmp** component within a page (with 1 button followed by 2 menus).*
[Image: Screenshot 2021-09-13 at 18.10.50.png]*Configuration of the **sfActionBarCmp** component in the App Builder*
Most of its configuration  is done via the **"***Actions*" attribute of the metadata record, upon which context merge (see **sfpegMergeUtl** component) is applied/refreshed within each use case.

[Image: Screenshot 2021-09-13 at 18.43.56.png]

Hereafter is a typical configuration for a standalone mix of buttons and menus, containing first a menu with 3 options leading to a report, a dashboard and a folder, then 2 buttons to create Accounts via a Flow (launched within a addressable Lightning component) or a standard creation page.

```
[
    {
        "label": "Monitoring",
        "name": "monitoringMenu",
        "variant": "base",
        "type": "menu",
        "items": [
            {
                "label": "Activities",
                "iconName": "utility:reminder",
                "action": {
                    "type": "navigation",
                    "params": {
                        "type": "standard__recordPage",
                        "attributes": {
                            "recordId": "{{{RPT.ActivityMonitoringReport}}}",
                            "objectApiName": "Report",
                            "actionName": "view"
                        }
                    }
                }
            },
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
            },
            {
                "label": "Others",
                "iconName": "utility:open_folder",
                "action": {
                    "type": "navigation",
                    "params": {
                        "type": "standard__recordPage",
                        "attributes": {
                            "recordId": "{{{FLD.MonitoringFolder}}}",
                            "objectApiName": "Folder",
                            "actionName": "view"
                        }
                    }
                }
            }
        ]
    },
    {
        "label": "New Business",
        "iconName": "utility:new",
        "variant": "base",
        "action": {
            "type": "navigation",
            "params": {
                "type": "standard__component",
                "attributes": {
                    "componentName": "c__PEG_FlowEmbed_CMP"
                },
                "state": {
                    "c__flow": "CreateBusinessAccount",
                    "c__recordId": "null",
                    "c__target": "NewAccountId",
                    "c__label": "Business Creation"
                }
            }
        }
    },
    {
        "label": "New Individual",
        "iconName": "utility:new",
        "variant": "brand",
        "action": {
            "type": "navigation",
            "params": {
                "type": "standard__objectPage",
                "attributes": {
                    "objectApiName": "Account",
                    "actionName": "new"
                },
                "state": {
                    "defaultFieldValues": "Agency__c={{{USR.MainAgency__c}}},Status__c=Prospect",
                    "nooverride": "1",
                    "recordTypeId": "{{{RT.Account.Individual}}}"
                }
            }
        }
    }
]
```

For buttons, at least “*iconName*” or “*label*” should be specified, whereas for menu items, “*label*“ is mandatory and ”“*iconName*” optional.

Multiple other display properties are available:

*  “*variant*” to change the display style (see [lightning-button](https://developer.salesforce.com/docs/component-library/bundle/lightning-button/specification) for possible values).
* “*iconPosition*” to set the icon on the left or right of the label
* “*iconSize*” to act on the button icon size (see [lightning-button-icon](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-icon/specification) or[button-menu](https://developer.salesforce.com/docs/component-library/bundle/lightning-button-menu/specification) for info)


It is also possible to dynamically activate/disable buttons and menu items via the “*disabled*” property, e.g. leveraging current user’s custom permissions via custom formula fields on the “User” object.

```
[
    {
        "name":"warn", "label":"Warn (if not permission)",
        "disabled":{{{NPERM.TST_Perm}}},
        "action":{
            "type":"toast",
            "params":{
                "title":"Beware {{{[USR.Name](https://usr.name/)}}}!",
                "message":"This is a warning message for {{{RCD.Name}}}.",
                "variant":"warning"
            }
        }
    },
    {
        "label":"Menu",
        "align":"auto",
        "items":[
            {
                "name":"toast", "label":"Info (if permission)",
                "disabled":{{{PERM.TST_Perm}}},
                "action":{
                    "type":"toast",
                    "params":{
                        "title":"FYI {{{USR.Name}}}!",
                        "message":"This is an information message on {{{RCD.Name}}}.",
                        "variant":"info"
                    }
                }
            },
            {
                "name":"toast", "label":"Error (always)",
                "action":{
                    "type":"toast",
                    "params":{
                        "title":"Failure for {{{USR.Name}}}!",
                        "message":"This is an error message on {{{RCD.Name}}}.",
                        "variant":"error"
                    }
                }
           }
        ]
    }
]
```


Each button or menu item has an “*action*” property to specify one of the following action types :

* _**navigation**_ to trigger the navigation to a [page reference](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_page_reference_type) leveraging the standard [lightning-navigation](https://developer.salesforce.com/docs/component-library/bundle/lightning-navigation/documentation) base LWC component (e.g. to open a standard record creation/edit/view page).
    * The example below enables to open a report

```
{
    "name":"ReportXXX", "iconName":"utility:metrics", "label":"{{{LBL.TST_ReportXXX}}}",
    "action": {
        "type":"navigation",
        "params": {
            "type": "standard__recordPage",
            "attributes": {
                "recordId":"{{{RPT.ReportXXX}}}",
                "objectApiName":"Report",
                "actionName":"view"
            }
        }
    }
}
```



* _**open**_ is a shortcut to simplify the opening of a record (for the selected row in a list)

```
{
    "name":"open", "label":"Open","iconName":"utility:open",
    "action":{"type":"open"}
}
```



* _**edit**_ is a shortcut to open the standard edit popup of a record (for the current page record in header /standalone use case or the selected row in a list).

```
{
    "name":"edit","label":"Edit","iconName":"utility:edit",
    "action":{"type":"edit"}
}
```



* _**openURL**_ to open a page URL in a different browser tab (via window.open() javascript primitive instead of the Lightning navigation service).
    * “*url*” is the main property to define with the target URL to be used
    * some URL rework directives are available but still pending actual large scale use cases to be officially supported (and documented)

```
{
    "name":"search",
    "label":"{{{LBL.TST_Search}}}",
    "action":{
        "type":"openURL",
        "params":{
            "url":"https://www.google.com/search?q={{{[RCD.Name](https://rcd.name/)}}}"
        }
    }
}
```



* _**LDS**_ to trigger a single record direct create/update/delete via the Lightning Data Service
    * “*title*” and “*message*“ properties enable to change the corresponding text elements in the top part of the displayed popup.
    * “*params*” property should define the “*type*” of the LDS action to execute (“*create*”, “*update*” or “*delete*”) and provide the parameters to be provided to the corresponding [uiRecordApi](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_lightning_ui_api_record) primitive, i.e. create, update or delete.
    * Hereafter are 3 possible examples.

```
{
    "name": "newRelated", "label": "Add new Item", "iconName": "utility:add",
    "action": {
        "type": "LDS",
        "params": {
            "type": "create",
            "params": {
                "apiName": "TST_ChildObject__c",
                "fields": {
                    "Name": "New TEST",
                    "ParentL__c": "{{{GEN.recordId}}}",
                    "state__c":false
                }
            }
        }
    }
},
{
    "name": "activate", "label": "Activate Relation", "iconName": "utility:edit",
    "action": {
        "type": "LDS",
        "title": "Updating Row State",
        "message": "Please confirm.",
        "params": {
            "type": "update",
            "params": {
                "fields": {
                    "Id": "{{{ROW.Id}}}",
                    "state__c":true
                }
            }
        }
    }
},
{
    "name": "delete", "label": "Remove Relation", "iconName": "utility:delete",
    "action": {
        "type": "LDS",
        "title": "Deleting Record",
        "message": "Please confirm.",
        "params": {
            "type": "delete",
            "params": "{{{ROW.Id}}}"
        }
    }
}
```



* **DML** to trigger a DML operation (insert, update, delete) via a dedicated Apex controller instead.
    * The DML operation is designed to possibly work on multiple records (see mass actions hereafter) therefore the “records” property should be configured with a list containing the single record to update.

```
{
    "name": "clone", "label": "Clone",
    "action": {
        "type": "DML",
        "params": {
            "title": "Clone Task",
            "message": "Adding a new Task",
            "params": {
                "operation": "insert",
                "records": [{
                    "sobjectType": "Task",
                    "Subject": "{{{ROW.Name}}}",
                    "Status": "Open",
                    "WhatId": "{{{GEN.recordId}}}"
                }]
            }
        }
    }