/***
* @description Test class for the sfpegIconCatalog_CTL class.
* @author      P-E GROS
* @date        Feb. 2022
* @see         sfpegIconCatalog_CTL
* @see PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
*
* MIT License
*
* Copyright (c) 2022 pegros
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
public class  sfpegIconCatalog_TST {

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

        System.debug('testSetup: END');
    }

    /***
    * @description  Test method for the sfpegIconCatalog_CTL class, checking the "getIconList" method
    * @see  sfpegIconCatalog_CTL
    ***/

    @isTest
    static void testGetIconList() {
        System.debug('testGetIconList: START');
        Test.startTest();

        try {
            sfpegIconCatalog_CTL.getIconList();
            System.debug(LoggingLevel.Error,'testGetIconList: catalog properly fetched');
            System.assert(true);
        }
        catch (Exception e) {
            System.debug('testGetIconList: exception raised when fetching catalog ' + e.getMessage());
            System.assert(false);
        }

        Test.stopTest();
        System.debug('testGetConfiguration: END');
    }
}
