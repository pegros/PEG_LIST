# ![Logo](/media/Logo.png) &nbsp; SFPEG List Utilities Components

This page presents the content of the `sfpegList-utilities` package of the **[PEG_LIST](/README.md)** repository.

⚠️ It applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some components and features listed here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.

## Introduction

The **utilities** package of the **PEG_LIST** repository provides usefull extended capabilities
to the **[sfpegList-core](/help/sfpegListPkgCore.md)** package.

They cover a wide range of more specific UX use cases which may not apply in the majority of
implementations.

## Installation

It may be installed and upgraded as the `sfpegList-utilities` unlocked package directly on your Org
via the installation links provided in the [release notes](#release-notes).

ℹ️ It requires the **[sfpegList-core](/help/sfpegListPkgCore.md)** package to be already installed on your Org
(as it uses some of its UX and utility components).

## Solution Principles

Please refer to the [Component Configuration](/help/configuration.md) dedicated page to
get more information about the way the included components may be configured.

## Package content

The package includes a small set of LWC Components:

- the **[sfpegTriggerEventFlw](/help/sfpegTriggerEventFlw.md)** component for
  **Flows** enabling to notify actions to **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** components.
- the **sfpegOnDemandListCmp** component acting as a simple wrapper to a **[sfpegListCmp](/help/sfpegListCmp.md)** to display it (and query data) only if user explicity requires it (useful for
  Lightning page display performance optimisation)
- the **[sfpegSearchListCmp](/help/sfpegSearchListCmp.md)** component adding a search form
  on top of a **[sfpegListCmp](/help/sfpegListCmp.md)** (search form data being passed in the
  query context)
- the **[sfpegSearchPopupCmp](/help/sfpegSearchPopupCmp.md)** component enabling to open a
  adding any **[sfpegSearchListCmp](/help/sfpegSearchListCmp.md)** in a Popup
- the **[sfpegFilterableListCmp](/help/sfpegFilterableListCmp.md)** component providing richer
  filtering capabilities on the **[sfpegListCmp](/help/sfpegListCmp.md)**

It also provides various off-the-shelf **[Org Utilities](/help/sfpegListOrgUtilities.md)**
consisting in a set of **sfpegList** configurations with underlying Apex extensions
(for data fetch) and related Lightning tabs (for display in Lightning UX).
They provide Salesforce administrator with a quick and filterable access to various
interesting technical information about their Org:

- the current status of all **Governor Limits**
- the list of all available **Objects** (and corresponding key prefixes)

## Technical Details

Please refer to the [Technical Details](/help/technical.md) dedicated page to
get more information about the way the components have been implemented, which may help
better understand their behaviours.

## Release Notes

### September 2025 - v1.0.0

First version with the new unlocked package structure.

Install it:

- from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xHDLIA2) for production orgs,
- from [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xHDLIA2) for sandboxes,
- or by adding the following relative URL to your Org domain: `/packaging/installPackage.apexp?p0=04tJ7000000xHDLIA2`

### November 2025 - v1.1.0

Version content:

- dependency with `sfpegList-core` package upgraded

Install it:

- from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xIhDIAU) for production orgs,
- from [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xIhDIAU) for sandboxes,
- or by adding the following relative URL to your Org domain: `/packaging/installPackage.apexp?p0=04tJ7000000xIhDIAU`

### January 2025 - v1.2.0

Version content:

- added tabs and pages for the **[Org Utilities](/help/sfpegListOrgUtilities.md)**
- added the **[sfpegObjectKeys_SVC](/help/sfpegListOrgUtilities.md)** (and its **sfpegList** metadata record)
  for quick object identification from key prefix
- fixed some display design issues on the **[sfpegOrgLimits_SVC](/help/sfpegListOrgUtilities.md)** Org utility
- added the **[sfpegFilterableListCmp](/help/sfpegListOrgUtilities.md)** component for richer filtering capabilities
  within **sfpegListCmp** (with its **sfpegMultipleFilters** and **sfpegMultiSelectCombobox** sub-components)

Install it: 🚧 PENDING PACKAGE PROMOTION 🚧

- from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=TBD) for production orgs,
- from [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=TBD) for sandboxes,
- or by adding the following relative URL to your Org domain: `/packaging/installPackage.apexp?p0=TBD`
