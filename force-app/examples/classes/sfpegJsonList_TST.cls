/***
* @description  Test class for the sfpegJsonList_SVC class.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         July 2024
* @see          sfpegJsonList_SVC
* @see          PEG_LIST package (https://github.com/pegros/PEG_LIST)
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

@isTest
@SuppressWarnings('PMD.ClassNamingConventions')
public class  sfpegJsonList_TST {

    @testSetup
	static void testSetup() {
		System.debug('testSetup: START');

		String currentUserId = UserInfo.getUserId();
		System.debug('testSetup: currentUserId fetched ' + currentUserId);

		Map<ID,PermissionSet> sfpegPSets = new Map<ID,PermissionSet>([SELECT Name FROM PermissionSet WHERE Name LIKE 'sfpeg%']);
		System.debug('testSetup: sfpegPSets fetched ' + sfpegPSets);

		List<PermissionSetAssignment> currentAssignments = [	select PermissionSetId from PermissionSetAssignment
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
	* @description  Test method for the sfpegJsonList_SVC class, checking the "getData" method.
	* @see          sfpegJsonList_SVC
	***/

	@isTest
	static void testGetData() {
		System.debug('testGetData: START');

        List<sfpegTestObject__c> testRecords = new List<sfpegTestObject__c>();
        testRecords.add(new sfpegTestObject__c(Name='Empty'));
        testRecords.add(new sfpegTestObject__c(Name='Standard',TextArea__c='[{"Name":"Standard","index":0}]'));
        testRecords.add(new sfpegTestObject__c(Name='Duplicate',TextArea__c='[{"Name":"Duplicate","index":0}]'));
        testRecords.add(new sfpegTestObject__c(Name='Duplicate',TextArea__c='[{"Name":"Duplicate","index":0}]'));
        testRecords.add(new sfpegTestObject__c(Name='Invalid',TextArea__c='[{"Name":"Invalid",,""index":0}]'));
        insert testRecords;
		System.debug('testGetData: testRecords inserted ' + testRecords);

        Map<Object,Object> inputMap = new Map<Object,Object>();
        inputMap.put('FIELD','TextArea__c');
        System.debug('testGetData: inputMap init ' + inputMap);

		sfpegList__mdt jsonQueryConfig = new sfpegList__mdt(
			QuerySOQL__c = 'SELECT Name, TextArea__c FROM sfpegTestObject__c WHERE Name = \'{{{NAME}}}\''
		);
		sfpegList_CTL.CONFIG = jsonQueryConfig;
        System.debug('testGetData: sfpegList_CTL.CONFIG init ' + sfpegList_CTL.CONFIG);

        sfpegJsonList_SVC jsonSvc = new sfpegJsonList_SVC();
        System.debug('testGetData: jsonSvc init ' + jsonSvc);

		Test.startTest();

        // Passing Cases
        System.debug('testGetData: TEST 1 OK ============================== testing empty field value query');
        inputMap.put('NAME','Empty');
        System.debug('testGetData: inputMap reset ' + inputMap);
		try {
            List<Object> outputList = jsonSvc.getData((Object)inputMap,null);
            System.debug('testGetData: returning ' + outputList);
			Assert.areEqual(null,outputList,'Null field value should return null list');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: Null field value should not raise exception ' + e.getMessage());
            Assert.fail('Null field value should not raise exception');
		}

        System.debug('testGetData: TEST 2 OK ============================== testing non empty field value query');
        inputMap.put('NAME','Standard');
        System.debug('testGetData: inputMap reset ' + inputMap);
		try {
            List<Object> outputList = jsonSvc.getData((Object)inputMap,null);
            System.debug('testGetData: returning ' + outputList);
			Assert.areEqual(1,outputList.size(),'Non empty field value should return list with 1 element');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: Non empty field value should not raise exception ' + e.getMessage());
            Assert.fail('Non empty field value should not raise exception');
		}

        System.debug('testGetData: TEST 3 OK ============================== testing unknown record query');
        inputMap.put('NAME','Unknown');
        System.debug('testGetData: inputMap reset ' + inputMap);
		try {
            List<Object> outputList = jsonSvc.getData((Object)inputMap,null);
            System.debug('testGetData: returning ' + outputList);
			Assert.areEqual(null,outputList,'Unknown record value should return null list');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: Unknown record value should not raise exception ' + e.getMessage());
            Assert.fail('Unknown record value should not raise exception');
		}

		// Error Cases
        System.debug('testGetData: TEST 4 KO ============================== testing duplicate record name property');
        inputMap.put('NAME','Duplicate');
        System.debug('testGetData: inputMap reset ' + inputMap);
		try {
            List<Object> outputList = jsonSvc.getData((Object)inputMap,null);
            System.debug(LoggingLevel.Error,'testGetData: Duplicate records should raise exception');
            Assert.fail('Duplicate records should raise exception');
		}
		catch (Exception e) {
			System.debug('testGetData: Exception properly raised for Duplicate records ' + e.getMessage());
		}

		System.debug('testGetData: TEST 3 KO ============================== testing invalid JSON value');
        inputMap.put('NAME','Invalid');
        System.debug('testGetData: inputMap reset ' + inputMap);
		try {
            List<Object> outputList = jsonSvc.getData((Object)inputMap,null);
            System.debug(LoggingLevel.Error,'testGetData: invalid JSON value should raise exception');
            Assert.fail('Invalid JSON value should raise exception');
		}
		catch (Exception e) {
			System.debug('testGetData: Exception properly raised with invalid JSON value ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testGetData: END');
	}

}