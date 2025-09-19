# ![Logo](/media/Logo.png) &nbsp; **sfpegSearchPopupCmp** Component

This component is part of the [`sfpegList-utilities`](/help/sfpegListPkgUtilities.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.


## Introduction

The **sfpegSearchPopupCmp** and **sfpegSearchPopupDsp** LWC Components are slightly 
similar to the **[sfpegSearchListCmp](/help/sfpegSearchListCmp.md)** component, the
main difference being that the search form and result list are displayed in a Lightning
[modal popup](https://developer.salesforce.com/docs/component-library/bundle/lightning-modal/documentation)
instead of included in the Lightning page.

![sfpegSearchPopupCmp](/media/sfpegSearchPopupCmp.png)

The **sfpegSearchPopupCmp** is a notification handler for `sfpegCustomAction` messages
sent e.g. via *action* notifications from a **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** 
component.

ℹ️ Typical use case is to provide an **add** action on a list of junction object records
to search and select new possible target records to join.


## Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more general information about the way the included components may be configured. 

🚧 TO BE CONTINUED 🚧

## Technical Details

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more global information about the way the components have been implemented.