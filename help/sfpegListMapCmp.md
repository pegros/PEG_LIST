# ![Logo](/media/Logo.png) &nbsp; **sfpegSearchListCmp** Component

This component is part of the [`sfpegList-utilities`](/help/sfpegListPkgUtilities.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
This component is not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.

## Introduction

The **sfpegListMapCmp** LWC Component is a LWC wrapper of the standard
**[sfpegListCmp](/help/sfpegListCmp.md)** component and enables to display
records of such lists in a standard Google Map based
**[lightning-map](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-map.html)**.

![sfpegListMapCmp default layout](/media/sfpegListMap.png)

ℹ️ Display of the **sfpegListCmp** list below the map is optional (you may hide it by selecting `Hidden` as display type
in the **sfpegList** metadata configuration).

When a location is selected on the map, an automatic filtering takes place in the component in the **sfpegListCmp**
displayed below. You may undo the filtering by clicking again on the same location (or manually remove the filter
from the **sfpegListCmp** filter button icon) or click on another location to change the filtering value.

![sfpegListMapCmp with selection](/media/sfpegListMapSelect.png)

ℹ️ Closing the location popup does not change the active location (standard behaviour of the **lightning-map** component).

## Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to
get more general information about the way the included components may be configured.

This component has almost exactly the same configuration the as the
**[sfpegListCmp](/help/sfpegListCmp.md)** component, some configuration
properties being added both at **App Builder** and **Metadata** levels.

### App Builder Configuration

The **sfpegListMapCmp** requires some additional configuration properties to be set
from **App Builder**, mostly directly derived from the underlying **lightning-map** capabilities.

- `Display Map height`: Display height of the **lightning-map** widget (in px,em..., default 0 value corresponding to its default behaviour)
- `Legend`: Map legend label (when displaying the location map side list)
- `Legend`: Map legend label (when displaying the location map side list)
- `List View`: Display mode for the location map side list view (visible,hidden,auto")
- `Draggable?`: Enables dragging to pan the map with the mouse
- `Zoom Control?`: Shows the +/- zoom controls in the map
- `Scroll with Wheel?`: Permits zooming with the mouse wheel
- `Disable Default UI?`: Remove Map/Satellite and +/- zoom buttons
- `Disable 2-Clicks Zoom?`: Disable zooming with a mouse double-click

These specific properties are highlighted in red in the snapshot below.

![sfpegListMapCmp App Builder Configuration](/media/sfpegListMapConfig.png)

ℹ️ The other properties are exactly those of the underlying **[sfpegListCmp](/help/sfpegListCmp.md)** component.

### Metadata Configuration

This component has almost exactly the same configuration the as the
**[sfpegListCmp](/help/sfpegListCmp.md)** component, the main difference lying
in the `Display Configuration` property of the underlying **sfpegList** custom metadata
record to include the description of the search form.

To define the map configuration, an additional `map` property is added to define the way
records provided by the **sfpegListCmp** will be located and displayed within the map.
Such a property should be a JSON object including the following properties:

- `value`: API Name of the field providing the unique identifier of the location
  (which is then used as filtering value upon location selection)
- `title`: API Name of the field providing the title of the location displayed in
  the map location popup (no popup being displayed if no `title` nor `description` is set)
- `description`: additional information displayed in the map location popup, which may be
  - the API Name of a single field providing the whole description
  - a JSON list of API Names of fields providing description items (which are then
    displayed on separate lines in the popup)
- `location`: JSON object providing the location data to extract from the records with the
  standard `mapMarker` properties of the **[lightning-map](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-map.html)** component, each one providing the
  API Name of the record field to use as input
  _ `City`, `Country`, `PostalCode`, `State` and `Street` for postal address (to be located
  dynamically by Google) and/or
  _ `Latitude` and `Longitude` for precise geolocation (which takes precedence if both
  postal address and geolocation are provided)

⚠️ All fields mentioned in the `map`configuration must be present in the results returned by the
underlying **sfpegListCmp**.

## Configuration Example

For the example presented above, the configuration of the **sfpegList** custom metadata
record is based on a `GeoLocation` Referential DMO fetched from **Data 360**.
The `map` property should be set as follows:

```
"map":{
    "title":"City__c",
    "value":"ExternalID_c__c",
    "location":{"City":"City__c","Country":"Country__c","Latitude":"Latitude__c","Longitude":"Longitude__c"},
    "description":["ExternalID_c__c","City__c","Country__c","Distance"]
}
```

## Technical Details

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to
get more global information about the way the components have been implemented.

⚠️ For the time being, the underlying standard **[lightning-map](https://developer.salesforce.com/docs/platform/lightning-component-reference/guide/lightning-map.html)** component is marked as _beta_.
Some of the **sfpegListMapCmp** component UX is limited by the current capabilities of this base component.
