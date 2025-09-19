/***
* @author P-E GROS
* @date   Sept. 2024
* @description  LWC Modal Popup Component to to support record data display
*               sfpegAction operation.
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

import { api, wire } from 'lwc';
import LightningModal from 'lightning/modal';
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { getLayout } from "lightning/uiLayoutApi";

import CLOSE_LABEL from '@salesforce/label/c.sfpegPopupCloseLabel';
import CLOSE_TITLE from '@salesforce/label/c.sfpegPopupCloseTitle';

export default class SfpegRecordPopupDsp extends LightningModal {
    
    //###########################################################
    // Component Properties
    //###########################################################

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api modalHeader;       // Modal header title
    @api modalMessage;      // Message displayed above the flow
    @api modalHelp;         // Help message displayed above the flow
    @api modalClass;        // CSS for the body container div

    @api columns = 2;
    @api density = 'auto';
    @api recordId;
    @api objectApiName;    
    @api recordTypeId;
    @api recordData;

    @api isDebug = false;   // Flag to activate debug information

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------

    objectName;     // for RT details load for create mode
    recordTypes;    // RTs available to choose from for create mode

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    closeLabel =    CLOSE_LABEL;
    closeTitle =    CLOSE_TITLE;


    //###########################################################
    // Custom Getters
    //###########################################################
    
    get showRtSelect() {
        console.log('showRtSelect: ', ((!this.recordTypeId) && (!this.recordTypeId)));
        return ((!this.recordId) && (!this.recordTypeId));
    }

    //###########################################################
    // Initialization
    //###########################################################

    connectedCallback(){
        if (this.isDebug) {
            console.log('connected: START RecordPopup');
            console.log('connected: modalHeader provided ',this.modalHeader);
            console.log('connected: modalMessage provided ',this.modalMessage);
            console.log('connected: modalHelp provided ',this.modalHelp);
            console.log('connected: label provided ',this.label);
            console.log('connected: description provided ',this.description);
            console.log('connected: size provided ',this.size);

            console.log('connected: columns provided ',this.columns);
            console.log('connected: density provided ',this.density);

            console.log('connected: recordId provided ',this.recordId);
            console.log('connected: objectApiName provided ',this.objectApiName);
            console.log('connected: recordTypeId provided ',this.recordTypeId);          
            console.log('connected: recordData provided ',JSON.stringify(this.recordData));          
        }

        if (!this.recordTypeId) {
            if (this.isDebug) console.log('connected: handling creation mode');          
            if (!this.recordTypeId) {
                if (this.isDebug) console.log('connected: requesting RT list fetch');          
                this.objectName = this.objectApiName;
            }
            else {
                if (this.isDebug) console.log('connected: requesting Layout directly');
            }
        }
        if (this.isDebug) console.log('connected: END RecordPopup');
    }

    renderedCallback() {
        if (this.isDebug) console.log('rendered: START RecordPopup');
        let inputFields = this.template.querySelector('lightning-input-field');
        if (this.isDebug) console.log('rendered: inputFields fetched ',inputFields);
        if (this.isDebug) console.log('rendered: END RecordPopup');
    }

    //------------------------------------------------
    // Additional info load
    //------------------------------------------------

    @wire(getObjectInfo, { objectApiName: '$objectName' })
    wiredObject({ error, data }) {
        if (this.isDebug) console.log('wiredObject: START with object ', this.objectName);
        if (this.isDebug) console.log('wiredObject: data received ',JSON.stringify(data));
        if (this.isDebug) console.log('wiredObject: RT data received ',JSON.stringify(data?.recordTypeInfos));
        if (this.isDebug) console.log('wiredObject: error received ',JSON.stringify(error));

        if (data?.recordTypeInfos) {
            if (this.isDebug) console.log('wiredObject: analysing RTs');
            let recordTypes = [];
            for (let key in data.recordTypeInfos) {
                if (this.isDebug) console.log('wiredObject: analysing key',key);
                let keyValue = (data.recordTypeInfos)[key];
                if (keyValue.available) {            
                    recordTypes.push({label: keyValue.name, value: keyValue.recordTypeId});
                }
            }
            if (this.isDebug) console.log('wiredObject: recordTypes init', JSON.stringify(recordTypes));
            if (recordTypes.length == 1) {
                if (this.isDebug) console.log('wiredObject: selecting single RT available');
                this.recordTypeId = recordTypes[0].value;
            }
            else {
                if (this.isDebug) console.log('wiredObject: presenting RT list selection option');
                this.recordTypes = recordTypes;
            }
        }
        if (this.isDebug) console.log('wiredObject: END with object ', this.objectApiName);
    }

    @wire(getLayout, { objectApiName: "$objectApiName", layoutType: 'Full', mode: 'Create', recordTypeId: "$recordTypeId" })
    wiredLayout({ error, data }) {
        if (this.isDebug) console.log('wiredLayout: START with object ', this.objectName);
        if (this.isDebug) console.log('wiredLayout: data received ',JSON.stringify(data));
        if (this.isDebug) console.log('wiredLayout: error received ',JSON.stringify(error));
        if (this.isDebug) console.log('wiredLayout: END with object ', this.objectApiName);
    }


    //###########################################################
    // Event Handlers
    //###########################################################

    handleRtSelect(event) {
        if (this.isDebug) console.log('handleRtSelect: START RecordPopup',event);
        if (this.isDebug) console.log('handleRtSelect: Selected value',this.refs.recordTypes.value);
        this.recordTypeId = this.refs.recordTypes.value;
        if (this.isDebug) console.log('handleRtSelect: END RecordPopup');
    }

    handleClose(event){
        if (this.isDebug) console.log('handleClose: START RecordPopup',event);
        this.close({doNext: false});
        if (this.isDebug) console.log('handleClose: END RecordPopup / Closing popup');
    }

    handleCancel(event) {
        if (this.isDebug) console.log('handleCancel: START RecordPopup',event);
        this.close({doNext: false});
        if (this.isDebug) console.log('handleCancel: END RecordPopup / Closing popup');
    }

    handleLoad(event) {
        if (this.isDebug) console.log('handleLoad: START RecordPopup',event);
        let inputFields = this.template.querySelector('lightning-input-field');
        if (this.isDebug) console.log('handleLoad: inputFields fetched ',inputFields);
        if (this.isDebug) console.log('handleLoad: recordForm fetched ',this.refs?.recordForm);
        
        //if (this.isDebug) console.log('handleLoad: event details ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleLoad: recordTypes ',JSON.stringify(((event.detail.objectInfos)[this.objectApiName])?.recordTypeInfos));
        if (this.isDebug) console.log('handleLoad: END RecordPopup');
    }
    handleSubmit(event) {
        if (this.isDebug) console.log('handleSubmit: START RecordPopup',event);
        if (this.isDebug) console.log('handleSubmit: event details ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleSubmit: END RecordPopup');
    }
    handleSuccess(event) {
        if (this.isDebug) console.log('handleSuccess: START RecordPopup',event);
        this.close({doNext: true});
        if (this.isDebug) console.log('handleSuccess: END RecordPopup / Closing popup');
    }
    handleError(event) {
        if (this.isDebug) console.log('handleError: START RecordPopup',event);
        if (this.isDebug) console.log('handleError: END RecordPopup');
    }
}