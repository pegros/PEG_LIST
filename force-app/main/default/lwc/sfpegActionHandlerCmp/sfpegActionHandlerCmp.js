/***
* @author P-E GROS
* @date   April 2021
* @description  LWC Component to display Lists of actions in a utility bar menu.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2021 pegros
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

// To set action menu context
import currentUserId from '@salesforce/user/Id';

// To notify the utility bar handler if required
import {
    subscribe,
    unsubscribe,
    APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import sfpegAction from '@salesforce/messageChannel/sfpegAction__c';


export default class SfpegActionHandlerCmp extends LightningElement {

    // Main configuration fields (for App Builder)
    @api barClass;              // CSS Classes for the wrapping div
    @api configName;            // DeveloperName fo the sfpegAction__mdt record to be used
    @api isDebug = false;       // Debug mode activation
    @api doSubscribe = false;   // Flag to activate Action message channel subscription
                                // (e.g. to support multiple instantiations in utility bar)

    // Internal Initialization Parameter
    @api userId = currentUserId;// ID of current User

    // Internal Display Parameter
    @track lastMessage = null;     // Error message (if any for end user display)

    // Notification handling
    subscription = null;
    @wire(MessageContext)
    messageContext;

    // Component Initialization
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        if (this.doSubscribe) {
            this.subscribeToMessageChannel();
            if (this.isDebug) console.log('connected: subscription to notification channels done');
        }
        else {
            if (this.isDebug) console.log('connected: no subscription to notification channels needed');
        }

        if (this.isDebug) console.log('connected: END');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START');

        if (this.doSubscribe) {
            this.unsubscribeToMessageChannel();
            if (this.isDebug) console.log('disconnected: unsubscription to notification channels done');
        }
        else {
            if (this.isDebug) console.log('disconnected: no unsubscription to notification channels needed');
        }  

        if (this.isDebug) console.log('disconnected: END');
    }


    //----------------------------------------------------------------
    // Interface actions
    //----------------------------------------------------------------
    // Parent action execution service (for Action Utility Aura parent component, no merge done)
    @api executeAction(action,context) {
        if (this.isDebug) console.log('executeAction: START', JSON.stringify(action));
        if (this.isDebug) console.log('executeAction: with context ', JSON.stringify(context));

        let actionBar = this.template.querySelector('c-sfpeg-action-bar-cmp');
        console.log('executeAction: actionBar fetched ',actionBar);

        try {
            if (this.isDebug) console.log('executeAction: triggering action');
            actionBar.executeAction(action,context);
            if (this.isDebug) console.log('executeAction: END / action triggered');
        }
        catch (error) {
            console.warn('executeAction: END KO / action execution failed!', JSON.stringify(error));
        }
    }


    //----------------------------------------------------------------
    // Handler for actions 
    //----------------------------------------------------------------

    // Handler for done  event from own action menu
    handleActionDone(event) {
        if (this.isDebug) console.log('handleActionDone: START with event ',JSON.stringify(event.detail));
        this.lastMessage = JSON.stringify(event.detail);

        let doneEvent = new CustomEvent('done', {
            "detail": event.detail
        });
        if (this.isDebug) console.log('handleActionDone: doneEvent init',JSON.stringify(doneEvent));   
        this.dispatchEvent(doneEvent);
        if (this.isDebug) console.log('handleActionDone: doneEvent dispatched'); 

        if (this.isDebug) console.log('handleActionDone: END / doneEvent dispatched'); 
    }

    // Handler for message received by component
    handleMessage(message) {
        if (this.isDebug) console.log('handleMessage: START with message ',JSON.stringify(message));
        this.lastMessage = JSON.stringify(message);

        if ((message.action) && (message.action.type)) {
            switch (message.action.type) {
                case "minimise":
                case "openTab":
                case "closeAllTabs":
                case "refreshTab":
                case "openFlow":
                case "openPopup":
                case "fireEvent":
                    if (this.isDebug) console.log('handleMessage: forwarding action to parentCmp ',message.action.type);
                    let doneEvent = new CustomEvent('done', {
                        "detail": message.action
                    });
                    if (this.isDebug) console.log('handleMessage: doneEvent init',JSON.stringify(doneEvent));   
                    this.dispatchEvent(doneEvent);
                    if (this.isDebug) console.log('handleMessage: END / doneEvent dispatched');
                    break;
                default:
                    if (this.isDebug) console.log('handleMessage: forwarding action to actionBar ',message.action.type);
                    let actionBar = this.template.querySelector('c-sfpeg-action-bar-cmp');
                    if (actionBar) {
                        if (this.isDebug) console.log('handleMessage: actionBar found');
                        if (message.action) {
                            if (this.isDebug) console.log('handleMessage: END OK / forwarding action');
                            actionBar.executeAction(message.action,message.context);
                        }
                        else {
                            console.warn('handleMessage: END KO / action not provided');
                        }
                    }
                    else {
                        console.warn('handleMessage: END KO / actionBar not found');
                    }
            }
        }
        else {
            console.warn('handleMessage: END KO / missing action type in message');
        }        
    }

    //----------------------------------------------------------------
    // Notification subscription 
    //----------------------------------------------------------------
    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                sfpegAction,
                (message) => this.handleMessage(message),
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

}