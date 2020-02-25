//var ownerDocument = document.currentScript.ownerDocument;
const template = document.createElement('template');
template.innerHTML = `<div class="action-card-wrapper slds-p-around--x-small is-collapsible">
        <div class="action-header">
            <div class="slds-grid slds-grid--vertical-align-center">
                <div class="action-toggle slds-p-around--x-small">
                    <span
                        class="slds-icon_container expand-icon"
                        title="Expand the action card to see more data"
                    >
                        <svg
                            aria-hidden="true"
                            class="slds-icon slds-icon--x-small slds-icon-text-default"
                        >
                            <use
                                xlink:href="/src/devtoolsPanel/external/slds-assets/icons/utility-sprite/svg/symbols.svg#chevronright"
                            ></use>
                        </svg>
                        <span class="slds-assistive-text">
                            Collapse the action card to see less data
                        </span>
                    </span>

                    <span
                        class="slds-icon_container collapse-icon"
                        title="Collapse the action card to see less data"
                    >
                        <svg
                            aria-hidden="true"
                            class="slds-icon slds-icon--x-small slds-icon-text-default"
                        >
                            <use
                                xlink:href="/src/devtoolsPanel/external/slds-assets/icons/utility-sprite/svg/symbols.svg#chevrondown"
                            ></use>
                        </svg>
                        <span class="slds-assistive-text">
                            Collapse the action card to see less data
                        </span>
                    </span>
                </div>
                <h2 id="action-name" class="slds-col"></h2>

                <span
                    class="slds-icon_container remove-card"
                    title="Remove this action from the pending overrides collection."
                >
                    <svg
                        aria-hidden="true"
                        class="slds-icon slds-icon--x-small slds-icon-text-default"
                    >
                        <use
                            xlink:href="/src/devtoolsPanel/external/slds-assets/icons/utility-sprite/svg/symbols.svg#close"
                        ></use>
                    </svg>
                    <span class="slds-assistive-text">
                        Remove this action from the pending overrides collection.
                    </span>
                </span>
            </div>
        </div>
        <div class="action-body">
            <div class="action-details">
                <div class="action-parameters">
                    <div class="slds-p-bottom--x-small">
                        <aurainspector-label
                            class=""
                            key="actioncard_parameters"
                        ></aurainspector-label>
                        <aurainspector-json class="parameters " expandTo="0"></aurainspector-json>
                    </div>
                    <div id="action-response-container" class="slds-p-bottom--x-small">
                        <aurainspector-label class="" key="actioncard_result"></aurainspector-label>
                        <aurainspector-json
                            class="result"
                            expandTo="0"
                            id="actionResult"
                        ></aurainspector-json>
                    </div>
                    <div id="action-error-container" class="slds-p-bottom--x-small">
                        <aurainspector-label class="" key="actioncard_error"></aurainspector-label>
                        <aurainspector-json
                            class=""
                            expandTo="0"
                            id="actionError"
                        ></aurainspector-json>
                    </div>
                </div>

                <dl class="attributes">
                    <div class="slds-p-bottom--x-small slds-p-right--x-small">
                        <dt><aurainspector-label key="actioncard_id"></aurainspector-label></dt>
                        <dd id="actionId"></dd>
                    </div>
                    <div class="slds-p-bottom--x-small slds-p-right--x-small">
                        <dt><aurainspector-label key="actioncard_state"></aurainspector-label></dt>
                        <dd id="actionState"></dd>
                    </div>
                    <div class="slds-p-bottom--x-small slds-p-right--x-small">
                        <dt>
                            <aurainspector-label key="actioncard_abortable"></aurainspector-label>
                        </dt>
                        <dd id="actionIsAbortable"></dd>
                    </div>
                    <div class="slds-p-bottom--x-small slds-p-right--x-small">
                        <dt>
                            <aurainspector-label key="actioncard_background"></aurainspector-label>
                        </dt>
                        <dd id="actionIsBackground"></dd>
                    </div>
                    <div class="slds-p-bottom--x-small slds-p-right--x-small">
                        <dt>
                            <aurainspector-label key="actioncard_created"></aurainspector-label>
                        </dt>
                        <dd id="statsCreated"></dd>
                    </div>
                    <div class="slds-p-bottom--x-small slds-p-right--x-small">
                        <dt>
                            <aurainspector-label key="actioncard_storable"></aurainspector-label>
                        </dt>
                        <dd id="actionIsStorable"></dd>
                    </div>
                    <div class="storable-info slds-p-bottom--x-small slds-p-right--x-small">
                        <dt>
                            <aurainspector-label
                                key="actioncard_storablesize"
                            ></aurainspector-label>
                        </dt>
                        <dd id="actionStorableSize"></dd>
                    </div>
                    <div class="storable-info slds-p-bottom--x-small slds-p-right--x-small">
                        <dt>
                            <aurainspector-label
                                key="actioncard_storablerefresh"
                            ></aurainspector-label>
                        </dt>
                        <dd id="actionIsRefresh"></dd>
                    </div>
                    <div class="storable-info slds-p-bottom--x-small slds-p-right--x-small">
                        <dt>
                            <aurainspector-label
                                key="actioncard_storablecachehit"
                            ></aurainspector-label>
                        </dt>
                        <dd id="actionFromStorage"></dd>
                    </div>
                    <div class="storable-info slds-p-bottom--x-small slds-p-right--x-small">
                        <dt>
                            <aurainspector-label key="actioncard_storablekey"></aurainspector-label>
                        </dt>
                        <dd id="">
                            <aurainspector-json
                                class="storageKey code"
                                expandTo="0"
                            ></aurainspector-json>
                        </dd>
                    </div>
                </dl>

                <div class="calling-component-container">
                    <h3>
                        <aurainspector-label
                            key="actioncard_callingComponent"
                        ></aurainspector-label>
                    </h3>
                    <div id="callingComponent"></div>
                </div>
            </div>
            <div class="action-modify">
                <!-- Drop the action -->
                <div class="slds-p-bottom--x-small slds-p-top--x-small dropOrModify">
                    <select id="select_dropOrModify" class="slds-select select_dropOrModify">
                        <option value="dropAction">
                            <aurainspector-label key="actioncard_dropaction"></aurainspector-label>
                        </option>
                        <option value="modifyResponse">
                            <aurainspector-label
                                key="actioncard_overrideresult"
                            ></aurainspector-label>
                        </option>
                        <option value="errorResponseNextTime">
                            <aurainspector-label
                                key="actioncard_errorresponse"
                            ></aurainspector-label>
                        </option>
                    </select>
                </div>

                <!-- Override the Result -->
                <div class="div_editActionResult slds-p-bottom--x-small slds-p-horizontal--x-small">
                    <div class="div_textarea_ActionResult">
                        <label
                            for="actionResult"
                            class="slds-form-element__label slds-m-top--x-small"
                        >
                            <aurainspector-label key="actioncard_newvalue"></aurainspector-label>
                        </label>
                        <textarea
                            name="actionResultValue"
                            id="textarea_actionResultValue"
                            class="slds-textarea code"
                            rows="3"
                            wrap="off"
                        ></textarea>
                    </div>
                    <div class="div_actionButtons slds-p-top--x-small">
                        <button
                            id="button_saveActionResult"
                            class="button_saveActionResult slds-button slds-button--neutral"
                        >
                            <aurainspector-label key="actioncard_save"></aurainspector-label>
                        </button>
                        <button
                            id="button_cancelChangeActionResult"
                            class="button_cancelChangeActionResult slds-button slds-button--neutral"
                        >
                            <aurainspector-label key="actioncard_cancel"></aurainspector-label>
                        </button>
                        <button
                            id="button_editActionResult"
                            class="button_editActionResult slds-button slds-button--neutral slds-hide"
                        >
                            <aurainspector-label key="actioncard_edit"></aurainspector-label>
                        </button>
                    </div>
                </div>

                <!-- Error Response Next Time -->
                <div class="div_errorResponse slds-p-bottom--x-small slds-p-horizontal--x-small">
                    <div class="slds-p-bottom--x-small slds-p-top--x-small dropOrModify">
                        <select id="errorResponseType" class="slds-select select_dropOrModify">
                            <option value="exceptionEvent">Exception Event</option>
                            <option value="messageAndStack">Message And Stack</option>
                        </select>
                    </div>

                    <div class="exceptionEventDiv">
                        <aurainspector-label key="actioncard_eventDescriptor"></aurainspector-label>
                        <textarea
                            name="eventDescriptor"
                            id="eventDescriptor"
                            class="slds-textarea code"
                            rows="1"
                            wrap="off"
                        ></textarea>
                        <aurainspector-label key="actioncard_eventAttribute"></aurainspector-label>
                        <textarea
                            name="eventAttribute"
                            id="eventAttribute"
                            class="slds-textarea code"
                            rows="1"
                            wrap="off"
                        ></textarea>
                    </div>

                    <div class="messageAndStackDiv slds-hide">
                        <label for="actionResult" class="slds-form-element__label">
                            <aurainspector-label
                                key="actioncard_errormessage"
                            ></aurainspector-label>
                        </label>
                        <textarea
                            name="actionErrorMessage"
                            id="textarea_actionErrorMessage"
                            class="slds-textarea code"
                            rows="3"
                            wrap="off"
                        ></textarea>
                        <label
                            for="actionResult"
                            class="slds-form-element__label slds-m-top--x-small"
                        >
                            <aurainspector-label key="actioncard_errorstack"></aurainspector-label>
                        </label>
                        <textarea
                            name="actionErrorStack"
                            id="textarea_actionErrorStack"
                            class="slds-textarea code"
                            rows="3"
                            wrap="off"
                        ></textarea>
                    </div>
                    <div class="div_actionButtons slds-p-top--x-small">
                        <button
                            id="button_saveError"
                            class="button_saveError slds-button slds-button--neutral"
                        >
                            <aurainspector-label key="actioncard_save"></aurainspector-label>
                        </button>
                        <button
                            id="button_cancelError"
                            class="button_cancelError slds-button slds-button--neutral"
                        >
                            <aurainspector-label key="actioncard_cancel"></aurainspector-label>
                        </button>
                        <button
                            id="button_editError"
                            class="button_editError slds-button slds-button--neutral slds-hide"
                        >
                            <aurainspector-label key="actioncard_edit"></aurainspector-label>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>`;

