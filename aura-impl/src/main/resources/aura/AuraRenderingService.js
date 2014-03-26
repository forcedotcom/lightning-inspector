/*
 * Copyright (C) 2013 salesforce.com, inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jslint sub: true */
/**
 * @class The Aura Rendering Service, accessible using $A.renderingService.  Renders components.
 * The default behaviors can be customized in a client-side renderer.
 * @constructor
 */
var AuraRenderingService = function AuraRenderingService(){
    //#include aura.AuraRenderingService_private

    var renderingService = {
        /** State to avoid double-visiting components during rerender. */
        visited : undefined,

            /**
             * @private
             */
        rerenderDirty : function(stackName){
            if (priv.needsCleaning) {
                var num = aura.getContext().incrementRender();
                var initialMarkName = "Rerendering-" + num;
                $A.mark(initialMarkName);
                $A.mark("Fired aura:doneRendering event");
                priv.needsCleaning = false;

                //#if {"modes" : ["STATS"]}
                var cmpsWithWhy = { "stackName": stackName, "components": {} };
                //#end                     
                
                var cmps = [];
                for (var id in priv.dirtyComponents) {
                    var cmp = $A.componentService.get(id);
                    
                    // uncomment this to see what's dirty and why.  (please don't delete me again. it burns.)
                    // $A.log(cmp.toString(), priv.dirtyComponents[id]);
                    
                    if (cmp && cmp.isValid() && cmp.isRendered()) {
                        //
                        // We assert that we are not unrendering, as we should never be doing that,
                        // but we then check again, as in production we want to avoid the bug.
                        //
                        // For the moment, don't fail miserably here. This really is bad policy to allow
                        // things to occur on unrender that cause a re-render, but putting in the assert
                        // breaks code, so leave it out for the moment.
                        //
                        // aura.assert(!cmp.isUnrendering(), "Rerendering a component during unrender");
                        if (!cmp.isUnrendering()) {
                            cmps.push(cmp);

                            //#if {"modes" : ["STATS"]}
                            cmpsWithWhy["components"][id] = { "id": id, "descr": cmp.getDef().getDescriptor().toString(), "why": priv.dirtyComponents[id] };  
                            //#end                     
                        }
                    }else{
                        priv.cleanComponent(id);
                    }
                }
                
                //#if {"modes" : ["STATS"]}
                var startTime = (new Date()).getTime();
                //#end                     

                priv.setNewRerenderContext();
                try {
                    this.rerender(cmps);
                } finally {
                    priv.clearNewRerenderContext();
                }

                //#if {"modes" : ["STATS"]}
                if (cmps.length > 0) {
                	cmpsWithWhy["renderingTime"] = (new Date()).getTime() - startTime;
                	this.index(cmpsWithWhy);
                }
                //#end                     
                
                $A.endMark(initialMarkName);
                $A.get("e.aura:doneRendering").fire();
                $A.endMark("Fired aura:doneRendering event");
                
                // update the mark info after the fact to avoid unnecessary hits early to get cmp info
                // #if {"modes" : ["PTEST"]}
                    var markDescription = initialMarkName + ": [";
                    for (var m = 0; m < cmps.length; m++) {
                        var rerenderedCmpDef = cmps[m].getDef();
                        if (rerenderedCmpDef) {
                            markDescription += "'" + rerenderedCmpDef.descriptor.getQualifiedName() + "'";
                        }
                        if (m < cmps.length - 1) {
                            markDescription += ",";
                        }
                    }
                    markDescription += "]";
                    $A.updateMarkName(initialMarkName, markDescription);
                // #end
            }
        },

        /**
         * Renders a component by calling its renderer.
         * @param {Component} component
         *                 The component to be rendered
         * @param {Component} parent
         *                 Optional. The component's parent
         * @memberOf AuraRenderingService
         * @public
         */
        render: function AuraRenderingService$Render(component, parent) {
            if (component._arrayValueRef) {
                component = component._arrayValueRef;
            }

            if (component.auraType === "Value" && component.toString() === "ArrayValue"){
                return component.render(parent, priv.insertElements);
            }

            var ret = [];
            var array = priv.getArray(component);

            for (var x=0; x < array.length; x++){
                var cmp = array[x];

                if (!cmp["getDef"]) {
                    // If someone passed a config in, construct it.
                    cmp = $A.componentService.newComponentDeprecated(cmp, null, false, true);
                    // And put the constructed component back into the array.
                    array[x] = cmp;
                }

                var container = priv.push(cmp);
                try {
                    if (cmp.isValid()) {
                        var renderer = cmp.getRenderer();
                        var elements = renderer.def.render(renderer.renderable) || [];
                        priv.finishRender(cmp, elements, ret);
                        priv.insertElements(ret, parent);
                    }
                } finally {
                    priv.pop(cmp);
                }
            }
            return ret;
        },

        /**
         * The default behavior after a component is rendered.
         * @param {Component} component
         *                 The component that has finished rendering
         * @memberOf AuraRenderingService
         * @public
         */
        afterRender: function(component){
            var array = priv.getArray(component);
            for(var i=0;i<array.length;i++){
                var cmp = array[i];
                if (cmp.isValid()) {
                    var renderer = cmp.getRenderer();
                    renderer.def.afterRender(renderer.renderable);
                }
            }

        },

        /**
         * The default rerenderer for components affected by an event.
         * Call superRerender() from your customized function to chain the rerendering to the components in the body attribute.
         * @param {Component} component
         *                 The component to be rerendered
         * @param {Component} referenceNode
         *                 The reference node for the component
         * @param {Component} appendChild
         *                 The child component
         * @memberOf AuraRenderingService
         * @public
         */
        rerender: function(component, referenceNode, appendChild) {
            if (component._arrayValueRef) {
                component = component._arrayValueRef;
            }

            var topVisit = false;
            if (this.visited === undefined) {
                this.visited = {};
                topVisit = true;
            }
            try {
                if (component.auraType === "Value" && component.toString() === "ArrayValue"){
                    return component.rerender(referenceNode, appendChild, priv.insertElements);
                }

                var allElems = [];
                var array = priv.getArray(component);
                array = priv.reorderForContainment(array);
                for (var i = 0; i < array.length; i++){
                    var cmp = array[i];
                    if (cmp.isValid()) {
                        if (this.visited[cmp.getGlobalId()]) {
                            // we already visited this rerender; return the new elems per contract,
                            // but skip the actual work:
                            var startLen = allElems.length;
                            var elems = cmp.getElements();
                            for (var j = 0; j in elems; ++j) {
                                allElems.push(elems[j]);
                            }
                            if (allElems.length === startLen && element in elems) {
                                allElems.push(elems['element']);
                            }
                            continue;  // next item
                        }

                        // Otherwise, we're visiting a new-to-this-rerender component
                        this.visited[cmp.getGlobalId()] = true;
                        priv.push(cmp);
                        try {
                            // We use a copy of the old elements to decide whether we have a
                            // DOM change.
                            var oldElems = priv.copyElems(cmp);
                            if (!oldElems) {
                                oldElems = [];
                            }
                            var renderer = cmp.getRenderer();
                            var newElems = renderer.def.rerender(renderer.renderable);
                            if (!newElems) {
                                newElems = priv.copyElems(cmp);
                                if (!newElems) {
                                    newElems = [];
                                }
                            }
                            // Figure whether oldElems/newElems show a change
                            var changed = (newElems.length !== oldElems.length);
                            if (!changed) {
                                // Length is equal, so walk to look for different members:
                                for (var k = 0; newElems[k]; ++k) {
                                    if (newElems[k] !== oldElems[k]) {
                                        changed = true;
                                        break;
                                    }
                                }
                            }

                            if (changed && newElems.length) {
                                // finishRender is used here to associate elements and apply classes,
                                // and also to ensure that post-RErender, the component is clean, just
                                // like render does.  But we don't need it to accumulate a big return
                                // array, so the last "ret" param is skipped.
                                priv.finishRender(cmp, newElems);
                            } else {
                                // else we're okay for classes and such, but we still want to be clean
                                priv.cleanComponent(cmp.getGlobalId());
                            }
                            if (newElems.length) {
                                for (k = 0; newElems[k]; ++k) {
                                    allElems.push(newElems[k]);
                                }
                            }
                        } finally {
                            priv.pop(cmp, oldElems);
                        }
                    }
                }
                return allElems;
            } finally {
                if (topVisit) {
                    this.visited = undefined;
                }
            }
        },

        /**
         * The default unrenderer that deletes all the DOM nodes rendered by a component's render() function.
         * Call superUnrender() from your customized function to modify the default behavior.
         * @param {Component} component
         *                 The component to be unrendered
         * @memberOf AuraRenderingService
         * @public
         */
        unrender: function(component){
            if (!component){
                return;
            }

            if (component.auraType === "Value" && component.toString() === "ArrayValue"){
                component.unrender();
            }

            var array = priv.getArray(component);
            for (var i = 0; i < array.length; i++){
                var c = array[i];
                if (c.isValid() && c.isRendered()) {
                    var oldElems = priv.copyElems(c);
                    try {
                        priv.push(c);
                        var renderer = c.getRenderer();
                        c.setUnrendering(true);
                        try {
                            renderer.def.unrender(renderer.renderable);
                            c.setRendered(false);
                        } finally {
                            c.setUnrendering(false);
                        }
                    } finally {
                        priv.pop(c, oldElems);
                    }
                }
            }
        },

        /**
         * @protected
         */
        addDirtyValue: function(value) {
            priv.needsCleaning = true;
            var cmp = value.owner;
            if(cmp && cmp.isValid()){
                var id = cmp.getConcreteComponent().getGlobalId();
                var list = priv.dirtyComponents[id];
                if (!list) {
                    list = [value];
                    priv.dirtyComponents[id] = list;
                } else {
                    list.push(value);
                }
            }
        },

        /**
         * @protected
         */
        removeDirtyValue: function(value) {
            var cmp = value.owner;
            if(cmp && cmp.isValid()){
                var id = cmp.getConcreteComponent().getGlobalId();
                var a = priv.dirtyComponents[id];
                if (a) {
                    for (var i = 0; i < a.length; i++) {
                        if (a[i] === value) {
                            a.splice(i, 1);
                            break;
                        }
                    }

                    if (a.length === 0) {
                        delete priv.dirtyComponents[id];
                    }
                }
            }
        }

      //#if {"modes" : ["STATS"]}
        ,rerenderDirtyIndex : [],

        index : function(info) {
            this.rerenderDirtyIndex.push(info);
        },

        getRerenderingIndex : function() {
        	return this.rerenderDirtyIndex;
        }
    //#end        
    };
    
    //#include aura.AuraRenderingService_export

    return renderingService;
};
