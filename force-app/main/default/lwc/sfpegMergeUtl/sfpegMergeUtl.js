/***
* @author P-E GROS
* @date   June 2021
* @description  Utility Javascript LWC component providing simple methods to manipulate
*               string templates and tokens for a context merge functionality.
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

//import { getRecord } from 'lightning/uiRecordApi';
import getConfig from '@salesforce/apex/sfpegMerge_CTL.getConfig';
import getRecord from '@salesforce/apex/sfpegMerge_CTL.getRecord';

const sfpegMergeUtl = {

    //#########################################################
    // Static variable to activate console logs on the methods 
    //#########################################################
    isDebug : false,

    //#########################################################
    // Static variable to store configuration token values
    // (i.e. tokens different from GEN, USR, RCD and ROW) 
    //#########################################################
    configMap : {},

    //###############################################################################
    // Utility method to parse a string template and extract the list of merge tokens 
    // the list of merge tokens contained (as {{{XXX.yyyyy}}} items).
    // It returns a list of JSON objects with 3 fields: the token itself, the applicable
    // domain (USR, RCD, GEN...) and the field (lats two being extracted from the token).
    //###############################################################################
    extractTokens : function(templateString,objectName) {
        if (sfpegMergeUtl.isDebug) console.log('extractTokens: START with templateString ', templateString);

        // eslint-disable-next-line no-useless-escape
        let regexp = /\{\{\{([\.\w_-]*)\}\}\}/gi;
        //console.log('parseString: regexp', regexp);
        let mergeKeys = templateString.match(regexp);
        if (sfpegMergeUtl.isDebug) console.log('extractTokens: mergeKeys extracted ', mergeKeys);

        if (! mergeKeys) {
            console.warn('extractTokens: END / no mergeKeys found');
            return {};
        }

        let resultTokens = {};
        mergeKeys.forEach(iterKey => {
            if (sfpegMergeUtl.isDebug) console.log('extractTokens: processing mergeKey',iterKey);
            let iterName = ((iterKey.replace(/\{|\}/gi,'')).trim());
            if (sfpegMergeUtl.isDebug) console.log('extractTokens: key name extracted', iterName);

            let splitIndex = iterName.indexOf('.');
            let iterDomain = iterName.slice(0, splitIndex);
            let iterField = iterName.slice(splitIndex +1);
            let iterBase = iterField;
            let iterUseLabel = false;
            if (iterField.endsWith('.LBL')) {
                iterUseLabel = true;
                iterBase = iterBase.slice(0,-4);
                iterField = iterBase + '_LBL';
                if (sfpegMergeUtl.isDebug) console.log('extractTokens: label mode set for picklist ', iterBase);
            }
            if (!resultTokens[iterDomain]) resultTokens[iterDomain] = {'tokens':[],'ldsFields':[]};

            switch (iterDomain) {
                case 'RCD' : 
                    resultTokens[iterDomain].tokens.push({
                        "token":        iterKey,
                        "field":        iterField,
                        "soqlField":    iterBase,
                        "ldsField":     objectName + '.' + iterBase,
                        "useLabel":     iterUseLabel
                    });
                    resultTokens[iterDomain].ldsFields.push(objectName + '.' + iterBase);
                    break;
                case 'USR' :
                    resultTokens[iterDomain].tokens.push({
                        "token":        iterKey,
                        "field":        iterField,
                        "soqlField":    iterBase,
                        "ldsField":     'User.' + iterBase,
                        "useLabel":     iterUseLabel
                    });
                    resultTokens[iterDomain].ldsFields.push('User.' + iterBase);
                    break;
                default:
                    resultTokens[iterDomain].tokens.push({
                        "token":        iterKey,
                        "field":        iterField
                    });
            }
        });

        if (sfpegMergeUtl.isDebug) console.log('extractTokens: END returning ', JSON.stringify(resultTokens));
        return resultTokens;
    },

    //###############################################################################
    // Utility method to provide configuration data for configuration merge tokens
    // All other tokens than USR, RCD, ROW and GEN are considered configuration.
    //###############################################################################
    getConfigData : function(tokenMap) {
        if (sfpegMergeUtl.isDebug) console.log('getConfigData: START with tokenMap ',JSON.stringify(tokenMap));

        if (sfpegMergeUtl.isDebug) console.log('getConfigData: returning promise');
        return new Promise((resolve,reject) => {
            let tokenData = {};
            let reqConfigTokens = {};
            let reqConfig = false;
            for (let iterDomain in tokenMap) {
                switch (iterDomain) {
                    case 'USR':
                    case 'RCD':
                    case 'ROW':
                    case 'CTX':
                    case 'GEN':
                        if (sfpegMergeUtl.isDebug) console.log('getConfigData: token domain ignored ',iterDomain);
                        break;
                    default:
                        if (sfpegMergeUtl.isDebug) console.log('getConfigData: processing token domain ',iterDomain);
                        tokenMap[iterDomain].tokens.forEach(iterField => {
                            if (sfpegMergeUtl.isDebug) console.log('getConfigData: processing token field ',iterField);
                            if (((sfpegMergeUtl.configMap)[iterDomain]) &&  (((sfpegMergeUtl.configMap)[iterDomain])[iterField])) {
                                if (sfpegMergeUtl.isDebug) console.log('getConfigData: token value already available');
                                if (!tokenData[iterDomain]) tokenData[iterDomain] = {};
                                (tokenData[iterDomain])[iterField] = ((sfpegMergeUtl.configMap)[iterDomain])[iterField];
                            }
                            else {
                                if (sfpegMergeUtl.isDebug) console.log('getConfigData: requesting token value ', iterField);
                                if (!reqConfigTokens[iterDomain]) reqConfigTokens[iterDomain] = [];
                                (reqConfigTokens[iterDomain]).push(iterField.field);
                                reqConfig = true;
                            }
                        });
                }
            };
            if (sfpegMergeUtl.isDebug) console.log('getConfigData: tokenData init', JSON.stringify(tokenData));
            if (sfpegMergeUtl.isDebug) console.log('getConfigData: reqConfigTokens init', JSON.stringify(reqConfigTokens));
            if (sfpegMergeUtl.isDebug) console.log('getConfigData: reqConfig init', reqConfig);

            if (reqConfig) {
                if (sfpegMergeUtl.isDebug) console.log('getConfigData: ConfigTokens requested ',JSON.stringify(reqConfigTokens));
            
                getConfig({"configMap": reqConfigTokens})
                .then((resConfigValues) => {
                    if (sfpegMergeUtl.isDebug) console.log('getConfigData: ConfigValues received ',resConfigValues);
                    for (let domainKey in resConfigValues) {
                        if (sfpegMergeUtl.isDebug) console.log('getConfigData: processing domain ',domainKey);
                        sfpegMergeUtl.configMap[domainKey] = {...(sfpegMergeUtl.configMap[domainKey]), ...(resConfigValues[domainKey])};
                        tokenData[domainKey] = {...tokenData[domainKey], ...(resConfigValues[domainKey])};
                    }
                    if (sfpegMergeUtl.isDebug) console.log('getConfigData: END returning merged data ',JSON.stringify(tokenData));
                    resolve(tokenData);
                }).catch((resError) => {
                    console.warn('getConfigData: ConfigValues fetch error received ',resError);
                    reject(resError);               
                });
                if (sfpegMergeUtl.isDebug) console.log('getConfigData: config data request sent');
            }
            else {
                if (sfpegMergeUtl.isDebug) console.log('getConfigData: END returning local data ',JSON.stringify(tokenData));
                resolve(tokenData);
            }                  
        });
    },

    //###############################################################################
    // Utility method to provide configuration data for record merge tokens
    //###############################################################################
    getRecordData : function(domain, tokenDomain, objectName, recordId, recordData) {
        if (sfpegMergeUtl.isDebug) console.log('getRecordData: START for domain ', domain);
        if (sfpegMergeUtl.isDebug) console.log('getRecordData: tokenDomain provided ',JSON.stringify(tokenDomain));
        if (sfpegMergeUtl.isDebug) console.log('getRecordData: recordId provided ',recordId);
        if (sfpegMergeUtl.isDebug) console.log('getRecordData: objectName provided ',objectName);
        if (sfpegMergeUtl.isDebug) console.log('getRecordData: recordData provided ',JSON.stringify(recordData));

        let resultData = {};
        resultData[domain]={};
        let recordFields = new Set();   // Fields missing in the provided recordData
        let queryFields = new Set();    // Same set but including possible TOLABEL() statements for picklist fields
        (tokenDomain.tokens).forEach(iterField => {
            if ((recordData) && (iterField.field in recordData)) {
                if (sfpegMergeUtl.isDebug) console.log('getRecordData: taking contextual data for field ',iterField.field);
                (resultData[domain])[iterField.field] = recordData[iterField.field];
            }
            else {
                if (sfpegMergeUtl.isDebug) console.log('getRecordData: registrating field for fetch ',iterField.field);
                //recordFields.add(iterField.field);
                recordFields.add(iterField.field);
                if (iterField.useLabel) {
                    if (sfpegMergeUtl.isDebug) console.log('getRecordData: fetching picklist labels ');
                    queryFields.add('TOLABEL(' + iterField.soqlField + ') ' + iterField.field);
                }
                else {
                    queryFields.add(iterField.field);
                }
            }
        });
        if (sfpegMergeUtl.isDebug) console.log('getRecordData: recordFields init ', JSON.stringify(Array.from(recordFields)));
        if (sfpegMergeUtl.isDebug) console.log('getRecordData: queryFields init ', JSON.stringify(Array.from(queryFields)));
        if (sfpegMergeUtl.isDebug) console.log('getRecordData: resultData init ', JSON.stringify(resultData));

        if (sfpegMergeUtl.isDebug) console.log('getRecordData: END returning promise');
        return new Promise((resolve,reject) => {
            if (recordFields.size > 0) {
                if (sfpegMergeUtl.isDebug) console.log('getRecordData: fetching recordFields ');
                
                getRecord({ "objectName": objectName,  "recordId": recordId, "fieldNames": Array.from(queryFields) })
                .then((resValues) => {
                    if (sfpegMergeUtl.isDebug) console.log('getRecordData: Record data received ',resValues);
                    (recordFields).forEach(iterField => {
                        if (sfpegMergeUtl.isDebug) console.log('getRecordData: setting field ',iterField);
                        (resultData[domain])[(iterField)] = sfpegMergeUtl.getSoqlValue(resValues, iterField);
                    });            
                    if (sfpegMergeUtl.isDebug) console.log('getRecordData: END returning data after fetch ',JSON.stringify(resultData));
                    resolve(resultData);
                }).catch(resError => {
                    console.warn('getRecordData: record Data fetch error received ',resError);
                    reject(resError);               
                });
                if (sfpegMergeUtl.isDebug) console.log('getRecordData: data requested');
            }
            else {
                if (sfpegMergeUtl.isDebug) console.log('getRecordData: END returning data directly ',JSON.stringify(resultData));
                resolve(resultData);
            }        
        });
    },

    //###############################################################################
    // Utility method to provide generic data for record merge tokens
    //###############################################################################
    getGenericData : function(tokenDomain,userId,objectName, recordId) {
        if (sfpegMergeUtl.isDebug) console.log('getGenericData: START with tokenDomain ',JSON.stringify(tokenDomain));
        if (sfpegMergeUtl.isDebug) console.log('getGenericData: recordData provided ',userId);
        if (sfpegMergeUtl.isDebug) console.log('getGenericData: objectName provided ',objectName);
        if (sfpegMergeUtl.isDebug) console.log('getGenericData: recordId provided ',recordId);

        if (sfpegMergeUtl.isDebug) console.log('getGenericData: END returning promise');
        return new Promise((resolve,reject) => {
            if (sfpegMergeUtl.isDebug) console.log('getGenericData: processing GEN tokens');

            let resultData = {};
            (tokenDomain.tokens).forEach(iterField => {
                if (sfpegMergeUtl.isDebug) console.log('getGenericData: setting field ',iterField);
                switch (iterField.field) {
                    case 'userId':
                        resultData[iterField.field] = userId;
                        break;
                    case 'objectApiName':
                        resultData[iterField.field] = objectName;
                        break;
                    case 'recordId':
                        resultData[iterField.field] = recordId;
                        break;
                    case 'now':
                        resultData[iterField.field] = (new Date()).toISOString();
                        break;
                    case 'today':
                        //resultData[iterField.field] = (new Date()).toLocaleDateString();
                        resultData[iterField.field] = (new Date()).toISOString().substring(0,10);
                        break;
                    case 'todayLocal':
                        resultData[iterField.field] = (new Date()).toLocaleDateString();
                        break;
                    case 'yesterday':
                        //resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() - 1))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() - 1))).toISOString().substring(0,10);
                        break;
                    case 'yesterdayLocal':
                        resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() - 1))).toLocaleDateString();
                        break;
                    case 'tomorrow':
                        //resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() + 1))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() + 1))).toISOString().substring(0,10);
                        break;
                    case 'tomorrowLocal':
                        //resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() + 1))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() + 1))).toLocaleDateString();
                        break;
                    case 'lastWeek':
                        //resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() - 7))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() - 7))).toISOString().substring(0,10);
                        break;
                    case 'lastWeekLocal':
                        resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() - 7))).toLocaleDateString();
                        break;
                    case 'nextWeek':
                        //resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() + 7))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() + 7))).toISOString().substring(0,10);
                        break;
                    case 'nextWeekLocal':
                        resultData[iterField.field] = (new Date(new Date().setDate(new Date().getDate() + 7))).toLocaleDateString();
                        break;
                    case 'lastMonth':
                        //resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() - 1))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() - 1))).toISOString().substring(0,10);
                        break;
                    case 'lastMonthLocal':
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() - 1))).toLocaleDateString();
                        break;
                    case 'nextMonth':
                        //resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() + 1))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() + 1))).toISOString().substring(0,10);
                        break;
                    case 'nextMonthLocal':
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() + 1))).toLocaleDateString();
                        break;
                    case 'lastQuarter':
                        //resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() - 3))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() - 3))).toISOString().substring(0,10);
                        break;
                    case 'lastQuarterLocal':
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() - 3))).toLocaleDateString();
                        break;
                    case 'nextQuarter':
                        //resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() + 3))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() + 3))).toISOString().substring(0,10);
                        break;
                    case 'nextQuarterLocal':
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() + 3))).toLocaleDateString();
                        break;
                    case 'lastYear':
                        //resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() - 12))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() - 12))).toISOString().substring(0,10);
                        break;
                    case 'lastYearLocal':
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() - 12))).toLocaleDateString();
                        break;
                    case 'nextYear':
                        //resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() + 12))).toLocaleDateString();
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() + 12))).toISOString().substring(0,10);
                        break;
                    case 'nextYearLocal':
                        resultData[iterField.field] = (new Date(new Date().setMonth(new Date().getMonth() + 12))).toLocaleDateString();
                        break;
                    default:
                        console.warn('getGenericData: unsupported field ',iterField.field);
                }
            });
            if (sfpegMergeUtl.isDebug) console.log('getGenericData: END returning ',JSON.stringify(resultData));
            resolve({'GEN':resultData});
        });
    },

    //#########################################################
    // Utility method to aggregate contextual token data records
    // returned by the different get... promises (newrecordList) 
    // within a single base JSON object (baseRecord).
    // The ROW tokens are not included (they are not fetched via
    // promises) and should be added separately.
    //#########################################################
    aggregateData : function(baseRecord, newRecordList) {
        if (sfpegMergeUtl.isDebug) console.log('aggregateData: START with base ',JSON.stringify(baseRecord));
        if (sfpegMergeUtl.isDebug) console.log('aggregateData: adding new data ',JSON.stringify(newRecordList));

        newRecordList.forEach(iterValues => {
            if (sfpegMergeUtl.isDebug) console.log('aggregateData: aggregating ',JSON.stringify(iterValues));
            for (let iterDomain in iterValues) {
                if (sfpegMergeUtl.isDebug) console.log('aggregateData: aggregating domain ',iterDomain);
                baseRecord[iterDomain] = Object.assign(baseRecord[iterDomain] || {},iterValues[iterDomain]);
            }
        });
        if (sfpegMergeUtl.isDebug) console.log('aggregateData: END with ',JSON.stringify(baseRecord));
        return baseRecord;
    },

    //#########################################################
    // Utility method to replace tokens in a template by
    // corresponding contextual data.
    //#########################################################
    setTokenValues : function(template, tokenMap, tokenDataMap) {
        if (sfpegMergeUtl.isDebug) console.log('setTokenValues: START with template ',template);
        if (sfpegMergeUtl.isDebug) console.log('setTokenValues: tokens provided ',JSON.stringify(tokenMap));
        if (sfpegMergeUtl.isDebug) console.log('setTokenValues: token Data ',JSON.stringify(tokenDataMap));

        let mergedTemplate = template;
        for (let iterDomain in tokenMap) {
            if (tokenDataMap[iterDomain]) {
                if (sfpegMergeUtl.isDebug) console.log('setTokenValues: merging domain ',iterDomain);

                (tokenMap[iterDomain]).tokens.forEach(iterField => {
                    if (sfpegMergeUtl.isDebug) console.log('setTokenValues: merging field ',iterField.field);

                    let iterValue = tokenDataMap[iterDomain][iterField.field];
                    if (sfpegMergeUtl.isDebug) console.log('setTokenValues: field value fetched ',iterValue);

                    let iterRegex = new RegExp(iterField.token, 'g');
                    if ((iterValue !== undefined) && (iterValue !== null))  {
                        mergedTemplate = mergedTemplate.replace(iterRegex,iterValue);
                        if (sfpegMergeUtl.isDebug) console.log('setTokenValues: merge done on token ',iterField.token);
                    }
                    else {
                        if (sfpegMergeUtl.isDebug) console.log('setTokenValues: empty/null value to merge');
                        mergedTemplate = mergedTemplate.replace(iterRegex,'');
                        if (sfpegMergeUtl.isDebug) console.log('setTokenValues: merge done on token ',iterField.token)
                    }               
                });
            }
            else {
                console.warn('setTokenValues: ignoring domain (no data provided) ',iterDomain);
            }
        }

        if (sfpegMergeUtl.isDebug) console.log('setTokenValues: END OK - returning ',mergedTemplate);
        return mergedTemplate;
    },

    //#########################################################
    // Utility method to convert data fetched via @wire LDS data
    // within a JSON object usable for token merge (similar to
    // a SOQL result record).
    //#########################################################
    convertLdsData : function(ldsData,tokenDomain) {
        if (sfpegMergeUtl.isDebug) console.log('convertLdsData: START with ', JSON.stringify(ldsData));
        if (sfpegMergeUtl.isDebug) console.log('convertLdsData: tokenList provided ', JSON.stringify(tokenDomain));

        let tokenData = {};
        tokenDomain.tokens.forEach(iterField => {
            if (sfpegMergeUtl.isDebug) console.log('convertLdsData: processing field ', JSON.stringify(iterField));
            //if (sfpegMergeUtl.isDebug) console.log('convertLdsData: providing ', JSON.stringify(ldsData.fields));
            tokenData[iterField.field] = sfpegMergeUtl.getLdsValue(ldsData.fields, iterField.soqlField, iterField.useLabel);
        });
        if (sfpegMergeUtl.isDebug) console.log('convertLdsData: END with ', JSON.stringify(tokenData));
        return tokenData;
    },

    //#########################################################
    // Utility method to merge contextual data within a template
    // string. Tokens are extracted "on the fly" and all necessary
    // user and record data fetched if not already provided.
    // It simply calls "extractTokens" method before "mergeTokens".
    //#########################################################
    mergeString : function(templateString, userId, userData, objectName, recordId, recordData, rowData) {
        if (sfpegMergeUtl.isDebug) console.log('mergeString: START with templateString ',templateString);

        if (!(templateString.includes('{{{'))) {
            if (sfpegMergeUtl.isDebug) console.log('mergeString: END returning no-merge promise ');
            return new Promise((resolve,reject) => {
                if (sfpegMergeUtl.isDebug) console.log('mergeString: promise END returning initial ');
                resolve(templateString);
            });
        }

        let tokenMap = sfpegMergeUtl.parseString(templateString,objectName);
        if (sfpegMergeUtl.isDebug) console.log('mergeString: tokens extracted ',JSON.stringify(tokenMap));

        if (sfpegMergeUtl.isDebug) console.log('mergeString: END triggering token merge ');
        return sfpegMergeUtl.mergeTokens(templateString, tokenMap, userId, userData, objectName, recordId, recordData, rowData);
    },

    //#########################################################
    // Utility method to merge contextual data within a template
    // string, leveraging tokens previously extracted from the
    // template (via the parseString method).
    //#########################################################
    mergeTokens : function(templateString, tokenMap, userId, userData, objectName, recordId, recordData, rowData, contextData) {
        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: START with templateString ',templateString);
        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: tokenMap provided ',JSON.stringify(tokenMap));
        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: userId provided ',userId);
        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: userData provided ',JSON.stringify(userData));
        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: recordId provided ',recordId);
        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: objectName provided ',objectName);
        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: recordData provided ',JSON.stringify(recordData));
        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: rowData provided ',JSON.stringify(rowData));
        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: contextData provided ',JSON.stringify(contextData));

        if (!(templateString.includes('{{{'))) {
            if (sfpegMergeUtl.isDebug) console.log('mergeTokens: END returning no-merge promise ');
            return new Promise((resolve,reject) => {
                if (sfpegMergeUtl.isDebug) console.log('mergeTokens: promise END returning initial ');
                resolve(templateString);
            });
        }

        if (!tokenMap) {
            console.warn('mergeTokens: END KO - no tokenMap provided / returning error promise');
            return new Promise((resolve,reject) => {
                console.warn('mergeTokens: END KO - no tokenMap provided / rejecting promise');
                reject("No tokenMap provided for template string data merge!");
            });
        }

        if (sfpegMergeUtl.isDebug) console.log('mergeTokens: END returning merge execution promise');
        return new Promise((resolve,reject) => {
            if (sfpegMergeUtl.isDebug) console.log('mergeTokens: promise START');

            let valuePromises = [];
            if (tokenMap.USR) {
                if (sfpegMergeUtl.isDebug) console.log('mergeTokens: requesting USR data ');
                valuePromises.push(sfpegMergeUtl.getRecordData('USR', tokenMap.USR, 'User', userId, userData));
            }
            if (tokenMap.RCD) {
                if (sfpegMergeUtl.isDebug) console.log('mergeTokens: requesting RCD data ');
                valuePromises.push(sfpegMergeUtl.getRecordData('RCD', tokenMap.RCD, objectName, recordId, recordData));
            }
            if (tokenMap.GEN) {
                if (sfpegMergeUtl.isDebug) console.log('mergeTokens: requesting generic data ');
                valuePromises.push(sfpegMergeUtl.getGenericData(tokenMap.GEN,userId,objectName, recordId));
            }
            if (sfpegMergeUtl.isDebug) console.log('mergeTokens: requesting Config data ');
            valuePromises.push(sfpegMergeUtl.getConfigData(tokenMap));
            if (sfpegMergeUtl.isDebug) console.log('mergeTokens: all data fetch requests initialised ');

            Promise.all(valuePromises)
            .then((values) => {
                if (sfpegMergeUtl.isDebug) console.log('mergeTokens: processing completion of all merge promises  ',JSON.stringify(values));

                // @TODO add now and today
                let tokenData = {};
                /*
                    GEN : {
                        'userId': userId,
                        'objectApiName' : objectName,
                        'recordId' : recordId,
                        'now': (new Date()).toISOString(),
                        'today': (new Date()).toLocaleDateString()
                    }
                };*/
                if (rowData) tokenData.ROW = rowData;
                if (contextData) tokenData.CTX = contextData;
                if (sfpegMergeUtl.isDebug) console.log('mergeTokens: token data init ',JSON.stringify(tokenData));

                tokenData = sfpegMergeUtl.aggregateData(tokenData,values);
                if (sfpegMergeUtl.isDebug) console.log('mergeTokens: token data finalized ',JSON.stringify(tokenData));

                let mergeResult = sfpegMergeUtl.setTokenValues(templateString, tokenMap, tokenData);
                if (sfpegMergeUtl.isDebug) console.log('mergeTokens: merge done ',mergeResult);

                if (mergeResult.includes('ESCAPE(((')) {
                    if (this.isDebug) console.log('mergeTokens: escaping required ');

                    let escapeMatches = [...mergeResult.matchAll(/ESCAPE(\(\(\()(.*?)(\)\)\))/gms)];
                    if (this.isDebug) console.log('mergeTokens: escapeMatches found ',escapeMatches);
    
                    escapeMatches.forEach(matchIter => {
                        if (this.isDebug) console.log('mergeTokens: processing matchIter ',matchIter);
                        //if (this.isDebug) console.log('mergeTokens: match considered ',matchIter[0]);
                        //if (this.isDebug) console.log('mergeTokens: value considered ',matchIter[2]);
                        //if (this.isDebug) console.log('mergeTokens: submatches ',[...(matchIter[2]).matchAll(/"/g)]);
                        let newMatchValue = (matchIter[2]).replace(/"/gms,'\\"');
                        newMatchValue = (newMatchValue).replace(/[\r\n\t]/gms,' ');
                        //newMatchValue = (newMatchValue).replace(/[\r]/gms,'\\r');
                        //newMatchValue = (newMatchValue).replace(/[\n]/gms,'\\n');
                        //newMatchValue = (newMatchValue).replace(/[\t]/gms,'\\t');
                        if (this.isDebug) console.log('mergeTokens: newMatchValue ', newMatchValue);
                        mergeResult = mergeResult.replace(matchIter[0],newMatchValue);
                        //if (this.isDebug) console.log('mergeTokens: mergeResult updated ', mergeResult);
                    });
                    if (this.isDebug) console.log('finalizeDisplay: mergeResult escaped');
                }
                else {
                    if (this.isDebug) console.log('finalizeDisplay: no escaping required ');
                }

                if (sfpegMergeUtl.isDebug) console.log('mergeTokens: END OK - returning ',mergeResult);
                resolve(mergeResult);
            }).catch((error) => {
                console.warn('mergeTokens: END KO - error upon completion of all merge promises ',error);
                reject(error);
            });
        });
    },

    //#########################################################
    // Utility method to fetch the value of a field, navigating
    // through related path (parent.related.field__c) within
    // a LDS provided data structure (i.e. with 'value.fields'
    // substructures)
    //#########################################################
    getLdsValue : function (record,field, useLabel) {
        if (sfpegMergeUtl.isDebug) console.log('getLdsValue: START with field ',field);
        if (sfpegMergeUtl.isDebug) console.log('getLdsValue: record provided ',record);
        if (sfpegMergeUtl.isDebug) console.log('getLdsValue: toLabel provided ',useLabel);

        if ((field) && (record)) {
            if (field.includes('.')) {
                if (sfpegMergeUtl.isDebug) console.log('getLdsValue: processing relation field ');
                let index = field.indexOf('.');
                if (sfpegMergeUtl.isDebug) console.log('getLdsValue: index of 1st relation ',index);
                let relationField = field.substring(0,index);
                if (sfpegMergeUtl.isDebug) console.log('getLdsValue: relationField extracted ',relationField);
                let subFields = field.substring(index+1);
                if (record[relationField].value) {
                    if (sfpegMergeUtl.isDebug) console.log('getLdsValue: END - fetching next field in relation ',subFields);
                    return sfpegMergeUtl.getLdsValue(record[relationField].value.fields,subFields,useLabel);
                }
                else {
                    console.warn('getLdsValue: END - No data for next field in relation',subFields);
                    return null;
                }
            }
            else {
                if (sfpegMergeUtl.isDebug) console.log('getLdsValue: END - returning simple field ',record[field].value);
                return (useLabel ? record[field].displayValue : record[field].value);
            }
        }
        else {
            console.warn('getLdsValue: END - No field name or record provided');
            return null;
        }
    },

    //#########################################################
    // Utility method to fetch the value of a field, navigating
    // through related path (parent.related.field__c) within
    // a basic JSON structure (e.g. returned via SOQL)
    //#########################################################
    getSoqlValue : function (record,field) {
        if (sfpegMergeUtl.isDebug) console.log('getSoqlValue: START with field ',field);
        if (sfpegMergeUtl.isDebug) console.log('getSoqlValue: record provided ',record);

        if ((field) && (record)) {
            if (record[field] !== undefined) {
                if (sfpegMergeUtl.isDebug) console.log('getSoqlValue: END - returning simple field ',record[field]);
                return record[field];
            }
            else if (field.includes('.')) {
                if (sfpegMergeUtl.isDebug) console.log('getSoqlValue: processing relation field ');
                let index = field.indexOf('.');
                if (sfpegMergeUtl.isDebug) console.log('getSoqlValue: index of 1st relation ',index);
                let relationField = field.substring(0,index);
                if (sfpegMergeUtl.isDebug) console.log('getSoqlValue: relationField extracted ',relationField);
                let subFields = field.substring(index+1);
                if (sfpegMergeUtl.isDebug) console.log('getSoqlValue: END - fetching next field in relation ',subFields);
                return sfpegMergeUtl.getSoqlValue(record[relationField],subFields);
            }
            else {
                console.warn('getSoqlValue: END - returning null value (field not set) ',field);
                return null;
            }
        }
        else {
            console.warn('getSoqlValue: END - No field name or record provided');
            return null;
        }
    }

}

export { sfpegMergeUtl }