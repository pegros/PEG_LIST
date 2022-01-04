---
# sfpegCardListCmp Component
---

## Introduction

The **sfpegCardListCmp** component enables to fetch a list of records (via a SOQL/Apex... query) and display
a summary card for each one.

It relies on the **[sfpegListCmp](/help/sfpegListCmp.md)** component to fetch the records and the
**[sfpegCardCmp](/help/sfpegCardCmp.md)** to display them.

It enables to handle cases where direct display of record details is required for a small set of records related
to the current one
* display being adapted to the each record situation (status, record type, object API name)
* direct edit being possible on each record


## Configuration

### Global Layout

The **sfpegCardListCmp** basically consists in :
* a wrapping **[lightning-card](https://developer.salesforce.com/docs/component-library/bundle/lightning-card/documentation)** 
with a title, icon and set of header actions (via the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component)
* containing a list of **[sfpegCardCmp](/help/sfpegCardCmp.md)**

![Cards List](/media/sfpegCardList.png) 


### App Builder Configuration

In the App Builder, the configuration of the **sfpegCardListCmp** component consists in 
* setting the card title and icon (and CSS)
* setting the CSS and size for each **[sfpegCardCmp](/help/sfpegCardCmp.md)** displayed
* selecting one of the available **sfpegCardList__mdt** custom metadata record configuring
how record list is fetched and how they are displayed
* selecting one of the available **sfpegAction__mdt** custom metadata record containing the 
configuration of the header action button bar (see the **[sfpegActionBarCmp](/help/sfpegActionBarCmp.md)** component for details)
* setting various behaviour options (_Read-Only_, _Button Size_, _Show #Records?_, _Show Refresh?_...)

![Record Card List Configuration](/media/sfpegCardListConfig.png)


### Metadata Configuration

The **pegCardList__mdt** custom metadata provides the configuration of the **sfpegCardListCmp** components
(targeted records, card configuration to apply).<br/>
![Record Card List Metadata Configuration](/media/sfpegCardListMeta.png)

A first set of properties defines how to fetch the targets displayed in the card list
* _Query_ provides the query to execute (as a valid **sfpegList__mdt** custom metadata record name,
see **[sfpegListCmp](/help/sfpegListCmp.md)** for details)
* _Record ID Field_ indicates which field of the query result is to be used as record Id (`Id` by default)

A second set of proerties defines how to display each record card
* _Record Name Field_ indicates which field of the query result is to be used as record card title
(`Name` by default)
* _Icon Name Field_ indicates which field of the query result is to be used as record card icon name 
(for dynamic icons), while _Icon Name_ provides a fixed/default value for it 
* _Object Name Field_ and _Object Name_ similarly setting the Object API Name for each record card
* _Card Config Field_ and _Card Config_ similarly setting the **sfpegCard__mdt** name to apply for each record card
* _Card Actions Field_ and _Card Actions_ similarly setting the **sfpegAction__mdt** name to apply for the
header actions of each record card

_Note_: _Card Context_ is currently reserved for future use (to set the root record context in each record card for
their header actions)


## Configuration Examples

***TO BE CCONTINUED***


## Technical Details

This component relies on the **[sfpegCardCmp](/help/sfpegCardCmp.md)** to display a card for each fetched record.
It as this component relies on the standard
[record-view-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-view-form/documentation)
base component to fetch and display record data, data load may become inefficient when the record list
becomes too large.
> The **sfpegCardList** component should therefore be used carefully on small record list sizes to mitigate performance impacts.