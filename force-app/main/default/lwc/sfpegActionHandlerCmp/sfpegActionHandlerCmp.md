---
# sfpegActionHandlerCmp Component
---

## Introduction

This LWC component is dedicated to the utility bar and enables to execute actions from this context.
* its primary purpose is to execute _navigate_ actions from the utility bar, which
automatically enforces the Navigation Rules configured for the console App
instead of systematically opening the new page as a subtab of the current main tab
* it is also used to forward actions to the Aura **[sfpegActionUtilityCmp](/force-app/main/default/lwc/sfpegActionUtilityCmp/sfpegActionUtilityCmp.md)**
component providing additional action types only supported in Aura.

As a baseline, it also enables to display a vertical action menu from the utility bar. 

## Configuration
In order to invoke an action in this component from any **[sfpegActionBarCmp](/force-app/main/default/lwc/sfpegActionBarCmp/sfpegActionBarCmp.md)**
component, the _**utility**_ action type should be used. The _params_ property of this action should then include the
actual configuration of the actual action to be executed from the utility bar.

In the following example, the action enables to open a report within a main tab of a console App.
```
{
    "name": "reportXXX",
    "iconName":"utility:metrics",
    "label":"{{{LBL.TST_ReportXXX}}}",
    "action": {
        "type": "utility",
        "params": {
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
}
```

## Technical Details

The **sfpegActionHandlerCmp** component subscribes to the custom **sfpegAction** LWC Message Channel to
receive action requests from **sfpegActionBarCmp** components within the tabs/pages.

It relies on a LWC **sfpegActionBarCmp** component to display a vertical menu accessible from the utility bar.

The Aura **sfpegActionUtilityCmp** component includes a **sfpegActionHandlerCmp** component and provides 
additional Aura supported action types. When configuring the utility items of an App, only one of these
components should be included.
