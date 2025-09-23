# ![Logo](/media/Logo.png) &nbsp; **sfpegTriggerEventFlw** Component

This component is part of the [`sfpegList-extensions`](/help/sfpegListPkgExtensions.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.


## Introduction

The purpose of this LWC component for **Flows** is to be able to notify an action
to be executed by **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** components
available elsewhere in the page.

This is usefull to automatically refresh the information displayed in a page 
after having made DML changes from a Flow popup. E.g. after having created a new
Opportunity in a Flow popup from an Account page, you may update the number of open
opportunities of the Account via a **reload** action  on the Account and **refresh**
the custom **sfpegListCmp** displaying its related opportunities.


## Component Configuration

The component is available from _Flow Builder_ as **SF PEG Notifier** as a 
LWC Component to be included in a Flow **Screen**. 

At runtime (unless in debug mode), it displays nothing and automatically executes
the notification logic upon instantiation. Typical usage is to add this component
within a final Screen of the flow to present a confirmation massage before 
terminating the flow.

The whole component configuration is done from _Flow Builder_, the following properties
being available:
* `Channel`: Channel name via which the event should be notified to the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** components
* `Action`: Action requested to the **sfpegActionBarCmp** components registered to the channel
(e.g. `{"type":"done","params":{"type":"refresh"}}'` for a refresh of their parent 
**[sfpegListCmp](/help/sfpegListCmp.md)** components)
* `Debug ?`: Activation of debug mode: display of debug information and switch to manual
manual notification via a button

![sfpegTriggerEventFlw Configuration](/media/sfpegTriggerEventConfig.md)


## Technical Details

This component uses the **sfpegCustomNotification** message channel to send the configured
action to the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** components.

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.