# ![Logo](/media/Logo.png) &nbsp; **sfpegActionUtilityCmp** component

This component is part of the [`sfpegList-legacy`](/help/sfpegListPkgLegacy.md) package
of the **[PEG_LIST](/README.md)** repository.

ℹ️ Most of its functionalities have been included in the most recent version of the LWC
**[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** utility component. It is kept
mainly for backward compatibility.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegActionUtilityCmp.md).


## Introduction

The **sfpegActionUtilityCmp** component is an Aura wrapper of the **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)**
utility bar component to handle a few additional actions & utility bar specific behaviours currently not possible in LWC :
automatic closing of the utility upon action Trigger, console tab operations (close all tabs, close tab and open another one...),
custom/flow popup open...

![Action utility!](/media/sfpegActionUtility.png) 

This Aura component is a Lightning component to be used as an utility item within a Lightning App configuration.
It enables to display an action menu (based on the [sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)
component) and handle a whole series of Aura specific action types not supported by the LWC framework.

Multiple additional action types are indeed implemented based on various standard Aura APIs:
* [workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning:workspaceAPI/documentation)
for console specific actions:
    * **openTab** to close the current tab and open a new one
    * **closeTabs** to force the closing of all (or all but current) tabs not pinned
    * **refreshTab** to refresh the content of the current tab
