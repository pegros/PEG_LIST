/***
* @author P-E GROS
* @date   Jan 2026
* @description  Example LWC Component to display a complex form to
*               display multiple filters for sfpegListCmp usage,
*               including dynamic filter selection.
*               Component created out of initial Pull Request contribution
*               from the community.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2026 pegros
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
***/

import { LightningElement, api } from 'lwc';

import TRUE_LABEL   from '@salesforce/label/c.sfpegFieldTrueLabel';
import FALSE_LABEL  from '@salesforce/label/c.sfpegFieldFalseLabel';

import SEARCH_LABEL from '@salesforce/label/c.sfpegMultipleFilterSearchLabel';
import SEARCH_TITLE from '@salesforce/label/c.sfpegMultipleFilterSearchTitle';
import CLEAR_LABEL  from '@salesforce/label/c.sfpegMultipleFilterClearLabel';
import CLEAR_TITLE  from '@salesforce/label/c.sfpegMultipleFilterClearTitle';
import EXPAND_LABEL from '@salesforce/label/c.sfpegMultipleFilterExpandLabel';
import EXPAND_TITLE from '@salesforce/label/c.sfpegMultipleFilterExpandTitle';
import FILTER_MODE_LABEL    from '@salesforce/label/c.sfpegMultipleFilterFilterModeLabel';
import COMBO_MODE_LABEL     from '@salesforce/label/c.sfpegMultipleFilterComboModeLabel';
import GLOBAL_SEARCH_LABEL  from '@salesforce/label/c.sfpegMultipleFilterGlobalSearchLabel';
import GLOBAL_SEARCH_PLACEHOLDER from '@salesforce/label/c.sfpegMultipleFilterGlobalSearchPlaceholder';
import FIELD_SELECT_LABEL   from '@salesforce/label/c.sfpegMultipleFilterFieldSelectLabel';
import FIELD_SELECT_PLACEHOLDER from '@salesforce/label/c.sfpegMultipleFilterFieldSelectPlaceholder';
import RANGE_START_TITLE    from '@salesforce/label/c.sfpegMultipleFilterRangeStartTitle';
import RANGE_END_TITLE      from '@salesforce/label/c.sfpegMultipleFilterRangeEndTitle';
import INPUT_PLACEHOLDER    from '@salesforce/label/c.sfpegMultipleFilterInputPlaceholder';
import REMOVE_TITLE         from '@salesforce/label/c.sfpegMultipleFilterRemoveTitle';
import PROCESSING_LABEL     from '@salesforce/label/c.sfpegMultipleFilterProcessingLabel';

//-------------------------------------------------------------------------------
// STATIC VARIABLES
//-------------------------------------------------------------------------------
    
const FILTER_TYPE_MAP = {
    "badge":"combobox",
    "boolean":"boolean",
    "currency":"number",
    "date":"date",
    "date-local":"date",
    "email":"text",
    "icon":"combobox",
    "lookup":"combobox",
    "multi-value":"combobox",
    "number":"number",
    "percent":"number",
    "percent-fixed":"number",
    "phone":"text",
    "richText":"text",
    "text":"combobox",
    "url":"text"
}


export default class SfpegMultipleFilters extends LightningElement {

    //-------------------------------------------------------------------------------
    // CONGURATION PARAMETERS
    //-------------------------------------------------------------------------------
    
    @api cardTitle = "Filters";
    @api cardClass;
    @api columns = [];
    @api columnNumber = 2;
    @api hasPadding = false;
    
    @api isExpanded = false;
    @api isDebug = false;
    
    /**
     * Gets and sets the records array for parent component
     * Triggers distinct options computation on first receipt of records
     * Only computes once to avoid performance issues with large dataset
     */
    @api 
    get records() {
        return this._records
    }
    set records(value) {
        if (this.isDebug) console.log("set records: START in MultipleFilters with value", JSON.stringify(value));
        this._records = value;

        if (this.filters && this.activeFilters) {
            if (this.isDebug) console.log("set records: reevaluating activeFilterOptions");
            this.resetFilterOptions();
        }

        if (this.isDebug) console.log("set records: END in MultipleFilters");
    }


    //-------------------------------------------------------------------------------
    // TECHNICAL PARAMETERS
    //-------------------------------------------------------------------------------
    
    isInitDone = false;
    _records = [];
    filters;                // Filters available from the columns configured on the sfpegList
    fieldSelectorOptions;   // Filters available for selection

    activeFilters;          // Currently active filters selected by user
    activeComboboxFilters;  // Currently active filters of combobox type

