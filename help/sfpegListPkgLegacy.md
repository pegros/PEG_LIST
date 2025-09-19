# ![Logo](/media/Logo.png) &nbsp; SFPEG List Legacy Components

This page presents the content of the `sfpegList-legacy` package of the **[PEG_LIST](/README.md)** repository.

⚠️ It applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.


## Introduction

The **legacy** package of the **PEG_LIST** repository mainly provides _legacy_ Aura
components now replaced by LWC equivalents in the other packages. They are kept in
this package for historical reasons.


## Installation 

It may be installed and upgraded as the `sfpegList-legacy` unlocked package directly on your Org
via the installation links provided in the [release notes](#release-notes).

ℹ️ It requires the **[sfpegApex-core](/help/sfpegListPkgCore.md)**
package to be already installed on your Org (as it provides extensions to it).


## Solution Principles

Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more information about the way the included components may be configured. 


## Package content

At last, it provides a small set of Aura components previsouly implemented because
LWC was not supporting the Lightning frameworks used:
* **[sfpegActionUtilityCmp](/help/sfpegActionUtilityCmp.md)** utility bar action menu,
reintegrated almost completely in the undelying 
**[sfpegActionHandlerCmp](/help/sfpegActionHandlerCmp.md)** LWC component
* **sfpegAFlowDsp** used by the **sfpegActionUtilityCmp** component to display 
Flows in popups, feature now natively available in the 
**[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** LWC component
* **[sfpegListViewCmp](/help/sfpegListViewCmp.md)** addressable List component,
replaced by its
**[sfpegListTabCmp](/help/sfpegListTabCmp.md)** LWC equivalent


## Technical Details

Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more information about the way the components have been implemented, which may help 
better understand their behaviours. 


## Release Notes

### September 2025 - v1.0.0
* First version with the new unlocked package structure.
* Install it from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=04TBD) for production orgs
or [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=04TBD) for sandboxes.
