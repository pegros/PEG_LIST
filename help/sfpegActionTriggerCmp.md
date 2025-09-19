# ![Logo](/media/Logo.png) &nbsp; **sfpegActionTriggerCmp** Component

This component is part of the [`sfpegList-core`](/help/sfpegListPkgCore.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.
See v0 documentation of the same component [here](/blob/v0/help/sfpegActionTriggerCmp.md).


## Introduction

The purpose of this LWC component is to automatically trigger an action upon instantiation.
See **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** for available action types.

The strategy is to rely on standard Lightning visibility criteria to control its instantiation (and therefore
the action trigger). E.g. as long as an `isComplete` boolean flag is not set to true, an edit popup requesting to 
fill the missing fields may be automatically displayed to the user when opening a record page.

Unless in debug mode, this component displays nothing on the page, but it consumes some margin space by default and should
therefore be preferably located at the bottom of a page layout.  


## Component Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

The component has no extensive configuration, with only 3 basic properties:
* `Action Configuration` chosen among the available and compatible **sfpegAction__mdt** custom metadata records
* `Action Name`  chosen among the button/menu item names available within the selected `Action Configuration`
* `Debug?` to activate debug information and logs

![Action Trigger Configuration!](/media/sfpegActionTriggerConfig.png) 


## Special Use Case - Quick Action Trigger

When a kind of _fire and forget_ action configured in an **sfpegAction** configuration
needs to be triggered from a Quick Action, the **sfpegActionTriggerCmp** component
may be also leveraged within a custom Lightning component usable for Quick Action definition.

E.g. the following Aura component may be used to trigger the `Flow` action of the 
`TST_TstPopups` configuration:

* HTML part of the component:

```
<aura:component implements="force:lightningQuickActionWithoutHeader,force:hasRecordId,force:hasSObjectName" access="global" >

    <aura:attribute name="userId"	type="String"	access="private" />
    <aura:handler	name="init"		value="{!this}"	action="{!c.doInit}" />
    
    <div class="slds-box">
        <p class="slds-text-heading_small">Executing action.</p>
    </div>
    
    <aura:if isTrue="{!v.userId.length > 0}">
        <c:sfpegActionTriggerCmp    configName="TST_TstPopups"          actionName="Flow"
                                    objectApiName="{!v.sObjectName}"    recordId="{!v.recordId}"
                                    userId="{!v.userId}"                isDebug="false">
    	</c:sfpegActionTriggerCmp>
    </aura:if>

</aura:component>
```

* Javascript controller of the component

```
({
    doInit : function(component, event, helper) {
        console.log('doInit: START');
        component.set("v.userId", $A.get("$SObjectType.CurrentUser.Id"));

        let dismissActionPanel = $A.get("e.force:closeQuickAction");
        setTimeout(() => {
            dismissActionPanel.fire();
            console.log('doInit: END');
        }, 1000);
        //To be tuned according to the duration of the action launch

        console.log('doInit: waiting for action to be launched');
    }
})
```

_Note_: For now a `setTimeout()` is required, altough this is no optimal solution. 
Some refactoring in the **sfpegActionBarCmp** would be required to get a formal
notification of action execution completion. This apporach therefore cannot be 
used when triggering form actions managed by the component.


## Technical Details

It relies on a hidden LWC **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component to register/contextualise a set
of available actions and triggers only the one configured. A same **sfpegAction** custom metadata record may thus be shared
by multiple **sfpegActionTriggerCmp** instances, each one using one specific action registered within it.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.