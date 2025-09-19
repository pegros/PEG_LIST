/***
* @description  Lightning controller to provide various data for the merge utility.
*               Leverages the sfpegMergeLabels_VFP page to fetch custom label values (LBL).
* @author       P-E GROS
* @date         June 2021
* @see          sfpegMergeLabels_VFP
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
public with sharing class sfpegMerge_CTL {

	/***
	* @description  Method to fetch configuration values for the merge service.
	*               For a list of configuration data grouped by domain, it provides
	*               the corresponding data. It may be salesforce IDs for various
	*               elements such as reports or articles, full URL (with security token)
	*               for a VF page...
	* @param        configMap                Map of configuratiuon elements grouped by domain
	* @return       Map<String,Object>       Map of the requested elements with corresponding data.
	* @exception    AuraHandledException     Raised if no configuration found for the provided name
	***/
	@AuraEnabled(cacheable=true)
	public static Map<String,Object> getConfig(Map<Object,Object> configMap) {
		System.debug('getValues: START with configuration ' + configMap);

		if (!Schema.sObjectType.sfpegConfiguration__mdt.isQueryable()) {
			System.debug(LoggingLevel.ERROR,'getValues: END KO / User has not access to merge configuration object');
			//throw new AuraHandledException(System.Label.sfpegMergeAccessErrorObject);
			AuraHandledException newErr = new AuraHandledException('');
			newErr.setmessage(System.Label.sfpegMergeAccessErrorObject);
			throw newErr;
		}
		System.debug(LoggingLevel.FINEST,'getValues: User has access to merge configuration object');

		if (configMap == null) {
			System.debug(LoggingLevel.WARN,'getValues: END - No configuration map provided !');
			//throw new AuraHandledException('No configuration map provided!');
			AuraHandledException newErr = new AuraHandledException('');
			newErr.setmessage('No configuration map provided!');
			throw newErr;
		}

		Set<String> keySet = new Set<String>();
		for (Object iter : configMap.keySet()) {
			keySet.add((String)iter);
		}

		List<sfpegConfiguration__mdt> refConfig =
			[   SELECT Field__c, TargetField__c, Query__c, DeveloperName
				FROM sfpegConfiguration__mdt
				WHERE  DeveloperName in :keySet];
		Map<String,sfpegConfiguration__mdt> refMap = new Map<String,sfpegConfiguration__mdt>();
		if (refConfig != null) {
			for (sfpegConfiguration__mdt iter : refConfig) {
				refMap.put(iter.DeveloperName,iter);
			}
		}
		System.debug('getValues: refMap init ' + refMap);


		Map<String,Object> returnMap = new Map<String,Object>();
		for (Object iter : configMap.keySet()) {
			System.debug('getValues: processing iter ' + iter);
			Map<String,Object> iterResults = new Map<String,Object>();
			returnMap.put((String)iter,(Object)iterResults);

			List<Object> iterList = (List<Object>)(configMap.get((String)iter));
			if (iterList == null) {
				System.debug(LoggingLevel.WARN,'getValues: END - No configuration provided for key ' + iter);
				//throw new AuraHandledException('No configuration provided for key ' + iter + ' ! ');
				AuraHandledException newErr = new AuraHandledException('');
				newErr.setmessage('No configuration provided for key ' + iter + ' ! ');
				throw newErr;
			}
			System.debug('getValues: #Items to process ' + iterList.size());

			switch on (String)iter {
				when 'VFP' {
					System.debug('getValues: processing VF page URLs');
					for (Object iterVF : iterList) {
						System.debug(LoggingLevel.FINE,'getValues: adding URL for VF Page ' + iterVF);
						PageReference iterRef = new PageReference('/apex/' + iterVF);
						String iterURL = iterRef.getUrl();
						System.debug(LoggingLevel.FINE,'getValues: URL determined ' + iterURL);
						iterResults.put((String)iterVF,iterURL);
					}
					System.debug('getValues: VFPs processed' + iterResults);
				}
				when 'LBL' {
					System.debug('getValues: processing Custom Labels');

					String userLanguage = UserInfo.getLanguage();
					System.debug('getValues: userLanguage fetched ' + userLanguage);

					PageReference labelPageRef = Page.sfpegMergeLabels_VFP;
					labelPageRef.getParameters().putAll(
						new Map<String, String> {
							'lang' => userLanguage,
							'labels' => JSON.serialize(iterList)
						});
					Map<String, Object> labelMap = (Test.isRunningTest() ? new Map<String, Object>{'sfpegMergeAccessErrorObject' => 'sfpegMergeAccessErrorObject'} : (Map<String, Object>) JSON.deserializeUntyped((labelPageRef.getContent()).tostring()));
					labelMap.remove('END');
					for (String iterLabel : labelMap.keySet()) {
						iterResults.put(iterLabel, (String)(labelMap.get(iterLabel)));
					}
					System.debug('getValues: Custom Labels processed' + iterResults);
				}
				when 'RT' {
					System.debug('getValues: processing Record Types');

					for (Object iterRT : iterList) {
						System.debug(LoggingLevel.FINE,'getValues: processing RT ' + iterRT);

						String[] iterParts = ((String)iterRT).split('\\.');
						System.debug(LoggingLevel.FINE,'getValues: RT parts extracted ' + iterParts);
						if (iterParts.size() <> 2) {
							System.debug(LoggingLevel.WARN,'getValues: END - Unsupported Record type format (Record type ID fetch error)');
							//throw new AuraHandledException('Record type ID fetch error: ' + iterParts + ' should be in objectApiName.rtDevName format');
							AuraHandledException newErr = new AuraHandledException('');
							newErr.setmessage('Record type ID fetch error: ' + iterParts + ' should be in objectApiName.rtDevName format');
							throw newErr;
						}
						//Schema.RecordTypeInfo iterDesc = Schema.getGlobalDescribe().get(iterParts[0])?.getDescribe().getRecordTypeInfosByDeveloperName()?.get(iterParts[1]);
						Schema.RecordTypeInfo iterDesc = ((SObject)Type.forName('Schema.' + iterParts[0]).newInstance()).getSObjectType()?.getDescribe().getRecordTypeInfosByDeveloperName()?.get(iterParts[1]);
						System.debug(LoggingLevel.FINE,'getValues: RT desc fetched ' + iterDesc);
						if (iterDesc == null) {
							System.debug(LoggingLevel.WARN,'getValues: END - Unfound Record type ' + iterParts);
							//throw new AuraHandledException('Record type ID fetch error: ' + iterParts + ' RT not found');
							AuraHandledException newErr = new AuraHandledException('');
							newErr.setmessage('Record type ID fetch error: ' + iterParts + ' RT not found');
							throw newErr;
						}
						iterResults.put((String)iterRT,iterDesc.getRecordTypeId());
					}
					System.debug('getValues: RTs processed' + iterResults);
				}
				when 'PERM' {
					System.debug('getValues: processing Custom Permissions (enabled)');
					for (Object iterPerm : iterList) {
						System.debug(LoggingLevel.FINE,'getValues: testing permission ' + iterPerm);
						Boolean hasPermission = FeatureManagement.checkPermission((String)iterPerm);
						System.debug(LoggingLevel.FINE,'getValues: permission checked ' + hasPermission);
						iterResults.put((String)iterPerm,hasPermission);
					}
					System.debug('getValues: Custom Permissions (enabled) processed' + iterResults);
				}
				when 'NPERM' {
					System.debug('getValues: processing Custom Permissions (disabled)');
					for (Object iterPerm : iterList) {
						System.debug(LoggingLevel.FINE,'getValues: testing permission ' + iterPerm);
						Boolean hasPermission = FeatureManagement.checkPermission((String)iterPerm);
						System.debug(LoggingLevel.FINE,'getValues: permission checked ' + hasPermission);
						iterResults.put((String)iterPerm,!hasPermission);
					}
					System.debug('getValues: Custom Permissions (disabled) processed' + iterResults);
				}
				when 'CST' {
					System.debug('getValues: processing Custom Settings');

					List<String> whereParts = new List<String>();
					whereParts.add(UserInfo.getOrganizationId());
					whereParts.add(UserInfo.getProfileId());
					whereParts.add(UserInfo.getUserId());
					System.debug('getValues: IDs for WHERE clause fetched ' + whereParts);
					String soqlWhere = ' WHERE SetupOwnerId in (\'' + String.join(whereParts, '\',\'') + '\')';
					System.debug('getValues: WHERE clause init ' + soqlWhere);

					Map<String,Set<String>> settingMap = new Map<String,Set<String>>();
					for (Object iterCS : iterList) {
						System.debug(LoggingLevel.FINE,'getValues: analysing Custom Settings ' + iterCS);
						//List<String> iterCSparts = ((String)iterCS).split('\\.');
						List<String> iterCSparts = (String.escapeSingleQuotes((String)iterCS)).split('\\.');
						System.debug(LoggingLevel.FINE,'getValues: setting parts split ' + iterCSparts);
						Set<String> iterCSfields = settingMap.get(iterCSparts[0]);
						if (iterCSfields == null) {
							System.debug(LoggingLevel.FINE,'getValues: registering new Settings ' + iterCS);
							iterCSfields = new Set<String>();
							settingMap.put(iterCSparts[0],iterCSfields);
						}
						iterCSfields.add(iterCSparts[1]);
					}
					System.debug(LoggingLevel.FINE,'getValues: settingMap init ' + settingMap);
					
					for (String iterCSkey : settingMap.keySet()) {
						System.debug(LoggingLevel.FINE,'getValues: fetching fields for Custom Settings ' + iterCSkey);

						String iterQuery = 'SELECT SetupOwnerId,' + String.join(new List<String>(settingMap.get(iterCSkey)), ',') + ' FROM ' + iterCSkey + soqlWhere;
						System.debug(LoggingLevel.FINE,'getValues: query prepared ' + iterQuery);

						List<SObject> iterCSvalues = database.query(iterQuery); //NOPMD
						System.debug(LoggingLevel.FINE,'getValues: values fetched ' + iterCSvalues);

						SObject iterCSvalue = null;
						for (SObject iterVal : iterCSvalues) {
							if (iterCSvalue == null) {
								System.debug(LoggingLevel.FINE,'getValues: first value set ' + iterVal);
								iterCSvalue = iterVal;
							}
							else if (iterVal.get('SetupOwnerId') == UserInfo.getOrganizationId()) {
								System.debug(LoggingLevel.FINE,'getValues: ignoring Org default');
							}
							else if (iterVal.get('SetupOwnerId') == UserInfo.getUserId()) {
								System.debug(LoggingLevel.FINE,'getValues: overriding with user value');
								iterCSvalue = iterVal;
							}
							else if (iterCSvalue.get('SetupOwnerId') == UserInfo.getOrganizationId()) {
								System.debug(LoggingLevel.FINE,'getValues: overriding with profile value');
								iterCSvalue = iterVal;
							}
						}
						System.debug(LoggingLevel.FINE,'getValues: applicable value determined ' + iterCSvalue);

						for (String iterCSfield : settingMap.get(iterCSkey)) {
							System.debug(LoggingLevel.FINE,'getValues: registering field ' + iterCSfield);
							iterResults.put(iterCSkey + '.' + iterCSfield,iterCSvalue.get(iterCSfield));
						}
					}
					System.debug('getValues: Custom Settings processed' + iterResults);
				}
				when 'DMN' {
					// Need to split queries on Site, DomainSite and Domain as lookup fields are not
					// fetched in SOQL queries executed in Apex. 
					System.debug('getValues: processing DMN page URLs' + iterList);
					List<String> iterNames = String.join(iterList, ';').split(';');
					Map<Id,Site> siteMap = new Map<ID,Site>([SELECT Id, Name FROM Site WHERE Name IN :iterNames]); //NOPMD
					System.debug('getValues: siteMap fetched ' + siteMap);
					List<DomainSite> domainSiteList = [SELECT DomainId, SiteId FROM DomainSite WHERE SiteId IN :siteMap.keySet() AND Domain.Domain != null]; //NOPMD
					System.debug('getValues: domainSiteList  fetched ' + domainSiteList);
					Set<Id> siteIds = new Set<Id>();
					Map<Id,ID> siteDomainMap = new Map<Id,ID>();
					for (DomainSite iterDS : domainSiteList) {
						siteIds.add(iterDS.DomainId); siteDomainMap.put(iterDS.SiteId,iterDS.DomainId);
					}
					System.debug('getValues: siteIds extracted ' + siteIds);
					System.debug('getValues: siteDomainMap extracted ' + siteDomainMap);
					Map<ID,Domain> domainMap = new Map<ID,Domain>([SELECT Domain FROM Domain WHERE Id in :siteIds]); //NOPMD
					System.debug('getValues: domainMap fetched ' + domainMap);

					for (Site iterS : siteMap.values()) {
						System.debug(LoggingLevel.FINE,'getValues: processing site ' + iterS);
						ID iterSid = siteDomainMap.get(iterS.Id);
						System.debug(LoggingLevel.FINE,'getValues: domain ID extracted ' + iterSid);
						Domain iterSd = domainMap.get(iterSid);
						System.debug(LoggingLevel.FINE,'getValues: domain data fetched ' + iterSd);
						iterResults.put((String)iterS.Name,iterSd.Domain);
					}
					System.debug('getValues: DMNs processed' + iterResults);
				}
				when else {
					System.debug('getValues: processing registered query');

					sfpegConfiguration__mdt iterConfig = refMap.get((String)iter);
					if (iterConfig == null) {
						System.debug(LoggingLevel.WARN,'getValues: END - Unsupported configuration provided for key ' + iter);
						//throw new AuraHandledException('Unsupported configuration provided for key ' + iter + ' ! ');
						AuraHandledException newErr = new AuraHandledException('');
						newErr.setmessage('Unsupported configuration provided for key ' + iter + ' ! ');
						throw newErr;
					}
					List<String> bypassedIterList = new List<String>();
					for (Object iterVal : iterList) {
						bypassedIterList.add(String.escapeSingleQuotes((String)iterVal));
					}
					System.debug(LoggingLevel.FINEST, 'getValues: bypassedIterList initialized');
					//String iterQuery = iterConfig.Query__c + '(\'' + String.join(iterList, '\',\'') + '\')';
					String iterQuery = iterConfig.Query__c + '(\'' + String.join(bypassedIterList, '\',\'') + '\')';
					System.debug('getValues: query initialized ' + iterQuery );
					List<sObject> resultList = database.query(iterQuery); //NOPMD
					System.debug('getValues: resultList fetched ' + resultList );

					String targetField = (String.isBlank(iterConfig.TargetField__c) ? 'Id' : iterConfig.TargetField__c);
					System.debug('getValues: targetField init ' + targetField );
					for (SObject iterObj : resultList) {
						//iterResults.put((String)(iterObj.get(iterConfig.Field__c)),iterObj.Id);
						iterResults.put((String)(iterObj.get(iterConfig.Field__c)),iterObj.get(targetField));
					}
					System.debug('getValues: items processed' + iterResults);
				}
			}
		}
		System.debug('getValues: END with ' + returnMap);
		return returnMap;
	}

	/***
	* @description  Method to fetch field values details for a given record.
	*               Replaces LDS when @wire is not used to fetch User/Record
	*               context data.
	* @param        objectName          API name of the record object
	* @param        recordId            ID of the record
	* @param        fieldNames          List of API field names requested
	* @return       Object              Record with the requested fields filled in.
	* @exception    AuraHandledException    Raised if no record found for the provided ID
	***/
	@AuraEnabled(cacheable=false)
	public static Object getRecord(String objectName, String recordId, List<String> fieldNames) {
		System.debug(LoggingLevel.FINE,'getRecord: START with recordId ' + recordId);
		System.debug(LoggingLevel.FINE,'getRecord: objectName provided ' + objectName);
		System.debug(LoggingLevel.FINE,'getRecord: fieldNames requested ' + fieldNames);

		if ((objectName == null) || (recordId == null) || (fieldNames == null) || (fieldNames.size() == 0)) {
			System.debug(LoggingLevel.WARN,'getRecord: END - Missing input !');
			throw new AuraHandledException('Missing input!');
		}

		List<String> bypassedFieldNames = new List<String>();
		for (String iterVal : fieldNames) {
			bypassedFieldNames.add(String.escapeSingleQuotes(iterVal));
		}
		System.debug(LoggingLevel.FINEST,'getValues: bypassedFieldNames initialized');

		String soqlQuery = 'SELECT ' + String.join(bypassedFieldNames,',') + ' FROM ' + objectName + ' WHERE Id = \'' + recordId + '\' WITH SECURITY_ENFORCED';
		System.debug(LoggingLevel.FINEST,'getRecord: soqlQuery prepared ' + soqlQuery);

		List<sObject> sobjList = Database.query(soqlQuery); //NOPMD
		System.debug(LoggingLevel.FINEST,'getRecord: sobjList retrieved ' + sobjList);

		if ((sobjList == null) || (sobjList.size() != 1)) {
			System.debug(LoggingLevel.WARN,'getRecord: END - No record found !');
			throw new AuraHandledException('Missing record (or non accessible fields)! ' + recordId);
		}
		System.debug(LoggingLevel.FINE,'getRecord: END');
		return (Object)sobjList[0];
	}

	/***
	* @description  Utility server side method to extract the custom label merge tokens (LBL) in a string
	*               template and replace them with their user language dependent values.
	* @param        template    Input string in which tokens must be extracted and replaced
	* @return       String      Template input string with all label tokens replaced by their values
	* @exception    AuraHandledException    Raised if any label token is not found.
	***/
	public static String replaceLabelTokens(final String template) {
		System.debug(LoggingLevel.FINE,'replaceLabelTokens: START with template ' + template);

		//Parsing LBL tokens
		Pattern lblPattern = Pattern.compile('\\{\\{\\{LBL.\\w+\\}\\}\\}');
		Matcher lblMatcher = lblPattern.matcher(template);
		Set<String> lblTokens = new Set<String>();
		while (lblMatcher.find()) {
			System.debug(LoggingLevel.FINE,'replaceLabelTokens: processing match ' + lblMatcher.group(0));
			String token = lblMatcher.group(0).removeStart('{{{LBL.').removeEnd('}}}');
			lblTokens.add(token);
		}
		System.debug(LoggingLevel.FINE,'replaceLabelTokens: lblTokens extracted ' + lblTokens);// NOPMD ApexDangerousMethods suppress warning

		if (lblTokens.size() > 0) {
			//Fetching LBL values
			Map<String, Object> labelMap;
			if (Test.isRunningTest()) {
				//Special case as CF pages may not be rendered in a test !
				labelMap = new Map<String, Object>();
				for (String iter : lblTokens) {
					labelMap.put(iter,iter);
				}
			}
			else {
				String userLanguage = UserInfo.getLanguage();
				System.debug('replaceLabelTokens: userLanguage fetched ' + userLanguage);

				PageReference labelPageRef = Page.sfpegMergeLabels_VFP;
				labelPageRef.getParameters().putAll(new Map<String, String> {
					'lang' => userLanguage,
					'labels' => JSON.serialize(new List<String>(lblTokens))
				});

				String labelPage = (labelPageRef.getContent()).tostring();
                System.debug('replaceLabelTokens: labelPage evaluated ' + labelPage);
                if (labelPage.contains('\\\'')) { 
					labelPage = labelPage.replace('\\\'','\'');
                	System.debug('replaceLabelTokens: labelPage reworked ' + labelPage);
                }

				labelMap = (Map<String, Object>)JSON.deserializeUntyped((labelPageRef.getContent()).tostring());
				labelMap.remove('END');
			   System.debug('replaceLabelTokens: custom label values fetched ' + labelMap);
			}

			//Merging LBL values
			String mergedTemplate = template;
			for (String iter : labelMap.keySet()) {
				System.debug(LoggingLevel.FINE,'replaceLabelTokens: processing token ' + iter);
				mergedTemplate = mergedTemplate.replaceAll('\\{\\{\\{LBL.' + iter + '\\}\\}\\}',(String)(labelMap.get(iter)));
			}
			System.debug('replaceLabelTokens: END / All custom label replaced in template ' + mergedTemplate);
			return mergedTemplate;
		}
		else {
			System.debug('replaceLabelTokens: END / No custom label to replace ');
			return template;
		}
	}

   /***
	* @description  Utility server side method to extract the field label merge tokens (FLBL) in a string
	*               template and replace them with their user language dependent values.
	* @param        template    Input string in which tokens must be extracted and replaced
	* @return       String      Template input string with all label tokens replaced by their values
	* @exception    AuraHandledException    Raised if any label token is not found.
	***/
	public static String replaceFieldLabelTokens(final String template) {
		System.debug(LoggingLevel.FINE,'replaceFieldLabelTokens: START with template ' + template);

		//Parsing FLBL tokens
		Pattern lblPattern = Pattern.compile('\\{\\{\\{FLBL.\\w+.\\w+\\}\\}\\}');
		Matcher lblMatcher = lblPattern.matcher(template);
		Set<String> lblTokens = new Set<String>();
		while (lblMatcher.find()) {
			System.debug(LoggingLevel.FINE,'replaceFieldLabelTokens: processing match ' + lblMatcher.group(0));
			String token = lblMatcher.group(0).removeStart('{{{FLBL.').removeEnd('}}}');
			lblTokens.add(token);
		}
		System.debug(LoggingLevel.FINE,'replaceFieldLabelTokens: lblTokens extracted ' + lblTokens);// NOPMD ApexDangerousMethods suppress warning

		//Fetching FLBL values and merging them
		String mergedTemplate = template;
		for (String iter : lblTokens) {
			System.debug(LoggingLevel.FINE,'replaceFieldLabelTokens: processing field label ' + iter);

			String[] iterParts = ((String)iter).split('\\.');
			System.debug(LoggingLevel.FINE,'replaceFieldLabelTokens: field label parts extracted ' + iterParts);

			//Schema.SObjectField iterDesc = Schema.getGlobalDescribe().get(iterParts[0])?.getDescribe().fields.getMap().get(iterParts[1]);
			Schema.SObjectField iterDesc = ((SObject)Type.forName('Schema.' + iterParts[0]).newInstance()).getSObjectType()?.getDescribe().fields.getMap().get(iterParts[1]);
			System.debug(LoggingLevel.FINE,'replaceFieldLabelTokens: field desc fetched ' + iterDesc);
			if (iterDesc == null) {
				System.debug(LoggingLevel.WARN,'replaceFieldLabelTokens: END - Unfound field ' + iter);
				throw new AuraHandledException('Field label fetch error: ' + iter + ' field not found!');
			}
			String iterLabel = iterDesc.getDescribe().getLabel();
			System.debug(LoggingLevel.FINE,'replaceFieldLabelTokens: iterLabel value fetched ' + iterLabel);

			mergedTemplate = mergedTemplate.replaceAll('\\{\\{\\{FLBL.' + iter + '\\}\\}\\}',iterLabel);
		}
		System.debug('replaceFieldLabelTokens: END / All field labels replaced in template ' + mergedTemplate);
		return mergedTemplate;
	}
}