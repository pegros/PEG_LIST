---
# sfpegActionUtilityCmp component
---

## Introduction

The **sfpegActionUtilityCmp** component is an Aura wrapper of the **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)**
utility bar component to handle a few additional actions & utility bar specific behaviours currently not possible in LWC :
automatic closing of the utility upon action Trigger, console tab operations (close all tabs, close tab and open another one...),
custom/flow popup open...

![Action utility!](/media/sfpegActionUtility.png) 



This Aura component is a Lightning component to be used as an utility item within
a Lightning App configuration.

It enables to display an action menu (based on the
[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)
component) and handle a whole series of Aura specific action types not supported by the LWC framework.

They may be invoked directly from the **sfpegActionUtilityCmp** component or called from an action bar 
(**sfpegActionBarCmp** component) within a tab leveraging the **utility** action type (to forward the 
action to the utility bar component). 


## Specific Action Types

Compared to the [sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md) LWC component,
this Aura component enables to support the following additional action types :
* _**openPopup**_ to support dynamic Aura custom component instantiation within a popup managed via the
![Overlay Library](https://developer.salesforce.com/docs/component-library/bundle/lightning:overlayLibrary/documentation)
* _**openTab**_, _**closeTabs**_ and _**refreshTab**_ to support console tab open, close and refresh via the
![workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning:workspaceAPI/documentation)
* _**minimize**_ utility bar popup close via the
![utilityBar API](https://developer.salesforce.com/docs/component-library/bundle/lightning:utilityBarAPI/documentation)
* _**fireEvent**_ Aura App event trigger via standard _$A.get(xxx).fire()_ statements
* _**openFlow**_ dynamic Flow execution within a popup (instead of a tab) leveraging the standard
![lightnihg:flow](https://developer.salesforce.com/docs/component-library/bundle/lightning:flow/documentation)
component and the
![Overlay Library](https://developer.salesforce.com/docs/component-library/bundle/lightning:overlayLibrary/documentation)  

The last action type relies on the **sfpegFlowDsp** Aura component to display a Flow within a modal popup.


## Configuration Examples

### Console Actions

Multiple action types are implemented based on the ![workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning:workspaceAPI/documentation) and are especially targeted at console mode usage (although they are compatible
with standard mode):
* **openTab** to close the current tab and open a new one
* **closeTabs** to force the closing of all (or all but current) tabs not pinned
* **refreshTab** to refresh the content of the current tab

Based on 

### Utility Actions
The **minimize** action type

### Popup Actions
The **openPopup** and **openFlow** action types 

### App Event Actions
The **fireEvent** action type

* , minimize, openPopup, openFlow** on the Aura **sfpegActionUtilityCmp** utility component
    * when called from an action bar within a tab, they need to be called first via a “*utility*” action type (to reach the utility bar handler) then via a “*done*” one (to move up from the LWC handler to the Aura container)
    * The following example illustrates how to open a Flow or a custom Aura component in a modal popup from an action bar.
        * for **openFlow**, the ultimate “*params*“ property should follow the input syntax for the ”*runFlow*“ method of the [lightning:flow](https://developer.salesforce.com/docs/component-library/bundle/lightning:flow/documentation) component 
        * for **openTab**, it should contain a JSON object with the different public attributes of the component instantiated. The component should also include the [lightning:overlay](https://developer.salesforce.com/docs/component-library/bundle/lightning:overlayLibrary/documentation) utility to leverage its “*notifyClose*” method to automatically close the popup upon operation completion.

```
[
    {
        "name": "Flow", "label":"Flow",
        "action": {
            "type": "utility",
            "params": {
                "type":"done",
                "params": {
                    "type": "openFlow",
                    "params": {
                        "name":"TEST_TST_Flow",
                        "params":[{"name" : "recordId", "type" : "String", "value" : "{{{GEN.recordId}}}"}],
                        "header":"Test Flow Header",
                        "doRefresh":true,
                        "class": "slds-modal slds-fade-in-open slds-slide-down-cancel slds-modal_large"
                    }
                }
            }
        }
    },
    {
        "name": "Component", "label":"Component",
        "action": {
            "type": "utility",
            "params": {
                "type":"done",
                "params": {
                    "type": "openPopup",
                    "params": {
                        "name": "c:TST_Component",
                        "params":{"recordId":"{{{GEN.recordId}}}"},
                        "header":"Test Popup Header",
                        "doRefresh":true
                    }
                }
            }
        }
    }
]
```

    * when called from the utility menu, they need to be called via a “*done*” action type (to move up from the LWC handler to the Aura container), e.g. to automatically minimize the utility menu popup after having triggered an action.
        * The example below also shows how to use  the **closeAllTabs** and **minimize** action types, actions triggered from the LWC menu but executed in the Aura container (to leverage the standard [lightning:workspaceApi](https://developer.salesforce.com/docs/component-library/bundle/lightning:workspaceAPI/documentation) and [lightning:utilityBarAPI](https://developer.salesforce.com/docs/component-library/bundle/lightning:utilityBarAPI/documentation) components)

```
[
    {
        "label": "New Individual", "name": "NewPA",
        "iconName": "utility:new", "variant": "base",
        "action": {
            "type": "navigation",
            "params": {
                "type": "standard__objectPage",
                "attributes": {
                    "objectApiName": "Account",
                    "actionName": "new"
                },
                "state": {
                    "defaultFieldValues": "Code_Intermediaire__c={{{USR.GRC_CodeIntermediaire_Principal__c}}},Code_Point_de_vente__c={{{USR.Point_de_vente_Principal__c}}},HC_CodePointDeVente__c={{{USR.BranchUnitPointDeVente__c}}},HC_CodeIntermediaire__c={{{USR.BranchUnitIntermediaire__c}}}",
                    "nooverride": "1",
                    "recordTypeId": "{{{RT.Account.Individual}}}"
                }
            },
            "next": {
                "type": "done",
                "params": {
                    "type": "minimize"
                }
            }
        }
    },
    {
        "label":"Close Tabs", "name":"closeAllTabs",
        "action":{
            "type":"done",
            "params":{
                "type":"closeTabs",
                "params":{
                    "closeAll":true
                }
            },
            "next":{
                "type":"done",
                "params":{
                    "type":"minimize"
                }
            }
        }
   },
   {
        "label":"Close All other tabs", "name":"closeAllTabsButCurrent",
        "action":{
            "type":"done",
            "params":{
                "type":"closeTabs",
                "params":{
                    "closeAll":false
                }
            },
            "next":{
                "type":"done",
                "params":{
                    "type":"minimize"
                }
            }
        }
    }
]
```

TO BE CONTINUED
openTab + refreshTab in the roadmap