/***
* @description  Lightning controller to provide details about existing Card configurations.
* @author       P-E GROS
* @date         Oct 2021
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

@SuppressWarnings('PMD.ClassNamingConventions')
public with sharing class sfpegCard_CTL {

    /***
    * @description  Simple method to fetch configuration details for a Card component.
    *               It provides the required displayed fields (and section).
    * @param        name                DeveloperName of the List configuration record
    * @return       Object              sfpegCard_mdt record with DisplayConfig__c, TargetObject__c
    *                                   TargetIdField__c and MasterLabel fields filled in.
    * @exception    AuraHandledException    Raised if no configuration found for the provided name
    ***/
    @AuraEnabled(cacheable=true)
    public static Object getConfiguration(final String name) {
        System.debug(LoggingLevel.FINE,'getConfiguration: START with sfpegCard configuration name ' + name);

        List<sfpegCard__mdt> configs = [    select DisplayConfig__c, TargetObject__c, TargetIdField__c, MasterLabel
                                            from sfpegCard__mdt
                                            where DeveloperName =  :name ];
        if ((configs == null) || (configs.size() != 1)) {
            System.debug(LoggingLevel.ERROR,'getConfiguration: END - Missing/wrong configuration');
            throw new AuraHandledException('Configuration not found with name ' + name);
        }

        if ((configs[0].DisplayConfig__c).contains('{{{LBL.')) {
            System.debug(LoggingLevel.FINE,'getConfiguration: extracting/replacing custom labels in display config');
            configs[0].DisplayConfig__c = sfpegMerge_CTL.replaceLabelTokens(configs[0].DisplayConfig__c);
            System.debug(LoggingLevel.FINE,'getConfiguration: custom labels replaced in display config');
        }
        else {
            System.debug(LoggingLevel.FINE,'getConfiguration: no custom label in display config');
        }

        //System.debug(LoggingLevel.FINEST,'getConfiguration: END with configuration name ' + configs[0]);
        System.debug(LoggingLevel.FINE,'getConfiguration: END ' + configs[0].MasterLabel);
        return (Object) (configs[0]);
    }

    /***
    * @description  Standard method to execute the record update when LDS is not
    *               used in the sfpegCardCmp component.
    * @param    record  Record data to be updated (should include a record ID)
    * @return   void    Nothing, simply executes the update.
    * @exception   None special.
    ***/
    @AuraEnabled
    public static void updateRecord(SObject record, Boolean bypassSharingRules, Boolean bypassDuplicateRules) {
        System.debug('updateRecord: START with record ' + record);
        System.debug('updateRecord: bypass Sharing Rules? ' + bypassSharingRules);// NOPMD ApexDangerousMethods suppress warning
        System.debug('updateRecord: bypass Duplicate Rules? ' + bypassDuplicateRules);// NOPMD ApexDangerousMethods suppress warning

        Database.SaveResult result = null;
        if (bypassSharingRules) {
            System.debug('updateRecord: bypassing Sharing rules');
            sfpegBypassSharingCard_CTL subHandler = new sfpegBypassSharingCard_CTL();
            result = subHandler.updateRecord(record, bypassDuplicateRules);
        }
        else {
            System.debug('updateRecord: bypassing only Duplicate rules');
            Database.DMLOptions dmlHeader = new Database.DMLOptions();
            dmlHeader.DuplicateRuleHeader.allowSave = true;
            dmlHeader.DuplicateRuleHeader.runAsCurrentUser = true;
            System.debug('updateRecord: DML header set to bypass alert duplicate rules ' + dmlHeader);
            result = Database.update(record, dmlHeader);
        }
        System.debug('updateRecord: END with result ' + result);
        return;
    }

    /***
    * @description  Private class and methods to execute DML update in without sharing mode.
    ***/
    private without sharing class sfpegBypassSharingCard_CTL {
        public Database.SaveResult updateRecord(SObject record, Boolean bypassDuplicateRules) {
            System.debug('updateRecord (without Sharing): START');
            if (bypassDuplicateRules) {
                System.debug('updateRecord (without Sharing): bypassing Duplicate rules');
                Database.DMLOptions dmlHeader = new Database.DMLOptions();
                dmlHeader.DuplicateRuleHeader.allowSave = true;
                dmlHeader.DuplicateRuleHeader.runAsCurrentUser = true;
                System.debug('updatupdateRecord (without Sharing): END / updating with DML header set ' + dmlHeader);
                return Database.update(record, dmlHeader);
            }
            else {
                System.debug('updatupdateRecord (without Sharing): END / standard update triggered');
                return Database.update(record);
            }
        }
    }
}