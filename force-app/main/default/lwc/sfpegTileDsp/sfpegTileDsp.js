/***
* @author P-E GROS
* @date   April 2021
* @description  LWC Component to display a record card/tile (for record list component in tile/card mode).
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

import { LightningElement, api, track} from 'lwc';
import sfpegJsonUtl from 'c/sfpegJsonUtl';

export default class SfpegTileDsp extends LightningElement {
    // Main configuration fields
    @api displayType;           // Card display type
    @api configDetails;         // Card display configuration

    // Implementation with setter to ensure proper update of display data upon recordData change.    
    _recordData = {}; // Internal storage of record data
    @api
    get recordData() {
        return this._recordData;
    }
    set recordData(value) {
        //if (this.isDebug) console.log('setRecordData: START set ');
        //this.setAttribute('recordData', value);
        this._recordData = value;
        //if (this.isDebug) console.log('setRecordData: _recordData updated ', this._recordData);
        this.resetDisplayData();
        //if (this.isDebug) console.log('setRecordData: END set ');
    }

    @api isDebug = false;       // Debug mode activation

    // Internal technical fields
    @track isReady = false;      // Flag to control the initilisation fo the component
    @track cardIcon = null;      // Displayed icon name (if any)
    @track cardIconSize = 'small'; // Displayed icon size (if any)
    @track cardIconVariant;     // Displayed icon size (if any)
    @track cardIconValue;       // Display Icon value (for dynamic icons)
    @track cardTitle = null;    // Displayed title (if any)
    @track cardTitleLabel = null // Displayed title on hover label
    @track cardData = [];       // Displayed field data (if any)
    @track cardMenu = [];       // Displayed menu (if any) - includes evaluation of disabled property

    // Custom getter
    get isCard() {
        return (this.displayType) && (this.displayType === "CardList");
    }
    get isTile() {
        return (this.displayType) && (this.displayType === "TileList");
    }
    get hasIcon() {
        return (this.cardIcon != null);
    }
    get fieldClass() {
        let detailClass = "slds-col slds-form-element slds-size_1-of-" + (this.configDetails.fieldNbr || "1")
                        + (this.configDetails.stacked ? " slds-form-element_stacked" : " horizontalField slds-form-element_horizontal");
        //console.log('fieldClass: tableFieldClass --> detailClass',detailClass);
        return detailClass;
    }
    get hasActions() {
        //if (this.isDebug) console.log('hasActions: row actions ',JSON.stringify(this.configActions));
        //return (this.configActions) && (this.configActions.length > 0);
        //return (this.configDetails) && (this.configDetails.menu) && (this.configDetails.menu.length > 0);
        return (this.cardMenu) && (this.cardMenu.length > 0);
    } 
    get hasTitleLink() {
        //if (this.isDebug) console.log('hasActions: row actions ',JSON.stringify(this.configActions));
        return (this.configDetails) && (this.configDetails.title) && (this.configDetails.title.action);
    }

    // Component initialisation            
    connectedCallback() {
        if (this.isDebug) console.log('connected: START');

        if (this.isReady) {
            console.warn('connected: END / already ready');
            return;
        }

        if (this.isDebug) console.log('connected: displayType provided ', this.displayType);
        if (this.isDebug) console.log('connected: configDetails provided ', JSON.stringify(this.configDetails));
        if (this.isDebug) console.log('connected: recordData provided ', JSON.stringify(this.recordData));
        //if (this.isDebug) console.log('connected: configActions provided ', JSON.stringify(this.configActions));

        if ((!this.configDetails) || (!this.displayType)){
            console.warn('connected: END / missing configuration');
            return;
        }

        this.isReady = true;
        if (this.isDebug) console.log('connected: END');
    }

    resetDisplayData() {
        if (this.isDebug) console.log('resetDisplayData: START ');

        // Card Header initialisation
        if (this.isDebug) console.log('resetDisplayData: title provided ', JSON.stringify(this.configDetails.title));
        let titleFieldName = null;
        if (this.configDetails.title) {
            if (this.configDetails.title.fieldName) {
                if (this.isDebug) console.log('resetDisplayData: title field');
                this.cardTitle = this._recordData[this.configDetails.title.fieldName];
                this.cardTitleLabel = this.configDetails.title.label;
                titleFieldName = this.configDetails.title.fieldName;
            }
            else if (this.configDetails.title.label) {
                if (this.isDebug) console.log('resetDisplayData: title label');
                this.cardTitle = this.configDetails.title.label;
                this.cardTitleLabel = null;
            }
            else {
                console.warn('resetDisplayData: END / wrong title configuration');
                return;
            }
        }
        if (this.isDebug) console.log('resetDisplayData: card title init', this.cardTitle);

        if (this.isDebug) console.log('resetDisplayData: icon provided ', JSON.stringify(this.configDetails.icon));
        if (this.configDetails.icon) {
            this.cardIconSize = this.configDetails.icon.size || 'small';
            this.cardIconVariant = this.configDetails.icon.variant;
            if (this.configDetails.icon.name) {
                if (this.isDebug) console.log('resetDisplayData: icon label');
                this.cardIcon = this.configDetails.icon.name;
            }
            else if (this.configDetails.icon.fieldName) {
                if (this.isDebug) console.log('resetDisplayData: icon field');
                this.cardIcon = this._recordData[this.configDetails.icon.fieldName];
            }
            else {
                console.warn('connected: END / wrong icon configuration');
                return;
            }
            if ((this.configDetails.icon.value) && (this.configDetails.icon.value.fieldName)) {
                if (this.isDebug) console.log('resetDisplayData: setting icon value');
                this.cardIconValue = this._recordData[this.configDetails.icon.value.fieldName];
            }
        }
        if (this.isDebug) console.log('resetDisplayData: card icon init', this.cardIcon);

        // Card Content initialisation
        if (this.isDebug) console.log('resetDisplayData: columns provided ', JSON.stringify(this.configDetails.columns));
        if (this.configDetails.columns) {
            if (this.isDebug) console.log('resetDisplayData: initializing card data', this.configDetails.columns);
            sfpegJsonUtl.sfpegJsonUtl.isDebug = this.isDebug;
            this.cardData = [];
            this.configDetails.columns.forEach(item => {
                if (item.fieldName !== titleFieldName) {
                    if (this.isDebug) console.log('resetDisplayData: procesing item ', item);
                    if (this._recordData[item.fieldName] != null) {
                        if (this.isDebug) console.log('resetDisplayData: registering standard field ', item.fieldName);
                        this.cardData.push({
                            label: item.label,
                            value: this._recordData[item.fieldName],
                            //value: sfpegJsonUtl.sfpegJsonUtl.formatField(this._recordData[item.fieldName],item),
                            type: item.type || 'text',
                            name: item.fieldName
                        });
                    }
                    /*
                    else if ((item.fieldName).includes('.0.')) {
                        if (this.isDebug) console.log('resetDisplayData: registering list first record field ', item.fieldName);
                        let fieldPath = (item.fieldName).split('.');
                        if (this.isDebug) console.log('resetDisplayData: fieldPath set ', fieldPath);

                        let fieldValue = this._recordData;
                        fieldPath.forEach( iter => {
                            if (this.isDebug) console.log('resetDisplayData: processingg iter ', iter);
                            if (fieldValue) {
                                fieldValue = fieldValue[iter];
                            }
                            if (this.isDebug) console.log('resetDisplayData: fieldValue updated ', fieldValue);
                        });
                        if (fieldValue) {
                            this.cardData.push({
                                label: item.label,
                                value: fieldValue,
                                type: item.type || 'text',
                                name: item.fieldName
                            });
                        }
                        else {
                            if (this.isDebug) console.log('resetDisplayData: empty fieldValue ');
                        }
                    }
                    */
                    else {
                        if (this.isDebug) console.log('resetDisplayData: ignoring empty field ', item.fieldName);
                    }
                }
                else {
                    if (this.isDebug) console.log('resetDisplayData: ignoring title field ', item.fieldName);
                }
            });
            if (this.isDebug) console.log('resetDisplayData: card data init', this.cardData);  
        }
        else {
            console.warn('resetDisplayData: no card detailed content provided');
        }

        // Card Menu initialisation
        if (this.isDebug) console.log('resetDisplayData: menu provided ', JSON.stringify(this.configDetails.menu));
        if (this.configDetails.menu) {
            if (this.configDetails.isDynamicMenu) {                
                if (this.isDebug) console.log('resetDisplayData: evaluating dynamic menu ');
                let newMenu = [];
                (this.configDetails.menu).forEach(iterItem => {
                    if (this.isDebug) console.log('resetDisplayData: processing item ',iterItem.label);
                    let newItem = {...iterItem};
                    if (iterItem.disabled) {
                        if (iterItem.disabled.fieldName) {
                            if (this.isDebug) console.log('resetDisplayData: setting dynamic disabled value ');
                            newItem.disabled = this._recordData[(iterItem.disabled.fieldName)];
                        }
                        else {
                            if (this.isDebug) console.log('resetDisplayData: setting static disabled value ');
                            newItem.disabled = eval(iterItem.disabled);
                        }
                    }
                    newMenu.push(newItem);
                });
                this.cardMenu = newMenu;
                if (this.isDebug) console.log('resetDisplayData: dynamic menu evaluated ',JSON.stringify(this.cardMenu));
            }
            else {
                if (this.isDebug) console.log('resetDisplayData: using configured static menu as-is');
                this.cardMenu = this.configDetails.menu;
            }
        }
        else {
            console.warn('resetDisplayData: no card menu');
        }


        if (this.isDebug) console.log('resetDisplayData: END ');
    }

    renderedCallback() {
        if (this.isDebug) console.log('rendered: START with ', JSON.stringify(this.recordData));
        if (this.isDebug) console.log('rendered: END with ', JSON.stringify(this.cardData));
    }

    // Event handlers
    handleActionSelect(event) {
        if (this.isDebug) console.log('handleActionSelect: START with ',JSON.stringify(event.detail));

        let actionEvent = new CustomEvent('rowaction', { detail: {row : this._recordData, action: event.detail.value }});
        if (this.isDebug) console.log('handleActionSelect: actionEvent prepared',JSON.stringify(actionEvent));

        this.dispatchEvent(actionEvent);
        if (this.isDebug) console.log('handleActionSelect: END');
    }

    handleTitleLink(event) {
        if (this.isDebug) console.log('handleTitleLink: START with ',event);
        if (this.isDebug) console.log('handleTitleLink: action name fetched ',this.configDetails.title.action);

        /*let titleAction = this.configActions.find(item => item.name === this.configDetails.title.action);
        if (titleAction) {
            if (this.isDebug) console.log('handleActionSelect: action found',JSON.stringify(titleAction));

            let actionEvent = new CustomEvent('rowaction', { detail: {row : this._recordData, action: titleAction }});
            if (this.isDebug) console.log('handleActionSelect: actionEvent prepared',JSON.stringify(actionEvent));
    
            this.dispatchEvent(actionEvent);
            if (this.isDebug) console.log('handleActionSelect: END - action triggered',this.configDetails.title.action);
        }
        else {
            console.warn('handleTitleLink: END - action name not found in config ',this.configDetails.title.action);
        }*/
        let actionEvent = new CustomEvent('rowaction', { detail: {row : this._recordData, action: {"name": this.configDetails.title.action }}});
        if (this.isDebug) console.log('handleActionSelect: actionEvent prepared',JSON.stringify(actionEvent));
    
        this.dispatchEvent(actionEvent);
        if (this.isDebug) console.log('handleActionSelect: END - action triggered',this.configDetails.title.action);
    }
}
