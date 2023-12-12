"use strict";(self.webpackChunk_documentation_serenity_js_org=self.webpackChunk_documentation_serenity_js_org||[]).push([[39850],{30876:(e,t,r)=>{r.d(t,{Zo:()=>p,kt:()=>y});var a=r(2784);function n(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function i(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?i(Object(r),!0).forEach((function(t){n(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):i(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function l(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}var o=a.createContext({}),c=function(e){var t=a.useContext(o),r=t;return e&&(r="function"==typeof e?e(t):s(s({},t),e)),r},p=function(e){var t=c(e.components);return a.createElement(o.Provider,{value:t},e.children)},m="mdxType",u={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},f=a.forwardRef((function(e,t){var r=e.components,n=e.mdxType,i=e.originalType,o=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),m=c(r),f=n,y=m["".concat(o,".").concat(f)]||m[f]||u[f]||i;return r?a.createElement(y,s(s({ref:t},p),{},{components:r})):a.createElement(y,s({ref:t},p))}));function y(e,t){var r=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var i=r.length,s=new Array(i);s[0]=f;var l={};for(var o in t)hasOwnProperty.call(t,o)&&(l[o]=t[o]);l.originalType=e,l[m]="string"==typeof e?e:n,s[1]=l;for(var c=2;c<i;c++)s[c]=r[c];return a.createElement.apply(null,s)}return a.createElement.apply(null,r)}f.displayName="MDXCreateElement"},84870:(e,t,r)=>{r.r(t),r.d(t,{assets:()=>o,contentTitle:()=>s,default:()=>u,frontMatter:()=>i,metadata:()=>l,toc:()=>c});var a=r(7896),n=(r(2784),r(30876));const i={date:"2023-10-03T20:00",title:"3.11.0",tags:["assertions","core","playwright-test","rest","serenity-bdd","web"]},s="3.11.0",l={permalink:"/changelog/3.11.0",source:"@site/changelog/source/3.11.0.md",title:"3.11.0",description:"Summary",date:"2023-10-03T20:00:00.000Z",formattedDate:"October 3, 2023",tags:[{label:"assertions",permalink:"/changelog/tags/assertions"},{label:"core",permalink:"/changelog/tags/core"},{label:"playwright-test",permalink:"/changelog/tags/playwright-test"},{label:"rest",permalink:"/changelog/tags/rest"},{label:"serenity-bdd",permalink:"/changelog/tags/serenity-bdd"},{label:"web",permalink:"/changelog/tags/web"}],hasTruncateMarker:!1,authors:[],frontMatter:{date:"2023-10-03T20:00",title:"3.11.0",tags:["assertions","core","playwright-test","rest","serenity-bdd","web"]},prevItem:{title:"3.11.1",permalink:"/changelog/3.11.1"},nextItem:{title:"3.10.4",permalink:"/changelog/3.10.4"},listPageLink:"/changelog/page/10"},o={authorsImageUrls:[]},c=[{value:"Summary",id:"summary",level:2},{value:"Features",id:"features",level:2}],p={toc:c},m="wrapper";function u(e){let{components:t,...r}=e;return(0,n.kt)(m,(0,a.Z)({},p,r,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h2",{id:"summary"},"Summary"),(0,n.kt)("p",null,"This release introduces improvements to\nthe following Serenity/JS modules:"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/api/assertions"},(0,n.kt)("inlineCode",{parentName:"a"},"@serenity-js/assertions"))),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/api/core"},(0,n.kt)("inlineCode",{parentName:"a"},"@serenity-js/core"))),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/api/playwright-test"},(0,n.kt)("inlineCode",{parentName:"a"},"@serenity-js/playwright-test"))),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/api/rest"},(0,n.kt)("inlineCode",{parentName:"a"},"@serenity-js/rest"))),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/api/serenity-bdd"},(0,n.kt)("inlineCode",{parentName:"a"},"@serenity-js/serenity-bdd"))),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("a",{parentName:"li",href:"/api/web"},(0,n.kt)("inlineCode",{parentName:"a"},"@serenity-js/web")))),(0,n.kt)("p",null,"View detailed ",(0,n.kt)("a",{parentName:"p",href:"https://github.com/serenity-js/serenity-js/compare/v3.10.4...v3.11.0"},"code diff")," on GitHub"),(0,n.kt)("h2",{id:"features"},"Features"),(0,n.kt)("ul",null,(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"assertions:")," isBefore and isAfter accept Timestamp as well as Date objects (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/commit/55e13d00a447c0ec70dd496fb7948f171977a682"},"55e13d0"),")"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"core:")," inspecting a Timestamp returns a human-friendly description of its value (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/commit/da26b5478108c811e52ea8d902dd6c626c843ffc"},"da26b54"),")"),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"playwright-test:")," enabled the ability to CallAnApi for all default actors (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/commit/436cde5283c14cea420000389d7c2c73e6122764"},"436cde5"),"), closes ",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/issues/1876"},"#1876")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"playwright-test:")," explicit proxy config will override env variables for REST interaction (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/commit/1c277d6e45064fbb4ab3432c11d125f529268b5c"},"1c277d6"),"), closes ",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/issues/1949"},"#1949")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"rest:")," automatic proxy server configuration for CallAnApi (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/commit/27a163024120068bc4d5b7ec07704fb774b2e312"},"27a1630"),"), closes ",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/issues/1949"},"#1949")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"serenity-bdd:")," serenity-bdd downloader will now automatically detect proxy server configuration (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/commit/c221210c95753a518621b5e97f6e037fa9383be1"},"c221210"),"), closes ",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/issues/1949"},"#1949")),(0,n.kt)("li",{parentName:"ul"},(0,n.kt)("strong",{parentName:"li"},"web:")," ability to CallAnApi is now available by default (",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/commit/dfaf8e4f4cb40f9be99624f0d616ebcf012c1fb0"},"dfaf8e4"),"), closes ",(0,n.kt)("a",{parentName:"li",href:"https://github.com/serenity-js/serenity-js/issues/1876"},"#1876"))))}u.isMDXComponent=!0}}]);