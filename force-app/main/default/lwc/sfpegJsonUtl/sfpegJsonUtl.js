/***
* @author P-E GROS
* @date   April 2021
* @description  Utility Javascript LWC component providing simple tools to manipulate
*               JSON lists.
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

import LOCALE       from '@salesforce/i18n/locale';
import CURRENCY     from '@salesforce/i18n/currency';

const sfpegJsonUtl = { 

    //#########################################################
    // Static variable to activate console logs on the methods 
    //#########################################################
    isDebug : false,

    //#########################################################
    // Formatting constants 
    //#########################################################
    CURRENCY_FMT : new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: CURRENCY,
        currencyDisplay: 'symbol'
    }),

    CURRENCY_CODE: CURRENCY,

    PERCENT_FMT : new Intl.NumberFormat(LOCALE, {style:'percent'}),

    NUMBER_FMT : new Intl.NumberFormat(LOCALE,  {style:"decimal"}),

    //#########################################################
    // Utility method to fetch the value of a field, navigating
    // through related path (parent.related.field__c)
    //#########################################################
    getField : (fieldName, recordData) => {
        if (sfpegJsonUtl.isDebug) console.log('getField: START with field',fieldName);
        if (!fieldName) {
            console.log('getField: END KO --> no field name');
            return null;
        }
        else if (recordData[fieldName]) {
            console.log('getField: END OK returning',recordData[fieldName]);
            return recordData[fieldName];
        }
        else if (fieldName.includes('.')) {
            console.log('getField: multi-part processing for ',fieldName);
            let fieldParts = fieldName.split('.',2);
            console.log('getField: fieldParts init ',fieldParts);
            if (recordData[(fieldParts[0])]) {
                console.log('getField: going down in structure',fieldParts[0]);
                return sfpegJsonUtl.getField(fieldParts[1],recordData[(fieldParts[0])]);
            }
            // eslint-disable-next-line no-else-return
            else {
                console.log('getField: END KO --> attribute not found ',fieldParts[0]);
                return null;
            }
        }
        // eslint-disable-next-line no-else-return
        else {
            console.log('getField: END KO --> value not found');
            return null;
        }
    },

    //#########################################################
    // Sorting base method for JSON list ordering
    //#########################################################
    sortBy : (field, reverse, primer) => {
        var key = primer ?
            function(x) {return primer(x[field])} :
            function(x) {return x[field]};
        //checks if the two rows should switch places
        reverse = !reverse ? 1 : -1;
        return function (a, b) {
            a = (key(a) || '');
            b = (key(b) || '');
            return reverse * ((a > b) - (b > a));
        }
    },

    //#########################################################
    // Method to "flatten" a JSON structure.
    // Very useful when handling related data in query results 
    // to display them in a datatable.
    //#########################################################
    flattenJsonObject : (jsonObject,jsonChildren) => {
        if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: START', jsonObject);
        if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: jsonChildren provided',JSON.stringify(jsonChildren));

        for (let fieldName in jsonObject) {
            if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: analysing fieldName',fieldName);
            
            if (typeof jsonObject[fieldName] == 'object'){
                if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: processing subObject', jsonObject[fieldName]);
               
                if ((jsonObject[fieldName]).constructor === [].constructor) {
                    if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: flattening list',fieldName);
                    sfpegJsonUtl.flattenJsonList(jsonObject[fieldName],jsonChildren);
                    if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: subList after flatten step 1', jsonObject[fieldName]);
                   
                    jsonObject[fieldName + '._length'] = jsonObject[fieldName].length;
                    if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: list _length added',jsonObject[fieldName].length);
                   
                    if (    (jsonChildren)  &&  (jsonChildren.includes(fieldName))  ) {
                        if (jsonObject[fieldName].length > 0) {
                            if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: replacing list field by _children ',fieldName);
                            jsonObject['_children'] = jsonObject[fieldName];
                            if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: list field replaced  by _children ',jsonObject._children);
                            jsonObject[fieldName] = null;
                            delete jsonObject[fieldName];
                            if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: _children after delete ',jsonObject['_children']);
                        }
                        else {
                            if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: removing empty list field',fieldName);
                            delete jsonObject[fieldName];
                        }
                    }
                    else {
                        if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: list field not in children',jsonChildren);
                    }
                }
                else {
                    if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: flattening subObject');
                    sfpegJsonUtl.flattenJsonObject(jsonObject[fieldName],jsonChildren);
                    if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: subObject after flatten step 1', JSON.stringify(jsonObject[fieldName]));
               
                    let removeField = true;
                    if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: analysing fields of object field ', fieldName);
                    if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: with value ', JSON.stringify(jsonObject[fieldName]));
                    for (let subFieldName in jsonObject[fieldName]) {
                        if (typeof jsonObject[fieldName][subFieldName] == 'object'){
                            if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: keeping field because of object sub-field ',subFieldName);
                            removeField = false;
                                //if (subFieldName == '' ) recordItem._children = recordItem[gridFieldName];
                                //_children working
                                /*if ((jsonChildren) && (jsonChildren.contains(subFieldName))) {
                                    if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: replacing object sub-field by _children',subFieldName);
                                    jsonObject[fieldName]['_children'] = jsonObject[fieldName][subFieldName];
                                    delete jsonObject[fieldName][subFieldName];
                                }*/
                        }
                        else {
                            if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: moving non-object sub-field',subFieldName);
                            if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: initializing field',fieldName + '.' + subFieldName);
                            jsonObject[fieldName + '.' + subFieldName] = jsonObject[fieldName][subFieldName];
                            delete jsonObject[fieldName][subFieldName];
                        }
                    }
                    if (removeField) {
                        if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: removing field',fieldName);
                        delete jsonObject[fieldName];
                    }
                    else {
                        if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: keeping field ',fieldName);
                        if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: with value ',JSON.stringify(jsonObject[fieldName]));
                    }
                }
                if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: subObject after flatten step 2',jsonObject[fieldName]);
            }
            /*else if (typeof jsonObject[fieldName] == 'boolean'){
                if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: converting boolean field',fieldName);
                jsonObject[fieldName] = jsonObject[fieldName].toString();
            }*/
            else {
                if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: ignoring standard field',fieldName);
            }
        }
        if (sfpegJsonUtl.isDebug) console.log('flattenJsonObject: END', JSON.stringify(jsonObject));
    },

    flattenJsonList : (jsonList,jsonChildren) => {
        if (sfpegJsonUtl.isDebug) console.log('flattenJsonList: START',jsonList);
        if (sfpegJsonUtl.isDebug) console.log('flattenJsonList: jsonChildren provided',JSON.stringify(jsonChildren));
        jsonList.forEach(function(listItem){
            if (sfpegJsonUtl.isDebug) console.log('flattenJsonList: analysing recordItem',listItem);
            sfpegJsonUtl.flattenJsonObject(listItem,jsonChildren);
        });
        if (sfpegJsonUtl.isDebug) console.log('flattenJsonList: END',jsonList);
        return jsonList;
    },

    //#########################################################
    // Method to transpose a JSON array (rows becoming columns)
    // Very useful when handling count() group by queries 
    //#########################################################
    transposeJson : (jsonList) => {
        if (sfpegJsonUtl.isDebug) console.log('transposeJson START',jsonList);
        
        if (! jsonList) {
            if (sfpegJsonUtl.isDebug) console.error('transposeJson bad jsonList input',jsonList);
            return null;
        }
        
        let jsonTarget = {};
        let jsonFields = new Set();
        jsonList.forEach(function(row){
            Object.keys(row).forEach(function(field){
                jsonFields.add(field);
            });
        });
        if (sfpegJsonUtl.isDebug) console.log('transposeJson jsonFields extracted',jsonFields);
        
        jsonFields.forEach(function(fieldItem) {
            jsonTarget[fieldItem] = [];
        });
        if (sfpegJsonUtl.isDebug) console.log('transposeJson jsonTarget initialized',jsonTarget);
        
        jsonList.forEach(function(jsonItem) {
            //console.log('transposeJson processing jsonItem',jsonItem);
            
            jsonFields.forEach(function(fieldItem) {
                jsonTarget[fieldItem].push(jsonItem[fieldItem]);
            });
            //console.log('transposeJson jsonTarget updated',jsonTarget);
        });

        if (sfpegJsonUtl.isDebug) console.log('transposeJson END',jsonTarget);
        return jsonTarget;
    },

    //#########################################################
    // Method to format a field value for simple text output, 
    // basedd on the datatable field formats.
    //#########################################################

    formatField : function(fieldValue,fieldDesc) {
        if (sfpegJsonUtl.isDebug) console.log('formatField: START with field ',JSON.stringify(fieldDesc));
        if (sfpegJsonUtl.isDebug) console.log('formatField: and value ',fieldValue);
    
        switch (fieldDesc.type) {
            case 'boolean':
                return (fieldValue?'☑︎':'☐');
            case 'text':
            case 'url':
            case 'phone':
            case 'email':
                return fieldValue;
                /*return '<a href="' + fieldValue + '">' + fieldValue + '</a>';
                return '<a href="tel:' + fieldValue.replace(/ /g, "") + '">' + fieldValue + '</a>';
                return '<a href="mailto:' + fieldValue + '">' + fieldValue + '</a>';*/
            case 'date':
            case 'date-local':
                return new Intl.DateTimeFormat(LOCALE).format(new Date(fieldValue));
            case 'currency':
                return this.CURRENCY_FMT.format(fieldValue);
            case 'number':
                return this.NUMBER_FMT.format(fieldValue);
            case 'percent':
                return this.PERCENT_FMT.format(fieldValue/100);
            default:
                return '' + (fieldValue || '');
        }
    },

    //#########################################################
    // Method to filter a list of JSON objects by a set of keywords,
    // analysing a single or a set of fields.
    //#########################################################

    filterRecords: function(recordList,fieldSet,filterKeys) {
        if (sfpegJsonUtl.isDebug) console.log('filterRecords: START with filterKeys ',filterKeys);
        if (sfpegJsonUtl.isDebug) console.log('filterRecords: fieldSet provided ',JSON.stringify(fieldSet));
        if (sfpegJsonUtl.isDebug) console.log('filterRecords: recordList provided ',JSON.stringify(recordList));
        
        let filteredList = [];
        if ((filterKeys) && (fieldSet) && (recordList)) {
            let filterTerms = filterKeys.toLowerCase().split(' ');
            if (sfpegJsonUtl.isDebug) console.log('filterRecords: filterTerms extracted ',filterTerms);
            recordList.forEach(iter => filteredList.push(iter));
            if (sfpegJsonUtl.isDebug) console.log('filterRecords: filteredList init ',filteredList);
            filterTerms.forEach(iterTerm => {
                if (sfpegJsonUtl.isDebug) console.log("filterRecords: processing iterTerm",iterTerm);
                if ((iterTerm) && (iterTerm.trim())) {
                    iterTerm = iterTerm.trim();
                    filteredList = filteredList.filter(function(iterRecord) {
                        if (sfpegJsonUtl.isDebug) console.log("filterRecords: processing iterRecord",JSON.stringify(iterRecord));
                        let matchFound = false;
                        fieldSet.forEach(iterField => {
                            if (sfpegJsonUtl.isDebug) console.log("filterRecords: processing iterField",iterField);
                            if (typeof iterRecord[iterField.fieldName] == 'string') {
                                if ((iterRecord[iterField.fieldName].toLowerCase()).includes(iterTerm)) matchFound = true;
                            }
                            else if (typeof iterRecord[iterField.fieldName] == 'number') {
                                if (('' + Math.round(iterRecord[iterField.fieldName])).includes(iterTerm)) matchFound = true;
                            }
                            else if (typeof iterRecord[iterField.fieldName] == 'boolean') {
                                if (('' + iterRecord[iterField.fieldName]).includes(iterTerm)) matchFound = true;
                            }
                        });
                        if (sfpegJsonUtl.isDebug) console.log("filterRecords: returning matchFound for iterRecord",matchFound);
                        return matchFound;
                    });
                }
                else {
                    if (sfpegJsonUtl.isDebug) console.log("filterRecords: ignored iterTerm",iterTerm);
                }
            });
            if (sfpegJsonUtl.isDebug) console.log("filterRecords: filteredList updated",JSON.stringify(filteredList));
        }
        else {
            if (sfpegJsonUtl.isDebug) console.log('filterRecords: no filter keys or fields provided');
            filteredList = recordList;
        }
        if (sfpegJsonUtl.isDebug) console.log('filterRecords: END');
        return filteredList;
    }
    
}

export { sfpegJsonUtl }