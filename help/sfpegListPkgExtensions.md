# ![Logo](/media/Logo.png) &nbsp; SFPEG List Extensions Components

This page presents the content of the `sfpegList-extensions` package of the **[PEG_LIST](/README.md)** repository.

⚠️ It applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some components and features listed here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.

## Introduction

The **extensions** package of the **PEG_LIST** repository leverages the framework provided by the
**core** package to provide other interesting UX components for _App Builder_ or _Site Builder_
(such as the **sfpegProfileCmp** displayed below).

![List View](/media/sfpegProfile.png)

## Installation

It may be installed and upgraded as the `sfpegList-extensions` unlocked package directly on your Org
via the installation links provided in the [release notes](#release-notes).

ℹ️ It requires the **[sfpegList-core](/help/sfpegListPkgCore.md)** package to be already installed on your Org
(as it uses some of its UX and utility components).

⚠️ After installation, you need to grant the `sfpegListExtUsage` permission set to users in order to
let them use the included components.

## Solution Principles

Please refer to the [Component Configuration](/help/configuration.md) dedicated page to
get more information about the way the included components may be configured.

## Package content

The following set of LWC components is available for use in Lightning _App Builder_ or _Site Builder_:

- **[sfpegCardCmp](/help/sfpegCardCmp.md)** displays a structured card, with a custom
  set of fields / sections fetched/displayed via LDS (including edit capability), for the current or
  related (i.e. via lookups) record.
- **[sfpegCardListCmp](/help/sfpegCardListCmp.md)** enables to fetch a list of records
  (via a SOQL, Apex... query) and display a **[sfpegCardCmp](/help/sfpegCardCmp.md)** for each one.
- **[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)** displays an actionable list of KPI field
  values in a structured and graphical way.
- **[sfpegMessageListCmp](/help/sfpegMessageListCmp.md)** displays a conditional,
  contextualised and actionable list of end-user messages with customisable styles.
- **[sfpegProfileCmp](/help/sfpegProfileCmp.md)** displays an actionable graphical summary of a
  record, with various lists of fields.
- **[sfpegRecordDisplayCmp](/help/sfpegRecordDisplayCmp.md)** displays data about the current record
  in a structured way (headline section + sub-tabs), data being fetched either via LDS or SOQL
  (e.g. for Knowledge articles).

## Technical Details

Please refer to the [Technical Details](/help/technical.md) dedicated page to
get more information about the way the components have been implemented, which may help
better understand their behaviours.

## Release Notes

### September 2025 - v1.0.0

First version with the new unlocked package structure.

Install it:

- from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xHDGIA2) for production orgs,
- from [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xHDGIA2) for sandboxes,
- or by adding the following relative URL to your Org domain: `/packaging/installPackage.apexp?p0=04tJ7000000xHDGIA2`

### November 2025 - v1.1.0

Version content:

- `kpiAlign` property added for the **[sfpegKpiListCmp](/help/sfpegKpiListCmp.md)**
  component (to override the default centered layout)
- dependency with `sfpegList-core` package upgraded

Install it:

- from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xIh8IAE) for production orgs,
- from [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=04tJ7000000xIh8IAE) for sandboxes,
- or by adding the following relative URL to your Org domain: `/packaging/installPackage.apexp?p0=04tJ7000000xIh8IAE`

### January 2026 - v1.2.0

Version content:

- dependency with `sfpegList-core` package upgraded

Install it: 🚧 PENDING PACKAGE PROMOTION 🚧

- from [here ⬇️](https://login.salesforce.com/packaging/installPackage.apexp?p0=XXX) for production orgs,
- from [here ⬇️](https://test.salesforce.com/packaging/installPackage.apexp?p0=XXX) for sandboxes,
- or by adding the following relative URL to your Org domain: `/packaging/installPackage.apexp?p0=XXX`
