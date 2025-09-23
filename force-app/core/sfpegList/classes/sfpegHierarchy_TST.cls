/***
* @description  Test class for the sfpegHierarchy_SVC class.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         Feb 2024
* @see          sfpegHierarchy_SVC
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
public class  sfpegHierarchy_TST {

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
	* @description  Test method for the sfpegHierarchy_SVC class, checking the "getData" method.
	* @see          sfpegHierarchy_SVC
	***/

	@isTest
	static void testGetData() {
		System.debug('testGetData: START');

        List<sfpegTestObject__c> testLocations = new List<sfpegTestObject__c>();
        testLocations.add(new sfpegTestObject__c(Name='Root',ExternalId__c='Root Element'));
        testLocations.add(new sfpegTestObject__c(Name='Child1',ExternalId__c='Child Element Level 1'));
        testLocations.add(new sfpegTestObject__c(Name='Child2',ExternalId__c='Child Element Level 2'));
        testLocations.add(new sfpegTestObject__c(Name='Child3',ExternalId__c='Child Element Level 3'));
        testLocations.add(new sfpegTestObject__c(Name='Child4',ExternalId__c='Child Element Level 4'));
        testLocations.add(new sfpegTestObject__c(Name='Child5',ExternalId__c='Child Element Level 5'));
        insert testLocations;
		System.debug('testGetData: testLocations inserted ' + testLocations);

        ID parentId = null;
        for (sfpegTestObject__c iter : testLocations) {
            iter.Parent__c = parentId;
            parentId = iter.Id;
        }
        update testLocations;
        System.debug('testGetData: testLocations updated ' + testLocations);

        Map<Object,Object> inputMap = new Map<Object,Object>();
        inputMap.put('RootId',testLocations[0].Id);
        System.debug('testGetData: inputMap init ' + inputMap);

		sfpegList__mdt locationConfig = new sfpegList__mdt(
			QuerySOQL__c = '{"Query":"SELECT Name, Parent__c, ExternalId__c FROM sfpegTestObject__c WHERE Parent__c IN :idSet","Fields":["ExternalId__c"],"NameField":"Name","ParentField":"Parent__c","ChildrenList":"Children","MaxSize":35,"SizeStep":3,"MaxDepth":3}'
		);
		sfpegList_CTL.CONFIG = locationConfig;
        System.debug('testGetData: sfpegList_CTL.CONFIG init ' + sfpegList_CTL.CONFIG);

        sfpegHierarchy_SVC locationSvc = new sfpegHierarchy_SVC();
        System.debug('testGetData: locationSvc init ' + locationSvc);

		Test.startTest();

        // Passing Cases
        System.debug('testGetData: TEST 1 - testing root access');
		try {
            List<Object> outputList = locationSvc.getData((Object)inputMap,null);
            System.debug('testGetData: returning ' + outputList);
			Assert.areEqual(1,outputList?.size(),'Structure should contain only first child record');
		}
		catch (Exception e) {
			System.debug(LoggingLevel.Error,'testGetData: Correct input should not raise exception ' + e.getMessage());
            Assert.fail('Correct input should not raise exception');
		}

		// Error Cases
        System.debug('testGetData: TEST 2 - testing missing Root ID property');
		Map<Object,Object> badInputMap = new Map<Object,Object>();
		try {
            List<Object> outputList = locationSvc.getData((Object)badInputMap,null);
            System.debug(LoggingLevel.Error,'testGetData: missing Root ID property should raise exception');
            Assert.fail('Missing Root ID property should raise exception');
		}
		catch (Exception e) {
			System.debug('testGetData: Exception properly raised with missing Root ID property ' + e.getMessage());
		}

		System.debug('testGetData: TEST 3 - testing missing Root ID value');
        badInputMap.put('RootId',null);
        System.debug('testGetData: badInputMap init ' + badInputMap);
		try {
            List<Object> outputList = locationSvc.getData((Object)badInputMap,null);
            System.debug(LoggingLevel.Error,'testGetData: missing Root ID value should raise exception');
            Assert.fail('Missing Root ID value should raise exception');
		}
		catch (Exception e) {
			System.debug('testGetData: Exception properly raised with missing Root ID value ' + e.getMessage());
		}

        System.debug('testGetData: TEST 4 - testing bad config');
		sfpegList__mdt badConfig = new sfpegList__mdt(
			QuerySOQL__c = '{"Query":"WRONG CONFIG'
		);
		sfpegList_CTL.CONFIG = badConfig;
		try {
            List<Object> outputList = locationSvc.getData((Object)inputMap,null);
            System.debug(LoggingLevel.Error,'testGetData: bad config should raise exception');
            Assert.fail('Bad config should raise exception');
		}
		catch (Exception e) {
			System.debug('testGetData: Exception properly raised with bad config ' + e.getMessage());
		}

		Test.stopTest();
		System.debug('testGetData: END');
	}

}