* [Overlay Library](https://developer.salesforce.com/docs/component-library/bundle/lightning:overlayLibrary/documentation)
for custom action modal popups:
    * **openPopup** to open a custom Aura component in a Popup
    * **openFlow** to open a Flow in a custom popup
* [utilityBar API](https://developer.salesforce.com/docs/component-library/bundle/lightning:utilityBarAPI/documentation)
for utility bar specific actions
    * **minimize** to close the **sfpegActionUtilityCmp** component utility bar popup
* [$A namespace](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_jsapi_dollarA.htm)
for Aura specific actions
    * **fireEvent** to trigger an Aura Application Event

They may be invoked directly from the **sfpegActionUtilityCmp** component menu or called from any action bar 
(**[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component) within a tab leveraging the
`utility` action type (to forward the action to the utility bar component,
see **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** for details). 


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

The configuration of this component is identical to the **[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** one.

⚠️ **Beware** to opt for automatic component launch in the App Builder
(`Start automatically` checkbox in the component utility bar configuration), in order to
properly handle `utility` actions triggered from the pages.


## Specific Action Types

Compared to the [sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md) LWC component,
this Aura component supports an additional set action types presented hereafter.

### **openPopup** Action Type

The **openPopup** action type provides dynamic Aura component instantiation within a popup managed via the
[Overlay Library](https://developer.salesforce.com/docs/component-library/bundle/lightning:overlayLibrary/documentation).

From a **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component, the following action configuration enables to
open a custom _TST_Component_ Aura component in a Popup.<br/>
```
{
    "name": "Component", "label":"Component",
    "action": {
        "type": "utility",
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
```

_Note_: LWC dynamic instantiation is (currently?) not supported and this acction type only works with Aura ones!


### **openFlow** Action Type

The **openFlow** action type enables to launch a Lightning Flow within a popup (instead of a tab) leveraging the standard
[lightning:flow](https://developer.salesforce.com/docs/component-library/bundle/lightning:flow/documentation)
component and the
[Overlay Library](https://developer.salesforce.com/docs/component-library/bundle/lightning:overlayLibrary/documentation).

From a **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component, the following row action configuration enables to
launch a flow called `TEST_TST_Flow` in a Popup (and refresh the content of the originating **[sfpegListCmp](/help/sfpegListCmp.md)**
once the flow completes, leveraging a `notify` action type within a `next` property).<br/>
```
{
    "name": "Flow", "label":"Flow",
    "action": {
        "type": "utility",
        "params": {
            "type": "openFlow",
            "params": {
                "name":"TEST_TST_Flow",
                "params":[{"name" : "recordId", "type" : "String", "value" : "{{{ROW.Id}}}"}],
                "header":"Test Flow Header",
                "doRefresh":false,
                "class": "slds-modal slds-fade-in-open slds-slide-down-cancel slds-modal_large",
                "next": {
                    "type": "notify",
                    "channel": "RefreshList",
                    "params": {
                        "type": "done",
                        "params": { "type": "refresh" }
                    }
                }
            }
        }
    }
}
```

_Note_:
For the notify action to work properly, the `Notification Channel` of the **[sfpegAction](/help/sfpegActionBarCmp.md)**
row action configuration used in the originating **[sfpegListCmp](/help/sfpegListCmp.md)** should be set to include the
`RefreshList` channel used here.

### **openFlow** Action Type for Mass operations

The **openFlow** Action Type may be also used as a _mass_ action when triggered from the header actions of the
**[sfpegListCmp](/help/sfpegListCmp.md)** (first via a `utility` notification action), in which 
case information about the the selected items may be fed as input to the Flow.

This is done via an additional `selection` property enabling to transform the selection list into a list input
parameter of the Flow. This parameter is then added to the set of inputs specified by the `params` property.

Two options are basically available:
* extracting a single `field` of each selected item and populating a simple String list input property
for the Flow; in the example below, the `Id` of each selected items are provided for the `selectedIDs` 
String multi-value Flow input variable.
```
{
    "name": "Flow1","label": "Launch Flow1",
    "action": {
        "type": "utility",
        "params": {
            "type": "openFlow",
            "params": {
                "name": "TEST_Flow1",
                "params": [{"name": "recordId","type": "String","value": "{{{GEN.userId}}}"}],
                "selection": {"name": "selectedIDs","type": "String","field": "Id"},
                "header": "Test Flow1 Header",
                "doRefresh": false,
                "class": "slds-modal slds-fade-in-open slds-slide-down-cancel slds-modal_large",
                "next": {
                    "type": "notify","channel": "RefreshList",
                    "params": {"type": "done","params": {"type": "refresh"}}
                }
            }
        }
    }
}
```
* building JSON objects with a set of `fields` for each selected item and populating an Apex class list
input property for the Flow; in the example below, the `Id` and `Name` of each selected items are provided
for the `selectedRecords` Apex class multi-value Flow input variable.
```
{
    "name": "Flow2","label": "Launch Flow2",
    "action": {
        "type": "utility",
        "params": {
            "type": "openFlow",
            "params": {
                "name": "TEST_Flow2",
                "params": [{"name": "recordId","type": "String","value": "{{{GEN.userId}}}"}],
                "selection": {"name": "selectedRecords","type": "String","fields": ["Id","Name"]},
                "header": "Test Flow2 Header",
                "doRefresh": false,
                "class": "slds-modal slds-fade-in-open slds-slide-down-cancel slds-modal_large",
                "next": {
                    "type": "notify","channel": "RefreshList",
                    "params": {"type": "done","params": {"type": "refresh"}}
                }
            }
        }
    }
}
```
In this example, this requires the definition of a custom Flow visible Apex class to define
the `selectedRecords` variable in the Flow, e.g. as
```
public with sharing class sfpegTestClass {
 
    @AuraEnabled
    public String Id;
 
    @AuraEnabled
    public String Name;
}
``` 


### **closeTabs** Action Type

The **closeTabs** action type enables to close multiple tabs at once within a console application thanks to the
[workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning:workspaceAPI/documentation).

This is a typical utility bar menu action, two options being available:
* closing all tabs
* closing all but the current active one.
In any case, pinned tabs are ignored and never closed.

From a **sfpegActionUtilityCmp** component, the following action configuration 
provides the two options.
```
{
    "label":"Close Tabs", "name":"closeAllTabs",
    "action":{
        "type":"closeTabs",
        "params":{
            "closeAll":true
        }
    },
    "next":{
        "type":"minimize"
    }
},
{
    "label":"Close All other tabs", "name":"closeAllTabsButCurrent",
    "action":{
        "type":"closeTabs",
        "params":{
            "closeAll":false
        }
    },
    "next":{
        "type":"minimize"
    }
}
```

_Note_: In this example, the **minimize** action type is also used to automatically close the utility
bar menu once the **closeTabs** action is triggered.


### **openTab** Action Type

The **openTab** action type enables to open a target page / record according to the utility configuration 
and possibly automatically close the origin tab. 

It relies on the [workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning:workspaceAPI/documentation)
to determine if the current appliccation is in console mode and execute the various tab navigation and tab
management operations.

***TO BE COMPLETED***


### **refreshTab** Action Type

The **refreshTab** action type is mostly used as a _next_ property of another action type to trigger a refresh of
the current tab upon action completion.

Depending on the application mode (console or standard), it leverages different technical solutions to do it:
* via a simple `$A.get('e.force:refreshView').fire()` statement when in standard mode
* via the `refreshTab()` method of the 
[workspace API](https://developer.salesforce.com/docs/component-library/bundle/lightning:workspaceAPI/documentation)
when in console mode.<br/>
```
    ...
    "next": {
        "type": "refreshTab"
    }
    ...
```


### **minimize** Action Type

The **minimize** action type is mostly used as a _next_ property of another action type to automatically close
the utility bar menu of the **sfpegActionUtilityCmp** component once this action has been triggered.

It leverages the [utilityBar API](https://developer.salesforce.com/docs/component-library/bundle/lightning:utilityBarAPI/documentation) to execute the action.<br/>
```
    ...
    "next": {
        "type": "minimize"
    }
    ...
```

_Note_: please see the **closeTabs** action type for a more complete example.


### **fireEvent** Action Type

The **fireEvent** action type enables to trigger any standard or custom Aura Application Event (e.g. when 
navigation actions are not enough).

It simply executes a standard [`$A.get(xxx).fire()`](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_jsapi_event_fire.htm) statement to trigger the event of the specified _type_ with the provided _params_.

From a **[sfpegListCmp](/help/sfpegListCmp.md)** component displaying a list of files, the following row action
configuration enables to fire a standard Lightning
[openFile](https://developer.salesforce.com/docs/component-library/bundle/lightning:openFiles/documentation) event.

```
{
    "name":"preview", "label":"Preview",
    "iconName":"utility:preview",
    "action": {
        "type":"utility",
        "params": {
            "type": "fireEvent",
            "params": {
                "type":"e.lightning:openFiles",
                "params":{
                    "recordIds": ["{{{ROW.ContentDocumentId}}}"]
                }
            }
        }
    }
}
```

_Note_: this is especially useful in communities, as the file preview is (still) not supported by the 
LWC [navigation service](https://developer.salesforce.com/docs/component-library/bundle/lightning-navigation/documentation)
in such a case.


---

## Configuration Examples

### Popup with Notification back to original Component

_TO BE CONTINUED_


## Technical Details

The **sfpegActionUtilityCmp** component is a pure Aura wrapper of the LWC
**[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** utility bar component
and simply implements a set of Aura specific action types. All its configuration
is done in the child **sfpegActionHandlerCmp** component.

The specific action type names are known from child **sfpegActionHandlerCmp**
component, which automatically pushes them to its parent component via a _done_
event.

Most of these specific action types support _next_ properties which may be
executed by the child **sfpegActionHandlerCmp** component.

Even if initially meant for the utility bar, the **sfpegActionUtilityCmp** Aura component
may be also used in the footer of a community template to provide the same features in this
technical context.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.