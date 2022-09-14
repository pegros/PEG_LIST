/***
* @description  Lightning controller to provide details about existing Record Display component configurations.
*               It relies on the sfpegRecordDisplay__mdt custom metadata.
* @author       P-E GROS
* @date         Dec 2021
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
public with sharing class sfpegRecordDisplay_CTL {

	/***
	* @description  Simple method to fetch configuration details for a Record Display component.
	*               It provides the display configuration as well as the actions available.
	* @param        name    DeveloperName of the Profile configuration record
	* @return       Object  sfpegRecordDisplay__mdt record with DisplayConfig__c and MasterLabel
	*               fields filled in.
	* @exception    AuraHandledException    Raised if no configuration found for the provided name
	***/
	@AuraEnabled(cacheable=true)
	public static Object getConfiguration(final String name) {
		System.debug(LoggingLevel.FINE,'getConfiguration: START with sfpegRecordDisplay configuration name ' + name);

		List<sfpegRecordDisplay__mdt> configs = [	SELECT  MasterLabel, DisplayConfig__c
													FROM sfpegRecordDisplay__mdt
													WHERE DeveloperName =  :name    ];

		if ((configs == null) || (configs.size() != 1)) {
			System.debug(LoggingLevel.ERROR,'getConfiguration: END KO / configuration not found with name ' + name);
			throw new AuraHandledException('Configuration not found with name ' + name);
		}

		if ((configs[0]?.DisplayConfig__c)?.contains('{{{LBL.')) {
			System.debug(LoggingLevel.FINE,'getConfiguration: extracting/replacing custom labels in display config');
			configs[0].DisplayConfig__c = sfpegMerge_CTL.replaceLabelTokens(configs[0].DisplayConfig__c);
			System.debug(LoggingLevel.FINE,'getConfiguration: custom labels replaced in display config');
		}
		else {
			System.debug(LoggingLevel.FINE,'getConfiguration: no custom label in display config');
		}

		if ((configs[0]?.DisplayConfig__c)?.contains('{{{FLBL.')) {
			System.debug(LoggingLevel.FINE,'getConfiguration: extracting/replacing field labels in display config');
			configs[0].DisplayConfig__c = sfpegMerge_CTL.replaceFieldLabelTokens(configs[0].DisplayConfig__c);
			System.debug(LoggingLevel.FINE,'getConfiguration: field labels replaced in display config');
		}
		else {
			System.debug(LoggingLevel.FINE,'getConfiguration: no field label in display config');
		}

		System.debug(LoggingLevel.FINE,'getConfiguration: END ' + configs[0].MasterLabel);
		return (Object) (configs[0]);
	}
}
