# ![Logo](/media/Logo.png) &nbsp; **sfpegAppCardCmp** Component

## Introduction

The **sfpegAppCardCmp** component is a simple wrapper to **[sfpegCardCmp](/help/sfpegCardCmp.md)** 
component to inject a card `recordId` from a global context instead of being the ID of the current
page record. 

![App Card](/media/sfpegAppCardCmp.png)

This ID may be provided by a simple Custom Label leveraging standard Lightning App Builder capabilities
or leverage the templates supported by the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** component.


---

## Component Configuration

### App Builder Configuration

The component only appears in the App Builder for the _Home_ and _App_ Lightning pages.

Most of its configuration is inherited from the underlying **[sfpegCardCmp](/help/sfpegCardCmp.md)**
component.

The only additional properties are:
* `Object API Name` to explicitly define the Object displayed in the Card
* `Record ID` to explicitly provide the ID o the record displayed in the Card

For the `Record ID` property, all **sfpegMergeUtl** supported tokens are available 
but the `RCD`, `ROW` and `CTX` ones are available.


### Metadata Configuration

There is no specific metadata configuration in addition to the standard ones used by the
**[sfpegCardCmp](/help/sfpegCardCmp.md)** component.

ℹ️ Please note however that:
* the underlying `sfpegCard` and `sfpegAction` (for the header actions) metadata record
should be configured with a `GLOBAL` scope in order to be used in an _Home_ and _App_ Lightning page
context.
* for the `sfpegAction` metadata record, the `RCD` merge context is available (set from the 
**sfpegAppCardCmp** additional properties)


---

## Configuration Examples

### Display of a Knowledge Article on a Home page

With the **sfpegAppCardCmp** component, it is easy to display a Card of a Knowledge article 
directly on your home page.

![Knowledge Card](/media/sfpegAppCardCmp.png)


First, extend the **[sfpegMergeUtl](/help/sfpegMergeUtl.md)** configuration in order to get
Knowledge Article IDs out of their `UrlNames`. This enables the same configuration to be pushed
from Org to Org up to production. This may be achieved by adding the following **sfpegConfiguration**
metadata record.

![Merge Config](/media/sfpegAppCardKMConfig.png)


Then, define a simple **sfpegCard** metadata configuration to display the article summary.

![Card Config](/media/sfpegAppCardCardConfig.png)


Then, add a simple **sfpegAction** metadata configuration to navigate to the actual article page.

![Header Action Config](/media/sfpegAppCardActionConfig.png)

At last, after having created your Knowledge Article, configure the **sfpegAppCardCmp** component
in the App Builder by injecting the Knowledge Article ID via a **sfpegMergeUtl** template string
containing its `UrlName`.

![App Card Config](/media/sfpegAppCardConfig.png)


---

## Technical Details

This `Record ID` property is evaluated before actually displaying the **sfpegCardCmp** component. 
If the record ID is not available (e.g. if the **sfpegMergeUtl** template is incorrect or its
underlying context fetch queries return no data), no card is displayed.

