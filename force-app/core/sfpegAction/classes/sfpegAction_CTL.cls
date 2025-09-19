/***
* @description  Lightning controller to provide details about existing Action configurations.
* @author       P-E GROS
* @date         April 2021
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

@SuppressWarnings('PMD.ClassNamingConventions,PMD.FieldNamingConventions,PMD.ExcessiveParameterList')
public with sharing class sfpegAction_CTL {

	//#########################################################################
	// Static variables
	//#########################################################################

	/***
    * @description	Static variable containing the currently executed action configuration
	*				configuration metadata record
    ***/
    public static sfpegAction__mdt CONFIGURATION;

	/***
    * @description	Static variable containing the currently executed action control configuration
	*				coming from the JSON parsing of ActionControls__c field of the CONFIGURATION metadata record
	*				and corresponding to the action being executed.
    ***/
    public static Map<String,Object> CONTROLS;


	//#########################################################################
	// Public invocable methods
	//#########################################################################

	/***
	* @description  Simple method to fetch configuration details for an Action component.
	*               It provides the set of actions (and menus) as well as the
	*               possible LMS notification channels to subscribe to.
	* @param        name                DeveloperName of the Action configuration record
	* @return       Object              sfpegAction__mdt record with Actions__c, NotificationChannels__c,
	*                                   MasterLabel fields filled in.
	* @exception    AuraHandledException    Raised if no configuration found for the provided name
	***/
	@AuraEnabled(cacheable=true)
	public static Object getConfiguration(final String name) {
		System.debug(LoggingLevel.FINE,'getConfiguration: START with sfpegAction configuration name ' + name);

		if (!Schema.sObjectType.sfpegAction__mdt.isQueryable()) {
			System.debug(LoggingLevel.ERROR,'getConfiguration: END KO / User has not access to action configuration object');
			throw new AuraHandledException(System.Label.sfpegActionAccessErrorObject);
		}
		System.debug(LoggingLevel.FINEST,'getConfiguration: User has access to action configuration object');

		List<sfpegAction__mdt> configs = [  select MasterLabel, Actions__c, NotificationChannels__c, DoEvaluation__c, Permission__c
											from sfpegAction__mdt
											where DeveloperName = :name];
		if ((configs == null) || (configs.size() != 1)) {
			System.debug(LoggingLevel.ERROR,'getConfiguration: END - Missing/wrong configuration ' + name);
			throw new AuraHandledException('Configuration not found with name ' + name);
		}
		System.debug(LoggingLevel.FINEST,'getConfiguration: configuration found');
		if ((String.isNotEmpty(configs[0].Permission__c)) && (!FeatureManagement.checkPermission(configs[0].Permission__c))) {
			System.debug(LoggingLevel.ERROR,'getConfiguration: END KO / User has no access to configuration ' + configs[0].MasterLabel);
			throw new AuraHandledException(String.format(System.Label.sfpegActionAccessErrorRecord, new List<Object>{ configs[0].Permission__c, configs[0].MasterLabel }));
		}

		//System.debug(LoggingLevel.FINEST,'getConfiguration: END with configuration name ' + configs[0]);
		System.debug(LoggingLevel.FINE,'getConfiguration: END ' + configs[0].MasterLabel);
		return (Object) (configs[0]);
	}

	/***
	* @description  Method to execute an Apex operation.
	* @param        name	DeveloperName of the Action configuration record
	* @param        action  Name of the action to be executed (as an Apex class dev name or
	*                       ClassName.MethodName to trigger various logics)
	* @param        params  Context data to be provided as input to the Apex execute method.
	* @param        records In the context of a mass action, list of selected records.
	* @return       Object  Result of the Apex logic.
	* @exception    AuraHandledException    Raised if missing config/action input, no configuration found for the provided config
	*										or if user is not allowed to execute the action.
	***/
	@AuraEnabled
	public static Object executeApex(final String config, final String action, final Object params) {
		System.debug('executeApex: START with action name ' + action);
		System.debug(LoggingLevel.FINE,'executeApex: config provided ' + config);
		System.debug(LoggingLevel.FINE,'executeApex: params provided ' + params);

		if (String.isEmpty(config)) {
			System.debug(LoggingLevel.WARN,'executeApex: END - No config name provided !');
			throw new AuraHandledException('No config name provided!');
		}

		if (String.isEmpty(action)) {
			System.debug(LoggingLevel.WARN,'executeApex: END - No action name provided !');
			throw new AuraHandledException('No action name provided!');
		}

		if (!mayExecuteApex(config,action)) {
			System.debug(LoggingLevel.WARN, 'executeApex : END KO / returning User rights error');
			throw new AuraHandledException(System.Label.sfpegActionApexRightsError);
		}

		String className = action;
		String methodName = null;
		if (className.contains('.')) {
			System.debug('executeApex: splitting action in class and method');
			String[] parts = className.split('\\.');
			className = parts[0];
			methodName = parts[1];
		}
		System.debug(LoggingLevel.FINEST,'executeApex: className set '  + className);
		System.debug(LoggingLevel.FINEST,'executeApex: methodName set ' + methodName);

		Type actionClass = Type.forName(className);
		if (null == actionClass) {
			System.debug(LoggingLevel.WARN,'executeApex: END KO / action handler not found  for ' + action);
			throw new AuraHandledException('Handler class for action ' + action + ' not found!');
		}
		System.debug('executeApex: action handler found');
		sfpegAction_SVC actionInstance = (sfpegAction_SVC) actionClass.newInstance();

		System.debug('executeApex: END / invoking handler action for class');
		return actionInstance.execute(params,methodName);
	}

	/***
	* @description  Method to execute a DML operation.
	* @param        config			DeveloperName of the Action configuration record
	* @param        action			Optional entry in the Action Controls of the provided configuration record
	*								if standard DML controls are bypassed on records
	* @param        operation       Name of the DML operation to execute (insert, update, delete).
	* @param        records         List of SObject on which to execute a DML
	* @return       List<sObject>   Same list of SObjects after the DML (e.g. with IDs after insert)
	* @exception    AuraHandledException    Raised if no configuration found for the provided name.
	***/
	@AuraEnabled
	public static List<sObject> executeDML(final string config, final string action, final string operation, list<sObject> records) {
		System.debug('executeDML : START operation ' + operation);
		System.debug(LoggingLevel.FINE,'executeDML: config provided ' + config);
		System.debug(LoggingLevel.FINE,'executeDML: action provided ' + action); 
		System.debug(LoggingLevel.FINE,'executeDML: #records provided ' + records?.size());

		if (String.isEmpty(config)) {
			System.debug(LoggingLevel.WARN,'executeDML: END - No config name provided !');
			throw new AuraHandledException('No config name provided!');
		}

		if (!mayExecuteDML(config,action,operation,records)) {
			System.debug(LoggingLevel.WARN, 'executeDML : END KO / returning User rights error');
			throw new AuraHandledException(System.Label.sfpegActionDmlRightsError);
		}

		try {
			switch on operation {
				when 'insert' {
					insert records; //NOPMD controls done in mayExecuteDML() method
					System.debug('executeDML : END itemList inserted ' + records);
				}
				when 'update' {
					update records; //NOPMD controls done in mayExecuteDML() method
					System.debug('executeDML : END itemList updated ' + records);
				}
				when 'delete' {
					delete records; //NOPMD controls done in mayExecuteDML() method
					System.debug('executeDML : END itemList deleted ' + records);
				}
				/*when 'upsert' {
					if (String.isBlank(extIdField)) {
					upsert records;
						System.debug('executeDML : END itemList upserted (via ID match) ' + records);
					}
					else {
						Schema.DescribeSObjectResult objType = records[0].getSObjectType().getDescribe();
						System.debug('executeDML : object type identified ' + objType.getName());
						Schema.SObjectField extId = objType.fields.getMap().get(extIdField);
						System.debug('executeDML : external ID field found ' + extId.getDescribe().getName());
						database.upsert(records,extId);
						System.debug('executeDML : END itemList upserted (via external ID match) ' + records);
					}
				}*/
				when else {
					System.debug(LoggingLevel.ERROR,'executeDML : unsupported operation ' + operation);
					StringException  errInvalid = new StringException();
					errInvalid.setMessage('Unknown or unsupported operation (' + operation + ') requested!');
					throw errInvalid;
				}
			}
			return records;
		}
		catch (DmlException e) {
			System.debug(LoggingLevel.ERROR, 'executeDML : DML exception raised ' + e);
			System.debug(LoggingLevel.ERROR, 'executeDML : END KO / returning first DML error ' + e.getDmlMessage(0));
			throw new AuraHandledException(e.getDmlMessage(0));
		}
		catch (Exception e) {
			System.debug(LoggingLevel.ERROR, 'executeDML : exception raised ' + e);
			System.debug(LoggingLevel.ERROR, 'executeDML : END KO / returning error ' + e.getMessage());
			throw new AuraHandledException(e.getMessage());
		}
	}


	//#########################################################################
	// Private utility methods
	//#########################################################################

	/***
	* @description	Private utility method to fetch control information for an
	*				action configuration, given its developer Name and a specific action.
	*				Automatically initializes the CONFIGURATION and CONTROLS static variables.
	* @param		config		Dev Name of the Query configuration record
	* @param		action		name of the action to execute
	* @return		Boolean		True if a control has been found for the config / action (CONTROLS not null)
	* @exception   AuraHandledException If no Configuration found, no user access to config or JSON parsing problem.
	***/
	public static Boolean hasControlConfig(final String config, final string action) {
		System.debug(LoggingLevel.FINE,'hasControlConfig: START for config ' + config);
		System.debug(LoggingLevel.FINE,'hasControlConfig: and action ' + action);
		CONFIGURATION = null;
		CONTROLS = null;

		if (!Schema.sObjectType.sfpegAction__mdt.isQueryable()) {
			System.debug(LoggingLevel.ERROR,'hasControlConfig: END KO / User has not access to action configuration object');
			throw new AuraHandledException(System.Label.sfpegActionAccessErrorObject);
		}
		System.debug(LoggingLevel.FINEST,'hasControlConfig: User has access to action configuration object');

		List<sfpegAction__mdt> configs = [	SELECT MasterLabel, Actions__c, ActionControls__c, Permission__c
											FROM sfpegAction__mdt
											WHERE DeveloperName = :config];
		if ((configs == null) || (configs.size() != 1)) {
			System.debug(LoggingLevel.ERROR,'hasControlConfig: END KO / Configuration not found with name ' + config);
			throw new AuraHandledException('Configuration not found with name ' + config);
		}
		CONFIGURATION = configs[0];
		System.debug(LoggingLevel.FINEST,'hasControlConfig: configuration found');

		if ((String.isNotEmpty(CONFIGURATION.Permission__c)) && (!FeatureManagement.checkPermission(CONFIGURATION.Permission__c))) {
			System.debug(LoggingLevel.ERROR,'hasControlConfig: END KO / User has no access to configuration ' + CONFIGURATION.MasterLabel);
			throw new AuraHandledException(String.format(System.Label.sfpegActionAccessErrorRecord, new List<Object>{ CONFIGURATION.Permission__c, CONFIGURATION.MasterLabel }));
		}

		if (String.isEmpty(action)) {
			System.debug(LoggingLevel.FINEST,'hasControlConfig: no action provided');
		}
		else if (String.isNotEmpty(CONFIGURATION.ActionControls__c)) {
			System.debug(LoggingLevel.FINEST,'hasControlConfig: parsing ActionControls ' + CONFIGURATION.ActionControls__c);
			try {
				CONTROLS = (Map<String,Object>) (JSON.deserializeUntyped(CONFIGURATION.ActionControls__c));
				System.debug(LoggingLevel.FINEST,'hasControlConfig: ActionControls parsed');

				if (CONTROLS.containsKey(action)) {
					System.debug('hasControlConfig: controls found for action ' + action);
					CONTROLS = (Map<String,Object>) CONTROLS.get(action);
					System.debug('hasControlConfig: action controls extracted ' + CONTROLS);
				}
				else {
					System.debug('hasControlConfig: no controls found for action ' + action);
					CONTROLS = null;
				}
			}
			catch (Exception error) {
				System.debug(LoggingLevel.ERROR,'hasControlConfig: END KO / Control configuration parsing failed ' + error);
				throw new AuraHandledException('Control configuration parsing failed for ' + config + ': ' + error.getMessage());
			}
		}
		else {
			System.debug(LoggingLevel.FINEST,'hasControlConfig: no ActionControls defined');
		}

		System.debug(LoggingLevel.FINE,'hasControlConfig: END OK for ' + CONFIGURATION.MasterLabel);
		return (CONTROLS != null);
	}


	/***
	* @description  Private method to check User rights and action parameters on an Apex action.
	* @param        config		DeveloperName of the Action configuration record
	* @param        action		Name of the action to be executed (as an Apex class dev name or
	*                       	ClassName.MethodName to trigger various logics)
	* @return       Boolean		Status of the control
	* @exception    AuraHandledException    Raised if no configuration found for the provided name.
	***/
	private static boolean mayExecuteApex(final String config, final string action) {
		System.debug('mayExecuteApex: START');

		Boolean statusOK = true;
		if (hasControlConfig(config,action)) {
			System.debug('mayExecuteApex: checking action controls ');
			statusOK = CONFIGURATION.Actions__c.contains(action) && hasPermission();
			System.debug('mayExecuteApex : permission checked ' + statusOK);
		}
		else {
			System.debug('mayExecuteApex: no action controls defined');
		}

		System.debug('mayExecuteApex: END returning ' + statusOK);
		return statusOK;
	}


	/***
	* @description  Private method to check standard User rights on a set of records for a DML operation
	*				taking into account special bypass rights.
	* @param        config			DeveloperName of the Action configuration record
	* @param        action			Optional entry in the Action Controls of the provided configuration record
	*								if standard DML controls are bypassed on records
	* @param        operation       Name of the DML operation to execute (insert, update, delete).
	* @param        records         List of SObject on which to execute a DML
	* @return       Boolean		    Status of the control ()
	* @exception    AuraHandledException    Raised if no configuration found for the provided name.
	***/
	private static boolean mayExecuteDML(final String config, final string action, final string operation, list<sObject> records) {
		System.debug('mayExecuteDML: START');

		Boolean statusOK = true;
		Boolean checkDmlRights = true;
		if (hasControlConfig(config,action)) {
			System.debug('mayExecuteDML: checking action controls ');

			statusOK = hasPermission();
			System.debug('mayExecuteDML: permission checked ' + statusOK);

			if (statusOK) {
				if (CONTROLS.containsKey('bypassFLS')) {
					checkDmlRights = (boolean) CONTROLS.get('bypassFLS');
					System.debug('mayExecuteDML: FLS bypass init ' + checkDmlRights);
				}
				statusOK = isDmlOK(operation,records);
				System.debug('mayExecuteDML: custom controls done ' + statusOK);
			}
		}
		else {
			System.debug('mayExecuteDML: no action controls defined for action ' + action);
		}

		if (statusOK && checkDmlRights) {
			System.debug('mayExecuteDML: checking standard DML rights');
			statusOK = hasDmlRights(operation,records);
		}
		else {
			System.debug('mayExecuteDML: bypassing standard DML rights check');
		}

		System.debug('mayExecuteDML: END returning ' + statusOK);
		return statusOK;
	}


	/***
	* @description  Private method to check User permission for an action based on CONTROLS.
	*				CONTROLS variable is assumed to be initialized.
	* @return       Boolean		    Status of the control (true = may execute the action)
	***/
	private static boolean hasPermission() {
		System.debug('hasPermission: START');

		if (CONTROLS.containsKey('permission')) {
			String permissionName = (String) CONTROLS.get('permission');
			System.debug('hasPermission: checking permission ' + permissionName);

			if (!FeatureManagement.checkPermission(permissionName)) {
				System.debug(LoggingLevel.ERROR,'hasPermission: END KO / User has not the required permission ' + permissionName);
				return false;
			}
			else {
				System.debug('hasPermission: END / User has the required permission');
				return true;
			}
		}
		else {
			System.debug('hasPermission: END /  No permission required');
			return true;
		}
	}


	/***
	* @description  Private method to check operation consistency for an action based on CONTROLS.
	* @param        operation       Name of the DML operation to execute (insert, update, delete).
	* @param        records         List of SObject on which to execute a DML
	* @return       Boolean		    Status of the control
	***/
	private static boolean isDmlOK(final string operation, list<sObject> records) {
		System.debug('isDmlOK : START');

		if (CONTROLS.containsKey('operation')) {
			String operationOK = (String) CONTROLS.get('operation');
			System.debug('isDmlOK: controlling allowed operation ' + operationOK);
			
			if (!operation.equals(operationOK)) {
				System.debug(LoggingLevel.ERROR,'isDmlOK: END KO / Wrong operation requested ' + operation);
				return false;
			}
			else {
				System.debug('isDmlOK: correct operation requested');
			}
		}
		else {
			System.debug('isDmlOK: no operation control configured');
		}

		if (CONTROLS.containsKey('objects')) {
			Map<String,Object> objectsOK = (Map<String,Object>) CONTROLS.get('objects');
			System.debug('isDmlOK: controlling allowed objects and fields ' + objectsOK);
			
			for (SObject iter : records) {
				String iterObject = iter.getSObjectType().getDescribe().getName();
				if (objectsOK.containsKey(iterObject)) {
					System.debug(LoggingLevel.FINE,'isDmlOK: record object OK ' + iterObject);

					List<Object> fieldOK =(List<Object>) objectsOK.get(iterObject);
					Map<String,Object> iterFields = iter.getPopulatedFieldsAsMap();
					for (String iterField : iterFields.keySet()) {
						if (fieldOK.contains(iterField)) {
							System.debug(LoggingLevel.FINEST,'isDmlOK: record field OK ' + iterField);
						}
						else {
							System.debug(LoggingLevel.ERROR,'isDmlOK: END KO / record field KO ' + iterObject + '.' + iterField);
							return false;
						}
					}
				}
				else {
					System.debug(LoggingLevel.ERROR,'isDmlOK: END KO / record object KO ' + iterObject);
					return false;
				}
			}
		}
		else {
			System.debug('isDmlOK: no operation control configured');
		}

		System.debug('isDmlOK: END / DML operation allowed');
		return true;
	}


	/***
	* @description  Private method to check User rights on a set of records for a DML operation.
	* @param        operation       Name of the DML operation to execute (insert, update, delete).
	* @param        records         List of SObject on which to execute a DML
	* @return       Boolean		    Status of the control
	***/
	private static boolean hasDmlRights(final string operation, list<sObject> records) {
		System.debug('hasDmlRights : START');

		Boolean statusOK = true;
		Boolean doFieldCheck = true;
		Map<Schema.SObjectType,Set<String>> checkMap = new Map<Schema.SObjectType,Set<String>>();

		for (sObject iter : records) {
			Schema.SObjectType iterType = iter.getSObjectType();
			if (!checkMap.containsKey(iterType)) {
				Schema.DescribeSObjectResult iterTypeDesc = iterType.getDescribe();
				System.debug(LoggingLevel.FINEST,'hasDmlRights : controlling rights for object type  ' + iterTypeDesc.getName());
				switch on operation {
					when 'insert' {
						if (!iterTypeDesc.isCreateable()) {
							System.debug(LoggingLevel.ERROR,'hasDmlRights : User has not CREATE rights on object' + iterTypeDesc.getName());
							statusOK = false;
							break;
						}
					}
					when 'update' {
						if (!iterTypeDesc.isUpdateable()) {
							System.debug(LoggingLevel.ERROR,'hasDmlRights : User has not UPDATE rights on object' + iterTypeDesc.getName());
							statusOK = false;
							break;
						}
					}
					when 'delete' {
						if (!iterTypeDesc.isDeletable()) {
							System.debug(LoggingLevel.ERROR,'hasDmlRights : User has not DELETE rights on object' + iterTypeDesc.getName());
							statusOK = false;
							break;
						}
						doFieldCheck = false;
					} 
				}
				// id field is always non updateable and non createable and is added as default to handle later controls 
				Set<String> iterSet = new Set<String>();
				iterSet.add('Id');
				iterSet.add('id');
				checkMap.put(iterType,iterSet);
			}

			if (doFieldCheck) {
				System.debug(LoggingLevel.FINEST,'hasDmlRights : checking field create/update rights');

				Set<String> checkedFields = checkMap.get(iterType);
				Map<String,Object> iterFields = iter.getPopulatedFieldsAsMap();
				Map<String,Schema.SObjectField> fieldMap = iterType.getDescribe().fields.getMap();
				for (String iterField : iterFields.keySet()) {
					if (!checkedFields.contains(iterField)) {
						System.debug(LoggingLevel.FINEST,'hasDmlRights : checking field rights ' + iterField);
						Schema.DescribeFieldResult iterFieldDesc = fieldMap.get(iterField)?.getDescribe();

						switch on operation {
							when 'insert' {
								if (!iterFieldDesc.isCreateable()) {
									System.debug(LoggingLevel.WARN,'hasDmlRights : User has not CREATE rights on field' + iterField);
									statusOK = false;
									break;
								}
							}
							when 'update' {
								if (!iterFieldDesc.isUpdateable()) {
									System.debug(LoggingLevel.WARN,'hasDmlRights : User has not UPDATE rights on field' + iterField);
									statusOK = false;
									break;
								}
							}
						}
						checkedFields.add(iterField);
					}
				}
			}
		}

		System.debug('hasDmlRights : END returning ' + statusOK);
		return statusOK;
	}
}