/***
* @author P-E GROS
* @date   Sept 2024
* @description  LWC Modal Popup Component to manage a file upload
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
import { updateRecord } from 'lightning/uiRecordApi';

import CANCEL_LABEL from '@salesforce/label/c.sfpegPopupCancelLabel';
import CANCEL_TITLE from '@salesforce/label/c.sfpegPopupCancelTitle';
import SPINNER_MSG  from '@salesforce/label/c.sfpegPopupSpinnerMessage';

export default class SfpegFilePopupDsp extends LightningModal {
    
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

    @api recordId;          // Related record for file upload
    @api fileFormats;       // Allowed file formats
    @api allowMultiple;     // Flag to allow multiple simultaneous uploads

    @api fileMetadata;      // Metadata to apply to the uploaded files

    @api isDebug = false;   // Flag to activate debug information

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------

    showSpinner = false;

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    cancelLabel =       CANCEL_LABEL;
    cancelTitle =       CANCEL_TITLE;
    spinnerMessage =    SPINNER_MSG;


    //###########################################################
    // Custom Getters
    //###########################################################
    

    //###########################################################
    // Initialization
    //###########################################################

    connectedCallback(){
        if (this.isDebug) {
            console.log('connected: START FilePopup');
            console.log('connected: modalHeader provided ',this.modalHeader);
            console.log('connected: modalMessage provided ',this.modalMessage);
            console.log('connected: modalHelp provided ',this.modalHelp);
            console.log('connected: label provided ',this.label);
            console.log('connected: description provided ',this.description);
            console.log('connected: size provided ',this.size);

            console.log('connected: recordId provided ', this.recordId);
            console.log('connected: fileFormats provided ', JSON.stringify(this.fileFormats));
            console.log('connected: allowMultiple provided ',this.allowMultiple);

            console.log('connected: fileMetadata provided ', JSON.stringify(this.fileMetadata));
            console.log('connected: END FilePopup');
        }
    }

    renderedCallback(){
        console.log('rendered: START FilePopup');
        console.log('rendered: END FilePopup');
    }


    //###########################################################
    // Event Handlers
    //###########################################################


    handleCancel(event){
        if (this.isDebug) console.log('handleCancel: START FilePopup');
        this.close({status: 'cancelled', doNext: false});
        if (this.isDebug) console.log('handleCancel: END FilePopup / Closing popup');
    }

    handleUploadStart(event) {
        if (this.isDebug) console.log('handleUploadStart: START');
        this.disableClose = true;
        if (this.isDebug) console.log('handleUploadStart: END');
    }

    handleUploadFinished(event) {
        if (this.isDebug) console.log('handleUploadFinished: START ',event);

        let uploadedFiles = event.detail?.files;
        if (this.isDebug) console.log('handleUploadFinished: #files uploaded ',uploadedFiles.length);
        if (this.isDebug) console.log('handleUploadFinished: uploaded file details ',JSON.stringify(uploadedFiles));

        if (this.fileMetadata) {
            if (this.isDebug) console.log('handleUploadFinished: applying metadata on files');
            let filePromises = [];
            uploadedFiles.forEach(item => {
                let itemUpdate = {... this.fileMetadata};
                itemUpdate.Id = item.contentVersionId;
                if (this.isDebug) console.log('handleUploadFinished: registering file update ', JSON.stringify(itemUpdate));
                filePromises.push(updateRecord({fields: itemUpdate}));
            });
            if (this.isDebug) console.log('handleUploadFinished: #metadata updates prepared ',filePromises.length);
           
            this.showSpinner = true;
            Promise.all(filePromises)
            .then((values) => {  
                if (this.isDebug) console.log('handleUploadFinished: END / Closing FilePopup after metadata update',JSON.stringify(values));
                this.disableClose = false;
                this.close({status: 'updated', doNext: true});
            }).catch((error) => {
                if (this.isDebug) console.log('handleUploadFinished: END KO / Closing FilePopup directly ',JSON.stringify(error));
                this.disableClose = false;
                this.close({status: 'error', error: error, doNext: false});
            });
            if (this.isDebug) console.log('handleUploadFinished: #metadata updates prepared ',filePromises.length);
        }
        else {
            this.disableClose = false;
            if (this.isDebug) console.log('handleUploadFinished: END / Closing FilePopup directly');
            this.close({status: 'uploaded', doNext: true});
        }
    }
}