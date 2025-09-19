/***
* @author P-E GROS
* @date   August 2024
* @description  LWC Modal Popup Component to display a lightning record form
*               (creation or edition), and either execute the operation via LDS
*               or return the user input to the invoking sfpegActionBarCmp 
*               component for post-processing (e.g. via DML or Apex).
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

import SAVE_LABEL   from '@salesforce/label/c.sfpegPopupSaveLabel';
import SAVE_TITLE   from '@salesforce/label/c.sfpegPopupSaveTitle';
import CANCEL_LABEL from '@salesforce/label/c.sfpegPopupCancelLabel';
import CANCEL_TITLE from '@salesforce/label/c.sfpegPopupCancelTitle';
import SPINNER_MSG  from '@salesforce/label/c.sfpegPopupSpinnerMessage';

export default class SfpegFormPopupDsp extends LightningModal {
    
    //###########################################################
    // Component Properties
    //###########################################################

    //----------------------------------------------------------------
    // Main configuration fields (for App Builder)
    //----------------------------------------------------------------
    @api modalHeader;           // Modal header title
    @api modalMessage;          // Message displayed above the flow
    @api modalHelp;             // Help message displayed above the flow
    @api modalClass;            // CSS for the body container div

    @api columns = 2;           // Number of columns for field display
    @api variant = 'standard';  // Display variant
    @api record;                // Main information about the record (object, RT, ID)
    @api fields;                // List of fields to be displayed
    @api doSubmit;              // Flag to execute the default LDS operation (create or update). Otherwise form data is returned upon close.

    // Context info for picklist input variant
    @api objectApiName;
    @api recordId;
    @api userId;

    @api isDebug = false;   // Flag to activate debug information

    //----------------------------------------------------------------
    // Internal technical properties
    //----------------------------------------------------------------
    displayedFields;        // List of form fields reworked for display
    showSpinner = false;    // Boolean flag controlling the display of a spinner

    //----------------------------------------------------------------
    // Custom Labels
    //----------------------------------------------------------------
    saveLabel = SAVE_LABEL;
    saveTitle = SAVE_TITLE;
    cancelLabel = CANCEL_LABEL;
    cancelTitle = CANCEL_TITLE;
    spinnerMessage = SPINNER_MSG;


    //###########################################################
    // Custom Getters
    //###########################################################

    get recordStr() {
        return JSON.stringify(this.record);
    }
    get fieldsStr() {
        return JSON.stringify(this.fields);
    }


    //###########################################################
    // Initialization
    //###########################################################

    connectedCallback(event){
        console.log('connected: START FormPopup');

        if (this.isDebug) {
            console.log('connected: modalHeader provided ',this.modalHeader);
            console.log('connected: modalMessage provided ',this.modalMessage);
            console.log('connected: modalHelp provided ',this.modalHelp);
            console.log('connected: label provided ',this.label);
            console.log('connected: size provided ',this.size);
            console.log('connected: modalClass provided ',this.modalClass);
            console.log('connected: columns provided ',this.columns);
            console.log('connected: variant provided ',this.variant);

            console.log('connected: objectApiName provided ',this.objectApiName);
            console.log('connected: recordId provided ',this.recordId);
            console.log('connected: userId provided ',this.userId);

            console.log('connected: record ',JSON.stringify(this.record));
            console.log('connected: fields ',JSON.stringify(this.fields));
        }

        // Input control
        if (!this.record?.ObjectApiName) {
            console.error('connected: FormPopup END KO / Missing Object API Name in record configuration');
            throw new Error('Missing ObjectApiName property in record configuration');
        }
        else {
            if (this.isDebug) console.log('connected: Object API Name provided ', this.record?.ObjectApiName);
        }
        /*if (this.record?.Id) {
            if (this.isDebug) console.log('connected: edition mode for record ID ',this.record.Id);
        }
        else {
            if (this.isDebug) console.log('connected: creation mode (no record ID provided)');
        }*/
        if (this.isDebug) console.log('connected: record ID provided ',this.record?.Id);
        if (this.isDebug) console.log('connected: RecordType ID provided ', this.record?.RecordTypeId);
        

        // Input fields init
        if (this.isDebug) console.log('connected: columns provided ', this.columns);
        let defaultSize = (this.columns ? 12/this.columns : 12);
        if (this.isDebug) console.log('connected: defaultSize init ',defaultSize);

        this.displayedFields = [];
        this.fields.forEach(iterField => {
            if (this.isDebug) console.log('connected: processing iterField ',JSON.stringify(iterField));
            let iterFieldDesc = {
                name : iterField.name,
            };
            if (this.record[iterField.name]) {
                if (this.isDebug) console.log('connected: setting default value field ',this.record[iterField.name]);
                iterFieldDesc.value = this.record[iterField.name];
            }
            if (iterField.hidden) {
                if (this.isDebug) console.log('connected: hiding field');
                iterFieldDesc.hidden = true;
            }
            else {
                if (this.isDebug) console.log('connected: showing field ');
                if (iterField.disabled)     iterFieldDesc.disabled  = true;
                if (iterField.required)     iterFieldDesc.required  = true;
                if (iterField.dataSource)   iterFieldDesc.dataSource = iterField.dataSource;
                if (iterField.dataLabel)    iterFieldDesc.dataLabel = iterField.dataLabel;
                if (iterField.dataValue)    iterFieldDesc.dataValue = iterField.dataValue;
            }
            iterFieldDesc.size = iterField.size ?? defaultSize;
            this.displayedFields.push(iterFieldDesc);
            if (this.isDebug) console.log('connected: iterFieldDesc init ',JSON.stringify(iterFieldDesc));
        });
        if (this.isDebug) console.log('connected: displayedFields init ',JSON.stringify(this.displayedFields));

        if (this.isDebug) console.log('connected: END FormPopup');
    }

    renderedCallback(event){
        if (this.isDebug) {
            console.log('rendered: START FormPopup');
            console.log('rendered: modalHeader set ',this.modalHeader);
            console.log('rendered: modalMessage set ',this.modalMessage);
            console.log('rendered: modalHelp provided ',this.modalHelp);
            console.log('rendered: label set ',this.label);
            console.log('rendered: END FormPopup');
        }
    }


    //###########################################################
    // Event Handlers
    //###########################################################

    //----------------------------------------------------------------
    // Lookup Picklist datasource Management
    //----------------------------------------------------------------
    
    handleLoad(event){
        if (this.isDebug) console.log('handleLoad: START FormPopup with event ',event);
        //if (this.isDebug) console.log('handleLoad: load details ', JSON.stringify(event.detail));

        let picklistFields = this.template.querySelectorAll('c-sfpeg-picklist-input-dsp');
        if (this.isDebug) console.log('handleLoad: picklistFields found ',picklistFields);

        if (picklistFields?.length > 0) {
            if (this.isDebug) console.log('handleLoad: initialising picklist fields');
            picklistFields.forEach(item => {
                if (this.isDebug) console.log('handleLoad: processing picklist ', item);
                item.label = event.detail.objectInfos[this.record.ObjectApiName]?.fields[item.fieldName]?.label;
                if (this.isDebug) console.log('handleLoad: label set ', item.label);
                let itemSource = this.template.querySelector('lightning-input-field[data-field-name="' + item.fieldName + '"]');
                if (this.isDebug) console.log('handleLoad: lookup input fetched ', itemSource);
                item.value =  itemSource?.value;
                if (this.isDebug) console.log('handleLoad: value set ', item.value);
            });
            if (this.isDebug) console.log('handleLoad: picklist fields initialized');
        }
        this.toggleSpinner(false);

        if (this.isDebug) console.log('handleLoad: END FormPopup');
    }

    handlePicklistChange(event) {
        console.log('handlePicklistChange: START FormPopup with ',event);
        console.log('handlePicklistChange: details ',JSON.stringify(event.detail));

        //lightning-input-field[field-name="OwnerId"]

        let inputFieldQuery = 'lightning-input-field[data-field-name="' + event.detail.fieldName + '"]';
        console.log('handlePicklistChange: searching inputFieldQuery ',inputFieldQuery);
        let inputField = this.template.querySelector(inputFieldQuery);
        console.log('handlePicklistChange: inputField found ',inputField);

        if (inputField) {
            console.log('handleFieldChange: updating inputField to value ',event.detail.value);
            inputField.value = event.detail.value; 
        }
        console.log('handleFieldChange: END FormPopup');
    }

    //----------------------------------------------------------------
    // Main form actions
    //----------------------------------------------------------------
    handleSubmit(event){
        if (this.isDebug) console.log('handleSubmit: START FormPopup with event ',event);
        if (this.isDebug) console.log('handleSubmit: submit details ', JSON.stringify(event.detail?.fields));

        this.toggleSpinner(true);
        if (this.checkRequiredFieldsFilled()) {
            if (this.isDebug) console.log('handleSubmit: all required field set ');
            if (this.doSubmit) {
                if (this.isDebug) console.log('handleSubmit: submitting form via LDS');
                this.refs.recordForm.submit();
                if (this.isDebug) console.log('handleSubmit: END / Form submitted via LDS');
            }
            else {
                if (this.isDebug) console.log('handleSubmit: preventing submit and returning only input data');
            
                try {
                    let newRecord = this.initNewRecord();
                    if (this.isDebug) console.log('handleSubmit: newRecord data fetched ', JSON.stringify(newRecord));
            
                    this.close({status: 'submit', record: newRecord, doNext: true});
                    if (this.isDebug) console.log('handleSubmit: END FormPopup / Closing popup');
                }
                catch(error) {
                    console.warn('handleSubmit: END FormPopup KO / Submission error ', JSON.stringify(error));
                    this.toggleSpinner(false);
                }
            } 
        }
        else {
            if (this.isDebug) console.log('handleSubmit: END FormPopup KO / Missing required field(s)');
            this.toggleSpinner(false);
        }
    }
    handleFormSubmit(event){
        if (this.isDebug) console.log('handleFormSubmit: START FormPopup with event ',event);
        if (this.isDebug) console.log('handleFormSubmit: END FormPopup with fields ', JSON.stringify(event.detail?.fields));
    }

    handleCancel(event){
        if (this.isDebug) console.log('handleCancel: START FormPopup with event ',event);
        this.close({status: 'cancelled', doNext: false});
        if (this.isDebug) console.log('handleCancel: END FormPopup / component closed');    
    }

    // Submit handling
    handleError(event){
        if (this.isDebug) console.log('handleError: START FormPopup with event ',event);
        if (this.isDebug) console.log('handleError: error details ', JSON.stringify(event.detail));

        let fieldErrors = event.detail.output?.fieldErrors;
        if (fieldErrors) {
            for (let item in fieldErrors) {
                console.log('handleError: processing error on field ',item);
                console.log('handleError: with details ',fieldErrors[item]);

                let picklistFieldQuery = 'c-sfpeg-picklist-input-dsp[data-field-name="' + item + '"]';
                console.log('handleFieldChange: searching inputField ',picklistFieldQuery);
                let picklistField = this.template.querySelector(picklistFieldQuery);
                console.log('handleFieldChange: picklistField found ',picklistField);

                if (picklistField) {
                    console.log('handleFieldChange: setting error ',fieldErrors[item][0].message);
                    picklistField.setError(fieldErrors[item][0].message);
                }
            }
        }

        this.toggleSpinner(false);
        if (this.isDebug) console.log('handleError: END FormPopup');
    }

    handleSave(event){
        if (this.isDebug) console.log('handleSave: START FormPopup with event ',event);
        if (this.isDebug) console.log('handleSave: save details ', JSON.stringify(event.detail));
        if (this.isDebug) console.log('handleSave: record ', JSON.stringify(this.record));

        try {
            try {
                let newRecord = this.initNewRecord();
                if (!newRecord.Id) newRecord.Id = event.detail.id;
                if (this.isDebug) console.log('handleSave: newRecord data fetched ', JSON.stringify(newRecord));
        
                this.close({status: 'submit', record: newRecord, doNext: true});
                if (this.isDebug) console.log('handleSave: END FormPopup / Closing popup');
            }
            catch(error) {
                console.warn('handleSave: END FormPopup KO / Submission error ', JSON.stringify(error));
                this.toggleSpinner(false);
            }
        }
        catch (error) {
            console.error('handleSave: END FormPopup KO / error raised while saving ', JSON.stringify(error));
            this.toggleSpinner(false);
        }
    }


    //###########################################################
    // Utilities
    //###########################################################  

    checkRequiredFieldsFilled = function() {
        if (this.isDebug) console.log('checkRequiredFieldsFilled: START FormPopup');

        // @TODO handle picklist lookups
        let inputFields = this.template.querySelectorAll('lightning-input-field');
        if (this.isDebug) console.log('checkRequiredFieldsFilled: inputFields fetched ', JSON.stringify(inputFields));

        let isOK = true;
        if (inputFields) {
            inputFields.forEach(fieldIter => {
                if (this.isDebug) console.log('checkRequiredFieldsFilled: processing fieldName ', fieldIter.fieldName);
                fieldIter.reportValidity();
                if (this.isDebug) console.log('checkRequiredFieldsFilled: isValid? ', fieldIter.isValid);
                /*
                if (this.isDebug) console.log('checkRequiredFieldsFilled: with value  ', fieldIter.value);
                if (this.isDebug) console.log('checkRequiredFieldsFilled: required?  ', fieldIter.required);
                //if (this.isDebug) console.log('checkRequiredFieldsFilled: valid?  ', fieldIter);
                if (this.isDebug) console.log('checkRequiredFieldsFilled: null value ?  ', (fieldIter.value == null) );
                if (this.isDebug) console.log('checkRequiredFieldsFilled: empty value ?  ', (fieldIter.value === ''));
                if ((fieldIter.required) && ((fieldIter.value == null) || (fieldIter.value === ''))) {
                    // handle value removal of required input field & boolean inputs
                    // Boolean fields appear always as required !
                    console.warn('checkRequiredFieldsFilled: missing required field  ', fieldIter.fieldName);
                    isOK = false;
                    fieldIter.setErrors({'errors':[{'message':'Field is required!'}]});
                }
                */
            });
        }
        if (this.isDebug) console.log('checkRequiredFieldsFilled: END FormPopup with isOK ', isOK);
        return isOK;
    }

    initNewRecord = function() {
        if (this.isDebug) console.log('initNewRecord: START FormPopup');

        let newRecord = {...(this.record)};
        if (this.isDebug) console.log('initNewRecord: newRecord init ', JSON.stringify(newRecord));

        let inputFields = this.template.querySelectorAll('lightning-input-field');
        if (this.isDebug) console.log('initNewRecord: inputFields fetched ', inputFields);

        // @TODO handle picklist lookups
        if (inputFields) {
            inputFields.forEach(fieldIter => {
                if (this.isDebug) console.log('initNewRecord: processing fieldName ', fieldIter.fieldName);
                if (this.isDebug) console.log('initNewRecord: with value  ', fieldIter.value);
                if (this.isDebug) console.log('initNewRecord: required?  ', fieldIter.required);
                if (this.isDebug) console.log('initNewRecord: valid?  ', fieldIter);
                if ((fieldIter.required) && (fieldIter.value == null)) {
                    console.warn('initNewRecord: missing required field  ', fieldIter.fieldName);
                    fieldIter.setErrors({'errors':[{'message':'Field is required!'}]});
                    throw new Error(fieldIter.fieldName + ' required field not filled!');
                }
                newRecord[fieldIter.fieldName] = fieldIter.value;
            });
        }
        if (this.isDebug) console.log('initNewRecord: END FormPopup with newRecord ', JSON.stringify(newRecord));
        return newRecord;
    }

    toggleSpinner = function(isRunning) {
        if (this.isDebug) console.log('toggleSpinner: START FormPopup requesting spinner state ',isRunning);
        if (this.isDebug) console.log('toggleSpinner: current spinner state ',this.showSpinner);

        this.showSpinner = isRunning;
        if (this.refs?.cancelButton) this.refs.cancelButton.disabled = isRunning;
        if (this.refs?.submitButton) this.refs.submitButton.disabled = isRunning;

        if (this.isDebug) console.log('toggleSpinner: END FormPopup with spinner state',this.showSpinner);
    }
}