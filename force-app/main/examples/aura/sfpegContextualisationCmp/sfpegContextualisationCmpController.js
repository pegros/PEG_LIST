({
    doInit : function(component, event, helper) {
        console.log('doInit: START ');
        component.set("v.context", {statusA:"A1",statusB:"B1"});
        let userId = $A.get("$SObjectType.CurrentUser.Id");
        component.set("v.userId",userId);
        console.log('doInit: END ');
    },
    handleChange : function(component, event, helper) {
        console.log('handleChange: START ', event);
		console.log('handleChange: event name fetched ', event.getName());
		console.log('handleChange: event value fetched ', event.getParam("value"));
        console.log('handleChange: event source fetched ', event.getSource());
        console.log('handleChange: event source fetched ', event.getSource());
        console.log('handleChange: event source local ID fetched ', event.getSource().getLocalId());
        
        let context = component.get("v.context") || {};
        console.log('handleChange: context fetched ', JSON.stringify(context));
        context[event.getSource().getLocalId()] = event.getParam("value");
        console.log('handleChange: context updated ', JSON.stringify(context));
        component.set("v.context",context);
        console.log('handleChange: END');
	},
    handleMsgAction : function(component, event, helper) {
        console.log('handleMsgAction: START ',event);
        console.log('handleMsgAction: params ',JSON.stringify(event.getParams()));
        component.set("v.message",(event.getParam("type") || "none") + " from messages");
        console.log('handleMsgAction: END');
	},
 	handleAction : function(component, event, helper) {
        console.log('handleAction: START ',event);
        console.log('handleAction: params ',JSON.stringify(event.getParams()));
        console.log('handleAction: type ',event.getParam("type"));
        component.set("v.message",(event.getParam("type") || "none") + " from action bar");
        console.log('handleAction: END');
	},
    handleCardAction : function(component, event, helper) {
        console.log('handleCardAction: START ',event);
        console.log('handleCardAction: params ',JSON.stringify(event.getParams()));
        component.set("v.message",(event.getParam("type") || "none") + " from card");
        console.log('handleCardAction: END');
	},
    handleListAction : function(component, event, helper) {
        console.log('handleListAction: START ',event);
        console.log('handleListAction: params ',JSON.stringify(event.getParams()));
        component.set("v.message",(event.getParam("type") || "none") + " from list");
        console.log('handleListAction: END');
	},
    handleCardListAction : function(component, event, helper) {
        console.log('handleCardListAction: START ',event);
        console.log('handleCardListAction: params ',JSON.stringify(event.getParams()));
        component.set("v.message",(event.getParam("type") || "none") + " from card list");
        console.log('handleCardListAction: END');
	},
    handleProfileAction : function(component, event, helper) {
        console.log('handleProfileAction: START ',event);
        console.log('handleProfileAction: params ',JSON.stringify(event.getParams()));
        component.set("v.message",(event.getParam("type") || "none") + " from profile");
        console.log('handleProfileAction: END');
	},
    handleDisplayAction : function(component, event, helper) {
        console.log('handleDisplayAction: START ',event);
        console.log('handleDisplayAction: params ',JSON.stringify(event.getParams()));
        component.set("v.message",(event.getParam("type") || "none") + " from record display");
        console.log('handleDisplayAction: END');
	},
    handleKpiAction : function(component, event, helper) {
        console.log('handleKpiAction: START ',event);
        console.log('handleKpiAction: params ',JSON.stringify(event.getParams()));
        component.set("v.message",(event.getParam("type") || "none") + " from KPI list");
        console.log('handleKpiAction: END');
	},
    handleRefresh: function(component, event, helper) {
        console.log('handleRefresh: START ');
        
        let listCmp = component.find("c:sfpegListCmp");
        console.log('handleRefresh: listCmp fetched ',listCmp);
        if (listCmp) {
            console.log('handleRefresh: triggering listCmp refresh ');
            listCmp.doRefresh();
        }

        let cardListCmp = component.find("c:sfpegCardListCmp");
        console.log('handleRefresh: cardListCmp fetched ',cardListCmp);
        if (cardListCmp) {
            console.log('handleRefresh: triggering cardListCmp refresh ');
            cardListCmp.doRefresh();
        }

        let displayCmp = component.find("c:sfpegRecordDisplayCmp");
        console.log('handleRefresh: displayCmp fetched ',displayCmp);
        if (displayCmp) {
            console.log('handleRefresh: triggering displayCmp refresh ');
            displayCmp.doRefresh();
        }

        console.log('handleRefresh: END');
	},
})