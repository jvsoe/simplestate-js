'use strict';

// Init App!
function SimpleStateInit(app_func) {
    console.log("Initial function should always take the argument 'state'");
    if (!(app_func instanceof Function)) {
        console.error("First and only argument must be function that renders App.");
    }
    
    app_func.state = {}
    app_func.bindToAppContainer = (app_container_id, render_now) => {
        render_now = true ? render_now === undefined : render_now
        app_func.app_container_id = app_container_id;
        app_func.render = () => {
            document.getElementById(app_func.app_container_id).innerHTML = app_func();
            return document.getElementById(app_func.app_container_id).innerHTML;
        }
        if (render_now) {
            app_func.render();
        }
    }
    app_func.addComponent = (dictionary) => {
        let initial_state = dictionary.state // Because .state is changed to a function inside SimpleStateClass
        let component = SimpleStateClass(dictionary, app_func);
        app_func[dictionary.name] = component;
        app_func.state[dictionary.name] = initial_state;
        return component;
    }
    app_func.addComponent.parent = app_func;
    return app_func
}

// One has to define state and render function IN the SimpleStateClass initialization
function SimpleStateClass(simpleStateObject, app) {
    if (!(simpleStateObject instanceof Object)) {
        console.error("First and only argument needs to be an object.");
    }
    else if (!("state" in simpleStateObject)) {
        console.error("You must set an initial state object as the attribute 'state'.");
    }
    else if (!("render" in simpleStateObject)) {
        console.error("You must set a function on the render attribute returning a string. Fx: { render: () => { return ''; } }");
    }
    else if (!("name" in simpleStateObject)) {
        console.error("You must set a name attribute");
    }

    Object.defineProperty(simpleStateObject, 'state', {
        value: () => { return app.state[simpleStateObject.name];}
        // writable: false  // default is false
    });

    // Define method for checking if state is equal new state
    simpleStateObject._states_are_equal = (new_state, old_state, first_round) => {
        if (!(first_round === false)) {  // If it's the first round
            old_state = app[simpleStateObject.name].state();
        }
        Object.entries(new_state).forEach((key, value) => {
            if (value instanceof Object) {
                // If new this node is an object - go nest digging
                if(!simpleStateObject._states_are_equal(value, old_state[key], false)) {
                    return false;
                }
            }
            else if (!(key in old_state) || !(value === old_state[key])) {
                return false;
            }
            return true;
        })
    }

    Object.defineProperty(simpleStateObject, 'set_state', {
        value: (new_state) => {
            console.log('set_state');
            if (new_state instanceof Object) {
                let states_are_equal = simpleStateObject._states_are_equal(new_state, app.state[simpleStateObject.name]);
                // simpleStateObject.state = new_state;
                app.state[simpleStateObject.name] = new_state;
                if (!states_are_equal) {
                    simpleStateObject._renderedDOM = simpleStateObject.render("SMART", true, app.state[simpleStateObject.name]);
                }
                app.render();
            }
            else {
                console.warn("Not an object: " + new_state);
            }
        }
    })

    Object.defineProperty(simpleStateObject, 'defineRenderFunc', {
        value: (func_name, render_func) => {
            console.log('defineRenderFunc');
            let func_name_is_string = (typeof func_name === 'string' || func_name instanceof String)
            if (!func_name_is_string || !func_name || !func_name.match(/^[\w_]+$/)) {
                console.error("First argument must be a string and valid function name");
            }
            else if (render_func instanceof Function) {
                // app[simpleStateObject.name][func_name] = () => {
                simpleStateObject[func_name] = () => {
                    console.log('app.state[simpleStateObject.name]', app.state[simpleStateObject.name])
                    return render_func(app.state[simpleStateObject.name]);
                }
            }
            else {
                console.error("Second argument must be a function returning a string with state object as only parameter: " + render_func);
            }
        }
    })


    // Create empty property for rendererd DOM; redundant
    simpleStateObject._renderedDOM = '';

    // Set render function logic
    simpleStateObject._render_func = simpleStateObject.render
    simpleStateObject.render = (mode, re_render, state) => {
        mode = mode || "SMART";
        state = state || app.state[simpleStateObject.name];
        console.log('render: mode, re_render, state', mode, re_render, state)
        if ((mode === "FORCE") || re_render || !simpleStateObject._renderedDOM) {
            console.log('re-rendered CONFIRMED')
            simpleStateObject._renderedDOM = simpleStateObject._render_func(state);
        }
        return simpleStateObject._renderedDOM;
    }
    return simpleStateObject;
}
