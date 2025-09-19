/***
* @author P-E GROS
* @date   August 2024
* @description  LWC Modal Popup Component to ask for confirmation of a
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

import CANCEL_LABEL from '@salesforce/label/c.sfpegPopupCancelLabel';
import CANCEL_TITLE from '@salesforce/label/c.sfpegPopupCancelTitle';
import CONFIRM_LABEL from '@salesforce/label/c.sfpegPopupConfirmLabel';
import CONFIRM_TITLE from '@salesforce/label/c.sfpegPopupConfirmTitle';

export default class SfpegConfirmPopupDsp extends LightningModal {
    
    //###########################################################
    // Component Properties
    //###########################################################

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api modalHeader;       // Modal header title
    @api modalMessage;      // Message displayed above the flow
    @api modalHelp;         // Help message displayed above the flow
    @api modalClass;        // CSS for the body container div

    @api isDebug = false;   // Flag to activate debug information

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    confirmLabel =  CONFIRM_LABEL;
    confirmTitle =  CONFIRM_TITLE;
    cancelLabel =   CANCEL_LABEL;
    cancelTitle =   CANCEL_TITLE;


    //###########################################################
    // Custom Getters
    //###########################################################
    

    //###########################################################
    // Initialization
    //###########################################################

    connectedCallback(){
        console.log('connected: START ConfirmPopup');
        if (this.isDebug) {
            console.log('connected: modalHeader provided ',this.modalHeader);
            console.log('connected: modalMessage provided ',this.modalMessage);
            console.log('connected: modalHelp provided ',this.modalHelp);
            console.log('connected: label provided ',this.label);
            console.log('connected: description provided ',this.description);
            console.log('connected: size provided ',this.size);
        }
        if (this.isDebug) console.log('connected: END ConfirmPopup');
    }


    //###########################################################
    // Event Handlers
    //###########################################################

    handleCancel(event){
        if (this.isDebug) console.log('handleCancel: START ConfirmPopup');
        this.close({isConfirmed: false});
        if (this.isDebug) console.log('handleCancel: END ConfirmPopup / Closing popup');
    }

    handleConfirm(event){
        if (this.isDebug) console.log('handleConfirm: START ConfirmPopup');
        this.close({isConfirmed: true});
        if (this.isDebug) console.log('handleConfirm: END ConfirmPopup / Closing popup');
    }
}