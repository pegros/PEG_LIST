/***
* @description  Custom Lightning controller for the sfpegList component to provide 
*               the whole sub-hierarchy of a given Hierarchical Object record.
* @author       P-E GROS
* @date         Feb 2024
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

public with sharing class sfpegHierarchy_SVC extends sfpegListQuery_SVC {
        
    //##############################################################################
    // STATIC VARIABLES
	//##############################################################################

    /***
    * @description  Static variable providing the max. Name size used to generate a custom 
    *               truncated 'ShortName' property for each Hierarchy record
    *               for cleaner display the Name column in the UI (avoid ...).
    *               May be overriden by setting a 'MaxSize' in the configuration.
    ***/
    private Integer TRUNCATION_SIZE = 50;

    /***
    * @description  Static variable providing the Name size delta per level in the sub-hierarchy
    *               to adapt the generated 'ShortName' property to the UX identation.
    *               May be overriden by setting a 'SizeStep' in the configuration.
    ***/
    private Integer TRUNCATION_STEP = 3;

    /***
    * @description  Static variable providing the API Name of the field identifying the 
    *               parent record of a record in the hierarchy
    ***/
    private String NAME_FIELD = 'Name';

    /***
    * @description  Static variable providing the API Name of the field identifying the 
    *               parent record of a record in the hierarchy
    ***/
    private String PARENT_FIELD = 'ParentLocationId';

    /***
    * @description  Static variable providing the Name of the relation listing the 
    *               children records of a record in the hierarchy
    ***/
    private String CHILDREN_LIST = 'ChildLocations';

    /***
    * @description  Static variable providing the list of additional fields to fetch
    *               for each Hierarchy record.
    *               May be overriden by setting a 'Fields' in the configuration
    *               (which should contain a comma separated list of field API names).
    ***/
    private List<String> FIELD_LIST = new List<String>{'LocationLevel', 'Description', 'IdFonctionnel__c', 'IdComplet__c', 'RecordTypeName__c', 'Nature__c'};

    /***
    * @description  Static variable providing the standard query template for fetch
    *               the sublevel of Hierarchy records from a set of record IDs.
    *               May be overriden by setting a 'Query' in the input configuration
    *               (which should contain a comma separated list of field API names).
    ***/
    private String QUERY_TEMPLATE = 'SELECT Name, ParentLocationId, LocationLevel, Description, IdFonctionnel__c, IdComplet__c,RecordTypeName__c, TOLABEL(Nature__c) FROM Location WHERE ParentLocationId IN :idSet';

    /***
    * @description  Static variable providing the max. depth of the hierarchy drill-down
    *               to prevent hitting Apex execution limits.
    *               May be overriden by setting a 'MaxDepth' in the configuration.
    ***/
    private Integer MAX_DEPTH = 10;


    //##############################################################################
    // QUERY LOGIC
    //##############################################################################
    
    /***
    * @description  Default query method called to retrieve a data tree of all Hierarchy
    *               records having the provided record ID as ancestor (via the 'RootId' input property).
    ***/
    public override List<Object> getData(final Object input, final String query) {
        System.debug('getData: START sfpegHierarchy_SVC implementation');
        System.debug('getData: input provided ' + input);
        System.debug('getData: query provided ' + query);
        
        // Context Initialization
        Map<Object,Object> inputData = (Map<Object,Object>) input;
        if (!inputData.containsKey('RootId')) {
            System.debug(LoggingLevel.Error, 'getData: END KO / Missing config');
            Exception error = new System.NullPointerException();
            error.setMessage('"RootId" parameter is missing in input configuration');
            throw error;
        }
        ID recordId = (ID)(inputData.get('RootId'));
        System.debug('getData: recordId fetched ',recordId);
        if (String.isBlank(recordId)) {
            System.debug(LoggingLevel.Error, 'getData: END KO / Missing recordId');
            Exception error = new System.NullPointerException();
            error.setMessage('"RootId" parameter value is null or empty');
            throw error;
        }

        reviewConfig();
        System.debug('getData: config reviewed');

        // Data fetch trigger
        Set<String> baseSet = new set<String>();
        baseSet.add(recordId);
        Map<ID,Object> resultMap = fetchDetails(baseSet,1);

        System.debug('getData: END with #records on 1st level ' + resultMap.size());
        return resultMap.values();
    }
    
    /***
    * @description  Recursive data fetch logic.
    ***/
    private Map<ID,Object> fetchDetails(Set<String> idSet, Integer depth) {
        System.debug('fetchDetails: START with #IDs ' + idSet?.size());
        //System.debug('fetchDetails: IDs ' + idSet);
        System.debug('fetchDetails: Current depth ' + depth);

        Integer maxNameSize = TRUNCATION_SIZE - depth * TRUNCATION_STEP;
        //System.debug('fetchDetails: maxNameSize init ' + maxNameSize);

        // Fetching children records
        Map<String, Object> bindParams = new Map<String, Object>();
        bindParams.put('idSet',idSet);
        // System mode for test classes to prevent issues with Permissions when deploying for the first time
        Map<ID,SObject> childMap = new Map<ID,SObject>((List<SObject>) Database.queryWithBinds(QUERY_TEMPLATE,bindParams,(Test.isRunningTest() ? AccessLevel.SYSTEM_MODE : AccessLevel.USER_MODE)));
        System.debug('fetchDetails: #Children fetched ' + childMap?.size());
        System.debug('fetchDetails: Children fetched ' + childMap);
        
        if ((childMap == null) || (childMap.size() == 0)) {
            System.debug('fetchDetails: END / No child found');
            return new Map<ID,Object>();
        }
        
        // Analysing children data
        Map<ID,Object> resultMap = new Map<ID,Object>();
        Set<String> childIdSet = new Set<String>();
        for (ID iter : childMap.keySet())  {
            System.debug('fetchDetails: Processing record ID' + iter);
            childIdSet.add(iter);

            SObject iterRcd = childMap.get(iter);
            System.debug('fetchDetails: iterRcd fetched ' + iterRcd);

            Map<Object,Object> iterObj = new Map<Object,Object>{
                'Id' => iterRcd.Id,
                PARENT_FIELD => iterRcd.get(PARENT_FIELD),
                NAME_FIELD => iterRcd.get(NAME_FIELD),
                'ShortName' => shortenName((String) iterRcd.get(NAME_FIELD), maxNameSize)
            };
            for (String iterF : FIELD_LIST) {
                iterObj.put(iterF,iterRcd.get(iterF));
            }
            iterObj.put(CHILDREN_LIST,(Object)(new List<Object>()));
            resultMap.put(iter,(Object)(iterObj));
        }
        System.debug('fetchDetails: #children processed ' + childIdSet.size());
           
        // Recursively analysing grand-children
        if (depth > MAX_DEPTH) {
            System.debug('fetchDetails: max depth reached');
        }
        else {
            System.debug('fetchDetails: fetching grand-children');
            Map<ID,Object> grandChildren = fetchDetails(childIdSet,depth + 1);
            for (ID iter : grandChildren.keySet()) {
                System.debug('fetchDetails: Registering grandchild ID ' + iter);
                Object iterObj = grandChildren.get(iter);
                System.debug('fetchDetails: iterObj retrieved ' + iterObj);

                ID iterParentId = (ID) (((Map<Object,Object>)iterObj).get(PARENT_FIELD));
                System.debug('fetchDetails: for child ID ' + iterParentId);

                Map<Object,Object> iterParentObj = (Map<Object,Object>) resultMap.get(iterParentId);
                List<Object> iterParentChildren = (List<Object>) iterParentObj.get(CHILDREN_LIST);
                iterParentChildren.add(iterObj);
            }
        }
            
        System.debug('fetchDetails: END');
        return resultMap;
    }

    //#####################################################
    // Private Utility Methods
    //#####################################################

    /***
    * @description  Private utility method to fetch the complex SOSL/SOQL query configuration for a given
    *               sfpegList__mdt name (assumed to be set in the QuerySOQL__c field).
    ***/
    @TestVisible
    private void reviewConfig() {
        System.debug('reviewConfig: START');

        sfpegList__mdt config = sfpegList_CTL.CONFIG;
        System.debug('reviewConfig: configuration retrieved ' + config);

        if (String.isBlank(config?.QuerySOQL__c)) {
            System.debug('reviewConfig: END / No custom configuration');
            return;
        }

        Map<String,Object> configMap;
        try {
            configMap = (Map<String,Object>) (JSON.deserializeUntyped(config.QuerySOQL__c));
        }
        catch (Exception e) {
            System.debug(LoggingLevel.error,'reviewConfig: END KO / configuration parsing failed');
            throw new StringException('Invalid configuration for Hierarchy query');
        }
        System.debug('configuration parsed ' + configMap);

        
        if (configMap.containsKey('MaxSize')) {
            TRUNCATION_SIZE = Integer.valueOf((Decimal)(configMap.get('MaxSize')));
            System.debug('reviewConfig: TRUNCATION_SIZE overriden ' + TRUNCATION_SIZE);
        }   
        if (configMap.containsKey('SizeStep')) {
            TRUNCATION_STEP = Integer.valueOf((Decimal)(configMap.get('SizeStep')));
            System.debug('reviewConfig: TRUNCATION_STEP overriden ' + TRUNCATION_STEP);
        }

        if (configMap.containsKey('NameField')) {
            NAME_FIELD = (String)(configMap.get('NameField'));
            System.debug('reviewConfig: NAME_FIELD overriden ' + NAME_FIELD);
        }
        if (configMap.containsKey('ParentField')) {
            PARENT_FIELD = (String)(configMap.get('ParentField'));
            System.debug('reviewConfig: PARENT_FIELD overriden ' + PARENT_FIELD);
        }
        if (configMap.containsKey('ChildrenList')) {
            CHILDREN_LIST = (String)(configMap.get('ChildrenList'));
            System.debug('CHILDREN_LIST overriden ' + CHILDREN_LIST);
        }

        if (configMap.containsKey('Fields')) {
            FIELD_LIST = String.join((List<Object>)(configMap.get('Fields')), ',').split(',');
            System.debug('reviewConfig: FIELD_LIST overriden ' + FIELD_LIST);
        }
        if (configMap.containsKey('Query')) {
            QUERY_TEMPLATE = (String)(configMap.get('Query'));
            System.debug('reviewConfig: QUERY_TEMPLATE overriden '+ QUERY_TEMPLATE);
        }
        if (configMap.containsKey('MaxDepth')) {
            MAX_DEPTH = Integer.valueOf((Decimal)(configMap.get('MaxDepth')));
            System.debug('reviewConfig: MAX_DEPTH overriden ' + MAX_DEPTH);
        }

        System.debug('getConfig: END');
    }

    /***
    * @description  Private utility method to truncate the name of a record
    *               to a max length (and append '...' if needed).
    ***/
    @TestVisible
    private String shortenName(String name, Integer maxLength) {
        return (name.length() > maxLength ? name.left(maxLength) + '...' : name);
    }

}