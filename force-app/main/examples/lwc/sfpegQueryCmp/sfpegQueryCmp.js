/***
* @author P-E GROS
* @date   Oct 2022
* @description  Example LWC Component to display a query form with a result list.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2022 pegros
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

import { LightningElement,api,track } from 'lwc';

export default class SfpegQueryCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api cardTitle;
    @api cardIcon;
    @api cardClass;

    @api configName;
    @api formRecordString;
    @api searchFieldsString;

    @api formFieldSize = 6;

    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.

    // Context Data
    @api objectApiName;         // Object API Name for current page record (if any)
    @api recordId;              // ID of current page record (if any)

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    @track contextString;
    @track formRecord = {objectApiName:"Account"};
    @track searchFields = [{name:"Name"},{name:"AccountSource"},{name:"PersonBirthdate"}];

    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback(){
        if (this.isDebug) console.log('connected: START');

    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------
    handleLoad(event){
        if (this.isDebug) console.log('handleLoad: START');
    }
    handleSubmit(event){
        if (this.isDebug) console.log('handleSubmit: START');
    }
    handleError(event){
        if (this.isDebug) console.log('handleError: START');
    }
    handleSave(event){
        if (this.isDebug) console.log('handleSave: START');
    }
    handleSearch(event){
        if (this.isDebug) console.log('handleSearch: START');

        let inputFields = this.template.querySelectorAll('lightning-input-field');
        if (this.isDebug) console.log('handleSearch: inputFields fetched ', JSON.stringify(inputFields));

        let whereClauses = [];
        let isOK = true;
        inputFields.forEach(fieldIter => {
            if (this.isDebug) console.log('handleSearch: processing fieldName ', fieldIter.fieldName);
            if (this.isDebug) console.log('handleSearch: with value  ', fieldIter.value);

            if ((fieldIter.value == null) || (fieldIter.value === '')) {
                if (this.isDebug) console.log('handleSearch: null/empty value --> required?  ', fieldIter.required);
                if (fieldIter.required) {
                    // handle value removal of required input field & boolean inputs
                    // Boolean fields appear always as required !
                    console.warn('checkRequiredFieldsFilled: missing required field  ', fieldIter.fieldName);
                    isOK = false;
                    whereClauses = null;
                    fieldIter.setErrors({'errors':[{'message':'Field is required!'}]});
                }
                else {
                    if (this.isDebug) console.log('handleSearch: ignoring null/empty clause');
                }
            }
            else if (isOK) {
                if (this.isDebug) console.log('handleSearch: adding new clause');
                whereClauses.push(' ( ' + fieldIter.fieldName + ' = \'' + fieldIter.value +  '\' ) ');
            }
            else {
                if (this.isDebug) console.log('handleSearch: new clause ignored because of missing required field');
            }
        });

        if (this.isDebug) console.log('handleSearch: whereClauses init ',whereClauses);
        if ((whereClauses) && (whereClauses.length > 0)) {
            if (this.isDebug) console.log('handleSearch: registering whereClause');
            this.contextString = whereClauses.join(' OR ');

            let listCmp = this.template.querySelector('c-sfpeg-list-cmp');
            if (this.isDebug) console.log('handleSearch: listCmp fetched ', JSON.stringify(listCmp));
            if (listCmp) {
                if (this.isDebug) console.log('handleSearch: requesting list refresh');
                listCmp.doRefresh();
            }
            else {
                if (this.isDebug) console.log('handleSearch: list not already instantiated');
            }
        }
        else {
            if (this.isDebug) console.log('handleSearch: removing whereClause');
            this.contextString = null;
        }
        if (this.isDebug) console.log('handleSearch: END with new contextString ', this.contextString);
    }
}