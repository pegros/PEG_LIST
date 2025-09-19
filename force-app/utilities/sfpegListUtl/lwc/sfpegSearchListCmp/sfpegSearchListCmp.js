/***
* @author P-E GROS
* @date   Jan 2025
* @description  Example LWC Component to display a query form with a result list.
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

import APPLY_BUTTON     from '@salesforce/label/c.sfpegSearchListApply';
import RESULTS_TITLE    from '@salesforce/label/c.sfpegSearchListResults';

export default class SfpegSearchListCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api cardClass;
    @api cardTitle;
    @api cardIcon;

    @api configName;
    @api actionConfigName;
    @api footerConfigName;

    @api showSearch = false;    // Flag to show Filter action in header.
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
    applyButton = APPLY_BUTTON;
    resultsTitle = RESULTS_TITLE;

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    isFormReady = false;
    displayList = false;
    configDetails;
    searchForm;
    queryContext;   //queryContext

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
        return  this.resultsConfig && (this.searchForm ? this.queryContext : true);
    }
    get searchFormFields() {
        return JSON.stringify(this.searchForm?.fields);
    }
    get configUrl() {
        return (this.configDetails?.id ? '/lightning/setup/CustomMetadata/page?address=%2F' + this.configDetails?.id : '#');
    }
    
    //----------------------------------------------------------------
    // Initialization
    //----------------------------------------------------------------
    connectedCallback(event){
        if (this.isDebug) {
            console.log('connected: START SearchList ',this.popupLabel);
            console.log('connected: searchForm ',JSON.stringify(this.searchForm));
            console.log('connected: resultsConfig ',JSON.stringify(this.resultsConfig));
            console.log('connected: END SearchList');
        }
    }

    renderedCallback(event){
        if (this.isDebug) {
            console.log('rendered: START SearchList');
            console.log('rendered: searchForm ',JSON.stringify(this.searchForm));
            console.log('rendered: resultsConfig ',JSON.stringify(this.resultsConfig));
            console.log('rendered: END SearchList');
        }
    }
    
    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------

    // sfpegList initialization handling
    handleRecordLoad(event) {
        if (this.isDebug) console.log('handleRecordLoad: START SearchList',event);
        if (!this.configDetails) {
            if (this.isDebug) console.log('handleRecordLoad: initializing searchForm');
            this.initSearchForm();
        }
        if (this.isDebug) console.log('handleRecordLoad: END SearchList');
    }

    // search form initialization handling
    handleFormLoad(event) {
        if (this.isDebug) console.log('handleFormLoad: START SearchList',event);
        this.isFormReady = true;
        if (this.isDebug) console.log('handleFormLoad: END SearchList');
    }

    // search form submit handling
    handleApply(event) {
        if (this.isDebug) console.log('handleApply: START SearchList',event);
        event.preventDefault();
        this.displayList = true;
        if (this.isDebug) console.log('handleApply: details',JSON.stringify(event.detail));
        if (event.detail?.fields) {
            this.queryContext = event.detail.fields;
            if (this.isDebug) console.log('handleApply: queryContext updated',JSON.stringify(this.queryContext));
        }
        if (this.isDebug) console.log('handleApply: END SearchList');
    }

    //-----------------------------------------------------
    // Utilities
    //-----------------------------------------------------

    initSearchForm = () => {
        if (this.isDebug) console.log('initSearchForm: START');
    
        let listCmp = this.refs.listLoader;
        if (this.isDebug) console.log('initSearchForm: fetching listCmp ',listCmp);
        this.configDetails =  listCmp.configuration;

        this.searchForm = this.configDetails?.display?.searchForm;
        if (this.searchForm?.fields) {
            this.searchForm.size = this.searchForm.size || 12;
            ((this.searchForm).fields).forEach( iterField => {
                iterField.size = ((iterField.size) || (this.searchForm.size));
            });
            if (this.isDebug) console.log('initSearchForm: field sizes init');
        }
        
        if (this.isDebug) console.log('initSearchForm: END / searchForm init ',JSON.stringify(this.searchForm));
    }
}