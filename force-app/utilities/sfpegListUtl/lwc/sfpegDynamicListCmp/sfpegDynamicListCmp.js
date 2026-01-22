/***
* @author P-E GROS
* @date   Jan 2026
* @description  sfpegListCmp component wrapper of the PEG_LIST repository
*               enabling to display any sfpegList configuration dynamically
*               based on incoming show/hide sfpegCustomAction notifications
*               from other components (via sfpegAction configurations).
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

import { LightningElement, wire, api } from 'lwc';
import currentUserId        from '@salesforce/user/Id';

// To notify the utility bar handler if required
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import sfpegCustomAction        from '@salesforce/messageChannel/sfpegCustomAction__c';     // for custom LWC component invocation (outgoing)


export default class SfpegDynamicListCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api channel;               // Channel from which notifications should be processed.
    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation for all subcomponents.

    //----------------------------------------------------------------
    // Internal Initialization Parameters
    //----------------------------------------------------------------
    listConfig = null;          // current listConfig being displayed
    userId = currentUserId;     // ID of current User

    // To notify the utility bar handler if required / receive notification    
    notificationSubscription = null;
    @wire(MessageContext)
    messageContext;

    //----------------------------------------------------------------
    // Custom Getters
    //----------------------------------------------------------------

    get listConfigSerialized() {
        return (this.listConfig ? JSON.stringify(this.listConfig) : "ℹ️ No configuration yet!");
    }

    //----------------------------------------------------------------
    // Component initialisation  
    //----------------------------------------------------------------      
    connectedCallback() {
        if (this.isDebug) console.log('connected: START for Dynamic List');
        if (this.isDebug) console.log('connected: channel to subscribe ',this.channel);
        if (this.isDebug) console.log('connected: userId fetched ',this.userId);

        // Subscription management
        if (!this.notificationSubscription) {
            if (this.isDebug) console.log('connected: subscribing to notification channel');
            this.notificationSubscription = subscribe(
                this.messageContext,
                sfpegCustomAction,
                (message) => this.handleNotification(message));
        }
        else {
            console.warn('connected: notification channel already subscribed');
        }

        if (this.isDebug) console.log('connected: END for Dynamic List');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START for Dynamic List');
        if (this.isDebug) console.log('connected: channel to unsubscribe ',this.channel);

        if (this.notificationSubscription) {
            if (this.isDebug) console.log('disconnected: unsubscribing notification channel');
            unsubscribe(this.notificationSubscription);
            this.notificationSubscription = null;
        }
        else {
            console.warn('disconnected: no notification channel to unsubscribe');
        }

        if (this.isDebug) console.log('disconnected: END for Dynamic List');
    }

    //----------------------------------------------------------------
    // Event handlers
    //----------------------------------------------------------------

    // Action execution handler for notifications from external components
     handleNotification(message) {
        if (this.isDebug) console.log('handleNotification: START for Dynamic List with message ',JSON.stringify(message));

        if (message.channel) {
            if (message.channel === this.channel) {
                if (this.isDebug) console.log('handleNotification: processing message on subscribed channel ', this.channel);

                switch (message.action?.operation) {
                    case 'hide':
                        if (this.isDebug) console.log('handleNotification: END for Dynamic List / hiding list');
                        this.listConfig = null;
                        return;
                    case 'show':
                        if (!message.action?.configName) {
                            console.warn('handleNotification: END KO for Dynamic List / missing configName to show list');
                            this.listConfig = null;
                            return;
                        }
                        if (this.isDebug) console.log('handleNotification: configName received',message.action.configName);

                        if (this.listConfig) {
                            if (this.isDebug) console.log('handleNotification: removing previous list',JSON.stringify(this.listConfig));
                            this.listConfig = null;
                            setTimeout(() => {
                                this.listConfig = message.action;
                                if (this.isDebug) console.log('handleNotification: END for Dynamic List with new async config ',JSON.stringify(this.listConfig));
                            },50);
                        }
                        else {
                            this.listConfig = message.action;
                            if (this.isDebug) console.log('handleNotification: END for Dynamic List with new direct config ',JSON.stringify(this.listConfig));
                        }
                        return;
                    default :
                        console.warn('handleNotification: END KO for Dynamic List / unsupported operation ',message.action?.operation);
                        this.listConfig = null;
                        return;
                }
            }
            else {
                if (this.isDebug) console.log('handleNotification: END for Dynamic List / ignoring notification for other channel ',message.channel);
            }
        }
        else {
            console.warn('handleNotification: END KO for Dynamic List / no channel in notification ', JSON.stringify(message));
        }
    }

    handleActionDone(event) {
        if (this.isDebug) console.log('handleActionDone: START for for Dynamic List ',event);
        if (this.isDebug) console.log('handleActionDone: detail provided ',JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleActionDone: END / event propagated');
    }

}