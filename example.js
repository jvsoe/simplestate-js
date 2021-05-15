'use strict';

const App = SimpleStateInit(() => {
    return (`
      <div>
        <h2>Basket:</h2>
        ${App.basket.render()}
      </div>
      </div>
      <div class="nonsense">
      ${App.basket.render_nonsense()}
      </div>
	`)
})

App.addComponent({
    name: 'basket',
    state: {
        messages: {
            1: { state: 'IN', sending_post: 12, sending_user: 123, message: "Get it done", answer: null, done: null },
            2: { state: 'OUT', sending_post: 12, sending_user: 123, message: "Make apple cider", answer: null, done: null },
            3: { state: 'OUT', sending_post: 12, sending_user: 123, message: "Make orange juice", answer: "Done", done: true },
            4: {
                state: 'OUT',
                sending_post: 12,
                sending_user: 123,
                message: "Make maple cyrup",
                answer: "No maple due to civil war. ML, HJ",
                done: false,
            },
        }
    },
    render: (state) => {
        let first_despatch = state.messages[Object.keys(state.messages)[0]];
        const desp = (acc, [id, despatch]) => acc+'<tr><td>'+Object.values(despatch).join('</td><td>')+'</td></tr>'
        let body_rows = Object.entries(state.messages).reduce(desp,'')
        let head_rows = Object.keys(first_despatch).join('</th><th>')
        console.log(body_rows)
        console.log(head_rows)
        return (`
            <table>
              <thead>
                <tr>
                  <th>
                    ${head_rows}
                  </th>
                </tr>
              <tbody>
                <tr>
                  <th>
                    ${body_rows}
                  </th>
                </tr>

        `)
    },
  // Alternative way of adding render method
  // render_other: () => {
  //   return App.state.basket.messages[2].message;
  // }
})

// Define function for rendering nonsense
App.basket.defineRenderFunc('render_nonsense', (state) => { return state.messages[1].message; })

// Another alternative way of adding render method
// App.basket.render_other = () => {
//   return App.state.basket.messages[2].message;
// }

App.bindToAppContainer("app")