    useButtonFilter = false;    // If true, filter only on button click; if false, filter automatically
    useSearchCombobox = false;  // Selection mode for combobox filters

    generalSearchValue = '';

    isProcessing = false;

    largeSize = 6;
    mediumSize = 12;

    //-------------------------------------------------------------------------------
    // CUSTOM LABELS
    //-------------------------------------------------------------------------------
    
    booleanTrueLabel = TRUE_LABEL;
    booleanFalseLabel = FALSE_LABEL;

    searchButtonLabel = SEARCH_LABEL;
    searchButtonTitle = SEARCH_TITLE;

    clearButtonLabel = CLEAR_LABEL;
    clearButtonTitle = CLEAR_TITLE;

    expandButtonLabel = EXPAND_LABEL;
    expandButtonTitle = EXPAND_TITLE;

    filterModeCheckboxLabel = FILTER_MODE_LABEL;
    comboboxModeCheckboxLabel = COMBO_MODE_LABEL;

    generalSearchLabel = GLOBAL_SEARCH_LABEL;
    generalSearchPlaceholder = GLOBAL_SEARCH_PLACEHOLDER;

    fieldSelectLabel = FIELD_SELECT_LABEL;
    fieldSelectPlaceholder = FIELD_SELECT_PLACEHOLDER;

    rangeStartTitle = RANGE_START_TITLE;
    rangeEndTitle = RANGE_END_TITLE;

    textInputPlaceholder = INPUT_PLACEHOLDER;

    filterRemoveTitle = REMOVE_TITLE;

    processingLabel = PROCESSING_LABEL;

    //-------------------------------------------------------------------------------
    // CUSTOM GETTERS
    //-------------------------------------------------------------------------------

    get hasColumns() {
        return this.columns?.length > 0;
    }
    
    get filterDivClass() {
        return (this.hasPadding ? "slds-var-p-horizontal_small " : '') + (this.isExpanded ? "slds-is-expanded" : "slds-is-collapsed");
    }

    get expandButtonIcon() {
        return (this.isExpanded ? 'utility:collapse_all' : 'utility:expand_all');
        //"utility:filterList"
    }

    get booleanOptions() {
        return [{value: '', label: '---'}, {value: 'true', label: this.booleanTrueLabel}, {value: 'false', label: this.booleanFalseLabel}];
    }
    
    //-------------------------------------------------------------------------------
    // COMPONENT LIFECYCLE MANAGEMENT
    //-------------------------------------------------------------------------------

    /**
     * Lifecycle hook: Called when component is inserted into the DOM
     * Initializes searchable combobox and computes distinct options if records/columns are available
     */
    connectedCallback() {
        if (this.isDebug) {
            console.log("connected: START for MultipleFilters");
            console.log("connected: isExpanded", this.isExpanded);
            console.log("connected: columnNumber", this.columnNumber);
        }

        if (this.columnNumber) {
            if (this.columnNumber >= 4) {
                this.largeSize = 3;
                this.mediumSize = 4;
            }
            if (this.columnNumber == 3) {
                this.largeSize = 4;
                this.mediumSize = 6;
            }
        }
        if (this.isDebug) {
            console.log("connected: largeSize", this.largeSize);
            console.log("connected: mediumSize", this.mediumSize);
        }

        if (!this.filters) {
            if (this.isDebug) console.log("connected: initializing filters");
            this.initFilters();
        }

        if (this.records && this.activeFilters) {
            if (this.isDebug) console.log("connected: initializing filter options");
            this.resetFilterOptions();
        }

        this.isInitDone = true; 
        if (this.isDebug) console.log("connected: END for MultipleFilters");
    }
    

    //-------------------------------------------------------------------------------
    // EVENT HANDLING
    //-------------------------------------------------------------------------------

    /*
    * Handles manual search button click and applies all current filters
    */
    doSearch() {
        if (this.isDebug) console.log("doSearch: START");
        this.applyFilters();
        if (this.isDebug) console.log("doSearch: END");
    }

