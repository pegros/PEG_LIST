/***
* @author P-E GROS
* @date   August 2024
* @description  LWC Modal Popup Component to display a flow form from 
*               and return the completion status to the invoking
*               sfpegActionBarCmp component for action chaining.
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

// To propagate notification to parent page
import { MessageContext } from 'lightning/messageService';
//import { subscribe, unsubscribe, MessageContext } from 'lightning/messageService';
//import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';

import CLOSE_TITLE from '@salesforce/label/c.sfpegPopupCloseTitle';
import CLOSE_LABEL from '@salesforce/label/c.sfpegPopupCloseLabel';

export default class SfpegFlowPopupDsp extends LightningModal {

    //###########################################################
    // Component Properties
    //###########################################################

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api modalHeader;           // Modal header title
    @api modalMessage;          // Message displayed above the flow
    @api modalHelp;             // Help message displayed above the flow
    @api modalClass;            // CSS for the body container div
    @api showClose = false;     // Flag to show/hide a close button in the popup footer

    @api flowName;          // Developer Name of the Flow to launch
    @api flowParams;        // Parameters to pass as input when launching the Flow
    @api flowTarget;        // Name of the flow output field providing the page navigation target upon flow completion

    @api isDebug = false;   // Flag to activate debug information

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    errorMsg;   // Error message displayed in case of issue
    flowInput;  // Actual parameters to pass as input to the Flow (after possible JSON parsing)

     // To notify the utility bar handler if required / receive notification    
     //notificationSubscription = null;
     @wire(MessageContext)
     messageContext;

    //-----------------------------------
    // Custom Labels
    //-----------------------------------
    closeTitle = CLOSE_TITLE;
    closeLabel = CLOSE_LABEL;


    //###########################################################
    // Custom Getters
    //###########################################################
    get flowInputStr() {
        return JSON.stringify(this.flowInput);
    }

    
    //###########################################################
    // Initialization
    //###########################################################

    connectedCallback(){
        if (this.isDebug) console.log('connected: START FlowPopup with flow ',this.flowName);
        if (this.isDebug) console.log('connected: with modalHeader ',this.modalHeader);
        if (this.isDebug) console.log('connected: with flowTarget ',this.flowTarget);

        if (this.disableClose) {
            this.showClose = false;
            if (this.isDebug) console.log('connected: close disabled');
        }

        try {
            if (this.isDebug) console.log('connected: processing flowParams ', JSON.stringify(this.flowParams));

            // Subscription management            
            if (this.isDebug) console.log('connected: current messageContext ',this.messageContext);
            /*if (!this.notificationSubscription) {
                if (this.isDebug) console.log('connected: subscribing to notification channels ');
                this.notificationSubscription = subscribe(
                    this.messageContext,
                    sfpegCustomNotification,
                    (message) => this.handleNotification(message));
            }
            else {
                if (this.isDebug) console.log('connected: notification channels already subscribed ', JSON.stringify(this.configDetails.channels));
            }*/

            // Flow launch params management            
            if (this.isDebug) console.log('connected: processing flowParams ', this.flowParams);
            if (this.isDebug) console.log('connected: of type ',typeof this.flowParams);

            this.flowInput = (typeof this.flowParams == 'string' ?  JSON.parse(this.flowParams) : this.flowParams || []); 
            if (this.isDebug) console.log('connected: flow Input finalised ', JSON.stringify(this.flowInput));

            if (this.isDebug) console.log('connected: END FlowPopup');
        }
        catch (error) {
            console.warn('connected: END KO FlowPopup / flowParams parsing failed ', JSON.stringify(error));
            this.errorMsg = JSON.stringify(error);
        }
    }
    renderedCallback(){
        if (this.isDebug) {
            console.log('rendered: START FlowPopup for flow ',JSON.stringify(this.flowName));
            console.log('rendered: flowInput provided ',JSON.stringify(this.flowInput));
            console.log('rendered: flowTarget provided ',this.flowTarget);
            console.log('rendered: END FlowPopup');
        }
    }


    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START FlowPopup with flow ',this.flowName);

        /*if (this.notificationSubscription) {
            if (this.isDebug) console.log('disconnected: unsubscribing notification channels');
            unsubscribe(this.notificationSubscription);
            this.notificationSubscription = null;
        }
        else {
            if (this.isDebug) console.log('disconnected: no notification channel to unsubscribe');
        }*/

        if (this.isDebug) console.log('disconnected: END FlowPopup');
    }


    //###########################################################
    // Event Handlers
    //###########################################################

    handleStatusChange(event) {
        if (this.isDebug) console.log('handleStatusChange: START FlowPopup for flow ',this.flowName);
        event.preventDefault();
        if (this.isDebug) console.log('handleStatusChange: event details',JSON.stringify(event.detail));

        if (event.detail.status === 'FINISHED') {
            if (this.isDebug) console.log('handleStatusChange: end of flow reached');
            if (this.disableClose) {
                if (this.isDebug) console.log('handleStatusChange: enabling popup close');
                this.disableClose = false;
            }
            if (this.isDebug) console.log('handleStatusChange: END FlowPopup / closing popup');
            this.handleClose(event);
        }
        else {
            if (this.isDebug) console.log('handleStatusChange: END FlowPopup / ignoring event');
        }        
    }

    handleClose(event){
        if (this.isDebug) console.log('handleClose: START FlowPopup with event ',event);

        let closeParams = {status: event?.detail?.status, doNext: (event?.detail?.status === 'FINISHED')}
        if (this.isDebug) console.log('handleClose: closeParams init ', JSON.stringify(closeParams));
        
        if (this.flowTarget) {
            if (this.isDebug) console.log('handleClose: extracting value for output field ', this.flowTarget);
            let targetOutput = event.detail.outputVariables.find((item) => {return item.name === this.flowTarget;});
            if (this.isDebug) console.log('handleClose: targetOutput found ', JSON.stringify(targetOutput));
            if (targetOutput) {
                if (this.isDebug) console.log('handleClose: targetOutput found ', JSON.stringify(targetOutput));
                let targetPageRef = JSON.parse(targetOutput.value);
                if (this.isDebug) console.log('handleClose: targetPageRef parsed ', JSON.stringify(targetPageRef));
                closeParams.navigate = targetPageRef;
                if (this.isDebug) console.log('handleClose: closeParams extended ', JSON.stringify(closeParams));
            }
        }

        this.close(closeParams);
        if (this.isDebug) console.log('handleClose: END FlowPopup / component closed');        
    }

    /*handleNotification(message) {
        if (this.isDebug) console.log('handleNotification: START with message ',JSON.stringify(message));
        if (this.isDebug) console.log('handleNotification: END');
    }*/
}