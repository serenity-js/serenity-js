/* global window, document, HTMLElement */

/*
Based on "Using_shadow_DOM" by Mozilla Contributors
contributors: https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM/contributors.txt
source: MDN, https://mdn.github.io/web-components-examples/popup-info-box-web-component/index.html
license: https://creativecommons.org/licenses/by-sa/2.5/
*/

// Create a class for the element
class PopUpInfo extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();

        // Create a shadow root
        const shadow = this.attachShadow({mode: 'open'});

        // Create spans
        const wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'wrapper');

        const icon = document.createElement('span');
        icon.setAttribute('class', 'icon');
        icon.setAttribute('tabindex', 0);

        const info = document.createElement('span');
        info.setAttribute('class', 'info');

        // Take attribute content and put it inside the info span
        const text = this.dataset.text;
        info.textContent = text;

        // Insert icon
        let imgUrl;
        imgUrl = this.hasAttribute('img') ? this.getAttribute('img') : 'img/default.png';

        const img = document.createElement('img');
        img.src = imgUrl;
        icon.append(img);

        // Create some CSS to apply to the shadow dom
        const style = document.createElement('style');

        style.textContent = `
      .wrapper {
        position: relative;
      }

      .info {
        font-size: 0.8rem;
        width: 200px;
        display: none;
        border: 1px solid black;
        padding: 10px;
        background: white;
        border-radius: 10px;
        transition: .6s all;
        position: absolute;
        bottom: 20px;
        left: 10px;
        z-index: 3;
      }

      img {
        width: 1.2rem;
      }

      .icon:hover + .info, .icon:focus + .info {
        display: inline-block;
      }
    `;

        // Attach the created elements to the shadow dom
        shadow.append(style);

        shadow.append(wrapper);
        wrapper.append(icon);
        wrapper.append(info);
    }
}

// Define the new element
window.customElements.define('popup-info', PopUpInfo);