    /*
    * Clears all filters and resets all input fields and triggers filterchange event to restore original list in parent
    */
    clearFilters() {
        if (this.isDebug) console.log("clearFilters: START");
        this.isProcessing = true;

        // Hack to enforce rendering of the processing spinner
        setTimeout(() => {
            if (this.isDebug) console.log("clearFilters: resuming processing");
            this.fieldSelectr = [];
            this.activeFilters.forEach(iterFilter => {
                this.fieldSelectorOptions.push({'value':iterFilter.name, 'label':iterFilter.label});
            });
            if (this.isDebug) console.log("clearFilters: field selection restored",JSON.stringify(this.fieldSelectorOptions));
            this.sortFieldSelection();
            if (this.isDebug) console.log("clearFilters: field selection sorted",JSON.stringify(this.fieldSelectorOptions));
            this.activeComboboxFilters = new Map();
            this.activeFilters = [];
            if (this.isDebug) console.log("clearFilters: active filters deleted");

            this.generalSearchValue = '';
            this.filters.forEach(iterFilter => iterFilter.filterValue = null);
            if (this.isDebug) console.log("clearFilters: filter values reset");

        /*const inputs = this.template.querySelectorAll('lightning-input');
        inputs.forEach(input => input.value = '');
        
        const combos = this.template.querySelectorAll('lightning-combobox');
        combos.forEach(combo => combo.value = null);
        
        const fieldSelector = this.template.querySelector('[data-field-selector]');
        if (fieldSelector) fieldSelector.value = null;
        
        clearTimeout(this.filterTimeout);
        clearTimeout(this.generalSearchTimeout);*/
        
            this.dispatchFilterChange({});
            this.isProcessing = false;
            if (this.isDebug) console.log("clearFilters: END");
        },1);
        if (this.isDebug) console.log("clearFilters: timer started");
    }


    /*
    * Handles filter section expand / collapse toggle button
    */
    expandCollapse(event) {
        if (this.isDebug) console.log("expandCollapse: START with isExpanded state", this.isExpanded);
        this.isExpanded = !this.isExpanded;
        if (this.isDebug) console.log("expandCollapse: END with isExpanded state", this.isExpanded);
    }

    /*
    * Handles filter mode checkbox change (auto-filter vs button-filter)
    * If switching to auto-filter mode, applies current filters immediately
    */
    updateFilterMode(event) {
        if (this.isDebug) console.log("updateFilterMode: START with useButtonFilter state", this.useButtonFilter);
        this.useButtonFilter = event.target.checked;
        if (!this.useButtonFilter) {
            if (this.isDebug) console.log("updateFilterMode: applying filters automatically");
            this.applyFilters();
        }
        if (this.isDebug) console.log("updateFilterMode: END with useButtonFilter state",this.useButtonFilter);
    }

    /*
    * Handles searchable combobox mode checkbox change
    */
    updateComboboxMode(event) {
        if (this.isDebug) console.log("updateComboboxMode: START with useSearchCombobox state", this.useSearchCombobox);
        this.useSearchCombobox = event.target.checked;
        if (this.isDebug) console.log("updateComboboxMode: END with useSearchCombobox state", this.useSearchCombobox);
    }

    /**
    * Handles general search input changes
    * Updates generalSearchValue and applies filters if auto-filter mode is enabled
    */
    doGeneralSearch(event) {
        if (this.isDebug) console.log("doGeneralSearch: START with event", JSON.stringify(event));
        this.generalSearchValue = event.target.value;
        //this.applyFiltersIfAuto(500, 'generalSearchTimeout');
        if (!this.useButtonFilter) {
            if (this.isDebug) console.log("doGeneralSearch: applying filters automatically");
            this.applyFilters();
        }
        if (this.isDebug) console.log("doGeneralSearch: END");
    }

