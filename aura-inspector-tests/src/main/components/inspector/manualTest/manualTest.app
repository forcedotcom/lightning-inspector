<aura:application>
    <aura:registerEvent name="customCmpEvent" type="inspector:customCmpEvent"/>

	<aura:handler event="inspector:customAppEvent" action="{!c.handleCustomAppEvent}"/>

    <div>
        <p>
            <h2>Server Actions</h2>
            <ui:button label="Run GlobalController loadLabels()" press="{!c.handleLoadLabels}"/><br/>
        </p>
    

        <p>
            <h2>Chain Events</h2>
            <ui:button label="Chain Events" press="{!c.handleChainEventsClick}"/><br/>
        </p>
    </div>
</aura:application>
