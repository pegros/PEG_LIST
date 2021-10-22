import { LightningElement, wire, api, track } from 'lwc';

import { getObjectInfo }    from 'lightning/uiObjectInfoApi';

// To set action menu context
import currentUserId from '@salesforce/user/Id';

// To notify the utility bar handler if required
import {
    subscribe,
    unsubscribe,
    publish,
    //APPLICATION_SCOPE,
    MessageContext
} from 'lightning/messageService';
import sfpegCustomAction from '@salesforce/messageChannel/sfpegCustomAction__c';
import sfpegCustomNotification from '@salesforce/messageChannel/sfpegCustomNotification__c';


export default class TstHandler extends LightningElement {

    @api recordId;
    @api objectApiName;

    // Internal Display Parameter
    @track lastMessage = null;     // Error message (if any for end user display)
    @track lastContext = null;     // Error message (if any for end user display)
    @track fromPage = false;      // Error message (if any for end user display)

    // Notification handling
    subscription = null;
    @wire(MessageContext)
    messageContext;

    // Component Initialization
    connectedCallback() {
        console.log('connected: START');
        this.subscribeToMessageChannel();
        console.log('connected: END');
    }

    renderedCallback() {
        console.log('rendered: START');

        let actionBars = this.template.querySelectorAll('c-sfpeg-action-bar-cmp');
        console.log('rendered: actionBars ',actionBars);

        let actionBar1class = this.template.querySelector('c-sfpeg-action-bar-cmp[data-my-id=rowActions1]');
        console.log('rendered: actionBar1class ',actionBar1class);

        let actionBar2class = this.template.querySelector('c-sfpeg-action-bar-cmp[data-my-id=rowActions2]');
        console.log('rendered: actionBar2class ',actionBar2class);

        console.log('rendered: END');
    }

    disconnectedCallback() {
        console.log('disconnected: START');
        this.unsubscribeToMessageChannel();
        console.log('disconnected: END');
    }


    // Handler for action 
    handleAction(event) {
        console.log('handleAction: START');
        console.log('handleAction: last message',this.lastMessage);
        console.log('handleAction: last context',this.lastContext);
        console.log('handleAction: message context',this.messageContext);

        let actionNotif = {
            'channel': "TEST",
            'action': {
                "type":"done",
                "params":{"type":"refresh"}
            },
            'context': "Hello World"
        };
        if (this.isDebug) console.log('handleAction: actionNotif prepared ',actionNotif);
        publish(this.messageContext, sfpegCustomNotification, actionNotif);

        console.log('handleAction: END');
    }   

     // Handler for action 
    handleAction2(event) {
        console.log('handleAction2: START');
        
        let actionNotif = {
            'channel': "TEST2",
            'action': {
                "type":"toast",
                "params":{"title":"Notified Back!"}
            },
            'context': "Hello World2"
        };
        if (this.isDebug) console.log('handleAction2: actionNotif prepared ',actionNotif);
        publish(this.messageContext, sfpegCustomNotification, actionNotif);

        console.log('handleAction2: END');
    } 


    // Handler for message received by component
    handleMessage(message) {
        console.log('handleMessage: START with message ',JSON.stringify(message));

        if ((message.channel) && (message.channel == "TEST")) {
            console.log('handleMessage: processing TEST message');

            this.lastMessage = JSON.stringify(message);
            console.log('handleMessage: message context',this.messageContext);
            this.lastContext = JSON.stringify(this.messageContext);
            console.log('handleMessage: message context',this.lastContext);
            //console.log('handleMessage: component ',this);
            //console.log('handleMessage: component ',JSON.stringify(this));
            console.log('handleMessage: this ',this);
            console.log('handleMessage: current page ',this.template.baseURI);

            /*console.log('handleMessage: previous same page? ',this.fromPage);
            this.fromPage = (this.template.baseURI === message.action.page);
            console.log('handleMessage: new same page? ', this.fromPage);*/
        
            console.log('handleMessage: record ID ',this.recordId);
            console.log('handleMessage: object name',this.objectApiName);
        }
        else {
            console.log('handleMessage: ignoring message on channel',message.channel);
        }
        console.log('handleMessage: END');
    }

    // Notification subscription 
    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                sfpegCustomAction,
                (message) => this.handleMessage(message));
                //{ scope: APPLICATION_SCOPE });
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    @wire(getObjectInfo, { "objectApiName": '$objectApiName' })
    wiredObject({ error, data }) {
        console.log('wiredObject: START with object ', this.objectApiName);
        console.log('wiredObject: data ', JSON.stringify(data))
        console.log('wiredObject: error ', JSON.stringify(error));
        console.log('wiredObject: END with ', this.objectApiName);
    }

    @wire(getObjectInfo, { "objectApiName": 'Task' })
    wiredTaskObject({ error, data }) {
        console.log('wiredTaskObject: START with object Task');
        console.log('wiredTaskObject: data ', JSON.stringify(data))
        console.log('wiredTaskObject: error ', JSON.stringify(error));
        console.log('wiredTaskObject: END with object Task');
    }

    @wire(getObjectInfo, { "objectApiName": 'Activity' })
    wiredActivityObject({ error, data }) {
        console.log('wiredActivityObject: START with object Activity');
        console.log('wiredActivityObject: data ', JSON.stringify(data))
        console.log('wiredActivityObject: error ', JSON.stringify(error));
        console.log('wiredActivityObject: END with object Activity');
    }
}