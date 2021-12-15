---
# sfpegCardListCmp Component
---

## Introduction

The **sfpegCardListCmp** component enables to fetch a list of records
(via a SOQL/Apex query) and displays a **[sfpegCardCmp](/help/sfpegCardCmp.md)** 
component for each one.

![Cards List!](/media/sfpegCardList.png) 


## Configuration

The **pegCardList__mdt** custom metadata provides the configuration of the **sfpegCardListCmp*$ components (targeted records, card configuration to apply).

From the App Builder, the main configuration records may be selected (Card List & Header Actions) as well as various display options.
[Image: Screenshot 2021-11-10 at 18.41.08.png]In the *sfpegCardList__mdt* custom metadata record, multiple fields are available to configure

* how to fetch the targets displayed in the card list
    * leveraging a sfpegList record to execute the query
    * defining which field of the query result is to be used as Id and card title for each target record (Id by default)
    * providing either a fixed value or a field name (in the query result) to set the object API name and card icon of each target record 
* how to display each  target
    * providing either a fixed value or a field name (in the query result) to define the *sfpegCard* custom metadata record to be used for card display
    * doing the same for header actions of each card (with a *sfpegAction* custom metadata record name)
    * card context is reserved for future use (to set the parent context in the card actions)

[Image: Screenshot 2021-11-10 at 18.39.28.png]
