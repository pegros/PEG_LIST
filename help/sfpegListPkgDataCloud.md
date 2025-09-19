# ![Logo](/media/Logo.png) &nbsp; SFPEG List Data Cloud Components

This page presents the content of the `sfpegList-dataCloud` package of the **[PEG_LIST](/README.md)** repository.

⚠️ It applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.


## Introduction

The **dataCloud** package of the **PEG_LIST** repository provides some utilities dedicated to
a Data Cloud context.

For now it merely provides an Apex Class extension to the **[sfpegListCmp](/help/sfpegListCmp.md)** 
component capabilities, enabling to query Data Cloud in ANSI SQL via the Connect API. This
feature may be used from the Home Org or from any Companion Org.


## Installation 

It may be installed and upgraded as the `sfpegList-dataCloud` unlocked package directly on your Org
via the installation links provided in the [release notes](#release-notes).

ℹ️ It requires the **[sfpegApex-core](/help/sfpegListPkgCore.md)**
package to be already installed on your Org (as it provides extensions to it).

⚠️ The user needs to have the proper permissions to access Data Cloud data!


## Solution Principles

Please refer to the [Component Configuration](/help/configuration.md) dedicated page to 
get more information about the way the included components may be configured. 


## Package content

At last, it provides asingle Apex query extension classes for the
**[sfpegListCmp](/help/sfpegListCmp.md)** component configuration:
*  **[sfpegDataCloudQueries](/help/sfpegDataCloudQueries.md)** to execute
ANSI SQL querie on Data Cloud via Connect API.


## Technical Details

Please refer to the [Technical Details](/help/technical.md) dedicated page to 
get more information about the way the components have been implemented, which may help 
better understand their behaviours. 


## Release Notes

### September 2025 - v1.0.0
* First version with the new unlocked package structure.
* Install it from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=04TBD) for production orgs
or [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=04TBD) for sandboxes.
