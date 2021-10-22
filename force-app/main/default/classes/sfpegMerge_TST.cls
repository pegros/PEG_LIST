/***
* @description Test class for the sfpegMerge_CTL, sfpegLabel_CTL and sfpegGetLabels_VFP classes.
* @author      P-E GROS
* @date        Sept. 2021
* @see         sfpegMerge_CTL
* @see         sfpegMergeLabels_CTL
* @see         sfpegMergeLabels_VFP
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
public class  sfpegMerge_TST {
    
    /***
    * @description Initializes the test context.
    ***/
    @testSetup
    static void testSetup() {
        System.debug('testSetup: START');

        String currentUserId = UserInfo.getUserId();
        System.debug('testSetup: currentUserId fetched ' + currentUserId);

        List<PermissionSet> sfpegPSets = [SELECT Id, Name FROM PermissionSet WHERE Name LIKE 'sfpeg%'];
        System.debug('testSetup: sfpegPSets fetched ' + sfpegPSets);

        List<PermissionSetAssignment> newAssignments = new List<PermissionSetAssignment>();
        for (PermissionSet iter : sfpegPSets) {
            System.debug('testSetup: sfpegPSets processing PSet ' + iter);
            newAssignments.add(new PermissionSetAssignment(AssigneeId = currentUserId, PermissionSetId = iter.Id));
        }
        System.debug('testSetup: newAssignments init ' + newAssignments);

        insert newAssignments;
        System.debug('testSetup: newAssignments inserted ' + newAssignments);
        
        System.debug('testSetup: END');
    }

    /***
    * @description  Test method for the sfpegMerge_CTL class, checking the "getConfig" method
    *               with all configuration data possible (VFP, RT, PERM, NPERM, custom
    *               tokens like RPT), including all error cases.
    *               LBL token cannot be tested due to test class constraint preventing from rendering
    *               the underlying sfpegMergeLabels_VFP page. --> sfpegMergeLabels_CCTL tested 
    *               separately and directly.
    * @see  sfpegMerge_CTL
    ***/
    
    static TestMethod void testGetConfig() {
        System.debug('testGetConfig: START'); 
        Test.startTest();

        try {
            Map<String,Object> configData = sfpegMerge_CTL.getConfig(null);
            System.debug(LoggingLevel.Error,'testGetConfig: TST#KO-1 - no exception raised for null merge config');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetConfig: TST#KO-1 - proper exception raised for null merge config ' + e.getMessage());
            System.assert(true);
        }

        Map<Object,Object> badListMap = new Map<Object,Object> {
            'RT' => null
        };
        System.debug('testGetConfig: badListMap init ' + badListMap);
        try {
            Map<String,Object> configData = sfpegMerge_CTL.getConfig(badListMap);
            System.debug(LoggingLevel.Error,'testGetConfig: TST#KO-2 - no exception raised for bad token list merge config');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetConfig: TST#KO-2 - proper exception raised for bad token list merge config ' + e.getMessage());
            System.assert(true);
        }

        Map<Object,Object> badRtMap = new Map<Object,Object> {
            'RT' => (Object) (new List<String>{'sfpegTestObject__c'})
        };
        System.debug('testGetConfig: badRtMap init ' + badRtMap);
        try {
            Map<String,Object> configData = sfpegMerge_CTL.getConfig(badRtMap);
            System.debug(LoggingLevel.Error,'testGetConfig: TST#KO-3 - no exception raised for bad RT merge config');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetConfig: TST#KO-3 - proper exception raised for bad RT merge config ' + e.getMessage());
            System.assert(true);
        }

        Map<Object,Object> unknownRtMap = new Map<Object,Object> {
            'RT' => (Object) (new List<String>{'sfpegTestObject__c.sfpegRT3'})
        };
        System.debug('testGetConfig: unknownRtMap init ' + unknownRtMap);
        try {
            Map<String,Object> configData = sfpegMerge_CTL.getConfig(unknownRtMap);
            System.debug(LoggingLevel.Error,'testGetConfig: TST#KO-4 - no exception raised for unknown RT merge config');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetConfig: TST#KO-4 - proper exception raised for unknown RT merge config ' + e.getMessage());
            System.assert(true);
        }

        Map<Object,Object> unknownTokenMap = new Map<Object,Object> {
            'DUMMY' => (Object) (new List<String>{'DUMMY_TOKEN'})
        };
        System.debug('testGetConfig: unknownTokenMap init ' + unknownTokenMap);
        try {
            Map<String,Object> configData = sfpegMerge_CTL.getConfig(unknownTokenMap);
            System.debug(LoggingLevel.Error,'testGetConfig: TST#KO-5 - no exception raised for unknown token merge config');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetConfig: TST#KO-5 - proper exception raised for unknown token merge config ' + e.getMessage());
            System.assert(true);
        }

        Map<Object,Object> configMap = new Map<Object,Object> {
            'VFP' => (Object) (new List<String>{'sfpegMergeLabels_VFP'}),
            //'LBL' => (Object) (new List<String>{'sfpegActionDefaultApexHeader','sfpegActionExecutionMessage'}),
            'RT' => (Object) (new List<String>{'sfpegTestObject__c.sfpegRT1','sfpegTestObject__c.sfpegRT2'}),
            'PERM' => (Object) (new List<String>{'sfpegTestPermission'}),
            'NPERM' => (Object) (new List<String>{'sfpegTestPermission'}),
            'RPT' => (Object) (new List<String>{'sfpegTestReport'})
        };
        System.debug('testGetConfig: configMap init ' + configMap);
        try {
            Map<String,Object> configData = sfpegMerge_CTL.getConfig(configMap);
            System.debug('testGetConfig: TST#OK - data fetched for proper merge config ' + configData);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetConfig: TST#OK - issue when fetching data for proper merge config / ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
		System.debug('testGetConfig: END');    
    }


    /***
    * @description  Test method for the sfpegMerge_CTL class, checking the "getRecord" method,
    *               including all error cases.
    * @see  sfpegMerge_CTL
    ***/

    static TestMethod void testGetRecord() {
        System.debug('testGetRecord: START'); 
        Test.startTest();

        sfpegTestObject__c testRecord = new sfpegTestObject__c(Name = 'TEST');
        insert testRecord;
        System.debug('testGetRecord: testRecord inserted ' + testRecord);
        ID testRecordId = testRecord.Id;

        try {
	        Object recordData = sfpegMerge_CTL.getRecord('DUMMY_OBJECT', 'DUMMY_ID', new List<String>());
            System.debug(LoggingLevel.Error,'testGetRecord: no error raised for for missing field names'); 
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetRecord: error properly raised for missing field names ' + e.getMessage());
            System.assert(true);          
        }

        try {
            Object recordData = sfpegMerge_CTL.getRecord('sfpegTestObject__c',testRecordId, new List<String>{'Name'});
            System.debug('testGetRecord: no error raised for proper record'); 
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetRecord: unexpected error raised for proper record ' + e.getMessage());
            System.assert(false);               
        }
         
        delete testRecord;
        System.debug('testGetRecord: testRecord deleted '); 
        try {
            Object recordData = sfpegMerge_CTL.getRecord('sfpegTestObject__c',testRecordId, new List<String>{'Name'});
            System.debug(LoggingLevel.Error,'testGetRecord: no error raised for deleted record'); 
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetRecord: error properly raised for deleted record ' + e.getMessage());
            System.assert(true);               
        }

        Test.stopTest();
		System.debug('testGetRecord: END'); 
    }


    /***
    * @description  Test method for the sfpegMergeLabel_CTL class, checking the "constructor" and
    *               "getLabelName" methods.
    *               Theseelements cannot be tested from the sfpegMerge_CTL (LBL token) as VF pages
    *               cannot be rendered in such a context.
    * @see  sfpegMerge_CTL
    * @see  sfpegMergeLabel_CTL
    * @see  sfpegMergeLabels_VFP
    ***/
    
    static TestMethod void testGetMergeLabel() {
        System.debug('testGetMergeLabel: START'); 
        Test.startTest();

        try {
            PageReference mergeVFP = Page.sfpegMergeLabels_VFP;
            Test.setCurrentPage(mergeVFP);
            ApexPages.currentPage().getParameters().put('labels','["Label1","Label2"]');
            System.debug('testGetMergeLabel: current page set with labels parameter '); 

            sfpegMergeLabels_CTL mergeCTL = new sfpegMergeLabels_CTL();
            System.debug('testGetMergeLabel: controller instantiated ');
        
            List<String> labelList = mergeCTL.getLabelNames();
            System.debug('testGetMergeLabel: labelNames fetched ' + labelList);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error, 'testGetMergeLabel: exception raised for label merge / ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
		System.debug('testGetConfig: END');    
    }

}
