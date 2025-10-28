/***
* @author P-E GROS
* @date   Sept. 2024
* @description  LWC Modal Popup Component to to support record data display
*               sfpegAction operation.
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

import CLOSE_LABEL from '@salesforce/label/c.sfpegPopupCloseLabel';
import CLOSE_TITLE from '@salesforce/label/c.sfpegPopupCloseTitle';

export default class SfpegDisplayPopupDsp extends LightningModal {
    
    //###########################################################
    // Component Properties
    //###########################################################

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api modalHeader;       // Modal header title
    @api modalMessage;      // Message displayed above the content
    @api modalHelp;         // Help message displayed above the content
    @api modalClass;        // CSS for the body container div

    @api fields;            // Field data to display (as label, name, type JSON configs)
    @api columns;           // default number of columns
    @api nextLabel;         // Label of the next action button (if any)
    @api nextTitle;         // Title of the next action button (if any)

    @api isDebug = false;   // Flag to activate debug information

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------

    recordData; // Reworked version of the fields property for display

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    closeLabel =    CLOSE_LABEL;
    closeTitle =    CLOSE_TITLE;


    //###########################################################
    // Custom Getters
    //###########################################################
    

    //###########################################################
    // Initialization
    //###########################################################

    connectedCallback(){
        console.log('connected: START DisplayPopup');
        if (this.isDebug) {
            console.log('connected: modalHeader provided ',this.modalHeader);
            console.log('connected: modalMessage provided ',this.modalMessage);
            console.log('connected: modalHelp provided ',this.modalHelp);
            console.log('connected: label provided ',this.label);
            console.log('connected: description provided ',this.description);
            console.log('connected: size provided ',this.size);

            console.log('connected: fields provided ',JSON.stringify(this.fields));
            console.log('connected: columns provided ',this.columns);

            console.log('connected: nextLabel provided ',this.nextLabel);
            console.log('connected: nextTitle provided ',this.nextTitle);            
        }
        let defaultSize = 12 / (this.columns ?? 1);
        if (this.isDebug) console.log('connected: defaultSize computed', defaultSize);
        this.recordData = JSON.parse(JSON.stringify(this.fields));
        if (this.isDebug) console.log('connected: recordData init ',JSON.stringify(this.recordData));
        this.recordData.forEach(item => {
            item.size = item.size ?? defaultSize;
        });
        if (this.isDebug) console.log('connected: recordData reworked ',JSON.stringify(this.recordData));

        if (this.isDebug) console.log('connected: END DisplayPopup');
    }


    //###########################################################
    // Event Handlers
    //###########################################################

    handleClose(event){
        if (this.isDebug) console.log('handleClose: START DisplayPopup',event);
        this.close({doNext: false});
        if (this.isDebug) console.log('handleClose: END DisplayPopup / Closing popup');
    }

    handleNext(event){
        if (this.isDebug) console.log('handleNext: START DisplayPopup',event);
        this.close({doNext: true});
        if (this.isDebug) console.log('handleNext: END DisplayPopup / Closing popup');
    }
}