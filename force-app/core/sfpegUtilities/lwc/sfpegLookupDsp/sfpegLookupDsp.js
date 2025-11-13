/***
* @author P-E GROS
* @date   Oct. 2025
* @description  LWC Component to display alookup field value with on-hover 
*               compact layout display and link to detail page.
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2025 pegros
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
import { NavigationMixin }  from 'lightning/navigation';
import { getRecord }        from 'lightning/uiRecordApi';
import { getLayout }        from "lightning/uiLayoutApi";

export default class SfpegLookupDsp extends NavigationMixin(LightningElement) {

    //----------------------------------------------------------------
    // Component parameters  
    //----------------------------------------------------------------   
    // Configuration parameters
    @api recordName;        // Name of the lookup record
    @api recordId;          // ID of the lookup record
    @api fieldClass;        // CSS to apply on the lookup link
    @api isDebug = false;   // Flag to activate debug mode
    
    //----------------------------------------------------------------
    // Technical parameters  
    //----------------------------------------------------------------   
    isHovered = false;  // track hovering state
    hoverTimeout;       // hover wait;

    popoverElement;     // reference to the portal popover element
    popupContainer;     // reference to the popover form details element

    popupRecordId;      // Record ID to trigger Compact Layout data fetch
    popupData;          // Compact Layout record data
    popupObject;        // Record Object API Name from Compact Layout record data
    popupRecordType;    // Record RecordType Id from Compact Layout record data
    popupLayout;        // Compact Layout description for the record

    doRedirect = false; // Flag to control the navigation to the target record

    //----------------------------------------------------------------
    // Componnet Init
    //----------------------------------------------------------------
    connectedCallback() {
        //this.isDebug = true;
        if (this.isDebug) {
            console.log('connected: START with name ',this.recordName);
            console.log('connected: recordId ',this.recordId);
            console.log('connected: objectApiName ',this.objectApiName);
            console.log('connected: iconName ',this.iconName);
            console.log('connected: fieldClass ',this.fieldClass);
            console.log('connected: END');
        }
    }

    disconnectedCallback() {
        // Clean up portal popover when component is destroyed
        this.hidePopover();
    }

    //----------------------------------------------------------------
    // Contextual Data Fetch via LDS
    //----------------------------------------------------------------
    // Current Record 
    @wire(getRecord, { recordId: '$popupRecordId', layoutTypes: 'Compact' })
    wiredRecord({ error, data }) {
        if (this.isDebug) console.log('wiredRecord: START for LookupPopup with ID ', this.popupRecordId);

        if (data) {
            if (this.isDebug) console.log('wiredRecord: data fetch OK', JSON.stringify(data));
            this.popupData = data;
            this.popupObject = data.apiName;
            if (this.isDebug) console.log('wiredRecord: popupObject fetched ',this.popupObject);
            this.popupRecordType = data.recordTypeId;
            if (this.isDebug) console.log('wiredRecord: popupRecordType fetched',this.popupRecordType);
            if (this.isDebug) console.log('wiredRecord: END for LookupPopup / waiting layout fetch');
        }
        else if (error) {
            console.warn('wiredRecord: END KO for LookupPopup / data fetch error', JSON.stringify(error));
        }
        else {
            if (this.isDebug) console.log('wiredRecord: END for LookupPopup / No data');
        }
    }

    @wire(getLayout, { objectApiName: '$popupObject', layoutType: 'Compact', mode: 'View', recordTypeId: '$popupRecordType' })
    wiredLayout({ error, data }) {
        if (this.isDebug) console.log('wiredLayout: START for LookupPopup with ID ', this.popupRecordId);

        if (data) {
            if (this.isDebug) console.log('wiredLayout: data fetch OK', JSON.stringify(data));
            this.popupLayout = data;
            if (this.doRedirect) {
                this.handleClick(null);
                if (this.isDebug) console.log('wiredLayout: END for LookupPopup / redirection requested');
            }
            else {
                this.createRecordForm(this.popupContainer);
                if (this.isDebug) console.log('wiredLayout: END for LookupPopup / popup displayed');
            }
        }
        else if (error) {
            console.warn('wiredLayout: END KO for LookupPopup / data fetch error', JSON.stringify(error));
        }
        else {
            if (this.isDebug) console.log('wiredLayout: END for LookupPopup / No data');
        }
    }

    //----------------------------------------------------------------
    // Event Handlers
    //----------------------------------------------------------------
    // Navigation to record
    handleClick(event){
        if (this.isDebug) {
            console.log('handleClick: START with name ',this.recordName);
            console.log('handleClick: recordId ',this.recordId);
            console.log('handleClick: fieldClass ',this.fieldClass);
        }

        if (this.popupObject == null) {
            if (this.isDebug) console.log('handleClick: requesting compact layout data fetch');
            this.popupRecordId = this.recordId;
            this.doRedirect = true;
            if (this.isDebug) console.log('handleClick: END / requesting compact layout data fetch requested');
            return;
        }

        let targetPageRef = {
            type:"standard__recordPage",
            attributes:{
                recordId:       this.recordId,
                objectApiName:  this.popupObject,
                actionName:     "view"
            }
        }
        if (this.isDebug) console.log('handleClick: targetPageRef init ',JSON.stringify(targetPageRef));

        this[NavigationMixin.Navigate](targetPageRef);
        this.doRedirect = false;
        if (this.isDebug) console.log('handleClick: END / navigation triggered');
    }

    // Hovering 
    handleHover(event){
        if (this.isDebug) console.log('handleHover: START on record ', this.recordName);
        if (this.isDebug) console.log('handleHover: event ', event);        

        if (this.hoverTimeout) {
            if (this.isDebug) console.log('handleHover: clearing prior timeout ');
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
            if (this.isDebug) console.log('handleHover: hover timeout cleared');
        }

        let clientX = event.clientX;
        let clientY = event.clientY;
        let targetRect = event.target.getBoundingClientRect();
        if (this.isDebug) console.log('handleHover: targetRect init ', targetRect);        

        /*if (this.isDebug) console.log('handleHover: clientX extracted ', clientX);
        if (this.isDebug) console.log('handleHover: window innerWidth ', window.innerWidth);
        if (this.isDebug) console.log('handleHover: left border', targetRect.left);
        if (this.isDebug) console.log('handleHover: right border', targetRect.right);

        if (this.isDebug) console.log('handleHover: clientY extracted ', clientY);
        if (this.isDebug) console.log('handleHover: window innerHeight ', window.innerHeight);
        if (this.isDebug) console.log('handleHover: top border', targetRect.top);
        if (this.isDebug) console.log('handleHover: bottom border', targetRect.bottom);*/

        this.hoverTimeout = setTimeout( () => {
            if (this.isDebug) console.log('handleHover: hover timeout expired');
            if (this.doRedirect) {
                if (this.isDebug) console.log('handleHover: END / redirection requested');
                return;
            }
            this.showPopover(targetRect);
            if (this.isDebug) console.log('handleHover: END / popup displayed');
        }, 500);

        if (this.isDebug) console.log('handleHover: hover timeout init');
    }

    handleLeave(event){
        if (this.isDebug) console.log('handleLeave: START on record ', this.recordName);

        if (this.hoverTimeout) {
            if (this.isDebug) console.log('handleLeave: clearing prior timeout ');
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
            if (this.isDebug) console.log('handleLeave: hover timeout cleared');
        }

        this.hidePopover();
        if (this.isDebug) console.log('handleLeave: END');
    }

    //----------------------------------------------------------------
    // Portal Popover Methods
    //----------------------------------------------------------------
    showPopover(targetRect) {
        if (this.isDebug) console.log('showPopover: START');
        
        // Hide any existing popover first
        this.hidePopover();
        if (this.isDebug) console.log('showPopover: current popover removed');

        // Create popover element
        this.popoverElement = document.createElement('div');
        this.popoverElement.className = 'sfpeg-lookup-popover-portal';
        this.popoverElement.style.cssText = `
            position: fixed;
            z-index: 10000;
            pointer-events: none;
        `;
        
        // Calculate position and nubbin
        let popupNubbin;

        if ((targetRect.right + 512) < window.innerWidth) {
            if (this.isDebug) console.log('showPopover: nubbin positioned left ',targetRect.right + 20);
            this.popoverElement.style.left = (targetRect.right + 20) + 'px';
            popupNubbin = 'left';
        }
        else if ((targetRect.left - 512) > 0) {
            if (this.isDebug) console.log('showPopover: nubbin positioned right',targetRect.left - 20);
            this.popoverElement.style.right = (targetRect.left - 20) + 'px';
            popupNubbin = 'right';
        }
        else {
            if (this.isDebug) console.log('showPopover: vertical centered nubbin to be used');
            if (this.isDebug) console.log('showPopover: left computed ', (targetRect.left + targetRect.right) / 2 -  200);
            this.popoverElement.style.left = Math.max(((targetRect.left + targetRect.right) / 2 -  200),0) + 'px';
            popupNubbin = 'center';
        }

        if ((targetRect.bottom + 400) < window.innerHeight) {
            if (popupNubbin === 'center') {
                if (this.isDebug) console.log('showPopover: nubbin positionned centered top ',targetRect.bottom + 25);
                this.popoverElement.style.top = (targetRect.bottom + 20) + 'px';
                popupNubbin = 'top';
            }
            else {
                if (this.isDebug) console.log('showPopover: nubbin positionned top ',targetRect.top - 25);
                this.popoverElement.style.top = (targetRect.top - 33) + 'px';
                popupNubbin += '-top';
            }
        }
        //else if ((targetRect.top - 400) > 0) {
        else {
            if (popupNubbin === 'center') {
                if (this.isDebug) console.log('showPopover: nubbin positionned centered bottom ',(window.innerHeight - targetRect.bottom - 25));
                this.popoverElement.style.bottom = (window.innerHeight - targetRect.top + 20) + 'px';
                popupNubbin = 'bottom';
            }
            else {
                if (this.isDebug) console.log('showPopover: nubbin positionned bottom', (window.innerHeight - targetRect.bottom - 25));
                this.popoverElement.style.bottom = (window.innerHeight - targetRect.bottom - 18) + 'px';
                popupNubbin += '-bottom';
            }
        }
        if (this.isDebug) console.log('showPopover: style init ',this.popoverElement.style);
        if (this.isDebug) console.log('showPopover: nubbin init ',popupNubbin);

        /*let left = clientX + 40;
        let top = clientY - 40;
        
        // Adjust if popover would go off screen
        const popoverWidth = 400; // Approximate width
        const popoverHeight = 200; // Approximate height
        
        if (left + popoverWidth > window.innerWidth) {
            left = clientX - popoverWidth - 10;
        }
        
        if (top < 0) {
            top = clientY + 10;
        }
        
        this.popoverElement.style.left = left + 'px';
        this.popoverElement.style.top = top + 'px';*/
        
        // Create the popover structure using DOM methods
        const section = document.createElement('section');
        section.className = 'slds-popover slds-popover_panel slds-nubbin_' + popupNubbin;
        section.style = 'background-color:rgb(243, 243, 243);';
        section.setAttribute('role', 'dialog');
        section.style.pointerEvents = 'auto';
        if (this.isDebug) console.log('showPopover: section class set ',section.className);

        // Create header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'slds-popover__header  ';
        // slds-theme_shade
        const header = document.createElement('header');
        header.className = 'slds-media slds-media_center slds-m-bottom_small';    
       /*const headerIcon = document.createElement('span');
        headerIcon.className = 'slds-icon_container slds-icon-standard-account slds-media__figure';
        //headerIcon.innerHTML = '<img src="https://sfpegorg-dev-ed.develop.my.salesforce.com/img/icon/t4v35/standard/account_120.png"/>';
        headerIcon.innerHTML = `
            <svg class="slds-icon slds-icon_small" aria-hidden="true">
                <use xlink:href="/assets/icons/standard-sprite/svg/symbols.svg#account"></use>
            </svg>
        `;*/

        const headerTitle = document.createElement('div');
        headerTitle.className = 'slds-media__body'
        const title = document.createElement('h2');
        title.className = 'slds-text-heading_medium slds-hyphenate slds-truncate';
        title.textContent = this.recordName;
        
        // Assemble header
        headerTitle.appendChild(title);
        //header.appendChild(headerIcon);
        header.appendChild(headerTitle);
        headerDiv.appendChild(header);
        
        // Create body with record form
        const footer = document.createElement('footer');
        footer.className = 'slds-grid slds-wrap slds-grid_pull-padded';
        headerDiv.appendChild(footer);
     
        // Create record info display
        this.createRecordForm(footer);
        
        // Assemble the complete popover
        section.appendChild(headerDiv);
        this.popoverElement.appendChild(section);
        
        // Add to document body
        document.body.appendChild(this.popoverElement);
        
        // Add event listeners to handle mouse events on the popover
        this.popoverElement.addEventListener('mouseenter', () => {
            if (this.isDebug) console.log('showPopover: mouseenter on popover');
        });
        
        this.popoverElement.addEventListener('mouseleave', () => {
            if (this.isDebug) console.log('showPopover: mouseleave on popover');
            this.hidePopover();
        });
        
        this.isHovered = true;
        if (this.isDebug) console.log('showPopover: END');
    }
    
    hidePopover() {
        if (this.isDebug) console.log('hidePopover: START');

        if (this.popoverElement && this.popoverElement.parentNode) {
            this.popoverElement.parentNode.removeChild(this.popoverElement);
            this.popoverElement = null;
        }
        
        this.isHovered = false;
        if (this.isDebug) console.log('hidePopover: END');
    }
    
    createRecordForm(container) {
        if (this.isDebug) console.log('createRecordForm: START');

        if (this.popupRecordId == null) {
            if (this.isDebug) console.log('createRecordForm: requesting compact layout data fetch');
            this.popupRecordId = this.recordId;
            this.popupContainer = container;
            if (this.isDebug) console.log('createRecordForm: END / waiting for data');
            return;
        }
        else if (this.popupLayout == null) {
            if (this.isDebug) console.log('createRecordForm: END / waiting for compact layout');
            return;
        }

        if (this.isDebug) console.log('createRecordForm: initializing compact layout data display');
        // Create a simple record info display since we can't use lightning-record-form in portal
        
        let isContentField = false;
        this.popupLayout?.sections.forEach(iterSection => {
            if (this.isDebug) console.log('createRecordForm: processing section');
            iterSection?.layoutRows.forEach(iterRow => {
                if (this.isDebug) console.log('createRecordForm: processing row');
                iterRow?.layoutItems.forEach(iterField => {
                    if (isContentField) {
                        let iterFieldApiName = '' + (iterField.layoutComponents[0]).apiName;
                        if (this.isDebug) console.log('createRecordForm: API Name extracted ',iterFieldApiName);
                        if (iterField.lookupIdApiName) {
                            if (this.isDebug) console.log('createRecordForm: processing lookup field ',iterField.label);
                            if (iterFieldApiName.endsWith('__c')) {
                                if (this.isDebug) console.log('createRecordForm: replacing __c by __r');
                                iterFieldApiName = iterFieldApiName.replace('__c','__r');
                            }
                            else {
                                if (this.isDebug) console.log('createRecordForm: removing Id at the end');
                                iterFieldApiName = iterFieldApiName.substring(0, iterFieldApiName.length - 2)
                            }
                            if (this.isDebug) console.log('createRecordForm: API Name reworked ',iterFieldApiName);
                        }
                        else {
                            if (this.isDebug) console.log('createRecordForm: processing standard field ',iterField.label);
                        }
                        const iterFieldValue = this.popupData?.fields[iterFieldApiName];
                        if (this.isDebug) console.log('createRecordForm: with value ',JSON.stringify(iterFieldValue));
    
                        if (iterFieldValue.displayValue) {
                            if (this.isDebug) console.log('createRecordForm: adding field display value ');

                            const iterFieldDiv = document.createElement('div');
                            iterFieldDiv.className = 'slds-p-horizontal_small slds-size_1-of-2 slds-p-bottom_x-small';
                            iterFieldDiv.innerHTML = `
                                <dl>
                                    <dt><p class="slds-truncate" title="${iterField.label}">${iterField.label}</p></dt>
                                    <dd><p class="slds-truncate" title="${iterFieldValue.displayValue}">${iterFieldValue.displayValue}</p></dd>
                                </dl>
                            `;
                            //slds-popover_panel__label
                            container.appendChild(iterFieldDiv);
                        }
                        else if (iterFieldValue.value != null) {
                            if (this.isDebug) console.log('createRecordForm: adding field value ');

                            let iterFieldVal = iterFieldValue.value;
                            if (typeof iterFieldVal ==='boolean') {
                                iterFieldVal = (iterFieldVal ? '☑︎' : '☐');
                            }
                            const iterFieldDiv = document.createElement('div');
                            iterFieldDiv.className = 'slds-p-horizontal_small slds-size_1-of-2 slds-p-bottom_x-small';
                            iterFieldDiv.innerHTML = `
                                <dl>
                                    <dt><p class="slds-truncate" title="${iterField.label}">${iterField.label}</p></dt>
                                    <dd><p class="slds-truncate" title="${iterFieldVal}">${iterFieldVal}</p></dd>
                                </dl>
                            `;
                            //slds-popover_panel__label
                            container.appendChild(iterFieldDiv);
                        }
                        else {
                            if (this.isDebug) console.log('createRecordForm: adding field with no value ');
                            const iterFieldDiv = document.createElement('div');
                            iterFieldDiv.className = 'slds-p-horizontal_small slds-size_1-of-2 slds-p-bottom_x-small';
                            iterFieldDiv.innerHTML = `
                                <dl>
                                    <dt><p class="slds-truncate" title="${iterField.label}">${iterField.label}</p></dt>
                                    <dd><p class="slds-truncate">&nbsp;</p></dd>
                                </dl>
                            `;
                            //slds-popover_panel__label
                            container.appendChild(iterFieldDiv);
                        }
                    }
                    else {
                        isContentField = true;
                        if (this.isDebug) console.log('createRecordForm: ignoring first field ',iterField.label);
                    }
                });
            });
        });
        if (this.isDebug) console.log('createRecordForm: END / all fields processed');        
    }
}