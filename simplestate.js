'use strict';

// Init App!
function SimpleStateInit(app_func) {
    console.log("render function should always take one initial argument 'state'");
    if (!(app_func instanceof Function)) {
        console.error("First and only argument must be function that renders App.");
    }
    app_func.state = {}
    app_func.render = app_func
    app_func.AddComponent = (dictionary) => {
        let initial_state = dictionary.state // Because .state is changed to a function inside SimpleStateClass
        let component = SimpleStateClass(dictionary, app_func);
        app_func[dictionary.name] = component;
        app_func.state[dictionary.name] = initial_state;
    }
    app_func.AddComponent.parent = app_func;
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
                let states_are_equal = simpleStateObject._states_are_equal(new_state, app[simpleStateObject.name].state);
                // simpleStateObject.state = new_state;
                app[simpleStateObject.name].state = new_state;
                if (!states_are_equal) {
                    simpleStateObject._renderedDOM = simpleStateObject.render("SMART", true, app[simpleStateObject.name].state);
                }
            }
            console.warning("Not an object: " + new_state);
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
