/***
* @description  Implementation of the generic sfpegAction_SVC class for manipulation
*               of serialized JSON text fields, as used in sfpegJsonList_SVC.
*               
* @author       P-E GROS
* @date         July 2024
* @see          sfpegJsonList_SVC
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

@SuppressWarnings('PMD.ClassNamingConventions')
public with sharing class sfpegJsonAction_SVC extends sfpegAction_SVC {

    /***
    * @description  Override of the standard getdata() method to execute a query
    *               returning a single record and JSON deserialize a text field of
    *               this record as a list of objects.
    *               The name of the field to parse should be set in the FIELD
    *               property of the input context.
    *               Configuration of SOQL query is retrieved from the sfpegList 
    *               metadata triggering its execution (via the sfpegList_CTL.CONFIG
    *               static property).
    ***/
	public override Object execute(final Object input, final String method) {
		System.debug('execute: START sfpegJsonAction_SVC');
		System.debug('execute: with input ' + input);
		System.debug('execute: with method ' + method);

        // Input check
        Map<Object,Object> inputData = (Map<Object,Object>) input;
        Map<Object,Object> contextMap = (Map<Object,Object>)(inputData.get('params'));
        if (contextMap == null) {
            contextMap = inputData;
            System.debug('execute: no sub-params defined (Apex instead of apexForm action)');
        }
        System.debug('execute: context fetched ' + contextMap);

        String operation = (String)(contextMap.get('operation'));
        if (String.isBlank(operation)) {
            System.debug('execute: END sfpegJsonAction_SVC KO / no operation defined in context');
            throw new AuraHandledException('sfpegJsonAction_SVC: Missing context.operation property in configuration');
        }
        System.debug('execute: operation extracted ' + operation);

        String objectApiName = (String)(contextMap.get('objectApiName'));
        if (String.isBlank(objectApiName)) {
            System.debug('execute: END sfpegJsonAction_SVC KO / no objectApiName defined in context');
            throw new AuraHandledException('sfpegJsonAction_SVC: Missing context.objectApiName property in configuration');
        }
        System.debug('execute: objectApiName extracted ' + objectApiName);

        String fieldName = (String)(contextMap.get('fieldName'));
        if (String.isBlank(fieldName)) {
            System.debug('execute: END sfpegJsonAction_SVC KO / no fieldName defined in context');
            throw new AuraHandledException('sfpegJsonAction_SVC: Missing context.fieldName property in configuration');
        }
        System.debug('execute: fieldName extracted ' + fieldName);

        String recordId = (String)(contextMap.get('recordId'));
        if (String.isBlank(recordId)) {
            System.debug('execute: END sfpegJsonAction_SVC KO / no recordId defined in context');
            throw new AuraHandledException('sfpegJsonAction_SVC: Missing context.recordId property in configuration');
        }
        System.debug('execute: recordId extracted ' + recordId);

        String queryString = 'SELECT ' + fieldName  + ' FROM ' + objectApiName + ' WHERE Id =\'' + recordId + '\' LIMIT 1';
        System.debug('execute: queryString init ' + queryString);
        SObject recordData = database.query(queryString);
        System.debug('execute: recordData fetched ' + recordData);
        String currentValueStr = (String) recordData.get(fieldName);
        if (String.isBlank(currentValueStr)) {currentValueStr = '[]';}
        System.debug('execute: currentValueStr set ' + currentValueStr);
        List<Object> currentValue = (List<Object>) JSON.deserializeUntyped(currentValueStr);
        System.debug('execute: currentValue deserialized ' + currentValue);

        switch on operation {
            when 'add' {
                System.debug('execute: executing addition');
                Map<Object,Object> value2add = (Map<Object,Object>)(inputData.get('input'));
                System.debug('execute: value2add fetched ' + value2add);
                
                /*List<Object> currentValue = (List<Object>)(contextMap.get('value'));
                System.debug('execute: currentValue fetched ' + currentValue);
                if (currentValue == null) currentValue = new List<Object>();*/

                value2add.remove('ObjectApiName');
                value2add.put('index',currentValue.size());
                currentValue.add(value2add);
                System.debug('execute: value2add added to currentValue ' + currentValue);

                System.debug('execute: END sfpegJsonAction_SVC / updating record');
                return updateRecord(objectApiName,recordId,fieldName,currentValue);
            }	
            when 'remove' {
                System.debug('execute: executing removal');

                Integer index2rmv = Integer.valueOf((String)(contextMap.get('index')));
                System.debug('execute: index2rmv fetched ' + index2rmv);

                /*List<Object> currentValue = (List<Object>)(contextMap.get('value'));
                System.debug('execute: currentValue fetched ' + currentValue);*/

                currentValue.remove(index2rmv);
                System.debug('execute: indexed value removed ' + currentValue);

                Integer iterIndex = 0;
                for (Object iter : currentValue) {
                    Map<String,Object> iterMap = (Map<String,Object>) iter;
                    iterMap.put('index',iterIndex);
                    iterIndex++;
                }
                System.debug('execute: indexes reinit ' + currentValue);

                System.debug('execute: END sfpegJsonAction_SVC / updating record');
                return updateRecord(objectApiName,recordId,fieldName,currentValue);
            }
            when 'update' {
                System.debug('execute: executing update');

                Integer index2upd = Integer.valueOf((String)(contextMap.get('index')));
                System.debug('execute: index2upd fetched ' + index2upd);

                Map<Object,Object> value2update = (Map<Object,Object>)(inputData.get('input'));
                System.debug('execute: value2update fetched ' + value2update);
                /*List<Object> currentValue = (List<Object>)(contextMap.get('value'));
                System.debug('execute: currentValue fetched ' + currentValue);*/

                value2update.remove('ObjectApiName');
                value2update.put('index',index2upd);
                currentValue.set(index2upd,value2update);
                System.debug('execute: value2update set in currentValue ' + currentValue);

                System.debug('execute: END sfpegJsonAction_SVC / updating record');
                return updateRecord(objectApiName,recordId,fieldName,currentValue);
            }
            when else {
                System.debug('execute: END sfpegJsonAction_SVC KO / unsupported operation' + operation );
                throw new AuraHandledException('sfpegJsonAction_SVC: Unsupported operation set in configuration ' + operation);
            }
        }
	}


    //#####################################################
    // Private Utility Methods
    //#####################################################

    /***
    * @description  Private utility method to execute an update DML after having prepared the new field value.
    ***/
    private Object updateRecord(String objectApiName, String recordId, String fieldName, List<Object> newValue) {
        System.debug('updateRecord: START');
        
        Schema.SObjectType objectType = Schema.getGlobalDescribe().get(objectApiName);
        System.debug('execute: objectType fetched ' + objectType);

        SObject record2upd = objectType.newSObject(recordId);
        System.debug('execute: record2upd init ' + record2upd);

        String newValueStr = JSON.serialize(newValue);
        System.debug('updateRecord: newValue serialized ' + newValueStr);

        record2upd.put(fieldName,newValueStr);
        System.debug('execute: record2upd ready ' + record2upd);
    
        update record2upd;
        System.debug('updateRecord: END / record updated');
        return (Object)record2upd;
    }
}