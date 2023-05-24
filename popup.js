// Classes
class Table {
  constructor(domElement) {
    this.root = domElement;

    this._initTableHTML();
  }

  initTableChild(tagName) {
    let child = this.root.querySelector(tagName);

    if( !child ) {
      child = document.createElement(tagName);
      this.root.append(child);
    }

    this[tagName] = child;
  }
  getTableChild(tagName) {
    if(tagName) {
      const tableChild = this[tagName] || 'The table has not such child.';

      if(tableChild instanceof HTMLElement) {
        return tableChild;
      } else {
        throw 'The table has not such child.';
      }
    } else {
      throw 'Param is required. Example -> "thead".';
    }
  }
  clearTableChild(tagName) {
    if(tagName) {
      const tableChild = this[tagName];

      if(tableChild instanceof HTMLElement) {
        tableChild.innerHTML = '';
        return true;
      } else {
        throw 'The table has not such child.';
      }
    } else {
      throw 'Param is required. Example -> "thead".';
    }
  }

  addRow(domElement, placement) {
    if(domElement instanceof HTMLElement) {
      this.getTableChild(placement).append(domElement);
    } else {
      throw 'Param should be an HTML Element!';
    }
  }

  _initTableHTML() {
    this.initTableChild('thead');
    this.initTableChild('tbody');
    this.initTableChild('tfoot');
  }
}

class BlocksManager extends Table {
  constructor(domElement) {
    super(domElement);
    this.blocks = [];

    this._fetchBlocks();
    this._initHTML();
  }

  renderTableBody() {
    this.clearTableChild('tbody');

    const blocks = this.blocks;

    for(let block of blocks) {
      const tableRow = this._createBlockTableRow(block);

      this.addRow(tableRow, 'tbody');
    }
  }

  toggleAllCheckboxes() {
    const blocksCheckboxes = this._getAllCheckboxes();
    let checkboxAllStatus = this._getCheckboxAllStatus();

    blocksCheckboxes.forEach((checkbox, index) => {
      checkbox.checked = checkboxAllStatus;
    });
  }
  setBlocks(blocks) {
    this.blocks = blocks;

    this.renderTableBody();
  }

  hideBlock(block) {
    this._emit('hideBlock', block);
  }
  showBlock(block) {
    this._emit('showBlock', block);
  }
  toggleBlock(block) {
    if(block.visible) {
      this.hideBlock(block);
    } else {
      this.showBlock(block)
    }
  }
  removeBlock(block) {
    this._emit('removeBlock', block);
  }
  addBlockWithCursor() {
    this._emit('addBlockWithCursor');
  }
  removeCheckedBlocks() {
    const checkedBlocks = this._getCheckedBlocks();

    for(let block of checkedBlocks) {
      this.removeBlock(block);
    }
  }

  saveConfigToLocalStorage() {
    this._emit('saveConfigToLocalStorage');
  }

  _getTableRowOfBlock({name}) {
    const spans = this._getAllSpans();

    for(let span of spans) {

      if(span.innerHTML === name) {
        return span.parentNode.parentNode;
      }
    }
  }
  _getAllSpans() {
    return this.getTableChild('tbody').querySelectorAll('span');
  }
  _getAllCheckboxes() {
    return this.getTableChild('tbody').querySelectorAll('input');
  }
  _getIsBlockChecked(block) {
    const blockTableRow = this._getTableRowOfBlock(block);
    const blockCheckbox = blockTableRow.querySelector('input');

    return blockCheckbox.checked;
  }
  _getCheckedBlocks() {
    const blocks = this.blocks;
    const checkedBlocks = [];

    for(let block of blocks) {

      if( this._getIsBlockChecked(block) ) {
        checkedBlocks.push(block);
      }
    }

    return checkedBlocks;
  }
  _getCheckboxAllStatus() {
    return this.getTableChild('thead').querySelector('input').checked;
  }
  _getBlockSelectorWithActionBtn(actionBtn) {
    return actionBtn.parentElement.parentElement.parentElement.querySelector('span').innerHTML;
  }
  _getBlockWithName(selector) {
    for(let block of this.blocks) {

      if (block.name === selector) {
        return block;
      }
    }
  }
  _getToggleBtnText({visible}) {
    return (visible) ? 'Hide' : 'Show'
  }

