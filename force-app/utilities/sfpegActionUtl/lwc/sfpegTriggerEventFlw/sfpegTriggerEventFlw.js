/***
* @author P-E GROS
* @date   April 2024
* @description  LWC Component to trigger a sfpegCustomNotification message right from a Flow
*               enabling e.g. to refresh all/some sfpegListCmp of a page when a Flow enters 
*               a flow screen (particularly interesting when executing )
*               It is made available for Experience Site pages for technical reason, i.e. to make
*               sure the component is properly included in the Site bundle (you only need to include
*               it in a page, without any actual configuration).
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

import { LightningElement, api, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import sfpegCustomNotification  from '@salesforce/messageChannel/sfpegCustomNotification__c';

export default class SfpegTriggerEventFlw extends LightningElement {

    //-----------------------------------
    // Configuration Parameters
    //-----------------------------------
    @api channel;
    @api action;
    @api isDebug;

    //-----------------------------------
    // Technical Parameters
    //-----------------------------------
    @wire(MessageContext)
    messageContext;

    //-----------------------------------------------------
    // Initialisation
    //-----------------------------------------------------
    connectedCallback() {
        if (this.isDebug) console.log('connected: START Event Trigger on channel ',this.channel);
        if (this.isDebug) console.log('connected: with action ',this.action);

        if (!this.isDebug) {
            if (this.isDebug) console.log('connected: END / Triggering automatic notification');
            this.doTriggerEvent();
        }
        else {
            if (this.isDebug) console.log('connected: END / Awaiting user confirmation in debug mode');
        }
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------
    handleClick(event) {
        if (this.isDebug) console.log('handleClick: START manual notification');
        this.doTriggerEvent();
        if (this.isDebug) console.log('handleClick: END manual notification');
    }

    //----------------------------------------------------------------
    // Component Utilities
    //----------------------------------------------------------------
    doTriggerEvent = function() {
        if (this.isDebug) console.log('doTriggerEvent: START with channel ',this.channel);

        if ((this.channel) && (this.action)) {
            let actionJson;
            try {
                if (this.isDebug) console.log('doTriggerEvent: parsing action ',this.action);
                actionJson = JSON.parse(this.action);
            }
            catch(error) {
                console.warn('doTriggerEvent: END KO / action parsing failed ',JSON.stringify(error));
                return;
            }

            let actionNotif = {
                channel: this.channel,
                action: actionJson,
                context: null
            };
            if (this.isDebug) console.log('doTriggerEvent: Event init ',JSON.stringify(actionNotif));

            publish(this.messageContext, sfpegCustomNotification, actionNotif);
            if (this.isDebug) console.log('doTriggerEvent: END OK / Event triggered');
        }
        else {
            console.warn('doTriggerEvent: END KO / Missing channel and/or action');
        }
    }
}