!function(e){function t(o){if(r[o])return r[o].exports;var n=r[o]={exports:{},id:o,loaded:!1};return e[o].call(n.exports,n,n.exports,t),n.loaded=!0,n.exports}var r={};return t.m=e,t.c=r,t.p="",t(0)}([function(e,t,r){e.exports=r(1)},function(e,t,r){"use strict";function o(){var e=function(e,t,r,o){return function(n){n.map(function(n){for(var a,l=0;l<n.addedNodes.length;++l){var i=n.addedNodes[l];i.id===t&&(a=i)}if(a){var c=document.querySelector(r);null!==c&&searchandiser.attach("gb-cvs-search-box",r,{boxid:o}),e.observer.disconnect()}})}},t={childList:!0,subtree:!0},r={},o=new MutationObserver(e(r,"dMainHeader","#GlobalSearchForm","searchbox"));r.observer=o,o.observe(document.documentElement,t);var n={},a=new MutationObserver(e(n,"bodyCVSContainer","#head-page-search > form","searchboxMobile"));n.observer=a,a.observe(document.documentElement,t)}function n(){o();var e=searchandiser.attach("gb-search-page",{env:c});"undefined"!=typeof __DEBUGCVS_SEARCH_PAGE__&&(__DEBUGCVS_SEARCH_PAGE__=e)}var a=r(2),l=r(3),i="undefined"!=typeof window.gbSearchEnvironment?window.gbSearchEnvironment:void 0,c=new a.CvsEnvironments(window.location,i);searchandiser({customerId:a.CUSTOMERID,area:c.getArea(),collection:c.getCollection(),initialSearch:!1,pruneRefinements:!1,bridge:{skipCache:"Production"!==c.getArea(),https:c.isHttps(),timeout:1e4},url:{queryParam:"searchTerm",searchUrl:""},pageSizes:[20],fields:["*"],structure:{title:"title",productShortName:"p_Product_ShortName",parentPdpUrl:"BV_ParentProductPageUrl",variants:"variants",_transform:l(c),_variantStructure:{image:"image",price:"p_Product_Price",unitPrice:"gbi_Price_Each",salePrice:"p_Sale_Price",unitSalePrice:"gbi_Sale_Price_Each",saveAmount:"gbi_Sale_Price_Saving",shortName:"p_Sku_ShortName",productRating:"p_Product_Review",productSize:"p_Sku_Size",productAvailability:"Product_Availability",stockCode:"p_Product_Availability",rating:"p_Product_Rating",pdpUrl:"BV_ProductPageUrl",color:"p_Sku_Color",promotionDescription:"p_Promotion_Description",upc:"p_Product_UPCNumber",adblock:"p_Adblock_Id"}},tags:{sayt:{area:c.getArea(),collection:c.getCollection(),structure:{image:"image_url"},products:3,queries:5,highlight:!0,categoryField:"variants.subVariant.ProductBrand_Brand",navigationNames:{"variants.subVariant.ProductBrand_Brand":"Brand"},allowedNavigations:["variants.subVariant.ProductBrand_Brand"],minimumCharacters:3,delay:300,https:c.isHttps()},collections:{options:[{label:"Products",value:c.getCollection()},{label:"Drug Information",url:"/search/N-3nZcf",value:c.getDrugCollection()},{label:"Health Resources",url:"/search/N-3oZ3e",value:c.getHealthCollection()},{label:"Help",url:"/search/N-3pZ3d",value:c.getHelpCollection()}]},sort:{options:[{label:"Relevance",value:{field:"_relevance",order:"Descending"}},{label:"Price Low to High",value:{field:"variants.subVariant.gbi_Actual_Price",order:"Ascending"}},{label:"Price High to Low",value:{field:"variants.subVariant.gbi_Actual_Price",order:"Descending"}},{label:"Most Reviewed",value:{field:"variants.subVariant.p_Product_Review",order:"Descending"}},{label:"Name A-Z",value:{field:"title",order:"Ascending"}},{label:"Name Z-A",value:{field:"title",order:"Descending"}}]}},stylish:!0}),n()},function(e,t){"use strict";function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}Object.defineProperty(t,"__esModule",{value:!0});var o="cvshealth",n=function(){function e(t,o,n){r(this,e),this._hostname=t?t.hostname:void 0,this._environmentSetting=o,this._protocol=t?t.protocol:"http:",this._baseurl=t?t.pathname:void 0,this._environments=n?n:this.loadenv()}return e.prototype.getEnvironment=function(){var e,t=this;return"undefined"!=typeof this._environmentSetting&&(e=Object.values(this._environments).find(function(e){return e.name===t._environmentSetting}))?e:this.getEnvironementFromDomain(this._hostname)},e.prototype.getEnvironementFromDomain=function(e){var t=e;e&&e.startsWith("www.")&&(t=e.substring(4));var r=this._environments[t];if(r)return r;if(t&&t.startsWith("m-")){var o="www-"+t.substring(2);r=this._environments[o]}return r?r:this.defaultEnvironment()},e.prototype.getArea=function(){return this.getEnvironment().area},e.prototype.getCollection=function(){return this.getEnvironment().collection},e.prototype.getDrugCollection=function(){return this.getEnvironment().drugCollection},e.prototype.getDrugArea=function(){return this.getEnvironment().drugArea},e.prototype.getHealthCollection=function(){return this.getEnvironment().healthCollection},e.prototype.getHealthArea=function(){return this.getEnvironment().healthArea},e.prototype.getHelpCollection=function(){return this.getEnvironment().helpCollection},e.prototype.getHelpArea=function(){return this.getEnvironment().helpArea},e.prototype.isHttps=function(){return"https:"===this._protocol},e.prototype.getUrl=function(){return this._baseurl},e.prototype.defaultEnvironment=function(){return Object.values(this._environments)[0]},e.prototype.loadenv=function(){return{"cvs.com":{name:"prod",collection:"products",area:"Production",drugCollection:"drugs",drugArea:"Drugs",healthCollection:"healthResources",healthArea:"Health",helpCollection:"help",helpArea:"Help"},localhost:{name:"localhost",collection:"jcbProducts",area:"gbiJerome",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-it1.cvs.com":{name:"it1",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-it2.cvs.com":{name:"it2",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-it3.cvs.com":{name:"it3",collection:"products",area:"devTuning",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-it4.cvs.com":{name:"it4",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-qa1.cvs.com":{name:"qa1",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-qa2.cvs.com":{name:"qa2",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-qa3.cvs.com":{name:"qa3",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-qa4.cvs.com":{name:"qa4",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-uat1.cvs.com":{name:"uat1",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-uat2.cvs.com":{name:"uat2",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-uat3.cvs.com":{name:"uat3",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-uat4.cvs.com":{name:"uat4",collection:"devProducts",area:"devProd",drugCollection:"devDrugs",drugArea:"devDrugs",healthCollection:"devHealthResources",healthArea:"devHealth",helpCollection:"devHelp",helpArea:"devHelp"},"www-reg1.cvs.com":{name:"reg1",collection:"regProducts",area:"regProd",drugCollection:"regDrugs",drugArea:"regDrugs",healthCollection:"regHealthResources",healthArea:"regHealth",helpCollection:"regHelp",helpArea:"regHelp"},"www-reg2.cvs.com":{name:"reg2",collection:"regProducts",area:"regProd",drugCollection:"regDrugs",drugArea:"regDrugs",healthCollection:"regHealthResources",healthArea:"regHealth",helpCollection:"regHelp",helpArea:"regHelp"},"cdcpt.cvs.com":{name:"cdcpt",collection:"ptProducts",area:"ptProd",drugCollection:"ptDrugs",drugArea:"ptDrugs",healthCollection:"ptHealthResources",healthArea:"ptHealth",helpCollection:"ptHelp",helpArea:"ptHelp"},"www-pt2.cvs.com":{name:"pt2",collection:"ptProducts",area:"ptProd",drugCollection:"ptDrugs",drugArea:"ptDrugs",healthCollection:"ptHealthResources",healthArea:"ptHealth",helpCollection:"ptHelp",helpArea:"ptHelp"},"cdcprd1-stg.cvs.com":{name:"cdcprd1",collection:"busProducts",area:"busProd",drugCollection:"busDrugs",drugArea:"busDrugs",healthCollection:"busHealthResources",healthArea:"busHealth",helpCollection:"busHelp",helpArea:"busHelp"},"cdcprd2-stg.cvs.com":{name:"cdcprd2",collection:"busProducts",area:"busProd",drugCollection:"busDrugs",drugArea:"busDrugs",healthCollection:"busHealthResources",healthArea:"busHealth",helpCollection:"busHelp",helpArea:"busHelp"},"cvsprototype.demo.groupbyinc.com":{name:"demo",collection:"products",area:"GroupByTest",drugCollection:"drugs",drugArea:"Drugs",healthCollection:"healthResources",healthArea:"Health",helpCollection:"help",helpArea:"Help"}}},e}();t.CUSTOMERID=o,t.CvsEnvironments=n},function(e,t,r){"use strict";function o(e){return function(t,r){if(!t.variants)return t;var o=void 0===t.variants[0].subVariant;return o?u(t,r,e):c(t,r,e)}}function n(e,t){var r=void 0!==e.p_Promotion_Description,o=void 0!==t.p_Promotion_Description;return r||o?r&&!o?-1:!r&&o?1:0:0}function a(e,t){var r=void 0!==e.p_Product_Availability,o=void 0!==t.p_Product_Availability;if(!r&&!o)return 0;if(r&&!o)return-1;if(!r&&o)return 1;var n=e.p_Product_Availability-t.p_Product_Availability;return n}function l(e,t){if(!e||!e.originalRequest||!e.originalRequest.sort)return function(e,t){return 0};var r=e.originalRequest.sort[0];return"_relevance"===r.field?function(e,t){return 0}:function(e,o){var n=r.field===t+".gbi_Actual_Price"||r.field===t+".p_Product_Review",a=r.field.replace(t+".",""),l=h(e,a,"0"),i=h(o,a,"0");return n?(l=Number.parseFloat(l),i=Number.parseFloat(i),"Descending"===r.order?i-l:l-i):"Descending"===r.order?l.localeCompare(i):i.localeCompare(l)}}function i(e,t){return e&&e.selectedNavigation&&0!==e.selectedNavigation.length?function(r,o){for(var n=0;n<e.selectedNavigation.length;n++)for(var a=e.selectedNavigation[n],l=0;l<a.refinements.length;l++){var i=a.refinements[l];if(a.name.startsWith(t)){var c=a.name.replace(t+".",""),u=h(r,c,""),s=h(o,c,"");if(u!==s){var d=!1,v=!1;if("Value"===i.type?(u=Array.isArray(u)?u.find(function(e){return e===i.value}):u,s=Array.isArray(s)?s.find(function(e){return e===i.value}):s,d=u===i.value,v=s===i.value):(d=u<=i.high&&u>=i.low,v=s<=i.high&&s>=i.low),!(d&&v||!d&&!v))return d?-1:1}}}return 0}:function(e,t){return 0}}function c(e,t,r){var o=0,c=v(e.variants.map(function(e){return e.subVariant.map(function(t){return s(t,r),{subVariant:t,variant:e,position:o++}})})),u=function(e,r){var o=l(t,"variants.subVariant");return o(e.subVariant,r.subVariant)},h=function(e,r){var o=i(t,"variants.subVariant");return o(e.subVariant,r.subVariant)},g=function(e,t){return a(e.subVariant,t.subVariant)},m=function(e,t){return n(e.subVariant,t.subVariant)},f=function(e,t){return e.position-t.position};c.sort(d(u).thenBy(h).thenBy(g).thenBy(m).thenBy(f));var b=c.map(function(e){return e.variant}).filter(p);return e.variants=b,e.variants.map(function(e){return e.subVariant=[]}),c.map(function(e){e.variant.subVariant.push(e.subVariant)}),e}function u(e,t,r){return e.variants.map(function(e){return s(e,r)}),e.variants.sort(d(l(t,"variants")).thenBy(i(t,"variants")).thenBy(a).thenBy(n)),e}function s(e,t){e.image=(t.isHttps()?"https":"http")+"://www.cvs.com/bizcontent/merchandising/productimages/small/"+e.p_Product_UPCNumber+".jpg"}var d=r(4),h=r(5),v=function g(e){return e.reduce(function(e,t){return e.concat(Array.isArray(t)?g(t):t)},[])},p=function(e,t,r){return r.indexOf(e)===t};e.exports=o},function(e,t){e.exports=function(){function e(e){return e}function t(e){return"string"==typeof e?e.toLowerCase():e}function r(r,o){if(o="number"==typeof o?{direction:o}:o||{},"function"!=typeof r){var n=r;r=function(e){return e[n]?e[n]:""}}if(1===r.length){var a=r,l=o.ignoreCase?t:e;r=function(e,t){return l(a(e))<l(a(t))?-1:l(a(e))>l(a(t))?1:0}}return o.direction===-1?function(e,t){return-r(e,t)}:r}function o(e,t){var n="function"==typeof this&&this,a=r(e,t),l=n?function(e,t){return n(e,t)||a(e,t)}:a;return l.thenBy=o,l}return o}()},function(e,t){"use strict";function r(e,t,r){var o=t.replace(/\[/g,".").replace(/\]/g,"").replace(/^\./,"").split(".").reduce(function(e,t){return e&&e[t]},e);return void 0===o?r:o}e.exports=r}]);
//# sourceMappingURL=gb-search-instance.js.map