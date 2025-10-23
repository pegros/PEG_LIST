/***
* @description  Lightning controller for the sfpegIconCatalogCmp component
*               to provide the complete set of available custom and flag icons
*               available in the sfpegIcons and sfpegFlagIcons static resources.
*               For the custom icons, it provides not only the names but also the
*				available sizes defined for each one.
*				For the flag icons, it provides not only the country names but also
*				the corresponding ISO 2 and 3 codes.
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
	* @description  Simple method to fetch all the custom icons defined within
	*				the sfpegIcons static resource.
	*               For each icon available, it provides not only the name but
	*				also the available sizes.
	* @return       Object  JSON map of size lists per icon name
	***/
	@AuraEnabled(cacheable=true)
	public static Object getIconList() {
		System.debug('getIconList: START');

		StaticResource sr = [select Id, Name, Body from StaticResource where Name = 'sfpegIcons' WITH SYSTEM_MODE limit 1];
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

		System.debug('getIconList: END with ' + nameTokens);// NOPMD ApexDangerousMethods suppress warning
		return nameTokens;
	}


	/***
	* @description  Simple method to fetch all the countries defined in the 
	*				sfpegCountryCodes and sfpegCountries global value sets.
	*               For each country available, it provides not only the name but
	*				also the available ISO 2 and 3 codes and the corresponding flag icon name
	* @return       Object  JSON list of JSON object providing the country data.
	***/
	@AuraEnabled(cacheable=true)
	public static Object getFlagIconList() {
		System.debug('getFlagIconList: START');

		List<Schema.PicklistEntry> countries = sfpegTestObject__c.Country__c.getDescribe().getPicklistValues();
		System.debug('getFlagIconList: #countries fetched ' + countries.size());
		
		Map<String,Map<String,Object>> countryMap = new Map<String,Map<String,Object>>();
		for(Schema.PicklistEntry iter: countries) {
			System.debug('getFlagIconList: processing country ' + iter);
			Map<String,Object> iterMap = new Map<String,Object>();
			iterMap.put('label',iter.getLabel());
			iterMap.put('code2',iter.getValue());
			iterMap.put('icon','flag:' + iter.getValue());
			countryMap.put(iter.getValue(),iterMap);
		}
		System.debug('getFlagIconList: CountryMap initialize with #codes ' + countryMap.size());

		List<Schema.PicklistEntry> countryCodes = sfpegTestObject__c.CountryCode__c.getDescribe().getPicklistValues();
		System.debug('getFlagIconList: #countryCodes fetched ' + countryCodes.size());
		
		for(Schema.PicklistEntry iter: countryCodes) {
			System.debug('getFlagIconList: registering country codes ' + iter);
			Map<String,Object> iterMap = countryMap.get(iter.getValue());
			iterMap.put('code3',iter.getLabel());
		}

		System.debug('getFlagIconList: END with ' + countryMap.values());// NOPMD ApexDangerousMethods suppress warning
		return countryMap.values();
	}
	
}