class ActionCard extends HTMLElement {
    static get observedAttributes() {
        return ['collapsible'];
    }

    connectedCallback() {
        const clone = document.importNode(template.content, true);
        const shadowRoot = this;

        shadowRoot.appendChild(clone);

        shadowRoot
            .querySelector('.action-toggle')
            .addEventListener('click', ToggleActionCard_OnClick.bind(this));
        shadowRoot
            .querySelector('#select_dropOrModify')
            .addEventListener('change', DropOrModify_OnChange.bind(this));
        shadowRoot
            .querySelector('.remove-card')
            .addEventListener('click', RemoveCard_OnClick.bind(this));

        const overridesSelect = shadowRoot.querySelector('#select_dropOrModify');
        overridesSelect.options[0].text = chrome.i18n.getMessage('actioncard_dropaction');
        overridesSelect.options[1].text = chrome.i18n.getMessage('actioncard_overrideresult');
        overridesSelect.options[2].text = chrome.i18n.getMessage('actioncard_errorresponse');

        shadowRoot
            .querySelector('#button_saveActionResult')
            .addEventListener('click', SaveActionResult_OnClick.bind(this));
        shadowRoot
            .querySelector('#button_cancelChangeActionResult')
            .addEventListener('click', CancelChangeActionResult_OnClick.bind(this));
        shadowRoot
            .querySelector('#button_editActionResult')
            .addEventListener('click', EditActionResult_OnClick.bind(this));
        shadowRoot
            .querySelector('#button_saveError')
            .addEventListener('click', SaveError_OnClick.bind(this));
        shadowRoot
            .querySelector('#button_cancelError')
            .addEventListener('click', CancelError_OnClick.bind(this));
        shadowRoot
            .querySelector('#button_editError')
            .addEventListener('click', EditError_OnClick.bind(this));

        if (this.getAttribute('collapsible') === 'false') {
            const container = shadowRoot.querySelector('div.action-card-wrapper');
            container.classList.remove('is-collapsible');
        }

        var model = {
            id: this.getAttribute('actionId'),
            actionName: this.getAttribute('name'),
            parameters: this.getAttribute('parameters'),
            state: this.getAttribute('state'),
            isBackground: this.getAttribute('isBackground'),
            isStorable: this.getAttribute('isStorable'),
            isRefresh:
                this.getAttribute('isStorable') === 'true' ? this.getAttribute('isRefresh') : '-',
            isAbortable: this.getAttribute('isAbortable'),
            returnValue: this.getAttribute('returnValue'),
            returnError:
                this.getAttribute('returnError') === '[]'
                    ? undefined
                    : this.getAttribute('returnError'),
            howDidWeModifyResponse: this.getAttribute('howDidWeModifyResponse'), //responseModified_modify, responseModified_drop, responseModified_error
            fromStorage:
                this.getAttribute('isStorable') === 'true'
                    ? this.getAttribute('isFromStorage')
                    : '-',
            //storageKey could be very long, I want people be able to see it when they want to, hide it like other JSON object when no one cares
            storageKey:
                this.getAttribute('isStorable') === 'true'
                    ? '{"storageKey":' + JSON.stringify(this.getAttribute('storageKey')) + '}'
                    : '-',
            // storageKey: this.getAttribute("isStorable") === "true" ? this.getAttribute("storageKey") : "-",
            storableSize:
                this.getAttribute('isStorable') === 'true'
                    ? (JSON.stringify(this.getAttribute('returnValue')).length / 1024).toFixed(1) +
                      ' KB'
                    : '-',
            callingComponent: this.getAttribute('callingComponent')
        };

        const actionName = shadowRoot.querySelector('#action-name');
        actionName.innerHTML = '';
        actionName.appendChild(formatActionName(model.actionName));

        shadowRoot.querySelector('.parameters').textContent = model.parameters;
        shadowRoot.querySelector('.storageKey').textContent = model.storageKey;
        shadowRoot.querySelector('#actionId').textContent = model.id;
        shadowRoot.querySelector('#actionState').textContent = model.state;
        shadowRoot.querySelector('#actionIsAbortable').textContent = model.isAbortable;
        shadowRoot.querySelector('#actionIsBackground').textContent = model.isBackground;
        shadowRoot.querySelector('#actionIsStorable').textContent = model.isStorable;
        shadowRoot.querySelector('#actionStorableSize').textContent = model.storableSize;
        shadowRoot.querySelector('#actionIsRefresh').textContent = model.isRefresh;
        shadowRoot.querySelector('#actionFromStorage').textContent = model.fromStorage;

        var callingComponentCol = shadowRoot.querySelector('#callingComponent');
        if (!callingComponentCol.hasChildNodes()) {
            if (model.callingComponent) {
                var auracomponent = document.createElement('aurainspector-auracomponent');
                auracomponent.setAttribute('globalId', model.callingComponent);
                auracomponent.setAttribute('summarize', 'true');
                callingComponentCol.appendChild(auracomponent);
            } else {
                shadowRoot.querySelector('.calling-component-container').classList.add('slds-hide');
            }
        }

        if (
            model.returnError !== undefined &&
            model.returnError !== null &&
            model.returnError !== 'undefined'
        ) {
            //when there is error, we don't show action result.
            this.classList.add('has-error');
            shadowRoot.querySelector('#actionError').textContent = model.returnError;
            shadowRoot.querySelector('#action-response-container').classList.add('slds-hide');
            shadowRoot.querySelector('#action-error-container').classList.remove('slds-hide');
        } else {
            this.classList.remove('has-error');
            shadowRoot.querySelector('#actionResult').textContent = model.returnValue;

            shadowRoot.querySelector('#action-response-container').classList.remove('slds-hide');
            shadowRoot.querySelector('#action-error-container').classList.add('slds-hide');
        }
        if (this.hasAttribute('stats')) {
            var statsInfo = JSON.parse(this.getAttribute('stats'));

            shadowRoot.querySelector('#statsCreated').textContent = statsInfo.created;
        }

        if (model.isStorable === 'false' || model.isStorable === false) {
            // Hide the storable sub info columns
            shadowRoot.querySelector('.attributes').classList.add('storable-false');
        }

        if (this.getAttribute('toWatch') === 'true') {
            //let people decide what they would like to do once the actionCard is created inside watch list
            shadowRoot.querySelector('.remove-card').classList.remove('slds-hide');
            //shadowRoot.querySelector(".dropOrModify").style.display = "block";
            shadowRoot.querySelector('.action-card-wrapper').classList.add('watch');

            if (this.getAttribute('dropOrModify') === 'modifyResponse') {
                //non-error response next time
                show(shadowRoot.querySelector('.div_editActionResult')); //.style.display = "block";
                hide(shadowRoot.querySelector('.div_errorResponse')); //.style.display = "none";
            } else if (this.getAttribute('dropOrModify') === 'errorResponseNextTime') {
                //error response next time
                hide(shadowRoot.querySelector('.div_editActionResult')); //.style.display = "none";
                show(shadowRoot.querySelector('.div_errorResponse')); //.style.display = "block";
            } else {
                //drop action
                hide(shadowRoot.querySelector('.div_errorResponse')); //.style.display = "none";
                hide(shadowRoot.querySelector('.div_editActionResult')); //.style.display = "none";
            }
        }
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
        if (attrName === 'collapsible') {
            const container = this.querySelector('div.action-card-wrapper');
            if (newVal == 'false') {
                container.classList.remove('is-collapsible');
            } else {
                container.classList.add('is-collapsible');
            }
        }
    }
}

