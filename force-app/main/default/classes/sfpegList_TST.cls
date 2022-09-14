/***
* @description Test class for the sfpegList_CTL, sfpegListQuery_SVC and sfpegListSelector_CTL classes.
* @author      P-E GROS
* @date        Sept. 2021
* @see         sfpegList_CTL
* @see         sfpegListQuery_SVC
* @see         sfpegListSelector_CTL
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
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
public class sfpegList_TST {

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

        /*
        List<sfpegTestObject__c> rcdList = new List<sfpegTestObject__c>();
        rcdList.add(new sfpegTestObject__c(Name='TEST #1'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #2'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #3'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #4'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #5'));
        insert rcdList;
        System.debug('testSetup: test records inserted ' + rcdList);
		*/

        System.debug('testSetup: END');
    }

    /***
    * @description  Test method for the sfpegList_CTL class, checking the "getConfiguration" method
    *               including all error cases. Uses the standard "OpenTaskList" metadata record to
    *               check OK case.
    * @see  sfpegList_CTL
    ***/

    @isTest
	static void testGetConfiguration() {
        System.debug('testGetConfiguration: START');
        Test.startTest();

        try {
            sfpegList_CTL.getConfiguration('SFPEG_DUMMY_LIST');
            System.debug(LoggingLevel.Error,'testGetConfiguration: no exception raised for invalid list name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetConfiguration: proper exception raised for invalid list name ' + e.getMessage());
            System.assert(true);
        }

        try {
            Object actionDesc = sfpegList_CTL.getConfiguration('sfpegTestSoql');
            System.debug('testGetConfiguration: configuration for sfpegTestSoql list found ' + actionDesc);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetConfiguration: configuration for sfpegTestSoql list not found ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
		System.debug('testGetConfiguration: END');
    }


    /***
    * @description  Test method for the sfpegList_CTL class, checking the "getData" method.
    *               It relies on the standard "sfpegTestSoql" metadata record to check the SOQL
    *               OK case and on the "sfpegTestApex" one (relying on the sfpegListTest_SVC class)
    *               to check the Apex cases.
    * @see  sfpegList_CTL
    * @see  sfpegListTest_SVC
    ***/

    @isTest
	static void testGetData() {
        System.debug('testGetData: START');
        Test.startTest();

        List<sfpegTestObject__c> rcdList = new List<sfpegTestObject__c>();
        rcdList.add(new sfpegTestObject__c(Name='TEST #1'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #2'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #3'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #4'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #5'));
        insert rcdList;
        System.debug('testGetData: test records inserted ' + rcdList);

        Object inputData = (Object) (new Map<Object,Object>{'OBJECT' => 'sfpegTestObject__c'});
        System.debug('testGetData: inputData init ' + inputData);

        // Wrong Name case
        try {
            sfpegList_CTL.getData('DUMMY_LIST',null);
            System.debug(LoggingLevel.Error,'testGetData: no error raised for dummy List config name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetData: exception properly raised for dummy List config name ' + e.getMessage());
            System.assert(true);
        }

        // Missing Input case
        try {
            sfpegList_CTL.getData('sfpegTestSoql',null);
            System.debug(LoggingLevel.Error,'testGetData: no error raised for missing input');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetData: exception properly raised for missing input ' + e.getMessage());
            System.assert(true);
        }

        // Bad SOQL
        try {
            sfpegList_CTL.getData('sfpegTestSoqlKO',inputData);
            System.debug(LoggingLevel.Error,'testGetData: no error raised for bad SOQL');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetData: exception properly raised for bad SOQL ' + e.getMessage());
            System.assert(true);
        }

        // SOQL OK case
        try {
            sfpegList_CTL.getData('sfpegTestSoql',inputData);
            System.debug('testGetData: sfpegTestSoql List config properly executed');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetData: exception raised for sfpegTestSoql List ' + e.getMessage());
            System.assert(false);
        }

        // SOQL Bypass OK case
        try {
            sfpegList_CTL.getData('sfpegTestSoqlBypass',inputData);
            System.debug('testGetData: sfpegTestSoqlBypass List config properly executed');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetData: exception raised for sfpegTestSoqlBypass List ' + e.getMessage());
            System.assert(false);
        }

        // Apex OK case
        try {
            sfpegList_CTL.getData('sfpegTestApex',inputData);
            System.debug('testGetData: sfpegTestApex List config properly executed');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetData: exception raised for sfpegTestApex List ' + e.getMessage());
            System.assert(false);
        }

        // Apex KO case
        try {
            sfpegList_CTL.getData('sfpegTestApexUnknown',inputData);
            System.debug(LoggingLevel.Error,'testGetData: no error raised for bad Apex class');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetData: error properly raised for unknown class ' + e.getMessage());
            System.assert(true);
        }

        // Added because SOSL does not work in test classes otherwise.
        list<ID> setSearchResults = new list<ID>();
        for (sfpegTestObject__c iter : rcdList) {
            setSearchResults.add(iter.Id);
        }
        System.debug('testGetData: sfpegTessetSearchResults init ' + setSearchResults);
        Test.setFixedSearchResults(setSearchResults);

        // SOSL OK case
        try {
            sfpegList_CTL.getData('sfpegTestSosl',inputData);
            System.debug('testGetData: sfpegTestSosl List config properly executed');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetData: exception raised for sfpegTestSosl List ' + e.getMessage());
            System.assert(false);
        }

        // Bad SOSL
        try {
            sfpegList_CTL.getData('sfpegTestSoslKO',inputData);
            System.debug(LoggingLevel.Error,'testGetData: no error raised for unsupported SOSL ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetData: exception properly raised for unsupported SOSL ' + e.getMessage());
            System.assert(true);
        }

        // SOSL Bypass OK case
        try {
            sfpegList_CTL.getData('sfpegTestSoslBypass',inputData);
            System.debug('testGetData: sfpegTestSoslBypass List config properly executed');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetData: exception raised for sfpegTestSoslBypass List ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
        System.debug('testGetData: END');
    }

    /***
    * @description  Test method for the sfpegList_CTL class, checking the "getCount" method.
    *               It relies on the standard "sfpegTestSoqlPaginated" metadata record to check the SOQL
    *               OK case and on the "sfpegTestApexPaginated" one (relying on the sfpegListTest_SVC class)
    *               to check the Apex cases.
    * @see  sfpegList_CTL
    * @see  sfpegListTest_SVC
    ***/

    @isTest
	static void testGetCount() {
        System.debug('testGetCount: START');
        Test.startTest();

        List<sfpegTestObject__c> rcdList = new List<sfpegTestObject__c>();
        rcdList.add(new sfpegTestObject__c(Name='TEST #1'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #2'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #3'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #4'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #5'));
        insert rcdList;
        System.debug('testGetCount: test records inserted ' + rcdList);

        Object inputData = (Object) (new Map<Object,Object>{'OBJECT' => 'sfpegTestObject__c'});
        System.debug('testGetCount: inputData init ' + inputData);

        // Wrong Name case
        try {
            sfpegList_CTL.getCount('DUMMY_LIST',null);
            System.debug(LoggingLevel.Error,'testGetCount: no error raised for dummy List config name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetCount: exception properly raised for dummy List config name ' + e.getMessage());
            System.assert(true);
        }

        // Missing Input case
        try {
            sfpegList_CTL.getCount('sfpegTestSoqlPaginated',null);
            System.debug(LoggingLevel.Error,'testGetCount: no error raised for missing input');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetCount: exception properly raised for missing input ' + e.getMessage());
            System.assert(true);
        }

        // Wrong Type SOSL
        try {
            sfpegList_CTL.getCount('sfpegTestSosl',null);
            System.debug(LoggingLevel.Error,'testGetCount: no error raised for SOSL ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetCount: exception properly raised for SOSL ' + e.getMessage());
            System.assert(true);
        }

        // Bad Paginated SOQL
        try {
            sfpegList_CTL.getCount('sfpegTestSoqlPaginatedKO',inputData);
            System.debug(LoggingLevel.Error,'testGetPaginatedData: no error raised for bad SOQL count');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetPaginatedData: exception properly raised for bad SOQL count ' + e.getMessage());
            System.assert(true);
        }

        // SOQL OK case
        try {
            sfpegList_CTL.getCount('sfpegTestSoqlPaginated',inputData);
            System.debug('testGetCount: sfpegTestSoqlPaginated List config properly executed');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetCount: exception raised for sfpegTestSoqlPaginated List ' + e.getMessage());
            System.assert(false);
        }

        // SOQL Bypass OK case
        try {
            sfpegList_CTL.getCount('sfpegTestSoqlPaginatedBypass',inputData);
            System.debug('testGetCount: sfpegTestSoqlPaginatedBypass List config properly executed');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetCount: exception raised for sfpegTestSoqlPaginatedBypass List ' + e.getMessage());
            System.assert(false);
        }

        // Apex OK case
        try {
            sfpegList_CTL.getCount('sfpegTestApexPaginated',inputData);
            System.debug('testGetCount: sfpegTestApexPaginated List config properly executed');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetCount: exception raised for sfpegTestApexPaginated List ' + e.getMessage());
            System.assert(false);
        }

		Test.stopTest();
		System.debug('testGetCount: END');
    }

    /***
    * @description  Test method for the sfpegList_CTL class, checking the "getPaginatedData" method.
    *               It relies on the standard "sfpegTestSoqlPaginated" metadata record to check the SOQL
    *               OK case and on the "sfpegTestApexPaginated" one (relying on the sfpegListTest_SVC class)
    *               to check the Apex cases.
    * @see  sfpegList_CTL
    * @see  sfpegListTest_SVC
    ***/

    @isTest
	static void testGetPaginatedData() {
        System.debug('testGetPaginatedData: START');
        Test.startTest();

        List<sfpegTestObject__c> rcdList = new List<sfpegTestObject__c>();
        rcdList.add(new sfpegTestObject__c(Name='TEST #1'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #2'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #3'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #4'));
        rcdList.add(new sfpegTestObject__c(Name='TEST #5'));
        insert rcdList;
        System.debug('testGetPaginatedData: test records inserted ' + rcdList);

        Object inputData = (Object) (new Map<Object,Object>{'OBJECT' => 'sfpegTestObject__c'});
        System.debug('testGetPaginatedData: inputData init ' + inputData);

        // Wrong Name case
        try {
            sfpegList_CTL.getPaginatedData('DUMMY_LIST',null,null);
            System.debug(LoggingLevel.Error,'testGetPaginatedData: no error raised for dummy List config name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetPaginatedData: exception properly raised for dummy List config name ' + e.getMessage());
            System.assert(true);
        }

        // Missing Input case
        try {
            sfpegList_CTL.getPaginatedData('sfpegTestSoqlPaginated',null,null);
            System.debug(LoggingLevel.Error,'testGetPaginatedData: no error raised for missing input');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetPaginatedData: exception properly raised for missing input ' + e.getMessage());
            System.assert(true);
        }

        // Wrong Type (SOSL)
        String lastRecordId = null;
        try {
            sfpegList_CTL.getPaginatedData('sfpegTestSosl',inputData,lastRecordId);
            System.debug(LoggingLevel.Error,'testGetPaginatedData: no error raised for bad type (SOSL)');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetPaginatedData: exception properly raised for bad type (SOSL) ' + e.getMessage());
            System.assert(true);
        }

        // Bad Paginated SOQL
        try {
            sfpegList_CTL.getPaginatedData('sfpegTestSoqlPaginatedKO',inputData,lastRecordId);
            System.debug(LoggingLevel.Error,'testGetPaginatedData: no error raised for bad paginated SOQL');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetPaginatedData: exception properly raised for bad paginated SOQL ' + e.getMessage());
            System.assert(true);
        }


        // SOQL OK case - First page
        try {
            List<Object> resultList = sfpegList_CTL.getPaginatedData('sfpegTestSoqlPaginated',inputData,lastRecordId);
            System.debug('testGetPaginatedData: sfpegTestSoqlPaginated List config properly executed');
            Integer resultSize = resultList.size();
            System.debug('testGetPaginatedData: resultSize is ' + resultSize);
            lastRecordId = ((sfpegTestObject__c)(resultList.get(resultSize - 1))).Id;
            System.debug('testGetPaginatedData: lastRecordId updated ' + lastRecordId);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetCount: exception raised for sfpegTestSoqlPaginated List ' + e.getMessage());
            System.assert(false);
        }

        // SOQL OK case - Second page
        try {
            List<Object> resultList = sfpegList_CTL.getPaginatedData('sfpegTestSoqlPaginated',inputData,lastRecordId);
            System.debug('testGetPaginatedData: sfpegTestSoqlPaginated List config properly executed on page #2');
            Integer resultSize = resultList.size();
            System.debug('testGetPaginatedData: resultSize is ' + resultSize);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetPaginatedData: exception raised for sfpegTestSoqlPaginated List on page #2 ' + e.getMessage());
            System.assert(false);
        }

        // SOQL OK case - First page
        try {
            sfpegList_CTL.getPaginatedData('sfpegTestSoqlPaginatedBypass',inputData,null);
            System.debug('testGetPaginatedData: sfpegTestSoqlPaginatedBypass List config properly executed');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetCount: exception raised for sfpegTestSoqlPaginatedBypass List ' + e.getMessage());
            System.assert(false);
        }

        // Apex OK case - First page
        lastRecordId = null;
        try {
            List<Object> resultList = sfpegList_CTL.getPaginatedData('sfpegTestApexPaginated',inputData,lastRecordId);
            System.debug('testGetPaginatedData: sfpegTestApexPaginated List config properly executed');
            Integer resultSize = resultList.size();
            System.debug('testGetPaginatedData: resultSize is ' + resultSize);
            lastRecordId = ((sfpegTestObject__c)(resultList.get(resultSize - 1))).Id;
            System.debug('testGetPaginatedData: lastRecordId updated ' + lastRecordId);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetPaginatedData: exception raised for sfpegTestApexPaginated List ' + e.getMessage());
            System.assert(false);
        }

        // Apex OK case - Second page
        try {
            List<Object> resultList = sfpegList_CTL.getPaginatedData('sfpegTestApexPaginated',inputData,lastRecordId);
            System.debug('testGetPaginatedData: sfpegTestApexPaginated List config properly executed on page #2');
            Integer resultSize = resultList.size();
            System.debug('testGetPaginatedData: resultSize is ' + resultSize);
            lastRecordId = ((sfpegTestObject__c)(resultList.get(resultSize - 1))).Id;
            System.debug('testGetPaginatedData: lastRecordId updated ' + lastRecordId);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetPaginatedData: exception raised for sfpegTestApexPaginated List on page #2 ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
        System.debug('testGetCount: END');
    }

    /***
    * @description  Test method for the sfpegList_CTL class, checking various error
    *               cases within private utility methods (for code coverage).
    * @see sfpegList_CTL
    ***/

    @isTest
	static void testPrivateMethods() {
        System.debug('testPrivateMethods: START');
        Test.startTest();

        // mergeQuery() errors
        try {
            sfpegList_CTL.mergeQuery(null,null);
            System.debug(LoggingLevel.Error,'testPrivateMethods: no exception raised for mergeQuery with bad params ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testPrivateMethods: exception properly raised for mergeQuery with bad params ' + e.getMessage());
            System.assert(true);
        }

        // getClassInstance() errors
        try {
            sfpegList_CTL.getClassInstance(null);
            System.debug(LoggingLevel.Error,'testPrivateMethods: no exception raised for getClassInstance with missing action name ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testPrivateMethods: exception properly raised for getClassInstance with missing action name ' + e.getMessage());
            System.assert(true);
        }

        try {
            sfpegList_CTL.getClassInstance('DUMMY_CLASS');
            System.debug(LoggingLevel.Error,'testPrivateMethods: no exception raised for getClassInstance with dummy action name ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testPrivateMethods: exception properly raised for getClassInstance with dummy action name ' + e.getMessage());
            System.assert(true);
        }

        // initPagination() errors
        try {
            sfpegList_CTL.initPagination(null,null,null);
            System.debug(LoggingLevel.Error,'testPrivateMethods: no exception raised for initPagination with missing field name ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testPrivateMethods: exception properly raised for initPagination with missing field name ' + e.getMessage());
            System.assert(true);
        }

        Test.stopTest();
        System.debug('testGetDefaultValue: END');
    }


    /***
    * @description  Test method for the sfpegList_SVC virtual class, checking the 3 methods
    *               providing default implementation (for code coverage).
    *               It does the sames on default cases of the sfpegListTest_SVC test
    *               implementation
    * @see  sfpegList_SVC
    * @see  sfpegListTest_SVC
    ***/

    @isTest
	static void testVirtualApexClass() {
        System.debug('testVirtualApexClass: START');
        Test.startTest();

        sfpegListQuery_SVC newInstance = new sfpegListQuery_SVC();
        sfpegListTest_SVC newInstanceT = new sfpegListTest_SVC();
        System.debug('testVirtualApexClass: newInstance init ');

        try {
            newInstance.getData(null,null);
            System.debug(LoggingLevel.Error,'testVirtualApexClass: no exception raised for getData ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testVirtualApexClass: exception properly raised for getData ' + e.getMessage());
            System.assert(true);
        }

        try {
            newInstanceT.getData(null,null);
            System.debug(LoggingLevel.Error,'testVirtualApexClass: no exception raised for getData on TEST ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testVirtualApexClass: exception properly raised for getData on TEST ' + e.getMessage());
            System.assert(true);
        }

        try {
            newInstance.getCount(null,null);
            System.debug(LoggingLevel.Error,'testVirtualApexClass: no exception raised for getCount ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testVirtualApexClass: exception properly raised for getCount ' + e.getMessage());
            System.assert(true);
        }

        try {
            newInstanceT.getCount(null,null);
            System.debug(LoggingLevel.Error,'testVirtualApexClass: no exception raised for getCount on TEST ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testVirtualApexClass: exception properly raised for getCount on TEST ' + e.getMessage());
            System.assert(true);
        }

        try {
            newInstance.getPaginatedData(null,null,null);
            System.debug(LoggingLevel.Error,'testVirtualApexClass: no exception raised for getPaginatedData ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testVirtualApexClass: exception properly raised for getPaginatedData ' + e.getMessage());
            System.assert(true);
        }

        try {
            newInstanceT.getPaginatedData(null,null,null);
            System.debug(LoggingLevel.Error,'testVirtualApexClass: no exception raised for getPaginatedData on Test ');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testVirtualApexClass: exception properly raised for getPaginatedData ' + e.getMessage());
            System.assert(true);
        }

        Test.stopTest();
        System.debug('testGetDefaultValue: END');
    }

    /***
    * @description Test method for the sfpegListSelector_CTL class, checking the "getDefaultValue" method,
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

        sfpegListSelector_CTL controller = new sfpegListSelector_CTL(testContext);
        System.debug('testGetDefaultValue: controller init');

        VisualEditor.DataRow defVal = controller.getDefaultValue();
        System.debug('testGetDefaultValue: getDefaultValue called ' + defVal);

        System.assertEquals('N/A',defVal.getValue());

        Test.stopTest();
        System.debug('testGetDefaultValue: END');
    }

    /***
    * @description Test method for th sfpegListSelector_CTL class, checking the "getValues" method,
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

        sfpegListSelector_CTL controller = new sfpegListSelector_CTL(testContext);
        System.debug('testGetValues: controller init');

        VisualEditor.DynamicPickListRows listVal = controller.getValues();
        System.debug('testGetValues: getValues called ' + listVal);

        System.assert(listVal.size() > 0);

        Test.stopTest();
        System.debug('testGetValues: END');
    }

}