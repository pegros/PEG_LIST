/***
* @description  Test class for the sfpegSearch_SVC class.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         April 2023
* @see          sfpegSearch_SVC
* @see          PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
*
* MIT License
*
* Copyright (c) 2023 pegros
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
public class  sfpegSearch_TST {

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
	* @description  Test method for the sfpegSearch_SVC class, checking the "getData" method
	*               including all error cases.
	* @see          sfpegSearch_SVC
	***/

	@isTest
	static void testGetData() {
		System.debug('testGetData: START');

        List<sfpegTestObject__c> rcdList = new List<sfpegTestObject__c>();
		rcdList.add(new sfpegTestObject__c(Name='AAA #1',Picklist__c='P1',MultiPicklist__c='MP1'));
		rcdList.add(new sfpegTestObject__c(Name='AAA #2',Picklist__c='P2',MultiPicklist__c='MP1;MP2'));
		rcdList.add(new sfpegTestObject__c(Name='AAA #3',Picklist__c='P3',MultiPicklist__c='MP2;MP3'));
		rcdList.add(new sfpegTestObject__c(Name='BBB #4',Picklist__c='P4',MultiPicklist__c='MP3;MP4'));
		rcdList.add(new sfpegTestObject__c(Name='BBB #5',Picklist__c='P5',MultiPicklist__c='MP4;MP5'));
		insert rcdList;
		System.debug('testGetData: test records inserted ' + rcdList);

		Test.startTest();

		// Testing Passing Cases
        Map<Object,Object> inputData = new Map<Object,Object>{'OBJECT' => 'sfpegTestObject__c'};
		System.debug('testGetData: inputData init ' + inputData);

        System.debug('testGetData: TEST 1 - No search term nor filter (SOQL)');
		try {
			List<Object> outputList = sfpegList_CTL.getData('sfpegTestSearch', (Object)inputData);
			System.debug('testGetData: returning outputList ' + outputList);
            Assert.areEqual(rcdList.size(),outputList.size(),'All records should be returned when no filter/search term specified');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised when no filter/search term specified ' + e.getMessage());
			Assert.fail('No exception should be raised when no filter/search term specified');
		}

        System.debug('testGetData: TEST 2 - Search term but no filter (SOSL)');
        inputData.put('term','AAA');
		try {
			List<Object> outputList = sfpegList_CTL.getData('sfpegTestSearch', (Object)inputData);
			System.debug('testGetData: returning outputList for search term only ' + outputList);
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised when only search term specified ' + e.getMessage());
			Assert.fail('No exception should be raised when correct search term but no filter specified');
		}

        System.debug('testGetData: TEST 3 - Search term and filter (SOSL)');
        //inputData.put('term','AAA');
        inputData.put('single','P1;P2');
        inputData.put('multi','MP1;MP2');
		try {
			List<Object> outputList = sfpegList_CTL.getData('sfpegTestSearch', (Object)inputData);
			System.debug('testGetData: returning outputList for search term and filter ' + outputList);
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised when search term and filter specified ' + e.getMessage());
			Assert.fail('No exception should be raised when correct search term and filter specified');
		}

        System.debug('testGetData: TEST 4 - Filter and no Search term (SOQL)');
        inputData.remove('term');
		try {
			List<Object> outputList = sfpegList_CTL.getData('sfpegTestSearch', (Object)inputData);
			System.debug('testGetData: returning outputList for filter only ' + outputList);
            //Assert.areEqual(3,outputList.size(),'All AAA records should be returned when no search term but no filter specified');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised with only filter  specified ' + e.getMessage());
			Assert.fail('No exception should be raised when with no search term but filter only specified');
		}

		// Error cases
        System.debug('testGetData: TEST 5 - Invalid query template configuration');
		try {
			sfpegList_CTL.getData('sfpegTestSearchKOparse',inputData);
			System.debug(LoggingLevel.Error,'testGetData: no exception raised for invalid query template');
			Assert.fail('No exception raised for invalid query template');
		}
		catch (Exception e) {
			System.debug('testGetData: exception properly raised for invalid query template ' + e.getMessage());
		}

        System.debug('testGetData: TEST 6 - Wrong SOQL query');
		try {
			sfpegList_CTL.getData('sfpegTestSearchKO',inputData);
			System.debug(LoggingLevel.Error,'testGetData: no exception raised for wrong soql statement in query template');
			Assert.fail('No exception raised for wrong SOQL statement in query template');
		}
		catch (Exception e) {
			System.debug('testGetData: error properly raised for wrong SOQL statement in query template ' + e.getMessage());
			System.assert(true);
		}

        System.debug('testGetData: TEST 7 - Wrong SOSL query');
        inputData.put('term','AAA');
		try {
			sfpegList_CTL.getData('sfpegTestSearchKO',inputData);
			System.debug(LoggingLevel.Error,'testGetData: no exception raised for wrong sosl statement in query template');
			Assert.fail('No exception raised for wrong SOSL statement in query template');
		}
		catch (Exception e) {
			System.debug('testGetData: error properly raised for wrong SOSL statement in query template ' + e.getMessage());
			System.assert(true);
		}

		Test.stopTest();
		System.debug('testGetData: END');
	}

}