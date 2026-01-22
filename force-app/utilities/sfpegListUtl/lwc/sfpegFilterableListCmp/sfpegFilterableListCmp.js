/***
* @author P-E GROS
* @date   Dec 2025
* @description  Example LWC Component to display a complex filter form with a result list.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2025 pegros
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

import APPLY_BUTTON     from '@salesforce/label/c.sfpegFilterableListApply';
import RESULTS_TITLE    from '@salesforce/label/c.sfpegFilterableListResults';
import FILTER_TITLE     from '@salesforce/label/c.sfpegFilterableListFilters';

export default class SfpegFilterListCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api cardClass;
    @api cardTitle;
    @api cardIcon;

    @api configName;
    @api actionConfigName;
    @api footerConfigName;

    @api contextString;

    @api showExport = false;    // Flag to show Export action in header.
    @api displayHeight = 0;     // Max-height of the content Div (0 meaning no limit)
    @api maxSize = 100;         // Header Action list overflow limit
    @api buttonSize = 'small';  // Size of the standard header buttons (to align with custom header actions)

    @api isDebug;
    @api isDebugFine;
    
    // Context Data
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    filterTitle = FILTER_TITLE;
    applyButton = APPLY_BUTTON;
    resultsTitle = RESULTS_TITLE;

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    isFormReady = false;
    displayList = false;
    resultList
    configDetails;
    filterForm;

    isFilterExpanded = false;
    
    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------

    get hideList() {
        return  !this.displayList;
    }
    get applyDisabled() {
        return  !this.isFormReady;
    }
    get showResults() {
        return  this.resultsConfig && (this.filterForm ? this.queryContext : true);
    }
    get filterFormFields() {
        return JSON.stringify(this.filterForm?.fields);
    }
    get configUrl() {
        return (this.configDetails?.id ? '/lightning/setup/CustomMetadata/page?address=%2F' + this.configDetails?.id : '#');
    }
    
    //----------------------------------------------------------------
    // Initialization
    //----------------------------------------------------------------
    connectedCallback(event){
        if (this.isDebug) {
            console.log('connected: START FilterableList ',this.popupLabel);
            console.log('connected: filterForm ',JSON.stringify(this.filterForm));
            console.log('connected: resultsConfig ',JSON.stringify(this.resultsConfig));
            console.log('connected: END FilterableList');
        }
    }

    renderedCallback(event){
        if (this.isDebug) {
            console.log('rendered: START FilterableList');
            console.log('rendered: filterForm ',JSON.stringify(this.filterForm));
            console.log('rendered: resultsConfig ',JSON.stringify(this.resultsConfig));
            console.log('rendered: END FilterableList');
        }
    }
    
    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------

    // sfpegList initialization handling
    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START FilterableList',event);
        if (this.isDebug) console.log('handleRecordLoad: #results received ',event.detail?.length);
        if (this.isDebugFine) console.log('handleRecordLoad: results received',JSON.stringify(event.detail));
        if (!this.configDetails) {
            if (this.isDebug) console.log('handleRecordLoad: initializing filterForm');
            this.initFilterForm();
        }
        
        this.resultList = [...event.detail];
        if (this.isDebug) console.log('handleRecordLoad: #results init ',this.resultList?.length);

        if (this.isDebug) console.log('handleRecordLoad: END FilterableList');
    }

    // search form initialization handling
    handleFormLoad(event) {
        if (this.isDebug) console.log('handleFormLoad: START FilterableList',event);
        this.isFormReady = true;
        if (this.isDebug) console.log('handleFormLoad: END FilterableList');
    }

    // search form submit handling
    handleApply(event) {
        if (this.isDebug) console.log('handleApply: START FilterableList',event);
        event.preventDefault();
        this.displayList = true;
        if (this.isDebug) console.log('handleApply: details',JSON.stringify(event.detail));

        // reuse of standard filterString and filterScope properties of sfpegListCmp with different content
        // filterString must be true or non null to filter the list and false or null to reset the list
        this.refs.listLoader.doFilter((Object.keys(event.detail || {}).length > 0), event.detail);
        
        if (this.isDebug) console.log('handleApply: END FilterableList');
    }

    // filter records override for sfpegListCmp
    multipleFilterRecords = function() {
        if (this.isDebug) console.log('multipleFilterRecords: START');
        if (this.isDebug) console.log('multipleFilterRecords: current filterString',this.filterString);
        if (this.isDebug) console.log('multipleFilterRecords: current filterScope',JSON.stringify(this.filterScope));
        this.isFiltering = true;

        if (this.isDebug) console.log('multipleFilterRecords: END returning promise');
        return new Promise((resolve,reject) => {
            if (this.isDebug) console.log('multipleFilterRecords: executing promise');
            // trick to force reevaluation of isFiltering 
            setTimeout(() => {
                if (this.isDebug) console.log('multipleFilterRecords: resuming after timeout');
                if (this.isDebug) console.log('multipleFilterRecords: current filterString',this.filterString);
                if (this.isDebug) console.log('multipleFilterRecords: current filterScope',JSON.stringify(this.filterScope));

                if (!this.resultListOrig) {
                    if (this.isDebug) console.log('multipleFilterRecords: registering original record data list from ',JSON.stringify(this.resultList));
                    this.resultListOrig = this.resultList;
                }

                if (this.isDebug) console.log('multipleFilterRecords: original record data list',JSON.stringify(this.resultListOrig));

                if (this.filterString) {
                    if (this.isDebug) console.log('multipleFilterRecords: filtering record list with #items', this.resultListOrig.length);
                    this.isFiltered = true;

                    const rawFilters = this.filterScope;
                    this.multipleFilterValues = {};

                    // Extract filter criteria
                    const generalSearchKeywords = this.filterScope.generalSearch;
                    const columnFilterKeys = [...(Object.keys(this.filterScope))].filter(key => key !== 'generalSearch');
                    const hasColumnFilters = columnFilterKeys.length > 0;
                    const hasGeneralSearch = generalSearchKeywords && generalSearchKeywords.length > 0;
                    if (this.isDebug) console.log('multipleFilterRecords: applying filters', JSON.stringify(this.filterScope));

                    // Apply filters - all logic inline
                    const filteredList = this.resultListOrig.filter(record => {
                        //if (this.isDebugFine) console.log('multipleFilterRecords: processing record',JSON.stringify(record));
                        // Check column-specific filters
                        if (hasColumnFilters) {
                            //if (this.isDebugFine) console.log('multipleFilterRecords: applying column filters');

                            for (const fieldName of columnFilterKeys) {
                                //if (this.isDebugFine) console.log('multipleFilterRecords: processing filter',fieldName);
                                const filterValue = this.filterScope[fieldName];
                                if (filterValue == null) continue;
                                //if (this.isDebugFine) console.log('multipleFilterRecords: of type',typeof filterValue);

                                const fieldValue = record[fieldName];
                                //if (this.isDebugFine) console.log('multipleFilterRecords: fieldValue',fieldValue);

                                // Date range filter
                                if (typeof filterValue === 'object' && filterValue.mode === 'date') {
                                    //if (this.isDebugFine) console.log('multipleFilterRecords: date comparison');
                                    let recordDateStr = (String(fieldValue) || '').trim();
                                    if (recordDateStr.includes('T')) recordDateStr = recordDateStr.split('T')[0];
                                    if (!recordDateStr) return false;
                                    if (filterValue.start && recordDateStr < filterValue.start.trim()) return false;
                                    if (filterValue.end && recordDateStr > filterValue.end.trim()) return false;
                                }
                                // Number range filter
                                else if (typeof filterValue === 'object' && filterValue.mode === 'number') {
                                    //if (this.isDebugFine) console.log('multipleFilterRecords: number comparison');
                                    let recordValue = (typeof fieldValue == 'number' ? fieldValue : Number(fieldValue));
                                    if (recordValue == null) return false;
                                    if (filterValue.start && recordValue < filterValue.start) return false;
                                    if (filterValue.end && recordValue > filterValue.end) return false;
                                }
                                // Boolean filter
                                else if (typeof filterValue === 'boolean') {
                                    //if (this.isDebugFine) console.log('multipleFilterRecords: boolean comparison');
                                    return (filterValue == fieldValue);
                                }
                                // Date specific filter
                                /*else if (typeof filterValue === 'object' && filterValue.mode === 'specific') {
                                    let recordDateStr = (String(fieldValue) || '').trim();
                                    if (recordDateStr.includes('T')) recordDateStr = recordDateStr.split('T')[0];
                                    let filterDateStr = (String(filterValue.value) || '').trim();
                                    if (filterDateStr.includes('T')) filterDateStr = filterDateStr.split('T')[0];
                                    if (recordDateStr !== filterDateStr) return false;
                                }*/
                                // Multi-select filter (OR logic) - values already normalized to lowercase by child
                                else if (Array.isArray(filterValue)) {
                                    //if (this.isDebugFine) console.log('multipleFilterRecords: multi-keyword comparison');
                                    const fieldValueStr = (String(fieldValue) || '').toLowerCase();
                                    const matches = filterValue.some(selectedValue => {
                                        const selectedValueLower = String(selectedValue || '').toLowerCase();
                                        return fieldValueStr === selectedValueLower || fieldValueStr.includes(selectedValueLower);
                                    });
                                    if (!matches) return false;
                                }
                                // String filter - value already normalized to lowercase by child
                                else {
                                    //if (this.isDebugFine) console.log('multipleFilterRecords: single keyword with comparison');
                                    const fieldValueLower = (String(fieldValue) || '').toLowerCase();
                                    const filterValueLower = (String(filterValue) || '').toLowerCase();
                                    if (!fieldValueLower.includes(filterValueLower)) return false;
                                }
                            }   
                        }
                
                        // Check general search if present (OR logic - any keyword match)
                        if (hasGeneralSearch) {
                            let searchableText = '';
                            for (const value of Object.values(record)) {
                                if (value != null) searchableText += String(value).toLowerCase() + ' ';
                            }
                            const hasMatch = generalSearchKeywords.some(keyword => searchableText.includes(keyword));
                            if (!hasMatch) return false;
                        }
                        return true;
                    });
                    this.resultList = filteredList;
                    //if (this.isDebug) console.log('filterRecords: filtered list set ', JSON.stringify(this.resultList));
                    if (this.isDebug) console.log('filterRecords: filtered list with #items', this.resultList.length);
                    
                    if (this.hideCheckbox) this.selectedRecords = this.resultList;
                    if (this.isDebug) console.log('filterRecords: selectedRecords update ', JSON.stringify(this.selectedRecords));
                }
                else {
                    if (this.isDebug) console.log('multipleFilterRecords: resetting original record list');
                    this.isFiltered = false;
                    this.resultList = this.resultListOrig;
                    if (this.hideCheckbox) this.selectedRecords = this.resultList;
                    if (this.isDebug) console.log('multipleFilterRecords: original list with #items', this.resultList.length);
                }

                this.isFiltering = false;
                if (this.isDebug) console.log('multipleFilterRecords: END');
                resolve();
            }, 0);
            if (this.isDebug) console.log('multipleFilterRecords: timeOut set');
        });  
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    initFilterForm = () => {
        if (this.isDebug) console.log('initFilterForm: START');
    
        let listCmp = this.refs.listLoader;
        if (this.isDebug) console.log('initFilterForm: fetching listCmp ',listCmp);
        this.configDetails =  listCmp.configuration;

        this.filterForm = [...this.configDetails?.display?.columns, ...(this.configDetails?.display?.details ?? [])];
        if (this.isDebug) console.log('initFilterForm: filterForm extracted ',JSON.stringify(this.filterForm));

        if (this.isDebug) console.log('initFilterForm: END / filterForm init ',JSON.stringify(this.filterForm));
    }
}