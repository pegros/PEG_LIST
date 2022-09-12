/***
* @description  Lightning controller for the sfpegIconCatalogCmp component
*               to provide the complete set of available custom icons
*               available in the sfpegIcons static resource.
*               It provides not only the names but also the available
*               sizes defined for each one.
* @author       P-E GROS
* @date         Feb 2022
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

@SuppressWarnings('PMD.ClassNamingConventions')
public with sharing class sfpegIconCatalog_CTL {

    /***
    * @description  Simple method to fetch configuration details for a KPI List component.
    *               It provides the display configuration as well as the actions available.
    *               Custom and field label tokens are automatically replaced by their
    *               values in the DisplayConfig__c field (depending on the user language),
    *               leveraging the replaceLabelTokens() method of the sfpegMerge_CTL class.
    * @param        name    DeveloperName of the KPI List configuration record
    * @return       Object  sfpegKpiList__mdt record with DisplayConfig__c,
    *               MasterLabel fields filled in.
    * @exception    AuraHandledException    Raised if no configuration found for the provided name
    ***/
    @AuraEnabled(cacheable=true)
    public static Object getIconList() {
        System.debug('getIconList: START');

        StaticResource sr = [select Id, Name, Body from StaticResource where Name = 'sfpegIcons' limit 1];
        System.debug('getIconList: static resource fetched ' + sr.Body);
        String srStr = sr.Body.toString();

        Pattern namePattern = Pattern.compile('<g\\s+id="(\\S+)-(\\S+)"');
        Matcher nameMatcher = namePattern.matcher(srStr);
        Map<String,List<String>> nameTokens = new Map<String,List<String>>();
        while (nameMatcher.find()) {
            System.debug('getIconList: processing name ' + nameMatcher.group(1) + ' with size ' + nameMatcher.group(2));
            if (!nameTokens.containsKey(nameMatcher.group(1))) {
                nameTokens.put(nameMatcher.group(1),new List<String>());
            }
            nameTokens.get(nameMatcher.group(1)).add(nameMatcher.group(2));
        }

        System.debug('getIconList: END with ' + nameTokens);
        return nameTokens;
    }
}