    /**
     * Handles field selection from the field selector dropdown
     * Creates a new filter based on column type and distinct values count
     * - Date columns → date filter
     * - Number columns → number filter
     * - Bollean columns → boolean filter
     * - Text columns with < 3000 distinct values → combobox filter
     * - Other columns → text filter
     * @param {Event} event - Change event from field selector combobox
     */
    selectField(event) {
        if (this.isDebug) console.log("selectField: START with event", JSON.stringify(event));

        const fieldName = event.detail.value;
        if (!fieldName) {
            console.warn("selectField: END KO / missing fieldName", JSON.stringify(event.detail));
            return;
        }
        if (this.isDebug) console.log("selectField: processing fieldName", fieldName);
        
        const filterDesc = this.filters.get(fieldName);
        if (!filterDesc) {
            console.warn("selectField: END KO / missing filter for field", fieldName);
            return;
        }
        if (this.isDebug) console.log("selectField: processing filter", JSON.stringify(filterDesc));

        //this.activeFilters.push(filterDesc);
        this.activeFilters = [... this.activeFilters,filterDesc];
        if (this.isDebug) console.log("selectField: filter added in active list", JSON.stringify(this.activeFilters));

        const selectionIndex = this.fieldSelectorOptions.findIndex(iterSelect => iterSelect.value == fieldName);
        this.fieldSelectorOptions.splice(selectionIndex,1);
        this.fieldSelectorOptions = [... this.fieldSelectorOptions];
        if (this.isDebug) console.log("selectField: filter removed from selection list",JSON.stringify(this.fieldSelectorOptions));

        if (filterDesc.isCombobox) {
            if (this.isDebug) console.log("selectField: handling combobox filter");
            if (this.isDebug) console.log("selectField: with #records",this.records?.length);

            this.isProcessing = true;
            // Hack to enforce spinner display while processing all records.
            //setTimeout(() => {
                //if (this.isDebug) console.log("selectField: resuming processing");

                let hasOptionChange = false;
                this.records?.forEach(iterRecord => {
                    if (this.isDebug) console.log("selectField: processing record",JSON.stringify(iterRecord));
                
                    let iterFieldValue = String(iterRecord[fieldName] || '').trim();
                    if (!iterFieldValue) {
                        if (this.isDebug) console.log("selectField: no value for field");
                        return;
                    }
                    if (this.isDebug) console.log("selectField: with value",iterFieldValue);

                    let iterFieldValueList = (filterDesc.type = 'multi-value') ? iterFieldValue.split(';') : [iterFieldValue];
                    if (this.isDebug) console.log("selectField: analyzing record field values",JSON.stringify(iterFieldValueList));

                    iterFieldValueList.forEach(iterValuePart => {
                        if (filterDesc.optionsMap.has(iterValuePart)) {
                            if (this.isDebug) console.log("selectField: value already registered",iterValuePart);
                        }
                        else {
                            filterDesc.optionsMap.set(iterValuePart, {value: iterValuePart, label: iterValuePart});
                            hasOptionChange = true;
                            if (this.isDebug) console.log("selectField: new value registered",iterValuePart);
                        }
                    });
                });
                if (this.isDebug) console.log("selectField: all records processed with changes?",hasOptionChange);
                if (this.isDebug) console.log("selectField: combobox filter options keys init", JSON.stringify(filterDesc.optionsMap.keys()));
                if (this.isDebug) console.log("selectField: combobox filter options values init", JSON.stringify(filterDesc.optionsMap.values()));

                if (hasOptionChange) {
                    if (this.isDebug) console.log("selectField: resetting active filter options");
                    filterDesc.options = Array.from(filterDesc.optionsMap.values());
                    if (this.isDebug) console.log("selectField: combobox filter options registered", JSON.stringify(filterDesc.options));
                }

                this.activeComboboxFilters.set(fieldName,filterDesc);
                if (this.isDebug) console.log("selectField: combobox filter added in active map", JSON.stringify(Array.from(this.activeComboboxFilters.values())));
                this.isProcessing = false;
            //},10);
            //if (this.isDebug) console.log("selectField: launching delayed record processing");
        }

        if (this.refs.fieldSelectCombobox) {
            if (this.isDebug) console.log("selectField: resetting fieldSelectCombobox");
            this.refs.fieldSelectCombobox.value = null;
        }
        if (this.isDebug) console.log("selectField: END");
    }
    
    /*
    * Handles date filter changes (start or end date)
    * Updates the filter value and applies filters if auto-filter mode is enabled
    */
    changeRangeFilter(event) {
        if (this.isDebug) console.log("changeRangeFilter: START with event", event);
        const fieldName = event.target.dataset.fieldname;
        if (this.isDebug) console.log("changeRangeFilter: fieldName extracted", fieldName);
        const rangeType = event.target.dataset.rangeType;
        if (this.isDebug) console.log("changeRangeFilter: rangeType extracted", rangeType);
        

        if (!fieldName || !rangeType) {
            console.warn("changeDateFilter: END KO / Missing fieldName or rangeType in event");
            return;
        }
        
        const filterDesc = this.filters.get(fieldName);
        if (!filterDesc) {
            console.warn("changeDateFilter: END KO / Filter not found for field",fieldName);
            return;
        }
        else if (!filterDesc.isDate && !filterDesc.isNumber) {
            console.warn("changeDateFilter: END KO / Range filter invalid for field",fieldName);
            return;
        }

        let value = event.target.value || '';
        if (this.isDebug) console.log("changeRangeFilter: value extracted", value);
        if (!filterDesc.isDate) {
            value = String(value || '').trim().split('T')[0];
            if (this.isDebug) console.log("changeRangeFilter: date value normalized", value);
        }

        this.updateFilter(filterDesc,rangeType,value);
        
        //this.updateFilter(filterIndex, dateType === 'end' ? 'endDate' : 'startDate', value);
        //his.applyFiltersIfAuto();
        if (this.isDebug) console.log("changeDateFilter: END");
    }

