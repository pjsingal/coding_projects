function t(){}const e=t=>t;function n(t,e){for(const n in e)t[n]=e[n];return t}function r(t){return t()}function o(){return Object.create(null)}function s(t){t.forEach(r)}function a(t){return"function"==typeof t}function c(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}let i;function l(t,e){return i||(i=document.createElement("a")),i.href=e,t===i.href}function u(t,e,n,r){if(t){const o=f(t,e,n,r);return t[0](o)}}function f(t,e,r,o){return t[1]&&o?n(r.ctx.slice(),t[1](o(e))):r.ctx}function d(t,e,n,r){if(t[2]&&r){const o=t[2](r(n));if(void 0===e.dirty)return o;if("object"==typeof o){const t=[],n=Math.max(e.dirty.length,o.length);for(let r=0;r<n;r+=1)t[r]=e.dirty[r]|o[r];return t}return e.dirty|o}return e.dirty}function p(t,e,n,r,o,s){if(o){const a=f(e,n,r,s);t.p(a,o)}}function h(t){if(t.ctx.length>32){const e=[],n=t.ctx.length/32;for(let t=0;t<n;t++)e[t]=-1;return e}return-1}function m(t){const e={};for(const n in t)"$"!==n[0]&&(e[n]=t[n]);return e}const g="undefined"!=typeof window;let v=g?()=>window.performance.now():()=>Date.now(),_=g?t=>requestAnimationFrame(t):t;const $=new Set;function y(t){$.forEach(e=>{e.c(t)||($.delete(e),e.f())}),0!==$.size&&_(y)}let b=!1;function E(t,e,n,r){for(;t<e;){const o=t+(e-t>>1);n(o)<=r?t=o+1:e=o}return t}function w(t){if(!t)return document;const e=t.getRootNode?t.getRootNode():t.ownerDocument;return e&&e.host?e:t.ownerDocument}function x(t){const e=P("style");return function(t,e){!function(t,e){t.appendChild(e)}(t.head||t,e)}(w(t),e),e}function S(t,e){if(b){for(!function(t){if(t.hydrate_init)return;t.hydrate_init=!0;let e=t.childNodes;if("HEAD"===t.nodeName){const t=[];for(let n=0;n<e.length;n++){const r=e[n];void 0!==r.claim_order&&t.push(r)}e=t}const n=new Int32Array(e.length+1),r=new Int32Array(e.length);n[0]=-1;let o=0;for(let t=0;t<e.length;t++){const s=e[t].claim_order,a=(o>0&&e[n[o]].claim_order<=s?o+1:E(1,o,t=>e[n[t]].claim_order,s))-1;r[t]=n[a]+1;const c=a+1;n[c]=t,o=Math.max(c,o)}const s=[],a=[];let c=e.length-1;for(let t=n[o]+1;0!=t;t=r[t-1]){for(s.push(e[t-1]);c>=t;c--)a.push(e[c]);c--}for(;c>=0;c--)a.push(e[c]);s.reverse(),a.sort((t,e)=>t.claim_order-e.claim_order);for(let e=0,n=0;e<a.length;e++){for(;n<s.length&&a[e].claim_order>=s[n].claim_order;)n++;const r=n<s.length?s[n]:null;t.insertBefore(a[e],r)}}(t),(void 0===t.actual_end_child||null!==t.actual_end_child&&t.actual_end_child.parentElement!==t)&&(t.actual_end_child=t.firstChild);null!==t.actual_end_child&&void 0===t.actual_end_child.claim_order;)t.actual_end_child=t.actual_end_child.nextSibling;e!==t.actual_end_child?void 0===e.claim_order&&e.parentNode===t||t.insertBefore(e,t.actual_end_child):t.actual_end_child=e.nextSibling}else e.parentNode===t&&null===e.nextSibling||t.appendChild(e)}function j(t,e,n){b&&!n?S(t,e):e.parentNode===t&&e.nextSibling==n||t.insertBefore(e,n||null)}function A(t){t.parentNode.removeChild(t)}function R(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}function P(t){return document.createElement(t)}function C(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function L(t){return document.createTextNode(t)}function N(){return L(" ")}function k(){return L("")}function O(t,e,n,r){return t.addEventListener(e,n,r),()=>t.removeEventListener(e,n,r)}function D(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function q(t){return Array.from(t.childNodes)}function I(t,e,n,r,o=!1){!function(t){void 0===t.claim_info&&(t.claim_info={last_index:0,total_claimed:0})}(t);const s=(()=>{for(let r=t.claim_info.last_index;r<t.length;r++){const s=t[r];if(e(s)){const e=n(s);return void 0===e?t.splice(r,1):t[r]=e,o||(t.claim_info.last_index=r),s}}for(let r=t.claim_info.last_index-1;r>=0;r--){const s=t[r];if(e(s)){const e=n(s);return void 0===e?t.splice(r,1):t[r]=e,o?void 0===e&&t.claim_info.last_index--:t.claim_info.last_index=r,s}}return r()})();return s.claim_order=t.claim_info.total_claimed,t.claim_info.total_claimed+=1,s}function U(t,e,n,r){return I(t,t=>t.nodeName===e,t=>{const e=[];for(let r=0;r<t.attributes.length;r++){const o=t.attributes[r];n[o.name]||e.push(o.name)}e.forEach(e=>t.removeAttribute(e))},()=>r(e))}function T(t,e,n){return U(t,e,n,P)}function V(t,e,n){return U(t,e,n,C)}function B(t,e){return I(t,t=>3===t.nodeType,t=>{const n=""+e;if(t.data.startsWith(n)){if(t.data.length!==n.length)return t.splitText(n.length)}else t.data=n},()=>L(e),!0)}function H(t){return B(t," ")}function z(t,e){e=""+e,t.wholeText!==e&&(t.data=e)}function M(t,e,n,r){t.style.setProperty(e,n,r?"important":"")}function F(t,e,n){t.classList[n?"add":"remove"](e)}function J(t,e=document.body){return Array.from(e.querySelectorAll(t))}const K=new Set;let G,W=0;function Q(t,e){const n=(t.style.animation||"").split(", "),r=n.filter(e?t=>t.indexOf(e)<0:t=>-1===t.indexOf("__svelte")),o=n.length-r.length;o&&(t.style.animation=r.join(", "),W-=o,W||_(()=>{W||(K.forEach(t=>{const e=t.__svelte_stylesheet;let n=e.cssRules.length;for(;n--;)e.deleteRule(n);t.__svelte_rules={}}),K.clear())}))}function Y(t){G=t}function X(){if(!G)throw new Error("Function called outside component initialization");return G}const Z=[],tt=[],et=[],nt=[],rt=Promise.resolve();let ot=!1;function st(t){et.push(t)}const at=new Set;let ct,it=0;function lt(){const t=G;do{for(;it<Z.length;){const t=Z[it];it++,Y(t),ut(t.$$)}for(Y(null),Z.length=0,it=0;tt.length;)tt.pop()();for(let t=0;t<et.length;t+=1){const e=et[t];at.has(e)||(at.add(e),e())}et.length=0}while(Z.length);for(;nt.length;)nt.pop()();ot=!1,at.clear(),Y(t)}function ut(t){if(null!==t.fragment){t.update(),s(t.before_update);const e=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach(st)}}function ft(t,e,n){t.dispatchEvent(function(t,e,n=!1){const r=document.createEvent("CustomEvent");return r.initCustomEvent(t,n,!1,e),r}(`${e?"intro":"outro"}${n}`))}const dt=new Set;let pt;function ht(){pt={r:0,c:[],p:pt}}function mt(){pt.r||s(pt.c),pt=pt.p}function gt(t,e){t&&t.i&&(dt.delete(t),t.i(e))}function vt(t,e,n,r){if(t&&t.o){if(dt.has(t))return;dt.add(t),pt.c.push(()=>{dt.delete(t),r&&(n&&t.d(1),r())}),t.o(e)}}const _t={duration:0};function $t(n,r,o){let s,c,i=r(n,o),l=!1,u=0;function f(){s&&Q(n,s)}function d(){const{delay:r=0,duration:o=300,easing:a=e,tick:d=t,css:p}=i||_t;p&&(s=function(t,e,n,r,o,s,a,c=0){const i=16.666/r;let l="{\n";for(let t=0;t<=1;t+=i){const r=e+(n-e)*s(t);l+=100*t+`%{${a(r,1-r)}}\n`}const u=l+`100% {${a(n,1-n)}}\n}`,f=`__svelte_${function(t){let e=5381,n=t.length;for(;n--;)e=(e<<5)-e^t.charCodeAt(n);return e>>>0}(u)}_${c}`,d=w(t);K.add(d);const p=d.__svelte_stylesheet||(d.__svelte_stylesheet=x(t).sheet),h=d.__svelte_rules||(d.__svelte_rules={});h[f]||(h[f]=!0,p.insertRule(`@keyframes ${f} ${u}`,p.cssRules.length));const m=t.style.animation||"";return t.style.animation=`${m?m+", ":""}${f} ${r}ms linear ${o}ms 1 both`,W+=1,f}(n,0,1,o,r,a,p,u++)),d(0,1);const h=v()+r,m=h+o;c&&c.abort(),l=!0,st(()=>ft(n,!0,"start")),c=function(t){let e;return 0===$.size&&_(y),{promise:new Promise(n=>{$.add(e={c:t,f:n})}),abort(){$.delete(e)}}}(t=>{if(l){if(t>=m)return d(1,0),ft(n,!0,"end"),f(),l=!1;if(t>=h){const e=a((t-h)/o);d(e,1-e)}}return l})}let p=!1;return{start(){p||(p=!0,Q(n),a(i)?(i=i(),(ct||(ct=Promise.resolve(),ct.then(()=>{ct=null})),ct).then(d)):d())},invalidate(){p=!1},end(){l&&(f(),l=!1)}}}function yt(t,e){const n={},r={},o={$$scope:1};let s=t.length;for(;s--;){const a=t[s],c=e[s];if(c){for(const t in a)t in c||(r[t]=1);for(const t in c)o[t]||(n[t]=c[t],o[t]=1);t[s]=c}else for(const t in a)o[t]=1}for(const t in r)t in n||(n[t]=void 0);return n}function bt(t){return"object"==typeof t&&null!==t?t:{}}function Et(t){t&&t.c()}function wt(t,e){t&&t.l(e)}function xt(t,e,n,o){const{fragment:c,on_mount:i,on_destroy:l,after_update:u}=t.$$;c&&c.m(e,n),o||st(()=>{const e=i.map(r).filter(a);l?l.push(...e):s(e),t.$$.on_mount=[]}),u.forEach(st)}function St(t,e){const n=t.$$;null!==n.fragment&&(s(n.on_destroy),n.fragment&&n.fragment.d(e),n.on_destroy=n.fragment=null,n.ctx=[])}function jt(t,e){-1===t.$$.dirty[0]&&(Z.push(t),ot||(ot=!0,rt.then(lt)),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function At(e,n,r,a,c,i,l,u=[-1]){const f=G;Y(e);const d=e.$$={fragment:null,ctx:null,props:i,update:t,not_equal:c,bound:o(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(n.context||(f?f.$$.context:[])),callbacks:o(),dirty:u,skip_bound:!1,root:n.target||f.$$.root};l&&l(d.root);let p=!1;if(d.ctx=r?r(e,n.props||{},(t,n,...r)=>{const o=r.length?r[0]:n;return d.ctx&&c(d.ctx[t],d.ctx[t]=o)&&(!d.skip_bound&&d.bound[t]&&d.bound[t](o),p&&jt(e,t)),n}):[],d.update(),p=!0,s(d.before_update),d.fragment=!!a&&a(d.ctx),n.target){if(n.hydrate){b=!0;const t=q(n.target);d.fragment&&d.fragment.l(t),t.forEach(A)}else d.fragment&&d.fragment.c();n.intro&&gt(e.$$.fragment),xt(e,n.target,n.anchor,n.customElement),b=!1,lt()}Y(f)}class Rt{$destroy(){St(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){var e;this.$$set&&(e=t,0!==Object.keys(e).length)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}const Pt=[];function Ct(e,n=t){let r;const o=new Set;function s(t){if(c(e,t)&&(e=t,r)){const t=!Pt.length;for(const t of o)t[1](),Pt.push(t,e);if(t){for(let t=0;t<Pt.length;t+=2)Pt[t][0](Pt[t+1]);Pt.length=0}}}return{set:s,update:function(t){s(t(e))},subscribe:function(a,c=t){const i=[a,c];return o.add(i),1===o.size&&(r=n(s)||t),a(e),()=>{o.delete(i),0===o.size&&(r(),r=null)}}}}const Lt={},Nt=()=>({});function kt(e){let n,r,o,s,a,c,i,u,f,d,p,h,m,g,v,_,$,y,b,E,w,x,R,C,k,O,I,U;return{c(){n=P("nav"),r=P("div"),o=P("div"),s=P("a"),a=P("picture"),c=P("source"),i=N(),u=P("source"),f=N(),d=P("img"),h=N(),m=P("ul"),g=P("li"),v=P("a"),_=L("Bio"),$=N(),y=P("li"),b=P("a"),E=L("Design Portfolio"),w=N(),x=P("li"),R=P("a"),C=L("CV"),k=N(),O=P("li"),I=P("a"),U=L("QVFT Dashboard"),this.h()},l(t){n=T(t,"NAV",{class:!0});var e=q(n);r=T(e,"DIV",{class:!0});var l=q(r);o=T(l,"DIV",{class:!0});var p=q(o);s=T(p,"A",{href:!0,class:!0});var S=q(s);a=T(S,"PICTURE",{class:!0});var j=q(a);c=T(j,"SOURCE",{srcset:!0,type:!0,class:!0}),i=H(j),u=T(j,"SOURCE",{srcset:!0,type:!0,class:!0}),f=H(j),d=T(j,"IMG",{src:!0,alt:!0,class:!0}),j.forEach(A),S.forEach(A),p.forEach(A),h=H(l),m=T(l,"UL",{class:!0});var P=q(m);g=T(P,"LI",{class:!0});var L=q(g);v=T(L,"A",{href:!0,class:!0});var N=q(v);_=B(N,"Bio"),N.forEach(A),L.forEach(A),$=H(P),y=T(P,"LI",{class:!0});var D=q(y);b=T(D,"A",{href:!0,class:!0});var V=q(b);E=B(V,"Design Portfolio"),V.forEach(A),D.forEach(A),w=H(P),x=T(P,"LI",{class:!0});var z=q(x);R=T(z,"A",{href:!0,class:!0});var M=q(R);C=B(M,"CV"),M.forEach(A),z.forEach(A),k=H(P),O=T(P,"LI",{class:!0});var F=q(O);I=T(F,"A",{href:!0,class:!0});var J=q(I);U=B(J,"QVFT Dashboard"),J.forEach(A),F.forEach(A),P.forEach(A),l.forEach(A),e.forEach(A),this.h()},h(){D(c,"srcset","logo.webp"),D(c,"type","image/webp"),D(c,"class","svelte-1v6i5mj"),D(u,"srcset","logo.png"),D(u,"type","image/png"),D(u,"class","svelte-1v6i5mj"),l(d.src,p="logo.png")||D(d,"src","logo.png"),D(d,"alt","Patrick Singal"),D(d,"class","svelte-1v6i5mj"),D(a,"class","logo svelte-1v6i5mj"),D(s,"href","."),D(s,"class","svelte-1v6i5mj"),F(s,"selected",!e[0]),D(o,"class","logo"),D(v,"href","bio"),D(v,"class","svelte-1v6i5mj"),F(v,"selected","bio"===e[0]),D(g,"class","svelte-1v6i5mj"),D(b,"href","portfolio"),D(b,"class","svelte-1v6i5mj"),F(b,"selected","portfolio"===e[0]),D(y,"class","svelte-1v6i5mj"),D(R,"href","cv"),D(R,"class","svelte-1v6i5mj"),F(R,"selected","cv"===e[0]),D(x,"class","svelte-1v6i5mj"),D(I,"href","dashboard"),D(I,"class","svelte-1v6i5mj"),F(I,"selected","dashboard"===e[0]),D(O,"class","svelte-1v6i5mj"),D(m,"class","svelte-1v6i5mj"),D(r,"class","contentWrapper svelte-1v6i5mj"),D(n,"class","svelte-1v6i5mj")},m(t,e){j(t,n,e),S(n,r),S(r,o),S(o,s),S(s,a),S(a,c),S(a,i),S(a,u),S(a,f),S(a,d),S(r,h),S(r,m),S(m,g),S(g,v),S(v,_),S(m,$),S(m,y),S(y,b),S(b,E),S(m,w),S(m,x),S(x,R),S(R,C),S(m,k),S(m,O),S(O,I),S(I,U)},p(t,[e]){1&e&&F(s,"selected",!t[0]),1&e&&F(v,"selected","bio"===t[0]),1&e&&F(b,"selected","portfolio"===t[0]),1&e&&F(R,"selected","cv"===t[0]),1&e&&F(I,"selected","dashboard"===t[0])},i:t,o:t,d(t){t&&A(n)}}}function Ot(t,e,n){let{segment:r}=e;return t.$$set=t=>{"segment"in t&&n(0,r=t.segment)},[r]}class Dt extends Rt{constructor(t){super(),At(this,t,Ot,kt,c,{segment:0})}}function qt(t){let e,n,r,o;e=new Dt({props:{segment:t[0]}});const s=t[2].default,a=u(s,t,t[1],null);return{c(){Et(e.$$.fragment),n=N(),r=P("main"),a&&a.c(),this.h()},l(t){wt(e.$$.fragment,t),n=H(t),r=T(t,"MAIN",{class:!0});var o=q(r);a&&a.l(o),o.forEach(A),this.h()},h(){D(r,"class","svelte-1rror3p")},m(t,s){xt(e,t,s),j(t,n,s),j(t,r,s),a&&a.m(r,null),o=!0},p(t,[n]){const r={};1&n&&(r.segment=t[0]),e.$set(r),a&&a.p&&(!o||2&n)&&p(a,s,t,t[1],o?d(s,t[1],n,null):h(t[1]),null)},i(t){o||(gt(e.$$.fragment,t),gt(a,t),o=!0)},o(t){vt(e.$$.fragment,t),vt(a,t),o=!1},d(t){St(e,t),t&&A(n),t&&A(r),a&&a.d(t)}}}function It(t,e,n){let{$$slots:r={},$$scope:o}=e,{segment:s}=e;return t.$$set=t=>{"segment"in t&&n(0,s=t.segment),"$$scope"in t&&n(1,o=t.$$scope)},[s,o,r]}class Ut extends Rt{constructor(t){super(),At(this,t,It,qt,c,{segment:0})}}function Tt(t){let e,n,r=t[1].stack+"";return{c(){e=P("pre"),n=L(r)},l(t){e=T(t,"PRE",{});var o=q(e);n=B(o,r),o.forEach(A)},m(t,r){j(t,e,r),S(e,n)},p(t,e){2&e&&r!==(r=t[1].stack+"")&&z(n,r)},d(t){t&&A(e)}}}function Vt(e){let n,r,o,s,a,c,i,l,u,f=e[1].message+"";document.title=n=e[0];let d=e[2]&&e[1].stack&&Tt(e);return{c(){r=N(),o=P("h1"),s=L(e[0]),a=N(),c=P("p"),i=L(f),l=N(),d&&d.c(),u=k()},l(t){J('[data-svelte="svelte-1moakz"]',document.head).forEach(A),r=H(t),o=T(t,"H1",{});var n=q(o);s=B(n,e[0]),n.forEach(A),a=H(t),c=T(t,"P",{});var p=q(c);i=B(p,f),p.forEach(A),l=H(t),d&&d.l(t),u=k()},m(t,e){j(t,r,e),j(t,o,e),S(o,s),j(t,a,e),j(t,c,e),S(c,i),j(t,l,e),d&&d.m(t,e),j(t,u,e)},p(t,[e]){1&e&&n!==(n=t[0])&&(document.title=n),1&e&&z(s,t[0]),2&e&&f!==(f=t[1].message+"")&&z(i,f),t[2]&&t[1].stack?d?d.p(t,e):(d=Tt(t),d.c(),d.m(u.parentNode,u)):d&&(d.d(1),d=null)},i:t,o:t,d(t){t&&A(r),t&&A(o),t&&A(a),t&&A(c),t&&A(l),d&&d.d(t),t&&A(u)}}}function Bt(t,e,n){let{status:r}=e,{error:o}=e;return t.$$set=t=>{"status"in t&&n(0,r=t.status),"error"in t&&n(1,o=t.error)},[r,o,!1]}class Ht extends Rt{constructor(t){super(),At(this,t,Bt,Vt,c,{status:0,error:1})}}function zt(t){let e,r,o;const s=[t[4].props];var a=t[4].component;function c(t){let e={};for(let t=0;t<s.length;t+=1)e=n(e,s[t]);return{props:e}}return a&&(e=new a(c())),{c(){e&&Et(e.$$.fragment),r=k()},l(t){e&&wt(e.$$.fragment,t),r=k()},m(t,n){e&&xt(e,t,n),j(t,r,n),o=!0},p(t,n){const o=16&n?yt(s,[bt(t[4].props)]):{};if(a!==(a=t[4].component)){if(e){ht();const t=e;vt(t.$$.fragment,1,0,()=>{St(t,1)}),mt()}a?(e=new a(c()),Et(e.$$.fragment),gt(e.$$.fragment,1),xt(e,r.parentNode,r)):e=null}else a&&e.$set(o)},i(t){o||(e&&gt(e.$$.fragment,t),o=!0)},o(t){e&&vt(e.$$.fragment,t),o=!1},d(t){t&&A(r),e&&St(e,t)}}}function Mt(t){let e,n;return e=new Ht({props:{error:t[0],status:t[1]}}),{c(){Et(e.$$.fragment)},l(t){wt(e.$$.fragment,t)},m(t,r){xt(e,t,r),n=!0},p(t,n){const r={};1&n&&(r.error=t[0]),2&n&&(r.status=t[1]),e.$set(r)},i(t){n||(gt(e.$$.fragment,t),n=!0)},o(t){vt(e.$$.fragment,t),n=!1},d(t){St(e,t)}}}function Ft(t){let e,n,r,o;const s=[Mt,zt],a=[];function c(t,e){return t[0]?0:1}return e=c(t),n=a[e]=s[e](t),{c(){n.c(),r=k()},l(t){n.l(t),r=k()},m(t,n){a[e].m(t,n),j(t,r,n),o=!0},p(t,o){let i=e;e=c(t),e===i?a[e].p(t,o):(ht(),vt(a[i],1,1,()=>{a[i]=null}),mt(),n=a[e],n?n.p(t,o):(n=a[e]=s[e](t),n.c()),gt(n,1),n.m(r.parentNode,r))},i(t){o||(gt(n),o=!0)},o(t){vt(n),o=!1},d(t){a[e].d(t),t&&A(r)}}}function Jt(t){let e,r;const o=[{segment:t[2][0]},t[3].props];let s={$$slots:{default:[Ft]},$$scope:{ctx:t}};for(let t=0;t<o.length;t+=1)s=n(s,o[t]);return e=new Ut({props:s}),{c(){Et(e.$$.fragment)},l(t){wt(e.$$.fragment,t)},m(t,n){xt(e,t,n),r=!0},p(t,[n]){const r=12&n?yt(o,[4&n&&{segment:t[2][0]},8&n&&bt(t[3].props)]):{};147&n&&(r.$$scope={dirty:n,ctx:t}),e.$set(r)},i(t){r||(gt(e.$$.fragment,t),r=!0)},o(t){vt(e.$$.fragment,t),r=!1},d(t){St(e,t)}}}function Kt(t,e,n){let{stores:r}=e,{error:o}=e,{status:s}=e,{segments:a}=e,{level0:c}=e,{level1:i=null}=e,{notify:l}=e;var u,f,d;return u=l,X().$$.after_update.push(u),f=Lt,d=r,X().$$.context.set(f,d),t.$$set=t=>{"stores"in t&&n(5,r=t.stores),"error"in t&&n(0,o=t.error),"status"in t&&n(1,s=t.status),"segments"in t&&n(2,a=t.segments),"level0"in t&&n(3,c=t.level0),"level1"in t&&n(4,i=t.level1),"notify"in t&&n(6,l=t.notify)},[o,s,a,c,i,r,l]}class Gt extends Rt{constructor(t){super(),At(this,t,Kt,Jt,c,{stores:5,error:0,status:1,segments:2,level0:3,level1:4,notify:6})}}const Wt=[/^\/index\.json$/],Qt=[{js:()=>import("./index.effe996e.js"),css:["index.effe996e.css","client.af9daccf.css"]},{js:()=>import("./dashboard.7d00d124.js"),css:["dashboard.7d00d124.css","client.af9daccf.css","PageHeader.8b4fd32e.css"]},{js:()=>import("./portfolio.d50afd35.js"),css:["portfolio.d50afd35.css","client.af9daccf.css","PageHeader.8b4fd32e.css"]},{js:()=>import("./bio.d84dcb45.js"),css:["client.af9daccf.css","PageHeader.8b4fd32e.css"]},{js:()=>import("./cv.c620b913.js"),css:["cv.c620b913.css","client.af9daccf.css","PageHeader.8b4fd32e.css"]}],Yt=[{pattern:/^\/$/,parts:[{i:0}]},{pattern:/^\/dashboard\/?$/,parts:[{i:1}]},{pattern:/^\/portfolio\/?$/,parts:[{i:2}]},{pattern:/^\/bio\/?$/,parts:[{i:3}]},{pattern:/^\/cv\/?$/,parts:[{i:4}]}];const Xt="undefined"!=typeof __SAPPER__&&__SAPPER__;let Zt,te,ee,ne=!1,re=[],oe="{}";const se={page:function(t){const e=Ct(t);let n=!0;return{notify:function(){n=!0,e.update(t=>t)},set:function(t){n=!1,e.set(t)},subscribe:function(t){let r;return e.subscribe(e=>{(void 0===r||n&&e!==r)&&t(r=e)})}}}({}),preloading:Ct(null),session:Ct(Xt&&Xt.session)};let ae,ce;se.session.subscribe(async t=>{if(ae=t,!ne)return;ce=!0;const e=me(new URL(location.href)),n=te={},{redirect:r,props:o,branch:s}=await $e(e);n===te&&await _e(r,s,o,e.page)});let ie,le=null;let ue,fe=1;const de="undefined"!=typeof history?history:{pushState:(t,e,n)=>{},replaceState:(t,e,n)=>{},scrollRestoration:""},pe={};function he(t){const e=Object.create(null);return t.length>0&&t.slice(1).split("&").forEach(t=>{let[,n,r=""]=/([^=]*)(?:=(.*))?/.exec(decodeURIComponent(t.replace(/\+/g," ")));"string"==typeof e[n]&&(e[n]=[e[n]]),"object"==typeof e[n]?e[n].push(r):e[n]=r}),e}function me(t){if(t.origin!==location.origin)return null;if(!t.pathname.startsWith(Xt.baseUrl))return null;let e=t.pathname.slice(Xt.baseUrl.length);if(""===e&&(e="/"),!Wt.some(t=>t.test(e)))for(let n=0;n<Yt.length;n+=1){const r=Yt[n],o=r.pattern.exec(e);if(o){const n=he(t.search),s=r.parts[r.parts.length-1],a=s.params?s.params(o):{},c={host:location.host,path:e,query:n,params:a};return{href:t.href,route:r,match:o,page:c}}}}function ge(){return{x:pageXOffset,y:pageYOffset}}async function ve(t,e,n,r){if(e)ue=e;else{const t=ge();pe[ue]=t,e=ue=++fe,pe[ue]=n?t:{x:0,y:0}}ue=e,Zt&&se.preloading.set(!0);const o=le&&le.href===t.href?le.promise:$e(t);le=null;const s=te={},{redirect:a,props:c,branch:i}=await o;if(s===te&&(await _e(a,i,c,t.page),document.activeElement&&document.activeElement.blur(),!n)){let t=pe[e];if(r){const e=document.getElementById(r.slice(1));e&&(t={x:0,y:e.getBoundingClientRect().top+scrollY})}pe[ue]=t,t&&scrollTo(t.x,t.y)}}async function _e(t,e,n,r){if(t)return function(t,e={replaceState:!1}){const n=me(new URL(t,document.baseURI));return n?(de[e.replaceState?"replaceState":"pushState"]({id:ue},"",t),ve(n,null).then(()=>{})):(location.href=t,new Promise(t=>{}))}(t.location,{replaceState:!0});if(se.page.set(r),se.preloading.set(!1),Zt)Zt.$set(n);else{n.stores={page:{subscribe:se.page.subscribe},preloading:{subscribe:se.preloading.subscribe},session:se.session},n.level0={props:await ee},n.notify=se.page.notify;const t=document.querySelector("#sapper-head-start"),e=document.querySelector("#sapper-head-end");if(t&&e){for(;t.nextSibling!==e;)be(t.nextSibling);be(t),be(e)}Zt=new Gt({target:ie,props:n,hydrate:!0})}re=e,oe=JSON.stringify(r.query),ne=!0,ce=!1}async function $e(t){const{route:e,page:n}=t,r=n.path.split("/").filter(Boolean);let o=null;const s={error:null,status:200,segments:[r[0]]},a={fetch:(t,e)=>fetch(t,e),redirect:(t,e)=>{if(o&&(o.statusCode!==t||o.location!==e))throw new Error("Conflicting redirects");o={statusCode:t,location:e}},error:(t,e)=>{s.error="string"==typeof e?new Error(e):e,s.status=t}};let c;ee||(ee=Xt.preloaded[0]||Nt.call(a,{host:n.host,path:n.path,query:n.query,params:{}},ae));let i=1;try{const o=JSON.stringify(n.query),l=e.pattern.exec(n.path);let u=!1;c=await Promise.all(e.parts.map(async(e,c)=>{const f=r[c];if(function(t,e,n,r){if(r!==oe)return!0;const o=re[t];return!!o&&(e!==o.segment||(!(!o.match||JSON.stringify(o.match.slice(1,t+2))===JSON.stringify(n.slice(1,t+2)))||void 0))}(c,f,l,o)&&(u=!0),s.segments[i]=r[c+1],!e)return{segment:f};const d=i++;if(!ce&&!u&&re[c]&&re[c].part===e.i)return re[c];u=!1;const{default:p,preload:h}=await function(t){const e="string"==typeof t.css?[]:t.css.map(ye);return e.unshift(t.js()),Promise.all(e).then(t=>t[0])}(Qt[e.i]);let m;return m=ne||!Xt.preloaded[c+1]?h?await h.call(a,{host:n.host,path:n.path,query:n.query,params:e.params?e.params(t.match):{}},ae):{}:Xt.preloaded[c+1],s["level"+d]={component:p,props:m,segment:f,match:l,part:e.i}}))}catch(t){s.error=t,s.status=500,c=[]}return{redirect:o,props:s,branch:c}}function ye(t){const e="client/"+t;if(!document.querySelector(`link[href="${e}"]`))return new Promise((t,n)=>{const r=document.createElement("link");r.rel="stylesheet",r.href=e,r.onload=()=>t(),r.onerror=n,document.head.appendChild(r)})}function be(t){t.parentNode.removeChild(t)}function Ee(t){const e=me(new URL(t,document.baseURI));if(e)return le&&t===le.href||function(t,e){le={href:t,promise:e}}(t,$e(e)),le.promise}let we;function xe(t){clearTimeout(we),we=setTimeout(()=>{Se(t)},20)}function Se(t){const e=Ae(t.target);e&&"prefetch"===e.rel&&Ee(e.href)}function je(t){if(1!==function(t){return null===t.which?t.button:t.which}(t))return;if(t.metaKey||t.ctrlKey||t.shiftKey)return;if(t.defaultPrevented)return;const e=Ae(t.target);if(!e)return;if(!e.href)return;const n="object"==typeof e.href&&"SVGAnimatedString"===e.href.constructor.name,r=String(n?e.href.baseVal:e.href);if(r===location.href)return void(location.hash||t.preventDefault());if(e.hasAttribute("download")||"external"===e.getAttribute("rel"))return;if(n?e.target.baseVal:e.target)return;const o=new URL(r);if(o.pathname===location.pathname&&o.search===location.search)return;const s=me(o);if(s){ve(s,null,e.hasAttribute("sapper-noscroll"),o.hash),t.preventDefault(),de.pushState({id:ue},"",o.href)}}function Ae(t){for(;t&&"A"!==t.nodeName.toUpperCase();)t=t.parentNode;return t}function Re(t){if(pe[ue]=ge(),t.state){const e=me(new URL(location.href));e?ve(e,t.state.id):location.href=location.href}else fe=fe+1,function(t){ue=t}(fe),de.replaceState({id:ue},"",location.href)}var Pe;Pe={target:document.querySelector("#sapper")},"scrollRestoration"in de&&(de.scrollRestoration="manual"),addEventListener("beforeunload",()=>{de.scrollRestoration="auto"}),addEventListener("load",()=>{de.scrollRestoration="manual"}),function(t){ie=t}(Pe.target),addEventListener("click",je),addEventListener("popstate",Re),addEventListener("touchstart",Se),addEventListener("mousemove",xe),Promise.resolve().then(()=>{const{hash:t,href:e}=location;de.replaceState({id:fe},"",e);const n=new URL(location.href);if(Xt.error)return function(t){const{host:e,pathname:n,search:r}=location,{session:o,preloaded:s,status:a,error:c}=Xt;ee||(ee=s&&s[0]),_e(null,[],{error:c,status:a,session:o,level0:{props:ee},level1:{props:{status:a,error:c},component:Ht},segments:s},{host:e,path:n,query:he(r),params:{}})}();const r=me(n);return r?ve(r,fe,!0,t):void 0});export{z as A,k as B,n as C,Et as D,wt as E,xt as F,yt as G,bt as H,St as I,m as J,O as K,ht as L,mt as M,st as N,$t as O,R as P,Rt as S,N as a,T as b,H as c,A as d,P as e,q as f,B as g,D as h,At as i,l as j,M as k,j as l,S as m,t as n,u as o,h as p,J as q,d as r,c as s,L as t,p as u,gt as v,vt as w,e as x,C as y,V as z};
