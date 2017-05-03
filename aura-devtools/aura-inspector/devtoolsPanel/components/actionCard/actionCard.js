(function() {
	var ownerDocument = document.currentScript.ownerDocument;

	var actionCard = Object.create(HTMLElement.prototype);

	/**
	 * The element has been attached to the DOM, update the structure.
	 *
	 * Kris: This probably wouldn't even be necessary if we configured the
	 * attributeChangedCallback correctly.
	 *
	 * @return {[type]} [description]
	 */

	actionCard.attachedCallback = function() {
		var model = {
			id: 			this.getAttribute("actionId"),
			actionName: 	this.getAttribute("name"),
			parameters: 	this.getAttribute("parameters"),
			state: 			this.getAttribute("state"),
			isBackground: 	this.getAttribute("isBackground"),
			isStorable: 	this.getAttribute("isStorable"),
			isRefresh: 		this.getAttribute("isStorable") === "true" ? this.getAttribute("isRefresh") : "-",
			isAbortable:	this.getAttribute("isAbortable"),
			returnValue:	this.getAttribute("returnValue"),
			returnError:    this.getAttribute("returnError") === '[]'? undefined : this.getAttribute("returnError"),
			howDidWeModifyResponse: this.getAttribute("howDidWeModifyResponse"),//responseModified_modify, responseModified_drop, responseModified_error
			fromStorage:	this.getAttribute("isStorable") === "true" ? this.getAttribute("isFromStorage") : "-",
            //storageKey could be very long, I want people be able to see it when they want to, hide it like other JSON object when no one cares
			storageKey:	this.getAttribute("isStorable") === "true" ? "{\"storageKey\":"+JSON.stringify(this.getAttribute("storageKey"))+"}" : "-",
			// storageKey: this.getAttribute("isStorable") === "true" ? this.getAttribute("storageKey") : "-",
			storableSize:	this.getAttribute("isStorable") === "true" ? (JSON.stringify(this.getAttribute("returnValue")).length / 1024).toFixed(1) + " KB" : "-",
			callingComponent: this.getAttribute("callingComponent")
		};

        const shadowRoot = this;

        const actionName = shadowRoot.querySelector("#action-name");
        actionName.innerHTML = "";
        actionName.appendChild(formatActionName(model.actionName));

    	shadowRoot.querySelector(".parameters").textContent 	= model.parameters;
    	shadowRoot.querySelector(".storageKey").textContent = model.storageKey;
    	shadowRoot.querySelector("#actionId").textContent 		= model.id;
    	shadowRoot.querySelector("#actionState").textContent 	= model.state;
    	shadowRoot.querySelector("#actionIsAbortable").textContent = model.isAbortable;
    	shadowRoot.querySelector("#actionIsBackground").textContent = model.isBackground;
    	shadowRoot.querySelector("#actionIsStorable").textContent 	= model.isStorable;
    	shadowRoot.querySelector("#actionStorableSize").textContent = model.storableSize;
    	shadowRoot.querySelector("#actionIsRefresh").textContent 	= model.isRefresh;
    	shadowRoot.querySelector("#actionFromStorage").textContent = model.fromStorage;

    	var callingComponentCol = shadowRoot.querySelector("#callingComponent");
    	if(!callingComponentCol.hasChildNodes()) {
    		if(model.callingComponent) {
	    		var auracomponent = document.createElement("aurainspector-auracomponent");
				auracomponent.setAttribute("globalId", model.callingComponent);
                auracomponent.setAttribute("summarize", "true");
	    		callingComponentCol.appendChild(auracomponent);
	    	} else {
	    		shadowRoot.querySelector(".calling-component-container").classList.add("slds-hide");
	    	}
    	}

    	if(model.returnError != undefined || model.returnError != null) {//when there is error, we don't show action result.
            this.classList.add("has-error");
    		shadowRoot.querySelector("#actionError").textContent = model.returnError;
    		shadowRoot.querySelector("#action-response-container").classList.add("slds-hide");
    		shadowRoot.querySelector("#action-error-container").classList.remove("slds-hide");
    	} else {
            this.classList.remove("has-error");
    		shadowRoot.querySelector("#actionResult").textContent = model.returnValue;

    		shadowRoot.querySelector("#action-response-container").classList.remove("slds-hide");
    		shadowRoot.querySelector("#action-error-container").classList.add("slds-hide");    		
    	}
    	if(this.hasAttribute("stats")) {
    		var statsInfo = JSON.parse(this.getAttribute("stats"));

    		shadowRoot.querySelector("#statsCreated").textContent = statsInfo.created;
    	}

    	if(model.isStorable === "false" || model.isStorable === false) {
    		// Hide the storable sub info columns
    		shadowRoot.querySelector(".attributes").classList.add("storable-false");
    	}

    	if(this.getAttribute("toWatch") === "true") {
    		//let people decide what they would like to do once the actionCard is created inside watch list    	
    		shadowRoot.querySelector(".remove-card").classList.remove("slds-hide");
    		//shadowRoot.querySelector(".dropOrModify").style.display = "block";
			shadowRoot.querySelector(".action-card-wrapper").classList.add("watch");
			
    	
    		if(this.getAttribute("dropOrModify") === "modifyResponse") {//non-error response next time
    			show(shadowRoot.querySelector(".div_editActionResult"));//.style.display = "block";
				hide(shadowRoot.querySelector(".div_errorResponse"));//.style.display = "none";
    		} else if(this.getAttribute("dropOrModify") === "errorResponseNextTime"){//error response next time
				hide(shadowRoot.querySelector(".div_editActionResult"));//.style.display = "none";
				show(shadowRoot.querySelector(".div_errorResponse"));//.style.display = "block";	
    		} else {//drop action
    			hide(shadowRoot.querySelector(".div_errorResponse"));//.style.display = "none";	
				hide(shadowRoot.querySelector(".div_editActionResult"));//.style.display = "none";
    		}
    	}
	};

	/*
		New Action Card created, update it's body
	 */
	actionCard.createdCallback = function(){
    	const template = ownerDocument.querySelector("template");
    	const clone = document.importNode(template.content, true);
    	//const shadowRoot = this.createShadowRoot();
        const shadowRoot = this;
    	
        shadowRoot.appendChild(clone);

        shadowRoot.querySelector(".action-toggle").addEventListener("click", ToggleActionCard_OnClick.bind(this));
        shadowRoot.querySelector("#select_dropOrModify").addEventListener('change', DropOrModify_OnChange.bind(this));
        shadowRoot.querySelector(".remove-card").addEventListener('click', RemoveCard_OnClick.bind(this));

        const overridesSelect = shadowRoot.querySelector("#select_dropOrModify");
        overridesSelect.options[0].text = chrome.i18n.getMessage("actioncard_dropaction");
        overridesSelect.options[1].text = chrome.i18n.getMessage("actioncard_overrideresult");
        overridesSelect.options[2].text = chrome.i18n.getMessage("actioncard_errorresponse");


        shadowRoot.querySelector("#button_saveActionResult").addEventListener('click',  SaveActionResult_OnClick.bind(this));
        shadowRoot.querySelector("#button_cancelChangeActionResult").addEventListener('click',  CancelChangeActionResult_OnClick.bind(this));
        shadowRoot.querySelector("#button_editActionResult").addEventListener('click',  EditActionResult_OnClick.bind(this));
        shadowRoot.querySelector("#button_saveError").addEventListener('click',  SaveError_OnClick.bind(this));
        shadowRoot.querySelector("#button_cancelError").addEventListener('click',  CancelError_OnClick.bind(this));
        shadowRoot.querySelector("#button_editError").addEventListener('click',  EditError_OnClick.bind(this));

        if(this.getAttribute("collapsible")==="false") {
            const container = shadowRoot.querySelector("div.action-card-wrapper");
            container.classList.remove("is-collapsible");
        }
	};

	actionCard.attributeChangedCallback = function(attrName, oldVal, newVal) {
		//console.log("The attribute %s changed from %s to %s", attrName, oldVal, newVal);
		const shadowRoot = this;
        if(attrName==="collapsible") {
            const container = shadowRoot.querySelector("div.action-card-wrapper");
            if(newVal == "false") {
                container.classList.remove("is-collapsible");
            } else {
                container.classList.add("is-collapsible");
            }
        }
	};

	var actionCardConstructor = document.registerElement('aurainspector-actionCard', {
		prototype: actionCard
	});

    function ToggleActionCard_OnClick(event) {
        this.classList.toggle("is-collapsed");
    }

	//we don't want to watch this action any more, remove it from pendding overrides
	function RemoveCard_OnClick() {
		var actionId = this.getAttribute("id");
		var actionName = this.getAttribute("name");
		
		if(actionId) {
			//var actionParameter = JSON.parse(actionParameter);//obj
			var data = JSON.stringify({
                            'actionName': actionName,//necessary, as we use this as key in actionsToWatch AuraInspectorInjectedScript.js
                            'actionId' : actionId,//like "action_card_1852;a", we need this to make actionCard on leftside draggable again
                            });
            
            var command = `
               window[Symbol.for('AuraDevTools')].Inspector.publish("AuraInspector:RemoveActionFromWatchList", ${data});
            `;
            chrome.devtools.inspectedWindow.eval(command, function (response, exception) {
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
		var dropOrModify = shadowRoot.querySelector("#select_dropOrModify").value;
		this.setAttribute("dropOrModify", dropOrModify);
		if(dropOrModify === "dropAction") {
			hide(shadowRoot.querySelector(".div_editActionResult"));//.style.display = "none";
			hide(shadowRoot.querySelector(".div_errorResponse"));//.style.display = "none";
		} else if (dropOrModify === "modifyResponse") {
			show(shadowRoot.querySelector(".div_editActionResult"));//.style.display = "block";
			hide(shadowRoot.querySelector(".div_errorResponse"));//.style.display = "none";
			//get an array of key->value from response, fill them into the picklist -- save this to actionCard itself?
			var returnValue = this.getAttribute("returnValue");
			returnValue = JSON.parse(returnValue);
			var returnValueArray = [];
			getArrayOfObject(returnValue, returnValueArray, null);
			var select_actionResultKey = shadowRoot.querySelector("#select_actionResultKey");
			for(var i = 0; i < returnValueArray.length; i++) {
				returnValueArrayi = returnValueArray[i];
		    	var key = Object.keys(returnValueArrayi)[0];
		    	//var value = returnValueArrayi[key];
				var option = document.createElement("option");
				option.text = key;
		    	select_actionResultKey.add(option);
			}
			//show save/cancel button, and wire up logic
			show(shadowRoot.querySelector(".div_editActionResult"));//.style.display = "block";
		} else if (dropOrModify === "errorResponseNextTime") {
            hide(shadowRoot.querySelector(".div_editActionResult"));//.style.display = "none";
			show(shadowRoot.querySelector(".div_errorResponse"));//.style.display = "block";
		} else {
			console.log("unknown choice for dropOrModify, we need a handler for it !!!");
		}
	}

	function SaveError_OnClick() {
		const shadowRoot = this;
		var actionId = this.getAttribute("id");
		if(actionId) {
			var nextErrorMsg = shadowRoot.querySelector("#textarea_actionErrorMessage").value.trim();
			var nextErrorStack = shadowRoot.querySelector("#textarea_actionErrorStack").value.trim();
			var nextError = {
                "message": nextErrorMsg,
                "stack": nextErrorStack
            };
			
			if(nextErrorMsg && nextErrorMsg.length) {
				var data = JSON.stringify({
                    'actionName': this.getAttribute("name"),//necessary, as we use this as key in actionsToWatch AuraInspectorInjectedScript.js
                    'actionId': actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
                    'nextResponse': undefined,
                    'nextError': nextError
                });
	            //console.log('SaveActionResult_OnClick, dataToPublish = ', dataToPublish);
	            //call AuraInspectorActionsView_OnEnqueueNextErrorForAction in AuraInspectorActionsView
	            var command = `
	               window[Symbol.for('AuraDevTools')].Inspector.publish("AuraInspector:EnqueueNextErrorForAction", ${data});
	            `;
	            chrome.devtools.inspectedWindow.eval(command, function (response, exception) {
		            if (exception) {
		            	console.log('ERROR from SaveActionResult_OnClick, CMD:', command, exception);
		            }
		        });
		        //make the textara readonly
		        shadowRoot.querySelector("#textarea_actionErrorMessage").setAttribute('readonly','readonly');
		        shadowRoot.querySelector("#textarea_actionErrorStack").setAttribute('readonly','readonly');
		        
                //hide save/cancel button
		        hide(shadowRoot.querySelector("#button_saveError"));
		        hide(shadowRoot.querySelector("#button_cancelError"));

		        //display the edit button
		        show(shadowRoot.querySelector("#button_editError"));
			} else {
				console.log("nextErrorMsg cannot be empty");
			}
		}
	}

	function EditError_OnClick() {
		const shadowRoot = this;
		var actionId = this.getAttribute("id");
		if(actionId) {
			//make the textara readonly
		    shadowRoot.querySelector("#textarea_actionErrorMessage").removeAttribute('readonly');
		    shadowRoot.querySelector("#textarea_actionErrorStack").removeAttribute('readonly');

		    //show save/cancel button
		    show(shadowRoot.querySelector("#button_saveError"));
		    show(shadowRoot.querySelector("#button_cancelError"));

		    //hide the edit button
		    hide(shadowRoot.querySelector("#button_editError"));
		}
	}

	function CancelError_OnClick() {
		const shadowRoot = this;
		//hide next error response area
        hide(shadowRoot.querySelector(".div_errorResponse"));
		// var div_errorResponse = shadowRoot.querySelector(".div_errorResponse");
		// div_errorResponse.style.display = "none";
		//change select back to default, which is drop action
		shadowRoot.querySelector("#select_dropOrModify").value = "dropAction";
	}

	function CancelChangeActionResult_OnClick() {
		const shadowRoot = this;
		//hide next response area
        hide(shadowRoot.querySelector(".div_editActionResult"));
		// var div_editActionResult = shadowRoot.querySelector(".div_editActionResult");
		// div_editActionResult.style.display = "none";

		//change select back to default, which is drop action
		shadowRoot.querySelector("#select_dropOrModify").value = "dropAction";
	}

	function EditActionResult_OnClick() {
		const shadowRoot = this;
		//make the textara writable
	    shadowRoot.querySelector("#textarea_actionResultValue").removeAttribute('readonly');

	    //show save/cancel button
	    show(shadowRoot.querySelector("#button_saveActionResult"));
	    show(shadowRoot.querySelector("#button_cancelChangeActionResult"));

	    //hide edit button
	    hide(shadowRoot.querySelector("#button_editActionResult"));
	}

	function SaveActionResult_OnClick() {
		const shadowRoot = this;
		var actionId = this.getAttribute("id");
		var actionName = this.getAttribute("name");
		var actionParameter = this.getAttribute("parameters");
		var actionIsStorable = this.getAttribute("isStorable");

		//for now, let's only allow modify one set of key->value in response, and key has to be an string
		var nextResponseKey = shadowRoot.querySelector("#select_actionResultKey").value;
		nextResponseKey = nextResponseKey ? nextResponseKey.trim() : undefined;
		
		var nextResponseValue = shadowRoot.querySelector("#textarea_actionResultValue").value;
		var nextResponse = {};
		if(actionId && nextResponseKey && nextResponseKey.length && nextResponseValue) {
			try { //see if we can parse it to Json
				nextResponseValue = JSON.parse(nextResponseValue);
			} catch(e) {
				//nothing, if we cannot, just trim it.
				nextResponseValue = nextResponseValue.trim();
			}
			nextResponse[nextResponseKey] = nextResponseValue;

			//publish data to AuraInspectorActionsView
			var data = JSON.stringify({
							'actionName': actionName, 
							'actionParameter': JSON.parse(actionParameter), 
							'actionId': actionId.substring(12, actionId.length), //action_card_713;a --> 713;a
							//'actionIsStorable': actionIsStorable, no need
							'nextResponse': nextResponse,
							'nextErrorMsg': undefined
                        });

            //call AuraInspectorActionsView_OnEnqueueNextResponseForAction in AuraInspectorActionsView
            var command = `
               window[Symbol.for('AuraDevTools')].Inspector.publish("AuraInspector:EnqueueNextResponseForAction", ${data});
            `;
            chrome.devtools.inspectedWindow.eval(command, function (response, exception) {
	            if (exception) {
	            	console.log('ERROR from SaveActionResult_OnClick, CMD:', command, exception);
	            }
	        });
	        //make the textara readonly
	        shadowRoot.querySelector("#textarea_actionResultValue").setAttribute('readonly','readonly');

	        //hide save/cancel button
	        hide(shadowRoot.querySelector("#button_saveActionResult"));
	        hide(shadowRoot.querySelector("#button_cancelChangeActionResult"));

	        //show edit button
	        show(shadowRoot.querySelector("#button_editActionResult"))
		} else {
			console.log("SaveActionResult_OnClick, either actionId is bogus, or bad value of key/value in nextResponse", 
				actionId, nextResponseKey, nextResponseValue);
		}
	}

    function show(element) {
        if(!element) {
            return;
        }
        element.classList.remove("slds-hide");
    }

    function hide(element) {
        if(!element) {
            return;
        }
        element.classList.add("slds-hide");

    }

    function formatActionName(actionName) {
        const fragment = document.createDocumentFragment();
        const pair = actionName.split("$");

        const controller = document.createElement("span");
        controller.className = "action-name-controller";
        controller.textContent = pair[0];

        const method = document.createElement("span");
        method.className = "action-name-method";
        method.textContent = pair[1];

        const delimiter = document.createElement("span");
        delimiter.className = "action-name-delimiter";
        delimiter.textContent="$";

        fragment.appendChild(controller);
        fragment.appendChild(delimiter);
        fragment.appendChild(method);

        return fragment;
    }

    //This return true if the object is an array, and it's not empty
    function isNonEmptyArray(obj) {
        if(obj && typeof obj === "object" && obj instanceof Array && obj.length && obj.length > 0) {
            return true;
        } else {
            return false;
        }
    }

    //This return true if the object is with type Object, but not an array or null/undefined
    function isTrueObject(obj) {
        if(obj && typeof obj === "object" && !(obj instanceof Array)) {
            return true;
        } else {
            return false;
        }
    }

    //given an object, go through each property (if it's an object itself, keep digging in), return an array of key --> value
    function getArrayOfObject(obj, resultArray, nextKey) {
        if(typeof obj === "string" || typeof obj === "boolean" || typeof obj === "number" || obj === null || obj === undefined) {
            if(nextKey != null && nextKey != undefined && nextKey !== "$serId$") {
                var tmpObj = {}; 
                tmpObj[nextKey] = obj;
                resultArray.push(tmpObj);
            }
        } else if (isTrueObject(obj)) {
            for (var key in obj) {
                var value = obj[key];
                getArrayOfObject(value, resultArray, key);
            }
        } else if (isNonEmptyArray(obj)) {
            for(var i = 0; i < obj.length; i ++) {
                var obji = obj[i];
                getArrayOfObject(obji, resultArray, null);
            }
        }
    }

})();