    /*
    * Handles number filter changes (min or max values)
    * Updates the filter value and applies filters if auto-filter mode is enabled
    */
    /*changeNumberFilter(event) {
        if (this.isDebug) console.log("changeNumberFilter: START with event", JSON.stringify(event));
        const fieldName = event.target.dataset.fieldname;
        if (this.isDebug) console.log("changeNumberFilter: fieldName", fieldName);
        const numberType = event.target.dataset.numberType;
        if (this.isDebug) console.log("changeNumberFilter: numberType", numberType);
        const value = event.target.value || '';
        if (this.isDebug) console.log("changeNumberFilter: value", value);
        
        const filterIndex = this.findFilterIndex(fieldName);
        this.updateFilter(filterIndex, numberType === 'max' ? 'maxValue' : 'minValue', value);
        this.applyFiltersIfAuto(500);
        if (this.isDebug) console.log("changeNumberFilter: END");
    }*/
    
    /*
    * Handles multi-select combobox changes
    * Updates the filter value and applies filters if auto-filter mode is enabled
    */
    changeComboboxFilter(event) {
        if (this.isDebug) console.log("changeComboboxFilter: START with event", event);

        const fieldName = event.detail.fieldName;
        if (this.isDebug) console.log("changeComboboxFilter: fieldName extracted", fieldName);
        const selection = event.detail.selection;
        if (this.isDebug) console.log("changeComboboxFilter: selection extracted", JSON.stringify(selection));
        
        if (!fieldName || !selection) {
            console.warn("changeComboboxFilter: END KO / Issue with event detail", JSON.stringify(event.detail));
            return;
        }

        const filterDesc = this.filters.get(fieldName);
        if (!filterDesc) {
            console.warn("changeComboboxFilter: END KO / Filter not found for field",fieldName);
            return;
        }
        else if (!filterDesc.isCombobox) {
            console.warn("changeComboboxFilter: END KO / Combobox filter invalid for field",fieldName);
            return;
        }


        this.updateFilter(filterDesc,'filterValue',(selection?.length > 0 ? selection : null));
        /*        
        const filterIndex = this.findFilterIndex(fieldName);
        this.updateFilter(filterIndex, 'filterValue', selectedValues);
        if (this.isDebug) console.log("updateComboboxFilter: filter updated");
        
        this.applyFiltersIfAuto(100);*/
        if (this.isDebug) console.log("changeComboboxFilter: END");
    }

    /*
    * Handles boolean filter selector changes
    * Updates the filter value and applies filters if auto-filter mode is enabled
    */
    changeBooleanFilter(event) {
        if (this.isDebug) console.log("changeBooleanFilter: START with event", JSON.stringify(event));
        const fieldName = event.target.dataset.fieldname;
        if (this.isDebug) console.log("changeBooleanFilter: fieldName", fieldName);
        const value = (event.target.value === '' ? '' : event.target.value === 'true');
        if (this.isDebug) console.log("changeBooleanFilter: value", value);
        
        if (!fieldName) {
            console.warn("changeBooleanFilter: END KO / Missing fieldName");
            return;
        }

        const filterDesc = this.filters.get(fieldName);
        if (!filterDesc) {
            console.warn("changeBooleanFilter: END KO / Filter not found for field",fieldName);
            return;
        }
        else if (!filterDesc.isBoolean) {
            console.warn("changeBooleanFilter: END KO / Boolean filter invalid for field",fieldName);
            return;
        }

        this.updateFilter(filterDesc,'filterValue',value);

        //const filterIndex = this.findFilterIndex(fieldName);
        //this.updateFilter(filterIndex, 'filterValue', value);
        //this.applyFiltersIfAuto(500);
        if (this.isDebug) console.log("changeBooleanFilter: END");
    }

    /*
    * Handles text filter input changes
    * Updates the filter value and applies filters if auto-filter mode is enabled
    */
    changeTextFilter(event) {
        if (this.isDebug) console.log("changeTextFilter: START with event", JSON.stringify(event));
        const fieldName = event.target.dataset.fieldname;
        if (this.isDebug) console.log("changeTextFilter: fieldName", fieldName);
        const value = String(event.target.value || '').trim();
        if (this.isDebug) console.log("changeTextFilter: value", value);

         if (!fieldName) {
            console.warn("changeTextFilter: END KO / Missing fieldName");
            return;
        }

        const filterDesc = this.filters.get(fieldName);
        if (!filterDesc) {
            console.warn("changeTextFilter: END KO / Filter not found for field",fieldName);
            return;
        }
        else if (!filterDesc.isText) {
            console.warn("changeTextFilter: END KO / Text filter invalid for field",fieldName);
            return;
        }

        this.updateFilter(filterDesc,'filterValue',value);

        /*onst filterIndex = this.findFilterIndex(fieldName);
        this.updateFilter(filterIndex, 'filterValue', value);
        this.applyFiltersIfAuto(500);*/
        if (this.isDebug) console.log("changeTextFilter: END");
    }
    
