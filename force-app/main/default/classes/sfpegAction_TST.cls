/***
* @description Test class for the sfpegAction_CTL, sfpegAction_SVC and sfpegActionSelector_CTL classes.
* @author      P-E GROS
* @date        Sept. 2021
* @see         sfpegAction_CTL
* @see         sfpegAction_SVC
* @see         sfpegActionSelector_CTL
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

@isTest
@SuppressWarnings('PMD.ClassNamingConventions')
public class  sfpegAction_TST {

    /***
    * @description Initializes the test context.
    ***/
    @testSetup
    static void testSetup() {
        System.debug('testSetup: START');

        String currentUserId = UserInfo.getUserId();
        System.debug('testSetup: currentUserId fetched ' + currentUserId);

        Map<ID,PermissionSet> sfpegPSets = new Map<ID,PermissionSet>([SELECT Id, Name FROM PermissionSet WHERE Name LIKE 'sfpeg%']);
        System.debug('testSetup: sfpegPSets fetched ' + sfpegPSets);

        List<PermissionSetAssignment> currentAssignments = [    select PermissionSetId from PermissionSetAssignment
                                                                where AssigneeId = :currentUserId and PermissionSetId in :sfpegPSets.keySet()];
        System.debug('testSetup: currentAssignments fetched ' + currentAssignments);
        for (PermissionSetAssignment iter : currentAssignments) {
            System.debug('testSetup: removing PermissionSet ' + iter.PermissionSetId);
            sfpegPSets.remove(iter.PermissionSetId);
        }
        System.debug('testSetup: sfpegPSets revised ' + sfpegPSets);

        List<PermissionSetAssignment> newAssignments = new List<PermissionSetAssignment>();
        for (PermissionSet iter : sfpegPSets.values()) {
            System.debug('testSetup: sfpegPSets processing PSet ' + iter);
            newAssignments.add(new PermissionSetAssignment(AssigneeId = currentUserId, PermissionSetId = iter.Id));
        }
        System.debug('testSetup: newAssignments init ' + newAssignments);

        insert newAssignments;
        System.debug('testSetup: newAssignments inserted ' + newAssignments);

        System.debug('testSetup: END');
    }

    /***
    * @description  Test method for the sfpegAction_CTL class, checking the "getConfiguration" method
    *               including all error cases. Uses the standard "StandAloneEdit" metadata record to
    *               check OK case.
    * @see  sfpegAction_CTL
    ***/
    @isTest
    static void testGetConfiguration() {
        System.debug('testGetConfiguration: START');
        Test.startTest();

        try {
            sfpegAction_CTL.getConfiguration('SFPEG_DUMMY_ACTION');
            System.debug(LoggingLevel.Error,'testGetConfiguration: no exception raised for invalid action name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetConfiguration: proper exception raised for invalid action name ' + e.getMessage());
            System.assert(true);
        }

        try {
            Object actionDesc = sfpegAction_CTL.getConfiguration('sfpegOpenEdit');
            System.debug('testGetConfiguration: configuration for standard StandAloneEdit action found ' + actionDesc);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetConfiguration: configuration for standard StandAloneEdit action not found ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
		System.debug('testGetConfiguration: END');
    }


    /***
    * @description  Test method for the sfpegAction_CTL class, checking the "executeApex" method
    *               which also involves the sfpegAction_SVC class.
    * @see  sfpegAction_CTL
    * @see  sfpegAction_SVC
    ***/

    @isTest
    static void testExecuteApex() {
        System.debug('testExecuteApex: START');
        Test.startTest();

        try {
	        sfpegAction_CTL.executeApex(null, null);
            System.debug(LoggingLevel.Error,'testExecuteApex: no error raised for for missing Apex action');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testExecuteApex: error properly raised for missing Apex action ' + e.getMessage());
            System.assert(true);
        }

        try {
	        sfpegAction_CTL.executeApex('SFPEG_DUMMY_ACTION', null);
            System.debug(LoggingLevel.Error,'testExecuteApex: no error raised for for invalid Apex action');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testExecuteApex: error properly raised for invalid Apex action ' + e.getMessage());
            System.assert(true);
        }

        try {
	        sfpegAction_CTL.executeApex('sfpegActionTest_SVC.Test',null);
            System.debug('testExecuteApex: no error raised for for proper Apex action');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testExecuteApex: unexpected error raised for Apex action ' + e.getMessage());
            System.assert(false);
        }

        try {
	        sfpegAction_CTL.executeApex('sfpegAction_SVC',null);
            System.debug('testExecuteApex: no error raised for for generic Apex action');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testExecuteApex: proper error raised for generic Apex action ' + e.getMessage());
            System.assert(true);
        }

        Test.stopTest();
		System.debug('testExecuteApex: END');
    }


    /***
    * @description  Test method for the sfpegAction_CTL class, checking the "executeDML" method.
    * @see  sfpegAction_CTL
    ***/

    @isTest
    static void testExecuteDML() {
        System.debug('testExecuteDML: START');
        Test.startTest();

        /*List<sObject> rcdList = new List<sObject>();
        Task newRcd1 = new Task(Subject = 'Test', Status = 'Open', ActivityDate = date.newinstance(2021,01,01));
        rcdList.add(newRcd1);
        Task newRcd2 = new Task(Subject = 'Test2', Status = 'Open', ActivityDate = date.newinstance(2021,01,02));
        rcdList.add(newRcd2);*/

        List<sObject> rcdList = new List<sObject>();
        sfpegTestObject__c newRcd1 = new sfpegTestObject__c(Name = 'Test #1');
        rcdList.add(newRcd1);
        sfpegTestObject__c newRcd2 = new sfpegTestObject__c(Name = 'Test #2');
        rcdList.add(newRcd2);

        try {
            sfpegAction_CTL.executeDML(rcdList, 'insert');
            System.debug('testExecuteDML: insert done');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testExecuteDML: unexpected error raised on insert ' + e.getMessage());
            System.assert(false);
        }

        newRcd1.Name = 'Test #1 Updated';
        newRcd2.Name = 'Test #2 Updated';
        try {
            sfpegAction_CTL.executeDML(rcdList, 'update');
            System.debug('testExecuteDML: update done');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testExecuteDML: unexpected error raised on update ' + e.getMessage());
            System.assert(false);
        }

        try {
            sfpegAction_CTL.executeDML(rcdList, 'delete');
            System.debug('testExecuteDML: delete done');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testExecuteDML: unexpected error raised on insert ' + e.getMessage());
            System.assert(false);
        }

        try {
            sfpegAction_CTL.executeDML(rcdList, 'dummy');
            System.debug(LoggingLevel.Error,'testExecuteDML: unexpected no error raised for dummy operation');
            System.assert(false);
        }
        catch(Exception e) {
            System.debug('testExecuteDML: expected error raised for dummy  operation ' + e.getMessage());
            System.assert(true);
        }

		Test.stopTest();
		System.debug('testExecuteDML: END');
    }

    /***
    * @description Test method for th sfpegActionSelector_CTL class, checking the "getDefaultValue" method,
    *              which should always return the default "N/A" value.
    * @see sfpegActionSelector_CTL
    ***/

    @isTest
    static void testGetDefaultValue() {
        System.debug('testGetDefaultValue: START');
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Opportunity';
        System.debug('testGetDefaultValue: testContext init');

        sfpegActionSelector_CTL controller = new sfpegActionSelector_CTL(testContext);
        System.debug('testGetDefaultValue: controller init');

        VisualEditor.DataRow defVal = controller.getDefaultValue();
        System.debug('testGetDefaultValue: getDefaultValue called ' + defVal);

        System.assertEquals('N/A',defVal.getValue());

        Test.stopTest();
        System.debug('testGetDefaultValue: END');
    }

    /***
    * @description Test method for th sfpegActionSelector_CTL class, checking the "getValues" method,
    *              which should always include the default "N/A" value.
    * @see sfpegActionSelector_CTL
    ***/

    @isTest
    static void testGetValues() {
        System.debug('testGetValues: START');
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'Opportunity';
        System.debug('testGetValues: testContext init');

        sfpegActionSelector_CTL controller = new sfpegActionSelector_CTL(testContext);
        System.debug('testGetValues: controller init');

        VisualEditor.DynamicPickListRows listVal = controller.getValues();
        System.debug('testGetValues: getValues called ' + listVal);

        System.assert(listVal.size() > 0);

        Test.stopTest();
        System.debug('testGetValues: END');
    }
}