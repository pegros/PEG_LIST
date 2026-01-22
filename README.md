# ![Logo](/media/Logo.png) &nbsp; SFPEG **LIST** Components

## Introduction

This package contains a set of LWC components primarily dedicated to the display of contextualised actionable
lists of information (related records, KPIs, messages, fields...). Even though standard components provide
more dynamic capatibilites over the recent releases (e.g. dynamic forms, enhanced related lists...), the
standard out-of-the-box **Salesforce** platform still misses some usual key customisation and actionability
capabilities which may be provided via configuration of these components instead of full custom code.

They are based on some common powerful features required to easily adapt the end-user experience via context
information merge and a rich action framework while providing extensibility via LWC embedding or LWC messaging
(client side) and dynamic apex logic (server side) invocation. They also focus on performance and user experience
by leveraging most of the browser side capabilities provided by the Salesforce Lightning framework.

These components were built as contributions or examples for former and ongoing Advisory assignments by
[Pierre-Emmanuel Gros](https://github.com/pegros), porting in LWC and optimising (for end-user performances
and easier configuration mutualisation among page layouts) some components previously available in a former
Aura component package (known as **PEG Components** not available on GitHub).

ℹ️ This package has been recently repackaged to better isolate the core components from add-ons,
useful extensions and configuration examples, following remarks and questions from the user community.
The older version remains available in the **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** branch
of the repository.

## Repository Content

This repository contains a whole set of LWC Components for use in _App Builder_ or _Site Builder_
to enhance the UX, the main one being the **[SFPEG Custom List](/help/sfpegListCmp.md)**
(displayed below in table format).

![List View](/media/sfpegListTable.png)

They come with rich and extensible frameworks for contextualization
(via the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** utility component) and
actionability (via the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)**).

The whole set of components (and this repository) is structured as 4 complementary
packages (with their dedicated folders and overview pages):

- **[sfpegList-core](/help/sfpegListPkgCore.md)** providing the core functionality of the
  repository, with focus on the contextualised list component (**[sfpegListCmp](/help/sfpegListCmp.md)**)
  and supporting contextualization and action framework
- **[sfpegList-extensions](/help/sfpegListPkgExtensions.md)** providing other components to enhance
  the standard Lightning UX and leveraging more or less the same underlying framework
- **[sfpegList-utilities](/help/sfpegListPkgUtilities.md)** providing useful extensions to the
  `sfpegList-core` package (Apex extension classes, custom metadata records, wrapping LWC components...)
- **[sfpegList-examples](/help/sfpegListPkgExamples.md)** providing out-of-the-box configurations
  for usual use cases.
- **[sfpegList-legacy](/help/sfpegListPkgLegacy.md)** providing original Aura components, most
  of which have been replaced or integrated into other LWC components.

ℹ️ The [Component List](/help/componentList.md) page provides an exhaustive list of all metadata
included in the reporstory (with links to their _help_ page when available).

ℹ️ Please refer to the **[PEG_DC](https://github.com/pegros/PEG_DC)** repository for extra utilities dedicated
to **Data Cloud** or **AI Prompt** related use cases.

## Repository Availability

The source code is freely available for use under the MIT license from this GitHub repository.
Periodic upgrades will be posted depending on fixes/evolutions implemented as part of assignments
and personal interactions.

For now, all commits are made exclusively by the author but you may push Pull Requests that
may then be then merged after review.

## Installation

As described in the [Technical Details](/help/technical.md) page, you may either deploy
the whole repository (or part of it) via **Git** and **SF CLI** or leverage individual
unlocked package installation links available in the _Release Notes_ section of each
package's overview page.

⚠️ When deploying them, pay attention to the possible dependencies!
E.g. all packages in this repository depend on the `sfpegList-core` package.

ℹ️ When installing them via the unlocked package installation links, you should rather
choose the `Install for Admins only` and `Compile only the Apex in the Package` options.

![Unlocked Package Installation](/media/sfpegListInstallation.png)

⚠️ After installation, please assign to your users the _sfpegListXxxUsage_ `PermissionSets`
provided by the packages in order to use the components without access error.

## Configuration Principles

Please refer to the [Component Configuration](/help/technical.md) dedicated page to
get more information about the way most components may be configured.

## Technical Details

Please refer to the [Technical Details](/help/technical.md) dedicated page to
get more information about the way the components have been implemented, which may help
better understand their behaviours.
