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

// For standard navigatin
import { NavigationMixin } from 'lightning/navigation';

// To minimize the utility bar popup
import { EnclosingUtilityId, minimize } from 'lightning/platformUtilityBarApi';

// To manage console tabs
import { getFocusedTabInfo, IsConsoleNavigation, getAllTabInfo, refreshTab as wsRefreshTab, closeTab as wsCloseTab, openTab as wsOpenTab, focusTab as wsFocusTab } from 'lightning/platformWorkspaceApi';

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

    // Console mode handling
    @wire(IsConsoleNavigation) isConsoleNavigation;

    // Utility bar handling
    @wire(EnclosingUtilityId) utilityId;

    //----------------------------------------------------------------
    // Component Initialization and Deletion Handling
    //----------------------------------------------------------------

    connectedCallback() {
        if (this.isDebug) console.log('connected: START Action Handler');

        if (this.doSubscribe) {
            this.subscribeToMessageChannel();
            if (this.isDebug) console.log('connected: subscription to notification channels done');
        }
        else {
            if (this.isDebug) console.log('connected: no subscription to notification channels needed');
        }



        if (this.isDebug) console.log('connected: END Action Handler');
    }

    disconnectedCallback() {
        if (this.isDebug) console.log('disconnected: START Action Handler');

        if (this.doSubscribe) {
            this.unsubscribeToMessageChannel();
            if (this.isDebug) console.log('disconnected: unsubscription to notification channels done');
        }
        else {
            if (this.isDebug) console.log('disconnected: no unsubscription to notification channels needed');
        }  

        if (this.isDebug) console.log('disconnected: END Action Handler');
    }


    //----------------------------------------------------------------
    // Interface actions
    //----------------------------------------------------------------
    // Action execution service from parent component (e.g. for Action Utility Aura parent component, no merge done)
    @api executeAction(action,context) {
        if (this.isDebug) console.log('executeAction: START Action Handler with ', JSON.stringify(action));
        if (this.isDebug) console.log('executeAction: with context ', JSON.stringify(context));

        let actionBar = this.template.querySelector('c-sfpeg-action-bar-cmp');
        console.log('executeAction: actionBar fetched ',actionBar);

        try {
            if (this.isDebug) console.log('executeAction: triggering action');
            actionBar.executeAction(action,context);
            if (this.isDebug) console.log('executeAction: END Action Handler / action triggered');
        }
        catch (error) {
            console.warn('executeAction: END Action Handler KO / action execution failed!', JSON.stringify(error));
        }
    }


    //----------------------------------------------------------------
    // Handler for actions 
    //----------------------------------------------------------------

    // Handler for done  event from own action menu
    handleActionDone(event) {
        if (this.isDebug) console.log('handleActionDone: START Action Handler with event ',JSON.stringify(event.detail));
        this.lastMessage = JSON.stringify(event.detail);
        if (this.isDebug) console.log('handleActionDone: lastMessage kept');

        this.processAction(event.detail,null);
        if (this.isDebug) console.log('handleActionDone: END OK / action processed');

        /*let doneEvent = new CustomEvent('done', {
            detail: event.detail
        });
        if (this.isDebug) console.log('handleActionDone: doneEvent init',JSON.stringify(doneEvent));   
        this.dispatchEvent(doneEvent);
        if (this.isDebug) console.log('handleActionDone: doneEvent dispatched');

        if (this.isDebug) console.log('handleActionDone: END Action Handler / doneEvent dispatched'); */
    }

    // Handler for message received by component
    handleMessage(message) {
        if (this.isDebug) console.log('handleMessage: START Action Handler with message ',JSON.stringify(message));
        this.lastMessage = JSON.stringify(message);

        if ((message.action) && (message.action.type)) {
            this.processAction(message.action,message.context);
            if (this.isDebug) console.log('handleMessage: END OK / action processed');
        }
        else {
            console.warn('handleMessage: END KO / missing action type in message');
        } 
    }

    processAction(action,context) {
        if (this.isDebug) console.log('processAction: START Action Handler with action',JSON.stringify(action));
        if (this.isDebug) console.log('processAction: and context',JSON.stringify(context));

        if (! action?.type) {
            console.warn('processAction: END KO / missing action type in message');
            return;
        }  

        let handleNext = true;
        switch (action.type) {
            case "minimise":
            case 'minimize':
                if (this.isDebug) console.log('processAction: minimizing utility bar popup');
                this.handleMinimize();
                break;
            case 'openTab':
                if (this.isDebug) console.log('processAction: opening tab from utility bar');
                this.handleOpenTab(action.params);
                break;
            case 'closeTabs':
                if (this.isDebug) console.log('processAction: closing tabs from utility bar');
                this.handleCloseTabs(action.params?.closeAll);
                break;
            case 'refreshTab':
                if (this.isDebug) console.log('processAction: refreshing tab from utility bar');
                this.handleRefreshTab(action);
                break;
            case "openFlow":
            case "openPopup":
            case "fireEvent":
                if (this.isDebug) console.log('processAction: forwarding action to parent component ',action.type);
                let doneEvent = new CustomEvent('done', {detail: { action: action, context: context}});
                if (this.isDebug) console.log('processAction: doneEvent init',JSON.stringify(doneEvent));   
                this.dispatchEvent(doneEvent);
                if (this.isDebug) console.log('processAction: doneEvent dispatched');
                break;
            default:
                if (this.isDebug) console.log('processAction: forwarding action to actionBar ',action.type);
                handleNext = false;
                let actionBar = this.template.querySelector('c-sfpeg-action-bar-cmp');
                if (actionBar) {
                    if (this.isDebug) console.log('processAction: actionBar found');
                    if (action) {
                        if (this.isDebug) console.log('processAction: forwarding action');
                        actionBar.executeAction(action,context);
                    }
                    else {
                        console.warn('processAction: action not provided');
                    }
                }
                else {
                    console.warn('processAction: ENDAction Handler KO / actionBar not found');
                }
        }

        if ((handleNext) && (action.next)) {
            if (this.isDebug) console.log('processAction: chained action to trigger',JSON.stringify(action.next));
            this.processAction(action.next,context);
            if (this.isDebug) console.log('processAction: END / chained action triggered');
        }
        else {
            if (this.isDebug) console.log('processAction: END / no chained action to trigger');
        }
    }

    //----------------------------------------------------------------
    // Specific Actions Handling Utilities
    //----------------------------------------------------------------

    handleMinimize() {
        if (this.isDebug) console.log('handleMinimize: START');

        if (!this.utilityId) {
            console.warn('handleMinimize: START KO / component not in utility bar');
            return;
        }
        minimize(this.utilityId)
        .then((isMinimized) => {
            if (this.isDebug) console.log('handleMinimize: END OK with status ', isMinimized);
        })
        .catch((error) => console.warn('handleMinimize: END KO with error ', error));
    }

    handleOpenTab(params) {
        if (this.isDebug) console.log('handleOpenTab: START with ', JSON.stringify(params));
        let sourceTabId = params?.sourceTab;
        const targetId = params?.targetId;
        const targetObject = params?.targetObject;
        const isTargetMain = params?.isTargetMain;
        const targetPage = params?.targetPage;

        if (this.isConsoleNavigation) {
            if (this.isDebug) console.log('handleOpenTab: operating in console mode');
            let sourceTabIdPromise = sourceTabId ? Promise.resolve({ tabId: sourceTabId }) : getFocusedTabInfo();

            sourceTabIdPromise
            .then((focusedTab) => {
                if (this.isDebug) console.log('handleOpenTab: currentFocusedTab retrieved ',JSON.stringify(focusedTab));
                sourceTabId = focusedTab.tabId;
                if (this.isDebug) console.log('handleOpenTab: sourceTabId init ',sourceTabId);

                if (isTargetMain) {
                    if (this.isDebug) console.log('handleOpenTab: opening new page first');
                    let targetPageRef = targetId ? { type: 'standard__recordPage', attributes: { recordId: targetId, objectApiName: targetObject, actionName: 'view' } } : targetPage;
                    if (this.isDebug) console.log('handleOpenTab: opening targetPageRef', JSON.stringify(targetPageRef));
                    wsOpenTab({ pageReference: targetPageRef, focus: true, overrideNavRules: false })
                    .then((newTabId) => {
                        if (this.isDebug) console.log('handleOpenTab: newTab opened', newTabId);
                        if (this.isDebug) console.log('handleOpenTab: sourceTabId to close', sourceTabId);
                        if ((sourceTabId) && (sourceTabId !== newTabId)) {
                            if (this.isDebug) console.log('handleOpenTab: closing source tab', sourceTabId);
                            wsCloseTab(sourceTabId);
                        }
                        else {
                            if (this.isDebug) console.log('handleOpenTab: situation OK');
                            Promise.resolve("Closed");
                        }
                    });
                }
                else {
                    // necessary to handle console handling of same record reopen when in main tab (no reopen in subtab)
                    if (this.isDebug) console.log('handleOpenTab: closing existing page first', sourceTabId);
                    wsCloseTab(sourceTabId)
                    .then(() => {
                    
                        if (this.isDebug) console.log('handleOpenTab: existing page closed');
                        let targetPageRef = targetId ? { type: 'standard__recordPage', attributes: { recordId: targetId, objectApiName: targetObject, actionName: 'view' } } : targetPage;
                        if (this.isDebug) console.log('handleOpenTab: targetPageRef init ', JSON.stringify(targetPageRef));

                        // necessary to handle console handling of tab close
                        setTimeout(() => {
                            if (this.isDebug) console.log('handleOpenTab: opening targetPageRef after 100ms wait');
                            wsOpenTab({ pageReference: targetPageRef, focus: true, overrideNavRules: false });
                        }, 100);
                                
                    });   
                }
            })
            .then(() => {if (this.isDebug) console.log('handleOpenTab: END');})
            .catch((error) => console.warn('handleOpenTab: END KO / error ', JSON.stringify(error)));
        }
        else {
            if (this.isDebug) console.log('handleOpenTab: END / operating in non console mode');
            const pageRef = targetId ? { type: 'standard__recordPage', attributes: { recordId: targetId, objectApiName: targetObject, actionName: 'view' } } : targetPage;
            this[NavigationMixin.Navigate](pageRef);
        }
    }

    handleCloseTabs(closeAll) {
        if (this.isDebug) console.log('closeTabs: START with closeAll? ', closeAll);
        if (!this.isConsoleNavigation) {
            console.warn('closeTabs: END KO / not in console mode');
            return;
        }
        getAllTabInfo()
        .then((tabInfos) => {
            if (this.isDebug) console.log('closeTabs: tab info fetched ', JSON.stringify(tabInfos));       
            (tabInfos || []).forEach((tabIter) => {
                if (this.isDebug) console.log('closeTabs: processing tab ',JSON.stringify(tabIter));
                if (tabIter.pinned) return; // keep pinned
                if (tabIter.focused && !closeAll) return; // keep focused if not closing all
                if (this.isDebug) console.log('closeTabs: closing tab with ID ', tabIter.tabId);
                //wsCloseTab({ tabId: tabIter.tabId })
                wsCloseTab(tabIter.tabId)
                .then(() => {if (this.isDebug) console.log('closeTabs: END OK / closeTab for tabId',tabIter.tabId);})
                .catch((error) => console.warn('closeTabs: END KO / closeTab error', JSON.stringify(error)));
            });
            if (closeAll) {
                // Navigate to home to ensure a landing tab
                if (this.isDebug) console.log('closeTabs: END / navigating to Home page');
                this[NavigationMixin.Navigate]({ type: 'standard__namedPage', attributes: { pageName: 'home' } });
            }
            else {
                if (this.isDebug) console.log('closeTabs: END / staying on focused tab');
            }
        })
        .catch((error) => console.warn('closeTabs: END KO / getAllTabInfo error', JSON.stringify(error)));
    }

    handleRefreshTab(message) {
        if (this.isDebug) console.log('refreshTab: START');
        if (this.isConsoleNavigation) {
            getFocusedTabInfo()
            .then((tab) => {
                if (this.isDebug) console.log('refreshTab: current tab info received',JSON.stringify(tab));
                if (tab?.tabId) {
                    if (this.isDebug) console.log('refreshTab: END OK / refreshing current tab in console mode',tab.tabId);
                    //wsRefreshTab(tab.tabId,{includeAllSubtabs: true });
                    wsRefreshTab(tab.tabId,true);
                }
                else {
                    if (this.isDebug) console.log('refreshTab: END OK / no refresh done for current tab in console mode');
                }
            })
            .catch((error) => console.warn('refreshTab: END KO / error', JSON.stringify(error)));
        }
        else {
            if (this.isDebug) console.log('refreshTab: notifying possible Aura parent in standard mode');
            let doneEvent = new CustomEvent('done', {detail: { action: message.action, context: message.context}});
            if (this.isDebug) console.log('handleMessage: END / Displatching event to parent',JSON.stringify(doneEvent));   
            this.dispatchEvent(doneEvent);
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