customElements.define('aurainspector-action-card', ActionCard);

function ToggleActionCard_OnClick(event) {
    this.classList.toggle('is-collapsed');
}

//we don't want to watch this action any more, remove it from pendding overrides
function RemoveCard_OnClick() {
    var actionId = this.getAttribute('id');
    var actionName = this.getAttribute('name');

    if (actionId) {
        //var actionParameter = JSON.parse(actionParameter);//obj
        var data = JSON.stringify({
            actionName: actionName, //necessary, as we use this as key in actionsToWatch AuraInspectorInjectedScript.js
            actionId: actionId //like "action_card_1852;a", we need this to make actionCard on leftside draggable again
        });

        var command = `
               window[Symbol.for('AuraDevTools')].Inspector.publish("AuraInspector:RemoveActionFromWatchList", ${data});
            `;
        chrome.devtools.inspectedWindow.eval(command, function(response, exception) {
            if (exception) {
                console.log('ERROR from removeActionCard, CMD:', command, exception);
            }
        });
    } else {
        console.error("removeActionCard, couldn't find actionId");
    }
    this.parentNode.removeChild(this);
}

function DropOrModify_OnChange() {
    const shadowRoot = this;
    var dropOrModify = shadowRoot.querySelector('#select_dropOrModify').value;
    this.setAttribute('dropOrModify', dropOrModify);
    if (dropOrModify === 'dropAction') {
        hide(shadowRoot.querySelector('.div_editActionResult')); //.style.display = "none";
        hide(shadowRoot.querySelector('.div_errorResponse')); //.style.display = "none";
    } else if (dropOrModify === 'modifyResponse') {
        show(shadowRoot.querySelector('.div_editActionResult')); //.style.display = "block";
        hide(shadowRoot.querySelector('.div_errorResponse')); //.style.display = "none";
        //get an array of key->value from response, fill them into the picklist -- save this to actionCard itself?
        var returnValue = this.getAttribute('returnValue');

        var actionResultValue = shadowRoot.querySelector('#textarea_actionResultValue');
        actionResultValue.value = returnValue;
        //show save/cancel button, and wire up logic
        show(shadowRoot.querySelector('.div_editActionResult'));
    } else if (dropOrModify === 'errorResponseNextTime') {
        hide(shadowRoot.querySelector('.div_editActionResult'));
        show(shadowRoot.querySelector('.div_errorResponse'));

        shadowRoot
            .querySelector('#errorResponseType')
            .addEventListener('change', ErrorReponseType_OnChange.bind(this));
    } else {
        console.warn('unknown choice for dropOrModify, we need a handler for it !!!');
    }
}

