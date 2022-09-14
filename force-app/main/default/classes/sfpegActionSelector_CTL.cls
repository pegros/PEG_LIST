/***
* @description Lightning controller for the App Builder to provide the list of
*              Action configurations registered in the sfpegAction__mdt custom metadata
*              and available on the current Object type, for use in a configuration
*              attribute data source (to display a picklist).
* @author      P-E GROS
* @date        April 2021
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
global with sharing class sfpegActionSelector_CTL extends VisualEditor.DynamicPickList {

    /***
    * @description Context of the Lightning page calling the picklist controller.
    ***/
        VisualEditor.DesignTimePageContext pageContext;

    /***
    * @description Constructor enabling to fetch the Lightning page context (and especially
    *              the entityName of the record being displayed in the page).
    * @param       VisualEditor.DesignTimePageContext   Current page context
    * @exception   none really specific.
    ***/

        global sfpegActionSelector_CTL(VisualEditor.DesignTimePageContext pageContext) {
            System.debug(LoggingLevel.FINEST,'Constructor START with sfpegAction page context ' + pageContext);
            System.debug(LoggingLevel.FINEST,'Constructor entityName ' + pageContext.entityName);
            this.pageContext = pageContext;
        }


    /***
    * @description Override of the method providing the default value.
    * @return      VisualEditor.DataRow   Always returns the default ('---','N/A') value.
    * @exception   none really specific.
    ***/
        global override VisualEditor.DataRow getDefaultValue() {
            System.debug(LoggingLevel.FINEST,'getDefaultValue START Number');
            return new VisualEditor.DataRow('---','N/A');
        }

    /***
    * @description Override of the method providing the set of picklist values.
    *              Returns label / names couples for all field sets
    *              defined on entity. Includes a default ('---','N/A') value.
    * @return      VisualEditor.DynamicPickListRows  List of field set names for datasource.
    * @exception   none really specific.
    ***/
        global override VisualEditor.DynamicPickListRows getValues() {
            System.debug(LoggingLevel.FINEST,'getValues: START for sfpegAction');

            VisualEditor.DynamicPickListRows picklistValues = new VisualEditor.DynamicPickListRows();
            picklistValues.addRow(new VisualEditor.DataRow('---','N/A'));
            System.debug(LoggingLevel.FINEST,'getValues: picklistValues init ' + picklistValues);


            System.debug(LoggingLevel.FINEST,'getValues: entity name fetched ' + pageContext.entityName);
            Map<ID,sfpegAction__mdt> queries = new Map<ID,sfpegAction__mdt>(
                [   select MasterLabel,  DeveloperName
                    from sfpegAction__mdt
                    where Scope__c LIKE '%GLOBAL%'  ]);
            if (! String.isEmpty(pageContext.entityName)) {
                System.debug(LoggingLevel.FINEST,'getValues: fetching GLOBAL, Record and object specific queries');
                queries.putAll(new Map<ID,sfpegAction__mdt>(
                    [   select MasterLabel,  DeveloperName
                        from sfpegAction__mdt
                        where Scope__c LIKE '%RECORDS%']));
                String entityPattern = '%' + pageContext.entityName + '%';
                queries.putAll(new Map<ID,sfpegAction__mdt>(
                    [   select MasterLabel,  DeveloperName
                        from sfpegAction__mdt
                        where Scope__c LIKE :entityPattern]));
            }
            System.debug(LoggingLevel.FINEST,'getValues: queries initialized ' + queries);

            for (ID iter : queries.keySet()){
                sfpegAction__mdt queryIter = queries.get(iter);
                System.debug(LoggingLevel.FINEST,'getValues: processing query ' + queryIter);
                picklistValues.addRow(new VisualEditor.DataRow(
                        queryIter.MasterLabel,
                        queryIter.DeveloperName));
            }
            System.debug(LoggingLevel.FINEST,'getValues: picklistValues completed ' + picklistValues);
            System.debug(LoggingLevel.FINE,'getValues: END with #Items ' + picklistValues.size());
            return picklistValues;
        }
    }