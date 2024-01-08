"use strict";(self.webpackChunk_documentation_serenity_js_org=self.webpackChunk_documentation_serenity_js_org||[]).push([[68796],{30876:(e,t,r)=>{r.d(t,{Zo:()=>c,kt:()=>h});var n=r(2784);function a(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function o(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function i(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?o(Object(r),!0).forEach((function(t){a(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):o(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function s(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},o=Object.keys(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)r=o[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}var l=n.createContext({}),p=function(e){var t=n.useContext(l),r=t;return e&&(r="function"==typeof e?e(t):i(i({},t),e)),r},c=function(e){var t=p(e.components);return n.createElement(l.Provider,{value:t},e.children)},u="mdxType",m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var r=e.components,a=e.mdxType,o=e.originalType,l=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),u=p(r),d=a,h=u["".concat(l,".").concat(d)]||u[d]||m[d]||o;return r?n.createElement(h,i(i({ref:t},c),{},{components:r})):n.createElement(h,i({ref:t},c))}));function h(e,t){var r=arguments,a=t&&t.mdxType;if("string"==typeof e||a){var o=r.length,i=new Array(o);i[0]=d;var s={};for(var l in t)hasOwnProperty.call(t,l)&&(s[l]=t[l]);s.originalType=e,s[u]="string"==typeof e?e:a,i[1]=s;for(var p=2;p<o;p++)i[p]=r[p];return n.createElement.apply(null,i)}return n.createElement.apply(null,r)}d.displayName="MDXCreateElement"},33142:(e,t,r)=>{r.d(t,{Z:()=>i});var n=r(2784),a=r(6277);const o={tabItem:"tabItem_OMyP"};function i(e){let{children:t,hidden:r,className:i}=e;return n.createElement("div",{role:"tabpanel",className:(0,a.Z)(o.tabItem,i),hidden:r},t)}},43193:(e,t,r)=>{r.d(t,{Z:()=>d});var n=r(7896),a=r(2784),o=r(6277),i=r(25425),s=r(66806),l=r(50717);const p={tabList:"tabList_M0Dn",tabItem:"tabItem_ysIP"};function c(e){let{className:t,block:r,selectedValue:s,selectValue:l,tabValues:c}=e;const u=[],{blockElementScrollPositionUntilNextRender:m}=(0,i.o5)(),d=e=>{const t=e.currentTarget,r=u.indexOf(t),n=c[r].value;n!==s&&(m(t),l(n))},h=e=>{let t=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const r=u.indexOf(e.currentTarget)+1;t=u[r]??u[0];break}case"ArrowLeft":{const r=u.indexOf(e.currentTarget)-1;t=u[r]??u[u.length-1];break}}t?.focus()};return a.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,o.Z)("tabs",{"tabs--block":r},t)},c.map((e=>{let{value:t,label:r,attributes:i}=e;return a.createElement("li",(0,n.Z)({role:"tab",tabIndex:s===t?0:-1,"aria-selected":s===t,key:t,ref:e=>u.push(e),onKeyDown:h,onClick:d},i,{className:(0,o.Z)("tabs__item",p.tabItem,i?.className,{"tabs__item--active":s===t})}),r??t)})))}function u(e){let{lazy:t,children:r,selectedValue:n}=e;const o=(Array.isArray(r)?r:[r]).filter(Boolean);if(t){const e=o.find((e=>e.props.value===n));return e?(0,a.cloneElement)(e,{className:"margin-top--md"}):null}return a.createElement("div",{className:"margin-top--md"},o.map(((e,t)=>(0,a.cloneElement)(e,{key:t,hidden:e.props.value!==n}))))}function m(e){const t=(0,s.Y)(e);return a.createElement("div",{className:(0,o.Z)("tabs-container",p.tabList)},a.createElement(c,(0,n.Z)({},e,t)),a.createElement(u,(0,n.Z)({},e,t)))}function d(e){const t=(0,l.Z)();return a.createElement(m,(0,n.Z)({key:String(t)},e))}},66806:(e,t,r)=>{r.d(t,{Y:()=>m});var n=r(2784),a=r(7267),o=r(24236),i=r(53432),s=r(79675);function l(e){return function(e){return n.Children.map(e,(e=>{if(!e||(0,n.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}(e).map((e=>{let{props:{value:t,label:r,attributes:n,default:a}}=e;return{value:t,label:r,attributes:n,default:a}}))}function p(e){const{values:t,children:r}=e;return(0,n.useMemo)((()=>{const e=t??l(r);return function(e){const t=(0,i.l)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,r])}function c(e){let{value:t,tabValues:r}=e;return r.some((e=>e.value===t))}function u(e){let{queryString:t=!1,groupId:r}=e;const i=(0,a.k6)(),s=function(e){let{queryString:t=!1,groupId:r}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!r)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return r??null}({queryString:t,groupId:r});return[(0,o._X)(s),(0,n.useCallback)((e=>{if(!s)return;const t=new URLSearchParams(i.location.search);t.set(s,e),i.replace({...i.location,search:t.toString()})}),[s,i])]}function m(e){const{defaultValue:t,queryString:r=!1,groupId:a}=e,o=p(e),[i,l]=(0,n.useState)((()=>function(e){let{defaultValue:t,tabValues:r}=e;if(0===r.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!c({value:t,tabValues:r}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${r.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const n=r.find((e=>e.default))??r[0];if(!n)throw new Error("Unexpected error: 0 tabValues");return n.value}({defaultValue:t,tabValues:o}))),[m,d]=u({queryString:r,groupId:a}),[h,f]=function(e){let{groupId:t}=e;const r=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,o]=(0,s.Nk)(r);return[a,(0,n.useCallback)((e=>{r&&o.set(e)}),[r,o])]}({groupId:a}),y=(()=>{const e=m??h;return c({value:e,tabValues:o})?e:null})();(0,n.useLayoutEffect)((()=>{y&&l(y)}),[y]);return{selectedValue:i,selectValue:(0,n.useCallback)((e=>{if(!c({value:e,tabValues:o}))throw new Error(`Can't select invalid tab value=${e}`);l(e),d(e),f(e)}),[d,f,o]),tabValues:o}}},51641:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>c,contentTitle:()=>l,default:()=>h,frontMatter:()=>s,metadata:()=>p,toc:()=>u});var n=r(7896),a=(r(2784),r(30876)),o=r(43193),i=r(33142);const s={sidebar_position:5},l="Protractor",p={unversionedId:"test-runners/protractor",id:"test-runners/protractor",title:"Protractor",description:"Protractor is an end-to-end test framework for Angular and AngularJS applications, based on Selenium 3.",source:"@site/docs/test-runners/protractor.mdx",sourceDirName:"test-runners",slug:"/test-runners/protractor",permalink:"/handbook/test-runners/protractor",draft:!1,editUrl:"https://github.com/serenity-js/serenity-js/tree/main/documentation/serenity-js.org/docs/test-runners/protractor.mdx",tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"tutorialSidebar",previous:{title:"Playwright Test",permalink:"/handbook/test-runners/playwright-test"},next:{title:"WebdriverIO",permalink:"/handbook/test-runners/webdriverio"}},c={},u=[{value:"Examples and Project Templates",id:"examples-and-project-templates",level:2},{value:"Using Serenity/JS reporting services",id:"using-serenityjs-reporting-services",level:2},{value:"Installing Serenity/JS test runner adapter",id:"installing-serenityjs-test-runner-adapter",level:3},{value:"Configuring Serenity/JS",id:"configuring-serenityjs",level:3},{value:"Configuring Protractor",id:"configuring-protractor",level:3},{value:"Using Serenity/JS Screenplay Pattern APIs",id:"using-serenityjs-screenplay-pattern-apis",level:2},{value:"Referring to actors in test scenarios",id:"referring-to-actors-in-test-scenarios",level:3},{value:"Configuring a custom cast of actors",id:"configuring-a-custom-cast-of-actors",level:3},{value:"Migrating from Protractor to WebdriverIO",id:"migrating-from-protractor-to-webdriverio",level:2}],m={toc:u},d="wrapper";function h(e){let{components:t,...r}=e;return(0,a.kt)(d,(0,n.Z)({},m,r,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("h1",{id:"protractor"},"Protractor"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"https://www.protractortest.org/"},"Protractor")," is an end-to-end test framework for Angular and AngularJS applications, based on Selenium 3.\nProtractor runs tests against your application running in a real browser, interacting with it as a user would."),(0,a.kt)("admonition",{title:"Protractor is deprecated",type:"warning"},(0,a.kt)("p",{parentName:"admonition"},"Protractor is now ",(0,a.kt)("a",{parentName:"p",href:"https://blog.angular.io/the-state-of-end-to-end-testing-with-angular-d175f751cb9c"},"officially deprecated"),"\nand has not received any updates since ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/angular/protractor/commits/master"},"April 2020"),".\nYou ",(0,a.kt)("strong",{parentName:"p"},"should not")," rely on Protractor for any new test automation projects, and instead use Serenity/JS with more modern\nand developer-friendly integration tools like ",(0,a.kt)("a",{parentName:"p",href:"/handbook/test-runners/webdriverio"},"WebdriverIO"),"\nor ",(0,a.kt)("a",{parentName:"p",href:"/handbook/test-runners/playwright-test"},"Playwright Test"),".")),(0,a.kt)("admonition",{title:"Should I use Serenity/JS with my existing Protractor project?",type:"info"},(0,a.kt)("p",{parentName:"admonition"},(0,a.kt)("strong",{parentName:"p"},"Yes"),". The most common reason why you ",(0,a.kt)("strong",{parentName:"p"},"should")," introduce Serenity/JS\nto an ",(0,a.kt)("strong",{parentName:"p"},"existing")," Protractor project is that it can help you to ",(0,a.kt)("strong",{parentName:"p"},"reliably migrate")," your codebase\nto a more modern integration tool like ",(0,a.kt)("a",{parentName:"p",href:"/api/webdriverio"},"WebdriverIO"),"\nor ",(0,a.kt)("a",{parentName:"p",href:"/api/playwright"},"Playwright")," in the next step."),(0,a.kt)("p",{parentName:"admonition"},"Using Serenity/JS ",(0,a.kt)("a",{parentName:"p",href:"/handbook/design/screenplay-pattern"},"Screenplay Pattern APIs"),"\nwill also help you ",(0,a.kt)("strong",{parentName:"p"},"future-proof your codebase")," and make it ",(0,a.kt)("strong",{parentName:"p"},"agnostic")," of the underlying integration tools.")),(0,a.kt)("admonition",{title:"Extending existing Protractor test suites",type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"If you want to add Serenity/JS to an existing Protractor test suite, check out\n",(0,a.kt)("a",{parentName:"p",href:"/handbook/getting-started/serenity-js-with-protractor/"},"Extending Protractor with Serenity/JS"),".")),(0,a.kt)("p",null,(0,a.kt)("strong",{parentName:"p"},"In this article, you will learn:")),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"How to use ",(0,a.kt)("a",{parentName:"li",href:"/handbook/reporting/"},"Serenity/JS reporting services"),", including the ",(0,a.kt)("a",{parentName:"li",href:"/handbook/reporting/serenity-bdd-reporter"},"Serenity BDD reporter"),", even if your test scenarios don't follow the Screenplay Pattern yet"),(0,a.kt)("li",{parentName:"ul"},"How to implement Protractor test scenarios using reusable ",(0,a.kt)("a",{parentName:"li",href:"/handbook/design/screenplay-pattern"},"Serenity/JS Screenplay Pattern")," APIs and the ",(0,a.kt)("a",{parentName:"li",href:"/api/webdriverio"},"Serenity/JS Protractor module")),(0,a.kt)("li",{parentName:"ul"},"How ",(0,a.kt)("a",{parentName:"li",href:"/api/web"},"Serenity/JS Web APIs")," will help you ",(0,a.kt)("strong",{parentName:"li"},"reliably migrate")," your tests from Protractor to WebdriverIO (the most compatible tool)")),(0,a.kt)("h2",{id:"examples-and-project-templates"},"Examples and Project Templates"),(0,a.kt)("p",null,"If you'd like to dive straight into the code, ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/serenity-js"},"Serenity/JS GitHub repository")," provides:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"https://github.com/serenity-js?q=protractor+template&type=all&language=&sort="},"Serenity/JS + Protractor project templates"),", which are the easiest way to start with the framework,"),(0,a.kt)("li",{parentName:"ul"},"several ",(0,a.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/tree/main/examples"},"reference implementations"),", demonstrating using Serenity/JS with Protractor to write web-based acceptance tests")),(0,a.kt)("h2",{id:"using-serenityjs-reporting-services"},"Using Serenity/JS reporting services"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/api/protractor"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/protractor")," module")," provides a ",(0,a.kt)("a",{parentName:"p",href:"/handbook/about/architecture"},(0,a.kt)("strong",{parentName:"a"},"test runner adapter")),"\nyou can attach to your ",(0,a.kt)("a",{parentName:"p",href:"https://www.protractortest.org/#/infrastructure"},"Protractor test runner")," just like any other standard ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/angular/protractor/blob/master/lib/config.ts#L612"},"Protractor ",(0,a.kt)("inlineCode",{parentName:"a"},"framework")),"."),(0,a.kt)("admonition",{title:"Serenity/JS test runner adapters",type:"tip"},(0,a.kt)("p",{parentName:"admonition"},"Serenity/JS test runner adapters turn internal, test runner-specific events\ninto ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting/domain-events"},"Serenity/JS domain events")," that can contribute to test execution reports produced\nby ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting/"},"Serenity/JS reporting services"),".")),(0,a.kt)("p",null,"To use ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting/"},"Serenity/JS reporting services")," in a Protractor project, you need to:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},"attach the ",(0,a.kt)("a",{parentName:"li",href:"/api/protractor"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/protractor"))," test runner adapter to the Protractor test runner"),(0,a.kt)("li",{parentName:"ul"},"use ",(0,a.kt)("inlineCode",{parentName:"li"},"protractor.conf.js")," to ",(0,a.kt)("a",{parentName:"li",href:"/api/protractor-adapter/interface/Config"},"configure Serenity/JS")," to use the reporting services you want to use,\nsuch as the ",(0,a.kt)("a",{parentName:"li",href:"/handbook/reporting/console-reporter"},(0,a.kt)("inlineCode",{parentName:"a"},"ConsoleReporter")),"\nor ",(0,a.kt)("a",{parentName:"li",href:"/handbook/reporting/serenity-bdd-reporter"},(0,a.kt)("inlineCode",{parentName:"a"},"SerenityBDDReporter")))),(0,a.kt)("figure",null,(0,a.kt)("mermaid",{value:'graph TB\n    SUT(["Web App"])\n    DEV(["\ud83d\udcbb Developer"])\n    WdioCli["protractor"]\n    Wdio(["Protractor"])\n    ConfigFile["protractor.conf.js"]\n    SWdioAdapter(["@serenity-js/protractor/adapter"])\n    SWeb(["@serenity-js/web"])\n    SWdio(["@serenity-js/protractor"])\n    SCore(["@serenity-js/core"])\n    TR(["3rd-party test runner"])\n    TRA(["Serenity/JS test runner adapter"])\n    Specs["test scenarios"]\n    R(["Serenity/JS reporting services"])\n\n    DEV -- invokes --\x3e WdioCli\n    WdioCli -- loads --\x3e ConfigFile\n    WdioCli -- uses --\x3e SWdioAdapter\n    ConfigFile -- configures --\x3e SCore\n    SWdioAdapter -- registers --\x3e TRA\n    SWdioAdapter -- manages --\x3e TR\n    TR -- notifies --\x3e TRA\n    TR -- executes --\x3e Specs\n    Specs -- use --\x3e SWeb\n    SWeb -- notifies --\x3e SCore\n\n    SWeb -- uses --\x3e SWdio\n\n    SWdio -- uses --\x3e Wdio\n\n    Wdio -- interacts with --\x3e SUT\n\n    TRA -- notifies --\x3e SCore\n    SCore -- notifies --\x3e R\n\n    click SWdio "/api/protractor"\n    click SWeb "/api/web"\n    click SCore "/api/core"\n    click R "/handbook/reporting"'}),(0,a.kt)("figcaption",null,"Serenity/JS + Protractor integration architecture")),(0,a.kt)("h3",{id:"installing-serenityjs-test-runner-adapter"},"Installing Serenity/JS test runner adapter"),(0,a.kt)("p",null,"Assuming you already have a Protractor project, add Serenity/JS Protractor and web integration modules:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/core"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/core"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/protractor"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/protractor"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/web"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/web")))),(0,a.kt)("p",null,"You might also want to install Serenity/JS reporting services:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/console-reporter"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/console-reporter"))),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/serenity-bdd"},(0,a.kt)("inlineCode",{parentName:"a"},"@serenity-js/serenity-bdd")))),(0,a.kt)("p",null,"To do the above, run the following command in your terminal:"),(0,a.kt)(o.Z,{groupId:"npm2yarn",mdxType:"Tabs"},(0,a.kt)(i.Z,{value:"npm",mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"npm install --save-dev @serenity-js/core @serenity-js/console-reporter @serenity-js/protractor @serenity-js/web @serenity-js/serenity-bdd\n"))),(0,a.kt)(i.Z,{value:"yarn",label:"Yarn",mdxType:"TabItem"},(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-sh"},"yarn add --dev @serenity-js/core @serenity-js/console-reporter @serenity-js/protractor @serenity-js/web @serenity-js/serenity-bdd\n")))),(0,a.kt)("p",null,"Protractor offers a test runner that uses Jasmine, Mocha, or Cucumber to run your test scenarios.\nSince the task of running the scenarios is delegated to another tool,\nyou'll need to follow the installation instructions to add a Serenity/JS test runner adapter for the runner you've decided to use."),(0,a.kt)("p",null,"See Serenity/JS test runner adapter installation instructions for:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/handbook/test-runners/cucumber#installing-serenityjs-test-runner-adapter"},"Cucumber")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/handbook/test-runners/jasmine#installing-serenityjs-test-runner-adapter"},"Jasmine")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/handbook/test-runners/mocha#installing-serenityjs-test-runner-adapter"},"Mocha"))),(0,a.kt)("h3",{id:"configuring-serenityjs"},"Configuring Serenity/JS"),(0,a.kt)("p",null,"To use ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting/"},"Serenity/JS reporting services")," in a Protractor project,\nmodify your ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/angular/protractor/blob/master/lib/config.ts"},(0,a.kt)("inlineCode",{parentName:"a"},"protractor.conf.js")," configuration file"),"\nto register ",(0,a.kt)("a",{parentName:"p",href:"/api/protractor"},"Serenity/JS Protractor adapter")," as a ",(0,a.kt)("inlineCode",{parentName:"p"},"custom")," Protractor ",(0,a.kt)("inlineCode",{parentName:"p"},"framework"),"\nand list any ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting"},"Serenity/JS reporting services")," under ",(0,a.kt)("inlineCode",{parentName:"p"},"crew"),":"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript",metastring:'title="protractor.conf.js"',title:'"protractor.conf.js"'},"exports.config = {\n\n    framework:      'custom',\n    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),\n\n    serenity: {\n        crew: [\n            '@serenity-js/console-reporter',\n            '@serenity-js/serenity-bdd',\n            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],\n            [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ],\n        ]\n    },\n\n    // other Protractor config\n}\n")),(0,a.kt)("p",null,"Learn more about configuring ",(0,a.kt)("a",{parentName:"p",href:"/api/protractor"},"Serenity/JS Protractor adapter")," and ",(0,a.kt)("a",{parentName:"p",href:"/handbook/reporting/"},"Serenity/JS reporting services"),"."),(0,a.kt)("h3",{id:"configuring-protractor"},"Configuring Protractor"),(0,a.kt)("p",null,"Protractor relies on Cucumber, Jasmine, or Mocha to execute your test scenarios.\nHowever, it is responsible for configuring the test runners themselves.\nTo learn about the test runner configuration options, follow the ",(0,a.kt)("a",{parentName:"p",href:"/api/protractor#configuring-protractor"},"Serenity/JS Protractor configuration guide"),"."),(0,a.kt)("p",null,"To find out how to define test scenarios, check out the respective guide on using Serenity/JS with:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/handbook/test-runners/cucumber"},"Cucumber")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/handbook/test-runners/jasmine"},"Jasmine")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/handbook/test-runners/mocha"},"Mocha"))),(0,a.kt)("p",null,"To learn about other Protractor configuration options, consult the ",(0,a.kt)("a",{parentName:"p",href:"/api/protractor-adapter/interface/Config"},"Serenity/JS Protractor API docs"),"."),(0,a.kt)("h2",{id:"using-serenityjs-screenplay-pattern-apis"},"Using Serenity/JS Screenplay Pattern APIs"),(0,a.kt)("p",null,(0,a.kt)("a",{parentName:"p",href:"/api/core/class/Actor"},"Serenity/JS actor model")," works great with Protractor\nand ",(0,a.kt)("a",{parentName:"p",href:"/handbook/design/screenplay-pattern"},"Serenity/JS Screenplay Pattern")," APIs can help your team implement\nProtractor test scenarios that are easy to read and understand."),(0,a.kt)("p",null,"The fastest way to get started with Serenity/JS and Protractor is to use one of\nthe ",(0,a.kt)("a",{parentName:"p",href:"https://github.com/serenity-js?q=protractor+template&type=all&language=&sort="},"Serenity/JS + Protractor project templates"),".\nHowever, if you're adding Serenity/JS to an existing project or simply want to understand how the integration works,\nthis guide is for you."),(0,a.kt)("h3",{id:"referring-to-actors-in-test-scenarios"},"Referring to actors in test scenarios"),(0,a.kt)("p",null,"When you configure ",(0,a.kt)("a",{parentName:"p",href:"/api/protractor"},"Serenity/JS Protractor"),"\nas the ",(0,a.kt)("a",{parentName:"p",href:"/handbook/test-runners/protractor#configuring-serenityjs"},"Protractor ",(0,a.kt)("inlineCode",{parentName:"a"},"framework")),",\nSerenity/JS automatically creates and makes available a default ",(0,a.kt)("a",{parentName:"p",href:"/api/core/class/Cast"},"cast of actors"),"\nwhere every actor has the abilities to:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/protractor/class/BrowseTheWebWithProtractor"},(0,a.kt)("inlineCode",{parentName:"a"},"BrowseTheWebWithProtractor"))," using the global ",(0,a.kt)("inlineCode",{parentName:"li"},"browser")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/api/core/class/TakeNotes"},(0,a.kt)("inlineCode",{parentName:"a"},"TakeNotes.usingAnEmptyNotepad()")))),(0,a.kt)("p",null,"This means that any actors you refer to in your test scenarios using\n",(0,a.kt)("a",{parentName:"p",href:"/api/core/function/actorCalled"},(0,a.kt)("inlineCode",{parentName:"a"},"actorCalled")),"\nand ",(0,a.kt)("a",{parentName:"p",href:"/api/core/function/actorInTheSpotlight"},(0,a.kt)("inlineCode",{parentName:"a"},"actorInTheSpotlight"))," functions are configured using\nthis default cast, and already have access to the Protractor-managed browser instance."),(0,a.kt)("p",null,"Since Protractor uses Jasmine, Mocha, or Cucumber to run your test scenarios, please refer to their\ndedicated guides to learn more about using Serenity/JS actors with:"),(0,a.kt)("ul",null,(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/handbook/test-runners/cucumber#referring-to-actors-in-test-scenarios"},"Cucumber")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/handbook/test-runners/jasmine#referring-to-actors-in-test-scenarios"},"Jasmine")),(0,a.kt)("li",{parentName:"ul"},(0,a.kt)("a",{parentName:"li",href:"/handbook/test-runners/mocha#referring-to-actors-in-test-scenarios"},"Mocha"))),(0,a.kt)("h3",{id:"configuring-a-custom-cast-of-actors"},"Configuring a custom cast of actors"),(0,a.kt)("p",null,"You can replace the default ",(0,a.kt)("a",{parentName:"p",href:"/api/core/class/Cast"},"cast of actors"),"\nby providing a custom implementation via ",(0,a.kt)("a",{parentName:"p",href:"/api/protractor-adapter/interface/Config#serenity"},(0,a.kt)("inlineCode",{parentName:"a"},"serenity.actors")),"\nconfiguration option in your ",(0,a.kt)("inlineCode",{parentName:"p"},"protractor.conf.js"),"."),(0,a.kt)("p",null,"For example, to implement a cast where every actor can ",(0,a.kt)("a",{parentName:"p",href:"/api/protractor/class/BrowseTheWebWithProtractor"},(0,a.kt)("inlineCode",{parentName:"a"},"BrowseTheWebWithProtractor")),",\n",(0,a.kt)("a",{parentName:"p",href:"/api/core/class/TakeNotes"},(0,a.kt)("inlineCode",{parentName:"a"},"TakeNotes"))," and ",(0,a.kt)("a",{parentName:"p",href:"/api/rest/class/CallAnApi"},(0,a.kt)("inlineCode",{parentName:"a"},"CallAnApi")),", you could create a ",(0,a.kt)("inlineCode",{parentName:"p"},"MyActors")," class like this:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript",metastring:'title="test/MyActors.js"',title:'"test/MyActors.js"'},"const { TakeNotes } = require('@serenity-js/core')\nconst { CallAnApi } = require('@serenity-js/rest')\nconst { BrowseTheWebWithProtractor } = require('@serenity-js/protractor')\n\nexports.Actors = class Actors {\n    constructor(apiUrl) {\n        this.apiUrl = apiUrl\n    }\n\n    prepare(actor) {\n        return actor.whoCan(\n            BrowseTheWebWithProtractor.using(require('protractor').browser),\n            TakeNotes.usingAnEmptyNotepad(),\n            CallAnApi.at(this.apiUrl),\n        );\n    }\n}\n")),(0,a.kt)("admonition",{title:"No browser in the configuration file",type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Protractor doesn't allow you to use the ",(0,a.kt)("inlineCode",{parentName:"p"},"browser")," global variable in ",(0,a.kt)("inlineCode",{parentName:"p"},"protractor.conf.js"),".\nThat's why you need to create a custom implementation of ",(0,a.kt)("a",{parentName:"p",href:"/api/core/class/Cast"},(0,a.kt)("inlineCode",{parentName:"a"},"Cast")),"\nand only refer to ",(0,a.kt)("inlineCode",{parentName:"p"},"browser")," in ",(0,a.kt)("a",{parentName:"p",href:"/api/core/class/Cast#prepare"},(0,a.kt)("inlineCode",{parentName:"a"},"Cast.prepare"))," method.")),(0,a.kt)("admonition",{title:"No TypeScript in the configuration file",type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Protractor doesn't allow you to use TypeScript in ",(0,a.kt)("inlineCode",{parentName:"p"},"protractor.conf.js"),".\nThat's why ",(0,a.kt)("inlineCode",{parentName:"p"},"MyActors")," needs to be implemented in plain-old JavaScript.")),(0,a.kt)("p",null,"Next, modify your Protractor configuration file to provide your custom ",(0,a.kt)("inlineCode",{parentName:"p"},"MyActors")," implementation:"),(0,a.kt)("pre",null,(0,a.kt)("code",{parentName:"pre",className:"language-javascript",metastring:'title="protractor.conf.js"',title:'"protractor.conf.js"'},"// highlight-next-line\nconst { MyActors } = require('./test/MyActors');\n\nexports.config = {\n\n    framework:      'custom',\n    frameworkPath:  require.resolve('@serenity-js/protractor/adapter'),\n\n    serenity: {\n        // highlight-next-line\n        actors: new MyActors(),\n        crew: [\n            '@serenity-js/console-reporter',\n            '@serenity-js/serenity-bdd',\n            [ '@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' } ],\n            [ '@serenity-js/web:Photographer', { strategy: 'TakePhotosOfFailures' } ],\n        ]\n    },\n\n    // other Protractor config\n}\n")),(0,a.kt)("h2",{id:"migrating-from-protractor-to-webdriverio"},"Migrating from Protractor to WebdriverIO"),(0,a.kt)("p",null,"Introducing Serenity/JS Screenplay Pattern APIs in your test scenarios\ncan help your code become and stay integration tool-agnostic.\nIt can also help you migrate from Protractor to a more modern tool like ",(0,a.kt)("a",{parentName:"p",href:"/handbook/test-runners/webdriverio"},"WebdriverIO"),"."),(0,a.kt)("admonition",{title:"Your feedback matters!",type:"info"},(0,a.kt)("p",{parentName:"admonition"},"Are you planning to migrate your tests from Protractor to another integration tool?"),(0,a.kt)("p",{parentName:"admonition"},"I'm considering writing a ",(0,a.kt)("strong",{parentName:"p"},"tutorial"),", recording a ",(0,a.kt)("strong",{parentName:"p"},"video"),", or maybe even a ",(0,a.kt)("strong",{parentName:"p"},"course")," on how to\nmigrate your tests from Protractor to WebdriverIO or Playwright in a safe and reliable way that minimises the risk to your organisation."),(0,a.kt)("p",{parentName:"admonition"},"If you're interested in that, let me know in the comments! \ud83d\udc47\ud83d\udc47\ud83d\udc47"),(0,a.kt)("p",{parentName:"admonition"},"Also make sure to follow Serenity/JS to get notified \ud83d\udd14 when new content is available! \ud83c\udf89"),(0,a.kt)("p",{parentName:"admonition"},(0,a.kt)("a",{parentName:"p",href:"https://www.linkedin.com/company/serenity-js"},(0,a.kt)("img",{parentName:"a",src:"https://img.shields.io/badge/Follow%20Serenity%2FJS-0077B5?style=for-the-badge&logo=linkedin&logoColor=white",alt:"LinkedIn Follow"})),"\n",(0,a.kt)("a",{parentName:"p",href:"https://www.youtube.com/@serenity-js"},(0,a.kt)("img",{parentName:"a",src:"https://img.shields.io/badge/Watch%20@serenity--js-E62117?style=for-the-badge&logo=youtube&logoColor=white",alt:"YouTube Follow"})),"\n",(0,a.kt)("a",{parentName:"p",href:"https://github.com/sponsors/serenity-js"},(0,a.kt)("img",{parentName:"a",src:"https://img.shields.io/badge/Support%20@serenity%2FJS-703EC8?style=for-the-badge&logo=github&logoColor=white",alt:"GitHub Sponsors"})))))}h.isMDXComponent=!0}}]);