function ErrorReponseType_OnChange() {
    var errorResponseType = this.querySelector('#errorResponseType').value;
    if (errorResponseType === 'exceptionEvent') {
        this.setAttribute('errorResponseType', 'exceptionEvent');
        hide(this.querySelector('.messageAndStackDiv'));
        show(this.querySelector('.exceptionEventDiv'));
    } else {
        this.setAttribute('errorResponseType', 'messageAndStack');
        hide(this.querySelector('.exceptionEventDiv'));
        show(this.querySelector('.messageAndStackDiv'));
    }
}

function SaveError_OnClick() {
    var actionId = this.getAttribute('id');
    var nextError;
    if (actionId) {
        var errorResponseType = this.getAttribute('errorResponseType');
        if (errorResponseType == 'exceptionEvent') {
            var attributes = this.querySelector('#eventAttribute').value.trim();
            try {
                attributes = JSON.parse(attributes);
            } catch (e) {
                /*nothing, just pass the raw string*/
            }
            nextError = {
                exceptionEvent: true,
                event: {
                    descriptor: this.querySelector('#eventDescriptor').value.trim(), //"nameSpace://eventName",//opt
                    attributes: attributes
                    /*{ //or just "attributes"
							"values": [1,2,3]
						}, */
                    //"eventDef":  //opt
                }
            };
        } else if (errorResponseType == 'messageAndStack') {
            nextError = {
                message: this.querySelector('#textarea_actionErrorMessage').value.trim(),
                stack: this.querySelector('#textarea_actionErrorStack').value.trim()
            };
        }
        if (nextError) {
            var data = JSON.stringify({
                actionName: this.getAttribute('name'), //necessary, as we use this as key in actionsToWatch AuraInspectorInjectedScript.js
                actionId: actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
                nextResponse: undefined,
                nextError: nextError
            });
            //console.log('SaveActionResult_OnClick, dataToPublish = ', dataToPublish);
            //call AuraInspectorActionsView_OnEnqueueNextErrorForAction in AuraInspectorActionsView
            var command = `
		               window[Symbol.for('AuraDevTools')].Inspector.publish("AuraInspector:EnqueueNextErrorForAction", ${data});
		            `;
            chrome.devtools.inspectedWindow.eval(command, function(response, exception) {
                if (exception) {
                    console.log('ERROR from SaveActionResult_OnClick, CMD:', command, exception);
                }
            });
            //make the textara readonly
            if (errorResponseType == 'messageAndStack') {
                this.querySelector('#textarea_actionErrorMessage').setAttribute(
                    'readonly',
                    'readonly'
                );
                this.querySelector('#textarea_actionErrorStack').setAttribute(
                    'readonly',
                    'readonly'
                );
            } else {
                this.querySelector('#eventDescriptor').setAttribute('readonly', 'readonly');
                this.querySelector('#eventAttribute').setAttribute('readonly', 'readonly');
            }

            //hide save/cancel button
            hide(this.querySelector('#button_saveError'));
            hide(this.querySelector('#button_cancelError'));

            //display the edit button
            show(this.querySelector('#button_editError'));
        } else {
            console.log('nextErrorMsg cannot be empty');
        }
    }
}

