<aura:application>        
    <aura:attribute name="counter" type="Integer" default="0"/>
    <aura:attribute name="byValueFCV" type="Object" default="{#1+1}"/>
    <aura:attribute name="byReferenceFCV" type="Object" default="{!1+1}"/>

	<aura:handler event="inspector:testApiReady" action="{!c.handleTestApiReady}"/>
    <aura:handler name="init" value="{!this}" action="{!c.init}" />

    <aura:dependency resource="markup://inspector:customAppEventWithAttributes" type="EVENT"/>

    <link rel="stylesheet" href="/dist/slds/assets/styles/salesforce-lightning-design-system.min.css" type="text/css"/>
    <script src="/dist/LightningInspectorTestInBrowser.js"></script>
    
    <div>
        <div>
            <div>
                <p>
                    <h2>The Lightning Inspector embedded in the page</h2>
                </p>
                <p>
                    <h2>Fire inspector:customAppEvent Events</h2>
                    <h3>This is a handled event, and causes inspector:customCmpEvent to be fired.</h3>
                    <ui:button label="Chain Events" press="{!c.handleChainEventsClick}"/><br/>
                </p>
                <p>
                    <h2>Fire Application Event with Attributes</h2>
                    <ui:button label="Chain Events" press="{!c.handleFireCustomAppEventWithParameters}"/><br/>
                </p>
                <p>
                    <h2>Increment Counter</h2>
                    <ui:button label="Increment Counter" press="{!c.handleIncrementCounter}"/><br/>
                </p>
            </div>
        </div>
        <div>
            <div aura:id="container" id="container" style="height:600px"></div>
        </div>
    </div>


 

</aura:application>
