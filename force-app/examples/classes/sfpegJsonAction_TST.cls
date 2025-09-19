/***
* @description  Test class for the sfpegJsonAction_SVC class.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         July 2024
* @see          sfpegJsonAction_SVC
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
public class  sfpegJsonAction_TST {

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
	* @description  Test method for the sfpegJsonAction_SVC class, checking the "execute" method.
	* @see          sfpegJsonAction_SVC
	***/

	@isTest
	static void testExecute() {
		System.debug('testExecute: START');

        sfpegTestObject__c testRecord = new sfpegTestObject__c(Name='TEST');
        insert testRecord;
		System.debug('testExecute: testRecord inserted ' + testRecord);

        Map<Object,Object> inputMap = new Map<Object,Object>();
        Map<Object,Object> valueMap = new Map<Object,Object>();
        inputMap.put('input',valueMap);
        valueMap.put('objectApiName','sfpegTestObject__c');
        valueMap.put('name', 'testName0');
        valueMap.put('value', 'testValue0');
        System.debug('testExecute: valueMap init ' + valueMap);
        Map<Object,Object> contextMap = new Map<Object,Object>();
        inputMap.put('params',contextMap);
        contextMap.put('objectApiName','sfpegTestObject__c');
        contextMap.put('recordId', testRecord.Id);
        contextMap.put('fieldName', 'TextArea__c');
        System.debug('testExecute: contextMap init ' + contextMap);
        System.debug('testExecute: inputMap init ' + inputMap);

        sfpegJsonAction_SVC actionSvc = new sfpegJsonAction_SVC();
        System.debug('testExecute: actionSvc init ' + actionSvc);

		Test.startTest();

        // Passing Cases
        System.debug('testExecute: TEST 1 OK ============================== testing 1st addition');
        contextMap.put('operation', 'add');
        System.debug('testExecute: contextMap reset ' + contextMap);

		try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug('testExecute: returning ' + outputRcd);
			Assert.isTrue(outputRcd?.TextArea__c.contains('"index":0'),'1st addition should be registered on record JSON field');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testExecute: Correct 1st addition should not raise exception ' + e.getMessage());
            Assert.fail('Correct 1st addition should not raise exception');
		}

        System.debug('testExecute: TEST 2 OK ============================== testing 2nd addition');
        contextMap.put('operation', 'add');
        System.debug('testExecute: contextMap reset ' + contextMap);
        valueMap.put('name', 'testName1');
        valueMap.put('value', 'testValue1');
        System.debug('testExecute: valueMap reset ' + valueMap);

		try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug('testExecute: returning ' + outputRcd);
            Assert.isTrue(outputRcd?.TextArea__c.contains('"index":0'),'2nd addition should keep 1st addition on record JSON field');		
			Assert.isTrue(outputRcd?.TextArea__c.contains('"index":1'),'2nd addition should be registered on record JSON field');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testExecute: Correct 2nd addition should not raise exception ' + e.getMessage());
            Assert.fail('Correct 2nd addition should not raise exception');
		}

        System.debug('testExecute: TEST 3 OK ============================== testing update');
        contextMap.put('operation', 'update');
        contextMap.put('index', '0');
        System.debug('testExecute: contextMap reset ' + contextMap);
        valueMap.put('name', 'testNameOupd');
        valueMap.put('value', 'testValueOupd');
        System.debug('testExecute: valueMap reset ' + valueMap);

		try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug('testExecute: returning ' + outputRcd);
			Assert.isTrue(outputRcd?.TextArea__c.contains('"index":0'),'Update should keep 1st addition on record JSON field');		
			Assert.isTrue(outputRcd?.TextArea__c.contains('"index":0'),'Update should keep 2nd addition on record JSON field');		
		    Assert.isTrue(outputRcd?.TextArea__c.contains('testNameOupd'),'Update should be registered on record JSON field');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testExecute: Correct update should not raise exception ' + e.getMessage());
            Assert.fail('Correct update should not raise exception');
		}

        System.debug('testExecute: TEST 4 OK ============================== testing remove');
        contextMap.put('operation', 'remove');
        contextMap.put('index', '0');
        System.debug('testExecute: contextMap reset ' + contextMap);
        inputMap.remove('input');
        System.debug('testExecute: inputMap reset ' + inputMap);

		try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug('testExecute: returning ' + outputRcd);
            Assert.isFalse(outputRcd?.TextArea__c.contains('testName0'),'Remove should remove 1st addition on record JSON field');
            Assert.isTrue(outputRcd?.TextArea__c.contains('"index":0'),'Remove should keep and reindex 2nd addition on record JSON field');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testExecute: Correct remove should not raise exception ' + e.getMessage());
            Assert.fail('Correct remove should not raise exception');
		}

        System.debug('testExecute: TEST 4 OK ============================== testing remove as Apex');
        inputMap.remove('params');
        inputMap.put('objectApiName','sfpegTestObject__c');
        inputMap.put('recordId', testRecord.Id);
        inputMap.put('fieldName', 'TextArea__c');
        inputMap.put('index', '0');
        inputMap.put('operation', 'remove');
        System.debug('testExecute: inputMap reset ' + inputMap);

		try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug('testExecute: returning ' + outputRcd);
            Assert.isFalse(String.isBlank(outputRcd?.TextArea__c),'Direct Apex remove should remove 1st addition on record JSON field');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testExecute: Correct direct Apex remove should not raise exception ' + e.getMessage());
            Assert.fail('Correct direct Apex remove should not raise exception');
		}

		// Error Cases
        System.debug('testExecute: TEST 5 KO ============================== testing unsupported operation');
        inputMap.put('operation','DUMMY');
        System.debug('testExecute: inputMap reset ' + inputMap);
        
        try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug(LoggingLevel.Error,'testExecute: returning ' + outputRcd);
            Assert.fail('Unsupported operation property should raise exception');
		}
		catch (Exception e) {
			System.debug('testExecute: Exception properly raised with unsupported operation property' + e.getMessage());
		}
        
        System.debug('testExecute: TEST 6 KO ============================== testing missing operation property');
        inputMap.remove('operation');
        System.debug('testExecute: inputMap reset ' + inputMap);
        
        try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug(LoggingLevel.Error,'testExecute: returning ' + outputRcd);
            Assert.fail('Missing operation property should raise exception');
		}
		catch (Exception e) {
			System.debug('testExecute: Exception properly raised with missing operation property' + e.getMessage());
		}

        System.debug('testExecute: TEST 7 KO ============================== testing missing objectApiName property');
        inputMap.put('operation','remove');
        inputMap.remove('objectApiName');
        System.debug('testExecute: inputMap reset ' + inputMap);
        
        try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug(LoggingLevel.Error,'testExecute: returning ' + outputRcd);
            Assert.fail('Missing objectApiName property should raise exception');
		}
		catch (Exception e) {
			System.debug('testExecute: Exception properly raised with missing objectApiName property' + e.getMessage());
		}

        System.debug('testExecute: TEST 8 KO ============================== testing missing fieldName property');
        inputMap.put('objectApiName','sfpegTestObject__c');
        inputMap.remove('fieldName');
        System.debug('testExecute: inputMap reset ' + inputMap);
        
        try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug(LoggingLevel.Error,'testExecute: returning ' + outputRcd);
            Assert.fail('Missing fieldName property should raise exception');
		}
		catch (Exception e) {
			System.debug('testExecute: Exception properly raised with missing fieldName property' + e.getMessage());
		}

        System.debug('testExecute: TEST 9 KO ============================== testing missing recordId property');
        inputMap.put('fieldName','TextArea__c');
        inputMap.remove('recordId');
        System.debug('testExecute: inputMap reset ' + inputMap);
        
        try {
            sfpegTestObject__c outputRcd = (sfpegTestObject__c) actionSvc.execute((Object)inputMap,null);
            System.debug(LoggingLevel.Error,'testExecute: returning ' + outputRcd);
            Assert.fail('Missing recordId property should raise exception');
		}
		catch (Exception e) {
			System.debug('testExecute: Exception properly raised with missing recordId property' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testExecute: END');
	}

}