function EditError_OnClick() {
    const shadowRoot = this;
    var actionId = this.getAttribute('id');
    var errorResponseType = this.getAttribute('errorResponseType');
    if (actionId) {
        //make the textara readonly
        if (errorResponseType == 'messageAndStack') {
            this.querySelector('#textarea_actionErrorMessage').removeAttribute('readonly');
            this.querySelector('#textarea_actionErrorStack').removeAttribute('readonly');
        } else {
            this.querySelector('#eventDescriptor').removeAttribute('readonly');
            this.querySelector('#eventAttribute').removeAttribute('readonly');
        }

        //show save/cancel button
        show(shadowRoot.querySelector('#button_saveError'));
        show(shadowRoot.querySelector('#button_cancelError'));

        //hide the edit button
        hide(shadowRoot.querySelector('#button_editError'));
    }
}

function CancelError_OnClick() {
    const shadowRoot = this;
    //hide next error response area
    hide(shadowRoot.querySelector('.div_errorResponse'));
    // var div_errorResponse = shadowRoot.querySelector(".div_errorResponse");
    // div_errorResponse.style.display = "none";
    //change select back to default, which is drop action
    shadowRoot.querySelector('#select_dropOrModify').value = 'dropAction';
}

function CancelChangeActionResult_OnClick() {
    const shadowRoot = this;
    //hide next response area
    hide(shadowRoot.querySelector('.div_editActionResult'));
    // var div_editActionResult = shadowRoot.querySelector(".div_editActionResult");
    // div_editActionResult.style.display = "none";

    //change select back to default, which is drop action
    shadowRoot.querySelector('#select_dropOrModify').value = 'dropAction';
}

