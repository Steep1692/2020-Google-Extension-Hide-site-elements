'use strict';

// Classes
class Cursor {
  mouseEl = document.createElement('div')
  _eventListeners = [
    {
      target: document,
      type: 'mousemove',
      listener: (e) => {
        this._onMouseMove(e);
      },
      options: {},
    },
    {
      target: this.mouseEl,
      type: 'click',
      listener: (e) => {
        this._onClick(e);
      },
      options: {},
    },
    {
      target: document,
      type: 'keydown',
      listener: (e) => {
        this._onKeyDown(e);
      },
      options: {},
    }
  ]

  constructor() {
    this._initStyles();
  }

  onMouseMove() {
    console.log('The method \'onMouseMove\' might be implemented;');
  }
  onClick() {
    console.log('The method \'onClick\' might be implemented;');
  }
  onKeyDown() {
    console.log('The method \'onKeyDown\' might be implemented;');
  }

  enable() {
    this._addEventListeners();
    this._addToHTML();
  }
  disable() {
    this._removeEventListeners();
    this._removeFromHTML();
  }

  setPosition(x, y) {
    this.mouseEl.style.top = `${y}px`;
    this.mouseEl.style.left = `${x}px`;
  }

  _addEventListeners() {
    const eventListeners = this._eventListeners;

    for(let eventListener of eventListeners) {
      const {target, type, listener, options} = eventListener;

      target.addEventListener(type, listener, options);
    }
  }
  _removeEventListeners() {
    const eventListeners = this._eventListeners;

    for(let eventListener of eventListeners) {
      const {target, type, listener, options} = eventListener;

      target.removeEventListener(type, listener, options);
    }
  }

  _onMouseMove(e) {
    const {x, y} = e;
    this.setPosition(-16, -16);

    this.onMouseMove(e);

    this.setPosition(x, y);
  }
  _onClick(e) {
    const {x, y} = e;
    this.setPosition(-16, -16);

    this.onClick(e);

    this.setPosition(x, y);
  }
  _onKeyDown(e) {
    const {x, y} = e;
    this.setPosition(-16, -16);

    this.onKeyDown(e);

    this.setPosition(x, y);
  }

  _initStyles() {
    this.mouseEl.style = `
      position: fixed;
      z-index: 9999;

      width: 3px;
      height: 3px;
      
      background-color: #00f;
  `;
  }

  _addToHTML() {
    document.body.append(this.mouseEl);
  }
  _removeFromHTML() {
    this.mouseEl.remove();
  }
}

class BlockControl {
  constructor(cursor) {
    this._initHoverStyles();

    this.cursor = cursor;

    this.obj = [];
    this.key = 'BlockControl';

    this._checkToSavedValue();
  }

  async addBlockWithCursor() {
      const element = await this._initCursorToGetNewElement();

      if(element instanceof HTMLElement) {
        const name = this._getElementName(element);

        this.addBlock(element, name);
      }

      return true;
  }

  addBlock(element, name) {

    const identicalBlock = this._indexOfBlocks(name);

    if(identicalBlock === -1) {
      const parent = element.parentNode;
      const arrayOfBlocks = this.obj;
      const newBlock = {
        visible: true,
        name,
        element,
        parent,
        saved: false,
      };

      arrayOfBlocks.push(newBlock);

      this.set(arrayOfBlocks);
    } else {
      this._errorBlockAlreadyExist(name);
    }

  }
  removeBlock({name}) {
    const blockIndex = this._indexOfBlocks(name);

    if(blockIndex > -1) {
      const arrayOfBlocks = this.obj;
      const {element} = arrayOfBlocks[blockIndex];

      this._showBlock(name);
      this._removeHoverStyles(element);

      arrayOfBlocks[blockIndex] = null;

      this.set(
          arrayOfBlocks.filter((block) => block !== null)
      );
    } else {
      this._errorBlockNotFound(name);
    }
  }

  hideBlock({name}) {
    this._updateBlockSaveStatus(name, false);
    this._hideBlock(name);
  }
  showBlock({name}) {
    this._updateBlockSaveStatus(name, false);
    this._showBlock(name);
  }