    /**
    * Removes a filter from activeFilters and applies filters
    * Applies filters if auto-filter mode is enabled
    */
    removeFilter(event) {
        if (this.isDebug) console.log("removeFilter: START with event", event);
        //const fieldName = event.currentTarget?.dataset?.fieldName;
        const fieldName = event.srcElement?.dataset?.fieldname;
        if (this.isDebug) console.log("removeFilter: fieldName identified", fieldName);
        //if (this.isDebug) console.log("removeFilter: source dataset", JSON.stringify(event.srcElement?.dataset));
        //if (this.isDebug) console.log("removeFilter: target dataset", JSON.stringify(event.target?.dataset));
        if (!fieldName){
            console.warn("removeFilter: END KO / missing fieldName");
            return;
        }
        
        //this.activeFilters = this.activeFilters.filter(f => f.fieldName !== fieldName);
        if (this.activeComboboxFilters.has(fieldName)) {
            if (this.isDebug) console.log("removeFilter: removing combobox filter");
            this.activeComboboxFilters.delete(fieldName);
        }

        const filterIndex = this.activeFilters.findIndex(iterFilter => iterFilter.name == fieldName);
        if (this.isDebug) console.log("removeFilter: active filter index found",filterIndex);
        this.activeFilters.splice(filterIndex,1);
        if (this.isDebug) console.log("removeFilter: filter removed from active list",JSON.stringify(this.activeFilters));

        //this.fieldSelectorOptions.push({value: fieldName, label: this.filters.get(fieldName)?.label});
        this.fieldSelectorOptions = [... this.fieldSelectorOptions,{value: fieldName, label: this.filters.get(fieldName)?.label}];
        if (this.isDebug) console.log("clearFilters: readded to the selection list",JSON.stringify(this.fieldSelectorOptions));
        this.sortFieldSelection();
        if (this.isDebug) console.log("removeFilter: field selection list sorted",JSON.stringify(this.fieldSelectorOptions));

        //this.computeFilterDisplay();
        //this.applyFiltersIfAuto(100);
        if (!this.useButtonFilter) {
            if (this.isDebug) console.log("removeFilter: applying filters automatically");
            this.applyFilters();
        }
        if (this.isDebug) console.log("removeFilter: END");
    }
    

    //-------------------------------------------------------------------------------
    // UTILITIES
    //-------------------------------------------------------------------------------
    
    /*
    * Utility method to init the different filters out of sfpegList display configuration
    */
    initFilters() {
        if (this.isDebug) console.log("initFilters: START with columns", JSON.stringify(this.columns));

        if (this.filterInitDone) {
            console.warn("initFilters: END KO / Filter init already done");
            return;
        }
        else if (!this.columns || !(this.columns.length >1)) {
            console.warn("initFilters: END KO / No columns provided");
            return;
        }

        if (this.isDebug) console.log("initFilters: initializing filters");
        this.filters = new Map();
        this.fieldSelectorOptions = [];
        this.columns.forEach(iterField => {
            if (this.isDebug) console.log("initFilters: processing field",iterField.fieldName);
            if (this.isDebug) console.log("initFilters: with meta",JSON.stringify(iterField));

            if (!iterField.fieldName) {
                if (this.isDebug) console.log("initFilters: ignoring field");
                return;
            }

            const iterFieldType = iterField.type ?? 'text';
            if (this.isDebug) console.log("initFilters: field type fetched",iterFieldType);

            const iterFieldDisplay = FILTER_TYPE_MAP[iterFieldType];
            if (this.isDebug) console.log("initFilters: field display type mapped",iterFieldDisplay);

            if (!iterFieldDisplay) {
                if (this.isDebug) console.log("initFilters: ignoring field");
                return;
            }

            const iterFilter = {
                name: iterField?.fieldName,
                label: iterField?.label,
                type: iterFieldType,
                display: iterFieldDisplay,
                isDate: iterFieldDisplay === 'date',
                isNumber: iterFieldDisplay === 'number',
                isCombobox: iterFieldDisplay === 'combobox',
                isBoolean: iterFieldDisplay === 'boolean',
                isText: iterFieldDisplay === 'text'
            }
            if (this.isDebug) console.log("initFilters: filter init");

            if (iterFilter.isBoolean) {
                if (this.isDebug) console.log("initFilters: registering standard boolean options");
                iterFilter.options = [{value: '', label: '---'}, {value: 'true', label: this.booleanTrueLabel}, {value: 'false', label: this.booleanFalseLabel}];
            }
            else if (iterFilter.isCombobox) {
                if (this.isDebug) console.log("initFilters: init combobox options");
                iterFilter.options = [];
                iterFilter.optionsMap = new Map();
            }
            else if (iterFilter.isNumber) {
                if (this.isDebug) console.log("initFilters: init number formatter");
                iterFilter.formatter = iterFieldType;
            }
            this.filters.set(iterField.fieldName,iterFilter);
            this.fieldSelectorOptions.push({value: iterField.fieldName, label: iterField.label});
            if (this.isDebug) console.log("initFilters: filter registered",JSON.stringify(iterFilter));
        });
        if (this.isDebug) console.log("initFilters: all fields registered ",JSON.stringify(this.filters));
        this.fieldSelectorOptions = this.fieldSelectorOptions;
        if (this.isDebug) console.log("initFilters: field selection init ",JSON.stringify(this.fieldSelectorOptions));
        this.sortFieldSelection();
        if (this.isDebug) console.log("initFilters: field selection sorted ",JSON.stringify(this.fieldSelectorOptions));
        
        this.activeFilters = [];
        this.activeComboboxFilters = new Map();
        this.filterInitDone = true;
        if (this.isDebug) console.log("initFilters: END");
    }