function EditActionResult_OnClick() {
    const shadowRoot = this;
    //make the textara writable
    shadowRoot.querySelector('#textarea_actionResultValue').removeAttribute('readonly');

    //show save/cancel button
    show(shadowRoot.querySelector('#button_saveActionResult'));
    show(shadowRoot.querySelector('#button_cancelChangeActionResult'));

    //hide edit button
    hide(shadowRoot.querySelector('#button_editActionResult'));
}

function SaveActionResult_OnClick() {
    const shadowRoot = this;
    var actionId = this.getAttribute('id');
    var actionName = this.getAttribute('name');
    var actionParameter = this.getAttribute('parameters');
    //var actionIsStorable = this.getAttribute("isStorable");

    var nextResponseValue = shadowRoot.querySelector('#textarea_actionResultValue').value;
    if (actionId && nextResponseValue) {
        try {
            //see if we can parse it to Json
            nextResponseValue = JSON.parse(nextResponseValue);
        } catch (e) {
            //nothing, if we cannot, just trim it.
            nextResponseValue = nextResponseValue.trim();
            console.warn('cannot parse response into JSON', e);
        }
        //publish data to AuraInspectorActionsView
        var data = JSON.stringify({
            actionName: actionName,
            actionParameter: JSON.parse(actionParameter),
            actionId: actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
            //'actionIsStorable': actionIsStorable, no need
            nextResponse: nextResponseValue,
            nextError: undefined
        });

        //call AuraInspectorActionsView_OnEnqueueNextResponseForAction in AuraInspectorActionsView
        var command = `
               window[Symbol.for('AuraDevTools')].Inspector.publish("AuraInspector:EnqueueNextResponseForAction", ${data});
            `;
        chrome.devtools.inspectedWindow.eval(command, function(response, exception) {
            if (exception) {
                console.log('ERROR from SaveActionResult_OnClick, CMD:', command, exception);
            }
        });
        //make the textara readonly
        shadowRoot
            .querySelector('#textarea_actionResultValue')
            .setAttribute('readonly', 'readonly');

        //hide save/cancel button
        hide(shadowRoot.querySelector('#button_saveActionResult'));
        hide(shadowRoot.querySelector('#button_cancelChangeActionResult'));

        //show edit button
        show(shadowRoot.querySelector('#button_editActionResult'));
    } else {
        console.log(
            'SaveActionResult_OnClick, either actionId is bogus, or bad nextResponse',
            actionId,
            nextResponseValue
        );
    }
}

function show(element) {
    if (!element) {
        return;
    }
    element.classList.remove('slds-hide');
}

function hide(element) {
    if (!element) {
        return;
    }
    element.classList.add('slds-hide');
}

function formatActionName(actionName) {
    const fragment = document.createDocumentFragment();
    const pair = actionName.split('$');

    const controller = document.createElement('span');
    controller.className = 'action-name-controller';
    controller.textContent = pair[0];

    const method = document.createElement('span');
    method.className = 'action-name-method';
    method.textContent = pair[1];

    const delimiter = document.createElement('span');
    delimiter.className = 'action-name-delimiter';
    delimiter.textContent = '$';

    fragment.appendChild(controller);
    fragment.appendChild(delimiter);
    fragment.appendChild(method);

    return fragment;
}