  getBlocksForPopup() {
    return this.obj.map(this._transformBlockForPopup);
  }
  set(payload) {
    this.obj = this._filterBadBlocks(payload);
  }
  saveConfigToLocalStorage() {
    this._changeBlockSaveStatusForAll(true);
    this._saveToLocalStorage();
  }

  addBlocksHighlight() {
    const arrayOfBlocks = this.obj;

    for(let {element} of arrayOfBlocks) {
      this._addHoverStyles(element);
    }
  }
  removeBlocksHighlight() {
    const arrayOfBlocks = this.obj;

    for(let {element} of arrayOfBlocks) {
      this._removeHoverStyles(element);
    }
  }

  _transformBlockForPopup({visible, name, saved}) {
    return {
      visible,
      name,
      saved,
    };
  }

  _initCursorToGetNewElement() {
    return new Promise((resolve, reject) => {
      this.cursor.enable();

      let suitableElement = null;

      this.cursor.onMouseMove = ({clientX, clientY}) => {
        const currentTargetElement = document.elementFromPoint(clientX, clientY);
        const currentTargetSuitableElement = this._getParentThatHasId(currentTargetElement);

        if(
            currentTargetSuitableElement
            && currentTargetSuitableElement !== suitableElement
        ) {
          this._removeHoverStyles(suitableElement);

          this._addHoverStyles(currentTargetSuitableElement);

          suitableElement = currentTargetSuitableElement;
        }
      }

      this.cursor.onClick = ({clientX, clientY}) => {
        this._removeHoverStyles(suitableElement);

        resolve(suitableElement);

        this.cursor.disable();
      }

      this.cursor.onKeyDown = (({key}) => {
        key = key.toLocaleLowerCase();

        if(key === 'esc' || key === 'escape') {
          this.cursor.disable();

          this._removeHoverStyles(suitableElement);

          resolve(null);
        }
      })
    });
  }

  _indexOfBlocks(name) {
    const arrayOfBlocks = this.obj;
    let result = -1;

    arrayOfBlocks.every((block, index) => {

      if(block.name === name) {
        result = index;

        return false;
      }

      return true;
    });

    return result;
  }
  _getElementName({id}) {
    return `#${id}` || null;
  }
  _getParentThatHasId(element) {
    if(element === document) {
      return null;
    }

    const parent = element.parentNode;

    if(parent.id) {
      return parent;
    } else {
      return this._getParentThatHasId(parent);
    }
  }

  _addHoverStyles(el) {
    if(el instanceof HTMLElement) {
      el.dataset['siteOptimizeId'] = this._getElementName(el);
      el.classList.add('__hover');
    } else {
      this._errorNotHTMLElement();
    }
  }
  _removeHoverStyles(el) {
    if(el instanceof HTMLElement) {
      el.classList.remove('__hover');
    } else {
      this._errorNotHTMLElement();
    }
  }

  _hideBlock(name) {
    const blockIndex = this._indexOfBlocks(name);

    if(blockIndex > -1) {
      const arrayOfBlocks = this.obj;
      const {element} = arrayOfBlocks[blockIndex];

      arrayOfBlocks[blockIndex].visible = false;

      element.style.display = 'none';

      this._removeHoverStyles(element);
    } else {
      this._errorBlockNotFound(name);
    }
  }
  _showBlock(name) {
    const blockIndex = this._indexOfBlocks(name);

    if(blockIndex > -1) {
      const arrayOfBlocks = this.obj;
      const {element} = arrayOfBlocks[blockIndex];

      arrayOfBlocks[blockIndex].visible = true;

      element.style.display = '';

      this._addHoverStyles(element);
    } else {
      this._errorBlockNotFound(name);
    }
  }

  _updateBlockSaveStatus(name, payload) {
    const blockIndex = this._indexOfBlocks(name);

    if(blockIndex > -1) {
      const arrayOfBlocks = this.obj;

      arrayOfBlocks[blockIndex].saved = payload;
    } else {
      this._errorBlockNotFound(name);
    }
  }
  _changeBlockSaveStatusForAll(payload) {
    const blocks = this.obj;

    for(let block of blocks) {
      block.saved = payload;
    }

    this.set(blocks);
  }