    /*
    * Utility method to init / update active combobox filter options
    */
    resetFilterOptions() {
        if (this.isDebug) {
            console.log("resetFilterOptions: START with active combobox filters", JSON.stringify(Array.from(this.activeComboboxFilters.values())));
            console.log("resetFilterOptions: and #records", this.records?.length);
        }

        if (!(this.records?.length > 0)) {
            console.warn("resetFilterOptions: END KO / No record provided");
            return;
        }
        else if (!(this.activeComboboxFilters.size > 0)) {
            if (this.isDebug) console.log("resetFilterOptions: END / No active combobox filter set");
            return;
        }

        let hasOptionChange = false;
        if (this.isDebug) console.log("resetFilterOptions: records available", JSON.stringify(this.records));

        this.records.forEach(iterRecord => {
            if (this.isDebug) console.log("resetFilterOptions: processing record",JSON.stringify(iterRecord));

            this.activeComboboxFilters.forEach((iterFilterValue, iterFilterKey) => {
                if (this.isDebug) console.log("resetFilterOptions: processing field",iterFilterKey);
                
                let iterFieldValue = String(iterRecord[iterFilterKey] || '').trim();
                if (!iterFieldValue) {
                    if (this.isDebug) console.log("resetFilterOptions: no value for field");
                    return;
                }
                if (this.isDebug) console.log("resetFilterOptions: with value",iterFieldValue);

                let iterFieldValueList = (iterFilterValue.type = 'multi-value') ? iterFieldValue.split(';') : [iterRecordValue];
                if (this.isDebug) console.log("resetFilterOptions: analyzing record field values",JSON.stringify(iterFieldValueList));

                iterFieldValueList.forEach(iterValuePart => {
                    if (iterFilterValue.optionsMap.has(iterValuePart)) {
                        if (this.isDebug) console.log("initFilters: value already registered",iterValuePart);
                    }
                    else {
                        iterFilterValue.optionsMap.set(iterValuePart, {value: iterValuePart, label: iterValuePart});
                        hasOptionChange = true;
                        if (this.isDebug) console.log("initFilters: new value registered",iterValuePart);
                    }
                });
            });
        });
        if (this.isDebug) console.log("resetFilterOptions: all records processed");

        if (hasOptionChange) {
            if (this.isDebug) console.log("resetFilterOptions: resetting active filter options");
            this.activeComboboxFilters.forEach((iterFilterValue, iterFilterKey) => {
                if (this.isDebug) console.log("resetFilterOptions: resetting field",iterFilterKey);
                iterFilterValue.options = Array.from(iterFilterValue.optionsMap.values());
            });
        }

        this.activeFilters = [...this.activeFilters];
        if (this.isDebug) console.log("resetFilterOptions: reworked active filters", JSON.stringify(this.activeFilters));
        if (this.isDebug) console.log("resetFilterOptions: END with reworked active combobox filters", JSON.stringify(Array.from(this.activeComboboxFilters.values())));
    }

