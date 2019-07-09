<aura:application>        
    <aura:registerEvent name="customCmpEvent" type="inspector:customCmpEvent"/>

	<aura:handler event="inspector:customAppEvent" action="{!c.handleCustomAppEvent}"/>
	<!-- <aura:handler event="inspector:customAppEventWithAttributes" action="{!c.handleCustomAppEvent}"/> -->
	<aura:handler event="inspector:testApiReady" action="{!c.handleTestApiReady}"/>
    <aura:handler name="init" value="{!this}" action="{!c.init}" />

    <aura:dependency resource="markup://inspector:testApiReady" type="EVENT"/>
    <aura:dependency resource="markup://inspector:customAppEventWithAttributes" type="EVENT"/>

    <link rel="stylesheet" href="/dist/slds/assets/styles/salesforce-lightning-design-system.min.css" type="text/css"/>
    <script src="/dist/LightningInspectorTestInBrowser.js"></script>
    
    <div class="slds-grid slds-gutters">
        <div class="slds-col slds-size_1-of-3">
            <div>
                <p>
                    <h2>Fire inspector:customAppEvent Events</h2>
                    <h3>This is a handled event, and causes inspector:customCmpEvent to be fired.</h3>
                    <ui:button label="Chain Events" press="{!c.handleChainEventsClick}"/><br/>
                </p>
                <p>
                    <h2>Fire Application Event with Attributes</h2>
                    <ui:button label="Chain Events" press="{!c.handleFireCustomAppEventWithParameters}"/><br/>
                </p>
            </div>
        </div>
        <div class="slds-col slds-size_2-of-3">
            <div aura:id="event-panel-container" id="event-panel-container"></div>
        </div>
    </div>


 

</aura:application>
