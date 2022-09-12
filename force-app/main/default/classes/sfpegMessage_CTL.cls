/***
* @description  Lightning controller to provide details about existing Message List configurations.
*               It relies on the sfpegMessage__mdt custom metadata.
* @author       P-E GROS
* @date         August 2021
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
public with sharing class sfpegMessage_CTL {

    /***
    * @description  Simple method to fetch configuration details for a Message List component.
    *               It provides the display configuration as well as the actions available.
    * @param        name    DeveloperName of the Message configuration record
    * @return       Object  sfpegMessage__mdt record with MessageDisplay__c, MessageActions__c,
    *               MasterLabel fields filled in.
    * @exception    AuraHandledException    Raised if no configuration found for the provided name
    ***/
    @AuraEnabled(cacheable=true)
    public static Object getConfiguration(final String name) {
        System.debug(LoggingLevel.FINE,'getConfiguration: START with sfpegMessage configuration name ' + name);

        List<sfpegMessage__mdt> configs = [ SELECT MasterLabel, MessageDisplay__c, MessageActions__c
                                            FROM sfpegMessage__mdt
                                            WHERE DeveloperName =  :name];
        if ((configs == null) || (configs.size() != 1)) {
            throw new AuraHandledException('Configuration not found with name ' + name);
        }
        //System.debug(LoggingLevel.FINEST,'getConfiguration: END with configuration name ' + configs[0]);
        System.debug(LoggingLevel.FINE,'getConfiguration: END ' + configs[0].MasterLabel);
        return (Object) (configs[0]);
    }

}