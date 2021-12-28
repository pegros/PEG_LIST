---
# sfpegRecordDisplayCmp Component
---

## Introduction

The **sfpegRecordDisplayCmp** component enables to display record fields in a structured way, with
a first top header section followed by a set of tabs displaying record fields or a related list
(via the **[sfpegListCmp](/help/sfpegCardCmp.md)**) component).

It relies on the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component to fetch record data, either
via Lightning Data Service (recommended) or via direct SOQL (for LDS unsupported objects).


## Component Configuration (**sfpegRecordDisplay__mdt**)

The **sfpegRecordDisplayCmp** is built as a standard [lightning-card](https://developer.salesforce.com/docs/component-library/bundle/lightning-card/documentation) container, in which the following elements may be 
defined:
* the card title and icon
* the card header action set (via the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component)
* a first content section containing a list of fields
* a second content section structured as a set of tabs (see [lightning-tabset](https://developer.salesforce.com/docs/component-library/bundle/lightning-tabset/documentation) containing
    * a list of fields
    * a possible record list (via the **[sfpegListCmp](/help/sfpegCardCmp.md)** component)

![Record Display Example!](/media/sfpegRecordDisplay.png)

The **sfpegRecordDisplay__mdt** custom metadata provides most of the configuration of the **sfpegRecordDisplayCmp**
components (fields, tabs, lists displayed).

to be continued...

## Configuration Examples

to be continued...