  _checkToSavedValue() {
    let localStorageBlocks = this._getFromLocalStorage();

    if(localStorageBlocks && localStorageBlocks.length) {
      this.set(localStorageBlocks);
      this._applyConfig(localStorageBlocks);
    }
  }
  _filterBadBlocks(blocks) {
    blocks = blocks.map((block) => {
      const blockElement = document.querySelector(block.name);

      if(blockElement instanceof HTMLElement) {
        block.element = blockElement;
        block.parent = block.element.parentNode;
      } else {
        block = null;
      }
      return block;
    });

    return blocks.filter((block) => block !== null);
  }
  _getFromLocalStorage() {
    return JSON.parse( localStorage.getItem(this.key) );
  }
  _saveToLocalStorage() {
    localStorage.setItem(
        this.key,
        JSON.stringify(this.obj)
    );
  }
  _applyConfig(blocks) {
    for(let {name, visible} of blocks) {

      if( !visible ) {
        this._hideBlock(name);
      }
    }
  }

  _initHoverStyles() {
    const styles = document.createElement('style');

    styles.innerHTML = `
      :root {
        --optimize-site-text-shadow-color: #fff;
      }
    
      .__hover {
        position: relative;
      }
      
      .__hover:after {
        z-index: 2;
        position: absolute;
        top: 4px;
        left: 4px;
      
        color: red;
        text-shadow: 2px 0 0 var(--optimize-site-text-shadow-color),
          -2px 0 0 var(--optimize-site-text-shadow-color),
          0 2px 0 var(--optimize-site-text-shadow-color),
          0 -2px 0 var(--optimize-site-text-shadow-color),
          1px 1px var(--optimize-site-text-shadow-color),
          -1px -1px 0 var(--optimize-site-text-shadow-color),
          1px -1px 0 var(--optimize-site-text-shadow-color),
          -1px 1px 0 var(--optimize-site-text-shadow-color);
               
        content: attr(data-site-optimize-id);
      }
      
      .__hover:before {
        z-index: 1;
        position: absolute;
        top: 0;
        left: 0;
        
        width: 100%;
        height: 100%;
        
        background-color: rgba(0, 0, 200, 0.6);
      
        content: "";
      }
    `;

    let headElement = document.head;


    if(headElement === null) {
      headElement = document.createElement('head');

      document.append(headElement);
    }

    headElement.append(styles);
  }

  _errorBlockNotFound(name) {
    console.error(`Error. Block not found! -> ${name}`);
  }
  _errorNotHTMLElement() {
    console.error('Error. Element isn\'t HTML Element!');
  }
  _errorBlockAlreadyExist(name) {
    console.error(`Error. Block already exist! -> ${name}`);
  }
}

// Globals
const cursor = new Cursor();
const blockControl = new BlockControl(cursor);

// Methods
const handlePopupEvents = (event, data, callback) => {
  console.log(event);

  if(event === 'getBlocks') {
    callback(
        blockControl.getBlocksForPopup()
    );
  }

  if(event === 'addBlockWithCursor') {
    blockControl.addBlockWithCursor().then(callback);
  }
  if(event === 'removeBlock') {
    callback(
        blockControl.removeBlock(data)
    );
  }

  if(event === 'showBlock') {
    callback(
        blockControl.showBlock(data)
    );
  }
  if(event === 'hideBlock') {
    callback(
        blockControl.hideBlock(data)
    );
  }

  if(event === 'saveConfigToLocalStorage') {
    callback(
        blockControl.saveConfigToLocalStorage()
    );
  }

  if(event === 'addBlocksHighlight') {
    callback(
        blockControl.addBlocksHighlight()
    );
  }
  if(event === 'removeBlocksHighlight') {
    callback(
        blockControl.removeBlocksHighlight()
    );
  }
};
const handleBackgroundEvents = (event, data, callback) => {
  if(event === 'popupClose') {
    callback(
        blockControl.removeBlocksHighlight()
    );
  }
};

// Global listeners
chrome.runtime.onMessage.addListener(({from, event, data}, sender, callback) => {
  if(from === 'popup') {
    handlePopupEvents(event, data, callback);
  }

  if(from === 'background') {
    handleBackgroundEvents(event, data, callback);
  }

  return true;
});