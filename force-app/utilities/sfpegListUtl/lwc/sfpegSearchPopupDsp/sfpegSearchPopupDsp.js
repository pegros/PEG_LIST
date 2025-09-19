/***
* @author P-E GROS
* @date   June 2024
* @description  Example LWC Component to display a query form with a result list in a popup.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2024 pegros
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

import { api } from 'lwc';
import LightningModal from 'lightning/modal';

import APPLY_BUTTON     from '@salesforce/label/c.sfpegSearchListApply';
import RESULTS_TITLE    from '@salesforce/label/c.sfpegSearchListResults';


export default class SfpegSearchPopupDsp extends LightningModal {
    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api searchForm;
    @api resultsConfig;
    @api popupLabel = 'Searchable List';
    @api closeLabel = 'Close';
    @api searchLabel = 'Search';
    @api fieldsize = 6;
    @api isDebug;
    @api isDebugFine;

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    applyButton = APPLY_BUTTON;
    resultsTitleDefault = RESULTS_TITLE;
    
    //-----------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    queryContext;   //queryContext

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------
    get resultsTitle() {
        return (this.resultsConfig?.cardTitle || this.resultsTitleDefault);
    }
    get showResults() {
        return  this.resultsConfig && (this.searchForm ? this.queryContext : true);
    }
    get searchFormFields() {
        return JSON.stringify(this.searchForm?.fields);
    }

    //----------------------------------------------------------------
    // Initialization
    //----------------------------------------------------------------
    connectedCallback(event){
        if (this.isDebug) {
            console.log('connected: START SearchPopup ',this.popupLabel);
            console.log('connected: searchForm ',JSON.stringify(this.searchForm));
            console.log('connected: resultsConfig ',JSON.stringify(this.resultsConfig));
            console.log('connected: END SearchPopup');
        }
    }
    renderedCallback(event){
        if (this.isDebug) {
            console.log('rendered: START SearchPopup');
            console.log('rendered: searchForm ',JSON.stringify(this.searchForm));
            console.log('rendered: resultsConfig ',JSON.stringify(this.resultsConfig));
            console.log('rendered: END SearchPopup');
        }
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------
    handleClick(event){
        if (this.isDebug) console.log('handleClick: START SearchPopup');

        let inputFields = this.template.querySelectorAll('lightning-input-field');
        if (this.isDebug) console.log('handleClick: inputFields fetched ', JSON.stringify(inputFields));
        
        if (this.isDebug) console.log('handleClick: END with new contextString ', this.contextString);
    }

    handleSubmit(event) {
        if (this.isDebug) console.log('handleSubmit: START SearchPopup',event);
        event.preventDefault();
        if (this.isDebug) console.log('handleSubmit: details',JSON.stringify(event.detail));
        if (event.detail?.fields) {
            this.queryContext = event.detail.fields;
            if (this.isDebug) console.log('handleSubmit: queryContext updated',JSON.stringify(this.queryContext));
        }
        if (this.isDebug) console.log('handleSubmit: END SearchPopup');
    }

    handleClose(event){
        if (this.isDebug) console.log('handleClose: START SearchPopup with event ',event);
        this.close('Closed');
        if (this.isDebug) console.log('handleClose: END SearchPopup / component closed');
    }

}