/***
* @author P-E GROS
* @date   June 2024
* @description LWC Component to handle notifications to open query popup.
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

import { LightningElement,api,wire } from 'lwc';
import sfpegSearchPopupDsp from "c/sfpegSearchPopupDsp";

// To receive the notifications
import { subscribe, unsubscribe, publish, MessageContext } from 'lightning/messageService';
import sfpegCustomAction        from '@salesforce/messageChannel/sfpegCustomAction__c';     // for custom LWC component invocation (outgoing)

export default class SfpegSearchPopupCmp extends LightningElement {

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api notifChannel;
    @api isDebug = false;       // Debug mode activation
    @api isDebugFine = false;   // Debug mode activation on subcomponents

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    
    // To receive notification    
    notificationSubscription = null;
    @wire(MessageContext)
    messageContext;

    //----------------------------------------------------------------
    // Component Initialisation
    //----------------------------------------------------------------
    connectedCallback(){
        if (this.isDebug) console.log('connected: START SearchPopup with ', this.notifChannel);

        this.notifChannel = this.notifChannel || 'sfpegSearchPopup';

        if (this.isDebug) console.log('connected: subscribing to notification channel ');
        if (!this.notificationSubscription) {
            this.notificationSubscription = subscribe(
                this.messageContext,
                sfpegCustomAction,
                (message) => this.handleNotification(message));
                //{ scope: APPLICATION_SCOPE });
        }
         else {
            if (this.isDebug) console.log('connected: notification channels already subscribed ');
        }

        if (this.isDebug) console.log('connected: END SearchPopup');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START SearchPopup with ',this.notifChannel);

        if (this.notificationSubscription) {
            if (this.isDebug) console.log('disconnected: unsubscribing notification channels');
            unsubscribe(this.notificationSubscription);
            this.notificationSubscription = null;
        }
        else {
            if (this.isDebug) console.log('disconnected: no notification channel to unsubscribe');
        }

        if (this.isDebug) console.log('disconnected: END SearchPopup');
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------
    
    handleNotification(message) {
        if (this.isDebug) console.log('handleNotification: START SearchPopup with message ',JSON.stringify(message));

        if (message.channel) {
            if (message.channel === this.notifChannel) {
                if (this.isDebug) console.log('handleNotification: displaying popup with config ', JSON.stringify(message.action));
                let popupParams = {...message.action};
                popupParams.isDebug = popupParams.isDebug || this.isDebug;
                popupParams.isDebugFine = popupParams.isDebugFine || this.isDebugFine;
                if (this.isDebug) console.log('handleNotification: popup config reworked ', JSON.stringify(popupParams));
                sfpegSearchPopupDsp.open(popupParams)
                .then((result) => {
                    if (this.isDebug) console.log('handleNotification: END SearchPopup / popup closed',result);
                })
                .catch(err => {
                    console.error('handleNotification: END KO SearchPopup / popup open failed ',JSON.stringify(err));
                });
            }
            else {
                if (this.isDebug) console.log('handleNotification: END SearchPopup / ignoring notification ');
            }
        }
        else {
            console.warn('handleNotification: END KO SearchPopup / no channel specified in notification');
        }
    }       
}