/***
* @description  Lightning controller to provide details about existing List configurations
*               and get the corresponding data.
*               It provides default implementation for SOQL queries which may be overriden
*               by Apex classes overriding the sfpegListQuery_SVC virtual interface.
* @author       P-E GROS
* @date         April 2021
* @see          sfpegListQuery_SVC
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
public with sharing class sfpegList_CTL {

	/***
    * @description Static Map providing the actual icon name for some special objects 
    ***/
    final static Map<String,String> OBJECT_ICON_MAP = new Map<String,String>{
		'ContentDocument' => 'standard:file',
        'ContentDocumentLink' => 'standard:file',
        'AttachedContentDocument' => 'standard:file',
        'AttachedContentNote' => 'standard:note',
        'ActivityHistory' => 'standard:task2',
        'OpenActivity' => 'standard:event',
        'TopicAssignment' => 'standard:topic',
        'EmailMessage' => 'standard:email',
        'ActionPlan' => 'standard:entitlement',
        'CampaignMember' => 'standard:campaign_members',
		'BranchUnitRelatedRecord' => 'custom:custom16',
		'Knowledge__kav' => 'standard:article',
		'TrnCourse' => 'custom:custom91'
    };

	/***
    * @description	Static variable containing the currently executed query configuration
	*				Enables called Apex subclasses to access query configuration details.
    ***/
    public static sfpegList__mdt CONFIG;

	/***
	* @description  Simple method to fetch configuration details for a List component.
	*               It provides the required input fields, the type of display (datatable...)
	*               and the corresponding display configuration.
	*               Custom and field label tokens are automatically replaced by their
	*               values in the DisplayConfig__c field (depending on the user language),
	*               leveraging the replaceLabelTokens() method of the sfpegMerge_CTL class.
	* @param        name    DeveloperName of the List configuration record
	* @return       Object  sfpegList__mdt record with DisplayType__c, DisplayConfig__c,
	*               QueryInput__c, FlattenResults__c, RowActions__c, MasterLabel
	*               fields filled in.
	* @exception    AuraHandledException    Raised if no configuration found for the provided name
	* @see          sfpegMerge_CTL
	***/
	@AuraEnabled(cacheable=true)
	public static Object getConfiguration(final String name) {
		System.debug(LoggingLevel.FINE,'getConfiguration: START with sfpegList configuration name ' + name);

		List<sfpegList__mdt> configs = [    SELECT MasterLabel, DisplayType__c, DisplayConfig__c, QueryInput__c, DoPagination__c, QueryOrderBy__c,  FlattenResults__c, RowActions__c
											FROM sfpegList__mdt
											WHERE DeveloperName =  :name];
		if ((configs == null) || (configs.size() != 1)) {
			System.debug(LoggingLevel.ERROR,'getConfiguration: END KO / configuration not found with name ' + name);
			throw new AuraHandledException('Configuration not found with name ' + name);
		}

		if (String.isNotEmpty(configs[0].DisplayConfig__c)) {
			if ((configs[0].DisplayConfig__c).contains('{{{LBL.')) {
				System.debug(LoggingLevel.FINE,'getConfiguration: extracting/replacing custom labels in display config');
				configs[0].DisplayConfig__c = sfpegMerge_CTL.replaceLabelTokens(configs[0].DisplayConfig__c);
				System.debug(LoggingLevel.FINE,'getConfiguration: custom labels replaced in display config');
			}
			else {
				System.debug(LoggingLevel.FINE,'getConfiguration: no custom label in display config');
			}

			if ((configs[0].DisplayConfig__c).contains('{{{FLBL.')) {
				System.debug(LoggingLevel.FINE,'getConfiguration: extracting/replacing field labels in display config');
				configs[0].DisplayConfig__c = sfpegMerge_CTL.replaceFieldLabelTokens(configs[0].DisplayConfig__c);
				System.debug(LoggingLevel.FINE,'getConfiguration: field labels replaced in display config');
			}
			else {
				System.debug(LoggingLevel.FINE,'getConfiguration: no field label in display config');
			}
		}
		else {
			System.debug(LoggingLevel.FINE,'getConfiguration: empty display config');
		}

		System.debug(LoggingLevel.FINE,'getConfiguration: END with label ' + configs[0].MasterLabel);
		return (Object) (configs[0]);
	}

	/***
	* @description  Standard method to fetch the list of records corresponding to a
	*               preconfigured sfpegList__mdt query record in a specific context.
	*               SOQL, SOSL and Apex query types are supported.
	*               All records are merge in a single list in case of SOSL.
	* @param    name    Dev Name of the Query configuration record to execute
	* @param    input   Context Object record containing all the input data expected
	*                   by the query (based on its QueryInput__c field value)
	* @return   List<Object>  List of Objects corresponding to the result of the Query.
	* @exception   AuraHandledException If query configuration, apex implementation not found or if any
	*                                   SOQL issue is encountered (wrong query syntax).
	***/
	@AuraEnabled
	public static List<Object> getData(final String name, final Object input) {
		System.debug('getData: START with configuration name ' + name);

		sfpegList__mdt query = getConfig(name);
		System.debug(LoggingLevel.FINE,'getData: query config fetched');

		if (query.QueryType__c == 'SOQL') {
			System.debug(LoggingLevel.FINE,'getData: executing SOQL query ' + query.QuerySOQL__c);
			String mergedQuery = mergeQuery(query.QuerySOQL__c, (Map<Object,Object>) input, query.BypassEscaping__c);
			System.debug(LoggingLevel.FINE,'getData: SOQL query merged ' + mergedQuery);

			try {
				System.debug('getData: END / triggering SOQL mergedQuery');
				return executeSoql(mergedQuery, query.BypassSharing__c, query.BypassFLS__c);
			}
			catch (Exception error) {
				System.debug(LoggingLevel.WARN,'getData: END / KO - ' + error.getMessage());
				throw new AuraHandledException('SOQL Query failure: ' + error.getMessage());
			}
		}
		else if (query.QueryType__c == 'Apex') {
			System.debug(LoggingLevel.FINE,'getData: executing Apex query ' + query.QueryClass__c);
			try {
				Map<String,Object> classDetails = getClassInstance(query.QueryClass__c);
				sfpegListQuery_SVC listQueryInstance = (sfpegListQuery_SVC) (classDetails.get('Instance'));
				String methodName = (String) (classDetails.get('Method'));
				System.debug('getData: END invoking handler action for class');
				return listQueryInstance.getData(input,methodName);
			}
			catch(Exception error) {
				System.debug(LoggingLevel.WARN,'getData: END / KO - ' + error.getMessage());
				throw new AuraHandledException('Apex Query failure: ' + error.getMessage());
			}
		}
		else if (query.QueryType__c == 'SOSL') {
			System.debug(LoggingLevel.FINE,'getData: executing SOSL search ' + query.QuerySOQL__c);
			String mergedQuery = mergeQuery(query.QuerySOQL__c, (Map<Object,Object>) input, query.BypassEscaping__c);
			System.debug(LoggingLevel.FINE,'getData: SOSL search merged ' + mergedQuery);

			try {
				System.debug('getData: END / triggering SOSL mergedQuery');
				return executeSosl(mergedQuery, query.BypassSharing__c, query.BypassFLS__c);
			}
			catch (Exception error) {
				System.debug(LoggingLevel.WARN,'getData: END / KO - ' + error.getMessage());
				throw new AuraHandledException('SOSL Search failure: ' + error.getMessage());
			}
			/*
			try {
				System.debug('getData: triggering SOSL mergedQuery');
				List<List<sObject>> soslResults = executeSosl(mergedQuery, query.BypassSharing__c, query.bypassFLS__c);
				System.debug('getData: SOSL results received' + soslResults);

				List<Object> soslMergedList = new List<Object>();
				for (List<sObject> iter : soslResults) {
					if (iter.size() > 0) {
						Schema.DescribeSObjectResult objectDesc = ((iter[0]).getSObjectType()).getDescribe();
						System.debug('getData: registering results for object type ' + objectDesc);

						String objectName = objectDesc.getName();
						String objectLabel = objectDesc.getLabel();
						String objectIcon;
						if (OBJECT_ICON_MAP.containsKey(objectName)) {
							objectIcon = OBJECT_ICON_MAP.get(objectName);
						}
						else if (objectDesc.isCustom()) {
							objectIcon = 'custom:' + getCustomObjectIcon(objectName);
						}
						else {
							objectIcon = 'standard:' +  objectName.toLowerCase();
						}

						Map<String, Schema.SObjectField> objectFieldMap = objectDesc.fields.getMap();
						System.debug('getData: Object fields extracted ' + objectFieldMap.keySet());
						String nameField;
						String nameFieldLabel;
						if (objectFieldMap.containsKey('Name') && objectFieldMap.get('Name').getDescribe().isnameField()) {
							System.debug('getData: registering standard Name field ');
							nameField = 'Name';
							nameFieldLabel = objectFieldMap.get('Name').getDescribe().getLabel();
						}
						else {
							System.debug('getData: looking for Name field ');
							DescribeFieldResult iterFieldDesc;
							for (String iterField : objectFieldMap.keySet()) {
								System.debug(LoggingLevel.FINEST,'getData: processing field ' + iterField);
								iterFieldDesc = objectFieldMap.get(iterField).getDescribe();
								//System.debug(LoggingLevel.FINE,'getData: description extracted ' + iterFieldDesc);
								if (iterFieldDesc.isnameField()) {
									System.debug('getData: Name field found ' + iterFieldDesc.getLocalName());
									nameField = iterFieldDesc.getLocalName();
									nameFieldLabel = iterFieldDesc.getLabel();
									break;
								}
							}
						}

						List<Object> iterList = (List<Object>) (JSON.deserializeUntyped(JSON.serialize(iter)));
						for (Object iterObj : iterList) {
							Map<String,Object> iterMap = ((Map<String,Object>)iterObj);
							iterMap.put('ObjectApiName',objectName);
							iterMap.put('ObjectLabel', objectLabel);
							iterMap.put('ObjectIcon', objectIcon);
							iterMap.put('NameField', nameField);
							iterMap.put('NameLabel', nameFieldLabel);
							iterMap.remove('attributes');
						}
						soslMergedList.addAll(iterList);
					}
				}
				System.debug('getData: END / SOSL results merged ' + soslMergedList);
				return (list<Object>) soslMergedList;
			}
			catch (Exception error) {
				System.debug(LoggingLevel.WARN,'getData: END / KO - ' + error.getMessage());
				throw new AuraHandledException('SOSL Search failure: ' + error.getMessage());
			}
			*/
		}
		else {
			System.debug(LoggingLevel.WARN,'getData: END / KO - Unsupported Configuration type' + query.QueryType__c);
			throw new AuraHandledException('Unsupported Configuration type ' + query.QueryType__c + ' for config ' + name);
		}
	}

	/***
	* @description  If lazy loading is configured on the List LWC component, all records are not
	*               returned at once. In such a case the getData() method is not used but 2
	*               separate methods arre available to fetch the total number of results and
	*               each result set independently.
	*               This method meets the first need.
	* @param    name    Dev Name of the Query configuration record to execute
	* @param    input   Context Object record containing all the input data expected
	*                   by the query (based on its QueryInput__c field value)
	* @return   Integer Number of results of the Query.
	* @exception    AuraHandledException    If query configuration, apex implementation not found or if any
	*                                       SOQL issue is encountered (wrong query syntax).
	***/
	@AuraEnabled
	public static Integer getCount(final String name, final Object input) {
		System.debug('getCount: START with name ' + name);

		sfpegList__mdt query = getConfig(name);
		System.debug(LoggingLevel.FINE,'getCount: query config fetched');

		if (query.QueryType__c == 'SOQL') {
			System.debug(LoggingLevel.FINE,'getCount: executing count query ' + query.QueryCount__c);
			String mergedQuery = mergeQuery(query.QueryCount__c, (Map<Object,Object>) input, query.BypassEscaping__c);
			System.debug(LoggingLevel.FINE,'getCount: count query merged ' + mergedQuery);

			try {
				System.debug('getCount: END / triggering mergedQuery');
				//return database.countQuery(mergedQuery);
				return executeSoqlCount(mergedQuery, query.BypassSharing__c);
			}
			catch (Exception error) {
				System.debug(LoggingLevel.WARN,'getCount: END / KO - ' + error.getMessage());
				throw new AuraHandledException('Count Query failure: ' + error.getMessage());
			}
		}
		else if (query.QueryType__c == 'Apex') {
			System.debug(LoggingLevel.FINE,'getCount: executing Apex query ' + query.QueryClass__c);
			try {
				Map<String,Object> classDetails = getClassInstance(query.QueryClass__c);
				sfpegListQuery_SVC listQueryInstance = (sfpegListQuery_SVC) (classDetails.get('Instance'));
				String methodName = (String) (classDetails.get('Method'));
				System.debug('getData: END invoking handler action for class');
				return listQueryInstance.getCount(input,methodName);
			}
			catch(Exception error) {
				System.debug(LoggingLevel.WARN,'getCount: END / KO - ' + error.getMessage());
				throw new AuraHandledException('Apex Count failure: ' + error.getMessage());
			}
		}
		else {
			System.debug(LoggingLevel.WARN,'getCount: END / KO - Unsupported Paginated Configuration type' + query.QueryType__c);
			throw new AuraHandledException('Unsupported Paginated Configuration type ' + query.QueryType__c + ' for config ' + name);
		}
	}

	/***
	* @description  If lazy loading is configured on the List LWC component, all records are not
	*               returned at once. In such a case the getData() method is not used but 2
	*               separate methods arre available to fetch the total number of results and
	*               each result set independently.
	*               This method meets the second need, an offset being provided to progressively
	*               request each set of record.
	* @param    name        Dev Name of the Query configuration record to execute
	* @param    input       Context Object record containing all the input data expected
	*                       by the query (based on its QueryInput__c field value)
	* @param    lastRecord  Pagination field value of the previous last record returned (null at first pagination)
	* @return   List<Object>  List of Objects corresponding to the result of the Query.
	* @exception   AuraHandledException If query configuration, apex implementation not found or if any
	*                                   SOQL issue is encountered (wrong query syntax).
	***/
	@AuraEnabled
	public static List<Object> getPaginatedData(final String name, final Object input , final String lastRecord) {
		System.debug('getPaginatedData: START with configuration name ' + name);
		System.debug(LoggingLevel.FINE,'getPaginatedData: input provided ' + input);
		System.debug(LoggingLevel.FINE,'getPaginatedData: lastRecord provided ' + lastRecord);

		sfpegList__mdt query = getConfig(name);
		System.debug(LoggingLevel.FINE,'getPaginatedData: query config fetched');

		if (query.QueryType__c == 'SOQL') {
			System.debug(LoggingLevel.FINE,'getPaginatedData: executing count query ' + query.QuerySOQL__c);

			if (!(query.QuerySOQL__c).contains('{{{PAGE}}}')) {
				System.debug(LoggingLevel.WARN,'getPaginatedData: END / KO - Missing {{{PAGE}}} key in configured SOQL query');
				throw new AuraHandledException('Paginated SOQL Query failure: Missing {{{PAGE}}} key in configured query');
			}

			Map<Object,Object> pageInput = initPagination(query.QueryOrderBy__c,query.QueryOrder__c,lastRecord);
			pageInput.putAll((Map<Object,Object>)input);
			System.debug(LoggingLevel.FINE,'getPaginatedData: pagination Input init ' + pageInput);

			String mergedQuery = mergeQuery(query.QuerySOQL__c, pageInput, query.BypassEscaping__c);
			System.debug(LoggingLevel.FINE,'getPaginatedData: paginated SOQL query merged ' + mergedQuery);

			try {
				System.debug('getPaginatedData: END / triggering mergedQuery');
				return executeSoql(mergedQuery, query.BypassSharing__c, query.BypassFLS__c);
			}
			catch (Exception error) {
				System.debug(LoggingLevel.WARN,'getPaginatedData: END / KO - ' + error.getMessage());
				throw new AuraHandledException('Paginated SOQL Query failure: ' + error.getMessage());
			}
		}
		else if (query.QueryType__c == 'Apex') {
			System.debug(LoggingLevel.FINE,'getPaginatedData: executing Apex query ' + query.QueryClass__c);
			try {
				Map<String,Object> classDetails = getClassInstance(query.QueryClass__c);
				sfpegListQuery_SVC listQueryInstance = (sfpegListQuery_SVC) (classDetails.get('Instance'));
				String methodName = (String) (classDetails.get('Method'));
				System.debug('getData: END invoking handler action for class');
				return listQueryInstance.getPaginatedData(input,methodName,lastRecord);
			}
			catch(Exception error) {
				System.debug(LoggingLevel.WARN,'getPaginatedData: END / KO - ' + error.getMessage());
				throw new AuraHandledException('Paginated Apex action failure: ' + error.getMessage());
			}
		}
		else {
			System.debug(LoggingLevel.WARN,'getCount: END / KO - Unsupported Paginated Configuration type' + query.QueryType__c);
			throw new AuraHandledException('Unsupported Paginated Configuration type ' + query.QueryType__c + ' for config ' + name);
		}
	}


	//######################################################################
	//###################### PRIVATE UTILITIES #############################
	//######################################################################

	/***
	* @description Private utility method to fetch processing information for a List
	*              query configuration, given its developer Name.
	* @param       name             Dev Name of the Query configuration record
	* @return      sfpegList__mdt   Query execution details (depending on type)
	* @exception   AuraHandledException If no Configuration found.
	***/
	public static sfpegList__mdt getConfig(final String name) {
		System.debug(LoggingLevel.FINE,'getConfig: START for name ' + name);

		List<sfpegList__mdt> configs = [    SELECT	MasterLabel, QueryType__c, QueryClass__c, QuerySOQL__c,
													QueryCount__c, QueryOrderBy__c, QueryOrder__c, Permission__c,
													BypassSharing__c, BypassEscaping__c, BypassFLS__c
											FROM sfpegList__mdt
											WHERE DeveloperName =  :name];
		if ((configs == null) || (configs.size() != 1)) {
			CONFIG = null;
			throw new AuraHandledException('Configuration not found with name ' + name);
		}
		CONFIG = configs[0];
		System.debug(LoggingLevel.FINEST,'getConfig: configuration found');

		if ((String.isNotEmpty(CONFIG.Permission__c)) && (!FeatureManagement.checkPermission(CONFIG.Permission__c))) {
			System.debug(LoggingLevel.ERROR,'getConfig: END KO / User has no access to configuration ' + CONFIG.MasterLabel);
			throw new AuraHandledException('User has not the permission required for the configuration (' + CONFIG.Permission__c + ')');
		}

		System.debug(LoggingLevel.FINE,'getConfig: END OK for ' + CONFIG.MasterLabel);
		return CONFIG;
	}

	/***
	* @description  Public utility method to merge the context inputs withing a query
	*               template. It executes tag replacement for all tokens mentioned within
	*               the input map.
	*				Single quotes in token values are systematically escaped (as \\'),
	*				except for the pagination 'PAGE' one or if bypassEscaping property is
	*				set to true.
	* @param        queryTemplate   SOSL or SOQL query string template containing merge
	*                               tokens (as {{{XXX.xxxxx}}} tags) to be replaced.
	* @param        inputMap        Map of input tokens by domain
	* @param        bypassEscaping	Flag to bypass single quote escaping when merging tokens
	* @return       String          Merged query.
	* @exception    AuraHandledException If no queryTemplate provided.
	***/
	public static String mergeQuery(final String queryTemplate, final Map<Object,Object> inputMap, final Boolean bypassEscaping) {
		System.debug('mergeQuery: START with ' + queryTemplate);
		System.debug(LoggingLevel.FINE,'mergeQuery: inputMap provided ' + inputMap);

		if (String.isEmpty(queryTemplate)) {
			System.debug(LoggingLevel.WARN,'mergeQuery: END KO / missing queryTemplate ');
			throw new AuraHandledException('No SOSL/SOQL query configured!');
		}

		String mergedQuery = queryTemplate;
		for (Object iter : inputMap.keySet()) {
			System.debug(LoggingLevel.FINEST,'mergeQuery: processing token ' + iter);
			String iterValue;
			if ((bypassEscaping) || (iter == 'PAGE')){
				iterValue = (string)(inputMap.get(iter));
			}
			else {
				iterValue = String.escapeSingleQuotes(String.escapeSingleQuotes((string)(inputMap.get(iter))));
			}
			System.debug(LoggingLevel.FINEST,'mergeQuery: value retrieved ' + iterValue);
			mergedQuery = mergedQuery.replaceAll('\\{\\{\\{' + iter + '\\}\\}\\}',iterValue);
			//System.debug(LoggingLevel.FINEST,'mergeQuery: mergedQuery updated ' + mergedQuery);
		}
		System.debug('mergeQuery: END with  ' + mergedQuery);
		return mergedQuery;
	}

	/***
	* @description Private utility method to fetch an instance of the configured Apex action.
	* @param       actionName           Action names as the API name of the class to be instantiated (may be class.method)
	* @param       methodName           methodName extracted from the action name (if any)
	* @return      Map<String,Object>   Map with 2 entries: "Instance" with the class instance and "Method"
	*                                   with the possible method name extracted from the actionName.
	* @exception   AuraHandledException If no class provided found or class not found sfpegListQuery_SVC
	***/
	//private static  Map<String,Object> getClassInstance(final String actionName, String methodName) {
	@TestVisible
	private static  Map<String,Object> getClassInstance(final String actionName) {
		System.debug('getClassInstance: START for actionName ' + actionName);

		if (String.isEmpty(actionName)) {
			System.debug(LoggingLevel.WARN,'getClassInstance: END KO / missing actionName ');
			throw new AuraHandledException('No action name provided!');
		}

		Map<String,Object> resultMap = new Map<String,Object>{
			'Class' => actionName,
			'Method' => null
		};
		String className = actionName;
		if (actionName.contains('.')) {
			System.debug('getClassInstance: splitting action in class and method');
			String[] parts = className.split('\\.');
			resultMap.put('Class',parts[0]);
			className = parts[0];
			resultMap.put('Method',parts[1]);
		}
		System.debug(LoggingLevel.FINEST,'getClassInstance: resultMap init ' + resultMap);

		Type actionClass = Type.forName(className);
		if (null == actionClass) {
			System.debug(LoggingLevel.WARN,'getClassInstance: END KO / action handler not found for action ' + actionName);
			throw new AuraHandledException('Handler class for action ' + actionName + ' not found!');
		}
		resultMap.put('Instance',actionClass.newInstance());

		System.debug('getClassInstance: END / returning instance details ' + resultMap);
		return resultMap;
	}

	/***
	* @description  Private utility method to initialize a pagination clause, as a set of
	*               specific merge tokens & values. For now, only a {{{PAGE}}} token is
	*               considered / initialized.
	* @param        fieldName           API Name of the field used for pagination
	* @param        orderDir            Direction of the Order by clause (asc / desc)
	* @param        lastValue           Pagination field value of the last record already fetched.
	* @return       Map<Object,Object>   Map of merge token values dedicated to pagination?
	* @exception    AuraHandledException If no fieldName provided
	***/
	@TestVisible
	private static Map<Object,Object> initPagination(final String fieldName, final String orderDir, final String lastValue) {
		System.debug('initPagination: START with field ' + fieldName);
		System.debug(LoggingLevel.FINE,'initPagination: direction provided ' + orderDir);
		System.debug(LoggingLevel.FINE,'initPagination: lastValue provided ' + lastValue);

		if (String.isEmpty(fieldName)) {
			System.debug(LoggingLevel.WARN,'initPagination: END / KO - Missing orderBy field configuration');
			throw new AuraHandledException('Paginated Query failure: No OrderBy field configured');
		}

		String paginationClause = ' Id != null '; // default initial page clause.
		if (String.isNotEmpty(lastValue)) {
			System.debug(LoggingLevel.FINE,'initPagination: computing clause');
			paginationClause = fieldName + ((orderDir == 'ASC') ? ' > \'' : ' < \'') + lastValue + '\'';
		}

		Map<Object,Object> returnMap = new Map<Object,Object>{
			'PAGE' => paginationClause
		};

		System.debug('initPagination: END returning  ' + returnMap);
		return returnMap;
	}


	/***
	* @description  Private utility method to fetch the SLDS icon name related to a custom SObject.
	*               It parses all tabs included in all apps to try and find the SLDS SVG icon name
	*               associated to the custom object tab.
	*               The object tab should be included at least in one of the apps to become available.
	*               A default 'custom9' value is returned by default.
	* @param        objectName  API Name of the SObject
	* @return       String      customXX name of the SLDS icon related
	* @exception    none
	***/
	@TestVisible
	private static String getCustomObjectIcon(final String objectName) {
		System.debug('getCustomObjectIcon: START with object ' + objectName);

		String objectIcon = 'custom9';
		List<Schema.DescribeTabSetResult> tabSetDesc = Schema.describeTabs();
		for (Schema.DescribeTabSetResult iter : tabSetDesc) {
			System.debug('getCustomObjectIcon: processing App ' + iter.getLabel());
			List<Schema.DescribeTabResult> iterTabs = iter.getTabs();
			for (Schema.DescribeTabResult iterTab : iterTabs) {
				if (iterTab.isCustom()) {
					System.debug('getCustomObjectIcon: processing Tab ' + iterTab.getSObjectName());
					if (iterTab.getSObjectName() == objectName) {
						System.debug('getCustomObjectIcon: fetching icon ID');
						List<Schema.DescribeIconResult> iterIcons = iterTab.getIcons();
						for (Schema.DescribeIconResult iterIcon : iterIcons) {
							if (iterIcon.getContentType() == 'image/svg+xml') {
								Integer lastSlash = (iterIcon.getUrl()).lastIndexOf('/') + 1;
								Integer lastDot = (iterIcon.getUrl()).lastIndexOf('.');
								objectIcon = (iterIcon.getUrl()).mid(lastSlash, lastDot - lastSlash);

								System.debug('getCustomObjectIcon: END / icon Name found ' + objectIcon);
								return objectIcon;
							}
						}
					}
					else {
						System.debug('getCustomObjectIcon: ignored (different object)');
					}
				}
				else {
					System.debug('getCustomObjectIcon: ignored (standard object)');
				}
			}
		}
		System.debug('getCustomObjectIcon: END / object icon not found, returning default ' + objectIcon);
		return objectIcon;
	}

	/***
	* @description  Public utility method to execute a SOQL query
	* @param        query           SOQL query to execute
	* @param        bypassSharing   Boolean flag to bypass sharing
	* @param        bypassFLS   	Boolean flag to bypass FLS field stripping
	* @return       List<sObject>   Result of the SOQL query
	* @exception    none
	***/
	public static list<sObject> executeSoql(final String query, final Boolean bypassSharing, final Boolean bypassFLS) {
		System.debug('executeSoql: START');

		list<sObject> results;
		if (bypassSharing) {
			System.debug('executeSoql: executing without sharing request');
			sfpegBypassSharing_CTL subHandler = new sfpegBypassSharing_CTL();
			results = subHandler.querySoql(query);
		}
		else {
			System.debug('executeSoql: executing with sharing request');
			results = Database.query(query);
		}

		if (bypassFLS) {
			System.debug('executeSoql:END / FLS field stripping bypassed returning #items ' + results.size());
			return results;
		}
		else {
			System.debug('executeSoql: enforcing FLS field stripping on #items ' + results.size());
			SObjectAccessDecision securityDecision = Security.stripInaccessible(AccessType.READABLE, results);
			System.debug('executeSoql:END ');
			return securityDecision.getRecords();
		}
	}

	/***
	* @description  Private utility method to execute a SOQL count query
	* @param        query           SOQL count query to execute
	* @param        bypassSharing   Boolean flag to bypass sharing
	* @return       Integer         Result of the SOQL count query
	* @exception    none
	***/
	@TestVisible
	private static Integer executeSoqlCount(final String query, final Boolean bypassSharing) {
		System.debug('executeSoqlCount: START');

		if (bypassSharing) {
			System.debug('executeSoqlCount: END / executing without sharing request');
			sfpegBypassSharing_CTL subHandler = new sfpegBypassSharing_CTL();
			return subHandler.countSoql(query);
		}
		else {
			System.debug('executeSoqlCount: END / executing with sharing request');
			return Database.countQuery(query);
		}
	}

	/***
	* @description  Public utility method to execute a SOSL search
	* @param        query           SOSL query to execute
	* @param        bypassSharing   Boolean flag to bypass sharing
	* @param        bypassFLS   	Boolean flag to bypass FLS field stripping
	* @return       List<List<sObject>> Result of the SOSL query
	* @exception    none
	***/
	//public static List<List<sObject>> executeSosl(final String query, final Boolean bypassSharing, final Boolean bypassFLS) {
	public static List<Object> executeSosl(final String query, final Boolean bypassSharing, final Boolean bypassFLS) {
		System.debug('executeSosl: START');

		// Executing Query
		List<List<sObject>> soslResults;
		if (bypassSharing) {
			System.debug('executeSosl: END / executing without sharing request');
			sfpegBypassSharing_CTL subHandler = new sfpegBypassSharing_CTL();
			soslResults = subHandler.querySosl(query);
		}
		else {
			System.debug('executeSosl: END / executing with sharing request');
			soslResults = Search.query(query);
		}

		// Applying FLS
		if (bypassFLS) {
			System.debug('executeSosl:END / FLS field stripping bypassed');
		}
		else {
			System.debug('executeSosl: enforcing FLS field stripping');
			List<List<sObject>> filteredResults = new List<List<sObject>>();
			for (List<sObject> iter : soslResults) {
				SObjectAccessDecision securityDecision = Security.stripInaccessible(AccessType.READABLE, iter);
				filteredResults.add(securityDecision.getRecords());
			}
			System.debug('executeSosl: stripping done');
			soslResults = filteredResults;
		}

		// Reformatting results
		List<Object> soslMergedList = new List<Object>();
		for (List<sObject> iter : soslResults) {
			if (iter.size() > 0) {
				Schema.DescribeSObjectResult objectDesc = ((iter[0]).getSObjectType()).getDescribe();
				System.debug('executeSosl: registering results for object type ' + objectDesc);

				String objectName = objectDesc.getName();
				String objectLabel = objectDesc.getLabel();
				String objectIcon;
				if (OBJECT_ICON_MAP.containsKey(objectName)) {
					objectIcon = OBJECT_ICON_MAP.get(objectName);
				}
				else if (objectDesc.isCustom()) {
					objectIcon = 'custom:' + getCustomObjectIcon(objectName);
				}
				else {
					objectIcon = 'standard:' +  objectName.toLowerCase();
				}

				Map<String, Schema.SObjectField> objectFieldMap = objectDesc.fields.getMap();
				System.debug('executeSosl: Object fields extracted ' + objectFieldMap.keySet());
				String nameField;
				String nameFieldLabel;
				if (objectFieldMap.containsKey('Name') && objectFieldMap.get('Name').getDescribe().isnameField()) {
					System.debug('executeSosl: registering standard Name field ');
					nameField = 'Name';
					nameFieldLabel = objectFieldMap.get('Name').getDescribe().getLabel();
				}
				else {
					System.debug('executeSosl: looking for Name field ');
					DescribeFieldResult iterFieldDesc;
					for (String iterField : objectFieldMap.keySet()) {
						System.debug(LoggingLevel.FINEST,'getData: processing field ' + iterField);
						iterFieldDesc = objectFieldMap.get(iterField).getDescribe();
						//System.debug(LoggingLevel.FINE,'getData: description extracted ' + iterFieldDesc);
						if (iterFieldDesc.isnameField()) {
							System.debug('executeSosl: Name field found ' + iterFieldDesc.getLocalName());
							nameField = iterFieldDesc.getLocalName();
							nameFieldLabel = iterFieldDesc.getLabel();
							break;
						}
					}
				}

				List<Object> iterList = (List<Object>) (JSON.deserializeUntyped(JSON.serialize(iter)));
				for (Object iterObj : iterList) {
					Map<String,Object> iterMap = ((Map<String,Object>)iterObj);
					iterMap.put('ObjectApiName',objectName);
					iterMap.put('ObjectLabel', objectLabel);
					iterMap.put('ObjectIcon', objectIcon);
					iterMap.put('NameField', nameField);
					iterMap.put('NameLabel', nameFieldLabel);
					iterMap.remove('attributes');
				}
				soslMergedList.addAll(iterList);
			}
		}
		System.debug('executeSosl: END / SOSL results merged ' + soslMergedList);
		return (list<Object>) soslMergedList;
	}

	/***
	* @description  Private class and methods to execute SOQL or SOSL queries in without sharing mode.
	***/
	private without sharing class sfpegBypassSharing_CTL {
		public list<sObject> querySoql(String queryString) {
			System.debug('querySoql: query requested '  + queryString);
			return Database.query(queryString);
		}
		public Integer countSoql(String queryString) {
			System.debug('countSoql: query requested ' + queryString);
			return Database.countQuery(queryString);
		}
		public List<List<sObject>> querySosl(String queryString) {
			System.debug('querySosl: query requested '  + queryString);
			return Search.query(queryString);
		}
	}
}