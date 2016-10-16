$(() => {
  const QuantitativeFilterDetailComponent = {
    view: (ctrl, config) => {
      let focused = config.focusedFilter() == config.filter;
      return m('div', [
        m('select', {
          onchange: m.withAttr('value', x => {
            config.focusedFilter(config.filter);
            config.filter.operator = x;})
        }, ..._optionList([
          {value: '>', display: '>'},
          {value: '<', display: '<'}], config.filter.operator)),
        m('input', {
          value: config.filter.value,
          oninput: m.withAttr('value', x => config.filter.value = x),
          config: el => {
            if (focused) {
              $(el).focus();
              config.focusedFilter(null);
            }
          }}),
      ]);
    }
  };

  const FilterComponent = {
    view: (ctrl, config) => {
      return m('div', [
        m.component(SelectComponent, {
          initValue: config.filter.type,
          onchange: val => {
            if (val) {
              config.filter.type = val;
              config.focusedFilter(config.filter);
            } else {
              config.remove();
            }
          }
        }),
        m('a', {onclick: config.remove, style: {
          marginLeft: '10px',
          cursor: 'pointer',
          color: 'blue'}}, 'remove'),
        m('br'),
        m.component(QuantitativeFilterDetailComponent, config),
        m('div', {style: {
          margin: '15px',
          width: '250px', borderBottom: '1px solid gray'}})
      ])
    }
  };

  const PlaceholderComponent = {
    view: (ctrl, config) => {
      return m('div', [
        m.component(SelectComponent, {
          onchange: x => {
            config.addFilter(new QuantitativeFilter(x));
          }
        })
      ]);
    }
  };

  const SelectComponent = {
    view: (ctrl, config) => {
      return m('select', {onchange: m.withAttr('value', config.onchange)},
      ..._optionList([
        {value: '', display: 'Add a filter...'},
        {value: 'clicks', display: 'Clicks'},
        {value: 'quality_score', display: 'Quality Score'}
      ], config.initValue));
    }
  }

  const MainComponent = {
    controller: function(config) {
      return {
        filters: config.filters,
        removeFilter: f => {
          if (config.filters.includes(f)) {
            config.filters.splice(config.filters.indexOf(f), 1);
          }
        },
        addFilter: f => config.filters.push(f),
        focusedFilter: m.prop(),
        placeholderKey: m.prop(GlobalId.get()),
      }
    },
    view: function(ctrl) {
      return m('div', ctrl.filters.map(x => m.component(FilterComponent, {
        key: x.id,
        filter: x,
        focusedFilter: ctrl.focusedFilter,
        remove: ctrl.removeFilter.bind(this, x),
      })).concat(m.component(PlaceholderComponent, {
        key: ctrl.placeholderKey(),
        addFilter: x => {
          ctrl.addFilter(x);
          ctrl.focusedFilter(x);
          ctrl.placeholderKey(GlobalId.get());
        }
      })));
    }
  };

  const playground = document.getElementById('playground');
  m.mount(playground, m.component(MainComponent, {filters: filters}));
});

// Global state
const filters = [];


// Utility stuff
function _optionList(entries, initVal) {
  return entries.map(e => m(
    'option', {value: e.value, selected: e.value == initVal}, e.display));
}

var GlobalId = (function() {
  var i = 0;
  return {
    get: () => {
      let v = i;
      i++;
      return v;
    }
  }
})();

class QuantitativeFilter {
  constructor(type, operator, value) {
    this.id = GlobalId.get();
    this.type = type;
    this.operator = operator || '>';
    this.value = value || '';
  }
}
