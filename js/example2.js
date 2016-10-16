'use strict';

const SORT_FUNCTION = {
  WORD: (isAscending, entryA, entryB) => {
    let valA = isAscending ? -1 : 1;
    let valB = isAscending ? 1 : -1;
    return entryA.word < entryB.word ? valA : valB;
  },
  RANDOM_VAL: (isAscending, entryA, entryB) => {
    let valA = isAscending ? -1 : 1;
    let valB = isAscending ? 1 : -1;
    return entryA.randomVal < entryB.randomVal ? valA : valB;
  }
};

$(() => {
  let playground = document.getElementById('playground');
  let SearchComponent = {
    controller: function() {
      const allEntries = dictionary.map(word => ({
        word: word,
        randomVal: Math.random().toFixed(3) * 1000
      }));
      const pageSize = 50;

      let sortFn = SORT_FUNCTION.WORD;
      let sortIsAscending = true;
      let currentPage = 0;
      let filteredResults = allEntries;
      let pagedResults = allEntries.slice(0, pageSize);
      let searchTerm = '';
      return {
        getPageSize: () => pageSize,
        getCurrentPage: () => currentPage,
        getTotalPages: () => Math.ceil(
          filteredResults.length / pageSize),
        getSearchTerm: () => searchTerm,
        getPagedResults: () => pagedResults,
        getResultCount: () => filteredResults.length,
        doSorting: function(fn) {
          if (fn == sortFn) {
            sortIsAscending = sortIsAscending ? false : true;
          } else {
            sortFn = fn;
            sortIsAscending = true;
          }
          allEntries.sort(fn.bind(undefined, sortIsAscending));
          this._refreshFilteredResults();
        },
        setSearchTermAndUpdate: function(val) {
          let oldSearchTerm = searchTerm;
          searchTerm = val;
          if (oldSearchTerm.trim() == searchTerm.trim()) {
            // No need to refresh results or do anything.
            return;
          }
          currentPage = 0;
          this._refreshFilteredResults();
        },
        setPageAndUpdate: function(page) {
          currentPage = page;
          this._refreshPagedResults();
        },
        // Private controller functionality - views should not be calling these
        // methods directly.
        _refreshFilteredResults: function() {
          const cleaned = searchTerm.toLowerCase().trim();
          filteredResults = allEntries.filter(
            x => !searchTerm || x.word.includes(cleaned));
          this._refreshPagedResults();
        },
        _refreshPagedResults: function() {
          pagedResults = filteredResults.slice(
            currentPage * pageSize, (currentPage + 1) * pageSize);
        },
      };
    },
    view: ctrl => {
      return m('div.main', [
        m('div', [
          'Enter a search term: ',
          m('input', {
            type: 'text', value: ctrl.getSearchTerm(),
            oninput: m.withAttr(
              'value', ctrl.setSearchTermAndUpdate.bind(ctrl))})
        ]),
        m.component(PageWidget, ctrl),
        m.component(ResultsTable, ctrl)
      ]);
    }
  };
  let PageWidget = {
    view: (unusedCtrl, model) => {
      const totalResults = model.getResultCount();
      if (!totalResults) {
        return m('div');
      }

      const currentPage = model.getCurrentPage();
      const totalPages = model.getTotalPages();
      const firstEntry = currentPage * model.getPageSize() + 1;
      const lastEntry = Math.min(
        totalResults,
        firstEntry + model.getPageSize() - 1);

      return m('div.page-widget', [
        m('a.caret', {
          style: {display: currentPage ? 'inline-block' : 'none'},
          onclick: () => model.setPageAndUpdate(currentPage - 1)
        }, '<<'),
        m('span', [
          'Showing ', firstEntry, ' - ', lastEntry, ' of ', totalResults,
          ' total results']),
        m('a.caret', {
          style: {display: currentPage < totalPages - 1 ?
            'inline-block' : 'none'},
          onclick: () => model.setPageAndUpdate(currentPage + 1)
        }, '>>'),
      ])

    }
  };
  let ResultsTable = {
    view: (unusedCtrl, model) => {
      const resultCount = model.getResultCount();
      const pagedResults = model.getPagedResults();
      if (!resultCount) {
        return m('div.no-results', 'No results found.');
      }
      return m('table', [
        m('tr.header-row', [
          m('td', {
            onclick: model.doSorting.bind(model, SORT_FUNCTION.WORD)
          }, 'Word'),
          m('td', {
            onclick: model.doSorting.bind(model, SORT_FUNCTION.RANDOM_VAL)
          }, 'Random value')
        ]),
        ...pagedResults.map(result => m('tr', [
          m('td', result.word),
          m('td', result.randomVal)
        ]))
      ]);
    }
  };
  m.mount(playground, SearchComponent);
});
