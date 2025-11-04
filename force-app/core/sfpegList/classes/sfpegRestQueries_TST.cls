/***
* @description  Test class for the sfpegRestQueries_SVC class.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         Sept. 2025
* @see          sfpegRestQueries_SVC
* @see          PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
*
* MIT License
*
* Copyright (c) 2025 pegros
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
public class  sfpegRestQueries_TST {

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
	* @description  Test method for the sfpegMultiQueries_SVC class, checking the "getData" method
	*               including all error cases.
	* @see          sfpegMultiQueries_SVC
	***/

	@isTest
	static void testGetData() {
		System.debug('testGetData: START');

		Test.startTest();

		// Testing Passing Cases
        Map<Object,Object> inputData = new Map<Object,Object>{'URL' => 'www.salesforce.com'};
		System.debug('testGetData: inputData init ' + inputData);
		sfpegList_CTL.CONFIG = new sfpegList__mdt(
			DeveloperName = 'sfpegRestQueries_TEST',		
			QuerySOQL__c = '{"endPoint":"https://{{{URL}}}","header":{"Content-Type":"text/xml/json;charset=UTF-8"},"method":"GET","resultField":"records"}',
			QueryCount__c = '{"count":2,"records":[{"Name":"Name 1"},{"Name":"Name 2"}]}'
		);
		System.debug('testGetData: CONFIG init ' + sfpegList_CTL.CONFIG);
		sfpegRestQueries_SVC queryUtl = new sfpegRestQueries_SVC();
		System.debug('testGetData: queryUtl init ');

        System.debug('testGetData: TEST 1 - REST Callout returning data with result field');
		try {
			List<Object> outputList = queryUtl.getData((Object)inputData,null);
			System.debug('testGetData: returning outputList ' + outputList);
            Assert.areEqual(2,outputList.size(),'2 records should be returned when there is a result field');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised when there is a result field ' + e.getMessage());
			Assert.fail('No exception should be raised when there is a result field');
		}

		System.debug('testGetData: TEST 2 -  REST Callout returning data without result field');
		sfpegList_CTL.CONFIG.QuerySOQL__c = '{"endPoint":"test {{{CTX}}}","header":{"Content-Type":"text/xml/json;charset=UTF-8"},"method":"GET"}';
		sfpegList_CTL.CONFIG.QueryCount__c = '[{"Name":"Name 1"},{"Name":"Name 2"},{"Name":"Name 3"}]';
		System.debug('testGetData: CONFIG updated ' + sfpegList_CTL.CONFIG);
		try {
			List<Object> outputList = queryUtl.getData((Object)inputData,'test');
			System.debug('testGetData: returning outputList ' + outputList);
            Assert.areEqual(3,outputList.size(),'3 records should be returned when there is no result field');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised when there is no result field ' + e.getMessage());
			Assert.fail('No exception should be raised when there is no result field');
		}

		// Error cases
        System.debug('testGetData: TEST 3 - Invalid query template configuration');
		sfpegList_CTL.CONFIG.QuerySOQL__c = '"endPoint":"test {{{CTX}}}","header":{"Content-Type":"text/xml/json;charset=UTF-8"},"method":"GET"}';
		System.debug('testGetData: CONFIG updated ' + sfpegList_CTL.CONFIG);
		try {
			queryUtl.getData((Object)inputData,'test');
			System.debug(LoggingLevel.Error,'testGetData: no exception raised for invalid query template');
			Assert.fail('No exception raised for invalid query template');
		}
		catch (Exception e) {
			System.debug('testGetData: exception properly raised for invalid query template ' + e.getMessage());
		}

        System.debug('testGetData: TEST 4 - Missing REST parameters in configuration');
		sfpegList_CTL.CONFIG.QuerySOQL__c = '{"endPoint":"test {{{CTX}}}","header":{"Content-Type":"text/xml/json;charset=UTF-8"}}';
		System.debug('testGetData: CONFIG updated ' + sfpegList_CTL.CONFIG);
		try {
			queryUtl.getData((Object)inputData,'test');
			System.debug(LoggingLevel.Error,'testGetData: no exception raised for missing REST parameters in query template');
			Assert.fail('No exception raised for missing REST parameter in query template');
		}
		catch (Exception e) {
			System.debug('testGetData: error properly raised for missing REST parameter in query template ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testGetData: END');
	}

}