({
    /**
     * Event Panel Tests
     * [X] - Firing a component event, shows a component event in the list.
     * [X] - Firing an application event shows an application event in the list.
     * [ ] - App Events Filter filters app events
     * [ ] - Cmp Events Filter filters cmp events
     * [ ] - Unhandled filter filters Unhandled events
     * [ ] - Aura events hidden by the aura native events filter
     * [ ] - Text filter restricts events by text supplied.
     * [ ] - Filters in Combination with the Record Button.
     * [ ] - Record Button
     * [ ] - Clear Button
     * [ ] - Event Card information 
     */
    setUp: function(cmp) {
        // Wait to run anything till the Test Api is ready.
        // this should also be enough for having EventLogPanel ready
        return new Promise((resolve, reject) => {
            var handler = function() {
                cmp.removeEventHandler("inspector:testApiReady", handler);
                //this.util.clearEventsList();
                resolve();                
            }.bind(this);

            // Is the test API Ready?
            const $Aura = window[Symbol.for("AuraDevTools")];
            if($Aura !== undefined && $Aura.Test) {
                handler = null;
                resolve();
            } else {
                cmp.addEventHandler("inspector:testApiReady", handler);
            }

        });
    },

    /**
     * Fire a component event, see that it shows up in the event list.
     */ 
    testComponentEvent: {
        test: function(cmp) {
            const EXPECTED = "inspector:customCmpEvent";

            this.util.toggleFilterUnhandled(true);
            var evt = cmp.getEvent("customCmpEvent");
            evt.fire();

            $A.test.addWaitFor(true, () => {
                return this.util.isEventInList(EXPECTED);
            });
        }
    },

    /**
     * Fire an application event, see that it shows up in the event list.
     */
    testApplicationEvent: {
        test: function(cmp) {
            const EXPECTED = "inspector:customAppEvent"

            this.util.toggleFilterUnhandled(true);
            var evt = $A.getEvt(EXPECTED);
            evt.fire();

            $A.test.addWaitFor(true, () => {
                return this.util.isEventInList(EXPECTED);
            });
        }
    },

    util: {
        /**
         * Toggle the Unhandled filter on or off.
         * @param {Boolean} targetState Ensure the state of the button to be either ON (true) or OFF (false)
         */
        toggleFilterUnhandled: function(targetState) {
            const button = document.querySelector("button[title='[eventlog_menu_unhandled_tooltip]']");
            
            if(targetState === undefined) {
                $A.test.clickOrTouch(button);
                return;
            }

            const currentState = button.classList.contains("slds-is-selected");
            console.log("toggle filter", targetState, currentState);

            if(targetState !== currentState) {
                $A.test.clickOrTouch(button);
                return;
            }
        },

        /**
         * Clear all the events currently in the list.
         * Does not clear any events recorded, but not currently in the list. (Aka doesn't clear data source)
         */
        clearEventsList: function() {
            console.log("Clear Events List");
            var clearButton = document.querySelector("#event-panel-container > menu button[title='[menu_clear]']");
            $A.test.clickOrTouch(clearButton);
        },

        /**
         * Get all the events currently displayed in the list
         */
        getEventsList: function() {
            const titles = document.querySelectorAll(".event-card-title");
            const map = Array.prototype.map;

            return map.call(titles, (title) => {
                return title.innerText.trim();
            });
        },

        /**
         * Has the specified event been displayed in the events log panel
         * @param {String} eventName Name of the event to search for in the list of events. Do not include markup://.
         * @returns True if the event is present
         */
        isEventInList: function(eventName) {
            return this.getEventsList().includes(eventName);
        }
    }
})