$(() => {
  let playground = document.getElementById('playground');
  let component = {
    controller: function() {
      return {
        nominate: function(name) {
          // Return the current special one to the list of others, and
          // choose a new special one.
          this.others.push(this.specialOne);

          let selection = this.others.find(x => x.name == name);
          this.others = this.others.filter(x => x != selection);
          this.specialOne = selection;
        },
        specialOne: {name: 'Whale'},
        others: [
          {name: 'Goat'},
          {name: 'Bear'},
          {name: 'Horse'},
          {name: 'Pigeon'},
          {name: 'Chicken'}
        ]
      };
    },
    view: ctrl => {
      return m('div', [
        m('p', [
          'Current special one: ', ctrl.specialOne.name
        ]),
        m('p', 'Or, choose a different special one:'),
        m('div.options', [
          m('ul', ctrl.others.map((el, index) => {
            return m('li', {key: el.name}, [
              m('span.clickable', {
                'data-name': el.name,
                'onclick': m.withAttr('data-name', ctrl.nominate.bind(ctrl))
              }, el.name)
            ])
          }))
        ])
      ]);
    }
  };
  m.mount(playground, component);
});
