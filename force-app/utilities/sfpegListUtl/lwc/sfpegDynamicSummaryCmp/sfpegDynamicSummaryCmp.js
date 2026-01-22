/***
* @author P-E GROS
* @date   Jan 2026
* @description  Multi-purpose component wrapping the sfpegCardCmp, sfpegMessageListCmp
*               and sfpegListCmp of the PEG_LIST repository and displaying 
*               them in a structured way based on notifications from other components.
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

import { LightningElement, wire, api, track } from 'lwc';
import currentUserId        from '@salesforce/user/Id';

// To notify the utility bar handler if required
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import sfpegCustomAction    from '@salesforce/messageChannel/sfpegCustomAction__c';     // for custom LWC component invocation (outgoing)


export default class SfpegDynamicSummaryCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api cardClass;             // CSS Classes for the wrapping card
    @api buttonSize = 'small';  // Size of the standard header buttons (to align with custom header actions)
    @api maxSize = 100;         // Header Action list overflow limit

    @api objectConfig;          // Per Object API Name Configuration of the Card and Card Header Actions to be used

    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.

    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    record = null;              // current Record being displayed
    configDetails = null;       // JSON parsing of the objectConfig configuration parameter

    userId = currentUserId;     // ID of current User
    errorMessage = null;        // Error Message

    // To notify the utility bar handler if required / receive notification    
    notificationSubscription = null;
    @wire(MessageContext)
    messageContext;

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for Dynamic Summary');
        if (this.isDebug) console.log('connected: objectConfig provided ',this.objectConfig);
        if (this.isDebug) console.log('connected: userId provided ',this.userId);

        try {
            this.configDetails = JSON.parse(this.objectConfig);
            if (this.isDebug) console.log('connected: configDetails parsed ',this.configDetails);
        }
        catch (e) {
            console.warn('connected: END KO / config parsing failure ',e);
            this.errorMsg = 'Configuration init failure: ' + e;
            return;
        }

        // Subscription management
        if (!this.notificationSubscription) {
            if (this.isDebug) console.log('connected: subscribing to notification channel');
            this.notificationSubscription = subscribe(
                this.messageContext,
                sfpegCustomAction,
                (message) => this.handleNotification(message));
        }
        else {
            if (this.isDebug) console.log('connected: notification channels already subscribed ', JSON.stringify(this.configDetails.channels));
        }

        if (this.isDebug) console.log('connected: END for Dynamic Summary');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START');
        if (this.isDebug) console.log('disconnected: recordId ',this.recordId);

        if (this.notificationSubscription) {
            if (this.isDebug) console.log('disconnected: unsubscribing notification channels');
            unsubscribe(this.notificationSubscription);
            this.notificationSubscription = null;
        }
        else {
            if (this.isDebug) console.log('disconnected: no notification channel to unsubscribe');
        }

        if (this.isDebug) console.log('disconnected: END');
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------

    // Action execution handler for notifications from external components
     handleNotification(message) {
        if (this.isDebug) console.log('handleNotification: START with message ',JSON.stringify(message));

        if (message.channel) {
            if (message.channel === 'sfpegRelationGraph') {
                if (this.isDebug) console.log('handleNotification: processing message on subscribed channel ');

                switch (message.action) {
                    case 'unselect':
                        if (this.isDebug) console.log('handleNotification: END / unselecting record');
                        this.record = null;
                        this.errorMessage = null;
                        return;
                    case 'select':
                        if (!message.context) {
                            console.warn('handleNotification: END / record context information missing in notification ', JSON.stringify(message));
                            this.record = null;
                            this.errorMessage = 'Record context information missing in notification!';
                            return;
                        }

                        if (this.isDebug) console.log('handleNotification: selecting record ', message.context);
                        let newrecord = {... message.context};
                        newrecord.config = {};
                        if ((newrecord.context) && (this.configDetails[newrecord.context])) {
                            if (this.isDebug) console.log('handleNotification: using context config ',this.configDetails[newrecord.context]);
                            newrecord.config = {... this.configDetails[newrecord.context]};
                        }
                        else if ((newrecord.objectApiName) && (this.configDetails[newrecord.objectApiName])) {
                            if (this.isDebug) console.log('handleNotification: using objectApiName config ',this.configDetails[newrecord.objectApiName]);
                            newrecord.config = {... this.configDetails[newrecord.objectApiName]};
                        }
                        else {
                            console.warn('handleNotification: END / record display configuration not found from notification ', JSON.stringify(message));
                            this.record = null;
                            this.errorMessage = 'Record display configuration not determined from notification!';
                            return;
                        }

                        this.errorMessage = null;
                        if (this.record) {
                            this.record = null;
                            setTimeout(() => {
                                this.record = newrecord;
                                if (this.isDebug) console.log('handleNotification: END with record updated ',JSON.stringify(this.record));
                            },50);
                        }
                        else {
                            this.record = newrecord;
                            if (this.isDebug) console.log('handleNotification: END with record init ',JSON.stringify(this.record));
                        }
                        return;
                    default :
                        console.warn('handleNotification: END KO / unsupported action ',message.action);
                        this.record = null;
                        this.errorMessage = 'Unsupported action found in notification ' + message.action;
                        return;
                }
            }
            else {
                if (this.isDebug) console.log('handleNotification: END / message ignored as on unsubscribed channel ',message.channel);
            }
        }
        else {
            console.warn('handleNotification: END / channel information missing in notification ', JSON.stringify(message));
        }
    }

    handleActionDone(event) {
        if (this.isDebug) console.log('handleActionDone: START with ',JSON.stringify(event.detail));

        let doneEvent = new CustomEvent('done', {
            "detail": event.detail
        });
        this.dispatchEvent(doneEvent);
        
        if (this.isDebug) console.log('handleActionDone: END / event propagated');
    }

}