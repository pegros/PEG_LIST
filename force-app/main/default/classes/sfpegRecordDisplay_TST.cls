/***
* @description Test class for the sfpegRecordDisplay_CTL and sfpegRecordDisplaySelector_CTL classes.
* @author      P-E GROS
* @date        Dec. 2021
* @see         sfpegRecordDisplay_CTL
* @see         sfpegRecordDisplaySelector_CTL
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
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
public with sharing class sfpegRecordDisplay_TST {

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
    * @description  Test method for the sfpegRecordDisplay_CTL class, checking the "getConfiguration" method
    *               including all error cases. Uses the standard "sfpegTest" metadata record to
    *               check OK case.
    * @see  sfpegRecordDisplay_CTL
    ***/
    
    static TestMethod void testGetConfiguration() {
        System.debug('testGetConfiguration: START'); 
        Test.startTest();

        try {
            sfpegRecordDisplay_CTL.getConfiguration('SFPEG_DUMMY_PROFILE');
            System.debug(LoggingLevel.Error,'testGetConfiguration: no exception raised for invalid Record Display name');
            System.assert(false);
        }
        catch (Exception e) {
            System.debug('testGetConfiguration: proper exception raised for invalid Record Display name ' + e.getMessage());
            System.assert(true);
        }

        try {
            Object displayDesc = sfpegRecordDisplay_CTL.getConfiguration('sfpegTest');
            System.debug('testGetFieldSetDesc: configuration for standard sfpegTest Record Display found ' + displayDesc);
            System.assert(true);
        }
        catch (Exception e) {
            System.debug(LoggingLevel.Error,'testGetFieldSetDesc: configuration for standard sfpegTest Record Display not found ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
		System.debug('testGetConfiguration: END');    
    }


    /***
    * @description Test method for th sfpegRecordDisplaySelector_CTL class, checking the "getDefaultValue" method,
    *              which should always return the default "N/A" value.
    * @see sfpegRecordDisplaySelector_CTL
    ***/

    static TestMethod void testGetDefaultValue() {
        System.debug('testGetDefaultValue: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'sfpegTestObject__c';
        System.debug('testGetDefaultValue: testContext init'); 

        sfpegRecordDisplaySelector_CTL controller = new sfpegRecordDisplaySelector_CTL(testContext);
        System.debug('testGetDefaultValue: controller init'); 
    
        VisualEditor.DataRow defVal = controller.getDefaultValue();
        System.debug('testGetDefaultValue: getDefaultValue called ' + defVal); 

        System.assertEquals('N/A',defVal.getValue());

        Test.stopTest();
        System.debug('testGetDefaultValue: END');
    }

    /***
    * @description Test method for th sfpegRecordDisplaySelector_CTL class, checking the "getValues" method,
    *              which should always include the default "N/A" value.
    * @see sfpegRecordDisplaySelector_CTL
    ***/

    static TestMethod void testGetValues() {
        System.debug('testGetValues: START'); 
        Test.startTest();

        VisualEditor.DesignTimePageContext  testContext = new VisualEditor.DesignTimePageContext();
        testContext.entityName =  'sfpegTestObject__c';
        System.debug('testGetValues: testContext init'); 

        sfpegRecordDisplaySelector_CTL controller = new sfpegRecordDisplaySelector_CTL(testContext);
        System.debug('testGetValues: controller init'); 
    
        VisualEditor.DynamicPickListRows listVal = controller.getValues();
        System.debug('testGetValues: getValues called ' + listVal); 

        System.assert(listVal.size() > 0);

        Test.stopTest();
        System.debug('testGetValues: END');
    }
}
