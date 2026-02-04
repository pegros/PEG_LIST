# ![Logo](/media/Logo.png) &nbsp; **sfpegFilterableListCmp** Component

This component is part of the [`sfpegList-utilities`](/help/sfpegListPkgUtilities.md) package
of the **[PEG_LIST](/README.md)** repository.

⚠️ This page applies to the most recent (unlocked) packaging of the **PEG_LIST** repository.
Some features described here may thus not be available on the old **[v0](https://github.com/pegros/PEG_LIST/tree/v0)** version.

## Introduction

The **sfpegFilterableListCmp** LWC Component is a LWC wrapper of the standard
**[sfpegListCmp](/help/sfpegListCmp.md)** component and enables to execute
more complex local filters for such lists via a filter form above a result list.

Typical use cases is to implement a query page letting users set various
filtering criteria one the list of records retrieved.

At first, only the filter form is collapsed.

![sfpegFilterableListCmp Initialization](/media/sfpegFilterableListInit.png)

Then, once the _Expand/Collapse_ button icon has been clicked, the base filter form is displayed
above the result list.

![sfpegFilterableListCmp Baseline](/media/sfpegFilterableList.png)

Then, by using the field selection dropdown (_Add specific filter_), a new filter input is added
depending on the field type (text, date, number, boolean...).

In the example below, a _text_ field has been added which provides a dropdown menu to select
values among all found for this field in the records of the list.

![sfpegFilterableListCmp Filter](/media/sfpegFilterableListSelect.png)

For numbers and dates, 2 inputs are provided to specify a range of values for selection
(_from_ and _to_).

ℹ️ The list of possible values to choose from for a filter is dynamically updated / augmented in case of
list view refresh or pagination load more operation.

## Configuration

ℹ️ Please refer to the [Component Configuration](/help/configuration.md) dedicated page to
get more general information about the way the included components may be configured.

This component has exactly the same configuration the as the
**[sfpegListCmp](/help/sfpegListCmp.md)** component, the set of fields for filtering
being automatically derived from the `columns` and `details` of the display configuration.

ℹ️ The only additional property is the `#filter Columns` which enables to change the
number of filters displayed per line in the filter definition section. This number applies
to large screens and is automatically reduce in medium or smaller screen widths.

## Technical Details

ℹ️ Please refer to the [Technical Details](/help/technical.md) dedicated page to
get more global information about the way the components have been implemented.

The **sfpegFilterableListCmp** wraps the **[sfpegListCmp](/help/sfpegListCmp.md)** component
for list retrieval and display and injects its own `multipleFilterRecords()` method to execute
record filtering.

It also relies on the **sfpegMultipleFilters** and **sfpegMultiSelectCombobox** components to
respectively display the filter management form and manage the multi-value selection inputs.
