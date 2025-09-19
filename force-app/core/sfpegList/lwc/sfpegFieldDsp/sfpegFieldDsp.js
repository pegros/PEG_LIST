/***
* @author P-E GROS
* @date   April 2021
* @description  LWC Component to display a field value in a record card (leveraging
*               the proper lightning-formated-XXX standard output component based on
*               field type).
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

import { LightningElement, api } from 'lwc';
import sfpegJsonUtl from 'c/sfpegJsonUtl';

export default class SfpegFieldDsp extends LightningElement {
 
    @api fieldType = 'text';
    @api fieldLabel = '';

    _fieldValue = {};
    // Implementation with setter to ensure proper update of display data upon fieldValue change.
    @api
    get fieldValue() {
        return this._fieldValue;
    }
    set fieldValue(value) {
        if ((this.fieldType) && (this.fieldType === "boolean")) {
            //this._fieldValue = eval(value);
            this._fieldValue = (String(value).toLowerCase() == "true");
        }
        else {
            this._fieldValue = value;
        }
    }

    // Custom getter for type dependent display
    get isBoolean() {
        return (this.fieldType) && (this.fieldType === "boolean");
    }
    get iconValue() {
        return (this.fieldValue ? 'utility:check' : 'utility:steps');
    }
    get isPhone() {
        return (this.fieldType) && (this.fieldType === "phone");
    }
    get isEmail() {
        return (this.fieldType) && (this.fieldType === "email");
    }
    get isNumber() {
        return (this.fieldType) && (this.fieldType === "number");
    }
    get isPercent() {
        return (this.fieldType) && (this.fieldType === "percent");
    }
    get percentValue() {
        return ((this.fieldValue || 0) / 100);
    }
    get isCurrency() {
        return (this.fieldType) && (this.fieldType === "currency");
    }
    get currencyCode() {
        return (sfpegJsonUtl.sfpegJsonUtl.CURRENCY_CODE);
    }
    get isDate() {
        return (this.fieldType) && (this.fieldType === "date");
    }
    get isDateTime() {
        return (this.fieldType) && (this.fieldType === "dateTime");
    }
    get isDateLocal() {
        return (this.fieldType) && (this.fieldType === "date-local");
    }
    get isRichText() {
        return (this.fieldType) && (this.fieldType === "richText");
    }
    get isDefault() {
        return (this.fieldType == null) || (this.fieldType === "text");
    }
}