  _createCheckboxElement() {
    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';

    return checkbox;
  }
  _createSpanElement(innerHTML) {
    const span = document.createElement('span');

    span.innerHTML = innerHTML;

    return span;
  }
  _createButtonElement(innerHTML) {
    const button = document.createElement('button');

    button.innerHTML = innerHTML;

    return button;
  }
  _createActionsElement(block) {
    const actions = document.createElement('div');

    const btnToggle = this._createButtonElement(
        this._getToggleBtnText(block)
    );

    btnToggle.addEventListener('click', () => {
      this.toggleBlock(block);
      btnToggle.innerHTML = this._getToggleBtnText(block);
    });

    const buttons = [
      btnToggle,
    ];

    actions.append(...buttons);

    return actions;
  }

  _createRow(arrayOfCells, cellType) {
    const tableRow = document.createElement('tr');

    for(let cell of arrayOfCells) {
      const tableCel = document.createElement(cellType);

      for(let element of cell) {

        tableCel.append(element);
      }

      tableRow.append(tableCel);
    }

    return tableRow;
  }
  _createBlockTableRow(block) {
    const checkbox = this._createCheckboxElement();
    const span = this._createSpanElement(block.name);

    const buttons = this._createActionsElement(block);

    const tableRow = this._createRow([
      [checkbox],
      [span],
      [buttons],
    ], 'td');

    tableRow.className = (block.saved) ? 'is-saved' : 'is-not-saved';

    return tableRow;
  }

  _fetchBlocks() {
    return this._emit('getBlocks', null, (blocks) => {
      this.setBlocks(blocks);
    }, false);
  }

  _initHTML() {
    this._initTableHead();
    this.renderTableBody();
    this._initTableFoot();
  }
  _initTableHead() {
    const checkboxAll = this._createCheckboxElement();
    const span = this._createSpanElement('Selector');
    const empty = this._createSpanElement('Actions');

    checkboxAll.addEventListener('click', () => {
      this.toggleAllCheckboxes();
    });

    const tableRow = this._createRow([
      [checkboxAll],
      [span],
      [empty],
    ], 'th');

    this.addRow(tableRow, 'thead');
  }
  _initTableFoot() {
    const btnDelete = this._createButtonElement('Remove checked');
    btnDelete.addEventListener('click', () => {
      this.removeCheckedBlocks();
    });

    const btnAddNew = this._createButtonElement('Add block with cursor');
    btnAddNew.addEventListener('click', () => {
      this.addBlockWithCursor();
    });

    const btnSaveConfig = this._createButtonElement('Save config');
    btnSaveConfig.addEventListener('click', () => {
      this.saveConfigToLocalStorage();
    });

    const tableRow = this._createRow([
      [btnDelete],
      [btnAddNew],
      [btnSaveConfig],
    ], 'td');

    this.addRow(tableRow, 'tfoot');
  }

  _emit(event, data = null, callback = () => {}, needUpdateAfterResolve = true) {
    emit(event, data, (response) => {
      callback(response);

      if(needUpdateAfterResolve) {
        this._fetchBlocks();
      }
    });
  }
}

// Methods
const initBackgroundScriptPort = () => {
  chrome.extension.connect({
    name: 'popup status',
  });
};
const initBlocksControl = () => {
  const table = new BlocksManager(
      document.getElementById('js-table')
  );
};

const addBlocksHighlight = () => {
  emit('addBlocksHighlight');
};
const removeBlocksHighlight = () => {
  emit('removeBlocksHighlight');
};

const onPopupOpen = () => {
  initBackgroundScriptPort();

  initBlocksControl();
  addBlocksHighlight();
};
const onPopupClose = () => {
  removeBlocksHighlight();
};

// Global listeners
window.addEventListener('DOMContentLoaded', onPopupOpen);
window.onblur = onPopupClose;