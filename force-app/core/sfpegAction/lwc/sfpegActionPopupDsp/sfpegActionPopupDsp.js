/***
* @author P-E GROS
* @date   August 2024
* @description  LWC Modal Popup Component to display a spinner in a popup
*               when executing a sfpegAction base operation (LDS, DML or Apex).
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
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import executeApex  from '@salesforce/apex/sfpegAction_CTL.executeApex';
import executeDML   from '@salesforce/apex/sfpegAction_CTL.executeDML';

import CLOSE_TITLE  from '@salesforce/label/c.sfpegPopupCloseTitle';
import CLOSE_LABEL  from '@salesforce/label/c.sfpegPopupCloseLabel';
import SPINNER_MSG  from '@salesforce/label/c.sfpegPopupSpinnerMessage';
import ERROR_MSG    from '@salesforce/label/c.sfpegPopupErrorMessage';


export default class SfpegActionPopupDsp extends LightningModal {
    
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

    @api actionType;        // Action type to execute (LDS, Apex, DML)
    @api actionConfig;      // Action configuration name from which the action is triggered
    @api actionParams;      // Action to execute with input params

    @api isDebug = false;   // Flag to activate debug information

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    isLaunched = false;     // Flag to track if operation execution has been requested 
    errorDetails;           // Error object upon completion failure

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    closeTitle = CLOSE_TITLE;
    closeLabel = CLOSE_LABEL;
    spinnerMessage = SPINNER_MSG;
    errorMessage = ERROR_MSG;

    //###########################################################
    // Custom Getters
    //###########################################################
    

    //###########################################################
    // Initialization
    //###########################################################

    connectedCallback(){
        console.log('connected: START ActionPopup');
        if (this.isDebug) {
            console.log('connected: modalHeader provided ',this.modalHeader);
            console.log('connected: modalMessage provided ',this.modalMessage);
            console.log('connected: modalHelp provided ',this.modalHelp);
            console.log('connected: label provided ',this.label);
        }
        if (!this.actionConfig) {
            console.error('connected: ActionPopup END KO / Missing actionConfig when opening popup');
            throw new Error('Missing actionConfig when opening popup');
        }
        else {
            if (this.isDebug) console.log('connected: actionConfig provided ', this.actionConfig);
        }
        if (!this.actionType) {
            console.error('connected: ActionPopup END KO / Missing actionType when opening popup');
            throw new Error('Missing actionType when opening popup');
        }
        else {
            if (this.isDebug) console.log('connected: actionType provided ', this.actionType);
        }
        if (!this.actionParams) {
            console.error('connected: ActionPopup END KO / Missing actionParams when opening popup');
            throw new Error('Missing actionParams when opening popup');
        }
        else {
            if (this.isDebug) console.log('connected: actionParams provided ', JSON.stringify(this.actionParams));
        }

        this.disableClose = true;
        if (this.isDebug) console.log('connected: END ActionPopup / Close disabled');
    }

    renderedCallback(){
        console.log('rendered: START ActionPopup');

        if (this.isLaunched) {
            console.log('rendered: END ActionPopup / Operation execution already launched');
            return;
        }

        console.log('rendered: launching operation ', JSON.stringify(this.actionParams));
        this.isLaunched = true;
        this.executeOperation();

        if (this.isDebug) console.log('rendered: END ActionPopup / Operation launched');
    }


    //###########################################################
    // Event Handlers
    //###########################################################

    handleClose(event){
        if (this.isDebug) console.log('handleClose: START ActionPopup with event ',event);
        this.close({isCompleted: false, error: this.errorDetails});
        if (this.isDebug) console.log('handleClose: END FlowPopup / component closed');        
    }


    //###########################################################
    // Utilities
    //###########################################################

    executeOperation = function() {
        if (this.isDebug) console.log('executeOperation: START for type ',this.actionType);

        let operationPromise;
        switch (this.actionType) {
            case 'LDS':
                if (this.isDebug) console.log('executeOperation: processing LDS action');
                switch (this.actionParams.type) {
                    case 'create': 
                        if (this.isDebug) console.log('executeOperation: LDS create action requested');
                        operationPromise = createRecord(this.actionParams.params);
                        break;
                    case 'update':
                        if (this.isDebug) console.log('executeOperation: LDS update action requested');
                        operationPromise = updateRecord(this.actionParams.params);
                        break;
                    case 'delete':
                        if (this.isDebug) console.log('executeOperation: LDS delete action requested');
                        operationPromise = deleteRecord(this.actionParams.params);
                        break;
                    default: 
                        console.error('executeOperation: END KO / Unsupported LDS action type ',this.actionParams.type);
                        throw new Error('Unsupported LDS action type provided when opening popup: " + this.actionParams.type');
                }
                break;
            case 'DML':
                if (this.isDebug) console.log('executeOperation: processing DML action');
                operationPromise = executeDML({
                    config: this.actionConfig,
                    action: this.actionParams.name,
                    operation: this.actionParams.params?.operation,
                    records: this.actionParams.params?.records
                });
                break;
            case 'apex':
                if (this.isDebug) console.log('executeOperation: executing Apex action');
                operationPromise =  executeApex({
                    config: this.actionConfig,
                    action: this.actionParams.name,
                    params: this.actionParams.params });
                break;
            default:
                console.error('executeOperation: END KO / No/bad actionType provided when opening popup ',this.actionType);
                throw new Error('No/bad actionType provided when opening popup: ' + this.actionType);
        }
        
        operationPromise.then((result) => {
            if (this.isDebug) console.log('executeOperation: operation done returning ',JSON.stringify(result));
            this.disableClose = false;
            if (this.isDebug) console.log('executeOperation: END / closing popup');
            this.close({isCompleted: true, result: result});
        }).catch((error) => {
            console.error('executeOperation: operation done returning ',JSON.stringify(error));
            this.disableClose = false;
            this.errorDetails = error;
            if (this.isDebug) console.log('executeOperation: END / displaying error');
        });
    }
}