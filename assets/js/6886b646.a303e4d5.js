"use strict";(self.webpackChunk_documentation_serenity_js_org=self.webpackChunk_documentation_serenity_js_org||[]).push([[47352],{30876:(e,t,r)=>{r.d(t,{Zo:()=>l,kt:()=>y});var n=r(2784);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var u=n.createContext({}),p=function(e){var t=n.useContext(u),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},l=function(e){var t=p(e.components);return n.createElement(u.Provider,{value:t},e.children)},c="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,u=e.parentName,l=s(e,["components","mdxType","originalType","parentName"]),c=p(r),d=a,y=c["".concat(u,".").concat(d)]||c[d]||m[d]||o;return r?n.createElement(y,i(i({ref:t},l),{},{components:r})):n.createElement(y,i({ref:t},l))}));function y(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=d;var s={};for(var u in t)hasOwnProperty.call(t,u)&&(s[u]=t[u]);s.originalType=e,s[c]="string"==typeof e?e:a,i[1]=s;for(var p=2;p<o;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},1384:(e,t,r)=>{r.r(t),r.d(t,{contentTitle:()=>i,default:()=>l,frontMatter:()=>o,toc:()=>s});var n=r(7896),a=(r(2784),r(30876));const o={},i=void 0,s=[{value:"Serenity/JS Cucumber",id:"serenityjs-cucumber",level:2},{value:"Installation",id:"installation",level:3},{value:"Command line usage",id:"command-line-usage",level:3},{value:"Cucumber 7.x",id:"cucumber-7x",level:4},{value:"Cucumber 3.x to 6.x",id:"cucumber-3x-to-6x",level:4},{value:"Cucumber 0.x to 2.x",id:"cucumber-0x-to-2x",level:4},{value:"Configuration",id:"configuration",level:3},{value:"Integration",id:"integration",level:3}],u={toc:s},p="wrapper";function l(e){let{components:t,...r}=e;return(0,a.kt)(p,(0,n.Z)({},u,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://www.linkedin.com/company/serenity-js"},(0,a.kt)("img",{parentName:"a",src:"https://img.shields.io/badge/Follow-Serenity%2FJS%20-0077B5?logo=linkedin",alt:"Follow Serenity/JS on LinkedIn"})),"\n",(0,a.kt)("a",{parentName:"p",href:"https://www.youtube.com/@serenity-js"},(0,a.kt)("img",{parentName:"a",src:"https://img.shields.io/badge/Watch-@serenity--js-E62117?logo=youtube",alt:"Watch Serenity/JS on YouTube"})),"\n",(0,a.kt)("a",{parentName:"p",href:"https://matrix.to/#/#serenity-js:gitter.im"},(0,a.kt)("img",{parentName:"a",src:"https://img.shields.io/badge/Chat-Serenity%2FJS%20Community-FBD30B?logo=matrix",alt:"Join Serenity/JS Community Chat"})),"\n",(0,a.kt)("a",{parentName:"p",href:"https://github.com/sponsors/serenity-js"},(0,a.kt)("img",{parentName:"a",src:"https://img.shields.io/badge/Support-@serenity--js-703EC8?logo=github",alt:"Support Serenity/JS on GitHub"}))),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://serenity-js.org"},"Serenity/JS")," is an innovative framework designed to make acceptance and regression testing\nof complex software systems faster, more collaborative and easier to scale."),(0,a.kt)("p",null,"To get started, check out the comprehensive ",(0,a.kt)("a",{parentName:"p",href:"https://serenity-js.org/handbook"},"Serenity/JS Handbook"),", ",(0,a.kt)("a",{parentName:"p",href:"https://serenity-js.org/api/core"},"API documentation"),", and ",(0,a.kt)("a",{parentName:"p",href:"https://serenity-js.org/handbook/getting-started#serenityjs-project-templates"},"Serenity/JS project templates on GitHub"),"."),(0,a.kt)("p",null,"If you have any questions or just want to say hello, join the ",(0,a.kt)("a",{parentName:"p",href:"https://matrix.to/#/#serenity-js:gitter.im"},"Serenity/JS Community Chat"),"."),(0,a.kt)("h2",{id:"serenityjs-cucumber"},"Serenity/JS Cucumber"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://serenity-js.org/modules/cucumber/"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/cucumber"))," contains a set of adapters you register with ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/cucumber/cucumber-js/"},"Cucumber CLI runners")," to enable integration and reporting between Cucumber.js and Serenity/JS."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"Please note:")," To use Cucumber and Serenity/JS to execute web-based acceptance tests, you should register Serenity/JS Cucumber adapter using Protractor configuration file. "),(0,a.kt)("p",null,"Learn more about integrating Serenity/JS Cucumber:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"with ",(0,a.kt)("a",{parentName:"li",href:"https://serenity-js.org/handbook/integration/serenityjs-and-protractor.html#integrating-protractor-with-serenity-js-and-cucumber"},"Protractor and Cucumber.js"),","),(0,a.kt)("li",{parentName:"ul"},"with ",(0,a.kt)("a",{parentName:"li",href:"https://serenity-js.org/handbook/integration/serenityjs-and-cucumber.html"},"Cucumber.js"),".")),(0,a.kt)("h3",{id:"installation"},"Installation"),(0,a.kt)("p",null,"To install this module, run:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"npm install --save-dev @serenity-js/{cucumber,core}\n")),(0,a.kt)("p",null,"This module reports test scenarios executed by ",(0,a.kt)("strong",{parentName:"p"},"any version of Cucumber.js"),", from 0.x to 7.x, which you need to install\nseparately."),(0,a.kt)("p",null,"To install ",(0,a.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/@cucumber/cucumber"},"Cucumber 7.x"),", run:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"npm install --save-dev @cucumber/cucumber \n")),(0,a.kt)("p",null,"To install ",(0,a.kt)("a",{parentName:"p",href:"https://www.npmjs.com/package/cucumber"},"Cucumber 6.x")," or earlier, run:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"npm install --save-dev cucumber \n")),(0,a.kt)("h3",{id:"command-line-usage"},"Command line usage"),(0,a.kt)("h4",{id:"cucumber-7x"},"Cucumber 7.x"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"cucumber-js --format @serenity-js/cucumber \\\n    --require ./features/support/setup.js \\\n    --require ./features/step_definitions/sample.steps.js \n")),(0,a.kt)("h4",{id:"cucumber-3x-to-6x"},"Cucumber 3.x to 6.x"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"cucumber-js --format node_modules/@serenity-js/cucumber \\\n    --require ./features/support/setup.js \\\n    --require ./features/step_definitions/sample.steps.js \n")),(0,a.kt)("h4",{id:"cucumber-0x-to-2x"},"Cucumber 0.x to 2.x"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre"},"cucumber-js --require=node_modules/@serenity-js/cucumber/lib/index.js \\\n    --require ./features/support/setup.js \\\n    --require ./features/step_definitions/sample.steps.js \n")),(0,a.kt)("h3",{id:"configuration"},"Configuration"),(0,a.kt)("p",null,"When used with a configuration file written in JavaScript:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript"},"// features/support/setup.js\n\nconst { configure } = require('@serenity-js/core');\n\nconfigure({\n    // ... configure Serenity/JS \n});\n")),(0,a.kt)("p",null,"When used with a configuration file written in TypeScript:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript"},"// features/support/setup.ts\n\nimport { configure } from '@serenity-js/core';\n\nconfigure({\n    // ... configure Serenity/JS \n});\n")),(0,a.kt)("h3",{id:"integration"},"Integration"),(0,a.kt)("p",null,"This module can be integrated with:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://serenity-js.org/modules/serenity-bdd"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/serenity-bdd"))," to produce HTML reports and living documentation,"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://serenity-js.org/modules/console-reporter"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/console-reporter"))," to print test execution reports to your computer terminal,"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://serenity-js.org/modules/protractor"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/protractor"))," to implement Cucumber scenarios interacting with Web applications.")),(0,a.kt)("p",null,"Learn more about ",(0,a.kt)("a",{parentName:"p",href:"https://serenity-js.org/modules"},"Serenity/JS Modules"),"."))}l.isMDXComponent=!0}}]);