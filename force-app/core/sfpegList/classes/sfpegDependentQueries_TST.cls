/***
* @description  Test class for the sfpegDependentQueries_SVC class.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         April 2024
* @see          sfpegDependentQueries_SVC
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
@SuppressWarnings('PMD.ClassNamingConventions,PMD.FieldNamingConventions')
public class  sfpegDependentQueries_TST {

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
	* @description  Test method for the sfpegDependentQueries_SVC class, checking the "getData" method
	*               including all error cases.
	* @see          sfpegDependentQueries_SVC
	***/

	@isTest
	static void testGetData() {
		System.debug('testGetData: ##### START #####');

        List<sfpegTestObject__c> rcdList = new List<sfpegTestObject__c>();
		rcdList.add(new sfpegTestObject__c(Name='Test 1',Picklist__c='P1',MultiPicklist__c='MP1'));
        rcdList.add(new sfpegTestObject__c(Name='Test 2',Picklist__c='P1',MultiPicklist__c='MP2'));
		rcdList.add(new sfpegTestObject__c(Name='Test 3',Picklist__c='P1',MultiPicklist__c='MP1'));
		rcdList.add(new sfpegTestObject__c(Name='Test 4',Picklist__c='P2',MultiPicklist__c='MP3'));
		rcdList.add(new sfpegTestObject__c(Name='Test 6',Picklist__c='P2',MultiPicklist__c='MP1'));
        insert rcdList;
		System.debug('testGetData: test records inserted ' + rcdList);

		Test.startTest();

		// Testing Passing Cases
        Map<Object,Object> inputData = new Map<Object,Object>{'NAME' => 'Test 1', 'PL' => 'P1', 'MPL' => 'MP1'};
		System.debug('testGetData: inputData init ' + inputData);

        System.debug('testGetData: ##### TEST 1 - 2 subqueries returning data #####');
		try {
			List<Object> outputList = sfpegList_CTL.getData('sfpegTestDependentQueriesOK', (Object)inputData);
			System.debug('testGetData: returning outputList ' + outputList);
            Assert.areEqual(3,outputList.size(),'3 records should be returned when context is first record');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised when no filter/search term specified ' + e.getMessage());
			Assert.fail('No exception should be raised when no filter/search term specified');
		}

        System.debug('testGetData: ##### TEST 2 - 1 subquery returning data #####');
        inputData.put('NAME','Test 4');
        inputData.put('PL','P2');
        inputData.put('MPL','MP3');
        inputData.remove('SAME_MPL');
        inputData.remove('SAME_PL');
        System.debug('testGetData: inputData updated ' + inputData);
		try {
			List<Object> outputList = sfpegList_CTL.getData('sfpegTestDependentQueriesOK', (Object)inputData);
			System.debug('testGetData: returning outputList ' + outputList);
            Assert.areEqual(1,outputList.size(),'1 record should be returned when context is fourth record');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised when no filter/search term specified ' + e.getMessage());
			Assert.fail('No exception should be raised when no filter/search term specified');
		}

		// Error cases
        System.debug('testGetData: ##### TEST 3 - Invalid query template configuration #####');
		try {
			sfpegList_CTL.getData('sfpegTestDependentQueriesKOparse',inputData);
			System.debug(LoggingLevel.Error,'testGetData: no exception raised for invalid query template');
			Assert.fail('No exception raised for invalid query template');
		}
		catch (Exception e) {
			System.debug('testGetData: exception properly raised for invalid query template ' + e.getMessage());
		}

        System.debug('testGetData: ##### TEST 4 - Wrong SOQL query #####');
		try {
			sfpegList_CTL.getData('sfpegTestDependentQueriesKOquery',inputData);
			System.debug(LoggingLevel.Error,'testGetData: no exception raised for wrong soql statement in query template');
			Assert.fail('No exception raised for wrong SOQL statement in query template');
		}
		catch (Exception e) {
			System.debug('testGetData: error properly raised for wrong SOQL statement in query template ' + e.getMessage());
			System.assert(true);
		}

		Test.stopTest();
		System.debug('testGetData: ##### END #####');
	}

}