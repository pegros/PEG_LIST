/***
* @description  Lightning controller to provide details about existing Action configurations.
* @author       P-E GROS
* @date         April 2021
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

@SuppressWarnings('PMD.ClassNamingConventions')
public with sharing class sfpegAction_CTL {

    /***
    * @description  Simple method to fetch configuration details for an Action component.
    *               It provides the set of actions (and menus) as well as the
    *               possible LMS notification channels to subscribe to.
    * @param        name                DeveloperName of the Action configuration record
    * @return       Object              sfpegAction__mdt record with Actions__c, NotificationChannels__c,
    *                                   MasterLabel fields filled in.
    * @exception    AuraHandledException    Raised if no configuration found for the provided name
    ***/
    @AuraEnabled(cacheable=true)
    public static Object getConfiguration(final String name) {
        System.debug(LoggingLevel.FINE,'getConfiguration: START with sfpegAction configuration name ' + name);

        List<sfpegAction__mdt> configs = [  select Actions__c, NotificationChannels__c, DoEvaluation__c, MasterLabel
                                            from sfpegAction__mdt
                                            where DeveloperName =  :name];
        if ((configs == null) || (configs.size() != 1)) {
            System.debug(LoggingLevel.ERROR,'getConfiguration: END - Missing/wrong configuration');
            throw new AuraHandledException('Configuration not found with name ' + name);
        }
        //System.debug(LoggingLevel.FINEST,'getConfiguration: END with configuration name ' + configs[0]);
        System.debug(LoggingLevel.FINE,'getConfiguration: END ' + configs[0].MasterLabel);
        return (Object) (configs[0]);
    }

    /***
    * @description  Method to execute an Apex operation.
    * @param        action  Name of the action to be executed (as an Apex class dev name or
    *                       ClassName.MethodName to trigger various logics)
    * @param        params  Context data to be provided as input to the Apex execute method.
    * @return       Object  Result of the Apex logic.
    * @exception    AuraHandledException    Raised if no configuration found for the provided name.
    ***/
    @AuraEnabled
    public static Object executeApex(final String action, final Object params) {
        System.debug(LoggingLevel.FINE,'executeAction: START with action name ' + action);
        System.debug(LoggingLevel.FINE,'executeAction: params provided ' + params);

        if (String.isEmpty(action)) {
            System.debug(LoggingLevel.WARN,'executeAction: END - No action name provided !');
            throw new AuraHandledException('No action name provided!');
        }

        String className = action;
        String methodName = null;
        if (className.contains('.')) {
            System.debug('executeAction: splitting action in class and method');
            String[] parts = className.split('\\.');
            className = parts[0];
            methodName = parts[1];
        }
        System.debug(LoggingLevel.FINEST,'executeAction: className set '  + className);
        System.debug(LoggingLevel.FINEST,'executeAction: methodName set ' + methodName);

        Type actionClass = Type.forName(className);
        if (null == actionClass) {
            System.debug(LoggingLevel.WARN,'executeAction: END - action handler not found  for ' + action);
            throw new AuraHandledException('Handler class for action ' + action + ' not found!');
        }
        System.debug('executeAction: action handler found');
        sfpegAction_SVC actionInstance = (sfpegAction_SVC) actionClass.newInstance();

        System.debug('executeAction: END - invoking handler action for class');
        return actionInstance.execute(params,methodName);
    }

    /***
    * @description  Method to execute a DML operation.
    * @param        records         List of SObject on which to execute a DML
    * @param        operation       Name of the DML operation to execute (insert, update, delet).
    * @return       List<sObject>   Same list of SObjects after the DML (e.g. with IDs after insert)
    * @exception    AuraHandledException    Raised if no configuration found for the provided name.
    ***/
    @AuraEnabled
    public static List<sObject> executeDML(list<sObject> records, string operation) {
        System.debug('executeDML : START operation ' + operation);
        System.debug('executeDML : itemList provided ' + records);

        try {
            switch on operation {
                when 'insert' {
                    insert records;
                    System.debug('executeDML : END itemList inserted ' + records);
                }
                when 'update' {
                    update records;
                    System.debug('executeDML : END itemList updated ' + records);
                }
                when 'delete' {
                    delete records;
                    System.debug('executeDML : END itemList deleted ' + records);
                }
                when else {
                    System.debug('executeDML : unsupported operation ' + operation);
                    StringException  errInvalid = new StringException();
                    errInvalid.setMessage('Unknown or unsupported operation (' + operation + ') requested!');
                    throw errInvalid;
                }
            }
            return records;
        }
        catch (Exception e) {
            System.debug(LoggingLevel.WARN, 'executeDML : END KO / returning error ' + e.getMessage());
            throw new AuraHandledException(e.getMessage());
        }
    }
}