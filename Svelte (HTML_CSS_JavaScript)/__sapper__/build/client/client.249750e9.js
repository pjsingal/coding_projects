function t(){}const e=t=>t;function n(t,e){for(const n in e)t[n]=e[n];return t}function r(t){return t()}function o(){return Object.create(null)}function s(t){t.forEach(r)}function c(t){return"function"==typeof t}function a(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}let i;function l(t,e){return i||(i=document.createElement("a")),i.href=e,t===i.href}function u(t,e,n,r){if(t){const o=f(t,e,n,r);return t[0](o)}}function f(t,e,r,o){return t[1]&&o?n(r.ctx.slice(),t[1](o(e))):r.ctx}function d(t,e,n,r){if(t[2]&&r){const o=t[2](r(n));if(void 0===e.dirty)return o;if("object"==typeof o){const t=[],n=Math.max(e.dirty.length,o.length);for(let r=0;r<n;r+=1)t[r]=e.dirty[r]|o[r];return t}return e.dirty|o}return e.dirty}function p(t,e,n,r,o,s){if(o){const c=f(e,n,r,s);t.p(c,o)}}function h(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let t=0;t<n;t++)e[t]=-1;return e}return-1}const m="undefined"!=typeof window;let g=m?()=>window.performance.now():()=>Date.now(),_=m?t=>requestAnimationFrame(t):t;const $=new Set;function v(t){$.forEach(e=>{e.c(t)||($.delete(e),e.f())}),0!==$.size&&_(v)}let y=!1;function b(t,e,n,r){for(;t<e;){const o=t+(e-t>>1);n(o)<=r?t=o+1:e=o}return t}function E(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function w(t){const e=P("style");return function(t,e){!function(t,e){t.appendChild(e)}(t.head||t,e)}(E(t),e),e}function x(t,e){if(y){for(!function(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if("HEAD"===t.nodeName){const t=[];for(let n=0;n<e.length;n++){const r=e[n];void 0!==r.claim_order&&t.push(r)}e=t}const n=new Int32Array(e.length+1),r=new Int32Array(e.length);n[0]=-1;let o=0;for(let t=0;t<e.length;t++){const s=e[t].claim_order,c=(o>0&&e[n[o]].claim_order<=s?o+1:b(1,o,t=>e[n[t]].claim_order,s))-1;r[t]=n[c]+1;const a=c+1;n[a]=t,o=Math.max(a,o)}const s=[],c=[];let a=e.length-1;for(let t=n[o]+1;0!=t;t=r[t-1]){for(s.push(e[t-1]);a>=t;a--)c.push(e[a]);a--}for(;a>=0;a--)c.push(e[a]);s.reverse(),c.sort((t,e)=>t.claim_order-e.claim_order);for(let e=0,n=0;e<c.length;e++){for(;n<s.length&&c[e].claim_order>=s[n].claim_order;)n++;const r=n<s.length?s[n]:null;t.insertBefore(c[e],r)}}(t),(void 0===t.actual_end_child||null!==t.actual_end_child&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);null!==t.actual_end_child&&void 0===t.actual_end_child.claim_order;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?void 0===e.claim_order&&e.parentNode===t||t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else e.parentNode===t&&null===e.nextSibling||t.appendChild(e)}function S(t,e,n){y&&!n?x(t,e):e.parentNode===t&&e.nextSibling==n||t.insertBefore(e,n||null)}function R(t){t.parentNode.removeChild(t)}function A(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function P(t){return document.createElement(t)}function C(t){return document.createTextNode(t)}function j(){return C(" ")}function L(){return C("")}function N(t,e,n,r){return t.addEventListener(e,n,r),()=>t.removeEventListener(e,n,r)}function k(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function O(t){return Array.from(t.childNodes)}function q(t,e,n,r,o=!1){!function(t){void 0===t.claim_info&&(t.claim_info={last_index:0,total_claimed:0})}(t);const s=(()=>{for(let r=t.claim_info.last_index;r<t.length;r++){const s=t[r];if(e(s)){const e=n(s);return void 0===e?t.splice(r,1):t[r]=e,o||(t.claim_info.last_index=r),s}}for(let r=t.claim_info.last_index-1;r>=0;r--){const s=t[r];if(e(s)){const e=n(s);return void 0===e?t.splice(r,1):t[r]=e,o?void 0===e&&t.claim_info.last_index--:t.claim_info.last_index=r,s}}return r()})();return s.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,s}function U(t,e,n){return function(t,e,n,r){return q(t,t=>t.nodeName===e,t=>{const e=[];for(let r=0;r<t.attributes.length;r++){const o=t.attributes[r];n[o.name]||e.push(o.name)}e.forEach(e=>t.removeAttribute(e))},()=>r(e))}(t,e,n,P)}function D(t,e){return q(t,t=>3===t.nodeType,t=>{const n=""+e;if(t.data.startsWith(n)){if(t.data.length!==n.length)return t.splitText(n.length)}else t.data=n},()=>C(e),!0)}function I(t){return D(t," ")}function T(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function V(t,e,n,r){t.style.setProperty(e,n,r?"important":"")}function z(t,e,n){t.classList[n?"add":"remove"](e)}function B(t,e=document.body){return Array.from(e.querySelectorAll(t))}const H=new Set;let F,M=0;function J(t,e){const n=(t.style.animation||"").split(", "),r=n.filter(e?t=>t.indexOf(e)<0:t=>-1===t.indexOf("__svelte")),o=n.length-r.length;o&&(t.style.animation=r.join(", "),M-=o,M||_(()=>{M||(H.forEach(t=>{const e=t.__svelte_stylesheet;let n=e.cssRules.length;for(;n--;)e.deleteRule(n);t.__svelte_rules={}}),H.clear())}))}function G(t){F=t}function K(){if(!F)throw new Error("Function called outside component initialization");return F}const W=[],Q=[],Y=[],X=[],Z=Promise.resolve();let tt=!1;function et(t){Y.push(t)}const nt=new Set;let rt,ot=0;function st(){const t=F;do{for(;ot<W.length;){const t=W[ot];ot++,G(t),ct(t.$$)}for(G(null),W.length=0,ot=0;Q.length;)Q.pop()();for(let t=0;t<Y.length;t+=1){const e=Y[t];nt.has(e)||(nt.add(e),e())}Y.length=0}while(W.length);for(;X.length;)X.pop()();tt=!1,nt.clear(),G(t)}function ct(t){if(null!==t.fragment){t.update(),s(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(et)}}function at(t,e,n){t.dispatchEvent(function(t,e,n=!1){const r=document.createEvent("CustomEvent");return r.initCustomEvent(t,n,!1,e),r}(`${e?"intro":"outro"}${n}`))}const it=new Set;let lt;function ut(){lt={r:0,c:[],p:lt}}function ft(){lt.r||s(lt.c),lt=lt.p}function dt(t,e){t&&t.i&&(it.delete(t),t.i(e))}function pt(t,e,n,r){if(t&&t.o){if(it.has(t))return;it.add(t),lt.c.push(()=>{it.delete(t),r&&(n&&t.d(1),r())}),t.o(e)}}const ht={duration:0};function mt(n,r,o){let s,a,i=r(n,o),l=!1,u=0;function f(){s&&J(n,s)}function d(){const{delay:r=0,duration:o=300,easing:c=e,tick:d=t,css:p}=i||ht;p&&(s=function(t,e,n,r,o,s,c,a=0){const i=16.666/r;let l="{\n";for(let t=0;t<=1;t+=i){const r=e+(n-e)*s(t);l+=100*t+`%{${c(r,1-r)}}\n`}const u=l+`100% {${c(n,1-n)}}\n}`,f=`__svelte_${function(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}(u)}_${a}`,d=E(t);H.add(d);const p=d.__svelte_stylesheet||(d.__svelte_stylesheet=w(t).sheet),h=d.__svelte_rules||(d.__svelte_rules={});h[f]||(h[f]=!0,p.insertRule(`@keyframes ${f} ${u}`,p.cssRules.length));const m=t.style.animation||"";return t.style.animation=`${m?m+", ":""}${f} ${r}ms linear ${o}ms 1 both`,M+=1,f}(n,0,1,o,r,c,p,u++)),d(0,1);const h=g()+r,m=h+o;a&&a.abort(),l=!0,et(()=>at(n,!0,"start")),a=function(t){let e;return 0===$.size&&_(v),{promise:new Promise(n=>{$.add(e={c:t,f:n})}),abort(){$.delete(e)}}}(t=>{if(l){if(t>=m)return d(1,0),at(n,!0,"end"),f(),l=!1;if(t>=h){const e=c((t-h)/o);d(e,1-e)}}return l})}let p=!1;return{start(){p||(p=!0,J(n),c(i)?(i=i(),(rt||(rt=Promise.resolve(),rt.then(()=>{rt=null})),rt).then(d)):d())},invalidate(){p=!1},end(){l&&(f(),l=!1)}}}function gt(t,e){const n={},r={},o={$$scope:1};let s=t.length;for(;s--;){const c=t[s],a=e[s];if(a){for(const t in c)t in a||(r[t]=1);for(const t in a)o[t]||(n[t]=a[t],o[t]=1);t[s]=a}else for(const t in c)o[t]=1}for(const t in r)t in n||(n[t]=void 0);return n}function _t(t){return"object"==typeof t&&null!==t?t:{}}function $t(t){t&&t.c()}function vt(t,e){t&&t.l(e)}function yt(t,e,n,o){const{fragment:a,on_mount:i,on_destroy:l,after_update:u}=t.$$;a&&a.m(e,n),o||et(()=>{const e=i.map(r).filter(c);l?l.push(...e):s(e),t.$$.on_mount=[]}),u.forEach(et)}function bt(t,e){const n=t.$$;null!==n.fragment&&(s(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function Et(t,e){-1===t.$$.dirty[0]&&(W.push(t),tt||(tt=!0,Z.then(st)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function wt(e,n,r,c,a,i,l,u=[-1]){const f=F;G(e);const d=e.$$={fragment:null,ctx:null,props:i,update:t,not_equal:a,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(f?f.$$.context:[])),callbacks:o(),dirty:u,skip_bound:!1,root:n.target||f.$$.root};l&&l(d.root);let p=!1;if(d.ctx=r?r(e,n.props||{},(t,n,...r)=>{const o=r.length?r[0]:n;return d.ctx&&a(d.ctx[t],d.ctx[t]=o)&&(!d.skip_bound&&d.bound[t]&&d.bound[t](o),p&&Et(e,t)),n}):[],d.update(),p=!0,s(d.before_update),d.fragment=!!c&&c(d.ctx),n.target){if(n.hydrate){y=!0;const t=O(n.target);d.fragment&&d.fragment.l(t),t.forEach(R)}else d.fragment&&d.fragment.c();n.intro&&dt(e.$$.fragment),yt(e,n.target,n.anchor,n.customElement),y=!1,st()}G(f)}class xt{$destroy(){bt(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const St=[];function Rt(e,n=t){let r;const o=new Set;function s(t){if(a(e,t)&&(e=t,r)){const t=!St.length;for(const t of o)t[1](),St.push(t,e);if(t){for(let t=0;t<St.length;t+=2)St[t][0](St[t+1]);St.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(c,a=t){const i=[c,a];return o.add(i),1===o.size&&(r=n(s)||t),c(e),()=>{o.delete(i),0===o.size&&(r(),r=null)}}}}const At={},Pt=()=>({});function Ct(e){let n,r,o,s,c,a,i,u,f,d,p,h,m,g,_,$,v,y,b,E,w,A,L,N;return{c(){n=P("nav"),r=P("div"),o=P("div"),s=P("a"),c=P("picture"),a=P("source"),i=j(),u=P("source"),f=j(),d=P("img"),h=j(),m=P("ul"),g=P("li"),_=P("a"),$=C("CV"),v=j(),y=P("li"),b=P("a"),E=C("Projects"),w=j(),A=P("li"),L=P("a"),N=C("QVFT Dash"),this.h()},l(t){n=U(t,"NAV",{class:!0});var e=O(n);r=U(e,"DIV",{class:!0});var l=O(r);o=U(l,"DIV",{class:!0});var p=O(o);s=U(p,"A",{href:!0,class:!0});var x=O(s);c=U(x,"PICTURE",{class:!0});var S=O(c);a=U(S,"SOURCE",{srcset:!0,type:!0,class:!0}),i=I(S),u=U(S,"SOURCE",{srcset:!0,type:!0,class:!0}),f=I(S),d=U(S,"IMG",{src:!0,alt:!0,class:!0}),S.forEach(R),x.forEach(R),p.forEach(R),h=I(l),m=U(l,"UL",{class:!0});var P=O(m);g=U(P,"LI",{class:!0});var C=O(g);_=U(C,"A",{href:!0,class:!0});var j=O(_);$=D(j,"CV"),j.forEach(R),C.forEach(R),v=I(P),y=U(P,"LI",{class:!0});var k=O(y);b=U(k,"A",{href:!0,class:!0});var q=O(b);E=D(q,"Projects"),q.forEach(R),k.forEach(R),w=I(P),A=U(P,"LI",{class:!0});var T=O(A);L=U(T,"A",{href:!0,class:!0});var V=O(L);N=D(V,"QVFT Dash"),V.forEach(R),T.forEach(R),P.forEach(R),l.forEach(R),e.forEach(R),this.h()},h(){k(a,"srcset","logo.webp"),k(a,"type","image/webp"),k(a,"class","svelte-1iw7fo1"),k(u,"srcset","logo.png"),k(u,"type","image/png"),k(u,"class","svelte-1iw7fo1"),l(d.src,p="logo.png")||k(d,"src","logo.png"),k(d,"alt","Patrick Singal"),k(d,"class","svelte-1iw7fo1"),k(c,"class","logo svelte-1iw7fo1"),k(s,"href","."),k(s,"class","svelte-1iw7fo1"),z(s,"selected",!e[0]),k(o,"class","logo"),k(_,"href","cv"),k(_,"class","svelte-1iw7fo1"),z(_,"selected","cv"===e[0]),k(g,"class","svelte-1iw7fo1"),k(b,"href","projects"),k(b,"class","svelte-1iw7fo1"),z(b,"selected","projects"===e[0]),k(y,"class","svelte-1iw7fo1"),k(L,"href","dashboard"),k(L,"class","svelte-1iw7fo1"),z(L,"selected","dashboard"===e[0]),k(A,"class","svelte-1iw7fo1"),k(m,"class","svelte-1iw7fo1"),k(r,"class","contentWrapper svelte-1iw7fo1"),k(n,"class","svelte-1iw7fo1")},m(t,e){S(t,n,e),x(n,r),x(r,o),x(o,s),x(s,c),x(c,a),x(c,i),x(c,u),x(c,f),x(c,d),x(r,h),x(r,m),x(m,g),x(g,_),x(_,$),x(m,v),x(m,y),x(y,b),x(b,E),x(m,w),x(m,A),x(A,L),x(L,N)},p(t,[e]){1&e&&z(s,"selected",!t[0]),1&e&&z(_,"selected","cv"===t[0]),1&e&&z(b,"selected","projects"===t[0]),1&e&&z(L,"selected","dashboard"===t[0])},i:t,o:t,d(t){t&&R(n)}}}function jt(t,e,n){let{segment:r}=e;return t.$$set=t=>{"segment"in t&&n(0,r=t.segment)},[r]}class Lt extends xt{constructor(t){super(),wt(this,t,jt,Ct,a,{segment:0})}}function Nt(t){let e,n,r,o;e=new Lt({props:{segment:t[0]}});const s=t[2].default,c=u(s,t,t[1],null);return{c(){$t(e.$$.fragment),n=j(),r=P("main"),c&&c.c(),this.h()},l(t){vt(e.$$.fragment,t),n=I(t),r=U(t,"MAIN",{class:!0});var o=O(r);c&&c.l(o),o.forEach(R),this.h()},h(){k(r,"class","svelte-1rror3p")},m(t,s){yt(e,t,s),S(t,n,s),S(t,r,s),c&&c.m(r,null),o=!0},p(t,[n]){const r={};1&n&&(r.segment=t[0]),e.$set(r),c&&c.p&&(!o||2&n)&&p(c,s,t,t[1],o?d(s,t[1],n,null):h(t[1]),null)},i(t){o||(dt(e.$$.fragment,t),dt(c,t),o=!0)},o(t){pt(e.$$.fragment,t),pt(c,t),o=!1},d(t){bt(e,t),t&&R(n),t&&R(r),c&&c.d(t)}}}function kt(t,e,n){let{$$slots:r={},$$scope:o}=e,{segment:s}=e;return t.$$set=t=>{"segment"in t&&n(0,s=t.segment),"$$scope"in t&&n(1,o=t.$$scope)},[s,o,r]}class Ot extends xt{constructor(t){super(),wt(this,t,kt,Nt,a,{segment:0})}}function qt(t){let e,n,r=t[1].stack+"";return{c(){e=P("pre"),n=C(r)},l(t){e=U(t,"PRE",{});var o=O(e);n=D(o,r),o.forEach(R)},m(t,r){S(t,e,r),x(e,n)},p(t,e){2&e&&r!==(r=t[1].stack+"")&&T(n,r)},d(t){t&&R(e)}}}function Ut(e){let n,r,o,s,c,a,i,l,u,f=e[1].message+"";document.title=n=e[0];let d=e[2]&&e[1].stack&&qt(e);return{c(){r=j(),o=P("h1"),s=C(e[0]),c=j(),a=P("p"),i=C(f),l=j(),d&&d.c(),u=L()},l(t){B('[data-svelte="svelte-1moakz"]',document.head).forEach(R),r=I(t),o=U(t,"H1",{});var n=O(o);s=D(n,e[0]),n.forEach(R),c=I(t),a=U(t,"P",{});var p=O(a);i=D(p,f),p.forEach(R),l=I(t),d&&d.l(t),u=L()},m(t,e){S(t,r,e),S(t,o,e),x(o,s),S(t,c,e),S(t,a,e),x(a,i),S(t,l,e),d&&d.m(t,e),S(t,u,e)},p(t,[e]){1&e&&n!==(n=t[0])&&(document.title=n),1&e&&T(s,t[0]),2&e&&f!==(f=t[1].message+"")&&T(i,f),t[2]&&t[1].stack?d?d.p(t,e):(d=qt(t),d.c(),d.m(u.parentNode,u)):d&&(d.d(1),d=null)},i:t,o:t,d(t){t&&R(r),t&&R(o),t&&R(c),t&&R(a),t&&R(l),d&&d.d(t),t&&R(u)}}}function Dt(t,e,n){let{status:r}=e,{error:o}=e;return t.$$set=t=>{"status"in t&&n(0,r=t.status),"error"in t&&n(1,o=t.error)},[r,o,!1]}class It extends xt{constructor(t){super(),wt(this,t,Dt,Ut,a,{status:0,error:1})}}function Tt(t){let e,r,o;const s=[t[4].props];var c=t[4].component;function a(t){let e={};for(let t=0;t<s.length;t+=1)e=n(e,s[t]);return{props:e}}return c&&(e=new c(a())),{c(){e&&$t(e.$$.fragment),r=L()},l(t){e&&vt(e.$$.fragment,t),r=L()},m(t,n){e&&yt(e,t,n),S(t,r,n),o=!0},p(t,n){const o=16&n?gt(s,[_t(t[4].props)]):{};if(c!==(c=t[4].component)){if(e){ut();const t=e;pt(t.$$.fragment,1,0,()=>{bt(t,1)}),ft()}c?(e=new c(a()),$t(e.$$.fragment),dt(e.$$.fragment,1),yt(e,r.parentNode,r)):e=null}else c&&e.$set(o)},i(t){o||(e&&dt(e.$$.fragment,t),o=!0)},o(t){e&&pt(e.$$.fragment,t),o=!1},d(t){t&&R(r),e&&bt(e,t)}}}function Vt(t){let e,n;return e=new It({props:{error:t[0],status:t[1]}}),{c(){$t(e.$$.fragment)},l(t){vt(e.$$.fragment,t)},m(t,r){yt(e,t,r),n=!0},p(t,n){const r={};1&n&&(r.error=t[0]),2&n&&(r.status=t[1]),e.$set(r)},i(t){n||(dt(e.$$.fragment,t),n=!0)},o(t){pt(e.$$.fragment,t),n=!1},d(t){bt(e,t)}}}function zt(t){let e,n,r,o;const s=[Vt,Tt],c=[];function a(t,e){return t[0]?0:1}return e=a(t),n=c[e]=s[e](t),{c(){n.c(),r=L()},l(t){n.l(t),r=L()},m(t,n){c[e].m(t,n),S(t,r,n),o=!0},p(t,o){let i=e;e=a(t),e===i?c[e].p(t,o):(ut(),pt(c[i],1,1,()=>{c[i]=null}),ft(),n=c[e],n?n.p(t,o):(n=c[e]=s[e](t),n.c()),dt(n,1),n.m(r.parentNode,r))},i(t){o||(dt(n),o=!0)},o(t){pt(n),o=!1},d(t){c[e].d(t),t&&R(r)}}}function Bt(t){let e,r;const o=[{segment:t[2][0]},t[3].props];let s={$$slots:{default:[zt]},$$scope:{ctx:t}};for(let t=0;t<o.length;t+=1)s=n(s,o[t]);return e=new Ot({props:s}),{c(){$t(e.$$.fragment)},l(t){vt(e.$$.fragment,t)},m(t,n){yt(e,t,n),r=!0},p(t,[n]){const r=12&n?gt(o,[4&n&&{segment:t[2][0]},8&n&&_t(t[3].props)]):{};147&n&&(r.$$scope={dirty:n,ctx:t}),e.$set(r)},i(t){r||(dt(e.$$.fragment,t),r=!0)},o(t){pt(e.$$.fragment,t),r=!1},d(t){bt(e,t)}}}function Ht(t,e,n){let{stores:r}=e,{error:o}=e,{status:s}=e,{segments:c}=e,{level0:a}=e,{level1:i=null}=e,{notify:l}=e;var u,f,d;return u=l,K().$$.after_update.push(u),f=At,d=r,K().$$.context.set(f,d),t.$$set=t=>{"stores"in t&&n(5,r=t.stores),"error"in t&&n(0,o=t.error),"status"in t&&n(1,s=t.status),"segments"in t&&n(2,c=t.segments),"level0"in t&&n(3,a=t.level0),"level1"in t&&n(4,i=t.level1),"notify"in t&&n(6,l=t.notify)},[o,s,c,a,i,r,l]}class Ft extends xt{constructor(t){super(),wt(this,t,Ht,Bt,a,{stores:5,error:0,status:1,segments:2,level0:3,level1:4,notify:6})}}const Mt=[/^\/index\.json$/],Jt=[{js:()=>import("./index.b5172489.js"),css:["index.b5172489.css","client.249750e9.css"]},{js:()=>import("./dashboard.1ef5d911.js"),css:["dashboard.1ef5d911.css","client.249750e9.css","PageHeader.9678e872.css"]},{js:()=>import("./projects.a224b5b0.js"),css:["projects.a224b5b0.css","client.249750e9.css","PageHeader.9678e872.css"]},{js:()=>import("./cv.412204b2.js"),css:["cv.412204b2.css","client.249750e9.css","PageHeader.9678e872.css"]}],Gt=[{pattern:/^\/$/,parts:[{i:0}]},{pattern:/^\/dashboard\/?$/,parts:[{i:1}]},{pattern:/^\/projects\/?$/,parts:[{i:2}]},{pattern:/^\/cv\/?$/,parts:[{i:3}]}];const Kt="undefined"!=typeof __SAPPER__&&__SAPPER__;let Wt,Qt,Yt,Xt=!1,Zt=[],te="{}";const ee={page:function(t){const e=Rt(t);let n=!0;return{notify:function(){n=!0,e.update(t=>t)},set:function(t){n=!1,e.set(t)},subscribe:function(t){let r;return e.subscribe(e=>{(void 0===r||n&&e!==r)&&t(r=e)})}}}({}),preloading:Rt(null),session:Rt(Kt&&Kt.session)};let ne,re;ee.session.subscribe(async t=>{if(ne=t,!Xt)return;re=!0;const e=fe(new URL(location.href)),n=Qt={},{redirect:r,props:o,branch:s}=await me(e);n===Qt&&await he(r,s,o,e.page)});let oe,se=null;let ce,ae=1;const ie="undefined"!=typeof history?history:{pushState:(t,e,n)=>{},replaceState:(t,e,n)=>{},scrollRestoration:""},le={};function ue(t){const e=Object.create(null);return t.length>0&&t.slice(1).split("&").forEach(t=>{let[,n,r=""]=/([^=]*)(?:=(.*))?/.exec(decodeURIComponent(t.replace(/\+/g," ")));"string"==typeof e[n]&&(e[n]=[e[n]]),"object"==typeof e[n]?e[n].push(r):e[n]=r}),e}function fe(t){if(t.origin!==location.origin)return null;if(!t.pathname.startsWith(Kt.baseUrl))return null;let e=t.pathname.slice(Kt.baseUrl.length);if(""===e&&(e="/"),!Mt.some(t=>t.test(e)))for(let n=0;n<Gt.length;n+=1){const r=Gt[n],o=r.pattern.exec(e);if(o){const n=ue(t.search),s=r.parts[r.parts.length-1],c=s.params?s.params(o):{},a={host:location.host,path:e,query:n,params:c};return{href:t.href,route:r,match:o,page:a}}}}function de(){return{x:pageXOffset,y:pageYOffset}}async function pe(t,e,n,r){if(e)ce=e;else{const t=de();le[ce]=t,e=ce=++ae,le[ce]=n?t:{x:0,y:0}}ce=e,Wt&&ee.preloading.set(!0);const o=se&&se.href===t.href?se.promise:me(t);se=null;const s=Qt={},{redirect:c,props:a,branch:i}=await o;if(s===Qt&&(await he(c,i,a,t.page),document.activeElement&&document.activeElement.blur(),!n)){let t=le[e];if(r){const e=document.getElementById(r.slice(1));e&&(t={x:0,y:e.getBoundingClientRect().top+scrollY})}le[ce]=t,t&&scrollTo(t.x,t.y)}}async function he(t,e,n,r){if(t)return function(t,e={replaceState:!1}){const n=fe(new URL(t,document.baseURI));return n?(ie[e.replaceState?"replaceState":"pushState"]({id:ce},"",t),pe(n,null).then(()=>{})):(location.href=t,new Promise(t=>{}))}(t.location,{replaceState:!0});if(ee.page.set(r),ee.preloading.set(!1),Wt)Wt.$set(n);else{n.stores={page:{subscribe:ee.page.subscribe},preloading:{subscribe:ee.preloading.subscribe},session:ee.session},n.level0={props:await Yt},n.notify=ee.page.notify;const t=document.querySelector("#sapper-head-start"),e=document.querySelector("#sapper-head-end");if(t&&e){for(;t.nextSibling!==e;)_e(t.nextSibling);_e(t),_e(e)}Wt=new Ft({target:oe,props:n,hydrate:!0})}Zt=e,te=JSON.stringify(r.query),Xt=!0,re=!1}async function me(t){const{route:e,page:n}=t,r=n.path.split("/").filter(Boolean);let o=null;const s={error:null,status:200,segments:[r[0]]},c={fetch:(t,e)=>fetch(t,e),redirect:(t,e)=>{if(o&&(o.statusCode!==t||o.location!==e))throw new Error("Conflicting redirects");o={statusCode:t,location:e}},error:(t,e)=>{s.error="string"==typeof e?new Error(e):e,s.status=t}};let a;Yt||(Yt=Kt.preloaded[0]||Pt.call(c,{host:n.host,path:n.path,query:n.query,params:{}},ne));let i=1;try{const o=JSON.stringify(n.query),l=e.pattern.exec(n.path);let u=!1;a=await Promise.all(e.parts.map(async(e,a)=>{const f=r[a];if(function(t,e,n,r){if(r!==te)return!0;const o=Zt[t];return!!o&&(e!==o.segment||(!(!o.match||JSON.stringify(o.match.slice(1,t+2))===JSON.stringify(n.slice(1,t+2)))||void 0))}(a,f,l,o)&&(u=!0),s.segments[i]=r[a+1],!e)return{segment:f};const d=i++;if(!re&&!u&&Zt[a]&&Zt[a].part===e.i)return Zt[a];u=!1;const{default:p,preload:h}=await function(t){const e="string"==typeof t.css?[]:t.css.map(ge);return e.unshift(t.js()),Promise.all(e).then(t=>t[0])}(Jt[e.i]);let m;return m=Xt||!Kt.preloaded[a+1]?h?await h.call(c,{host:n.host,path:n.path,query:n.query,params:e.params?e.params(t.match):{}},ne):{}:Kt.preloaded[a+1],s["level"+d]={component:p,props:m,segment:f,match:l,part:e.i}}))}catch(t){s.error=t,s.status=500,a=[]}return{redirect:o,props:s,branch:a}}function ge(t){const e="client/"+t;if(!document.querySelector(`link[href="${e}"]`))return new Promise((t,n)=>{const r=document.createElement("link");r.rel="stylesheet",r.href=e,r.onload=()=>t(),r.onerror=n,document.head.appendChild(r)})}function _e(t){t.parentNode.removeChild(t)}function $e(t){const e=fe(new URL(t,document.baseURI));if(e)return se&&t===se.href||function(t,e){se={href:t,promise:e}}(t,me(e)),se.promise}let ve;function ye(t){clearTimeout(ve),ve=setTimeout(()=>{be(t)},20)}function be(t){const e=we(t.target);e&&"prefetch"===e.rel&&$e(e.href)}function Ee(t){if(1!==function(t){return null===t.which?t.button:t.which}(t))return;if(t.metaKey||t.ctrlKey||t.shiftKey)return;if(t.defaultPrevented)return;const e=we(t.target);if(!e)return;if(!e.href)return;const n="object"==typeof e.href&&"SVGAnimatedString"===e.href.constructor.name,r=String(n?e.href.baseVal:e.href);if(r===location.href)return void(location.hash||t.preventDefault());if(e.hasAttribute("download")||"external"===e.getAttribute("rel"))return;if(n?e.target.baseVal:e.target)return;const o=new URL(r);if(o.pathname===location.pathname&&o.search===location.search)return;const s=fe(o);if(s){pe(s,null,e.hasAttribute("sapper-noscroll"),o.hash),t.preventDefault(),ie.pushState({id:ce},"",o.href)}}function we(t){for(;t&&"A"!==t.nodeName.toUpperCase();)t=t.parentNode;return t}function xe(t){if(le[ce]=de(),t.state){const e=fe(new URL(location.href));e?pe(e,t.state.id):location.href=location.href}else ae=ae+1,function(t){ce=t}(ae),ie.replaceState({id:ce},"",location.href)}var Se;Se={target:document.querySelector("#sapper")},"scrollRestoration"in ie&&(ie.scrollRestoration="manual"),addEventListener("beforeunload",()=>{ie.scrollRestoration="auto"}),addEventListener("load",()=>{ie.scrollRestoration="manual"}),function(t){oe=t}(Se.target),addEventListener("click",Ee),addEventListener("popstate",xe),addEventListener("touchstart",be),addEventListener("mousemove",ye),Promise.resolve().then(()=>{const{hash:t,href:e}=location;ie.replaceState({id:ae},"",e);const n=new URL(location.href);if(Kt.error)return function(t){const{host:e,pathname:n,search:r}=location,{session:o,preloaded:s,status:c,error:a}=Kt;Yt||(Yt=s&&s[0]),he(null,[],{error:a,status:c,session:o,level0:{props:Yt},level1:{props:{status:c,error:a},component:It},segments:s},{host:e,path:n,query:ue(r),params:{}})}();const r=fe(n);return r?pe(r,ae,!0,t):void 0});export{d as A,e as B,N as C,T as D,et as E,mt as F,A as G,xt as S,j as a,O as b,U as c,I as d,P as e,R as f,k as g,l as h,wt as i,V as j,S as k,x as l,$t as m,t as n,vt as o,D as p,B as q,yt as r,a as s,C as t,dt as u,pt as v,bt as w,u as x,p as y,h as z};
