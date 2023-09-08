/***
* @description  Test class for the sfpegLocationTree_SVC class.
*               Part of the PEG_LIST package extensions.
* @author       P-E GROS
* @date         April 2023
* @see          sfpegLocationTree_SVC
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
public class  sfpegLocationTree_TST {

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
	* @description  Test method for the sfpegLocationTree_SVC class, checking the "getData" method.
	* @see          sfpegLocationTree_SVC
	***/

	@isTest
	static void testGetData() {
		System.debug('testGetData: START');

        List<Schema.Location> testLocations = new List<Schema.Location>();
        testLocations.add(new Schema.Location(Name='Root',Description='Root Element'));
        testLocations.add(new Schema.Location(Name='Child1',Description='Child Element Level 1'));
        testLocations.add(new Schema.Location(Name='Child2',Description='Child Element Level 2'));
        testLocations.add(new Schema.Location(Name='Child3',Description='Child Element Level 3'));
        testLocations.add(new Schema.Location(Name='Child4',Description='Child Element Level 4'));
        testLocations.add(new Schema.Location(Name='Child5',Description='Child Element Level 5'));
        insert testLocations;
		System.debug('testGetData: testLocations inserted ' + testLocations);

        ID parentId = null;
        for (Schema.Location iter : testLocations) {
            iter.ParentLocationId = parentId;
            parentId = iter.Id;
        }
        update testLocations;
        System.debug('testGetData: testLocations updated ' + testLocations);

        Map<Object,Object> inputMap = new Map<Object,Object>();
        inputMap.put('RootId',testLocations[0].Id);
        System.debug('testGetData: inputMap init ' + inputMap);

        sfpegLocationTree_SVC locationSvc = new sfpegLocationTree_SVC();

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

		Test.stopTest();
		System.debug('testGetData: END');
	}

}