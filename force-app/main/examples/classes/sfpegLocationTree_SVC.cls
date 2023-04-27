/***
* @description  Lightning controller to provide sub-hierarchy of a Location.
* @author       P-E GROS
* @date         Jan 2023
* @see          PEG_LIST package (https://github.com/pegros/PEG_LIST)
*
* Legal Notice
*
* MIT License
*
* Copyright (c) 2023 pegros
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

public with sharing class sfpegLocationTree_SVC extends sfpegListQuery_SVC {
        
    Integer counter = 0;
    
	public override List<Object> getData(final Object input, final String query) {
        System.debug('getData: START sfpegLocationTree_SVC implementation');
        System.debug('getData: input provided ' + input);
        System.debug('getData: query provided ' + query);
        
        Map<Object,Object> inputData = (Map<Object,Object>) input;
        ID recordId = (ID)(inputData.get('RootId'));
        System.debug('getData: recordId fetched ' + recordId);
		
        Set<ID> baseSet = new set<ID>();
        baseSet.add(recordId);
        Map<ID,Object> resultMap = fetchDetails(baseSet,0);

        System.debug('getData: END with #records on 1st level ' + resultMap.size());
        return resultMap.values();
	}
    
    private Map<ID,Object> fetchDetails(Set<ID> idSet, Integer depth) {
		System.debug('fetchDetails: START with idSet ' + idSet);
        System.debug('fetchDetails: BU depth ' + depth);
              
        Map<ID,Schema.Location> locMap = new Map<ID,Schema.Location>([ SELECT Id, Name, ParentLocationId, LocationLevel, TOLABEL(LocationType), Description,(SELECT Id, Name, ParentLocationId, LocationLevel, TOLABEL(LocationType), Description FROM ChildLocations) FROM Location WHERE ParentLocationId IN :idSet]);
        System.debug('fetchDetails: buMap fetched ' + locMap);
        
        if (locMap == null) {
        	System.debug(LoggingLevel.WARN,'fetchDetails: END - No Location found ');
        	throw new AuraHandledException('No Location found with these ID ' + idSet + ' !');
        }
        
        Map<ID,Object> resultMap = new Map<ID,Object>();
        Set<ID> subIdSet = new Set<ID>();
		for (ID iter : locMap.keySet())  {
			System.debug('fetchDetails: processing BU ID' + iter);
            Schema.Location iterLoc = locMap.get(iter);

        	Map<Object,Object> iterObj = new Map<Object,Object>{
            	'Id' => iterLoc.Id,
                'ParentLocationId' => iterLoc.ParentLocationId,
            	'Name' => iterLoc.Name,
            	'Description' => iterLoc.Description,
            	'LocationLevel' => iterLoc.LocationLevel,
            	'LocationType' => iterLoc.LocationType
			};
			resultMap.put(iter,(Object)(iterObj));
            
        	if (iterLoc.ChildLocations == null) {
        		System.debug('fetchDetails: Location has no children');
            }
            else {
        		System.debug('fetchDetails: processing children');
                List<Object> locChildren = new List<Object>();
                for (Schema.Location iterChildLoc : iterLoc.ChildLocations)  {
        			System.debug('fetchDetails: processing child ' + iterChildLoc);
                    Map<Object,Object> iterChildObj = new Map<Object,Object>{
            			'Id' => iterChildLoc.Id,
						'ParentLocationId' => iterChildLoc.ParentLocationId,
            			'Name' => iterChildLoc.Name,
            			'Description' => iterChildLoc.Description,
                        'LocationLevel' => iterChildLoc.LocationLevel,
            			'LocationType' => iterChildLoc.LocationType
					};
                    locChildren.add(iterChildObj);
                    subIdSet.add(iterChildLoc.Id);
                }
                iterObj.put('ChildLocations',(Object)(locChildren));
            }
        }
        System.debug('fetchDetails: all Locations processed ');
            
		if (subIdSet.size() > 0) {
        	System.debug('fetchDetails: processing sub-Locations ');
            Map<ID,Object> subLocDetails = fetchDetails(subIdSet,depth +1);
            Map<ID,List<Object>> subLocByParent = new Map<ID,List<Object>>();
            for (ID iter : subLocDetails.keySet()) {
				System.debug('fetchDetails: registering sub Location ID ' + iter);
                Object iterObj = subLocDetails.get(iter);
                ID iterParentId = (ID) (((Map<Object,Object>)iterObj).get('ParentLocationId'));
                if (!subLocByParent.containsKey(iterParentId)) {
        			System.debug('fetchDetails: registering parent Location ID ' + iterParentId);
                    subLocByParent.put(iterParentId,new List<Object>());
                }
                subLocByParent.get(iterParentId).add(iterObj);
            }
            
            for (ID iter : resultMap.keySet()) {
				System.debug('fetchDetails: registering sub hierarchy for ID ' + iter);

                Object iterObj = resultMap.get(iter);
                List<Object> iterChildren = (List<Object>)(((Map<Object,Object>)iterObj).get('ChildLocations'));
                if (iterChildren != null) {
					System.debug('fetchDetails: processing children Locations');
                    for (Object iterChild : iterChildren) {
                        Map<Object,Object> iterChildObj = (Map<Object,Object>)iterChild;
                        ID iterChildId = (ID)(iterChildObj.get('Id'));
						System.debug('fetchDetails: registering sub hierarchy for child ID ' + iterChildId);
                        List<Object> childSubLocations = subLocByParent.get(iterChildId);
                        if (childSubLocations != null) {
							System.debug('fetchDetails: sub-BU has sub-hierarchy');
                            iterChildObj.put('ChildLocations',childSubLocations);
                        }
                        else {
        					System.debug('fetchDetails: sub-Location has no sub-hierarchy');
                		}
                    }
                }
                else {
        			System.debug('fetchDetails: Location has no children');
                }
            }
        }
        else {
			System.debug('fetchDetails: no sub-Location to process ');
        }

		System.debug('fetchDetails: END');
        return resultMap;
    }
}