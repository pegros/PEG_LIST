/***
* @description  Test class for the sfpegMultiQueries_SVC class.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         Sept. 2023
* @see          sfpegMultiQueries_SVC
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
@SuppressWarnings('PMD.ClassNamingConventions,PMD.FieldNamingConventions')
public class  sfpegMultiQueries_TST {

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

        List<sfpegTestObject__c> rcdList = new List<sfpegTestObject__c>();
		rcdList.add(new sfpegTestObject__c(Name='Test 1'));
        rcdList.add(new sfpegTestObject__c(Name='Test 2'));
		rcdList.add(new sfpegTestObject__c(Name='Test 3'));
		rcdList.add(new sfpegTestObject__c(Name='Test 4'));
		rcdList.add(new sfpegTestObject__c(Name='Test 6'));
        insert rcdList;
		System.debug('testGetData: test records inserted ' + rcdList);

		Test.startTest();

		// Testing Passing Cases
        Map<Object,Object> inputData = new Map<Object,Object>{'NAME' => 'Test 3'};
		System.debug('testGetData: inputData init ' + inputData);

        System.debug('testGetData: TEST 1 - 2 queries returning data');
		try {
			List<Object> outputList = sfpegList_CTL.getData('sfpegTestMultiQueriesOK', (Object)inputData);
			System.debug('testGetData: returning outputList ' + outputList);
            Assert.areEqual(2,outputList.size(),'2 records should be returned when context is middle record');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised when 2 queries return data' + e.getMessage());
			Assert.fail('No exception should be raised when 2 queries return data');
		}

        System.debug('testGetData: TEST 2 - 2 queries with only 1 returning data');
        inputData.put('NAME','Test 1');
		try {
			List<Object> outputList = sfpegList_CTL.getData('sfpegTestMultiQueriesOK', (Object)inputData);
			System.debug('testGetData: returning outputList ' + outputList);
            Assert.areEqual(1,outputList.size(),'1 record should be returned when context is middle record');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: exception raised when 1 of 2 queries returns no data ' + e.getMessage());
			Assert.fail('No exception should be raised when 1 of 2 queries returns no data');
		}

		// Error cases
        System.debug('testGetData: TEST 3 - Invalid query template configuration');
		try {
			sfpegList_CTL.getData('sfpegTestMultiQueriesKOparse',inputData);
			System.debug(LoggingLevel.Error,'testGetData: no exception raised for invalid query template');
			Assert.fail('No exception raised for invalid query template');
		}
		catch (Exception e) {
			System.debug('testGetData: exception properly raised for invalid query template ' + e.getMessage());
		}

        System.debug('testGetData: TEST 4 - Wrong SOQL query');
		try {
			sfpegList_CTL.getData('sfpegTestMultiQueriesKOquery',inputData);
			System.debug(LoggingLevel.Error,'testGetData: no exception raised for wrong soql statement in query template');
			Assert.fail('No exception raised for wrong SOQL statement in query template');
		}
		catch (Exception e) {
			System.debug('testGetData: error properly raised for wrong SOQL statement in query template ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testGetData: END');
	}


	/***
	* @description  Test method for the getData() sort path: verifies that QueryOrderBy__c / QueryOrder__c
	*               are applied to the merged result list.
	* @see          sfpegMultiQueries_SVC
	***/
	@isTest
	static void testGetDataSort() {
		System.debug('testGetDataSort: START');

		List<sfpegTestObject__c> rcdList = new List<sfpegTestObject__c>();
		rcdList.add(new sfpegTestObject__c(Name='Test 1'));
		rcdList.add(new sfpegTestObject__c(Name='Test 2'));
		rcdList.add(new sfpegTestObject__c(Name='Test 3'));
		insert rcdList;
		System.debug('testGetDataSort: test records inserted ' + rcdList);

		Test.startTest();

		Map<Object,Object> inputData = new Map<Object,Object>();

		System.debug('testGetDataSort: TEST 1 - DESC sort on Name');
		try {
			List<Object> outputList = sfpegList_CTL.getData('sfpegTestMultiQueriesSort', (Object)inputData);
			System.debug('testGetDataSort: returning outputList ' + outputList);
			Assert.areEqual(3, outputList.size(), '3 records should be returned');
			String first = (String)((Map<String,Object>)outputList[0]).get('Name');
			String last  = (String)((Map<String,Object>)outputList[2]).get('Name');
			Assert.isTrue(first >= last, 'Results should be sorted DESC by Name');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetDataSort: unexpected exception ' + e.getMessage());
			Assert.fail('No exception should be raised for sort configuration');
		}

		Test.stopTest();
		System.debug('testGetDataSort: END');
	}


	/***
	* @description  Unit tests for the FieldComparator inner class, covering all supported
	*               value types and null handling.
	* @see          sfpegMultiQueries_SVC.FieldComparator
	***/
	@isTest
	static void testFieldComparator() {
		System.debug('testFieldComparator: START');

		Test.startTest();

		// String — ASC
		System.debug('testFieldComparator: TEST 1 - String ASC');
		sfpegMultiQueries_SVC.FieldComparator ascComp = new sfpegMultiQueries_SVC.FieldComparator('val', 'ASC');
		Map<String,Object> recA = new Map<String,Object>{'val' => 'apple'};
		Map<String,Object> recB = new Map<String,Object>{'val' => 'banana'};
		Assert.isTrue(ascComp.compare(recA, recB) < 0, 'apple should sort before banana ASC');
		Assert.isTrue(ascComp.compare(recB, recA) > 0, 'banana should sort after apple ASC');
		Assert.areEqual(0, ascComp.compare(recA, recA), 'equal values should return 0');

		// String — DESC
		System.debug('testFieldComparator: TEST 2 - String DESC');
		sfpegMultiQueries_SVC.FieldComparator descComp = new sfpegMultiQueries_SVC.FieldComparator('val', 'DESC');
		Assert.isTrue(descComp.compare(recA, recB) > 0, 'apple should sort after banana DESC');
		Assert.isTrue(descComp.compare(recB, recA) < 0, 'banana should sort before apple DESC');

		// Null last — ASC
		System.debug('testFieldComparator: TEST 3 - Null last ASC');
		Map<String,Object> recNull = new Map<String,Object>{'val' => null};
		Assert.isTrue(ascComp.compare(recNull, recA) > 0, 'null should sort after non-null ASC');
		Assert.isTrue(ascComp.compare(recA, recNull) < 0, 'non-null should sort before null ASC');
		Assert.areEqual(0, ascComp.compare(recNull, recNull), 'two nulls should return 0');

		// Null last — DESC
		System.debug('testFieldComparator: TEST 4 - Null last DESC');
		Assert.isTrue(descComp.compare(recNull, recA) > 0, 'null should sort after non-null DESC');
		Assert.isTrue(descComp.compare(recA, recNull) < 0, 'non-null should sort before null DESC');

		// Integer
		System.debug('testFieldComparator: TEST 5 - Integer');
		sfpegMultiQueries_SVC.FieldComparator intComp = new sfpegMultiQueries_SVC.FieldComparator('num', 'ASC');
		Map<String,Object> recI1 = new Map<String,Object>{'num' => 1};
		Map<String,Object> recI2 = new Map<String,Object>{'num' => 2};
		Assert.isTrue(intComp.compare(recI1, recI2) < 0, '1 should sort before 2');
		Assert.isTrue(intComp.compare(recI2, recI1) > 0, '2 should sort after 1');

		// Decimal
		System.debug('testFieldComparator: TEST 6 - Decimal');
		sfpegMultiQueries_SVC.FieldComparator decComp = new sfpegMultiQueries_SVC.FieldComparator('amt', 'DESC');
		Map<String,Object> recD1 = new Map<String,Object>{'amt' => (Decimal)1.5};
		Map<String,Object> recD2 = new Map<String,Object>{'amt' => (Decimal)9.9};
		Assert.isTrue(decComp.compare(recD1, recD2) > 0, '1.5 should sort after 9.9 DESC');

		// Boolean
		System.debug('testFieldComparator: TEST 7 - Boolean');
		sfpegMultiQueries_SVC.FieldComparator boolComp = new sfpegMultiQueries_SVC.FieldComparator('flag', 'ASC');
		Map<String,Object> recTrue  = new Map<String,Object>{'flag' => true};
		Map<String,Object> recFalse = new Map<String,Object>{'flag' => false};
		Assert.isTrue(boolComp.compare(recFalse, recTrue) < 0, 'false should sort before true ASC');
		Assert.isTrue(boolComp.compare(recTrue, recFalse) > 0, 'true should sort after false ASC');
		Assert.areEqual(0, boolComp.compare(recTrue, recTrue), 'equal booleans should return 0');

		// ISO-8601 Date strings (lexicographic = chronological)
		System.debug('testFieldComparator: TEST 8 - ISO Date string');
		sfpegMultiQueries_SVC.FieldComparator dateComp = new sfpegMultiQueries_SVC.FieldComparator('dt', 'ASC');
		Map<String,Object> recDate1 = new Map<String,Object>{'dt' => '2024-01-01'};
		Map<String,Object> recDate2 = new Map<String,Object>{'dt' => '2025-06-15'};
		Assert.isTrue(dateComp.compare(recDate1, recDate2) < 0, '2024 should sort before 2025 ASC');

		// ISO-8601 Datetime strings
		System.debug('testFieldComparator: TEST 9 - ISO Datetime string');
		Map<String,Object> recDT1 = new Map<String,Object>{'dt' => '2024-01-01T10:00:00.000Z'};
		Map<String,Object> recDT2 = new Map<String,Object>{'dt' => '2024-01-01T12:00:00.000Z'};
		Assert.isTrue(dateComp.compare(recDT1, recDT2) < 0, 'earlier datetime should sort first ASC');

		Test.stopTest();
		System.debug('testFieldComparator: END');
	}

}