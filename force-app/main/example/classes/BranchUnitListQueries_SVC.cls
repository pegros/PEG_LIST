public with sharing class BranchUnitListQueries_SVC extends sfpegListQuery_SVC {
        
    Integer counter = 0;
    
	public override List<Object> getData(final Object input, final String query) {
        System.debug('getData: START BranchUnitListQueries_SVC implementation');
        System.debug('getData: input provided ' + input);
        System.debug('getData: query provided ' + query);
        
        Map<Object,Object> inputData = (Map<Object,Object>) input;
        ID recordId = (ID)(inputData.get('GEN.recordId'));
        System.debug('getData: recordId fetched ' + recordId);
		

        Set<ID> baseSet = new set<ID>();
        baseSet.add(recordId);
        Map<ID,Object> resultMap = fetchDetails(baseSet,0);

        System.debug('getData: END with #records on 1st level ' + resultMap.size());
        return resultMap.values();
	}
    
    private Map<ID,Object> fetchDetails(Set<ID> buIdSet, Integer depth) {
		System.debug('fetchDetails: START with buIds ' + buIdSet);
        System.debug('fetchDetails: BU depth ' + depth);
              
        Map<ID,BranchUnit> buMap = new Map<ID,BranchUnit>(
        		[select Id, Name, BranchCode, ParentBranchUnitId, TOLABEL(Type), IsActive, RecordType.Name,
						(select Id, Name, BranchCode, ParentBranchUnitId, TOLABEL(Type), IsActive, RecordType.Name from BranchUnitParentBranchUnit)
				 from BranchUnit
				 where ParentBranchUnitId in :buIdSet]);
        System.debug('fetchDetails: buMap fetched ' + buMap);
        
        if (buMap == null) {
        	System.debug(LoggingLevel.WARN,'fetchDetails: END - No BranchUnit found ');
        	throw new AuraHandledException('No BranchUnit found with these ID ' + buIdSet + ' !');
        }
        /*if (buMap.size() != buIdSet.size()) {
			System.debug(LoggingLevel.WARN,'fetchDetails: END - Missing BranchUnit ' + buMap.size() + ' vs ' + buIdSet.size());
            throw new AuraHandledException('One BranchUnit missing within these IDs ' + buIdSet + ' !');
        }*/
        
        Map<ID,Object> resultMap = new Map<ID,Object>();
        Set<ID> subBuIdSet = new Set<ID>();
		for (ID iter : buMap.keySet())  {
			System.debug('fetchDetails: processing BU ID' + iter);
            BranchUnit iterBU = buMap.get(iter);

        	Map<Object,Object> iterObj = new Map<Object,Object>{
            	'Id' => iterBU.Id,
                'ParentBranchUnitId' => iterBU.ParentBranchUnitId,
            	'Name' => iterBU.Name,
            	'BranchCode' => iterBU.BranchCode,
            	'Type' => iterBU.Type,
            	'IsActive' => iterBU.IsActive,
            	'RecordType.Name' => iterBU.RecordType.Name
			};
			resultMap.put(iter,(Object)(iterObj));
            
        	if (iterBU.BranchUnitParentBranchUnit == null) {
        		System.debug('fetchDetails: BU has no children');
            }
            else {
        		System.debug('fetchDetails: processing children');
                List<Object> buChildren = new List<Object>();
                for (BranchUnit iterChildBU : iterBU.BranchUnitParentBranchUnit)  {
        			System.debug('fetchDetails: processing child ' + iterChildBU);
                    Map<Object,Object> iterChildObj = new Map<Object,Object>{
            			'Id' => iterChildBU.Id,
						'ParentBranchUnitId' => iterBU.ParentBranchUnitId,
            			'Name' => iterChildBU.Name,
            			'BranchCode' => iterChildBU.BranchCode,
            			'Type' => iterChildBU.Type,
            			'IsActive' => iterChildBU.IsActive,
            			'RecordType.Name' => iterChildBU.RecordType.Name
					};
                    buChildren.add(iterChildObj);
                    subBuIdSet.add(iterChildBU.Id);
                }
                iterObj.put('BranchUnitParentBranchUnit',(Object)(buChildren));
            }
        }
        System.debug('fetchDetails: all BranchUnits processed ');
            
		if (subBuIdSet.size() > 0) {
        	System.debug('fetchDetails: processing sub-BUs ');
            Map<ID,Object> subBUDetails = fetchDetails(subBuIdSet,depth +1);
            Map<ID,List<Object>> subBUByParent = new Map<ID,List<Object>>();
            for (ID iter : subBUDetails.keySet()) {
				System.debug('fetchDetails: registering sub BU ID ' + iter);
                Object iterObj = subBUDetails.get(iter);
                ID iterParentId = (ID) (((Map<Object,Object>)iterObj).get('ParentBranchUnitId'));
                if (!subBUByParent.containsKey(iterParentId)) {
        			System.debug('fetchDetails: registering parent BU ID ' + iterParentId);
                    subBUByParent.put(iterParentId,new List<Object>());
                }
                subBUByParent.get(iterParentId).add(iterObj);
            }
            
            for (ID iter : resultMap.keySet()) {
				System.debug('fetchDetails: registering sub hierarchy for ID ' + iter);

                Object iterObj = resultMap.get(iter);
                List<Object> iterChildren = (List<Object>)(((Map<Object,Object>)iterObj).get('BranchUnitParentBranchUnit'));
                if (iterChildren != null) {
					System.debug('fetchDetails: processing children BUs');
                    for (Object iterChild : iterChildren) {
                        Map<Object,Object> iterChildObj = (Map<Object,Object>)iterChild;
                        ID iterChildId = (ID)(iterChildObj.get('Id'));
						System.debug('fetchDetails: registering sub hierarchy for child ID ' + iterChildId);
                        List<Object> childSubBUs = subBUByParent.get(iterChildId);
                        if (childSubBUs != null) {
							System.debug('fetchDetails: sub-BU has sub-hierarchy');
                            iterChildObj.put('BranchUnitParentBranchUnit',childSubBUs);
                        }
                        else {
        					System.debug('fetchDetails: sub-BU has no sub-hierarchy');
                		}
                    }
                }
                else {
        			System.debug('fetchDetails: BU has no children');
                }
            }
        }
        else {
			System.debug('fetchDetails: no sub-BU to process ');
        }

		System.debug('fetchDetails: END');
        return resultMap;

        /*else if (depth > 2) {
            System.debug('fetchDetails: END Max depth reached' + depth);
            return (Object)(resultObj);
        }*/
        /*else {
        	System.debug('fetchDetails: processing BU children');
            List<Object> buChildren = new List<Object>();
            for (BranchUnit iter : buList[0].BranchUnitParentBranchUnit)  {
        		System.debug('fetchDetails: processing child ' + iter);
                buChildren.add(fetchDetails(iter.Id, depth + 1));
            }  
        	System.debug('fetchDetails: all BU children processed for ID ' + buId );
           
			resultObj.put('BranchUnitParentBranchUnit',(Object)(buChildren));
        	System.debug('fetchDetails: END all BranchUnit children processed');
       		return (Object)(resultObj);
        }   */
            //return null;
    }

}