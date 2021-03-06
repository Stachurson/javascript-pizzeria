
import {
  settings, select, templates, classNames
} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

export class Product {
  constructor(id, data) {
    const thisProduct = this;
    thisProduct.id = id;
    thisProduct.data = data;
    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();

    // console.log('new Product', thisProduct);
  }
  renderInMenu() {
    const thisProduct = this;
    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);
    /* create element using utils.createElementFromHTML */
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    /* find menu container */
    const menuContainer = document.querySelector(select.containerOf.menu);
    /* add element to menu */
    menuContainer.appendChild(thisProduct.element);
  }
  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);

    // console.log('thisProduct.form', thisProduct.form);

    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);

    // console.log('thisProduct.formInputs', thisProduct.formInputs);

    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);

    // console.log('thisProduct.priceElem', thisProduct.priceElem);

    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }
  initAccordion() {
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    const triggerClick = thisProduct.accordionTrigger;
    /* START: click event listener to trigger */
    triggerClick.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      /* find all active products */
      const activeProducts = document.querySelectorAll(select.all.menuProductsActive);
      /* START LOOP: for each active product */
      for (let activeProduct of activeProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct != thisProduct.element) {
          /* remove class active for the active product */
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }
  initOrderForm() {
    const thisProduct = this;
    // console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });

  }
  processOrder() {
    const thisProduct = this;
    const formData = utils.serializeFormToObject(thisProduct.form);

    // console.log('formData', formData);
    thisProduct.params = {};

    let price = thisProduct.data.price;

    // console.log('processOrder');
    /* START LOOP: for each PARAM */
    for (let paramId in thisProduct.data.params) {
      /*save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];
      for (let optionId in param.options) {
        /* save the element in param.options with key optionId as const option */
        const option = param.options[optionId];
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        /* START: IF option is checked && !=default */
        if (optionSelected && !option.default) {
          /*  +price */
          price += option.price;
          /* END: IF option is checked && !=default and START: ELSE IF option is NOT checked && =default */
        } else if (!optionSelected && option.default) {
          /* -price */
          price -= option.price;
          /* END: ELSE IF option is NOT checked && =default */
        }
        /* all images for this option in thisProduct.imageWrapper, which match selector containing:. param key - option key*/

        const optionImages = thisProduct.imageWrapper.querySelectorAll('.' + paramId + '-' + optionId);
        /* START: IF image */
        if (optionSelected) {
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          thisProduct.params[paramId].options[optionId] = option.label;
          for (let optionImage of optionImages) {
            optionImage.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for (let optionImage of optionImages) {
            optionImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
        /* END LOOP: for each OPTION */
      }
      /* END LOOP: for each PARAM */
    }
    /* multiply price by amount */
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;
    // console.log('thisProduct.params', thisProduct.params);

  }
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  addToCart() {
    const thisProduct = this;
    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;

    const event = new CustomEvent('add-to-cart', {

      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });

    thisProduct.element.dispatchEvent(event);

  }
}

export default Product;