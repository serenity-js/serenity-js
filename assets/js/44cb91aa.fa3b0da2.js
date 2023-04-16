"use strict";(self.webpackChunk_documentation_serenity_js_org=self.webpackChunk_documentation_serenity_js_org||[]).push([[45597],{30876:(e,t,n)=>{n.d(t,{Zo:()=>c,kt:()=>h});var r=n(2784);function a(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function s(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){a(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function o(e,t){if(null==e)return{};var n,r,a=function(e,t){if(null==e)return{};var n,r,a={},i=Object.keys(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||(a[n]=e[n]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)n=i[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(a[n]=e[n])}return a}var l=r.createContext({}),p=function(e){var t=r.useContext(l),n=t;return e&&(n="function"==typeof e?e(t):s(s({},t),e)),n},c=function(e){var t=p(e.components);return r.createElement(l.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,a=e.mdxType,i=e.originalType,l=e.parentName,c=o(e,["components","mdxType","originalType","parentName"]),u=p(n),d=a,h=u["".concat(l,".").concat(d)]||u[d]||m[d]||i;return n?r.createElement(h,s(s({ref:t},c),{},{components:n})):r.createElement(h,s({ref:t},c))}));function h(e,t){var n=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var i=n.length,s=new Array(i);s[0]=d;var o={};for(var l in t)hasOwnProperty.call(t,l)&&(o[l]=t[l]);o.originalType=e,o[u]="string"==typeof e?e:a,s[1]=o;for(var p=2;p<i;p++)s[p]=n[p];return r.createElement.apply(null,s)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},33142:(e,t,n)=>{n.d(t,{Z:()=>s});var r=n(2784),a=n(6277);const i={tabItem:"tabItem_OMyP"};function s(e){let{children:t,hidden:n,className:s}=e;return r.createElement("div",{role:"tabpanel",className:(0,a.Z)(i.tabItem,s),hidden:n},t)}},43193:(e,t,n)=>{n.d(t,{Z:()=>d});var r=n(7896),a=n(2784),i=n(6277),s=n(25425),o=n(66806),l=n(50717);const p={tabList:"tabList_M0Dn",tabItem:"tabItem_ysIP"};function c(e){let{className:t,block:n,selectedValue:o,selectValue:l,tabValues:c}=e;const u=[],{blockElementScrollPositionUntilNextRender:m}=(0,s.o5)(),d=e=>{const t=e.currentTarget,n=u.indexOf(t),r=c[n].value;r!==o&&(m(t),l(r))},h=e=>{let t=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const n=u.indexOf(e.currentTarget)+1;t=u[n]??u[0];break}case"ArrowLeft":{const n=u.indexOf(e.currentTarget)-1;t=u[n]??u[u.length-1];break}}t?.focus()};return a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,i.Z)("tabs",{"tabs--block":n},t)},c.map((e=>{let{value:t,label:n,attributes:s}=e;return a.createElement("li",(0,r.Z)({role:"tab",tabIndex:o===t?0:-1,"aria-selected":o===t,key:t,ref:e=>u.push(e),onKeyDown:h,onClick:d},s,{className:(0,i.Z)("tabs__item",p.tabItem,s?.className,{"tabs__item--active":o===t})}),n??t)})))}function u(e){let{lazy:t,children:n,selectedValue:r}=e;const i=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=i.find((e=>e.props.value===r));return e?(0,a.cloneElement)(e,{className:"margin-top--md"}):null}return a.createElement("div",{className:"margin-top--md"},i.map(((e,t)=>(0,a.cloneElement)(e,{key:t,hidden:e.props.value!==r}))))}function m(e){const t=(0,o.Y)(e);return a.createElement("div",{className:(0,i.Z)("tabs-container",p.tabList)},a.createElement(c,(0,r.Z)({},e,t)),a.createElement(u,(0,r.Z)({},e,t)))}function d(e){const t=(0,l.Z)();return a.createElement(m,(0,r.Z)({key:String(t)},e))}},66806:(e,t,n)=>{n.d(t,{Y:()=>m});var r=n(2784),a=n(7267),i=n(24236),s=n(53432),o=n(79675);function l(e){return function(e){return r.Children.map(e,(e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:a}}=e;return{value:t,label:n,attributes:r,default:a}}))}function p(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??l(n);return function(e){const t=(0,s.l)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function c(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function u(e){let{queryString:t=!1,groupId:n}=e;const s=(0,a.k6)(),o=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,i._X)(o),(0,r.useCallback)((e=>{if(!o)return;const t=new URLSearchParams(s.location.search);t.set(o,e),s.replace({...s.location,search:t.toString()})}),[o,s])]}function m(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,i=p(e),[s,l]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!c({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:i}))),[m,d]=u({queryString:n,groupId:a}),[h,f]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,i]=(0,o.Nk)(n);return[a,(0,r.useCallback)((e=>{n&&i.set(e)}),[n,i])]}({groupId:a}),g=(()=>{const e=m??h;return c({value:e,tabValues:i})?e:null})();(0,r.useLayoutEffect)((()=>{g&&l(g)}),[g]);return{selectedValue:s,selectValue:(0,r.useCallback)((e=>{if(!c({value:e,tabValues:i}))throw new Error(`Can't select invalid tab value=${e}`);l(e),d(e),f(e)}),[d,f,i]),tabValues:i}}},2076:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>h,frontMatter:()=>o,metadata:()=>p,toc:()=>u});var r=n(7896),a=(n(2784),n(30876)),i=n(43193),s=n(33142);const o={sidebar_position:2},l="Jasmine",p={unversionedId:"test-runners/jasmine",id:"test-runners/jasmine",title:"Jasmine",description:"Jasmine is a universal test runner,",source:"@site/docs/test-runners/jasmine.mdx",sourceDirName:"test-runners",slug:"/test-runners/jasmine",permalink:"/handbook/test-runners/jasmine",draft:!1,editUrl:"https://github.com/serenity-js/serenity-js/tree/main/documentation/serenity-js.org/docs/test-runners/jasmine.mdx",tags:[],version:"current",sidebarPosition:2,frontMatter:{sidebar_position:2},sidebar:"tutorialSidebar",previous:{title:"Cucumber",permalink:"/handbook/test-runners/cucumber"},next:{title:"Mocha",permalink:"/handbook/test-runners/mocha"}},c={},u=[{value:"Examples and Project Templates",id:"examples-and-project-templates",level:2},{value:"Using Serenity/JS reporting services",id:"using-serenityjs-reporting-services",level:2},{value:"Installing Serenity/JS test runner adapter",id:"installing-serenityjs-test-runner-adapter",level:3},{value:"Configuring Serenity/JS",id:"configuring-serenityjs",level:3},{value:"Configuring Jasmine",id:"configuring-jasmine",level:3},{value:"Defining Jasmine test scenarios",id:"defining-jasmine-test-scenarios",level:3},{value:"Attaching Serenity/JS test runner adapter",id:"attaching-serenityjs-test-runner-adapter",level:3},{value:"Using Serenity/JS Screenplay Pattern APIs",id:"using-serenityjs-screenplay-pattern-apis",level:2},{value:"Configuring a cast of actors",id:"configuring-a-cast-of-actors",level:3},{value:"Referring to actors in test scenarios",id:"referring-to-actors-in-test-scenarios",level:3}],m={toc:u},d="wrapper";function h(e){let{components:t,...n}=e;return(0,a.kt)(d,(0,r.Z)({},m,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"jasmine"},"Jasmine"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://jasmine.github.io/"},"Jasmine")," is a universal test runner,\nparticularly popular with projects based on ",(0,a.kt)("a",{parentName:"p",href:"https://angular.io/"},"Angular")," framework.\nIf your project already uses Jasmine to run its unit tests,\nyou can use the same runner for your acceptance tests too."),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"You will learn:")),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"How to use ",(0,a.kt)("a",{parentName:"li",href:"/handbook/reporting/"},"Serenity/JS reporting services"),", including the ",(0,a.kt)("a",{parentName:"li",href:"/handbook/reporting/serenity-bdd-reporter"},"Serenity BDD reporter"),", even if your test scenarios don't follow the Screenplay Pattern yet"),(0,a.kt)("li",{parentName:"ul"},"How to implement Jasmine test scenarios using reusable ",(0,a.kt)("a",{parentName:"li",href:"/handbook/design/screenplay-pattern"},"Serenity/JS Screenplay Pattern")," APIs")),(0,a.kt)("h2",{id:"examples-and-project-templates"},"Examples and Project Templates"),(0,a.kt)("p",null,"If you'd like to dive straight into the code, ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/serenity-js"},"Serenity/JS GitHub repository")," provides:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://github.com/serenity-js?q=jasmine+template&type=all&language=&sort="},"Serenity/JS + Jasmine project templates"),", which are the easiest way to start with the framework,"),(0,a.kt)("li",{parentName:"ul"},"several ",(0,a.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/tree/main/examples"},"reference implementations"),", demonstrating using Serenity/JS with Jasmine to write both REST API- and web-based acceptance tests")),(0,a.kt)("h2",{id:"using-serenityjs-reporting-services"},"Using Serenity/JS reporting services"),(0,a.kt)("p",null,"To use ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting/"},"Serenity/JS reporting services")," in a Jasmine project, you need to:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"attach the ",(0,a.kt)("a",{parentName:"li",href:"/api/jasmine"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/jasmine"))," test runner adapter to Jasmine"),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/core/function/configure"},"configure Serenity/JS")," to use the reporting services you want to use,\nsuch as the ",(0,a.kt)("a",{parentName:"li",href:"/handbook/reporting/console-reporter"},(0,a.kt)("inlineCode",{parentName:"a"},"ConsoleReporter")),"\nor ",(0,a.kt)("a",{parentName:"li",href:"/handbook/reporting/serenity-bdd-reporter"},(0,a.kt)("inlineCode",{parentName:"a"},"SerenityBDDReporter")))),(0,a.kt)("admonition",{title:"Serenity/JS test runner adapters",type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"Serenity/JS test runner adapters turn internal, test runner-specific events\ninto ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting/domain-events"},"Serenity/JS domain events")," that can contribute to test execution reports produced\nby ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting/"},"Serenity/JS reporting services"),".")),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/api/jasmine"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/jasmine")," module")," provides a ",(0,a.kt)("a",{parentName:"p",href:"/handbook/about/architecture"},(0,a.kt)("strong",{parentName:"a"},"test runner adapter")),"\nyou can attach to your Jasmine test runner."),(0,a.kt)("p",null,"Integration architecture described in this section applies to invoking\n",(0,a.kt)("inlineCode",{parentName:"p"},"jasmine")," command line interface directly, for example for ",(0,a.kt)("strong",{parentName:"p"},"domain-level"),",\n",(0,a.kt)("a",{parentName:"p",href:"/handbook/api-testing/"},(0,a.kt)("strong",{parentName:"a"},"REST/HTTP API-level")),", or ",(0,a.kt)("a",{parentName:"p",href:"/handbook/web-testing/"},(0,a.kt)("strong",{parentName:"a"},"web-based testing")),"\nusing ",(0,a.kt)("a",{parentName:"p",href:"/api/playwright"},"Playwright"),"."),(0,a.kt)("p",null,"If you want your Jasmine scenarios to interact with ",(0,a.kt)("strong",{parentName:"p"},"web interfaces")," using ",(0,a.kt)("a",{parentName:"p",href:"https://www.selenium.dev/documentation/webdriver/"},"Selenium Webdriver protocol"),",\nor connect them to a ",(0,a.kt)("a",{parentName:"p",href:"https://www.selenium.dev/documentation/grid/"},"Selenium Grid"),",\nyou should do so via ",(0,a.kt)("a",{parentName:"p",href:"/handbook/test-runners/protractor"},"Protractor"),"\nor ",(0,a.kt)("a",{parentName:"p",href:"/handbook/test-runners/webdriverio"},"WebdriverIO")," instead."),(0,a.kt)("figure",null,(0,a.kt)("mermaid",{value:'graph TB\n    DEV(["\ud83d\udcbb Developer"])\n    TR(["jasmine"])\n    SC(["@serenity-js/core"])\n    TRA(["@serenity-js/jasmine"])\n    CF["config.ts"]\n    R(["Serenity/JS reporting services"])\n    DEV -- invokes --\x3e TR\n    TR -- loads --\x3e CF\n    TR -- notifies --\x3e TRA\n    TRA -- notifies --\x3e SC\n    CF -- configures --\x3e SC\n    SC -- notifies --\x3e R\n\n    click R "/handbook/reporting"\n    click SC "/api/core"\n    click TRA "/api/jasmine"'}),(0,a.kt)("figcaption",null,"Serenity/JS + Jasmine integration architecture")),(0,a.kt)("h3",{id:"installing-serenityjs-test-runner-adapter"},"Installing Serenity/JS test runner adapter"),(0,a.kt)("p",null,"Assuming you already have a ",(0,a.kt)("a",{parentName:"p",href:"/handbook/about/installation#creating-a-nodejs-project"},"Node.js project"),"\nand ",(0,a.kt)("a",{parentName:"p",href:"/handbook/about/installation"},"Serenity/JS runtime dependencies")," set up,\nadd the following Node modules:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/core"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/core"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/jasmine"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/jasmine"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://www.npmjs.com/package/jasmine"},(0,a.kt)("inlineCode",{parentName:"a"},"jasmine")))),(0,a.kt)("p",null,"To do that, run the following command in your terminal:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"npm install --save-dev @serenity-js/{core,jasmine} jasmine\n")),(0,a.kt)("p",null,"If you'd like to implement your test suite in TypeScript, also run:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"npm install --save-dev typescript ts-node @types/{jasmine,node}\n")),(0,a.kt)("h3",{id:"configuring-serenityjs"},"Configuring Serenity/JS"),(0,a.kt)("p",null,"If you intend to run your Jasmine scenarios using the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/jasmine/jasmine-npm"},"Jasmine CLI"),",\nthe best way to configure Serenity/JS is to invoke the Serenity/JS ",(0,a.kt)("a",{parentName:"p",href:"/api/core/function/configure"},(0,a.kt)("inlineCode",{parentName:"a"},"configure"))," function\nin a ",(0,a.kt)("a",{parentName:"p",href:"https://jasmine.github.io/api/edge/global.html#beforeAll"},(0,a.kt)("inlineCode",{parentName:"a"},"beforeAll")," hook"),",\ndefined in a Jasmine helper file:"),(0,a.kt)(i.Z,{mdxType:"Tabs"},(0,a.kt)(s.Z,{value:"typescript",label:"TypeScript project",default:!0,mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="spec/helpers/serenity.config.ts"',title:'"spec/helpers/serenity.config.ts"'},"import 'jasmine'\n\nimport { ArtifactArchiver, configure } from '@serenity-js/core'\nimport { ConsoleReporter } from '@serenity-js/console-reporter'\nimport { SerenityBDDReporter } from '@serenity-js/serenity-bdd'\n\nbeforeAll(async () => {\n    // Configure Serenity/JS\n    configure({\n        crew: [\n            '@serenity-js/console-reporter',\n            '@serenity-js/serenity-bdd',\n            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],\n            // ... any other reporting services\n        ],\n    })\n})\n"))),(0,a.kt)(s.Z,{value:"javascript",label:"JavaScript project",mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript",metastring:'title="spec/helpers/serenity.config.js"',title:'"spec/helpers/serenity.config.js"'},"const { configure } = require('@serenity-js/core')\n\nbeforeAll(async () => {\n    // Configure Serenity/JS\n    configure({\n        crew: [\n            '@serenity-js/console-reporter',\n            '@serenity-js/serenity-bdd',\n            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],\n            // ... any other reporting services\n        ],\n    })\n})\n")))),(0,a.kt)("p",null,"To learn more about installing and configuring Serenity/JS reporting services appropriate for your project,\nfollow the ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting/"},"Serenity/JS reporting guide"),"."),(0,a.kt)("h3",{id:"configuring-jasmine"},"Configuring Jasmine"),(0,a.kt)("p",null,"You can initialise Jasmine configuration file at ",(0,a.kt)("inlineCode",{parentName:"p"},"spec/support/jasmine.json")," by running the following command:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"npx jasmine init\n")),(0,a.kt)("p",null,"The resulting configuration file should look similar to the following:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json",metastring:'title="spec/support/jasmine.json"',title:'"spec/support/jasmine.json"'},'{\n  "spec_dir": "spec",\n  "spec_files": [\n    "**/*[sS]pec.js"\n  ],\n  "helpers": [\n    "helpers/**/*.js"\n  ],\n  "stopSpecOnExpectationFailure": false,\n  "random": true\n}\n')),(0,a.kt)("p",null,"For TypeScript projects, modify ",(0,a.kt)("inlineCode",{parentName:"p"},"spec/support/jasmine.json")," as follows:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-json",metastring:'title="spec/support/jasmine.json"',title:'"spec/support/jasmine.json"'},'{\n  "spec_dir": "spec",\n  "spec_files": [\n    "**/*[sS]pec.ts"\n  ],\n  "helpers": [\n    "helpers/**/*.ts"\n  ],\n  "requires": [\n    "ts-node/register"\n  ],\n  "stopSpecOnExpectationFailure": false,\n  "random": true\n}\n')),(0,a.kt)("h3",{id:"defining-jasmine-test-scenarios"},"Defining Jasmine test scenarios"),(0,a.kt)("p",null,"When Serenity/JS reports on Jasmine test scenarios, it assumes you're following a common convention\nwhere the outermost ",(0,a.kt)("a",{parentName:"p",href:"https://jasmine.github.io/api/edge/global.html#describe"},(0,a.kt)("inlineCode",{parentName:"a"},"describe")," block")," describes the name of the feature or component under test,\nand any nested ",(0,a.kt)("inlineCode",{parentName:"p"},"describe")," blocks contribute to the name of the test scenario."),(0,a.kt)("p",null,"For example, Serenity/JS will report the below scenario as:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"feature: ",(0,a.kt)("inlineCode",{parentName:"li"},"Todo List App")),(0,a.kt)("li",{parentName:"ul"},"scenario: ",(0,a.kt)("inlineCode",{parentName:"li"},"when the user is a guest their list is empty"))),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="spec/todo-list.spec.ts"',title:'"spec/todo-list.spec.ts"'},"import 'jasmine'\n\ndescribe('Todo List App', () => {               // - feature or component name\n\n    describe('when the user is', () => {        // - one or more nested `describe` blocks\n        describe('a guest', () => {             //   to group scenarios\n            describe('their list', () => {      //   by context in which they apply\n\n                it('is empty', async () => {    // - expected behaviour of the feature or component\n\n                })\n            })\n        })\n    })\n})\n")),(0,a.kt)("admonition",{title:"Feature coverage",type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"Using the same name for the outermost ",(0,a.kt)("inlineCode",{parentName:"p"},"describe"),' block in several different spec files makes\nSerenity BDD associate the different test scenarios with the same logical "feature" or "component"\nand produce ',(0,a.kt)("a",{parentName:"p",href:"https://serenity-bdd.github.io/docs/reporting/the_serenity_reports"},"feature coverage metrics"),".")),(0,a.kt)("h3",{id:"attaching-serenityjs-test-runner-adapter"},"Attaching Serenity/JS test runner adapter"),(0,a.kt)("p",null,"To attach ",(0,a.kt)("a",{parentName:"p",href:"/api/jasmine"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/jasmine"))," test runner adapter to Jasmine,\nuse the ",(0,a.kt)("a",{parentName:"p",href:"https://jasmine.github.io/setup/nodejs.html#--reporter"},(0,a.kt)("inlineCode",{parentName:"a"},"--reporter"))," option when invoking the test runner:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-shell"},"npx jasmine --reporter='@serenity-js/jasmine'\n")),(0,a.kt)("admonition",{type:"note"},(0,a.kt)("p",{parentName:"admonition"},"At the time of writing, Jasmine doesn't allow for reporters to be registered via the ",(0,a.kt)("inlineCode",{parentName:"p"},"jasmine.json")," configuration file.")),(0,a.kt)("h2",{id:"using-serenityjs-screenplay-pattern-apis"},"Using Serenity/JS Screenplay Pattern APIs"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/api/core/class/Actor"},"Serenity/JS actor model")," works great with Jasmine\nand ",(0,a.kt)("a",{parentName:"p",href:"/handbook/design/screenplay-pattern"},"Serenity/JS Screenplay Pattern")," APIs can help your team implement\nJasmine test scenarios that are easy to read and understand."),(0,a.kt)("p",null,"The fastest way to get started with Serenity/JS and Jasmine is to use one of\nthe ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/serenity-js?q=jasmine+template&type=all&language=&sort="},"Serenity/JS + Jasmine project templates"),".\nHowever, if you're adding Serenity/JS to an existing project or simply want to understand how the integration works,\nthis guide is for you."),(0,a.kt)("h3",{id:"configuring-a-cast-of-actors"},"Configuring a cast of actors"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/handbook/design/screenplay-pattern"},"Serenity/JS Screenplay Pattern")," is an actor-centred model, so the first thing you\nneed to do is to tell Serenity/JS what ",(0,a.kt)("a",{parentName:"p",href:"/api/core/class/Cast"},"cast of actors")," you want to use."),(0,a.kt)("p",null,"If you're planning to run Jasmine scenarios using the ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/jasmine/jasmine-npm"},"Jasmine CLI")," ",(0,a.kt)("strong",{parentName:"p"},(0,a.kt)("em",{parentName:"strong"},"directly")),",\nyou can configure the actors in a ",(0,a.kt)("a",{parentName:"p",href:"https://jasmine.github.io/api/edge/global.html#beforeAll"},(0,a.kt)("inlineCode",{parentName:"a"},"beforeAll"))," hook, for example:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="spec/helpers/serenity.config.ts"',title:'"spec/helpers/serenity.config.ts"'},"import 'jasmine'\n\nimport { configure, Cast } from '@serenity-js/core'\nimport { BrowseTheWebWithPlaywright } from '@serenity-js/playwright'\n\nimport * as playwright from 'playwright'\n\nlet browser: playwright.Browser;\n\nbeforeAll(async () => {\n\n    // Launch the browser once before all the tests\n    // Serenity/JS will take care of managing Playwright browser context and browser tabs.\n    browser = await playwright.chromium.launch({\n        headless: true,\n    });\n\n    // Configure Serenity/JS\n    configure({\n        actors: Cast.where(actor =>\n            actor.whoCan(BrowseTheWebWithPlaywright.using(browser, {\n                baseURL: 'https://todo-app.serenity-js.org/',\n            }))\n        ),\n        crew: [\n            '@serenity-js/console-reporter',\n            '@serenity-js/serenity-bdd',\n            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],\n            // ... any other reporting services\n        ],\n    })\n})\n\nafterAll(async () => {\n    // Close the browser after all the tests are finished\n    await browser?.close()\n})\n")),(0,a.kt)("p",null,"Consult the respective test runner instructions if you're invoking Jasmine ",(0,a.kt)("em",{parentName:"p"},(0,a.kt)("strong",{parentName:"em"},"indirectly")),",\nso via ",(0,a.kt)("a",{parentName:"p",href:"/handbook/test-runners/protractor"},"Protractor")," or ",(0,a.kt)("a",{parentName:"p",href:"/handbook/test-runners/webdriverio"},"WebdriverIO"),"."),(0,a.kt)("h3",{id:"referring-to-actors-in-test-scenarios"},"Referring to actors in test scenarios"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/api/core/class/Actor"},"Serenity/JS actors")," are often used to represent user personas or important external systems\ninteracting with the system under test. In those scenarios, a common strategy is to give actors names indicating their persona,\nand refer to them in your test scenarios using functions ",(0,a.kt)("a",{parentName:"p",href:"/api/core/function/actorCalled"},(0,a.kt)("inlineCode",{parentName:"a"},"actorCalled")),"\nand ",(0,a.kt)("a",{parentName:"p",href:"/api/core/function/actorInTheSpotlight"},(0,a.kt)("inlineCode",{parentName:"a"},"actorInTheSpotlight")),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-typescript",metastring:'title="spec/todo-list.spec.ts"',title:'"spec/todo-list.spec.ts"'},"import 'jasmine'\n\nimport { Ensure, equals } from '@serenity-js/assertions'\nimport { actorCalled } from '@serenity-js/core'\nimport { Navigate, PageElements, By } from '@serenity-js/web'\n\ndescribe('Todo List App', () => {\n\n    const displayedItems = () =>\n        PageElements.located(By.css('.todo-list li'))\n            .describedAs('displayed items')\n\n    describe('when the user is', () => {\n        describe('a guest', () => {\n            describe('their list', () => {\n\n                it('is empty', async () => {\n                    await actorCalled('Alice').attemptsTo(\n                        Navigate.to('https://todo-app.serenity-js.org/'),\n                        Ensure.that(displayedItems().count(), equals(0))\n                    )\n                })\n            })\n        })\n    })\n})\n")))}h.isMDXComponent=!0}}]);