    /*
    * Utility method to updates a filter's property
    */
    updateFilter(filterDesc, filterKey, filterValue) {
        if (this.isDebug) {
            console.log("updateFilter: START with filter fieldName", filterDesc?.name);
            console.log("updateFilter: and filterKey", filterKey);
            console.log("updateFilter: and filterValue", JSON.stringify(filterValue));
        }

        filterDesc[filterKey] = filterValue;
        if (this.isDebug) console.log("updateFilter: filterDesc updated",JSON.stringify(filterDesc));

        if (!this.useButtonFilter) {
            if (this.isDebug) console.log("updateFilter: applying filters automatically");
            this.applyFilters();
        }

        /*if (filterIndex >= 0) {
            if (this.isDebug) console.log("updateFilter: applying filters to", JSON.stringify(this.activeFilters[filterIndex]));
            this.activeFilters[filterIndex][property] = value;
            //this.activeFilters = [...this.activeFilters];
        }*/
        if (this.isDebug) console.log("updateFilter: END");
    }

    /*
    * Utility method to extract keywords out of a text value
    */
    extractKeywords(filterValue) {
        if (this.isDebug) console.log("extractKeywords: START with", filterValue);
        const trimmedValue = (String(filterValue) || '').trim();
        if (!trimmedValue) {
            if (this.isDebug) console.log("extractKeywords: END with empty keyword list");
            return [];
        }
        const keywordList = trimmedValue.toLowerCase().split(/\s+/).filter(k => k);
        if (this.isDebug) console.log("extractKeywords: END with keyword list",JSON.stringify(keywordList));
        return keywordList;
    }

    /*
    * Utility method to dispatch a filterchange event to the parent component with the provided filter data
    */
    dispatchFilterChange(filterData) {
        if (this.isDebug) console.log("dispatchFilterChange: START with", JSON.stringify(filterData));
        this.dispatchEvent(new CustomEvent('filterchange', {
            detail: filterData,
            bubbles: true,
            composed: true
        }));
        if (this.isDebug) console.log("dispatchFilterChange: END");
    }

    /*
    * Utility method to sort all fieldSelector Options in alphabetical label order
    */
    sortFieldSelection() {
        if (this.isDebug) console.log("sortFieldSelection: START");
        this.fieldSelectorOptions = this.fieldSelectorOptions.sort((a,b) => (a.label < b.label ? -1 : 1));
        if (this.isDebug) console.log("sortFieldSelection: END");
    }


    /**
     * Main method that prepares and dispatches filter data to parent component
     * Parent component handles the actual filtering logic
     */
    applyFilters() {
        if (this.isDebug) console.log("applyFilters: START");
        this.isProcessing = true;

        // Hack to force the display of spinner
        setTimeout(() => {
            if (this.isDebug) console.log("applyFilters: processing resumed");
       
            const filteringContext = {};
            this.activeFilters.forEach(iterFilter => {
                if (this.isDebug) console.log("applyFilters: processing filter", iterFilter.name);
            
                if (iterFilter.isDate || iterFilter.isNumber) {
                    if (iterFilter.startValue || iterFilter.endValue) {
                        if (this.isDebug) console.log("applyFilters: registering range filter");
                        filteringContext[iterFilter.name] = { mode: iterFilter.display, start: iterFilter.startValue, end: iterFilter.endValue };
                        if (this.isDebug) console.log("applyFilters: range filter registered",JSON.stringify(filteringContext[iterFilter.name]));
                    }
                    else {
                        if (this.isDebug) console.log("applyFilters: no value for range filter");
                    }
                }
                else if ((iterFilter.filterValue != null)) {
                    filteringContext[iterFilter.name] = iterFilter.filterValue;
                    if (this.isDebug) console.log("applyFilters: filter value registered",JSON.stringify(filteringContext[iterFilter.name]));
                }
                else {
                    if (this.isDebug) console.log("applyFilters: no value for standard filter");
                }
            });
            if (this.isDebug) console.log("applyFilters: active filters processed");

            const keywords = this.extractKeywords(this.generalSearchValue);
            if (keywords.length > 0) {
                filteringContext.generalSearch = keywords;
                if (this.isDebug) console.log("applyFilters: global search registered", JSON.stringify(filteringContext.generalSearch));
            }
            if (this.isDebug) console.log("applyFilters: filtering context finalized", JSON.stringify(filteringContext));

            this.dispatchFilterChange(filteringContext);
            this.isProcessing = false;
            if (this.isDebug) console.log("applyFilters: END");
        }, 10);

        if (this.isDebug) console.log("applyFilters: timer started");
    }
}