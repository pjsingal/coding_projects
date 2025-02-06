function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function add_location(element, file, line, column, char) {
    element.__svelte_meta = {
        loc: { file, line, column, char }
    };
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
let src_url_equal_anchor;
function src_url_equal(element_src, url) {
    if (!src_url_equal_anchor) {
        src_url_equal_anchor = document.createElement('a');
    }
    src_url_equal_anchor.href = url;
    return element_src === src_url_equal_anchor.href;
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
        const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
        return definition[0](slot_ctx);
    }
}
function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn
        ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
        : $$scope.ctx;
}
function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
        const lets = definition[2](fn(dirty));
        if ($$scope.dirty === undefined) {
            return lets;
        }
        if (typeof lets === 'object') {
            const merged = [];
            const len = Math.max($$scope.dirty.length, lets.length);
            for (let i = 0; i < len; i += 1) {
                merged[i] = $$scope.dirty[i] | lets[i];
            }
            return merged;
        }
        return $$scope.dirty | lets;
    }
    return $$scope.dirty;
}
function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
        const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
        slot.p(slot_context, slot_changes);
    }
}
function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
        const dirty = [];
        const length = $$scope.ctx.length / 32;
        for (let i = 0; i < length; i++) {
            dirty[i] = -1;
        }
        return dirty;
    }
    return -1;
}
function exclude_internal_props(props) {
    const result = {};
    for (const k in props)
        if (k[0] !== '$')
            result[k] = props[k];
    return result;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

// Track which nodes are claimed during hydration. Unclaimed nodes can then be removed from the DOM
// at the end of hydration without touching the remaining nodes.
let is_hydrating = false;
function start_hydrating() {
    is_hydrating = true;
}
function end_hydrating() {
    is_hydrating = false;
}
function upper_bound(low, high, key, value) {
    // Return first index of value larger than input value in the range [low, high)
    while (low < high) {
        const mid = low + ((high - low) >> 1);
        if (key(mid) <= value) {
            low = mid + 1;
        }
        else {
            high = mid;
        }
    }
    return low;
}
function init_hydrate(target) {
    if (target.hydrate_init)
        return;
    target.hydrate_init = true;
    // We know that all children have claim_order values since the unclaimed have been detached if target is not <head>
    let children = target.childNodes;
    // If target is <head>, there may be children without claim_order
    if (target.nodeName === 'HEAD') {
        const myChildren = [];
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            if (node.claim_order !== undefined) {
                myChildren.push(node);
            }
        }
        children = myChildren;
    }
    /*
    * Reorder claimed children optimally.
    * We can reorder claimed children optimally by finding the longest subsequence of
    * nodes that are already claimed in order and only moving the rest. The longest
    * subsequence subsequence of nodes that are claimed in order can be found by
    * computing the longest increasing subsequence of .claim_order values.
    *
    * This algorithm is optimal in generating the least amount of reorder operations
    * possible.
    *
    * Proof:
    * We know that, given a set of reordering operations, the nodes that do not move
    * always form an increasing subsequence, since they do not move among each other
    * meaning that they must be already ordered among each other. Thus, the maximal
    * set of nodes that do not move form a longest increasing subsequence.
    */
    // Compute longest increasing subsequence
    // m: subsequence length j => index k of smallest value that ends an increasing subsequence of length j
    const m = new Int32Array(children.length + 1);
    // Predecessor indices + 1
    const p = new Int32Array(children.length);
    m[0] = -1;
    let longest = 0;
    for (let i = 0; i < children.length; i++) {
        const current = children[i].claim_order;
        // Find the largest subsequence length such that it ends in a value less than our current value
        // upper_bound returns first greater value, so we subtract one
        // with fast path for when we are on the current longest subsequence
        const seqLen = ((longest > 0 && children[m[longest]].claim_order <= current) ? longest + 1 : upper_bound(1, longest, idx => children[m[idx]].claim_order, current)) - 1;
        p[i] = m[seqLen] + 1;
        const newLen = seqLen + 1;
        // We can guarantee that current is the smallest value. Otherwise, we would have generated a longer sequence.
        m[newLen] = i;
        longest = Math.max(newLen, longest);
    }
    // The longest increasing subsequence of nodes (initially reversed)
    const lis = [];
    // The rest of the nodes, nodes that will be moved
    const toMove = [];
    let last = children.length - 1;
    for (let cur = m[longest] + 1; cur != 0; cur = p[cur - 1]) {
        lis.push(children[cur - 1]);
        for (; last >= cur; last--) {
            toMove.push(children[last]);
        }
        last--;
    }
    for (; last >= 0; last--) {
        toMove.push(children[last]);
    }
    lis.reverse();
    // We sort the nodes being moved to guarantee that their insertion order matches the claim order
    toMove.sort((a, b) => a.claim_order - b.claim_order);
    // Finally, we move the nodes
    for (let i = 0, j = 0; i < toMove.length; i++) {
        while (j < lis.length && toMove[i].claim_order >= lis[j].claim_order) {
            j++;
        }
        const anchor = j < lis.length ? lis[j] : null;
        target.insertBefore(toMove[i], anchor);
    }
}
function append(target, node) {
    target.appendChild(node);
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_empty_stylesheet(node) {
    const style_element = element('style');
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
}
function append_hydration(target, node) {
    if (is_hydrating) {
        init_hydrate(target);
        if ((target.actual_end_child === undefined) || ((target.actual_end_child !== null) && (target.actual_end_child.parentElement !== target))) {
            target.actual_end_child = target.firstChild;
        }
        // Skip nodes of undefined ordering
        while ((target.actual_end_child !== null) && (target.actual_end_child.claim_order === undefined)) {
            target.actual_end_child = target.actual_end_child.nextSibling;
        }
        if (node !== target.actual_end_child) {
            // We only insert if the ordering of this node should be modified or the parent node is not target
            if (node.claim_order !== undefined || node.parentNode !== target) {
                target.insertBefore(node, target.actual_end_child);
            }
        }
        else {
            target.actual_end_child = node.nextSibling;
        }
    }
    else if (node.parentNode !== target || node.nextSibling !== null) {
        target.appendChild(node);
    }
}
function insert_hydration(target, node, anchor) {
    if (is_hydrating && !anchor) {
        append_hydration(target, node);
    }
    else if (node.parentNode !== target || node.nextSibling != anchor) {
        target.insertBefore(node, anchor || null);
    }
}
function detach(node) {
    node.parentNode.removeChild(node);
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function init_claim_info(nodes) {
    if (nodes.claim_info === undefined) {
        nodes.claim_info = { last_index: 0, total_claimed: 0 };
    }
}
function claim_node(nodes, predicate, processNode, createNode, dontUpdateLastIndex = false) {
    // Try to find nodes in an order such that we lengthen the longest increasing subsequence
    init_claim_info(nodes);
    const resultNode = (() => {
        // We first try to find an element after the previous one
        for (let i = nodes.claim_info.last_index; i < nodes.length; i++) {
            const node = nodes[i];
            if (predicate(node)) {
                const replacement = processNode(node);
                if (replacement === undefined) {
                    nodes.splice(i, 1);
                }
                else {
                    nodes[i] = replacement;
                }
                if (!dontUpdateLastIndex) {
                    nodes.claim_info.last_index = i;
                }
                return node;
            }
        }
        // Otherwise, we try to find one before
        // We iterate in reverse so that we don't go too far back
        for (let i = nodes.claim_info.last_index - 1; i >= 0; i--) {
            const node = nodes[i];
            if (predicate(node)) {
                const replacement = processNode(node);
                if (replacement === undefined) {
                    nodes.splice(i, 1);
                }
                else {
                    nodes[i] = replacement;
                }
                if (!dontUpdateLastIndex) {
                    nodes.claim_info.last_index = i;
                }
                else if (replacement === undefined) {
                    // Since we spliced before the last_index, we decrease it
                    nodes.claim_info.last_index--;
                }
                return node;
            }
        }
        // If we can't find any matching node, we create a new one
        return createNode();
    })();
    resultNode.claim_order = nodes.claim_info.total_claimed;
    nodes.claim_info.total_claimed += 1;
    return resultNode;
}
function claim_element_base(nodes, name, attributes, create_element) {
    return claim_node(nodes, (node) => node.nodeName === name, (node) => {
        const remove = [];
        for (let j = 0; j < node.attributes.length; j++) {
            const attribute = node.attributes[j];
            if (!attributes[attribute.name]) {
                remove.push(attribute.name);
            }
        }
        remove.forEach(v => node.removeAttribute(v));
        return undefined;
    }, () => create_element(name));
}
function claim_element(nodes, name, attributes) {
    return claim_element_base(nodes, name, attributes, element);
}
function claim_svg_element(nodes, name, attributes) {
    return claim_element_base(nodes, name, attributes, svg_element);
}
function claim_text(nodes, data) {
    return claim_node(nodes, (node) => node.nodeType === 3, (node) => {
        const dataStr = '' + data;
        if (node.data.startsWith(dataStr)) {
            if (node.data.length !== dataStr.length) {
                return node.splitText(dataStr.length);
            }
        }
        else {
            node.data = dataStr;
        }
    }, () => text(data), true // Text nodes should not update last index since it is likely not worth it to eliminate an increasing subsequence of actual elements
    );
}
function claim_space(nodes) {
    return claim_text(nodes, ' ');
}
function set_style(node, key, value, important) {
    node.style.setProperty(key, value, important ? 'important' : '');
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, bubbles = false) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, false, detail);
    return e;
}
function query_selector_all(selector, parent = document.body) {
    return Array.from(parent.querySelectorAll(selector));
}

const active_docs = new Set();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    active_docs.add(doc);
    const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
    const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
    if (!current_rules[name]) {
        current_rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        active_docs.forEach(doc => {
            const stylesheet = doc.__svelte_stylesheet;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            doc.__svelte_rules = {};
        });
        active_docs.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function afterUpdate(fn) {
    get_current_component().$$.after_update.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}

const dirty_components = [];
const binding_callbacks = [];
const render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        while (flushidx < dirty_components.length) {
            const component = dirty_components[flushidx];
            flushidx++;
            set_current_component(component);
            update(component.$$);
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
}
const null_transition = { duration: 0 };
function create_in_transition(node, fn, params) {
    let config = fn(node, params);
    let running = false;
    let animation_name;
    let task;
    let uid = 0;
    function cleanup() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function go() {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        if (css)
            animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
        tick(0, 1);
        const start_time = now() + delay;
        const end_time = start_time + duration;
        if (task)
            task.abort();
        running = true;
        add_render_callback(() => dispatch(node, true, 'start'));
        task = loop(now => {
            if (running) {
                if (now >= end_time) {
                    tick(1, 0);
                    dispatch(node, true, 'end');
                    cleanup();
                    return running = false;
                }
                if (now >= start_time) {
                    const t = easing((now - start_time) / duration);
                    tick(t, 1 - t);
                }
            }
            return running;
        });
    }
    let started = false;
    return {
        start() {
            if (started)
                return;
            started = true;
            delete_rule(node);
            if (is_function(config)) {
                config = config();
                wait().then(go);
            }
            else {
                go();
            }
        },
        invalidate() {
            started = false;
        },
        end() {
            if (running) {
                cleanup();
                running = false;
            }
        }
    };
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
function create_component(block) {
    block && block.c();
}
function claim_component(block, parent_nodes) {
    block && block.l(parent_nodes);
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, on_mount, on_destroy, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: null,
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            start_hydrating();
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        end_hydrating();
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

function dispatch_dev(type, detail) {
    document.dispatchEvent(custom_event(type, Object.assign({ version: '3.45.0' }, detail), true));
}
function append_hydration_dev(target, node) {
    dispatch_dev('SvelteDOMInsert', { target, node });
    append_hydration(target, node);
}
function insert_hydration_dev(target, node, anchor) {
    dispatch_dev('SvelteDOMInsert', { target, node, anchor });
    insert_hydration(target, node, anchor);
}
function detach_dev(node) {
    dispatch_dev('SvelteDOMRemove', { node });
    detach(node);
}
function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
    const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
    if (has_prevent_default)
        modifiers.push('preventDefault');
    if (has_stop_propagation)
        modifiers.push('stopPropagation');
    dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
    const dispose = listen(node, event, handler, options);
    return () => {
        dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
        dispose();
    };
}
function attr_dev(node, attribute, value) {
    attr(node, attribute, value);
    if (value == null)
        dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
    else
        dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
}
function set_data_dev(text, data) {
    data = '' + data;
    if (text.wholeText === data)
        return;
    dispatch_dev('SvelteDOMSetData', { node: text, data });
    text.data = data;
}
function validate_each_argument(arg) {
    if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
        let msg = '{#each} only iterates over array-like objects.';
        if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
            msg += ' You can use a spread to convert this iterable into an array.';
        }
        throw new Error(msg);
    }
}
function validate_slots(name, slot, keys) {
    for (const slot_key of Object.keys(slot)) {
        if (!~keys.indexOf(slot_key)) {
            console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
        }
    }
}
/**
 * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
 */
class SvelteComponentDev extends SvelteComponent {
    constructor(options) {
        if (!options || (!options.target && !options.$$inline)) {
            throw new Error("'target' is a required option");
        }
        super();
    }
    $destroy() {
        super.$destroy();
        this.$destroy = () => {
            console.warn('Component was already destroyed'); // eslint-disable-line no-console
        };
    }
    $capture_state() { }
    $inject_state() { }
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const CONTEXT_KEY = {};

const preload = () => ({});

/* src/components/Nav.svelte generated by Svelte v3.45.0 */

const file = "src/components/Nav.svelte";

function create_fragment(ctx) {
	let nav;
	let div1;
	let div0;
	let a0;
	let picture;
	let source0;
	let t0;
	let source1;
	let t1;
	let img;
	let img_src_value;
	let t2;
	let ul;
	let li0;
	let a1;
	let t3;
	let t4;
	let li1;
	let a2;
	let t5;
	let t6;
	let li2;
	let a3;
	let t7;
	let t8;
	let li3;
	let a4;
	let t9;

	const block = {
		c: function create() {
			nav = element("nav");
			div1 = element("div");
			div0 = element("div");
			a0 = element("a");
			picture = element("picture");
			source0 = element("source");
			t0 = space();
			source1 = element("source");
			t1 = space();
			img = element("img");
			t2 = space();
			ul = element("ul");
			li0 = element("li");
			a1 = element("a");
			t3 = text("CV");
			t4 = space();
			li1 = element("li");
			a2 = element("a");
			t5 = text("Projects");
			t6 = space();
			li2 = element("li");
			a3 = element("a");
			t7 = text("QVFT");
			t8 = space();
			li3 = element("li");
			a4 = element("a");
			t9 = text("LinkedIn");
			this.h();
		},
		l: function claim(nodes) {
			nav = claim_element(nodes, "NAV", { class: true });
			var nav_nodes = children(nav);
			div1 = claim_element(nav_nodes, "DIV", { class: true });
			var div1_nodes = children(div1);
			div0 = claim_element(div1_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);
			a0 = claim_element(div0_nodes, "A", { href: true, class: true });
			var a0_nodes = children(a0);
			picture = claim_element(a0_nodes, "PICTURE", { class: true });
			var picture_nodes = children(picture);
			source0 = claim_element(picture_nodes, "SOURCE", { srcset: true, type: true, class: true });
			t0 = claim_space(picture_nodes);
			source1 = claim_element(picture_nodes, "SOURCE", { srcset: true, type: true, class: true });
			t1 = claim_space(picture_nodes);
			img = claim_element(picture_nodes, "IMG", { src: true, alt: true, class: true });
			picture_nodes.forEach(detach_dev);
			a0_nodes.forEach(detach_dev);
			div0_nodes.forEach(detach_dev);
			t2 = claim_space(div1_nodes);
			ul = claim_element(div1_nodes, "UL", { class: true });
			var ul_nodes = children(ul);
			li0 = claim_element(ul_nodes, "LI", { class: true });
			var li0_nodes = children(li0);
			a1 = claim_element(li0_nodes, "A", { href: true, class: true });
			var a1_nodes = children(a1);
			t3 = claim_text(a1_nodes, "CV");
			a1_nodes.forEach(detach_dev);
			li0_nodes.forEach(detach_dev);
			t4 = claim_space(ul_nodes);
			li1 = claim_element(ul_nodes, "LI", { class: true });
			var li1_nodes = children(li1);
			a2 = claim_element(li1_nodes, "A", { href: true, class: true });
			var a2_nodes = children(a2);
			t5 = claim_text(a2_nodes, "Projects");
			a2_nodes.forEach(detach_dev);
			li1_nodes.forEach(detach_dev);
			t6 = claim_space(ul_nodes);
			li2 = claim_element(ul_nodes, "LI", { class: true });
			var li2_nodes = children(li2);
			a3 = claim_element(li2_nodes, "A", { href: true, class: true });
			var a3_nodes = children(a3);
			t7 = claim_text(a3_nodes, "QVFT");
			a3_nodes.forEach(detach_dev);
			li2_nodes.forEach(detach_dev);
			t8 = claim_space(ul_nodes);
			li3 = claim_element(ul_nodes, "LI", { class: true });
			var li3_nodes = children(li3);

			a4 = claim_element(li3_nodes, "A", {
				href: true,
				target: true,
				rel: true,
				class: true
			});

			var a4_nodes = children(a4);
			t9 = claim_text(a4_nodes, "LinkedIn");
			a4_nodes.forEach(detach_dev);
			li3_nodes.forEach(detach_dev);
			ul_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			nav_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(source0, "srcset", "logo.webp");
			attr_dev(source0, "type", "image/webp");
			attr_dev(source0, "class", "svelte-1iw7fo1");
			add_location(source0, file, 11, 10, 1097);
			attr_dev(source1, "srcset", "logo.png");
			attr_dev(source1, "type", "image/png");
			attr_dev(source1, "class", "svelte-1iw7fo1");
			add_location(source1, file, 12, 10, 1155);
			if (!src_url_equal(img.src, img_src_value = "logo.png")) attr_dev(img, "src", img_src_value);
			attr_dev(img, "alt", "Patrick Singal");
			attr_dev(img, "class", "svelte-1iw7fo1");
			add_location(img, file, 13, 10, 1211);
			attr_dev(picture, "class", "logo svelte-1iw7fo1");
			add_location(picture, file, 10, 8, 1064);
			attr_dev(a0, "href", ".");
			attr_dev(a0, "class", "svelte-1iw7fo1");
			toggle_class(a0, "selected", !/*segment*/ ctx[0]);
			add_location(a0, file, 9, 6, 1017);
			attr_dev(div0, "class", "logo");
			add_location(div0, file, 8, 4, 992);
			attr_dev(a1, "href", "cv");
			attr_dev(a1, "class", "svelte-1iw7fo1");
			toggle_class(a1, "selected", /*segment*/ ctx[0] === 'cv');
			add_location(a1, file, 19, 8, 1324);
			attr_dev(li0, "class", "svelte-1iw7fo1");
			add_location(li0, file, 18, 6, 1311);
			attr_dev(a2, "href", "projects");
			attr_dev(a2, "class", "svelte-1iw7fo1");
			toggle_class(a2, "selected", /*segment*/ ctx[0] === 'projects');
			add_location(a2, file, 24, 8, 1429);
			attr_dev(li1, "class", "svelte-1iw7fo1");
			add_location(li1, file, 23, 6, 1416);
			attr_dev(a3, "href", "qvft");
			attr_dev(a3, "class", "svelte-1iw7fo1");
			toggle_class(a3, "selected", /*segment*/ ctx[0] === 'qvft');
			add_location(a3, file, 28, 8, 1533);
			attr_dev(li2, "class", "svelte-1iw7fo1");
			add_location(li2, file, 27, 6, 1520);
			attr_dev(a4, "href", "https://www.linkedin.com/in/patricksingal");
			attr_dev(a4, "target", "_blank");
			attr_dev(a4, "rel", "noopener noreferrer");
			attr_dev(a4, "class", "svelte-1iw7fo1");
			add_location(a4, file, 33, 6, 1642);
			attr_dev(li3, "class", "svelte-1iw7fo1");
			add_location(li3, file, 32, 6, 1631);
			attr_dev(ul, "class", "svelte-1iw7fo1");
			add_location(ul, file, 17, 4, 1300);
			attr_dev(div1, "class", "contentWrapper svelte-1iw7fo1");
			add_location(div1, file, 7, 2, 959);
			attr_dev(nav, "class", "svelte-1iw7fo1");
			add_location(nav, file, 6, 0, 951);
		},
		m: function mount(target, anchor) {
			insert_hydration_dev(target, nav, anchor);
			append_hydration_dev(nav, div1);
			append_hydration_dev(div1, div0);
			append_hydration_dev(div0, a0);
			append_hydration_dev(a0, picture);
			append_hydration_dev(picture, source0);
			append_hydration_dev(picture, t0);
			append_hydration_dev(picture, source1);
			append_hydration_dev(picture, t1);
			append_hydration_dev(picture, img);
			append_hydration_dev(div1, t2);
			append_hydration_dev(div1, ul);
			append_hydration_dev(ul, li0);
			append_hydration_dev(li0, a1);
			append_hydration_dev(a1, t3);
			append_hydration_dev(ul, t4);
			append_hydration_dev(ul, li1);
			append_hydration_dev(li1, a2);
			append_hydration_dev(a2, t5);
			append_hydration_dev(ul, t6);
			append_hydration_dev(ul, li2);
			append_hydration_dev(li2, a3);
			append_hydration_dev(a3, t7);
			append_hydration_dev(ul, t8);
			append_hydration_dev(ul, li3);
			append_hydration_dev(li3, a4);
			append_hydration_dev(a4, t9);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*segment*/ 1) {
				toggle_class(a0, "selected", !/*segment*/ ctx[0]);
			}

			if (dirty & /*segment*/ 1) {
				toggle_class(a1, "selected", /*segment*/ ctx[0] === 'cv');
			}

			if (dirty & /*segment*/ 1) {
				toggle_class(a2, "selected", /*segment*/ ctx[0] === 'projects');
			}

			if (dirty & /*segment*/ 1) {
				toggle_class(a3, "selected", /*segment*/ ctx[0] === 'qvft');
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(nav);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Nav', slots, []);
	let { segment } = $$props;
	const writable_props = ['segment'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Nav> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('segment' in $$props) $$invalidate(0, segment = $$props.segment);
	};

	$$self.$capture_state = () => ({ segment });

	$$self.$inject_state = $$props => {
		if ('segment' in $$props) $$invalidate(0, segment = $$props.segment);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [segment];
}

class Nav extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, { segment: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Nav",
			options,
			id: create_fragment.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*segment*/ ctx[0] === undefined && !('segment' in props)) {
			console.warn("<Nav> was created without expected prop 'segment'");
		}
	}

	get segment() {
		throw new Error("<Nav>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set segment(value) {
		throw new Error("<Nav>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/routes/_layout.svelte generated by Svelte v3.45.0 */
const file$1 = "src/routes/_layout.svelte";

function create_fragment$1(ctx) {
	let nav;
	let t;
	let main;
	let current;

	nav = new Nav({
			props: { segment: /*segment*/ ctx[0] },
			$$inline: true
		});

	const default_slot_template = /*#slots*/ ctx[2].default;
	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

	const block = {
		c: function create() {
			create_component(nav.$$.fragment);
			t = space();
			main = element("main");
			if (default_slot) default_slot.c();
			this.h();
		},
		l: function claim(nodes) {
			claim_component(nav.$$.fragment, nodes);
			t = claim_space(nodes);
			main = claim_element(nodes, "MAIN", { class: true });
			var main_nodes = children(main);
			if (default_slot) default_slot.l(main_nodes);
			main_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			attr_dev(main, "class", "svelte-1rror3p");
			add_location(main, file$1, 9, 0, 148);
		},
		m: function mount(target, anchor) {
			mount_component(nav, target, anchor);
			insert_hydration_dev(target, t, anchor);
			insert_hydration_dev(target, main, anchor);

			if (default_slot) {
				default_slot.m(main, null);
			}

			current = true;
		},
		p: function update(ctx, [dirty]) {
			const nav_changes = {};
			if (dirty & /*segment*/ 1) nav_changes.segment = /*segment*/ ctx[0];
			nav.$set(nav_changes);

			if (default_slot) {
				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
					update_slot_base(
						default_slot,
						default_slot_template,
						ctx,
						/*$$scope*/ ctx[1],
						!current
						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
						null
					);
				}
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(nav.$$.fragment, local);
			transition_in(default_slot, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(nav.$$.fragment, local);
			transition_out(default_slot, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(nav, detaching);
			if (detaching) detach_dev(t);
			if (detaching) detach_dev(main);
			if (default_slot) default_slot.d(detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$1.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$1($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Layout', slots, ['default']);
	let { segment } = $$props;
	const writable_props = ['segment'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Layout> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('segment' in $$props) $$invalidate(0, segment = $$props.segment);
		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
	};

	$$self.$capture_state = () => ({ Nav, segment });

	$$self.$inject_state = $$props => {
		if ('segment' in $$props) $$invalidate(0, segment = $$props.segment);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [segment, $$scope, slots];
}

class Layout extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { segment: 0 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Layout",
			options,
			id: create_fragment$1.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*segment*/ ctx[0] === undefined && !('segment' in props)) {
			console.warn("<Layout> was created without expected prop 'segment'");
		}
	}

	get segment() {
		throw new Error("<Layout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set segment(value) {
		throw new Error("<Layout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/routes/_error.svelte generated by Svelte v3.45.0 */

const { Error: Error_1 } = globals;
const file$2 = "src/routes/_error.svelte";

// (16:0) {#if dev && error.stack}
function create_if_block(ctx) {
	let pre;
	let t_value = /*error*/ ctx[1].stack + "";
	let t;

	const block = {
		c: function create() {
			pre = element("pre");
			t = text(t_value);
			this.h();
		},
		l: function claim(nodes) {
			pre = claim_element(nodes, "PRE", {});
			var pre_nodes = children(pre);
			t = claim_text(pre_nodes, t_value);
			pre_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			add_location(pre, file$2, 16, 2, 235);
		},
		m: function mount(target, anchor) {
			insert_hydration_dev(target, pre, anchor);
			append_hydration_dev(pre, t);
		},
		p: function update(ctx, dirty) {
			if (dirty & /*error*/ 2 && t_value !== (t_value = /*error*/ ctx[1].stack + "")) set_data_dev(t, t_value);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(pre);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block.name,
		type: "if",
		source: "(16:0) {#if dev && error.stack}",
		ctx
	});

	return block;
}

function create_fragment$2(ctx) {
	let title_value;
	let t0;
	let h1;
	let t1;
	let t2;
	let p;
	let t3_value = /*error*/ ctx[1].message + "";
	let t3;
	let t4;
	let if_block_anchor;
	document.title = title_value = /*status*/ ctx[0];
	let if_block = /*dev*/ ctx[2] && /*error*/ ctx[1].stack && create_if_block(ctx);

	const block = {
		c: function create() {
			t0 = space();
			h1 = element("h1");
			t1 = text(/*status*/ ctx[0]);
			t2 = space();
			p = element("p");
			t3 = text(t3_value);
			t4 = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			this.h();
		},
		l: function claim(nodes) {
			const head_nodes = query_selector_all('[data-svelte=\"svelte-1moakz\"]', document.head);
			head_nodes.forEach(detach_dev);
			t0 = claim_space(nodes);
			h1 = claim_element(nodes, "H1", {});
			var h1_nodes = children(h1);
			t1 = claim_text(h1_nodes, /*status*/ ctx[0]);
			h1_nodes.forEach(detach_dev);
			t2 = claim_space(nodes);
			p = claim_element(nodes, "P", {});
			var p_nodes = children(p);
			t3 = claim_text(p_nodes, t3_value);
			p_nodes.forEach(detach_dev);
			t4 = claim_space(nodes);
			if (if_block) if_block.l(nodes);
			if_block_anchor = empty();
			this.h();
		},
		h: function hydrate() {
			add_location(h1, file$2, 11, 0, 165);
			add_location(p, file$2, 13, 0, 184);
		},
		m: function mount(target, anchor) {
			insert_hydration_dev(target, t0, anchor);
			insert_hydration_dev(target, h1, anchor);
			append_hydration_dev(h1, t1);
			insert_hydration_dev(target, t2, anchor);
			insert_hydration_dev(target, p, anchor);
			append_hydration_dev(p, t3);
			insert_hydration_dev(target, t4, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_hydration_dev(target, if_block_anchor, anchor);
		},
		p: function update(ctx, [dirty]) {
			if (dirty & /*status*/ 1 && title_value !== (title_value = /*status*/ ctx[0])) {
				document.title = title_value;
			}

			if (dirty & /*status*/ 1) set_data_dev(t1, /*status*/ ctx[0]);
			if (dirty & /*error*/ 2 && t3_value !== (t3_value = /*error*/ ctx[1].message + "")) set_data_dev(t3, t3_value);

			if (/*dev*/ ctx[2] && /*error*/ ctx[1].stack) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d: function destroy(detaching) {
			if (detaching) detach_dev(t0);
			if (detaching) detach_dev(h1);
			if (detaching) detach_dev(t2);
			if (detaching) detach_dev(p);
			if (detaching) detach_dev(t4);
			if (if_block) if_block.d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$2.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$2($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('Error', slots, []);
	let { status } = $$props;
	let { error } = $$props;
	const dev = "development" === "development";
	const writable_props = ['status', 'error'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Error> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('status' in $$props) $$invalidate(0, status = $$props.status);
		if ('error' in $$props) $$invalidate(1, error = $$props.error);
	};

	$$self.$capture_state = () => ({ status, error, dev });

	$$self.$inject_state = $$props => {
		if ('status' in $$props) $$invalidate(0, status = $$props.status);
		if ('error' in $$props) $$invalidate(1, error = $$props.error);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [status, error, dev];
}

class Error$1 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { status: 0, error: 1 });

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Error",
			options,
			id: create_fragment$2.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*status*/ ctx[0] === undefined && !('status' in props)) {
			console.warn("<Error> was created without expected prop 'status'");
		}

		if (/*error*/ ctx[1] === undefined && !('error' in props)) {
			console.warn("<Error> was created without expected prop 'error'");
		}
	}

	get status() {
		throw new Error_1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set status(value) {
		throw new Error_1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get error() {
		throw new Error_1("<Error>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set error(value) {
		throw new Error_1("<Error>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/node_modules/@sapper/internal/App.svelte generated by Svelte v3.45.0 */

const { Error: Error_1$1 } = globals;

// (23:1) {:else}
function create_else_block(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;
	const switch_instance_spread_levels = [/*level1*/ ctx[4].props];
	var switch_value = /*level1*/ ctx[4].component;

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return {
			props: switch_instance_props,
			$$inline: true
		};
	}

	if (switch_value) {
		switch_instance = new switch_value(switch_props());
	}

	const block = {
		c: function create() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		l: function claim(nodes) {
			if (switch_instance) claim_component(switch_instance.$$.fragment, nodes);
			switch_instance_anchor = empty();
		},
		m: function mount(target, anchor) {
			if (switch_instance) {
				mount_component(switch_instance, target, anchor);
			}

			insert_hydration_dev(target, switch_instance_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const switch_instance_changes = (dirty & /*level1*/ 16)
			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*level1*/ ctx[4].props)])
			: {};

			if (switch_value !== (switch_value = /*level1*/ ctx[4].component)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = new switch_value(switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i: function intro(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_else_block.name,
		type: "else",
		source: "(23:1) {:else}",
		ctx
	});

	return block;
}

// (21:1) {#if error}
function create_if_block$1(ctx) {
	let error_1;
	let current;

	error_1 = new Error$1({
			props: {
				error: /*error*/ ctx[0],
				status: /*status*/ ctx[1]
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			create_component(error_1.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(error_1.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(error_1, target, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			const error_1_changes = {};
			if (dirty & /*error*/ 1) error_1_changes.error = /*error*/ ctx[0];
			if (dirty & /*status*/ 2) error_1_changes.status = /*status*/ ctx[1];
			error_1.$set(error_1_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(error_1.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(error_1.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(error_1, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_if_block$1.name,
		type: "if",
		source: "(21:1) {#if error}",
		ctx
	});

	return block;
}

// (20:0) <Layout segment="{segments[0]}" {...level0.props}>
function create_default_slot(ctx) {
	let current_block_type_index;
	let if_block;
	let if_block_anchor;
	let current;
	const if_block_creators = [create_if_block$1, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*error*/ ctx[0]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			if_block.c();
			if_block_anchor = empty();
		},
		l: function claim(nodes) {
			if_block.l(nodes);
			if_block_anchor = empty();
		},
		m: function mount(target, anchor) {
			if_blocks[current_block_type_index].m(target, anchor);
			insert_hydration_dev(target, if_block_anchor, anchor);
			current = true;
		},
		p: function update(ctx, dirty) {
			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(if_block_anchor.parentNode, if_block_anchor);
			}
		},
		i: function intro(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o: function outro(local) {
			transition_out(if_block);
			current = false;
		},
		d: function destroy(detaching) {
			if_blocks[current_block_type_index].d(detaching);
			if (detaching) detach_dev(if_block_anchor);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(20:0) <Layout segment=\\\"{segments[0]}\\\" {...level0.props}>",
		ctx
	});

	return block;
}

function create_fragment$3(ctx) {
	let layout;
	let current;
	const layout_spread_levels = [{ segment: /*segments*/ ctx[2][0] }, /*level0*/ ctx[3].props];

	let layout_props = {
		$$slots: { default: [create_default_slot] },
		$$scope: { ctx }
	};

	for (let i = 0; i < layout_spread_levels.length; i += 1) {
		layout_props = assign(layout_props, layout_spread_levels[i]);
	}

	layout = new Layout({ props: layout_props, $$inline: true });

	const block = {
		c: function create() {
			create_component(layout.$$.fragment);
		},
		l: function claim(nodes) {
			claim_component(layout.$$.fragment, nodes);
		},
		m: function mount(target, anchor) {
			mount_component(layout, target, anchor);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const layout_changes = (dirty & /*segments, level0*/ 12)
			? get_spread_update(layout_spread_levels, [
					dirty & /*segments*/ 4 && { segment: /*segments*/ ctx[2][0] },
					dirty & /*level0*/ 8 && get_spread_object(/*level0*/ ctx[3].props)
				])
			: {};

			if (dirty & /*$$scope, error, status, level1*/ 147) {
				layout_changes.$$scope = { dirty, ctx };
			}

			layout.$set(layout_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(layout.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(layout.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			destroy_component(layout, detaching);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_fragment$3.name,
		type: "component",
		source: "",
		ctx
	});

	return block;
}

function instance$3($$self, $$props, $$invalidate) {
	let { $$slots: slots = {}, $$scope } = $$props;
	validate_slots('App', slots, []);
	let { stores } = $$props;
	let { error } = $$props;
	let { status } = $$props;
	let { segments } = $$props;
	let { level0 } = $$props;
	let { level1 = null } = $$props;
	let { notify } = $$props;
	afterUpdate(notify);
	setContext(CONTEXT_KEY, stores);
	const writable_props = ['stores', 'error', 'status', 'segments', 'level0', 'level1', 'notify'];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
	});

	$$self.$$set = $$props => {
		if ('stores' in $$props) $$invalidate(5, stores = $$props.stores);
		if ('error' in $$props) $$invalidate(0, error = $$props.error);
		if ('status' in $$props) $$invalidate(1, status = $$props.status);
		if ('segments' in $$props) $$invalidate(2, segments = $$props.segments);
		if ('level0' in $$props) $$invalidate(3, level0 = $$props.level0);
		if ('level1' in $$props) $$invalidate(4, level1 = $$props.level1);
		if ('notify' in $$props) $$invalidate(6, notify = $$props.notify);
	};

	$$self.$capture_state = () => ({
		setContext,
		afterUpdate,
		CONTEXT_KEY,
		Layout,
		Error: Error$1,
		stores,
		error,
		status,
		segments,
		level0,
		level1,
		notify
	});

	$$self.$inject_state = $$props => {
		if ('stores' in $$props) $$invalidate(5, stores = $$props.stores);
		if ('error' in $$props) $$invalidate(0, error = $$props.error);
		if ('status' in $$props) $$invalidate(1, status = $$props.status);
		if ('segments' in $$props) $$invalidate(2, segments = $$props.segments);
		if ('level0' in $$props) $$invalidate(3, level0 = $$props.level0);
		if ('level1' in $$props) $$invalidate(4, level1 = $$props.level1);
		if ('notify' in $$props) $$invalidate(6, notify = $$props.notify);
	};

	if ($$props && "$$inject" in $$props) {
		$$self.$inject_state($$props.$$inject);
	}

	return [error, status, segments, level0, level1, stores, notify];
}

class App extends SvelteComponentDev {
	constructor(options) {
		super(options);

		init(this, options, instance$3, create_fragment$3, safe_not_equal, {
			stores: 5,
			error: 0,
			status: 1,
			segments: 2,
			level0: 3,
			level1: 4,
			notify: 6
		});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "App",
			options,
			id: create_fragment$3.name
		});

		const { ctx } = this.$$;
		const props = options.props || {};

		if (/*stores*/ ctx[5] === undefined && !('stores' in props)) {
			console.warn("<App> was created without expected prop 'stores'");
		}

		if (/*error*/ ctx[0] === undefined && !('error' in props)) {
			console.warn("<App> was created without expected prop 'error'");
		}

		if (/*status*/ ctx[1] === undefined && !('status' in props)) {
			console.warn("<App> was created without expected prop 'status'");
		}

		if (/*segments*/ ctx[2] === undefined && !('segments' in props)) {
			console.warn("<App> was created without expected prop 'segments'");
		}

		if (/*level0*/ ctx[3] === undefined && !('level0' in props)) {
			console.warn("<App> was created without expected prop 'level0'");
		}

		if (/*notify*/ ctx[6] === undefined && !('notify' in props)) {
			console.warn("<App> was created without expected prop 'notify'");
		}
	}

	get stores() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set stores(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get error() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set error(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get status() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set status(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get segments() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set segments(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get level0() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set level0(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get level1() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set level1(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get notify() {
		throw new Error_1$1("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set notify(value) {
		throw new Error_1$1("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

// This file is generated by Sapper — do not edit it!

const ignore = [/^\/index\.json$/];

const components = [
	{
		js: () => import('./index.e7e64c9b.js'),
		css: ["index.e7e64c9b.css","client.e6a3ea44.css"]
	},
	{
		js: () => import('./dashboard.d3ec67a8.js'),
		css: ["dashboard.d3ec67a8.css","client.e6a3ea44.css","PageHeader.8902e324.css"]
	},
	{
		js: () => import('./projects.86d51578.js'),
		css: ["projects.86d51578.css","client.e6a3ea44.css","PageHeader.8902e324.css"]
	},
	{
		js: () => import('./qvft.bf2c95ca.js'),
		css: ["qvft.bf2c95ca.css","client.e6a3ea44.css","PageHeader.8902e324.css"]
	},
	{
		js: () => import('./cv.216c5cb4.js'),
		css: ["cv.216c5cb4.css","client.e6a3ea44.css","PageHeader.8902e324.css"]
	}
];

const routes = [
	{
		// index.svelte
		pattern: /^\/$/,
		parts: [
			{ i: 0 }
		]
	},

	{
		// dashboard.svelte
		pattern: /^\/dashboard\/?$/,
		parts: [
			{ i: 1 }
		]
	},

	{
		// projects.svelte
		pattern: /^\/projects\/?$/,
		parts: [
			{ i: 2 }
		]
	},

	{
		// qvft.svelte
		pattern: /^\/qvft\/?$/,
		parts: [
			{ i: 3 }
		]
	},

	{
		// cv.svelte
		pattern: /^\/cv\/?$/,
		parts: [
			{ i: 4 }
		]
	}
];

if (typeof window !== 'undefined') {
	import('./sapper-dev-client.1e7a4a5e.js').then(client => {
		client.connect(10000);
	});
}

function goto(href, opts = { replaceState: false }) {
	const target = select_target(new URL(href, document.baseURI));

	if (target) {
		_history[opts.replaceState ? 'replaceState' : 'pushState']({ id: cid }, '', href);
		return navigate(target, null).then(() => {});
	}

	location.href = href;
	return new Promise(f => {}); // never resolves
}

/** Callback to inform of a value updates. */



















function page_store(value) {
	const store = writable(value);
	let ready = true;

	function notify() {
		ready = true;
		store.update(val => val);
	}

	function set(new_value) {
		ready = false;
		store.set(new_value);
	}

	function subscribe(run) {
		let old_value;
		return store.subscribe((value) => {
			if (old_value === undefined || (ready && value !== old_value)) {
				run(old_value = value);
			}
		});
	}

	return { notify, set, subscribe };
}

const initial_data = typeof __SAPPER__ !== 'undefined' && __SAPPER__;

let ready = false;
let root_component;
let current_token;
let root_preloaded;
let current_branch = [];
let current_query = '{}';

const stores = {
	page: page_store({}),
	preloading: writable(null),
	session: writable(initial_data && initial_data.session)
};

let $session;
let session_dirty;

stores.session.subscribe(async value => {
	$session = value;

	if (!ready) return;
	session_dirty = true;

	const target = select_target(new URL(location.href));

	const token = current_token = {};
	const { redirect, props, branch } = await hydrate_target(target);
	if (token !== current_token) return; // a secondary navigation happened while we were loading

	await render(redirect, branch, props, target.page);
});

let prefetching


 = null;
function set_prefetching(href, promise) {
	prefetching = { href, promise };
}

let target;
function set_target(element) {
	target = element;
}

let uid = 1;
function set_uid(n) {
	uid = n;
}

let cid;
function set_cid(n) {
	cid = n;
}

const _history = typeof history !== 'undefined' ? history : {
	pushState: (state, title, href) => {},
	replaceState: (state, title, href) => {},
	scrollRestoration: ''
};

const scroll_history = {};

function extract_query(search) {
	const query = Object.create(null);
	if (search.length > 0) {
		search.slice(1).split('&').forEach(searchParam => {
			let [, key, value = ''] = /([^=]*)(?:=(.*))?/.exec(decodeURIComponent(searchParam.replace(/\+/g, ' ')));
			if (typeof query[key] === 'string') query[key] = [query[key]];
			if (typeof query[key] === 'object') (query[key] ).push(value);
			else query[key] = value;
		});
	}
	return query;
}

function select_target(url) {
	if (url.origin !== location.origin) return null;
	if (!url.pathname.startsWith(initial_data.baseUrl)) return null;

	let path = url.pathname.slice(initial_data.baseUrl.length);

	if (path === '') {
		path = '/';
	}

	// avoid accidental clashes between server routes and page routes
	if (ignore.some(pattern => pattern.test(path))) return;

	for (let i = 0; i < routes.length; i += 1) {
		const route = routes[i];

		const match = route.pattern.exec(path);

		if (match) {
			const query = extract_query(url.search);
			const part = route.parts[route.parts.length - 1];
			const params = part.params ? part.params(match) : {};

			const page = { host: location.host, path, query, params };

			return { href: url.href, route, match, page };
		}
	}
}

function handle_error(url) {
	const { host, pathname, search } = location;
	const { session, preloaded, status, error } = initial_data;

	if (!root_preloaded) {
		root_preloaded = preloaded && preloaded[0];
	}

	const props = {
		error,
		status,
		session,
		level0: {
			props: root_preloaded
		},
		level1: {
			props: {
				status,
				error
			},
			component: Error$1
		},
		segments: preloaded

	};
	const query = extract_query(search);
	render(null, [], props, { host, path: pathname, query, params: {} });
}

function scroll_state() {
	return {
		x: pageXOffset,
		y: pageYOffset
	};
}

async function navigate(target, id, noscroll, hash) {
	if (id) {
		// popstate or initial navigation
		cid = id;
	} else {
		const current_scroll = scroll_state();

		// clicked on a link. preserve scroll state
		scroll_history[cid] = current_scroll;

		id = cid = ++uid;
		scroll_history[cid] = noscroll ? current_scroll : { x: 0, y: 0 };
	}

	cid = id;

	if (root_component) stores.preloading.set(true);

	const loaded = prefetching && prefetching.href === target.href ?
		prefetching.promise :
		hydrate_target(target);

	prefetching = null;

	const token = current_token = {};
	const { redirect, props, branch } = await loaded;
	if (token !== current_token) return; // a secondary navigation happened while we were loading

	await render(redirect, branch, props, target.page);
	if (document.activeElement) document.activeElement.blur();

	if (!noscroll) {
		let scroll = scroll_history[id];

		if (hash) {
			// scroll is an element id (from a hash), we need to compute y.
			const deep_linked = document.getElementById(hash.slice(1));

			if (deep_linked) {
				scroll = {
					x: 0,
					y: deep_linked.getBoundingClientRect().top + scrollY
				};
			}
		}

		scroll_history[cid] = scroll;
		if (scroll) scrollTo(scroll.x, scroll.y);
	}
}

async function render(redirect, branch, props, page) {
	if (redirect) return goto(redirect.location, { replaceState: true });

	stores.page.set(page);
	stores.preloading.set(false);

	if (root_component) {
		root_component.$set(props);
	} else {
		props.stores = {
			page: { subscribe: stores.page.subscribe },
			preloading: { subscribe: stores.preloading.subscribe },
			session: stores.session
		};
		props.level0 = {
			props: await root_preloaded
		};
		props.notify = stores.page.notify;

		// first load — remove SSR'd <head> contents
		const start = document.querySelector('#sapper-head-start');
		const end = document.querySelector('#sapper-head-end');

		if (start && end) {
			while (start.nextSibling !== end) detach$1(start.nextSibling);
			detach$1(start);
			detach$1(end);
		}

		root_component = new App({
			target,
			props,
			hydrate: true
		});
	}

	current_branch = branch;
	current_query = JSON.stringify(page.query);
	ready = true;
	session_dirty = false;
}

function part_changed(i, segment, match, stringified_query) {
	// TODO only check query string changes for preload functions
	// that do in fact depend on it (using static analysis or
	// runtime instrumentation)
	if (stringified_query !== current_query) return true;

	const previous = current_branch[i];

	if (!previous) return false;
	if (segment !== previous.segment) return true;
	if (previous.match) {
		if (JSON.stringify(previous.match.slice(1, i + 2)) !== JSON.stringify(match.slice(1, i + 2))) {
			return true;
		}
	}
}

async function hydrate_target(target)



 {
	const { route, page } = target;
	const segments = page.path.split('/').filter(Boolean);

	let redirect = null;

	const props = { error: null, status: 200, segments: [segments[0]] };

	const preload_context = {
		fetch: (url, opts) => fetch(url, opts),
		redirect: (statusCode, location) => {
			if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
				throw new Error(`Conflicting redirects`);
			}
			redirect = { statusCode, location };
		},
		error: (status, error) => {
			props.error = typeof error === 'string' ? new Error(error) : error;
			props.status = status;
		}
	};

	if (!root_preloaded) {
		root_preloaded = initial_data.preloaded[0] || preload.call(preload_context, {
			host: page.host,
			path: page.path,
			query: page.query,
			params: {}
		}, $session);
	}

	let branch;
	let l = 1;

	try {
		const stringified_query = JSON.stringify(page.query);
		const match = route.pattern.exec(page.path);

		let segment_dirty = false;

		branch = await Promise.all(route.parts.map(async (part, i) => {
			const segment = segments[i];

			if (part_changed(i, segment, match, stringified_query)) segment_dirty = true;

			props.segments[l] = segments[i + 1]; // TODO make this less confusing
			if (!part) return { segment };

			const j = l++;

			if (!session_dirty && !segment_dirty && current_branch[i] && current_branch[i].part === part.i) {
				return current_branch[i];
			}

			segment_dirty = false;

			const { default: component, preload } = await load_component(components[part.i]);

			let preloaded;
			if (ready || !initial_data.preloaded[i + 1]) {
				preloaded = preload
					? await preload.call(preload_context, {
						host: page.host,
						path: page.path,
						query: page.query,
						params: part.params ? part.params(target.match) : {}
					}, $session)
					: {};
			} else {
				preloaded = initial_data.preloaded[i + 1];
			}

			return (props[`level${j}`] = { component, props: preloaded, segment, match, part: part.i });
		}));
	} catch (error) {
		props.error = error;
		props.status = 500;
		branch = [];
	}

	return { redirect, props, branch };
}

function load_css(chunk) {
	const href = `client/${chunk}`;
	if (document.querySelector(`link[href="${href}"]`)) return;

	return new Promise((fulfil, reject) => {
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;

		link.onload = () => fulfil();
		link.onerror = reject;

		document.head.appendChild(link);
	});
}

function load_component(component)


 {
	// TODO this is temporary — once placeholders are
	// always rewritten, scratch the ternary
	const promises = (typeof component.css === 'string' ? [] : component.css.map(load_css));
	promises.unshift(component.js());
	return Promise.all(promises).then(values => values[0]);
}

function detach$1(node) {
	node.parentNode.removeChild(node);
}

function prefetch(href) {
	const target = select_target(new URL(href, document.baseURI));

	if (target) {
		if (!prefetching || href !== prefetching.href) {
			set_prefetching(href, hydrate_target(target));
		}

		return prefetching.promise;
	}
}

function start(opts

) {
	if ('scrollRestoration' in _history) {
		_history.scrollRestoration = 'manual';
	}
	
	// Adopted from Nuxt.js
	// Reset scrollRestoration to auto when leaving page, allowing page reload
	// and back-navigation from other pages to use the browser to restore the
	// scrolling position.
	addEventListener('beforeunload', () => {
		_history.scrollRestoration = 'auto';
	});

	// Setting scrollRestoration to manual again when returning to this page.
	addEventListener('load', () => {
		_history.scrollRestoration = 'manual';
	});

	set_target(opts.target);

	addEventListener('click', handle_click);
	addEventListener('popstate', handle_popstate);

	// prefetch
	addEventListener('touchstart', trigger_prefetch);
	addEventListener('mousemove', handle_mousemove);

	return Promise.resolve().then(() => {
		const { hash, href } = location;

		_history.replaceState({ id: uid }, '', href);

		const url = new URL(location.href);

		if (initial_data.error) return handle_error();

		const target = select_target(url);
		if (target) return navigate(target, uid, true, hash);
	});
}

let mousemove_timeout;

function handle_mousemove(event) {
	clearTimeout(mousemove_timeout);
	mousemove_timeout = setTimeout(() => {
		trigger_prefetch(event);
	}, 20);
}

function trigger_prefetch(event) {
	const a = find_anchor(event.target);
	if (!a || a.rel !== 'prefetch') return;

	prefetch(a.href);
}

function handle_click(event) {
	// Adapted from https://github.com/visionmedia/page.js
	// MIT license https://github.com/visionmedia/page.js#license
	if (which(event) !== 1) return;
	if (event.metaKey || event.ctrlKey || event.shiftKey) return;
	if (event.defaultPrevented) return;

	const a = find_anchor(event.target);
	if (!a) return;

	if (!a.href) return;

	// check if link is inside an svg
	// in this case, both href and target are always inside an object
	const svg = typeof a.href === 'object' && a.href.constructor.name === 'SVGAnimatedString';
	const href = String(svg ? (a).href.baseVal : a.href);

	if (href === location.href) {
		if (!location.hash) event.preventDefault();
		return;
	}

	// Ignore if tag has
	// 1. 'download' attribute
	// 2. rel='external' attribute
	if (a.hasAttribute('download') || a.getAttribute('rel') === 'external') return;

	// Ignore if <a> has a target
	if (svg ? (a).target.baseVal : a.target) return;

	const url = new URL(href);

	// Don't handle hash changes
	if (url.pathname === location.pathname && url.search === location.search) return;

	const target = select_target(url);
	if (target) {
		const noscroll = a.hasAttribute('sapper-noscroll');
		navigate(target, null, noscroll, url.hash);
		event.preventDefault();
		_history.pushState({ id: cid }, '', url.href);
	}
}

function which(event) {
	return event.which === null ? event.button : event.which;
}

function find_anchor(node) {
	while (node && node.nodeName.toUpperCase() !== 'A') node = node.parentNode; // SVG <a> elements have a lowercase name
	return node;
}

function handle_popstate(event) {
	scroll_history[cid] = scroll_state();

	if (event.state) {
		const url = new URL(location.href);
		const target = select_target(url);
		if (target) {
			navigate(target, event.state.id);
		} else {
			location.href = location.href;
		}
	} else {
		// hashchange
		set_uid(uid + 1);
		set_cid(uid);
		_history.replaceState({ id: cid }, '', location.href);
	}
}

start({
	target: document.querySelector('#sapper')
});

export { create_slot as A, update_slot_base as B, get_all_dirty_from_scope as C, get_slot_changes as D, onMount as E, identity as F, svg_element as G, claim_svg_element as H, set_data_dev as I, empty as J, assign as K, exclude_internal_props as L, get_spread_update as M, get_spread_object as N, validate_each_argument as O, listen_dev as P, add_render_callback as Q, create_in_transition as R, SvelteComponentDev as S, destroy_each as T, space as a, children as b, claim_element as c, dispatch_dev as d, element as e, claim_space as f, detach_dev as g, attr_dev as h, init as i, add_location as j, src_url_equal as k, set_style as l, insert_hydration_dev as m, append_hydration_dev as n, noop as o, create_component as p, query_selector_all as q, claim_component as r, safe_not_equal as s, text as t, claim_text as u, validate_slots as v, mount_component as w, transition_in as x, transition_out as y, destroy_component as z };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpZW50LmU2YTNlYTQ0LmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9ub2RlX21vZHVsZXMvc3ZlbHRlL2ludGVybmFsL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUvc3RvcmUvaW5kZXgubWpzIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL2ludGVybmFsL3NoYXJlZC5tanMiLCIuLi8uLi8uLi9zcmMvY29tcG9uZW50cy9OYXYuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL3JvdXRlcy9fbGF5b3V0LnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvX2Vycm9yLnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9ub2RlX21vZHVsZXMvQHNhcHBlci9pbnRlcm5hbC9BcHAuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL25vZGVfbW9kdWxlcy9Ac2FwcGVyL2ludGVybmFsL21hbmlmZXN0LWNsaWVudC5tanMiLCIuLi8uLi8uLi9zcmMvbm9kZV9tb2R1bGVzL0BzYXBwZXIvYXBwLm1qcyIsIi4uLy4uLy4uL3NyYy9jbGllbnQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gbm9vcCgpIHsgfVxuY29uc3QgaWRlbnRpdHkgPSB4ID0+IHg7XG5mdW5jdGlvbiBhc3NpZ24odGFyLCBzcmMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgZm9yIChjb25zdCBrIGluIHNyYylcbiAgICAgICAgdGFyW2tdID0gc3JjW2tdO1xuICAgIHJldHVybiB0YXI7XG59XG5mdW5jdGlvbiBpc19wcm9taXNlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHZhbHVlLnRoZW4gPT09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBhZGRfbG9jYXRpb24oZWxlbWVudCwgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyKSB7XG4gICAgZWxlbWVudC5fX3N2ZWx0ZV9tZXRhID0ge1xuICAgICAgICBsb2M6IHsgZmlsZSwgbGluZSwgY29sdW1uLCBjaGFyIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gcnVuKGZuKSB7XG4gICAgcmV0dXJuIGZuKCk7XG59XG5mdW5jdGlvbiBibGFua19vYmplY3QoKSB7XG4gICAgcmV0dXJuIE9iamVjdC5jcmVhdGUobnVsbCk7XG59XG5mdW5jdGlvbiBydW5fYWxsKGZucykge1xuICAgIGZucy5mb3JFYWNoKHJ1bik7XG59XG5mdW5jdGlvbiBpc19mdW5jdGlvbih0aGluZykge1xuICAgIHJldHVybiB0eXBlb2YgdGhpbmcgPT09ICdmdW5jdGlvbic7XG59XG5mdW5jdGlvbiBzYWZlX25vdF9lcXVhbChhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT0gYSA/IGIgPT0gYiA6IGEgIT09IGIgfHwgKChhICYmIHR5cGVvZiBhID09PSAnb2JqZWN0JykgfHwgdHlwZW9mIGEgPT09ICdmdW5jdGlvbicpO1xufVxubGV0IHNyY191cmxfZXF1YWxfYW5jaG9yO1xuZnVuY3Rpb24gc3JjX3VybF9lcXVhbChlbGVtZW50X3NyYywgdXJsKSB7XG4gICAgaWYgKCFzcmNfdXJsX2VxdWFsX2FuY2hvcikge1xuICAgICAgICBzcmNfdXJsX2VxdWFsX2FuY2hvciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICB9XG4gICAgc3JjX3VybF9lcXVhbF9hbmNob3IuaHJlZiA9IHVybDtcbiAgICByZXR1cm4gZWxlbWVudF9zcmMgPT09IHNyY191cmxfZXF1YWxfYW5jaG9yLmhyZWY7XG59XG5mdW5jdGlvbiBub3RfZXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhICE9IGEgPyBiID09IGIgOiBhICE9PSBiO1xufVxuZnVuY3Rpb24gaXNfZW1wdHkob2JqKSB7XG4gICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVfc3RvcmUoc3RvcmUsIG5hbWUpIHtcbiAgICBpZiAoc3RvcmUgIT0gbnVsbCAmJiB0eXBlb2Ygc3RvcmUuc3Vic2NyaWJlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgJyR7bmFtZX0nIGlzIG5vdCBhIHN0b3JlIHdpdGggYSAnc3Vic2NyaWJlJyBtZXRob2RgKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzdWJzY3JpYmUoc3RvcmUsIC4uLmNhbGxiYWNrcykge1xuICAgIGlmIChzdG9yZSA9PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBub29wO1xuICAgIH1cbiAgICBjb25zdCB1bnN1YiA9IHN0b3JlLnN1YnNjcmliZSguLi5jYWxsYmFja3MpO1xuICAgIHJldHVybiB1bnN1Yi51bnN1YnNjcmliZSA/ICgpID0+IHVuc3ViLnVuc3Vic2NyaWJlKCkgOiB1bnN1Yjtcbn1cbmZ1bmN0aW9uIGdldF9zdG9yZV92YWx1ZShzdG9yZSkge1xuICAgIGxldCB2YWx1ZTtcbiAgICBzdWJzY3JpYmUoc3RvcmUsIF8gPT4gdmFsdWUgPSBfKSgpO1xuICAgIHJldHVybiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIGNvbXBvbmVudF9zdWJzY3JpYmUoY29tcG9uZW50LCBzdG9yZSwgY2FsbGJhY2spIHtcbiAgICBjb21wb25lbnQuJCQub25fZGVzdHJveS5wdXNoKHN1YnNjcmliZShzdG9yZSwgY2FsbGJhY2spKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9zbG90KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvbikge1xuICAgICAgICBjb25zdCBzbG90X2N0eCA9IGdldF9zbG90X2NvbnRleHQoZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBmbik7XG4gICAgICAgIHJldHVybiBkZWZpbml0aW9uWzBdKHNsb3RfY3R4KTtcbiAgICB9XG59XG5mdW5jdGlvbiBnZXRfc2xvdF9jb250ZXh0KGRlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgZm4pIHtcbiAgICByZXR1cm4gZGVmaW5pdGlvblsxXSAmJiBmblxuICAgICAgICA/IGFzc2lnbigkJHNjb3BlLmN0eC5zbGljZSgpLCBkZWZpbml0aW9uWzFdKGZuKGN0eCkpKVxuICAgICAgICA6ICQkc2NvcGUuY3R4O1xufVxuZnVuY3Rpb24gZ2V0X3Nsb3RfY2hhbmdlcyhkZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZm4pIHtcbiAgICBpZiAoZGVmaW5pdGlvblsyXSAmJiBmbikge1xuICAgICAgICBjb25zdCBsZXRzID0gZGVmaW5pdGlvblsyXShmbihkaXJ0eSkpO1xuICAgICAgICBpZiAoJCRzY29wZS5kaXJ0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gbGV0cztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIGxldHMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBjb25zdCBtZXJnZWQgPSBbXTtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IE1hdGgubWF4KCQkc2NvcGUuZGlydHkubGVuZ3RoLCBsZXRzLmxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbjsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgbWVyZ2VkW2ldID0gJCRzY29wZS5kaXJ0eVtpXSB8IGxldHNbaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWVyZ2VkO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkJHNjb3BlLmRpcnR5IHwgbGV0cztcbiAgICB9XG4gICAgcmV0dXJuICQkc2NvcGUuZGlydHk7XG59XG5mdW5jdGlvbiB1cGRhdGVfc2xvdF9iYXNlKHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBzbG90X2NoYW5nZXMsIGdldF9zbG90X2NvbnRleHRfZm4pIHtcbiAgICBpZiAoc2xvdF9jaGFuZ2VzKSB7XG4gICAgICAgIGNvbnN0IHNsb3RfY29udGV4dCA9IGdldF9zbG90X2NvbnRleHQoc2xvdF9kZWZpbml0aW9uLCBjdHgsICQkc2NvcGUsIGdldF9zbG90X2NvbnRleHRfZm4pO1xuICAgICAgICBzbG90LnAoc2xvdF9jb250ZXh0LCBzbG90X2NoYW5nZXMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZV9zbG90KHNsb3QsIHNsb3RfZGVmaW5pdGlvbiwgY3R4LCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbiwgZ2V0X3Nsb3RfY29udGV4dF9mbikge1xuICAgIGNvbnN0IHNsb3RfY2hhbmdlcyA9IGdldF9zbG90X2NoYW5nZXMoc2xvdF9kZWZpbml0aW9uLCAkJHNjb3BlLCBkaXJ0eSwgZ2V0X3Nsb3RfY2hhbmdlc19mbik7XG4gICAgdXBkYXRlX3Nsb3RfYmFzZShzbG90LCBzbG90X2RlZmluaXRpb24sIGN0eCwgJCRzY29wZSwgc2xvdF9jaGFuZ2VzLCBnZXRfc2xvdF9jb250ZXh0X2ZuKTtcbn1cbmZ1bmN0aW9uIGdldF9hbGxfZGlydHlfZnJvbV9zY29wZSgkJHNjb3BlKSB7XG4gICAgaWYgKCQkc2NvcGUuY3R4Lmxlbmd0aCA+IDMyKSB7XG4gICAgICAgIGNvbnN0IGRpcnR5ID0gW107XG4gICAgICAgIGNvbnN0IGxlbmd0aCA9ICQkc2NvcGUuY3R4Lmxlbmd0aCAvIDMyO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkaXJ0eVtpXSA9IC0xO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkaXJ0eTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xufVxuZnVuY3Rpb24gZXhjbHVkZV9pbnRlcm5hbF9wcm9wcyhwcm9wcykge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3QgayBpbiBwcm9wcylcbiAgICAgICAgaWYgKGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3VsdFtrXSA9IHByb3BzW2tdO1xuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBjb21wdXRlX3Jlc3RfcHJvcHMocHJvcHMsIGtleXMpIHtcbiAgICBjb25zdCByZXN0ID0ge307XG4gICAga2V5cyA9IG5ldyBTZXQoa2V5cyk7XG4gICAgZm9yIChjb25zdCBrIGluIHByb3BzKVxuICAgICAgICBpZiAoIWtleXMuaGFzKGspICYmIGtbMF0gIT09ICckJylcbiAgICAgICAgICAgIHJlc3Rba10gPSBwcm9wc1trXTtcbiAgICByZXR1cm4gcmVzdDtcbn1cbmZ1bmN0aW9uIGNvbXB1dGVfc2xvdHMoc2xvdHMpIHtcbiAgICBjb25zdCByZXN1bHQgPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiBzbG90cykge1xuICAgICAgICByZXN1bHRba2V5XSA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG59XG5mdW5jdGlvbiBvbmNlKGZuKSB7XG4gICAgbGV0IHJhbiA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICBpZiAocmFuKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICByYW4gPSB0cnVlO1xuICAgICAgICBmbi5jYWxsKHRoaXMsIC4uLmFyZ3MpO1xuICAgIH07XG59XG5mdW5jdGlvbiBudWxsX3RvX2VtcHR5KHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09IG51bGwgPyAnJyA6IHZhbHVlO1xufVxuZnVuY3Rpb24gc2V0X3N0b3JlX3ZhbHVlKHN0b3JlLCByZXQsIHZhbHVlKSB7XG4gICAgc3RvcmUuc2V0KHZhbHVlKTtcbiAgICByZXR1cm4gcmV0O1xufVxuY29uc3QgaGFzX3Byb3AgPSAob2JqLCBwcm9wKSA9PiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbmZ1bmN0aW9uIGFjdGlvbl9kZXN0cm95ZXIoYWN0aW9uX3Jlc3VsdCkge1xuICAgIHJldHVybiBhY3Rpb25fcmVzdWx0ICYmIGlzX2Z1bmN0aW9uKGFjdGlvbl9yZXN1bHQuZGVzdHJveSkgPyBhY3Rpb25fcmVzdWx0LmRlc3Ryb3kgOiBub29wO1xufVxuXG5jb25zdCBpc19jbGllbnQgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJztcbmxldCBub3cgPSBpc19jbGllbnRcbiAgICA/ICgpID0+IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKVxuICAgIDogKCkgPT4gRGF0ZS5ub3coKTtcbmxldCByYWYgPSBpc19jbGllbnQgPyBjYiA9PiByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoY2IpIDogbm9vcDtcbi8vIHVzZWQgaW50ZXJuYWxseSBmb3IgdGVzdGluZ1xuZnVuY3Rpb24gc2V0X25vdyhmbikge1xuICAgIG5vdyA9IGZuO1xufVxuZnVuY3Rpb24gc2V0X3JhZihmbikge1xuICAgIHJhZiA9IGZuO1xufVxuXG5jb25zdCB0YXNrcyA9IG5ldyBTZXQoKTtcbmZ1bmN0aW9uIHJ1bl90YXNrcyhub3cpIHtcbiAgICB0YXNrcy5mb3JFYWNoKHRhc2sgPT4ge1xuICAgICAgICBpZiAoIXRhc2suYyhub3cpKSB7XG4gICAgICAgICAgICB0YXNrcy5kZWxldGUodGFzayk7XG4gICAgICAgICAgICB0YXNrLmYoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICh0YXNrcy5zaXplICE9PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbn1cbi8qKlxuICogRm9yIHRlc3RpbmcgcHVycG9zZXMgb25seSFcbiAqL1xuZnVuY3Rpb24gY2xlYXJfbG9vcHMoKSB7XG4gICAgdGFza3MuY2xlYXIoKTtcbn1cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB0YXNrIHRoYXQgcnVucyBvbiBlYWNoIHJhZiBmcmFtZVxuICogdW50aWwgaXQgcmV0dXJucyBhIGZhbHN5IHZhbHVlIG9yIGlzIGFib3J0ZWRcbiAqL1xuZnVuY3Rpb24gbG9vcChjYWxsYmFjaykge1xuICAgIGxldCB0YXNrO1xuICAgIGlmICh0YXNrcy5zaXplID09PSAwKVxuICAgICAgICByYWYocnVuX3Rhc2tzKTtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcm9taXNlOiBuZXcgUHJvbWlzZShmdWxmaWxsID0+IHtcbiAgICAgICAgICAgIHRhc2tzLmFkZCh0YXNrID0geyBjOiBjYWxsYmFjaywgZjogZnVsZmlsbCB9KTtcbiAgICAgICAgfSksXG4gICAgICAgIGFib3J0KCkge1xuICAgICAgICAgICAgdGFza3MuZGVsZXRlKHRhc2spO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuLy8gVHJhY2sgd2hpY2ggbm9kZXMgYXJlIGNsYWltZWQgZHVyaW5nIGh5ZHJhdGlvbi4gVW5jbGFpbWVkIG5vZGVzIGNhbiB0aGVuIGJlIHJlbW92ZWQgZnJvbSB0aGUgRE9NXG4vLyBhdCB0aGUgZW5kIG9mIGh5ZHJhdGlvbiB3aXRob3V0IHRvdWNoaW5nIHRoZSByZW1haW5pbmcgbm9kZXMuXG5sZXQgaXNfaHlkcmF0aW5nID0gZmFsc2U7XG5mdW5jdGlvbiBzdGFydF9oeWRyYXRpbmcoKSB7XG4gICAgaXNfaHlkcmF0aW5nID0gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGVuZF9oeWRyYXRpbmcoKSB7XG4gICAgaXNfaHlkcmF0aW5nID0gZmFsc2U7XG59XG5mdW5jdGlvbiB1cHBlcl9ib3VuZChsb3csIGhpZ2gsIGtleSwgdmFsdWUpIHtcbiAgICAvLyBSZXR1cm4gZmlyc3QgaW5kZXggb2YgdmFsdWUgbGFyZ2VyIHRoYW4gaW5wdXQgdmFsdWUgaW4gdGhlIHJhbmdlIFtsb3csIGhpZ2gpXG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgICAgY29uc3QgbWlkID0gbG93ICsgKChoaWdoIC0gbG93KSA+PiAxKTtcbiAgICAgICAgaWYgKGtleShtaWQpIDw9IHZhbHVlKSB7XG4gICAgICAgICAgICBsb3cgPSBtaWQgKyAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaGlnaCA9IG1pZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbG93O1xufVxuZnVuY3Rpb24gaW5pdF9oeWRyYXRlKHRhcmdldCkge1xuICAgIGlmICh0YXJnZXQuaHlkcmF0ZV9pbml0KVxuICAgICAgICByZXR1cm47XG4gICAgdGFyZ2V0Lmh5ZHJhdGVfaW5pdCA9IHRydWU7XG4gICAgLy8gV2Uga25vdyB0aGF0IGFsbCBjaGlsZHJlbiBoYXZlIGNsYWltX29yZGVyIHZhbHVlcyBzaW5jZSB0aGUgdW5jbGFpbWVkIGhhdmUgYmVlbiBkZXRhY2hlZCBpZiB0YXJnZXQgaXMgbm90IDxoZWFkPlxuICAgIGxldCBjaGlsZHJlbiA9IHRhcmdldC5jaGlsZE5vZGVzO1xuICAgIC8vIElmIHRhcmdldCBpcyA8aGVhZD4sIHRoZXJlIG1heSBiZSBjaGlsZHJlbiB3aXRob3V0IGNsYWltX29yZGVyXG4gICAgaWYgKHRhcmdldC5ub2RlTmFtZSA9PT0gJ0hFQUQnKSB7XG4gICAgICAgIGNvbnN0IG15Q2hpbGRyZW4gPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKG5vZGUuY2xhaW1fb3JkZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIG15Q2hpbGRyZW4ucHVzaChub2RlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjaGlsZHJlbiA9IG15Q2hpbGRyZW47XG4gICAgfVxuICAgIC8qXG4gICAgKiBSZW9yZGVyIGNsYWltZWQgY2hpbGRyZW4gb3B0aW1hbGx5LlxuICAgICogV2UgY2FuIHJlb3JkZXIgY2xhaW1lZCBjaGlsZHJlbiBvcHRpbWFsbHkgYnkgZmluZGluZyB0aGUgbG9uZ2VzdCBzdWJzZXF1ZW5jZSBvZlxuICAgICogbm9kZXMgdGhhdCBhcmUgYWxyZWFkeSBjbGFpbWVkIGluIG9yZGVyIGFuZCBvbmx5IG1vdmluZyB0aGUgcmVzdC4gVGhlIGxvbmdlc3RcbiAgICAqIHN1YnNlcXVlbmNlIHN1YnNlcXVlbmNlIG9mIG5vZGVzIHRoYXQgYXJlIGNsYWltZWQgaW4gb3JkZXIgY2FuIGJlIGZvdW5kIGJ5XG4gICAgKiBjb21wdXRpbmcgdGhlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZSBvZiAuY2xhaW1fb3JkZXIgdmFsdWVzLlxuICAgICpcbiAgICAqIFRoaXMgYWxnb3JpdGhtIGlzIG9wdGltYWwgaW4gZ2VuZXJhdGluZyB0aGUgbGVhc3QgYW1vdW50IG9mIHJlb3JkZXIgb3BlcmF0aW9uc1xuICAgICogcG9zc2libGUuXG4gICAgKlxuICAgICogUHJvb2Y6XG4gICAgKiBXZSBrbm93IHRoYXQsIGdpdmVuIGEgc2V0IG9mIHJlb3JkZXJpbmcgb3BlcmF0aW9ucywgdGhlIG5vZGVzIHRoYXQgZG8gbm90IG1vdmVcbiAgICAqIGFsd2F5cyBmb3JtIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2UsIHNpbmNlIHRoZXkgZG8gbm90IG1vdmUgYW1vbmcgZWFjaCBvdGhlclxuICAgICogbWVhbmluZyB0aGF0IHRoZXkgbXVzdCBiZSBhbHJlYWR5IG9yZGVyZWQgYW1vbmcgZWFjaCBvdGhlci4gVGh1cywgdGhlIG1heGltYWxcbiAgICAqIHNldCBvZiBub2RlcyB0aGF0IGRvIG5vdCBtb3ZlIGZvcm0gYSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2UuXG4gICAgKi9cbiAgICAvLyBDb21wdXRlIGxvbmdlc3QgaW5jcmVhc2luZyBzdWJzZXF1ZW5jZVxuICAgIC8vIG06IHN1YnNlcXVlbmNlIGxlbmd0aCBqID0+IGluZGV4IGsgb2Ygc21hbGxlc3QgdmFsdWUgdGhhdCBlbmRzIGFuIGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2YgbGVuZ3RoIGpcbiAgICBjb25zdCBtID0gbmV3IEludDMyQXJyYXkoY2hpbGRyZW4ubGVuZ3RoICsgMSk7XG4gICAgLy8gUHJlZGVjZXNzb3IgaW5kaWNlcyArIDFcbiAgICBjb25zdCBwID0gbmV3IEludDMyQXJyYXkoY2hpbGRyZW4ubGVuZ3RoKTtcbiAgICBtWzBdID0gLTE7XG4gICAgbGV0IGxvbmdlc3QgPSAwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgY3VycmVudCA9IGNoaWxkcmVuW2ldLmNsYWltX29yZGVyO1xuICAgICAgICAvLyBGaW5kIHRoZSBsYXJnZXN0IHN1YnNlcXVlbmNlIGxlbmd0aCBzdWNoIHRoYXQgaXQgZW5kcyBpbiBhIHZhbHVlIGxlc3MgdGhhbiBvdXIgY3VycmVudCB2YWx1ZVxuICAgICAgICAvLyB1cHBlcl9ib3VuZCByZXR1cm5zIGZpcnN0IGdyZWF0ZXIgdmFsdWUsIHNvIHdlIHN1YnRyYWN0IG9uZVxuICAgICAgICAvLyB3aXRoIGZhc3QgcGF0aCBmb3Igd2hlbiB3ZSBhcmUgb24gdGhlIGN1cnJlbnQgbG9uZ2VzdCBzdWJzZXF1ZW5jZVxuICAgICAgICBjb25zdCBzZXFMZW4gPSAoKGxvbmdlc3QgPiAwICYmIGNoaWxkcmVuW21bbG9uZ2VzdF1dLmNsYWltX29yZGVyIDw9IGN1cnJlbnQpID8gbG9uZ2VzdCArIDEgOiB1cHBlcl9ib3VuZCgxLCBsb25nZXN0LCBpZHggPT4gY2hpbGRyZW5bbVtpZHhdXS5jbGFpbV9vcmRlciwgY3VycmVudCkpIC0gMTtcbiAgICAgICAgcFtpXSA9IG1bc2VxTGVuXSArIDE7XG4gICAgICAgIGNvbnN0IG5ld0xlbiA9IHNlcUxlbiArIDE7XG4gICAgICAgIC8vIFdlIGNhbiBndWFyYW50ZWUgdGhhdCBjdXJyZW50IGlzIHRoZSBzbWFsbGVzdCB2YWx1ZS4gT3RoZXJ3aXNlLCB3ZSB3b3VsZCBoYXZlIGdlbmVyYXRlZCBhIGxvbmdlciBzZXF1ZW5jZS5cbiAgICAgICAgbVtuZXdMZW5dID0gaTtcbiAgICAgICAgbG9uZ2VzdCA9IE1hdGgubWF4KG5ld0xlbiwgbG9uZ2VzdCk7XG4gICAgfVxuICAgIC8vIFRoZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2Ugb2Ygbm9kZXMgKGluaXRpYWxseSByZXZlcnNlZClcbiAgICBjb25zdCBsaXMgPSBbXTtcbiAgICAvLyBUaGUgcmVzdCBvZiB0aGUgbm9kZXMsIG5vZGVzIHRoYXQgd2lsbCBiZSBtb3ZlZFxuICAgIGNvbnN0IHRvTW92ZSA9IFtdO1xuICAgIGxldCBsYXN0ID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTtcbiAgICBmb3IgKGxldCBjdXIgPSBtW2xvbmdlc3RdICsgMTsgY3VyICE9IDA7IGN1ciA9IHBbY3VyIC0gMV0pIHtcbiAgICAgICAgbGlzLnB1c2goY2hpbGRyZW5bY3VyIC0gMV0pO1xuICAgICAgICBmb3IgKDsgbGFzdCA+PSBjdXI7IGxhc3QtLSkge1xuICAgICAgICAgICAgdG9Nb3ZlLnB1c2goY2hpbGRyZW5bbGFzdF0pO1xuICAgICAgICB9XG4gICAgICAgIGxhc3QtLTtcbiAgICB9XG4gICAgZm9yICg7IGxhc3QgPj0gMDsgbGFzdC0tKSB7XG4gICAgICAgIHRvTW92ZS5wdXNoKGNoaWxkcmVuW2xhc3RdKTtcbiAgICB9XG4gICAgbGlzLnJldmVyc2UoKTtcbiAgICAvLyBXZSBzb3J0IHRoZSBub2RlcyBiZWluZyBtb3ZlZCB0byBndWFyYW50ZWUgdGhhdCB0aGVpciBpbnNlcnRpb24gb3JkZXIgbWF0Y2hlcyB0aGUgY2xhaW0gb3JkZXJcbiAgICB0b01vdmUuc29ydCgoYSwgYikgPT4gYS5jbGFpbV9vcmRlciAtIGIuY2xhaW1fb3JkZXIpO1xuICAgIC8vIEZpbmFsbHksIHdlIG1vdmUgdGhlIG5vZGVzXG4gICAgZm9yIChsZXQgaSA9IDAsIGogPSAwOyBpIDwgdG9Nb3ZlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHdoaWxlIChqIDwgbGlzLmxlbmd0aCAmJiB0b01vdmVbaV0uY2xhaW1fb3JkZXIgPj0gbGlzW2pdLmNsYWltX29yZGVyKSB7XG4gICAgICAgICAgICBqKys7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYW5jaG9yID0gaiA8IGxpcy5sZW5ndGggPyBsaXNbal0gOiBudWxsO1xuICAgICAgICB0YXJnZXQuaW5zZXJ0QmVmb3JlKHRvTW92ZVtpXSwgYW5jaG9yKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhcHBlbmQodGFyZ2V0LCBub2RlKSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKG5vZGUpO1xufVxuZnVuY3Rpb24gYXBwZW5kX3N0eWxlcyh0YXJnZXQsIHN0eWxlX3NoZWV0X2lkLCBzdHlsZXMpIHtcbiAgICBjb25zdCBhcHBlbmRfc3R5bGVzX3RvID0gZ2V0X3Jvb3RfZm9yX3N0eWxlKHRhcmdldCk7XG4gICAgaWYgKCFhcHBlbmRfc3R5bGVzX3RvLmdldEVsZW1lbnRCeUlkKHN0eWxlX3NoZWV0X2lkKSkge1xuICAgICAgICBjb25zdCBzdHlsZSA9IGVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgICAgIHN0eWxlLmlkID0gc3R5bGVfc2hlZXRfaWQ7XG4gICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gc3R5bGVzO1xuICAgICAgICBhcHBlbmRfc3R5bGVzaGVldChhcHBlbmRfc3R5bGVzX3RvLCBzdHlsZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpIHtcbiAgICBpZiAoIW5vZGUpXG4gICAgICAgIHJldHVybiBkb2N1bWVudDtcbiAgICBjb25zdCByb290ID0gbm9kZS5nZXRSb290Tm9kZSA/IG5vZGUuZ2V0Um9vdE5vZGUoKSA6IG5vZGUub3duZXJEb2N1bWVudDtcbiAgICBpZiAocm9vdCAmJiByb290Lmhvc3QpIHtcbiAgICAgICAgcmV0dXJuIHJvb3Q7XG4gICAgfVxuICAgIHJldHVybiBub2RlLm93bmVyRG9jdW1lbnQ7XG59XG5mdW5jdGlvbiBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldChub2RlKSB7XG4gICAgY29uc3Qgc3R5bGVfZWxlbWVudCA9IGVsZW1lbnQoJ3N0eWxlJyk7XG4gICAgYXBwZW5kX3N0eWxlc2hlZXQoZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpLCBzdHlsZV9lbGVtZW50KTtcbiAgICByZXR1cm4gc3R5bGVfZWxlbWVudDtcbn1cbmZ1bmN0aW9uIGFwcGVuZF9zdHlsZXNoZWV0KG5vZGUsIHN0eWxlKSB7XG4gICAgYXBwZW5kKG5vZGUuaGVhZCB8fCBub2RlLCBzdHlsZSk7XG59XG5mdW5jdGlvbiBhcHBlbmRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSkge1xuICAgIGlmIChpc19oeWRyYXRpbmcpIHtcbiAgICAgICAgaW5pdF9oeWRyYXRlKHRhcmdldCk7XG4gICAgICAgIGlmICgodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgPT09IHVuZGVmaW5lZCkgfHwgKCh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCAhPT0gbnVsbCkgJiYgKHRhcmdldC5hY3R1YWxfZW5kX2NoaWxkLnBhcmVudEVsZW1lbnQgIT09IHRhcmdldCkpKSB7XG4gICAgICAgICAgICB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9IHRhcmdldC5maXJzdENoaWxkO1xuICAgICAgICB9XG4gICAgICAgIC8vIFNraXAgbm9kZXMgb2YgdW5kZWZpbmVkIG9yZGVyaW5nXG4gICAgICAgIHdoaWxlICgodGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgIT09IG51bGwpICYmICh0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZC5jbGFpbV9vcmRlciA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQgPSB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZC5uZXh0U2libGluZztcbiAgICAgICAgfVxuICAgICAgICBpZiAobm9kZSAhPT0gdGFyZ2V0LmFjdHVhbF9lbmRfY2hpbGQpIHtcbiAgICAgICAgICAgIC8vIFdlIG9ubHkgaW5zZXJ0IGlmIHRoZSBvcmRlcmluZyBvZiB0aGlzIG5vZGUgc2hvdWxkIGJlIG1vZGlmaWVkIG9yIHRoZSBwYXJlbnQgbm9kZSBpcyBub3QgdGFyZ2V0XG4gICAgICAgICAgICBpZiAobm9kZS5jbGFpbV9vcmRlciAhPT0gdW5kZWZpbmVkIHx8IG5vZGUucGFyZW50Tm9kZSAhPT0gdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShub2RlLCB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQuYWN0dWFsX2VuZF9jaGlsZCA9IG5vZGUubmV4dFNpYmxpbmc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAobm9kZS5wYXJlbnROb2RlICE9PSB0YXJnZXQgfHwgbm9kZS5uZXh0U2libGluZyAhPT0gbnVsbCkge1xuICAgICAgICB0YXJnZXQuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgfVxufVxuZnVuY3Rpb24gaW5zZXJ0KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgdGFyZ2V0Lmluc2VydEJlZm9yZShub2RlLCBhbmNob3IgfHwgbnVsbCk7XG59XG5mdW5jdGlvbiBpbnNlcnRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgaWYgKGlzX2h5ZHJhdGluZyAmJiAhYW5jaG9yKSB7XG4gICAgICAgIGFwcGVuZF9oeWRyYXRpb24odGFyZ2V0LCBub2RlKTtcbiAgICB9XG4gICAgZWxzZSBpZiAobm9kZS5wYXJlbnROb2RlICE9PSB0YXJnZXQgfHwgbm9kZS5uZXh0U2libGluZyAhPSBhbmNob3IpIHtcbiAgICAgICAgdGFyZ2V0Lmluc2VydEJlZm9yZShub2RlLCBhbmNob3IgfHwgbnVsbCk7XG4gICAgfVxufVxuZnVuY3Rpb24gZGV0YWNoKG5vZGUpIHtcbiAgICBub2RlLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQobm9kZSk7XG59XG5mdW5jdGlvbiBkZXN0cm95X2VhY2goaXRlcmF0aW9ucywgZGV0YWNoaW5nKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVyYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGlmIChpdGVyYXRpb25zW2ldKVxuICAgICAgICAgICAgaXRlcmF0aW9uc1tpXS5kKGRldGFjaGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gZWxlbWVudChuYW1lKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSk7XG59XG5mdW5jdGlvbiBlbGVtZW50X2lzKG5hbWUsIGlzKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSwgeyBpcyB9KTtcbn1cbmZ1bmN0aW9uIG9iamVjdF93aXRob3V0X3Byb3BlcnRpZXMob2JqLCBleGNsdWRlKSB7XG4gICAgY29uc3QgdGFyZ2V0ID0ge307XG4gICAgZm9yIChjb25zdCBrIGluIG9iaikge1xuICAgICAgICBpZiAoaGFzX3Byb3Aob2JqLCBrKVxuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgJiYgZXhjbHVkZS5pbmRleE9mKGspID09PSAtMSkge1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICAgICAgdGFyZ2V0W2tdID0gb2JqW2tdO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG5mdW5jdGlvbiBzdmdfZWxlbWVudChuYW1lKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnLCBuYW1lKTtcbn1cbmZ1bmN0aW9uIHRleHQoZGF0YSkge1xuICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKTtcbn1cbmZ1bmN0aW9uIHNwYWNlKCkge1xuICAgIHJldHVybiB0ZXh0KCcgJyk7XG59XG5mdW5jdGlvbiBlbXB0eSgpIHtcbiAgICByZXR1cm4gdGV4dCgnJyk7XG59XG5mdW5jdGlvbiBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpIHtcbiAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xufVxuZnVuY3Rpb24gcHJldmVudF9kZWZhdWx0KGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIHJldHVybiBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gc3RvcF9wcm9wYWdhdGlvbihmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgcmV0dXJuIGZuLmNhbGwodGhpcywgZXZlbnQpO1xuICAgIH07XG59XG5mdW5jdGlvbiBzZWxmKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGlmIChldmVudC50YXJnZXQgPT09IHRoaXMpXG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGV2ZW50KTtcbiAgICB9O1xufVxuZnVuY3Rpb24gdHJ1c3RlZChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZXZlbnQuaXNUcnVzdGVkKVxuICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBldmVudCk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGF0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKVxuICAgICAgICBub2RlLnJlbW92ZUF0dHJpYnV0ZShhdHRyaWJ1dGUpO1xuICAgIGVsc2UgaWYgKG5vZGUuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZSkgIT09IHZhbHVlKVxuICAgICAgICBub2RlLnNldEF0dHJpYnV0ZShhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIHNldF9hdHRyaWJ1dGVzKG5vZGUsIGF0dHJpYnV0ZXMpIHtcbiAgICAvLyBAdHMtaWdub3JlXG4gICAgY29uc3QgZGVzY3JpcHRvcnMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhub2RlLl9fcHJvdG9fXyk7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gYXR0cmlidXRlcykge1xuICAgICAgICBpZiAoYXR0cmlidXRlc1trZXldID09IG51bGwpIHtcbiAgICAgICAgICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGtleSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnc3R5bGUnKSB7XG4gICAgICAgICAgICBub2RlLnN0eWxlLmNzc1RleHQgPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoa2V5ID09PSAnX192YWx1ZScpIHtcbiAgICAgICAgICAgIG5vZGUudmFsdWUgPSBub2RlW2tleV0gPSBhdHRyaWJ1dGVzW2tleV07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVzY3JpcHRvcnNba2V5XSAmJiBkZXNjcmlwdG9yc1trZXldLnNldCkge1xuICAgICAgICAgICAgbm9kZVtrZXldID0gYXR0cmlidXRlc1trZXldO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXR0cihub2RlLCBrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfc3ZnX2F0dHJpYnV0ZXMobm9kZSwgYXR0cmlidXRlcykge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgYXR0cihub2RlLCBrZXksIGF0dHJpYnV0ZXNba2V5XSk7XG4gICAgfVxufVxuZnVuY3Rpb24gc2V0X2N1c3RvbV9lbGVtZW50X2RhdGEobm9kZSwgcHJvcCwgdmFsdWUpIHtcbiAgICBpZiAocHJvcCBpbiBub2RlKSB7XG4gICAgICAgIG5vZGVbcHJvcF0gPSB0eXBlb2Ygbm9kZVtwcm9wXSA9PT0gJ2Jvb2xlYW4nICYmIHZhbHVlID09PSAnJyA/IHRydWUgOiB2YWx1ZTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGF0dHIobm9kZSwgcHJvcCwgdmFsdWUpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHhsaW5rX2F0dHIobm9kZSwgYXR0cmlidXRlLCB2YWx1ZSkge1xuICAgIG5vZGUuc2V0QXR0cmlidXRlTlMoJ2h0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsnLCBhdHRyaWJ1dGUsIHZhbHVlKTtcbn1cbmZ1bmN0aW9uIGdldF9iaW5kaW5nX2dyb3VwX3ZhbHVlKGdyb3VwLCBfX3ZhbHVlLCBjaGVja2VkKSB7XG4gICAgY29uc3QgdmFsdWUgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBncm91cC5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBpZiAoZ3JvdXBbaV0uY2hlY2tlZClcbiAgICAgICAgICAgIHZhbHVlLmFkZChncm91cFtpXS5fX3ZhbHVlKTtcbiAgICB9XG4gICAgaWYgKCFjaGVja2VkKSB7XG4gICAgICAgIHZhbHVlLmRlbGV0ZShfX3ZhbHVlKTtcbiAgICB9XG4gICAgcmV0dXJuIEFycmF5LmZyb20odmFsdWUpO1xufVxuZnVuY3Rpb24gdG9fbnVtYmVyKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSAnJyA/IG51bGwgOiArdmFsdWU7XG59XG5mdW5jdGlvbiB0aW1lX3Jhbmdlc190b19hcnJheShyYW5nZXMpIHtcbiAgICBjb25zdCBhcnJheSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmFuZ2VzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGFycmF5LnB1c2goeyBzdGFydDogcmFuZ2VzLnN0YXJ0KGkpLCBlbmQ6IHJhbmdlcy5lbmQoaSkgfSk7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbn1cbmZ1bmN0aW9uIGNoaWxkcmVuKGVsZW1lbnQpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShlbGVtZW50LmNoaWxkTm9kZXMpO1xufVxuZnVuY3Rpb24gaW5pdF9jbGFpbV9pbmZvKG5vZGVzKSB7XG4gICAgaWYgKG5vZGVzLmNsYWltX2luZm8gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBub2Rlcy5jbGFpbV9pbmZvID0geyBsYXN0X2luZGV4OiAwLCB0b3RhbF9jbGFpbWVkOiAwIH07XG4gICAgfVxufVxuZnVuY3Rpb24gY2xhaW1fbm9kZShub2RlcywgcHJlZGljYXRlLCBwcm9jZXNzTm9kZSwgY3JlYXRlTm9kZSwgZG9udFVwZGF0ZUxhc3RJbmRleCA9IGZhbHNlKSB7XG4gICAgLy8gVHJ5IHRvIGZpbmQgbm9kZXMgaW4gYW4gb3JkZXIgc3VjaCB0aGF0IHdlIGxlbmd0aGVuIHRoZSBsb25nZXN0IGluY3JlYXNpbmcgc3Vic2VxdWVuY2VcbiAgICBpbml0X2NsYWltX2luZm8obm9kZXMpO1xuICAgIGNvbnN0IHJlc3VsdE5vZGUgPSAoKCkgPT4ge1xuICAgICAgICAvLyBXZSBmaXJzdCB0cnkgdG8gZmluZCBhbiBlbGVtZW50IGFmdGVyIHRoZSBwcmV2aW91cyBvbmVcbiAgICAgICAgZm9yIChsZXQgaSA9IG5vZGVzLmNsYWltX2luZm8ubGFzdF9pbmRleDsgaSA8IG5vZGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBub2RlID0gbm9kZXNbaV07XG4gICAgICAgICAgICBpZiAocHJlZGljYXRlKG5vZGUpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVwbGFjZW1lbnQgPSBwcm9jZXNzTm9kZShub2RlKTtcbiAgICAgICAgICAgICAgICBpZiAocmVwbGFjZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2Rlc1tpXSA9IHJlcGxhY2VtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWRvbnRVcGRhdGVMYXN0SW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4ID0gaTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCB3ZSB0cnkgdG8gZmluZCBvbmUgYmVmb3JlXG4gICAgICAgIC8vIFdlIGl0ZXJhdGUgaW4gcmV2ZXJzZSBzbyB0aGF0IHdlIGRvbid0IGdvIHRvbyBmYXIgYmFja1xuICAgICAgICBmb3IgKGxldCBpID0gbm9kZXMuY2xhaW1faW5mby5sYXN0X2luZGV4IC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgICAgIGlmIChwcmVkaWNhdGUobm9kZSkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXBsYWNlbWVudCA9IHByb2Nlc3NOb2RlKG5vZGUpO1xuICAgICAgICAgICAgICAgIGlmIChyZXBsYWNlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG5vZGVzW2ldID0gcmVwbGFjZW1lbnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghZG9udFVwZGF0ZUxhc3RJbmRleCkge1xuICAgICAgICAgICAgICAgICAgICBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXggPSBpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChyZXBsYWNlbWVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNpbmNlIHdlIHNwbGljZWQgYmVmb3JlIHRoZSBsYXN0X2luZGV4LCB3ZSBkZWNyZWFzZSBpdFxuICAgICAgICAgICAgICAgICAgICBub2Rlcy5jbGFpbV9pbmZvLmxhc3RfaW5kZXgtLTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgd2UgY2FuJ3QgZmluZCBhbnkgbWF0Y2hpbmcgbm9kZSwgd2UgY3JlYXRlIGEgbmV3IG9uZVxuICAgICAgICByZXR1cm4gY3JlYXRlTm9kZSgpO1xuICAgIH0pKCk7XG4gICAgcmVzdWx0Tm9kZS5jbGFpbV9vcmRlciA9IG5vZGVzLmNsYWltX2luZm8udG90YWxfY2xhaW1lZDtcbiAgICBub2Rlcy5jbGFpbV9pbmZvLnRvdGFsX2NsYWltZWQgKz0gMTtcbiAgICByZXR1cm4gcmVzdWx0Tm9kZTtcbn1cbmZ1bmN0aW9uIGNsYWltX2VsZW1lbnRfYmFzZShub2RlcywgbmFtZSwgYXR0cmlidXRlcywgY3JlYXRlX2VsZW1lbnQpIHtcbiAgICByZXR1cm4gY2xhaW1fbm9kZShub2RlcywgKG5vZGUpID0+IG5vZGUubm9kZU5hbWUgPT09IG5hbWUsIChub2RlKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlbW92ZSA9IFtdO1xuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IG5vZGUuYXR0cmlidXRlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgY29uc3QgYXR0cmlidXRlID0gbm9kZS5hdHRyaWJ1dGVzW2pdO1xuICAgICAgICAgICAgaWYgKCFhdHRyaWJ1dGVzW2F0dHJpYnV0ZS5uYW1lXSkge1xuICAgICAgICAgICAgICAgIHJlbW92ZS5wdXNoKGF0dHJpYnV0ZS5uYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZW1vdmUuZm9yRWFjaCh2ID0+IG5vZGUucmVtb3ZlQXR0cmlidXRlKHYpKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9LCAoKSA9PiBjcmVhdGVfZWxlbWVudChuYW1lKSk7XG59XG5mdW5jdGlvbiBjbGFpbV9lbGVtZW50KG5vZGVzLCBuYW1lLCBhdHRyaWJ1dGVzKSB7XG4gICAgcmV0dXJuIGNsYWltX2VsZW1lbnRfYmFzZShub2RlcywgbmFtZSwgYXR0cmlidXRlcywgZWxlbWVudCk7XG59XG5mdW5jdGlvbiBjbGFpbV9zdmdfZWxlbWVudChub2RlcywgbmFtZSwgYXR0cmlidXRlcykge1xuICAgIHJldHVybiBjbGFpbV9lbGVtZW50X2Jhc2Uobm9kZXMsIG5hbWUsIGF0dHJpYnV0ZXMsIHN2Z19lbGVtZW50KTtcbn1cbmZ1bmN0aW9uIGNsYWltX3RleHQobm9kZXMsIGRhdGEpIHtcbiAgICByZXR1cm4gY2xhaW1fbm9kZShub2RlcywgKG5vZGUpID0+IG5vZGUubm9kZVR5cGUgPT09IDMsIChub2RlKSA9PiB7XG4gICAgICAgIGNvbnN0IGRhdGFTdHIgPSAnJyArIGRhdGE7XG4gICAgICAgIGlmIChub2RlLmRhdGEuc3RhcnRzV2l0aChkYXRhU3RyKSkge1xuICAgICAgICAgICAgaWYgKG5vZGUuZGF0YS5sZW5ndGggIT09IGRhdGFTdHIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGUuc3BsaXRUZXh0KGRhdGFTdHIubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG5vZGUuZGF0YSA9IGRhdGFTdHI7XG4gICAgICAgIH1cbiAgICB9LCAoKSA9PiB0ZXh0KGRhdGEpLCB0cnVlIC8vIFRleHQgbm9kZXMgc2hvdWxkIG5vdCB1cGRhdGUgbGFzdCBpbmRleCBzaW5jZSBpdCBpcyBsaWtlbHkgbm90IHdvcnRoIGl0IHRvIGVsaW1pbmF0ZSBhbiBpbmNyZWFzaW5nIHN1YnNlcXVlbmNlIG9mIGFjdHVhbCBlbGVtZW50c1xuICAgICk7XG59XG5mdW5jdGlvbiBjbGFpbV9zcGFjZShub2Rlcykge1xuICAgIHJldHVybiBjbGFpbV90ZXh0KG5vZGVzLCAnICcpO1xufVxuZnVuY3Rpb24gZmluZF9jb21tZW50KG5vZGVzLCB0ZXh0LCBzdGFydCkge1xuICAgIGZvciAobGV0IGkgPSBzdGFydDsgaSA8IG5vZGVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGNvbnN0IG5vZGUgPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKG5vZGUubm9kZVR5cGUgPT09IDggLyogY29tbWVudCBub2RlICovICYmIG5vZGUudGV4dENvbnRlbnQudHJpbSgpID09PSB0ZXh0KSB7XG4gICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbm9kZXMubGVuZ3RoO1xufVxuZnVuY3Rpb24gY2xhaW1faHRtbF90YWcobm9kZXMpIHtcbiAgICAvLyBmaW5kIGh0bWwgb3BlbmluZyB0YWdcbiAgICBjb25zdCBzdGFydF9pbmRleCA9IGZpbmRfY29tbWVudChub2RlcywgJ0hUTUxfVEFHX1NUQVJUJywgMCk7XG4gICAgY29uc3QgZW5kX2luZGV4ID0gZmluZF9jb21tZW50KG5vZGVzLCAnSFRNTF9UQUdfRU5EJywgc3RhcnRfaW5kZXgpO1xuICAgIGlmIChzdGFydF9pbmRleCA9PT0gZW5kX2luZGV4KSB7XG4gICAgICAgIHJldHVybiBuZXcgSHRtbFRhZ0h5ZHJhdGlvbigpO1xuICAgIH1cbiAgICBpbml0X2NsYWltX2luZm8obm9kZXMpO1xuICAgIGNvbnN0IGh0bWxfdGFnX25vZGVzID0gbm9kZXMuc3BsaWNlKHN0YXJ0X2luZGV4LCBlbmRfaW5kZXggKyAxKTtcbiAgICBkZXRhY2goaHRtbF90YWdfbm9kZXNbMF0pO1xuICAgIGRldGFjaChodG1sX3RhZ19ub2Rlc1todG1sX3RhZ19ub2Rlcy5sZW5ndGggLSAxXSk7XG4gICAgY29uc3QgY2xhaW1lZF9ub2RlcyA9IGh0bWxfdGFnX25vZGVzLnNsaWNlKDEsIGh0bWxfdGFnX25vZGVzLmxlbmd0aCAtIDEpO1xuICAgIGZvciAoY29uc3QgbiBvZiBjbGFpbWVkX25vZGVzKSB7XG4gICAgICAgIG4uY2xhaW1fb3JkZXIgPSBub2Rlcy5jbGFpbV9pbmZvLnRvdGFsX2NsYWltZWQ7XG4gICAgICAgIG5vZGVzLmNsYWltX2luZm8udG90YWxfY2xhaW1lZCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IEh0bWxUYWdIeWRyYXRpb24oY2xhaW1lZF9ub2Rlcyk7XG59XG5mdW5jdGlvbiBzZXRfZGF0YSh0ZXh0LCBkYXRhKSB7XG4gICAgZGF0YSA9ICcnICsgZGF0YTtcbiAgICBpZiAodGV4dC53aG9sZVRleHQgIT09IGRhdGEpXG4gICAgICAgIHRleHQuZGF0YSA9IGRhdGE7XG59XG5mdW5jdGlvbiBzZXRfaW5wdXRfdmFsdWUoaW5wdXQsIHZhbHVlKSB7XG4gICAgaW5wdXQudmFsdWUgPSB2YWx1ZSA9PSBudWxsID8gJycgOiB2YWx1ZTtcbn1cbmZ1bmN0aW9uIHNldF9pbnB1dF90eXBlKGlucHV0LCB0eXBlKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaW5wdXQudHlwZSA9IHR5cGU7XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICB9XG59XG5mdW5jdGlvbiBzZXRfc3R5bGUobm9kZSwga2V5LCB2YWx1ZSwgaW1wb3J0YW50KSB7XG4gICAgbm9kZS5zdHlsZS5zZXRQcm9wZXJ0eShrZXksIHZhbHVlLCBpbXBvcnRhbnQgPyAnaW1wb3J0YW50JyA6ICcnKTtcbn1cbmZ1bmN0aW9uIHNlbGVjdF9vcHRpb24oc2VsZWN0LCB2YWx1ZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0Lm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gc2VsZWN0Lm9wdGlvbnNbaV07XG4gICAgICAgIGlmIChvcHRpb24uX192YWx1ZSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgc2VsZWN0LnNlbGVjdGVkSW5kZXggPSAtMTsgLy8gbm8gb3B0aW9uIHNob3VsZCBiZSBzZWxlY3RlZFxufVxuZnVuY3Rpb24gc2VsZWN0X29wdGlvbnMoc2VsZWN0LCB2YWx1ZSkge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0Lm9wdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgY29uc3Qgb3B0aW9uID0gc2VsZWN0Lm9wdGlvbnNbaV07XG4gICAgICAgIG9wdGlvbi5zZWxlY3RlZCA9IH52YWx1ZS5pbmRleE9mKG9wdGlvbi5fX3ZhbHVlKTtcbiAgICB9XG59XG5mdW5jdGlvbiBzZWxlY3RfdmFsdWUoc2VsZWN0KSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRfb3B0aW9uID0gc2VsZWN0LnF1ZXJ5U2VsZWN0b3IoJzpjaGVja2VkJykgfHwgc2VsZWN0Lm9wdGlvbnNbMF07XG4gICAgcmV0dXJuIHNlbGVjdGVkX29wdGlvbiAmJiBzZWxlY3RlZF9vcHRpb24uX192YWx1ZTtcbn1cbmZ1bmN0aW9uIHNlbGVjdF9tdWx0aXBsZV92YWx1ZShzZWxlY3QpIHtcbiAgICByZXR1cm4gW10ubWFwLmNhbGwoc2VsZWN0LnF1ZXJ5U2VsZWN0b3JBbGwoJzpjaGVja2VkJyksIG9wdGlvbiA9PiBvcHRpb24uX192YWx1ZSk7XG59XG4vLyB1bmZvcnR1bmF0ZWx5IHRoaXMgY2FuJ3QgYmUgYSBjb25zdGFudCBhcyB0aGF0IHdvdWxkbid0IGJlIHRyZWUtc2hha2VhYmxlXG4vLyBzbyB3ZSBjYWNoZSB0aGUgcmVzdWx0IGluc3RlYWRcbmxldCBjcm9zc29yaWdpbjtcbmZ1bmN0aW9uIGlzX2Nyb3Nzb3JpZ2luKCkge1xuICAgIGlmIChjcm9zc29yaWdpbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNyb3Nzb3JpZ2luID0gZmFsc2U7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnBhcmVudCkge1xuICAgICAgICAgICAgICAgIHZvaWQgd2luZG93LnBhcmVudC5kb2N1bWVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNyb3Nzb3JpZ2luID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY3Jvc3NvcmlnaW47XG59XG5mdW5jdGlvbiBhZGRfcmVzaXplX2xpc3RlbmVyKG5vZGUsIGZuKSB7XG4gICAgY29uc3QgY29tcHV0ZWRfc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKG5vZGUpO1xuICAgIGlmIChjb21wdXRlZF9zdHlsZS5wb3NpdGlvbiA9PT0gJ3N0YXRpYycpIHtcbiAgICAgICAgbm9kZS5zdHlsZS5wb3NpdGlvbiA9ICdyZWxhdGl2ZSc7XG4gICAgfVxuICAgIGNvbnN0IGlmcmFtZSA9IGVsZW1lbnQoJ2lmcmFtZScpO1xuICAgIGlmcmFtZS5zZXRBdHRyaWJ1dGUoJ3N0eWxlJywgJ2Rpc3BsYXk6IGJsb2NrOyBwb3NpdGlvbjogYWJzb2x1dGU7IHRvcDogMDsgbGVmdDogMDsgd2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgJyArXG4gICAgICAgICdvdmVyZmxvdzogaGlkZGVuOyBib3JkZXI6IDA7IG9wYWNpdHk6IDA7IHBvaW50ZXItZXZlbnRzOiBub25lOyB6LWluZGV4OiAtMTsnKTtcbiAgICBpZnJhbWUuc2V0QXR0cmlidXRlKCdhcmlhLWhpZGRlbicsICd0cnVlJyk7XG4gICAgaWZyYW1lLnRhYkluZGV4ID0gLTE7XG4gICAgY29uc3QgY3Jvc3NvcmlnaW4gPSBpc19jcm9zc29yaWdpbigpO1xuICAgIGxldCB1bnN1YnNjcmliZTtcbiAgICBpZiAoY3Jvc3NvcmlnaW4pIHtcbiAgICAgICAgaWZyYW1lLnNyYyA9IFwiZGF0YTp0ZXh0L2h0bWwsPHNjcmlwdD5vbnJlc2l6ZT1mdW5jdGlvbigpe3BhcmVudC5wb3N0TWVzc2FnZSgwLCcqJyl9PC9zY3JpcHQ+XCI7XG4gICAgICAgIHVuc3Vic2NyaWJlID0gbGlzdGVuKHdpbmRvdywgJ21lc3NhZ2UnLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5zb3VyY2UgPT09IGlmcmFtZS5jb250ZW50V2luZG93KVxuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWZyYW1lLnNyYyA9ICdhYm91dDpibGFuayc7XG4gICAgICAgIGlmcmFtZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSA9IGxpc3RlbihpZnJhbWUuY29udGVudFdpbmRvdywgJ3Jlc2l6ZScsIGZuKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgYXBwZW5kKG5vZGUsIGlmcmFtZSk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgaWYgKGNyb3Nzb3JpZ2luKSB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHVuc3Vic2NyaWJlICYmIGlmcmFtZS5jb250ZW50V2luZG93KSB7XG4gICAgICAgICAgICB1bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGRldGFjaChpZnJhbWUpO1xuICAgIH07XG59XG5mdW5jdGlvbiB0b2dnbGVfY2xhc3MoZWxlbWVudCwgbmFtZSwgdG9nZ2xlKSB7XG4gICAgZWxlbWVudC5jbGFzc0xpc3RbdG9nZ2xlID8gJ2FkZCcgOiAncmVtb3ZlJ10obmFtZSk7XG59XG5mdW5jdGlvbiBjdXN0b21fZXZlbnQodHlwZSwgZGV0YWlsLCBidWJibGVzID0gZmFsc2UpIHtcbiAgICBjb25zdCBlID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0N1c3RvbUV2ZW50Jyk7XG4gICAgZS5pbml0Q3VzdG9tRXZlbnQodHlwZSwgYnViYmxlcywgZmFsc2UsIGRldGFpbCk7XG4gICAgcmV0dXJuIGU7XG59XG5mdW5jdGlvbiBxdWVyeV9zZWxlY3Rvcl9hbGwoc2VsZWN0b3IsIHBhcmVudCA9IGRvY3VtZW50LmJvZHkpIHtcbiAgICByZXR1cm4gQXJyYXkuZnJvbShwYXJlbnQucXVlcnlTZWxlY3RvckFsbChzZWxlY3RvcikpO1xufVxuY2xhc3MgSHRtbFRhZyB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZSA9IHRoaXMubiA9IG51bGw7XG4gICAgfVxuICAgIGMoaHRtbCkge1xuICAgICAgICB0aGlzLmgoaHRtbCk7XG4gICAgfVxuICAgIG0oaHRtbCwgdGFyZ2V0LCBhbmNob3IgPSBudWxsKSB7XG4gICAgICAgIGlmICghdGhpcy5lKSB7XG4gICAgICAgICAgICB0aGlzLmUgPSBlbGVtZW50KHRhcmdldC5ub2RlTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnQgPSB0YXJnZXQ7XG4gICAgICAgICAgICB0aGlzLmMoaHRtbCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pKGFuY2hvcik7XG4gICAgfVxuICAgIGgoaHRtbCkge1xuICAgICAgICB0aGlzLmUuaW5uZXJIVE1MID0gaHRtbDtcbiAgICAgICAgdGhpcy5uID0gQXJyYXkuZnJvbSh0aGlzLmUuY2hpbGROb2Rlcyk7XG4gICAgfVxuICAgIGkoYW5jaG9yKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5uLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpbnNlcnQodGhpcy50LCB0aGlzLm5baV0sIGFuY2hvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcChodG1sKSB7XG4gICAgICAgIHRoaXMuZCgpO1xuICAgICAgICB0aGlzLmgoaHRtbCk7XG4gICAgICAgIHRoaXMuaSh0aGlzLmEpO1xuICAgIH1cbiAgICBkKCkge1xuICAgICAgICB0aGlzLm4uZm9yRWFjaChkZXRhY2gpO1xuICAgIH1cbn1cbmNsYXNzIEh0bWxUYWdIeWRyYXRpb24gZXh0ZW5kcyBIdG1sVGFnIHtcbiAgICBjb25zdHJ1Y3RvcihjbGFpbWVkX25vZGVzKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZSA9IHRoaXMubiA9IG51bGw7XG4gICAgICAgIHRoaXMubCA9IGNsYWltZWRfbm9kZXM7XG4gICAgfVxuICAgIGMoaHRtbCkge1xuICAgICAgICBpZiAodGhpcy5sKSB7XG4gICAgICAgICAgICB0aGlzLm4gPSB0aGlzLmw7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5jKGh0bWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGkoYW5jaG9yKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5uLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBpbnNlcnRfaHlkcmF0aW9uKHRoaXMudCwgdGhpcy5uW2ldLCBhbmNob3IpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gYXR0cmlidXRlX3RvX29iamVjdChhdHRyaWJ1dGVzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZm9yIChjb25zdCBhdHRyaWJ1dGUgb2YgYXR0cmlidXRlcykge1xuICAgICAgICByZXN1bHRbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlLnZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZ2V0X2N1c3RvbV9lbGVtZW50c19zbG90cyhlbGVtZW50KSB7XG4gICAgY29uc3QgcmVzdWx0ID0ge307XG4gICAgZWxlbWVudC5jaGlsZE5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgcmVzdWx0W25vZGUuc2xvdCB8fCAnZGVmYXVsdCddID0gdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5jb25zdCBhY3RpdmVfZG9jcyA9IG5ldyBTZXQoKTtcbmxldCBhY3RpdmUgPSAwO1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Rhcmtza3lhcHAvc3RyaW5nLWhhc2gvYmxvYi9tYXN0ZXIvaW5kZXguanNcbmZ1bmN0aW9uIGhhc2goc3RyKSB7XG4gICAgbGV0IGhhc2ggPSA1MzgxO1xuICAgIGxldCBpID0gc3RyLmxlbmd0aDtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBoYXNoID0gKChoYXNoIDw8IDUpIC0gaGFzaCkgXiBzdHIuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gaGFzaCA+Pj4gMDtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9ydWxlKG5vZGUsIGEsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzZSwgZm4sIHVpZCA9IDApIHtcbiAgICBjb25zdCBzdGVwID0gMTYuNjY2IC8gZHVyYXRpb247XG4gICAgbGV0IGtleWZyYW1lcyA9ICd7XFxuJztcbiAgICBmb3IgKGxldCBwID0gMDsgcCA8PSAxOyBwICs9IHN0ZXApIHtcbiAgICAgICAgY29uc3QgdCA9IGEgKyAoYiAtIGEpICogZWFzZShwKTtcbiAgICAgICAga2V5ZnJhbWVzICs9IHAgKiAxMDAgKyBgJXske2ZuKHQsIDEgLSB0KX19XFxuYDtcbiAgICB9XG4gICAgY29uc3QgcnVsZSA9IGtleWZyYW1lcyArIGAxMDAlIHske2ZuKGIsIDEgLSBiKX19XFxufWA7XG4gICAgY29uc3QgbmFtZSA9IGBfX3N2ZWx0ZV8ke2hhc2gocnVsZSl9XyR7dWlkfWA7XG4gICAgY29uc3QgZG9jID0gZ2V0X3Jvb3RfZm9yX3N0eWxlKG5vZGUpO1xuICAgIGFjdGl2ZV9kb2NzLmFkZChkb2MpO1xuICAgIGNvbnN0IHN0eWxlc2hlZXQgPSBkb2MuX19zdmVsdGVfc3R5bGVzaGVldCB8fCAoZG9jLl9fc3ZlbHRlX3N0eWxlc2hlZXQgPSBhcHBlbmRfZW1wdHlfc3R5bGVzaGVldChub2RlKS5zaGVldCk7XG4gICAgY29uc3QgY3VycmVudF9ydWxlcyA9IGRvYy5fX3N2ZWx0ZV9ydWxlcyB8fCAoZG9jLl9fc3ZlbHRlX3J1bGVzID0ge30pO1xuICAgIGlmICghY3VycmVudF9ydWxlc1tuYW1lXSkge1xuICAgICAgICBjdXJyZW50X3J1bGVzW25hbWVdID0gdHJ1ZTtcbiAgICAgICAgc3R5bGVzaGVldC5pbnNlcnRSdWxlKGBAa2V5ZnJhbWVzICR7bmFtZX0gJHtydWxlfWAsIHN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoKTtcbiAgICB9XG4gICAgY29uc3QgYW5pbWF0aW9uID0gbm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJyc7XG4gICAgbm9kZS5zdHlsZS5hbmltYXRpb24gPSBgJHthbmltYXRpb24gPyBgJHthbmltYXRpb259LCBgIDogJyd9JHtuYW1lfSAke2R1cmF0aW9ufW1zIGxpbmVhciAke2RlbGF5fW1zIDEgYm90aGA7XG4gICAgYWN0aXZlICs9IDE7XG4gICAgcmV0dXJuIG5hbWU7XG59XG5mdW5jdGlvbiBkZWxldGVfcnVsZShub2RlLCBuYW1lKSB7XG4gICAgY29uc3QgcHJldmlvdXMgPSAobm9kZS5zdHlsZS5hbmltYXRpb24gfHwgJycpLnNwbGl0KCcsICcpO1xuICAgIGNvbnN0IG5leHQgPSBwcmV2aW91cy5maWx0ZXIobmFtZVxuICAgICAgICA/IGFuaW0gPT4gYW5pbS5pbmRleE9mKG5hbWUpIDwgMCAvLyByZW1vdmUgc3BlY2lmaWMgYW5pbWF0aW9uXG4gICAgICAgIDogYW5pbSA9PiBhbmltLmluZGV4T2YoJ19fc3ZlbHRlJykgPT09IC0xIC8vIHJlbW92ZSBhbGwgU3ZlbHRlIGFuaW1hdGlvbnNcbiAgICApO1xuICAgIGNvbnN0IGRlbGV0ZWQgPSBwcmV2aW91cy5sZW5ndGggLSBuZXh0Lmxlbmd0aDtcbiAgICBpZiAoZGVsZXRlZCkge1xuICAgICAgICBub2RlLnN0eWxlLmFuaW1hdGlvbiA9IG5leHQuam9pbignLCAnKTtcbiAgICAgICAgYWN0aXZlIC09IGRlbGV0ZWQ7XG4gICAgICAgIGlmICghYWN0aXZlKVxuICAgICAgICAgICAgY2xlYXJfcnVsZXMoKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjbGVhcl9ydWxlcygpIHtcbiAgICByYWYoKCkgPT4ge1xuICAgICAgICBpZiAoYWN0aXZlKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBhY3RpdmVfZG9jcy5mb3JFYWNoKGRvYyA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdHlsZXNoZWV0ID0gZG9jLl9fc3ZlbHRlX3N0eWxlc2hlZXQ7XG4gICAgICAgICAgICBsZXQgaSA9IHN0eWxlc2hlZXQuY3NzUnVsZXMubGVuZ3RoO1xuICAgICAgICAgICAgd2hpbGUgKGktLSlcbiAgICAgICAgICAgICAgICBzdHlsZXNoZWV0LmRlbGV0ZVJ1bGUoaSk7XG4gICAgICAgICAgICBkb2MuX19zdmVsdGVfcnVsZXMgPSB7fTtcbiAgICAgICAgfSk7XG4gICAgICAgIGFjdGl2ZV9kb2NzLmNsZWFyKCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZV9hbmltYXRpb24obm9kZSwgZnJvbSwgZm4sIHBhcmFtcykge1xuICAgIGlmICghZnJvbSlcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgY29uc3QgdG8gPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGlmIChmcm9tLmxlZnQgPT09IHRvLmxlZnQgJiYgZnJvbS5yaWdodCA9PT0gdG8ucmlnaHQgJiYgZnJvbS50b3AgPT09IHRvLnRvcCAmJiBmcm9tLmJvdHRvbSA9PT0gdG8uYm90dG9tKVxuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICBjb25zdCB7IGRlbGF5ID0gMCwgZHVyYXRpb24gPSAzMDAsIGVhc2luZyA9IGlkZW50aXR5LCBcbiAgICAvLyBAdHMtaWdub3JlIHRvZG86IHNob3VsZCB0aGlzIGJlIHNlcGFyYXRlZCBmcm9tIGRlc3RydWN0dXJpbmc/IE9yIHN0YXJ0L2VuZCBhZGRlZCB0byBwdWJsaWMgYXBpIGFuZCBkb2N1bWVudGF0aW9uP1xuICAgIHN0YXJ0OiBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheSwgXG4gICAgLy8gQHRzLWlnbm9yZSB0b2RvOlxuICAgIGVuZCA9IHN0YXJ0X3RpbWUgKyBkdXJhdGlvbiwgdGljayA9IG5vb3AsIGNzcyB9ID0gZm4obm9kZSwgeyBmcm9tLCB0byB9LCBwYXJhbXMpO1xuICAgIGxldCBydW5uaW5nID0gdHJ1ZTtcbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xuICAgIGxldCBuYW1lO1xuICAgIGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICBuYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMCwgMSwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkZWxheSkge1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc3RvcCgpIHtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIG5hbWUpO1xuICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgfVxuICAgIGxvb3Aobm93ID0+IHtcbiAgICAgICAgaWYgKCFzdGFydGVkICYmIG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICBzdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RhcnRlZCAmJiBub3cgPj0gZW5kKSB7XG4gICAgICAgICAgICB0aWNrKDEsIDApO1xuICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghcnVubmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdGFydGVkKSB7XG4gICAgICAgICAgICBjb25zdCBwID0gbm93IC0gc3RhcnRfdGltZTtcbiAgICAgICAgICAgIGNvbnN0IHQgPSAwICsgMSAqIGVhc2luZyhwIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gICAgc3RhcnQoKTtcbiAgICB0aWNrKDAsIDEpO1xuICAgIHJldHVybiBzdG9wO1xufVxuZnVuY3Rpb24gZml4X3Bvc2l0aW9uKG5vZGUpIHtcbiAgICBjb25zdCBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUobm9kZSk7XG4gICAgaWYgKHN0eWxlLnBvc2l0aW9uICE9PSAnYWJzb2x1dGUnICYmIHN0eWxlLnBvc2l0aW9uICE9PSAnZml4ZWQnKSB7XG4gICAgICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCB9ID0gc3R5bGU7XG4gICAgICAgIGNvbnN0IGEgPSBub2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICBub2RlLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgbm9kZS5zdHlsZS53aWR0aCA9IHdpZHRoO1xuICAgICAgICBub2RlLnN0eWxlLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgYWRkX3RyYW5zZm9ybShub2RlLCBhKTtcbiAgICB9XG59XG5mdW5jdGlvbiBhZGRfdHJhbnNmb3JtKG5vZGUsIGEpIHtcbiAgICBjb25zdCBiID0gbm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICBpZiAoYS5sZWZ0ICE9PSBiLmxlZnQgfHwgYS50b3AgIT09IGIudG9wKSB7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShub2RlKTtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtID0gc3R5bGUudHJhbnNmb3JtID09PSAnbm9uZScgPyAnJyA6IHN0eWxlLnRyYW5zZm9ybTtcbiAgICAgICAgbm9kZS5zdHlsZS50cmFuc2Zvcm0gPSBgJHt0cmFuc2Zvcm19IHRyYW5zbGF0ZSgke2EubGVmdCAtIGIubGVmdH1weCwgJHthLnRvcCAtIGIudG9wfXB4KWA7XG4gICAgfVxufVxuXG5sZXQgY3VycmVudF9jb21wb25lbnQ7XG5mdW5jdGlvbiBzZXRfY3VycmVudF9jb21wb25lbnQoY29tcG9uZW50KSB7XG4gICAgY3VycmVudF9jb21wb25lbnQgPSBjb21wb25lbnQ7XG59XG5mdW5jdGlvbiBnZXRfY3VycmVudF9jb21wb25lbnQoKSB7XG4gICAgaWYgKCFjdXJyZW50X2NvbXBvbmVudClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGdW5jdGlvbiBjYWxsZWQgb3V0c2lkZSBjb21wb25lbnQgaW5pdGlhbGl6YXRpb24nKTtcbiAgICByZXR1cm4gY3VycmVudF9jb21wb25lbnQ7XG59XG5mdW5jdGlvbiBiZWZvcmVVcGRhdGUoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5iZWZvcmVfdXBkYXRlLnB1c2goZm4pO1xufVxuZnVuY3Rpb24gb25Nb3VudChmbikge1xuICAgIGdldF9jdXJyZW50X2NvbXBvbmVudCgpLiQkLm9uX21vdW50LnB1c2goZm4pO1xufVxuZnVuY3Rpb24gYWZ0ZXJVcGRhdGUoZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5hZnRlcl91cGRhdGUucHVzaChmbik7XG59XG5mdW5jdGlvbiBvbkRlc3Ryb3koZm4pIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5vbl9kZXN0cm95LnB1c2goZm4pO1xufVxuZnVuY3Rpb24gY3JlYXRlRXZlbnREaXNwYXRjaGVyKCkge1xuICAgIGNvbnN0IGNvbXBvbmVudCA9IGdldF9jdXJyZW50X2NvbXBvbmVudCgpO1xuICAgIHJldHVybiAodHlwZSwgZGV0YWlsKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbdHlwZV07XG4gICAgICAgIGlmIChjYWxsYmFja3MpIHtcbiAgICAgICAgICAgIC8vIFRPRE8gYXJlIHRoZXJlIHNpdHVhdGlvbnMgd2hlcmUgZXZlbnRzIGNvdWxkIGJlIGRpc3BhdGNoZWRcbiAgICAgICAgICAgIC8vIGluIGEgc2VydmVyIChub24tRE9NKSBlbnZpcm9ubWVudD9cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gY3VzdG9tX2V2ZW50KHR5cGUsIGRldGFpbCk7XG4gICAgICAgICAgICBjYWxsYmFja3Muc2xpY2UoKS5mb3JFYWNoKGZuID0+IHtcbiAgICAgICAgICAgICAgICBmbi5jYWxsKGNvbXBvbmVudCwgZXZlbnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gc2V0Q29udGV4dChrZXksIGNvbnRleHQpIHtcbiAgICBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0LnNldChrZXksIGNvbnRleHQpO1xufVxuZnVuY3Rpb24gZ2V0Q29udGV4dChrZXkpIHtcbiAgICByZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5nZXQoa2V5KTtcbn1cbmZ1bmN0aW9uIGdldEFsbENvbnRleHRzKCkge1xuICAgIHJldHVybiBnZXRfY3VycmVudF9jb21wb25lbnQoKS4kJC5jb250ZXh0O1xufVxuZnVuY3Rpb24gaGFzQ29udGV4dChrZXkpIHtcbiAgICByZXR1cm4gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCkuJCQuY29udGV4dC5oYXMoa2V5KTtcbn1cbi8vIFRPRE8gZmlndXJlIG91dCBpZiB3ZSBzdGlsbCB3YW50IHRvIHN1cHBvcnRcbi8vIHNob3J0aGFuZCBldmVudHMsIG9yIGlmIHdlIHdhbnQgdG8gaW1wbGVtZW50XG4vLyBhIHJlYWwgYnViYmxpbmcgbWVjaGFuaXNtXG5mdW5jdGlvbiBidWJibGUoY29tcG9uZW50LCBldmVudCkge1xuICAgIGNvbnN0IGNhbGxiYWNrcyA9IGNvbXBvbmVudC4kJC5jYWxsYmFja3NbZXZlbnQudHlwZV07XG4gICAgaWYgKGNhbGxiYWNrcykge1xuICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgIGNhbGxiYWNrcy5zbGljZSgpLmZvckVhY2goZm4gPT4gZm4uY2FsbCh0aGlzLCBldmVudCkpO1xuICAgIH1cbn1cblxuY29uc3QgZGlydHlfY29tcG9uZW50cyA9IFtdO1xuY29uc3QgaW50cm9zID0geyBlbmFibGVkOiBmYWxzZSB9O1xuY29uc3QgYmluZGluZ19jYWxsYmFja3MgPSBbXTtcbmNvbnN0IHJlbmRlcl9jYWxsYmFja3MgPSBbXTtcbmNvbnN0IGZsdXNoX2NhbGxiYWNrcyA9IFtdO1xuY29uc3QgcmVzb2x2ZWRfcHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xubGV0IHVwZGF0ZV9zY2hlZHVsZWQgPSBmYWxzZTtcbmZ1bmN0aW9uIHNjaGVkdWxlX3VwZGF0ZSgpIHtcbiAgICBpZiAoIXVwZGF0ZV9zY2hlZHVsZWQpIHtcbiAgICAgICAgdXBkYXRlX3NjaGVkdWxlZCA9IHRydWU7XG4gICAgICAgIHJlc29sdmVkX3Byb21pc2UudGhlbihmbHVzaCk7XG4gICAgfVxufVxuZnVuY3Rpb24gdGljaygpIHtcbiAgICBzY2hlZHVsZV91cGRhdGUoKTtcbiAgICByZXR1cm4gcmVzb2x2ZWRfcHJvbWlzZTtcbn1cbmZ1bmN0aW9uIGFkZF9yZW5kZXJfY2FsbGJhY2soZm4pIHtcbiAgICByZW5kZXJfY2FsbGJhY2tzLnB1c2goZm4pO1xufVxuZnVuY3Rpb24gYWRkX2ZsdXNoX2NhbGxiYWNrKGZuKSB7XG4gICAgZmx1c2hfY2FsbGJhY2tzLnB1c2goZm4pO1xufVxuLy8gZmx1c2goKSBjYWxscyBjYWxsYmFja3MgaW4gdGhpcyBvcmRlcjpcbi8vIDEuIEFsbCBiZWZvcmVVcGRhdGUgY2FsbGJhY2tzLCBpbiBvcmRlcjogcGFyZW50cyBiZWZvcmUgY2hpbGRyZW5cbi8vIDIuIEFsbCBiaW5kOnRoaXMgY2FsbGJhY2tzLCBpbiByZXZlcnNlIG9yZGVyOiBjaGlsZHJlbiBiZWZvcmUgcGFyZW50cy5cbi8vIDMuIEFsbCBhZnRlclVwZGF0ZSBjYWxsYmFja3MsIGluIG9yZGVyOiBwYXJlbnRzIGJlZm9yZSBjaGlsZHJlbi4gRVhDRVBUXG4vLyAgICBmb3IgYWZ0ZXJVcGRhdGVzIGNhbGxlZCBkdXJpbmcgdGhlIGluaXRpYWwgb25Nb3VudCwgd2hpY2ggYXJlIGNhbGxlZCBpblxuLy8gICAgcmV2ZXJzZSBvcmRlcjogY2hpbGRyZW4gYmVmb3JlIHBhcmVudHMuXG4vLyBTaW5jZSBjYWxsYmFja3MgbWlnaHQgdXBkYXRlIGNvbXBvbmVudCB2YWx1ZXMsIHdoaWNoIGNvdWxkIHRyaWdnZXIgYW5vdGhlclxuLy8gY2FsbCB0byBmbHVzaCgpLCB0aGUgZm9sbG93aW5nIHN0ZXBzIGd1YXJkIGFnYWluc3QgdGhpczpcbi8vIDEuIER1cmluZyBiZWZvcmVVcGRhdGUsIGFueSB1cGRhdGVkIGNvbXBvbmVudHMgd2lsbCBiZSBhZGRlZCB0byB0aGVcbi8vICAgIGRpcnR5X2NvbXBvbmVudHMgYXJyYXkgYW5kIHdpbGwgY2F1c2UgYSByZWVudHJhbnQgY2FsbCB0byBmbHVzaCgpLiBCZWNhdXNlXG4vLyAgICB0aGUgZmx1c2ggaW5kZXggaXMga2VwdCBvdXRzaWRlIHRoZSBmdW5jdGlvbiwgdGhlIHJlZW50cmFudCBjYWxsIHdpbGwgcGlja1xuLy8gICAgdXAgd2hlcmUgdGhlIGVhcmxpZXIgY2FsbCBsZWZ0IG9mZiBhbmQgZ28gdGhyb3VnaCBhbGwgZGlydHkgY29tcG9uZW50cy4gVGhlXG4vLyAgICBjdXJyZW50X2NvbXBvbmVudCB2YWx1ZSBpcyBzYXZlZCBhbmQgcmVzdG9yZWQgc28gdGhhdCB0aGUgcmVlbnRyYW50IGNhbGwgd2lsbFxuLy8gICAgbm90IGludGVyZmVyZSB3aXRoIHRoZSBcInBhcmVudFwiIGZsdXNoKCkgY2FsbC5cbi8vIDIuIGJpbmQ6dGhpcyBjYWxsYmFja3MgY2Fubm90IHRyaWdnZXIgbmV3IGZsdXNoKCkgY2FsbHMuXG4vLyAzLiBEdXJpbmcgYWZ0ZXJVcGRhdGUsIGFueSB1cGRhdGVkIGNvbXBvbmVudHMgd2lsbCBOT1QgaGF2ZSB0aGVpciBhZnRlclVwZGF0ZVxuLy8gICAgY2FsbGJhY2sgY2FsbGVkIGEgc2Vjb25kIHRpbWU7IHRoZSBzZWVuX2NhbGxiYWNrcyBzZXQsIG91dHNpZGUgdGhlIGZsdXNoKClcbi8vICAgIGZ1bmN0aW9uLCBndWFyYW50ZWVzIHRoaXMgYmVoYXZpb3IuXG5jb25zdCBzZWVuX2NhbGxiYWNrcyA9IG5ldyBTZXQoKTtcbmxldCBmbHVzaGlkeCA9IDA7IC8vIERvICpub3QqIG1vdmUgdGhpcyBpbnNpZGUgdGhlIGZsdXNoKCkgZnVuY3Rpb25cbmZ1bmN0aW9uIGZsdXNoKCkge1xuICAgIGNvbnN0IHNhdmVkX2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuICAgIGRvIHtcbiAgICAgICAgLy8gZmlyc3QsIGNhbGwgYmVmb3JlVXBkYXRlIGZ1bmN0aW9uc1xuICAgICAgICAvLyBhbmQgdXBkYXRlIGNvbXBvbmVudHNcbiAgICAgICAgd2hpbGUgKGZsdXNoaWR4IDwgZGlydHlfY29tcG9uZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBvbmVudCA9IGRpcnR5X2NvbXBvbmVudHNbZmx1c2hpZHhdO1xuICAgICAgICAgICAgZmx1c2hpZHgrKztcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGNvbXBvbmVudC4kJCk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICBkaXJ0eV9jb21wb25lbnRzLmxlbmd0aCA9IDA7XG4gICAgICAgIGZsdXNoaWR4ID0gMDtcbiAgICAgICAgd2hpbGUgKGJpbmRpbmdfY2FsbGJhY2tzLmxlbmd0aClcbiAgICAgICAgICAgIGJpbmRpbmdfY2FsbGJhY2tzLnBvcCgpKCk7XG4gICAgICAgIC8vIHRoZW4sIG9uY2UgY29tcG9uZW50cyBhcmUgdXBkYXRlZCwgY2FsbFxuICAgICAgICAvLyBhZnRlclVwZGF0ZSBmdW5jdGlvbnMuIFRoaXMgbWF5IGNhdXNlXG4gICAgICAgIC8vIHN1YnNlcXVlbnQgdXBkYXRlcy4uLlxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlbmRlcl9jYWxsYmFja3MubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gcmVuZGVyX2NhbGxiYWNrc1tpXTtcbiAgICAgICAgICAgIGlmICghc2Vlbl9jYWxsYmFja3MuaGFzKGNhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIC8vIC4uLnNvIGd1YXJkIGFnYWluc3QgaW5maW5pdGUgbG9vcHNcbiAgICAgICAgICAgICAgICBzZWVuX2NhbGxiYWNrcy5hZGQoY2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmVuZGVyX2NhbGxiYWNrcy5sZW5ndGggPSAwO1xuICAgIH0gd2hpbGUgKGRpcnR5X2NvbXBvbmVudHMubGVuZ3RoKTtcbiAgICB3aGlsZSAoZmx1c2hfY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICBmbHVzaF9jYWxsYmFja3MucG9wKCkoKTtcbiAgICB9XG4gICAgdXBkYXRlX3NjaGVkdWxlZCA9IGZhbHNlO1xuICAgIHNlZW5fY2FsbGJhY2tzLmNsZWFyKCk7XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHNhdmVkX2NvbXBvbmVudCk7XG59XG5mdW5jdGlvbiB1cGRhdGUoJCQpIHtcbiAgICBpZiAoJCQuZnJhZ21lbnQgIT09IG51bGwpIHtcbiAgICAgICAgJCQudXBkYXRlKCk7XG4gICAgICAgIHJ1bl9hbGwoJCQuYmVmb3JlX3VwZGF0ZSk7XG4gICAgICAgIGNvbnN0IGRpcnR5ID0gJCQuZGlydHk7XG4gICAgICAgICQkLmRpcnR5ID0gWy0xXTtcbiAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQucCgkJC5jdHgsIGRpcnR5KTtcbiAgICAgICAgJCQuYWZ0ZXJfdXBkYXRlLmZvckVhY2goYWRkX3JlbmRlcl9jYWxsYmFjayk7XG4gICAgfVxufVxuXG5sZXQgcHJvbWlzZTtcbmZ1bmN0aW9uIHdhaXQoKSB7XG4gICAgaWYgKCFwcm9taXNlKSB7XG4gICAgICAgIHByb21pc2UgPSBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgcHJvbWlzZS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHByb21pc2UgPSBudWxsO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHByb21pc2U7XG59XG5mdW5jdGlvbiBkaXNwYXRjaChub2RlLCBkaXJlY3Rpb24sIGtpbmQpIHtcbiAgICBub2RlLmRpc3BhdGNoRXZlbnQoY3VzdG9tX2V2ZW50KGAke2RpcmVjdGlvbiA/ICdpbnRybycgOiAnb3V0cm8nfSR7a2luZH1gKSk7XG59XG5jb25zdCBvdXRyb2luZyA9IG5ldyBTZXQoKTtcbmxldCBvdXRyb3M7XG5mdW5jdGlvbiBncm91cF9vdXRyb3MoKSB7XG4gICAgb3V0cm9zID0ge1xuICAgICAgICByOiAwLFxuICAgICAgICBjOiBbXSxcbiAgICAgICAgcDogb3V0cm9zIC8vIHBhcmVudCBncm91cFxuICAgIH07XG59XG5mdW5jdGlvbiBjaGVja19vdXRyb3MoKSB7XG4gICAgaWYgKCFvdXRyb3Mucikge1xuICAgICAgICBydW5fYWxsKG91dHJvcy5jKTtcbiAgICB9XG4gICAgb3V0cm9zID0gb3V0cm9zLnA7XG59XG5mdW5jdGlvbiB0cmFuc2l0aW9uX2luKGJsb2NrLCBsb2NhbCkge1xuICAgIGlmIChibG9jayAmJiBibG9jay5pKSB7XG4gICAgICAgIG91dHJvaW5nLmRlbGV0ZShibG9jayk7XG4gICAgICAgIGJsb2NrLmkobG9jYWwpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHRyYW5zaXRpb25fb3V0KGJsb2NrLCBsb2NhbCwgZGV0YWNoLCBjYWxsYmFjaykge1xuICAgIGlmIChibG9jayAmJiBibG9jay5vKSB7XG4gICAgICAgIGlmIChvdXRyb2luZy5oYXMoYmxvY2spKVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICBvdXRyb2luZy5hZGQoYmxvY2spO1xuICAgICAgICBvdXRyb3MuYy5wdXNoKCgpID0+IHtcbiAgICAgICAgICAgIG91dHJvaW5nLmRlbGV0ZShibG9jayk7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoZGV0YWNoKVxuICAgICAgICAgICAgICAgICAgICBibG9jay5kKDEpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBibG9jay5vKGxvY2FsKTtcbiAgICB9XG59XG5jb25zdCBudWxsX3RyYW5zaXRpb24gPSB7IGR1cmF0aW9uOiAwIH07XG5mdW5jdGlvbiBjcmVhdGVfaW5fdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSBmYWxzZTtcbiAgICBsZXQgYW5pbWF0aW9uX25hbWU7XG4gICAgbGV0IHRhc2s7XG4gICAgbGV0IHVpZCA9IDA7XG4gICAgZnVuY3Rpb24gY2xlYW51cCgpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBnbygpIHtcbiAgICAgICAgY29uc3QgeyBkZWxheSA9IDAsIGR1cmF0aW9uID0gMzAwLCBlYXNpbmcgPSBpZGVudGl0eSwgdGljayA9IG5vb3AsIGNzcyB9ID0gY29uZmlnIHx8IG51bGxfdHJhbnNpdGlvbjtcbiAgICAgICAgaWYgKGNzcylcbiAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgMCwgMSwgZHVyYXRpb24sIGRlbGF5LCBlYXNpbmcsIGNzcywgdWlkKyspO1xuICAgICAgICB0aWNrKDAsIDEpO1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG4gICAgICAgIGlmICh0YXNrKVxuICAgICAgICAgICAgdGFzay5hYm9ydCgpO1xuICAgICAgICBydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCB0cnVlLCAnc3RhcnQnKSk7XG4gICAgICAgIHRhc2sgPSBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICBpZiAocnVubmluZykge1xuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gZW5kX3RpbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGljaygxLCAwKTtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgdHJ1ZSwgJ2VuZCcpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChub3cgPj0gc3RhcnRfdGltZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0ID0gZWFzaW5nKChub3cgLSBzdGFydF90aW1lKSAvIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmc7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBsZXQgc3RhcnRlZCA9IGZhbHNlO1xuICAgIHJldHVybiB7XG4gICAgICAgIHN0YXJ0KCkge1xuICAgICAgICAgICAgaWYgKHN0YXJ0ZWQpXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBkZWxldGVfcnVsZShub2RlKTtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgY29uZmlnID0gY29uZmlnKCk7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oZ28pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgaW52YWxpZGF0ZSgpIHtcbiAgICAgICAgICAgIHN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW5kKCkge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICAgICAgcnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZV9vdXRfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zKSB7XG4gICAgbGV0IGNvbmZpZyA9IGZuKG5vZGUsIHBhcmFtcyk7XG4gICAgbGV0IHJ1bm5pbmcgPSB0cnVlO1xuICAgIGxldCBhbmltYXRpb25fbmFtZTtcbiAgICBjb25zdCBncm91cCA9IG91dHJvcztcbiAgICBncm91cC5yICs9IDE7XG4gICAgZnVuY3Rpb24gZ28oKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGlmIChjc3MpXG4gICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIDEsIDAsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICBjb25zdCBzdGFydF90aW1lID0gbm93KCkgKyBkZWxheTtcbiAgICAgICAgY29uc3QgZW5kX3RpbWUgPSBzdGFydF90aW1lICsgZHVyYXRpb247XG4gICAgICAgIGFkZF9yZW5kZXJfY2FsbGJhY2soKCkgPT4gZGlzcGF0Y2gobm9kZSwgZmFsc2UsICdzdGFydCcpKTtcbiAgICAgICAgbG9vcChub3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAobm93ID49IGVuZF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIHRpY2soMCwgMSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIGZhbHNlLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghLS1ncm91cC5yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGlzIHdpbGwgcmVzdWx0IGluIGBlbmQoKWAgYmVpbmcgY2FsbGVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gd2UgZG9uJ3QgbmVlZCB0byBjbGVhbiB1cCBoZXJlXG4gICAgICAgICAgICAgICAgICAgICAgICBydW5fYWxsKGdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG5vdyA+PSBzdGFydF90aW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHQgPSBlYXNpbmcoKG5vdyAtIHN0YXJ0X3RpbWUpIC8gZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB0aWNrKDEgLSB0LCB0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcnVubmluZztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgIHdhaXQoKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEB0cy1pZ25vcmVcbiAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgZ28oKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBnbygpO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBlbmQocmVzZXQpIHtcbiAgICAgICAgICAgIGlmIChyZXNldCAmJiBjb25maWcudGljaykge1xuICAgICAgICAgICAgICAgIGNvbmZpZy50aWNrKDEsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJ1bm5pbmcpIHtcbiAgICAgICAgICAgICAgICBpZiAoYW5pbWF0aW9uX25hbWUpXG4gICAgICAgICAgICAgICAgICAgIGRlbGV0ZV9ydWxlKG5vZGUsIGFuaW1hdGlvbl9uYW1lKTtcbiAgICAgICAgICAgICAgICBydW5uaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gY3JlYXRlX2JpZGlyZWN0aW9uYWxfdHJhbnNpdGlvbihub2RlLCBmbiwgcGFyYW1zLCBpbnRybykge1xuICAgIGxldCBjb25maWcgPSBmbihub2RlLCBwYXJhbXMpO1xuICAgIGxldCB0ID0gaW50cm8gPyAwIDogMTtcbiAgICBsZXQgcnVubmluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICBsZXQgYW5pbWF0aW9uX25hbWUgPSBudWxsO1xuICAgIGZ1bmN0aW9uIGNsZWFyX2FuaW1hdGlvbigpIHtcbiAgICAgICAgaWYgKGFuaW1hdGlvbl9uYW1lKVxuICAgICAgICAgICAgZGVsZXRlX3J1bGUobm9kZSwgYW5pbWF0aW9uX25hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbml0KHByb2dyYW0sIGR1cmF0aW9uKSB7XG4gICAgICAgIGNvbnN0IGQgPSAocHJvZ3JhbS5iIC0gdCk7XG4gICAgICAgIGR1cmF0aW9uICo9IE1hdGguYWJzKGQpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYTogdCxcbiAgICAgICAgICAgIGI6IHByb2dyYW0uYixcbiAgICAgICAgICAgIGQsXG4gICAgICAgICAgICBkdXJhdGlvbixcbiAgICAgICAgICAgIHN0YXJ0OiBwcm9ncmFtLnN0YXJ0LFxuICAgICAgICAgICAgZW5kOiBwcm9ncmFtLnN0YXJ0ICsgZHVyYXRpb24sXG4gICAgICAgICAgICBncm91cDogcHJvZ3JhbS5ncm91cFxuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBnbyhiKSB7XG4gICAgICAgIGNvbnN0IHsgZGVsYXkgPSAwLCBkdXJhdGlvbiA9IDMwMCwgZWFzaW5nID0gaWRlbnRpdHksIHRpY2sgPSBub29wLCBjc3MgfSA9IGNvbmZpZyB8fCBudWxsX3RyYW5zaXRpb247XG4gICAgICAgIGNvbnN0IHByb2dyYW0gPSB7XG4gICAgICAgICAgICBzdGFydDogbm93KCkgKyBkZWxheSxcbiAgICAgICAgICAgIGJcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKCFiKSB7XG4gICAgICAgICAgICAvLyBAdHMtaWdub3JlIHRvZG86IGltcHJvdmUgdHlwaW5nc1xuICAgICAgICAgICAgcHJvZ3JhbS5ncm91cCA9IG91dHJvcztcbiAgICAgICAgICAgIG91dHJvcy5yICs9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pIHtcbiAgICAgICAgICAgIHBlbmRpbmdfcHJvZ3JhbSA9IHByb2dyYW07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBpZiB0aGlzIGlzIGFuIGludHJvLCBhbmQgdGhlcmUncyBhIGRlbGF5LCB3ZSBuZWVkIHRvIGRvXG4gICAgICAgICAgICAvLyBhbiBpbml0aWFsIHRpY2sgYW5kL29yIGFwcGx5IENTUyBhbmltYXRpb24gaW1tZWRpYXRlbHlcbiAgICAgICAgICAgIGlmIChjc3MpIHtcbiAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICBhbmltYXRpb25fbmFtZSA9IGNyZWF0ZV9ydWxlKG5vZGUsIHQsIGIsIGR1cmF0aW9uLCBkZWxheSwgZWFzaW5nLCBjc3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGIpXG4gICAgICAgICAgICAgICAgdGljaygwLCAxKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IGluaXQocHJvZ3JhbSwgZHVyYXRpb24pO1xuICAgICAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiBkaXNwYXRjaChub2RlLCBiLCAnc3RhcnQnKSk7XG4gICAgICAgICAgICBsb29wKG5vdyA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHBlbmRpbmdfcHJvZ3JhbSAmJiBub3cgPiBwZW5kaW5nX3Byb2dyYW0uc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcnVubmluZ19wcm9ncmFtID0gaW5pdChwZW5kaW5nX3Byb2dyYW0sIGR1cmF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcGVuZGluZ19wcm9ncmFtID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGF0Y2gobm9kZSwgcnVubmluZ19wcm9ncmFtLmIsICdzdGFydCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY3NzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbl9uYW1lID0gY3JlYXRlX3J1bGUobm9kZSwgdCwgcnVubmluZ19wcm9ncmFtLmIsIHJ1bm5pbmdfcHJvZ3JhbS5kdXJhdGlvbiwgMCwgZWFzaW5nLCBjb25maWcuY3NzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChub3cgPj0gcnVubmluZ19wcm9ncmFtLmVuZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0ID0gcnVubmluZ19wcm9ncmFtLmIsIDEgLSB0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BhdGNoKG5vZGUsIHJ1bm5pbmdfcHJvZ3JhbS5iLCAnZW5kJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXBlbmRpbmdfcHJvZ3JhbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHdlJ3JlIGRvbmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocnVubmluZ19wcm9ncmFtLmIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaW50cm8g4oCUIHdlIGNhbiB0aWR5IHVwIGltbWVkaWF0ZWx5XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyX2FuaW1hdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3V0cm8g4oCUIG5lZWRzIHRvIGJlIGNvb3JkaW5hdGVkXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghLS1ydW5uaW5nX3Byb2dyYW0uZ3JvdXAucilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJ1bl9hbGwocnVubmluZ19wcm9ncmFtLmdyb3VwLmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAobm93ID49IHJ1bm5pbmdfcHJvZ3JhbS5zdGFydCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcCA9IG5vdyAtIHJ1bm5pbmdfcHJvZ3JhbS5zdGFydDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHQgPSBydW5uaW5nX3Byb2dyYW0uYSArIHJ1bm5pbmdfcHJvZ3JhbS5kICogZWFzaW5nKHAgLyBydW5uaW5nX3Byb2dyYW0uZHVyYXRpb24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGljayh0LCAxIC0gdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICEhKHJ1bm5pbmdfcHJvZ3JhbSB8fCBwZW5kaW5nX3Byb2dyYW0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcnVuKGIpIHtcbiAgICAgICAgICAgIGlmIChpc19mdW5jdGlvbihjb25maWcpKSB7XG4gICAgICAgICAgICAgICAgd2FpdCgpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZyA9IGNvbmZpZygpO1xuICAgICAgICAgICAgICAgICAgICBnbyhiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGdvKGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbmQoKSB7XG4gICAgICAgICAgICBjbGVhcl9hbmltYXRpb24oKTtcbiAgICAgICAgICAgIHJ1bm5pbmdfcHJvZ3JhbSA9IHBlbmRpbmdfcHJvZ3JhbSA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5mdW5jdGlvbiBoYW5kbGVfcHJvbWlzZShwcm9taXNlLCBpbmZvKSB7XG4gICAgY29uc3QgdG9rZW4gPSBpbmZvLnRva2VuID0ge307XG4gICAgZnVuY3Rpb24gdXBkYXRlKHR5cGUsIGluZGV4LCBrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmIChpbmZvLnRva2VuICE9PSB0b2tlbilcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgaW5mby5yZXNvbHZlZCA9IHZhbHVlO1xuICAgICAgICBsZXQgY2hpbGRfY3R4ID0gaW5mby5jdHg7XG4gICAgICAgIGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2hpbGRfY3R4ID0gY2hpbGRfY3R4LnNsaWNlKCk7XG4gICAgICAgICAgICBjaGlsZF9jdHhba2V5XSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGJsb2NrID0gdHlwZSAmJiAoaW5mby5jdXJyZW50ID0gdHlwZSkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IG5lZWRzX2ZsdXNoID0gZmFsc2U7XG4gICAgICAgIGlmIChpbmZvLmJsb2NrKSB7XG4gICAgICAgICAgICBpZiAoaW5mby5ibG9ja3MpIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2Nrcy5mb3JFYWNoKChibG9jaywgaSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSAhPT0gaW5kZXggJiYgYmxvY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdyb3VwX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNpdGlvbl9vdXQoYmxvY2ssIDEsIDEsICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mby5ibG9ja3NbaV0gPT09IGJsb2NrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluZm8uYmxvY2tzW2ldID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNoZWNrX291dHJvcygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmZvLmJsb2NrLmQoMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBibG9jay5jKCk7XG4gICAgICAgICAgICB0cmFuc2l0aW9uX2luKGJsb2NrLCAxKTtcbiAgICAgICAgICAgIGJsb2NrLm0oaW5mby5tb3VudCgpLCBpbmZvLmFuY2hvcik7XG4gICAgICAgICAgICBuZWVkc19mbHVzaCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaW5mby5ibG9jayA9IGJsb2NrO1xuICAgICAgICBpZiAoaW5mby5ibG9ja3MpXG4gICAgICAgICAgICBpbmZvLmJsb2Nrc1tpbmRleF0gPSBibG9jaztcbiAgICAgICAgaWYgKG5lZWRzX2ZsdXNoKSB7XG4gICAgICAgICAgICBmbHVzaCgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChpc19wcm9taXNlKHByb21pc2UpKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRfY29tcG9uZW50ID0gZ2V0X2N1cnJlbnRfY29tcG9uZW50KCk7XG4gICAgICAgIHByb21pc2UudGhlbih2YWx1ZSA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8udGhlbiwgMSwgaW5mby52YWx1ZSwgdmFsdWUpO1xuICAgICAgICAgICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KG51bGwpO1xuICAgICAgICB9LCBlcnJvciA9PiB7XG4gICAgICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoY3VycmVudF9jb21wb25lbnQpO1xuICAgICAgICAgICAgdXBkYXRlKGluZm8uY2F0Y2gsIDIsIGluZm8uZXJyb3IsIGVycm9yKTtcbiAgICAgICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChudWxsKTtcbiAgICAgICAgICAgIGlmICghaW5mby5oYXNDYXRjaCkge1xuICAgICAgICAgICAgICAgIHRocm93IGVycm9yO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gaWYgd2UgcHJldmlvdXNseSBoYWQgYSB0aGVuL2NhdGNoIGJsb2NrLCBkZXN0cm95IGl0XG4gICAgICAgIGlmIChpbmZvLmN1cnJlbnQgIT09IGluZm8ucGVuZGluZykge1xuICAgICAgICAgICAgdXBkYXRlKGluZm8ucGVuZGluZywgMCk7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKGluZm8uY3VycmVudCAhPT0gaW5mby50aGVuKSB7XG4gICAgICAgICAgICB1cGRhdGUoaW5mby50aGVuLCAxLCBpbmZvLnZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGluZm8ucmVzb2x2ZWQgPSBwcm9taXNlO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHVwZGF0ZV9hd2FpdF9ibG9ja19icmFuY2goaW5mbywgY3R4LCBkaXJ0eSkge1xuICAgIGNvbnN0IGNoaWxkX2N0eCA9IGN0eC5zbGljZSgpO1xuICAgIGNvbnN0IHsgcmVzb2x2ZWQgfSA9IGluZm87XG4gICAgaWYgKGluZm8uY3VycmVudCA9PT0gaW5mby50aGVuKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLnZhbHVlXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpZiAoaW5mby5jdXJyZW50ID09PSBpbmZvLmNhdGNoKSB7XG4gICAgICAgIGNoaWxkX2N0eFtpbmZvLmVycm9yXSA9IHJlc29sdmVkO1xuICAgIH1cbiAgICBpbmZvLmJsb2NrLnAoY2hpbGRfY3R4LCBkaXJ0eSk7XG59XG5cbmNvbnN0IGdsb2JhbHMgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICA/IHdpbmRvd1xuICAgIDogdHlwZW9mIGdsb2JhbFRoaXMgIT09ICd1bmRlZmluZWQnXG4gICAgICAgID8gZ2xvYmFsVGhpc1xuICAgICAgICA6IGdsb2JhbCk7XG5cbmZ1bmN0aW9uIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIGJsb2NrLmQoMSk7XG4gICAgbG9va3VwLmRlbGV0ZShibG9jay5rZXkpO1xufVxuZnVuY3Rpb24gb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCkge1xuICAgIHRyYW5zaXRpb25fb3V0KGJsb2NrLCAxLCAxLCAoKSA9PiB7XG4gICAgICAgIGxvb2t1cC5kZWxldGUoYmxvY2sua2V5KTtcbiAgICB9KTtcbn1cbmZ1bmN0aW9uIGZpeF9hbmRfZGVzdHJveV9ibG9jayhibG9jaywgbG9va3VwKSB7XG4gICAgYmxvY2suZigpO1xuICAgIGRlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrKGJsb2NrLCBsb29rdXApIHtcbiAgICBibG9jay5mKCk7XG4gICAgb3V0cm9fYW5kX2Rlc3Ryb3lfYmxvY2soYmxvY2ssIGxvb2t1cCk7XG59XG5mdW5jdGlvbiB1cGRhdGVfa2V5ZWRfZWFjaChvbGRfYmxvY2tzLCBkaXJ0eSwgZ2V0X2tleSwgZHluYW1pYywgY3R4LCBsaXN0LCBsb29rdXAsIG5vZGUsIGRlc3Ryb3ksIGNyZWF0ZV9lYWNoX2Jsb2NrLCBuZXh0LCBnZXRfY29udGV4dCkge1xuICAgIGxldCBvID0gb2xkX2Jsb2Nrcy5sZW5ndGg7XG4gICAgbGV0IG4gPSBsaXN0Lmxlbmd0aDtcbiAgICBsZXQgaSA9IG87XG4gICAgY29uc3Qgb2xkX2luZGV4ZXMgPSB7fTtcbiAgICB3aGlsZSAoaS0tKVxuICAgICAgICBvbGRfaW5kZXhlc1tvbGRfYmxvY2tzW2ldLmtleV0gPSBpO1xuICAgIGNvbnN0IG5ld19ibG9ja3MgPSBbXTtcbiAgICBjb25zdCBuZXdfbG9va3VwID0gbmV3IE1hcCgpO1xuICAgIGNvbnN0IGRlbHRhcyA9IG5ldyBNYXAoKTtcbiAgICBpID0gbjtcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkX2N0eCA9IGdldF9jb250ZXh0KGN0eCwgbGlzdCwgaSk7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoY2hpbGRfY3R4KTtcbiAgICAgICAgbGV0IGJsb2NrID0gbG9va3VwLmdldChrZXkpO1xuICAgICAgICBpZiAoIWJsb2NrKSB7XG4gICAgICAgICAgICBibG9jayA9IGNyZWF0ZV9lYWNoX2Jsb2NrKGtleSwgY2hpbGRfY3R4KTtcbiAgICAgICAgICAgIGJsb2NrLmMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChkeW5hbWljKSB7XG4gICAgICAgICAgICBibG9jay5wKGNoaWxkX2N0eCwgZGlydHkpO1xuICAgICAgICB9XG4gICAgICAgIG5ld19sb29rdXAuc2V0KGtleSwgbmV3X2Jsb2Nrc1tpXSA9IGJsb2NrKTtcbiAgICAgICAgaWYgKGtleSBpbiBvbGRfaW5kZXhlcylcbiAgICAgICAgICAgIGRlbHRhcy5zZXQoa2V5LCBNYXRoLmFicyhpIC0gb2xkX2luZGV4ZXNba2V5XSkpO1xuICAgIH1cbiAgICBjb25zdCB3aWxsX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgY29uc3QgZGlkX21vdmUgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gaW5zZXJ0KGJsb2NrKSB7XG4gICAgICAgIHRyYW5zaXRpb25faW4oYmxvY2ssIDEpO1xuICAgICAgICBibG9jay5tKG5vZGUsIG5leHQpO1xuICAgICAgICBsb29rdXAuc2V0KGJsb2NrLmtleSwgYmxvY2spO1xuICAgICAgICBuZXh0ID0gYmxvY2suZmlyc3Q7XG4gICAgICAgIG4tLTtcbiAgICB9XG4gICAgd2hpbGUgKG8gJiYgbikge1xuICAgICAgICBjb25zdCBuZXdfYmxvY2sgPSBuZXdfYmxvY2tzW24gLSAxXTtcbiAgICAgICAgY29uc3Qgb2xkX2Jsb2NrID0gb2xkX2Jsb2Nrc1tvIC0gMV07XG4gICAgICAgIGNvbnN0IG5ld19rZXkgPSBuZXdfYmxvY2sua2V5O1xuICAgICAgICBjb25zdCBvbGRfa2V5ID0gb2xkX2Jsb2NrLmtleTtcbiAgICAgICAgaWYgKG5ld19ibG9jayA9PT0gb2xkX2Jsb2NrKSB7XG4gICAgICAgICAgICAvLyBkbyBub3RoaW5nXG4gICAgICAgICAgICBuZXh0ID0gbmV3X2Jsb2NrLmZpcnN0O1xuICAgICAgICAgICAgby0tO1xuICAgICAgICAgICAgbi0tO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKCFuZXdfbG9va3VwLmhhcyhvbGRfa2V5KSkge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIG9sZCBibG9ja1xuICAgICAgICAgICAgZGVzdHJveShvbGRfYmxvY2ssIGxvb2t1cCk7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoIWxvb2t1cC5oYXMobmV3X2tleSkgfHwgd2lsbF9tb3ZlLmhhcyhuZXdfa2V5KSkge1xuICAgICAgICAgICAgaW5zZXJ0KG5ld19ibG9jayk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGlkX21vdmUuaGFzKG9sZF9rZXkpKSB7XG4gICAgICAgICAgICBvLS07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZGVsdGFzLmdldChuZXdfa2V5KSA+IGRlbHRhcy5nZXQob2xkX2tleSkpIHtcbiAgICAgICAgICAgIGRpZF9tb3ZlLmFkZChuZXdfa2V5KTtcbiAgICAgICAgICAgIGluc2VydChuZXdfYmxvY2spO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgd2lsbF9tb3ZlLmFkZChvbGRfa2V5KTtcbiAgICAgICAgICAgIG8tLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoby0tKSB7XG4gICAgICAgIGNvbnN0IG9sZF9ibG9jayA9IG9sZF9ibG9ja3Nbb107XG4gICAgICAgIGlmICghbmV3X2xvb2t1cC5oYXMob2xkX2Jsb2NrLmtleSkpXG4gICAgICAgICAgICBkZXN0cm95KG9sZF9ibG9jaywgbG9va3VwKTtcbiAgICB9XG4gICAgd2hpbGUgKG4pXG4gICAgICAgIGluc2VydChuZXdfYmxvY2tzW24gLSAxXSk7XG4gICAgcmV0dXJuIG5ld19ibG9ja3M7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2tleXMoY3R4LCBsaXN0LCBnZXRfY29udGV4dCwgZ2V0X2tleSkge1xuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IGdldF9rZXkoZ2V0X2NvbnRleHQoY3R4LCBsaXN0LCBpKSk7XG4gICAgICAgIGlmIChrZXlzLmhhcyhrZXkpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBoYXZlIGR1cGxpY2F0ZSBrZXlzIGluIGEga2V5ZWQgZWFjaCcpO1xuICAgICAgICB9XG4gICAgICAgIGtleXMuYWRkKGtleSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRfc3ByZWFkX3VwZGF0ZShsZXZlbHMsIHVwZGF0ZXMpIHtcbiAgICBjb25zdCB1cGRhdGUgPSB7fTtcbiAgICBjb25zdCB0b19udWxsX291dCA9IHt9O1xuICAgIGNvbnN0IGFjY291bnRlZF9mb3IgPSB7ICQkc2NvcGU6IDEgfTtcbiAgICBsZXQgaSA9IGxldmVscy5sZW5ndGg7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjb25zdCBvID0gbGV2ZWxzW2ldO1xuICAgICAgICBjb25zdCBuID0gdXBkYXRlc1tpXTtcbiAgICAgICAgaWYgKG4pIHtcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIG8pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShrZXkgaW4gbikpXG4gICAgICAgICAgICAgICAgICAgIHRvX251bGxfb3V0W2tleV0gPSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yIChjb25zdCBrZXkgaW4gbikge1xuICAgICAgICAgICAgICAgIGlmICghYWNjb3VudGVkX2ZvcltrZXldKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gbltrZXldO1xuICAgICAgICAgICAgICAgICAgICBhY2NvdW50ZWRfZm9yW2tleV0gPSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldmVsc1tpXSA9IG47XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBvKSB7XG4gICAgICAgICAgICAgICAgYWNjb3VudGVkX2ZvcltrZXldID0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IGtleSBpbiB0b19udWxsX291dCkge1xuICAgICAgICBpZiAoIShrZXkgaW4gdXBkYXRlKSlcbiAgICAgICAgICAgIHVwZGF0ZVtrZXldID0gdW5kZWZpbmVkO1xuICAgIH1cbiAgICByZXR1cm4gdXBkYXRlO1xufVxuZnVuY3Rpb24gZ2V0X3NwcmVhZF9vYmplY3Qoc3ByZWFkX3Byb3BzKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBzcHJlYWRfcHJvcHMgPT09ICdvYmplY3QnICYmIHNwcmVhZF9wcm9wcyAhPT0gbnVsbCA/IHNwcmVhZF9wcm9wcyA6IHt9O1xufVxuXG4vLyBzb3VyY2U6IGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2luZGljZXMuaHRtbFxuY29uc3QgYm9vbGVhbl9hdHRyaWJ1dGVzID0gbmV3IFNldChbXG4gICAgJ2FsbG93ZnVsbHNjcmVlbicsXG4gICAgJ2FsbG93cGF5bWVudHJlcXVlc3QnLFxuICAgICdhc3luYycsXG4gICAgJ2F1dG9mb2N1cycsXG4gICAgJ2F1dG9wbGF5JyxcbiAgICAnY2hlY2tlZCcsXG4gICAgJ2NvbnRyb2xzJyxcbiAgICAnZGVmYXVsdCcsXG4gICAgJ2RlZmVyJyxcbiAgICAnZGlzYWJsZWQnLFxuICAgICdmb3Jtbm92YWxpZGF0ZScsXG4gICAgJ2hpZGRlbicsXG4gICAgJ2lzbWFwJyxcbiAgICAnbG9vcCcsXG4gICAgJ211bHRpcGxlJyxcbiAgICAnbXV0ZWQnLFxuICAgICdub21vZHVsZScsXG4gICAgJ25vdmFsaWRhdGUnLFxuICAgICdvcGVuJyxcbiAgICAncGxheXNpbmxpbmUnLFxuICAgICdyZWFkb25seScsXG4gICAgJ3JlcXVpcmVkJyxcbiAgICAncmV2ZXJzZWQnLFxuICAgICdzZWxlY3RlZCdcbl0pO1xuXG5jb25zdCBpbnZhbGlkX2F0dHJpYnV0ZV9uYW1lX2NoYXJhY3RlciA9IC9bXFxzJ1wiPi89XFx1e0ZERDB9LVxcdXtGREVGfVxcdXtGRkZFfVxcdXtGRkZGfVxcdXsxRkZGRX1cXHV7MUZGRkZ9XFx1ezJGRkZFfVxcdXsyRkZGRn1cXHV7M0ZGRkV9XFx1ezNGRkZGfVxcdXs0RkZGRX1cXHV7NEZGRkZ9XFx1ezVGRkZFfVxcdXs1RkZGRn1cXHV7NkZGRkV9XFx1ezZGRkZGfVxcdXs3RkZGRX1cXHV7N0ZGRkZ9XFx1ezhGRkZFfVxcdXs4RkZGRn1cXHV7OUZGRkV9XFx1ezlGRkZGfVxcdXtBRkZGRX1cXHV7QUZGRkZ9XFx1e0JGRkZFfVxcdXtCRkZGRn1cXHV7Q0ZGRkV9XFx1e0NGRkZGfVxcdXtERkZGRX1cXHV7REZGRkZ9XFx1e0VGRkZFfVxcdXtFRkZGRn1cXHV7RkZGRkV9XFx1e0ZGRkZGfVxcdXsxMEZGRkV9XFx1ezEwRkZGRn1dL3U7XG4vLyBodHRwczovL2h0bWwuc3BlYy53aGF0d2cub3JnL211bHRpcGFnZS9zeW50YXguaHRtbCNhdHRyaWJ1dGVzLTJcbi8vIGh0dHBzOi8vaW5mcmEuc3BlYy53aGF0d2cub3JnLyNub25jaGFyYWN0ZXJcbmZ1bmN0aW9uIHNwcmVhZChhcmdzLCBjbGFzc2VzX3RvX2FkZCkge1xuICAgIGNvbnN0IGF0dHJpYnV0ZXMgPSBPYmplY3QuYXNzaWduKHt9LCAuLi5hcmdzKTtcbiAgICBpZiAoY2xhc3Nlc190b19hZGQpIHtcbiAgICAgICAgaWYgKGF0dHJpYnV0ZXMuY2xhc3MgPT0gbnVsbCkge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyA9IGNsYXNzZXNfdG9fYWRkO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXR0cmlidXRlcy5jbGFzcyArPSAnICcgKyBjbGFzc2VzX3RvX2FkZDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsZXQgc3RyID0gJyc7XG4gICAgT2JqZWN0LmtleXMoYXR0cmlidXRlcykuZm9yRWFjaChuYW1lID0+IHtcbiAgICAgICAgaWYgKGludmFsaWRfYXR0cmlidXRlX25hbWVfY2hhcmFjdGVyLnRlc3QobmFtZSkpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgICAgaWYgKHZhbHVlID09PSB0cnVlKVxuICAgICAgICAgICAgc3RyICs9ICcgJyArIG5hbWU7XG4gICAgICAgIGVsc2UgaWYgKGJvb2xlYW5fYXR0cmlidXRlcy5oYXMobmFtZS50b0xvd2VyQ2FzZSgpKSkge1xuICAgICAgICAgICAgaWYgKHZhbHVlKVxuICAgICAgICAgICAgICAgIHN0ciArPSAnICcgKyBuYW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgICAgICAgIHN0ciArPSBgICR7bmFtZX09XCIke3ZhbHVlfVwiYDtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBzdHI7XG59XG5jb25zdCBlc2NhcGVkID0ge1xuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiMzOTsnLFxuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7J1xufTtcbmZ1bmN0aW9uIGVzY2FwZShodG1sKSB7XG4gICAgcmV0dXJuIFN0cmluZyhodG1sKS5yZXBsYWNlKC9bXCInJjw+XS9nLCBtYXRjaCA9PiBlc2NhcGVkW21hdGNoXSk7XG59XG5mdW5jdGlvbiBlc2NhcGVfYXR0cmlidXRlX3ZhbHVlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyBlc2NhcGUodmFsdWUpIDogdmFsdWU7XG59XG5mdW5jdGlvbiBlc2NhcGVfb2JqZWN0KG9iaikge1xuICAgIGNvbnN0IHJlc3VsdCA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgICAgICByZXN1bHRba2V5XSA9IGVzY2FwZV9hdHRyaWJ1dGVfdmFsdWUob2JqW2tleV0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuZnVuY3Rpb24gZWFjaChpdGVtcywgZm4pIHtcbiAgICBsZXQgc3RyID0gJyc7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpdGVtcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdHIgKz0gZm4oaXRlbXNbaV0sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyO1xufVxuY29uc3QgbWlzc2luZ19jb21wb25lbnQgPSB7XG4gICAgJCRyZW5kZXI6ICgpID0+ICcnXG59O1xuZnVuY3Rpb24gdmFsaWRhdGVfY29tcG9uZW50KGNvbXBvbmVudCwgbmFtZSkge1xuICAgIGlmICghY29tcG9uZW50IHx8ICFjb21wb25lbnQuJCRyZW5kZXIpIHtcbiAgICAgICAgaWYgKG5hbWUgPT09ICdzdmVsdGU6Y29tcG9uZW50JylcbiAgICAgICAgICAgIG5hbWUgKz0gJyB0aGlzPXsuLi59JztcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGA8JHtuYW1lfT4gaXMgbm90IGEgdmFsaWQgU1NSIGNvbXBvbmVudC4gWW91IG1heSBuZWVkIHRvIHJldmlldyB5b3VyIGJ1aWxkIGNvbmZpZyB0byBlbnN1cmUgdGhhdCBkZXBlbmRlbmNpZXMgYXJlIGNvbXBpbGVkLCByYXRoZXIgdGhhbiBpbXBvcnRlZCBhcyBwcmUtY29tcGlsZWQgbW9kdWxlc2ApO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50O1xufVxuZnVuY3Rpb24gZGVidWcoZmlsZSwgbGluZSwgY29sdW1uLCB2YWx1ZXMpIHtcbiAgICBjb25zb2xlLmxvZyhge0BkZWJ1Z30gJHtmaWxlID8gZmlsZSArICcgJyA6ICcnfSgke2xpbmV9OiR7Y29sdW1ufSlgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5sb2codmFsdWVzKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgcmV0dXJuICcnO1xufVxubGV0IG9uX2Rlc3Ryb3k7XG5mdW5jdGlvbiBjcmVhdGVfc3NyX2NvbXBvbmVudChmbikge1xuICAgIGZ1bmN0aW9uICQkcmVuZGVyKHJlc3VsdCwgcHJvcHMsIGJpbmRpbmdzLCBzbG90cywgY29udGV4dCkge1xuICAgICAgICBjb25zdCBwYXJlbnRfY29tcG9uZW50ID0gY3VycmVudF9jb21wb25lbnQ7XG4gICAgICAgIGNvbnN0ICQkID0ge1xuICAgICAgICAgICAgb25fZGVzdHJveSxcbiAgICAgICAgICAgIGNvbnRleHQ6IG5ldyBNYXAoY29udGV4dCB8fCAocGFyZW50X2NvbXBvbmVudCA/IHBhcmVudF9jb21wb25lbnQuJCQuY29udGV4dCA6IFtdKSksXG4gICAgICAgICAgICAvLyB0aGVzZSB3aWxsIGJlIGltbWVkaWF0ZWx5IGRpc2NhcmRlZFxuICAgICAgICAgICAgb25fbW91bnQ6IFtdLFxuICAgICAgICAgICAgYmVmb3JlX3VwZGF0ZTogW10sXG4gICAgICAgICAgICBhZnRlcl91cGRhdGU6IFtdLFxuICAgICAgICAgICAgY2FsbGJhY2tzOiBibGFua19vYmplY3QoKVxuICAgICAgICB9O1xuICAgICAgICBzZXRfY3VycmVudF9jb21wb25lbnQoeyAkJCB9KTtcbiAgICAgICAgY29uc3QgaHRtbCA9IGZuKHJlc3VsdCwgcHJvcHMsIGJpbmRpbmdzLCBzbG90cyk7XG4gICAgICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChwYXJlbnRfY29tcG9uZW50KTtcbiAgICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHJlbmRlcjogKHByb3BzID0ge30sIHsgJCRzbG90cyA9IHt9LCBjb250ZXh0ID0gbmV3IE1hcCgpIH0gPSB7fSkgPT4ge1xuICAgICAgICAgICAgb25fZGVzdHJveSA9IFtdO1xuICAgICAgICAgICAgY29uc3QgcmVzdWx0ID0geyB0aXRsZTogJycsIGhlYWQ6ICcnLCBjc3M6IG5ldyBTZXQoKSB9O1xuICAgICAgICAgICAgY29uc3QgaHRtbCA9ICQkcmVuZGVyKHJlc3VsdCwgcHJvcHMsIHt9LCAkJHNsb3RzLCBjb250ZXh0KTtcbiAgICAgICAgICAgIHJ1bl9hbGwob25fZGVzdHJveSk7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGh0bWwsXG4gICAgICAgICAgICAgICAgY3NzOiB7XG4gICAgICAgICAgICAgICAgICAgIGNvZGU6IEFycmF5LmZyb20ocmVzdWx0LmNzcykubWFwKGNzcyA9PiBjc3MuY29kZSkuam9pbignXFxuJyksXG4gICAgICAgICAgICAgICAgICAgIG1hcDogbnVsbCAvLyBUT0RPXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBoZWFkOiByZXN1bHQudGl0bGUgKyByZXN1bHQuaGVhZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgJCRyZW5kZXJcbiAgICB9O1xufVxuZnVuY3Rpb24gYWRkX2F0dHJpYnV0ZShuYW1lLCB2YWx1ZSwgYm9vbGVhbikge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsIHx8IChib29sZWFuICYmICF2YWx1ZSkpXG4gICAgICAgIHJldHVybiAnJztcbiAgICByZXR1cm4gYCAke25hbWV9JHt2YWx1ZSA9PT0gdHJ1ZSAmJiBib29sZWFuX2F0dHJpYnV0ZXMuaGFzKG5hbWUpID8gJycgOiBgPSR7dHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IEpTT04uc3RyaW5naWZ5KGVzY2FwZSh2YWx1ZSkpIDogYFwiJHt2YWx1ZX1cImB9YH1gO1xufVxuZnVuY3Rpb24gYWRkX2NsYXNzZXMoY2xhc3Nlcykge1xuICAgIHJldHVybiBjbGFzc2VzID8gYCBjbGFzcz1cIiR7Y2xhc3Nlc31cImAgOiAnJztcbn1cblxuZnVuY3Rpb24gYmluZChjb21wb25lbnQsIG5hbWUsIGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaW5kZXggPSBjb21wb25lbnQuJCQucHJvcHNbbmFtZV07XG4gICAgaWYgKGluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29tcG9uZW50LiQkLmJvdW5kW2luZGV4XSA9IGNhbGxiYWNrO1xuICAgICAgICBjYWxsYmFjayhjb21wb25lbnQuJCQuY3R4W2luZGV4XSk7XG4gICAgfVxufVxuZnVuY3Rpb24gY3JlYXRlX2NvbXBvbmVudChibG9jaykge1xuICAgIGJsb2NrICYmIGJsb2NrLmMoKTtcbn1cbmZ1bmN0aW9uIGNsYWltX2NvbXBvbmVudChibG9jaywgcGFyZW50X25vZGVzKSB7XG4gICAgYmxvY2sgJiYgYmxvY2subChwYXJlbnRfbm9kZXMpO1xufVxuZnVuY3Rpb24gbW91bnRfY29tcG9uZW50KGNvbXBvbmVudCwgdGFyZ2V0LCBhbmNob3IsIGN1c3RvbUVsZW1lbnQpIHtcbiAgICBjb25zdCB7IGZyYWdtZW50LCBvbl9tb3VudCwgb25fZGVzdHJveSwgYWZ0ZXJfdXBkYXRlIH0gPSBjb21wb25lbnQuJCQ7XG4gICAgZnJhZ21lbnQgJiYgZnJhZ21lbnQubSh0YXJnZXQsIGFuY2hvcik7XG4gICAgaWYgKCFjdXN0b21FbGVtZW50KSB7XG4gICAgICAgIC8vIG9uTW91bnQgaGFwcGVucyBiZWZvcmUgdGhlIGluaXRpYWwgYWZ0ZXJVcGRhdGVcbiAgICAgICAgYWRkX3JlbmRlcl9jYWxsYmFjaygoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdfb25fZGVzdHJveSA9IG9uX21vdW50Lm1hcChydW4pLmZpbHRlcihpc19mdW5jdGlvbik7XG4gICAgICAgICAgICBpZiAob25fZGVzdHJveSkge1xuICAgICAgICAgICAgICAgIG9uX2Rlc3Ryb3kucHVzaCguLi5uZXdfb25fZGVzdHJveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBFZGdlIGNhc2UgLSBjb21wb25lbnQgd2FzIGRlc3Ryb3llZCBpbW1lZGlhdGVseSxcbiAgICAgICAgICAgICAgICAvLyBtb3N0IGxpa2VseSBhcyBhIHJlc3VsdCBvZiBhIGJpbmRpbmcgaW5pdGlhbGlzaW5nXG4gICAgICAgICAgICAgICAgcnVuX2FsbChuZXdfb25fZGVzdHJveSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb21wb25lbnQuJCQub25fbW91bnQgPSBbXTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFmdGVyX3VwZGF0ZS5mb3JFYWNoKGFkZF9yZW5kZXJfY2FsbGJhY2spO1xufVxuZnVuY3Rpb24gZGVzdHJveV9jb21wb25lbnQoY29tcG9uZW50LCBkZXRhY2hpbmcpIHtcbiAgICBjb25zdCAkJCA9IGNvbXBvbmVudC4kJDtcbiAgICBpZiAoJCQuZnJhZ21lbnQgIT09IG51bGwpIHtcbiAgICAgICAgcnVuX2FsbCgkJC5vbl9kZXN0cm95KTtcbiAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuZChkZXRhY2hpbmcpO1xuICAgICAgICAvLyBUT0RPIG51bGwgb3V0IG90aGVyIHJlZnMsIGluY2x1ZGluZyBjb21wb25lbnQuJCQgKGJ1dCBuZWVkIHRvXG4gICAgICAgIC8vIHByZXNlcnZlIGZpbmFsIHN0YXRlPylcbiAgICAgICAgJCQub25fZGVzdHJveSA9ICQkLmZyYWdtZW50ID0gbnVsbDtcbiAgICAgICAgJCQuY3R4ID0gW107XG4gICAgfVxufVxuZnVuY3Rpb24gbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpIHtcbiAgICBpZiAoY29tcG9uZW50LiQkLmRpcnR5WzBdID09PSAtMSkge1xuICAgICAgICBkaXJ0eV9jb21wb25lbnRzLnB1c2goY29tcG9uZW50KTtcbiAgICAgICAgc2NoZWR1bGVfdXBkYXRlKCk7XG4gICAgICAgIGNvbXBvbmVudC4kJC5kaXJ0eS5maWxsKDApO1xuICAgIH1cbiAgICBjb21wb25lbnQuJCQuZGlydHlbKGkgLyAzMSkgfCAwXSB8PSAoMSA8PCAoaSAlIDMxKSk7XG59XG5mdW5jdGlvbiBpbml0KGNvbXBvbmVudCwgb3B0aW9ucywgaW5zdGFuY2UsIGNyZWF0ZV9mcmFnbWVudCwgbm90X2VxdWFsLCBwcm9wcywgYXBwZW5kX3N0eWxlcywgZGlydHkgPSBbLTFdKSB7XG4gICAgY29uc3QgcGFyZW50X2NvbXBvbmVudCA9IGN1cnJlbnRfY29tcG9uZW50O1xuICAgIHNldF9jdXJyZW50X2NvbXBvbmVudChjb21wb25lbnQpO1xuICAgIGNvbnN0ICQkID0gY29tcG9uZW50LiQkID0ge1xuICAgICAgICBmcmFnbWVudDogbnVsbCxcbiAgICAgICAgY3R4OiBudWxsLFxuICAgICAgICAvLyBzdGF0ZVxuICAgICAgICBwcm9wcyxcbiAgICAgICAgdXBkYXRlOiBub29wLFxuICAgICAgICBub3RfZXF1YWwsXG4gICAgICAgIGJvdW5kOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgLy8gbGlmZWN5Y2xlXG4gICAgICAgIG9uX21vdW50OiBbXSxcbiAgICAgICAgb25fZGVzdHJveTogW10sXG4gICAgICAgIG9uX2Rpc2Nvbm5lY3Q6IFtdLFxuICAgICAgICBiZWZvcmVfdXBkYXRlOiBbXSxcbiAgICAgICAgYWZ0ZXJfdXBkYXRlOiBbXSxcbiAgICAgICAgY29udGV4dDogbmV3IE1hcChvcHRpb25zLmNvbnRleHQgfHwgKHBhcmVudF9jb21wb25lbnQgPyBwYXJlbnRfY29tcG9uZW50LiQkLmNvbnRleHQgOiBbXSkpLFxuICAgICAgICAvLyBldmVyeXRoaW5nIGVsc2VcbiAgICAgICAgY2FsbGJhY2tzOiBibGFua19vYmplY3QoKSxcbiAgICAgICAgZGlydHksXG4gICAgICAgIHNraXBfYm91bmQ6IGZhbHNlLFxuICAgICAgICByb290OiBvcHRpb25zLnRhcmdldCB8fCBwYXJlbnRfY29tcG9uZW50LiQkLnJvb3RcbiAgICB9O1xuICAgIGFwcGVuZF9zdHlsZXMgJiYgYXBwZW5kX3N0eWxlcygkJC5yb290KTtcbiAgICBsZXQgcmVhZHkgPSBmYWxzZTtcbiAgICAkJC5jdHggPSBpbnN0YW5jZVxuICAgICAgICA/IGluc3RhbmNlKGNvbXBvbmVudCwgb3B0aW9ucy5wcm9wcyB8fCB7fSwgKGksIHJldCwgLi4ucmVzdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdmFsdWUgPSByZXN0Lmxlbmd0aCA/IHJlc3RbMF0gOiByZXQ7XG4gICAgICAgICAgICBpZiAoJCQuY3R4ICYmIG5vdF9lcXVhbCgkJC5jdHhbaV0sICQkLmN0eFtpXSA9IHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIGlmICghJCQuc2tpcF9ib3VuZCAmJiAkJC5ib3VuZFtpXSlcbiAgICAgICAgICAgICAgICAgICAgJCQuYm91bmRbaV0odmFsdWUpO1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSlcbiAgICAgICAgICAgICAgICAgICAgbWFrZV9kaXJ0eShjb21wb25lbnQsIGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfSlcbiAgICAgICAgOiBbXTtcbiAgICAkJC51cGRhdGUoKTtcbiAgICByZWFkeSA9IHRydWU7XG4gICAgcnVuX2FsbCgkJC5iZWZvcmVfdXBkYXRlKTtcbiAgICAvLyBgZmFsc2VgIGFzIGEgc3BlY2lhbCBjYXNlIG9mIG5vIERPTSBjb21wb25lbnRcbiAgICAkJC5mcmFnbWVudCA9IGNyZWF0ZV9mcmFnbWVudCA/IGNyZWF0ZV9mcmFnbWVudCgkJC5jdHgpIDogZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMudGFyZ2V0KSB7XG4gICAgICAgIGlmIChvcHRpb25zLmh5ZHJhdGUpIHtcbiAgICAgICAgICAgIHN0YXJ0X2h5ZHJhdGluZygpO1xuICAgICAgICAgICAgY29uc3Qgbm9kZXMgPSBjaGlsZHJlbihvcHRpb25zLnRhcmdldCk7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQubChub2Rlcyk7XG4gICAgICAgICAgICBub2Rlcy5mb3JFYWNoKGRldGFjaCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgICAgJCQuZnJhZ21lbnQgJiYgJCQuZnJhZ21lbnQuYygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLmludHJvKVxuICAgICAgICAgICAgdHJhbnNpdGlvbl9pbihjb21wb25lbnQuJCQuZnJhZ21lbnQpO1xuICAgICAgICBtb3VudF9jb21wb25lbnQoY29tcG9uZW50LCBvcHRpb25zLnRhcmdldCwgb3B0aW9ucy5hbmNob3IsIG9wdGlvbnMuY3VzdG9tRWxlbWVudCk7XG4gICAgICAgIGVuZF9oeWRyYXRpbmcoKTtcbiAgICAgICAgZmx1c2goKTtcbiAgICB9XG4gICAgc2V0X2N1cnJlbnRfY29tcG9uZW50KHBhcmVudF9jb21wb25lbnQpO1xufVxubGV0IFN2ZWx0ZUVsZW1lbnQ7XG5pZiAodHlwZW9mIEhUTUxFbGVtZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgU3ZlbHRlRWxlbWVudCA9IGNsYXNzIGV4dGVuZHMgSFRNTEVsZW1lbnQge1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICB0aGlzLmF0dGFjaFNoYWRvdyh7IG1vZGU6ICdvcGVuJyB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgIGNvbnN0IHsgb25fbW91bnQgfSA9IHRoaXMuJCQ7XG4gICAgICAgICAgICB0aGlzLiQkLm9uX2Rpc2Nvbm5lY3QgPSBvbl9tb3VudC5tYXAocnVuKS5maWx0ZXIoaXNfZnVuY3Rpb24pO1xuICAgICAgICAgICAgLy8gQHRzLWlnbm9yZSB0b2RvOiBpbXByb3ZlIHR5cGluZ3NcbiAgICAgICAgICAgIGZvciAoY29uc3Qga2V5IGluIHRoaXMuJCQuc2xvdHRlZCkge1xuICAgICAgICAgICAgICAgIC8vIEB0cy1pZ25vcmUgdG9kbzogaW1wcm92ZSB0eXBpbmdzXG4gICAgICAgICAgICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLiQkLnNsb3R0ZWRba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0cmlidXRlQ2hhbmdlZENhbGxiYWNrKGF0dHIsIF9vbGRWYWx1ZSwgbmV3VmFsdWUpIHtcbiAgICAgICAgICAgIHRoaXNbYXR0cl0gPSBuZXdWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBkaXNjb25uZWN0ZWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgIHJ1bl9hbGwodGhpcy4kJC5vbl9kaXNjb25uZWN0KTtcbiAgICAgICAgfVxuICAgICAgICAkZGVzdHJveSgpIHtcbiAgICAgICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICAgICAgdGhpcy4kZGVzdHJveSA9IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAvLyBUT0RPIHNob3VsZCB0aGlzIGRlbGVnYXRlIHRvIGFkZEV2ZW50TGlzdGVuZXI/XG4gICAgICAgICAgICBjb25zdCBjYWxsYmFja3MgPSAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gfHwgKHRoaXMuJCQuY2FsbGJhY2tzW3R5cGVdID0gW10pKTtcbiAgICAgICAgICAgIGNhbGxiYWNrcy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBjYWxsYmFja3MuaW5kZXhPZihjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgaWYgKGluZGV4ICE9PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICAgICAgaWYgKHRoaXMuJCRzZXQgJiYgIWlzX2VtcHR5KCQkcHJvcHMpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbn1cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgU3ZlbHRlIGNvbXBvbmVudHMuIFVzZWQgd2hlbiBkZXY9ZmFsc2UuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgJGRlc3Ryb3koKSB7XG4gICAgICAgIGRlc3Ryb3lfY29tcG9uZW50KHRoaXMsIDEpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gbm9vcDtcbiAgICB9XG4gICAgJG9uKHR5cGUsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNvbnN0IGNhbGxiYWNrcyA9ICh0aGlzLiQkLmNhbGxiYWNrc1t0eXBlXSB8fCAodGhpcy4kJC5jYWxsYmFja3NbdHlwZV0gPSBbXSkpO1xuICAgICAgICBjYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IGNhbGxiYWNrcy5pbmRleE9mKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpXG4gICAgICAgICAgICAgICAgY2FsbGJhY2tzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgICRzZXQoJCRwcm9wcykge1xuICAgICAgICBpZiAodGhpcy4kJHNldCAmJiAhaXNfZW1wdHkoJCRwcm9wcykpIHtcbiAgICAgICAgICAgIHRoaXMuJCQuc2tpcF9ib3VuZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLiQkc2V0KCQkcHJvcHMpO1xuICAgICAgICAgICAgdGhpcy4kJC5za2lwX2JvdW5kID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoX2Rldih0eXBlLCBkZXRhaWwpIHtcbiAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGN1c3RvbV9ldmVudCh0eXBlLCBPYmplY3QuYXNzaWduKHsgdmVyc2lvbjogJzMuNDUuMCcgfSwgZGV0YWlsKSwgdHJ1ZSkpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2Rldih0YXJnZXQsIG5vZGUpIHtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTUluc2VydCcsIHsgdGFyZ2V0LCBub2RlIH0pO1xuICAgIGFwcGVuZCh0YXJnZXQsIG5vZGUpO1xufVxuZnVuY3Rpb24gYXBwZW5kX2h5ZHJhdGlvbl9kZXYodGFyZ2V0LCBub2RlKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSB9KTtcbiAgICBhcHBlbmRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSk7XG59XG5mdW5jdGlvbiBpbnNlcnRfZGV2KHRhcmdldCwgbm9kZSwgYW5jaG9yKSB7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01JbnNlcnQnLCB7IHRhcmdldCwgbm9kZSwgYW5jaG9yIH0pO1xuICAgIGluc2VydCh0YXJnZXQsIG5vZGUsIGFuY2hvcik7XG59XG5mdW5jdGlvbiBpbnNlcnRfaHlkcmF0aW9uX2Rldih0YXJnZXQsIG5vZGUsIGFuY2hvcikge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NSW5zZXJ0JywgeyB0YXJnZXQsIG5vZGUsIGFuY2hvciB9KTtcbiAgICBpbnNlcnRfaHlkcmF0aW9uKHRhcmdldCwgbm9kZSwgYW5jaG9yKTtcbn1cbmZ1bmN0aW9uIGRldGFjaF9kZXYobm9kZSkge1xuICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlJywgeyBub2RlIH0pO1xuICAgIGRldGFjaChub2RlKTtcbn1cbmZ1bmN0aW9uIGRldGFjaF9iZXR3ZWVuX2RldihiZWZvcmUsIGFmdGVyKSB7XG4gICAgd2hpbGUgKGJlZm9yZS5uZXh0U2libGluZyAmJiBiZWZvcmUubmV4dFNpYmxpbmcgIT09IGFmdGVyKSB7XG4gICAgICAgIGRldGFjaF9kZXYoYmVmb3JlLm5leHRTaWJsaW5nKTtcbiAgICB9XG59XG5mdW5jdGlvbiBkZXRhY2hfYmVmb3JlX2RldihhZnRlcikge1xuICAgIHdoaWxlIChhZnRlci5wcmV2aW91c1NpYmxpbmcpIHtcbiAgICAgICAgZGV0YWNoX2RldihhZnRlci5wcmV2aW91c1NpYmxpbmcpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGRldGFjaF9hZnRlcl9kZXYoYmVmb3JlKSB7XG4gICAgd2hpbGUgKGJlZm9yZS5uZXh0U2libGluZykge1xuICAgICAgICBkZXRhY2hfZGV2KGJlZm9yZS5uZXh0U2libGluZyk7XG4gICAgfVxufVxuZnVuY3Rpb24gbGlzdGVuX2Rldihub2RlLCBldmVudCwgaGFuZGxlciwgb3B0aW9ucywgaGFzX3ByZXZlbnRfZGVmYXVsdCwgaGFzX3N0b3BfcHJvcGFnYXRpb24pIHtcbiAgICBjb25zdCBtb2RpZmllcnMgPSBvcHRpb25zID09PSB0cnVlID8gWydjYXB0dXJlJ10gOiBvcHRpb25zID8gQXJyYXkuZnJvbShPYmplY3Qua2V5cyhvcHRpb25zKSkgOiBbXTtcbiAgICBpZiAoaGFzX3ByZXZlbnRfZGVmYXVsdClcbiAgICAgICAgbW9kaWZpZXJzLnB1c2goJ3ByZXZlbnREZWZhdWx0Jyk7XG4gICAgaWYgKGhhc19zdG9wX3Byb3BhZ2F0aW9uKVxuICAgICAgICBtb2RpZmllcnMucHVzaCgnc3RvcFByb3BhZ2F0aW9uJyk7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01BZGRFdmVudExpc3RlbmVyJywgeyBub2RlLCBldmVudCwgaGFuZGxlciwgbW9kaWZpZXJzIH0pO1xuICAgIGNvbnN0IGRpc3Bvc2UgPSBsaXN0ZW4obm9kZSwgZXZlbnQsIGhhbmRsZXIsIG9wdGlvbnMpO1xuICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NUmVtb3ZlRXZlbnRMaXN0ZW5lcicsIHsgbm9kZSwgZXZlbnQsIGhhbmRsZXIsIG1vZGlmaWVycyB9KTtcbiAgICAgICAgZGlzcG9zZSgpO1xuICAgIH07XG59XG5mdW5jdGlvbiBhdHRyX2Rldihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKSB7XG4gICAgYXR0cihub2RlLCBhdHRyaWJ1dGUsIHZhbHVlKTtcbiAgICBpZiAodmFsdWUgPT0gbnVsbClcbiAgICAgICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01SZW1vdmVBdHRyaWJ1dGUnLCB7IG5vZGUsIGF0dHJpYnV0ZSB9KTtcbiAgICBlbHNlXG4gICAgICAgIGRpc3BhdGNoX2RldignU3ZlbHRlRE9NU2V0QXR0cmlidXRlJywgeyBub2RlLCBhdHRyaWJ1dGUsIHZhbHVlIH0pO1xufVxuZnVuY3Rpb24gcHJvcF9kZXYobm9kZSwgcHJvcGVydHksIHZhbHVlKSB7XG4gICAgbm9kZVtwcm9wZXJ0eV0gPSB2YWx1ZTtcbiAgICBkaXNwYXRjaF9kZXYoJ1N2ZWx0ZURPTVNldFByb3BlcnR5JywgeyBub2RlLCBwcm9wZXJ0eSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBkYXRhc2V0X2Rldihub2RlLCBwcm9wZXJ0eSwgdmFsdWUpIHtcbiAgICBub2RlLmRhdGFzZXRbcHJvcGVydHldID0gdmFsdWU7XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXREYXRhc2V0JywgeyBub2RlLCBwcm9wZXJ0eSwgdmFsdWUgfSk7XG59XG5mdW5jdGlvbiBzZXRfZGF0YV9kZXYodGV4dCwgZGF0YSkge1xuICAgIGRhdGEgPSAnJyArIGRhdGE7XG4gICAgaWYgKHRleHQud2hvbGVUZXh0ID09PSBkYXRhKVxuICAgICAgICByZXR1cm47XG4gICAgZGlzcGF0Y2hfZGV2KCdTdmVsdGVET01TZXREYXRhJywgeyBub2RlOiB0ZXh0LCBkYXRhIH0pO1xuICAgIHRleHQuZGF0YSA9IGRhdGE7XG59XG5mdW5jdGlvbiB2YWxpZGF0ZV9lYWNoX2FyZ3VtZW50KGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnICE9PSAnc3RyaW5nJyAmJiAhKGFyZyAmJiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiAnbGVuZ3RoJyBpbiBhcmcpKSB7XG4gICAgICAgIGxldCBtc2cgPSAneyNlYWNofSBvbmx5IGl0ZXJhdGVzIG92ZXIgYXJyYXktbGlrZSBvYmplY3RzLic7XG4gICAgICAgIGlmICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIGFyZyAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gYXJnKSB7XG4gICAgICAgICAgICBtc2cgKz0gJyBZb3UgY2FuIHVzZSBhIHNwcmVhZCB0byBjb252ZXJ0IHRoaXMgaXRlcmFibGUgaW50byBhbiBhcnJheS4nO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIHZhbGlkYXRlX3Nsb3RzKG5hbWUsIHNsb3QsIGtleXMpIHtcbiAgICBmb3IgKGNvbnN0IHNsb3Rfa2V5IG9mIE9iamVjdC5rZXlzKHNsb3QpKSB7XG4gICAgICAgIGlmICghfmtleXMuaW5kZXhPZihzbG90X2tleSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihgPCR7bmFtZX0+IHJlY2VpdmVkIGFuIHVuZXhwZWN0ZWQgc2xvdCBcIiR7c2xvdF9rZXl9XCIuYCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4vKipcbiAqIEJhc2UgY2xhc3MgZm9yIFN2ZWx0ZSBjb21wb25lbnRzIHdpdGggc29tZSBtaW5vciBkZXYtZW5oYW5jZW1lbnRzLiBVc2VkIHdoZW4gZGV2PXRydWUuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudERldiBleHRlbmRzIFN2ZWx0ZUNvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgICAgICBpZiAoIW9wdGlvbnMgfHwgKCFvcHRpb25zLnRhcmdldCAmJiAhb3B0aW9ucy4kJGlubGluZSkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIid0YXJnZXQnIGlzIGEgcmVxdWlyZWQgb3B0aW9uXCIpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuICAgICRkZXN0cm95KCkge1xuICAgICAgICBzdXBlci4kZGVzdHJveSgpO1xuICAgICAgICB0aGlzLiRkZXN0cm95ID0gKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdDb21wb25lbnQgd2FzIGFscmVhZHkgZGVzdHJveWVkJyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICB9O1xuICAgIH1cbiAgICAkY2FwdHVyZV9zdGF0ZSgpIHsgfVxuICAgICRpbmplY3Rfc3RhdGUoKSB7IH1cbn1cbi8qKlxuICogQmFzZSBjbGFzcyB0byBjcmVhdGUgc3Ryb25nbHkgdHlwZWQgU3ZlbHRlIGNvbXBvbmVudHMuXG4gKiBUaGlzIG9ubHkgZXhpc3RzIGZvciB0eXBpbmcgcHVycG9zZXMgYW5kIHNob3VsZCBiZSB1c2VkIGluIGAuZC50c2AgZmlsZXMuXG4gKlxuICogIyMjIEV4YW1wbGU6XG4gKlxuICogWW91IGhhdmUgY29tcG9uZW50IGxpYnJhcnkgb24gbnBtIGNhbGxlZCBgY29tcG9uZW50LWxpYnJhcnlgLCBmcm9tIHdoaWNoXG4gKiB5b3UgZXhwb3J0IGEgY29tcG9uZW50IGNhbGxlZCBgTXlDb21wb25lbnRgLiBGb3IgU3ZlbHRlK1R5cGVTY3JpcHQgdXNlcnMsXG4gKiB5b3Ugd2FudCB0byBwcm92aWRlIHR5cGluZ3MuIFRoZXJlZm9yZSB5b3UgY3JlYXRlIGEgYGluZGV4LmQudHNgOlxuICogYGBgdHNcbiAqIGltcG9ydCB7IFN2ZWx0ZUNvbXBvbmVudFR5cGVkIH0gZnJvbSBcInN2ZWx0ZVwiO1xuICogZXhwb3J0IGNsYXNzIE15Q29tcG9uZW50IGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50VHlwZWQ8e2Zvbzogc3RyaW5nfT4ge31cbiAqIGBgYFxuICogVHlwaW5nIHRoaXMgbWFrZXMgaXQgcG9zc2libGUgZm9yIElERXMgbGlrZSBWUyBDb2RlIHdpdGggdGhlIFN2ZWx0ZSBleHRlbnNpb25cbiAqIHRvIHByb3ZpZGUgaW50ZWxsaXNlbnNlIGFuZCB0byB1c2UgdGhlIGNvbXBvbmVudCBsaWtlIHRoaXMgaW4gYSBTdmVsdGUgZmlsZVxuICogd2l0aCBUeXBlU2NyaXB0OlxuICogYGBgc3ZlbHRlXG4gKiA8c2NyaXB0IGxhbmc9XCJ0c1wiPlxuICogXHRpbXBvcnQgeyBNeUNvbXBvbmVudCB9IGZyb20gXCJjb21wb25lbnQtbGlicmFyeVwiO1xuICogPC9zY3JpcHQ+XG4gKiA8TXlDb21wb25lbnQgZm9vPXsnYmFyJ30gLz5cbiAqIGBgYFxuICpcbiAqICMjIyMgV2h5IG5vdCBtYWtlIHRoaXMgcGFydCBvZiBgU3ZlbHRlQ29tcG9uZW50KERldilgP1xuICogQmVjYXVzZVxuICogYGBgdHNcbiAqIGNsYXNzIEFTdWJjbGFzc09mU3ZlbHRlQ29tcG9uZW50IGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50PHtmb286IHN0cmluZ30+IHt9XG4gKiBjb25zdCBjb21wb25lbnQ6IHR5cGVvZiBTdmVsdGVDb21wb25lbnQgPSBBU3ViY2xhc3NPZlN2ZWx0ZUNvbXBvbmVudDtcbiAqIGBgYFxuICogd2lsbCB0aHJvdyBhIHR5cGUgZXJyb3IsIHNvIHdlIG5lZWQgdG8gc2VwYXJhdGUgdGhlIG1vcmUgc3RyaWN0bHkgdHlwZWQgY2xhc3MuXG4gKi9cbmNsYXNzIFN2ZWx0ZUNvbXBvbmVudFR5cGVkIGV4dGVuZHMgU3ZlbHRlQ29tcG9uZW50RGV2IHtcbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG9wdGlvbnMpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGxvb3BfZ3VhcmQodGltZW91dCkge1xuICAgIGNvbnN0IHN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICBpZiAoRGF0ZS5ub3coKSAtIHN0YXJ0ID4gdGltZW91dCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbmZpbml0ZSBsb29wIGRldGVjdGVkJyk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuXG5leHBvcnQgeyBIdG1sVGFnLCBIdG1sVGFnSHlkcmF0aW9uLCBTdmVsdGVDb21wb25lbnQsIFN2ZWx0ZUNvbXBvbmVudERldiwgU3ZlbHRlQ29tcG9uZW50VHlwZWQsIFN2ZWx0ZUVsZW1lbnQsIGFjdGlvbl9kZXN0cm95ZXIsIGFkZF9hdHRyaWJ1dGUsIGFkZF9jbGFzc2VzLCBhZGRfZmx1c2hfY2FsbGJhY2ssIGFkZF9sb2NhdGlvbiwgYWRkX3JlbmRlcl9jYWxsYmFjaywgYWRkX3Jlc2l6ZV9saXN0ZW5lciwgYWRkX3RyYW5zZm9ybSwgYWZ0ZXJVcGRhdGUsIGFwcGVuZCwgYXBwZW5kX2RldiwgYXBwZW5kX2VtcHR5X3N0eWxlc2hlZXQsIGFwcGVuZF9oeWRyYXRpb24sIGFwcGVuZF9oeWRyYXRpb25fZGV2LCBhcHBlbmRfc3R5bGVzLCBhc3NpZ24sIGF0dHIsIGF0dHJfZGV2LCBhdHRyaWJ1dGVfdG9fb2JqZWN0LCBiZWZvcmVVcGRhdGUsIGJpbmQsIGJpbmRpbmdfY2FsbGJhY2tzLCBibGFua19vYmplY3QsIGJ1YmJsZSwgY2hlY2tfb3V0cm9zLCBjaGlsZHJlbiwgY2xhaW1fY29tcG9uZW50LCBjbGFpbV9lbGVtZW50LCBjbGFpbV9odG1sX3RhZywgY2xhaW1fc3BhY2UsIGNsYWltX3N2Z19lbGVtZW50LCBjbGFpbV90ZXh0LCBjbGVhcl9sb29wcywgY29tcG9uZW50X3N1YnNjcmliZSwgY29tcHV0ZV9yZXN0X3Byb3BzLCBjb21wdXRlX3Nsb3RzLCBjcmVhdGVFdmVudERpc3BhdGNoZXIsIGNyZWF0ZV9hbmltYXRpb24sIGNyZWF0ZV9iaWRpcmVjdGlvbmFsX3RyYW5zaXRpb24sIGNyZWF0ZV9jb21wb25lbnQsIGNyZWF0ZV9pbl90cmFuc2l0aW9uLCBjcmVhdGVfb3V0X3RyYW5zaXRpb24sIGNyZWF0ZV9zbG90LCBjcmVhdGVfc3NyX2NvbXBvbmVudCwgY3VycmVudF9jb21wb25lbnQsIGN1c3RvbV9ldmVudCwgZGF0YXNldF9kZXYsIGRlYnVnLCBkZXN0cm95X2Jsb2NrLCBkZXN0cm95X2NvbXBvbmVudCwgZGVzdHJveV9lYWNoLCBkZXRhY2gsIGRldGFjaF9hZnRlcl9kZXYsIGRldGFjaF9iZWZvcmVfZGV2LCBkZXRhY2hfYmV0d2Vlbl9kZXYsIGRldGFjaF9kZXYsIGRpcnR5X2NvbXBvbmVudHMsIGRpc3BhdGNoX2RldiwgZWFjaCwgZWxlbWVudCwgZWxlbWVudF9pcywgZW1wdHksIGVuZF9oeWRyYXRpbmcsIGVzY2FwZSwgZXNjYXBlX2F0dHJpYnV0ZV92YWx1ZSwgZXNjYXBlX29iamVjdCwgZXNjYXBlZCwgZXhjbHVkZV9pbnRlcm5hbF9wcm9wcywgZml4X2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfYW5kX291dHJvX2FuZF9kZXN0cm95X2Jsb2NrLCBmaXhfcG9zaXRpb24sIGZsdXNoLCBnZXRBbGxDb250ZXh0cywgZ2V0Q29udGV4dCwgZ2V0X2FsbF9kaXJ0eV9mcm9tX3Njb3BlLCBnZXRfYmluZGluZ19ncm91cF92YWx1ZSwgZ2V0X2N1cnJlbnRfY29tcG9uZW50LCBnZXRfY3VzdG9tX2VsZW1lbnRzX3Nsb3RzLCBnZXRfcm9vdF9mb3Jfc3R5bGUsIGdldF9zbG90X2NoYW5nZXMsIGdldF9zcHJlYWRfb2JqZWN0LCBnZXRfc3ByZWFkX3VwZGF0ZSwgZ2V0X3N0b3JlX3ZhbHVlLCBnbG9iYWxzLCBncm91cF9vdXRyb3MsIGhhbmRsZV9wcm9taXNlLCBoYXNDb250ZXh0LCBoYXNfcHJvcCwgaWRlbnRpdHksIGluaXQsIGluc2VydCwgaW5zZXJ0X2RldiwgaW5zZXJ0X2h5ZHJhdGlvbiwgaW5zZXJ0X2h5ZHJhdGlvbl9kZXYsIGludHJvcywgaW52YWxpZF9hdHRyaWJ1dGVfbmFtZV9jaGFyYWN0ZXIsIGlzX2NsaWVudCwgaXNfY3Jvc3NvcmlnaW4sIGlzX2VtcHR5LCBpc19mdW5jdGlvbiwgaXNfcHJvbWlzZSwgbGlzdGVuLCBsaXN0ZW5fZGV2LCBsb29wLCBsb29wX2d1YXJkLCBtaXNzaW5nX2NvbXBvbmVudCwgbW91bnRfY29tcG9uZW50LCBub29wLCBub3RfZXF1YWwsIG5vdywgbnVsbF90b19lbXB0eSwgb2JqZWN0X3dpdGhvdXRfcHJvcGVydGllcywgb25EZXN0cm95LCBvbk1vdW50LCBvbmNlLCBvdXRyb19hbmRfZGVzdHJveV9ibG9jaywgcHJldmVudF9kZWZhdWx0LCBwcm9wX2RldiwgcXVlcnlfc2VsZWN0b3JfYWxsLCByYWYsIHJ1biwgcnVuX2FsbCwgc2FmZV9ub3RfZXF1YWwsIHNjaGVkdWxlX3VwZGF0ZSwgc2VsZWN0X211bHRpcGxlX3ZhbHVlLCBzZWxlY3Rfb3B0aW9uLCBzZWxlY3Rfb3B0aW9ucywgc2VsZWN0X3ZhbHVlLCBzZWxmLCBzZXRDb250ZXh0LCBzZXRfYXR0cmlidXRlcywgc2V0X2N1cnJlbnRfY29tcG9uZW50LCBzZXRfY3VzdG9tX2VsZW1lbnRfZGF0YSwgc2V0X2RhdGEsIHNldF9kYXRhX2Rldiwgc2V0X2lucHV0X3R5cGUsIHNldF9pbnB1dF92YWx1ZSwgc2V0X25vdywgc2V0X3JhZiwgc2V0X3N0b3JlX3ZhbHVlLCBzZXRfc3R5bGUsIHNldF9zdmdfYXR0cmlidXRlcywgc3BhY2UsIHNwcmVhZCwgc3JjX3VybF9lcXVhbCwgc3RhcnRfaHlkcmF0aW5nLCBzdG9wX3Byb3BhZ2F0aW9uLCBzdWJzY3JpYmUsIHN2Z19lbGVtZW50LCB0ZXh0LCB0aWNrLCB0aW1lX3Jhbmdlc190b19hcnJheSwgdG9fbnVtYmVyLCB0b2dnbGVfY2xhc3MsIHRyYW5zaXRpb25faW4sIHRyYW5zaXRpb25fb3V0LCB0cnVzdGVkLCB1cGRhdGVfYXdhaXRfYmxvY2tfYnJhbmNoLCB1cGRhdGVfa2V5ZWRfZWFjaCwgdXBkYXRlX3Nsb3QsIHVwZGF0ZV9zbG90X2Jhc2UsIHZhbGlkYXRlX2NvbXBvbmVudCwgdmFsaWRhdGVfZWFjaF9hcmd1bWVudCwgdmFsaWRhdGVfZWFjaF9rZXlzLCB2YWxpZGF0ZV9zbG90cywgdmFsaWRhdGVfc3RvcmUsIHhsaW5rX2F0dHIgfTtcbiIsImltcG9ydCB7IG5vb3AsIHNhZmVfbm90X2VxdWFsLCBzdWJzY3JpYmUsIHJ1bl9hbGwsIGlzX2Z1bmN0aW9uIH0gZnJvbSAnLi4vaW50ZXJuYWwvaW5kZXgubWpzJztcbmV4cG9ydCB7IGdldF9zdG9yZV92YWx1ZSBhcyBnZXQgfSBmcm9tICcuLi9pbnRlcm5hbC9pbmRleC5tanMnO1xuXG5jb25zdCBzdWJzY3JpYmVyX3F1ZXVlID0gW107XG4vKipcbiAqIENyZWF0ZXMgYSBgUmVhZGFibGVgIHN0b3JlIHRoYXQgYWxsb3dzIHJlYWRpbmcgYnkgc3Vic2NyaXB0aW9uLlxuICogQHBhcmFtIHZhbHVlIGluaXRpYWwgdmFsdWVcbiAqIEBwYXJhbSB7U3RhcnRTdG9wTm90aWZpZXJ9c3RhcnQgc3RhcnQgYW5kIHN0b3Agbm90aWZpY2F0aW9ucyBmb3Igc3Vic2NyaXB0aW9uc1xuICovXG5mdW5jdGlvbiByZWFkYWJsZSh2YWx1ZSwgc3RhcnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdWJzY3JpYmU6IHdyaXRhYmxlKHZhbHVlLCBzdGFydCkuc3Vic2NyaWJlXG4gICAgfTtcbn1cbi8qKlxuICogQ3JlYXRlIGEgYFdyaXRhYmxlYCBzdG9yZSB0aGF0IGFsbG93cyBib3RoIHVwZGF0aW5nIGFuZCByZWFkaW5nIGJ5IHN1YnNjcmlwdGlvbi5cbiAqIEBwYXJhbSB7Kj19dmFsdWUgaW5pdGlhbCB2YWx1ZVxuICogQHBhcmFtIHtTdGFydFN0b3BOb3RpZmllcj19c3RhcnQgc3RhcnQgYW5kIHN0b3Agbm90aWZpY2F0aW9ucyBmb3Igc3Vic2NyaXB0aW9uc1xuICovXG5mdW5jdGlvbiB3cml0YWJsZSh2YWx1ZSwgc3RhcnQgPSBub29wKSB7XG4gICAgbGV0IHN0b3A7XG4gICAgY29uc3Qgc3Vic2NyaWJlcnMgPSBuZXcgU2V0KCk7XG4gICAgZnVuY3Rpb24gc2V0KG5ld192YWx1ZSkge1xuICAgICAgICBpZiAoc2FmZV9ub3RfZXF1YWwodmFsdWUsIG5ld192YWx1ZSkpIHtcbiAgICAgICAgICAgIHZhbHVlID0gbmV3X3ZhbHVlO1xuICAgICAgICAgICAgaWYgKHN0b3ApIHsgLy8gc3RvcmUgaXMgcmVhZHlcbiAgICAgICAgICAgICAgICBjb25zdCBydW5fcXVldWUgPSAhc3Vic2NyaWJlcl9xdWV1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBzdWJzY3JpYmVyIG9mIHN1YnNjcmliZXJzKSB7XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJbMV0oKTtcbiAgICAgICAgICAgICAgICAgICAgc3Vic2NyaWJlcl9xdWV1ZS5wdXNoKHN1YnNjcmliZXIsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHJ1bl9xdWV1ZSkge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHN1YnNjcmliZXJfcXVldWUubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJfcXVldWVbaV1bMF0oc3Vic2NyaWJlcl9xdWV1ZVtpICsgMV0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHN1YnNjcmliZXJfcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdXBkYXRlKGZuKSB7XG4gICAgICAgIHNldChmbih2YWx1ZSkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzdWJzY3JpYmUocnVuLCBpbnZhbGlkYXRlID0gbm9vcCkge1xuICAgICAgICBjb25zdCBzdWJzY3JpYmVyID0gW3J1biwgaW52YWxpZGF0ZV07XG4gICAgICAgIHN1YnNjcmliZXJzLmFkZChzdWJzY3JpYmVyKTtcbiAgICAgICAgaWYgKHN1YnNjcmliZXJzLnNpemUgPT09IDEpIHtcbiAgICAgICAgICAgIHN0b3AgPSBzdGFydChzZXQpIHx8IG5vb3A7XG4gICAgICAgIH1cbiAgICAgICAgcnVuKHZhbHVlKTtcbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHN1YnNjcmliZXJzLmRlbGV0ZShzdWJzY3JpYmVyKTtcbiAgICAgICAgICAgIGlmIChzdWJzY3JpYmVycy5zaXplID09PSAwKSB7XG4gICAgICAgICAgICAgICAgc3RvcCgpO1xuICAgICAgICAgICAgICAgIHN0b3AgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4geyBzZXQsIHVwZGF0ZSwgc3Vic2NyaWJlIH07XG59XG5mdW5jdGlvbiBkZXJpdmVkKHN0b3JlcywgZm4sIGluaXRpYWxfdmFsdWUpIHtcbiAgICBjb25zdCBzaW5nbGUgPSAhQXJyYXkuaXNBcnJheShzdG9yZXMpO1xuICAgIGNvbnN0IHN0b3Jlc19hcnJheSA9IHNpbmdsZVxuICAgICAgICA/IFtzdG9yZXNdXG4gICAgICAgIDogc3RvcmVzO1xuICAgIGNvbnN0IGF1dG8gPSBmbi5sZW5ndGggPCAyO1xuICAgIHJldHVybiByZWFkYWJsZShpbml0aWFsX3ZhbHVlLCAoc2V0KSA9PiB7XG4gICAgICAgIGxldCBpbml0ZWQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdmFsdWVzID0gW107XG4gICAgICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICAgICAgbGV0IGNsZWFudXAgPSBub29wO1xuICAgICAgICBjb25zdCBzeW5jID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjbGVhbnVwKCk7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBmbihzaW5nbGUgPyB2YWx1ZXNbMF0gOiB2YWx1ZXMsIHNldCk7XG4gICAgICAgICAgICBpZiAoYXV0bykge1xuICAgICAgICAgICAgICAgIHNldChyZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2xlYW51cCA9IGlzX2Z1bmN0aW9uKHJlc3VsdCkgPyByZXN1bHQgOiBub29wO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBjb25zdCB1bnN1YnNjcmliZXJzID0gc3RvcmVzX2FycmF5Lm1hcCgoc3RvcmUsIGkpID0+IHN1YnNjcmliZShzdG9yZSwgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB2YWx1ZXNbaV0gPSB2YWx1ZTtcbiAgICAgICAgICAgIHBlbmRpbmcgJj0gfigxIDw8IGkpO1xuICAgICAgICAgICAgaWYgKGluaXRlZCkge1xuICAgICAgICAgICAgICAgIHN5bmMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgcGVuZGluZyB8PSAoMSA8PCBpKTtcbiAgICAgICAgfSkpO1xuICAgICAgICBpbml0ZWQgPSB0cnVlO1xuICAgICAgICBzeW5jKCk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBzdG9wKCkge1xuICAgICAgICAgICAgcnVuX2FsbCh1bnN1YnNjcmliZXJzKTtcbiAgICAgICAgICAgIGNsZWFudXAoKTtcbiAgICAgICAgfTtcbiAgICB9KTtcbn1cblxuZXhwb3J0IHsgZGVyaXZlZCwgcmVhZGFibGUsIHdyaXRhYmxlIH07XG4iLCJpbXBvcnQgeyB3cml0YWJsZSB9IGZyb20gJ3N2ZWx0ZS9zdG9yZSc7XG5cbmV4cG9ydCBjb25zdCBDT05URVhUX0tFWSA9IHt9O1xuXG5leHBvcnQgY29uc3QgcHJlbG9hZCA9ICgpID0+ICh7fSk7IiwiPHNjcmlwdD5cbiAgZXhwb3J0IGxldCBzZWdtZW50O1xuPC9zY3JpcHQ+XG5cbjxzdHlsZT5cbiAgbmF2IHtcbiAgICBib3JkZXItdG9wOiAzcHggc29saWQgdmFyKC0tdGhlbWVDb2xvcik7XG4gICAgZm9udC13ZWlnaHQ6IDUwMDtcbiAgICB0ZXh0LXRyYW5zZm9ybTogdXBwZXJjYXNlO1xuICAgIGZvbnQtc2l6ZTogMC45cmVtO1xuICAgIHBvc2l0aW9uOiBzdGlja3k7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgcmlnaHQ6IDA7XG4gICAgbWluLWhlaWdodDogM3JlbTtcbiAgICAvKiBvdmVyZmxvdzogaGlkZGVuOyAqL1xuICAgIGJveC1zaXppbmc6IGNvbnRlbnQtYm94O1xuICAgIHotaW5kZXg6IDI0O1xuICAgIGJhY2tncm91bmQtY29sb3I6IHdoaXRlO1xuICB9XG5cbiAgbmF2IGRpdi5jb250ZW50V3JhcHBlciB7XG4gICAgZGlzcGxheTogZmxleDtcbiAgICBqdXN0aWZ5LWNvbnRlbnQ6IHNwYWNlLWJldHdlZW47XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgfVxuXG4gIHVsIHtcbiAgICBtYXJnaW46IDA7XG4gICAgcGFkZGluZzogMDtcbiAgfVxuXG4gIC8qIGNsZWFyZml4ICovXG4gIHVsOjphZnRlciB7XG4gICAgY29udGVudDogXCJcIjtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBjbGVhcjogYm90aDtcbiAgfVxuXG4gIGxpIHtcbiAgICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XG4gICAgcGFkZGluZzogMDtcbiAgICBtYXJnaW46IDAgMC44cmVtO1xuICB9XG5cbiAgYTo6YWZ0ZXIge1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBjb250ZW50OiBcIlwiO1xuICAgIHdpZHRoOiA4MCU7XG4gICAgbWFyZ2luLWxlZnQ6IDEwJTtcbiAgICBoZWlnaHQ6IDRweDtcbiAgICBib3JkZXItdG9wLWxlZnQtcmFkaXVzOiAzcHg7XG4gICAgYm9yZGVyLXRvcC1yaWdodC1yYWRpdXM6IDNweDtcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiB2YXIoLS10aGVtZUNvbG9yKTtcbiAgICBkaXNwbGF5OiBibG9jaztcbiAgICBib3R0b206IDA7XG4gICAgdHJhbnNmb3JtOiBzY2FsZVgoMCk7XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIDAuM3MgZWFzZTtcbiAgfVxuXG4gIGEuc2VsZWN0ZWQ6OmFmdGVyIHtcbiAgICB0cmFuc2Zvcm06IHNjYWxlWCgxKTtcbiAgfVxuXG4gIGEge1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgaGVpZ2h0OiAzcmVtO1xuICAgIGRpc3BsYXk6IGZsZXg7XG4gICAgYWxpZ24taXRlbXM6IGNlbnRlcjtcbiAgICB0cmFuc2l0aW9uOiBjb2xvciAwLjNzIGVhc2U7XG4gICAgY29sb3I6IHZhcigtLWRhcmtHcmV5KSAhaW1wb3J0YW50O1xuICB9XG5cbiAgcGljdHVyZS5sb2dvID4gKiB7XG4gICAgaGVpZ2h0OiAycmVtO1xuICAgIHdpZHRoOiA4LjMzcmVtO1xuICB9XG48L3N0eWxlPlxuXG48bmF2PlxuICA8ZGl2IGNsYXNzPVwiY29udGVudFdyYXBwZXJcIj5cbiAgICA8ZGl2IGNsYXNzPVwibG9nb1wiPlxuICAgICAgPGEgY2xhc3M6c2VsZWN0ZWQ9eyFzZWdtZW50fSBocmVmPVwiLlwiPlxuICAgICAgICA8cGljdHVyZSBjbGFzcz1cImxvZ29cIj5cbiAgICAgICAgICA8c291cmNlIHNyY3NldD1cImxvZ28ud2VicFwiIHR5cGU9XCJpbWFnZS93ZWJwXCIgLz5cbiAgICAgICAgICA8c291cmNlIHNyY3NldD1cImxvZ28ucG5nXCIgdHlwZT1cImltYWdlL3BuZ1wiIC8+XG4gICAgICAgICAgPGltZyBzcmM9XCJsb2dvLnBuZ1wiIGFsdD1cIlBhdHJpY2sgU2luZ2FsXCIgLz5cbiAgICAgICAgPC9waWN0dXJlPlxuICAgICAgPC9hPlxuICAgIDwvZGl2PlxuICAgIDx1bD5cbiAgICAgIDxsaT5cbiAgICAgICAgPGEgY2xhc3M6c2VsZWN0ZWQ9e3NlZ21lbnQgPT09ICdjdid9IGhyZWY9XCJjdlwiPlxuICAgICAgICAgIENWXG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG4gICAgICA8bGk+XG4gICAgICAgIDxhIGNsYXNzOnNlbGVjdGVkPXtzZWdtZW50ID09PSAncHJvamVjdHMnfSBocmVmPVwicHJvamVjdHNcIj5Qcm9qZWN0czwvYT5cbiAgICAgIDwvbGk+XG5cbiAgICAgIDxsaT5cbiAgICAgICAgPGEgY2xhc3M6c2VsZWN0ZWQ9e3NlZ21lbnQgPT09ICdxdmZ0J30gaHJlZj1cInF2ZnRcIj5cbiAgICAgICAgICBRVkZUXG4gICAgICAgIDwvYT5cbiAgICAgIDwvbGk+XG4gICAgICA8bGk+XG4gICAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL3BhdHJpY2tzaW5nYWxcIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCI+TGlua2VkSW48L2E+XG4gICAgICA8L2xpPlxuICAgIDwvdWw+XG4gIDwvZGl2PlxuPC9uYXY+XG4iLCI8c2NyaXB0PlxuICBpbXBvcnQgTmF2IGZyb20gXCIuLi9jb21wb25lbnRzL05hdi5zdmVsdGVcIjtcblxuICBleHBvcnQgbGV0IHNlZ21lbnQ7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICBtYWluIHtcbiAgICBtYXJnaW4tYm90dG9tOiAzcmVtO1xuICB9XG48L3N0eWxlPlxuXG48TmF2IHtzZWdtZW50fSAvPlxuPG1haW4+XG4gIDxzbG90IC8+XG48L21haW4+XG4iLCI8c2NyaXB0PlxuICBleHBvcnQgbGV0IHN0YXR1cztcbiAgZXhwb3J0IGxldCBlcnJvcjtcblxuICBjb25zdCBkZXYgPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gXCJkZXZlbG9wbWVudFwiO1xuPC9zY3JpcHQ+XG5cbjxzdmVsdGU6aGVhZD5cbiAgPHRpdGxlPntzdGF0dXN9PC90aXRsZT5cbjwvc3ZlbHRlOmhlYWQ+XG5cbjxoMT57c3RhdHVzfTwvaDE+XG5cbjxwPntlcnJvci5tZXNzYWdlfTwvcD5cblxueyNpZiBkZXYgJiYgZXJyb3Iuc3RhY2t9XG4gIDxwcmU+e2Vycm9yLnN0YWNrfTwvcHJlPlxuey9pZn1cbiIsIjwhLS0gVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBieSBTYXBwZXIg4oCUIGRvIG5vdCBlZGl0IGl0ISAtLT5cbjxzY3JpcHQ+XG5cdGltcG9ydCB7IHNldENvbnRleHQsIGFmdGVyVXBkYXRlIH0gZnJvbSAnc3ZlbHRlJztcblx0aW1wb3J0IHsgQ09OVEVYVF9LRVkgfSBmcm9tICcuL3NoYXJlZCc7XG5cdGltcG9ydCBMYXlvdXQgZnJvbSAnLi4vLi4vLi4vcm91dGVzL19sYXlvdXQuc3ZlbHRlJztcblx0aW1wb3J0IEVycm9yIGZyb20gJy4uLy4uLy4uL3JvdXRlcy9fZXJyb3Iuc3ZlbHRlJztcblxuXHRleHBvcnQgbGV0IHN0b3Jlcztcblx0ZXhwb3J0IGxldCBlcnJvcjtcblx0ZXhwb3J0IGxldCBzdGF0dXM7XG5cdGV4cG9ydCBsZXQgc2VnbWVudHM7XG5cdGV4cG9ydCBsZXQgbGV2ZWwwO1xuXHRleHBvcnQgbGV0IGxldmVsMSA9IG51bGw7XG5cdGV4cG9ydCBsZXQgbm90aWZ5O1xuXG5cdGFmdGVyVXBkYXRlKG5vdGlmeSk7XG5cdHNldENvbnRleHQoQ09OVEVYVF9LRVksIHN0b3Jlcyk7XG48L3NjcmlwdD5cblxuPExheW91dCBzZWdtZW50PVwie3NlZ21lbnRzWzBdfVwiIHsuLi5sZXZlbDAucHJvcHN9PlxuXHR7I2lmIGVycm9yfVxuXHRcdDxFcnJvciB7ZXJyb3J9IHtzdGF0dXN9Lz5cblx0ezplbHNlfVxuXHRcdDxzdmVsdGU6Y29tcG9uZW50IHRoaXM9XCJ7bGV2ZWwxLmNvbXBvbmVudH1cIiB7Li4ubGV2ZWwxLnByb3BzfS8+XG5cdHsvaWZ9XG48L0xheW91dD4iLCIvLyBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGJ5IFNhcHBlciDigJQgZG8gbm90IGVkaXQgaXQhXG5leHBvcnQgeyBkZWZhdWx0IGFzIFJvb3QgfSBmcm9tICcuLi8uLi8uLi9yb3V0ZXMvX2xheW91dC5zdmVsdGUnO1xuZXhwb3J0IHsgcHJlbG9hZCBhcyByb290X3ByZWxvYWQgfSBmcm9tICcuL3NoYXJlZCc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIEVycm9yQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vLi4vcm91dGVzL19lcnJvci5zdmVsdGUnO1xuXG5leHBvcnQgY29uc3QgaWdub3JlID0gWy9eXFwvaW5kZXhcXC5qc29uJC9dO1xuXG5leHBvcnQgY29uc3QgY29tcG9uZW50cyA9IFtcblx0e1xuXHRcdGpzOiAoKSA9PiBpbXBvcnQoXCIuLi8uLi8uLi9yb3V0ZXMvaW5kZXguc3ZlbHRlXCIpLFxuXHRcdGNzczogXCJfX1NBUFBFUl9DU1NfUExBQ0VIT0xERVI6aW5kZXguc3ZlbHRlX19cIlxuXHR9LFxuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9kYXNoYm9hcmQuc3ZlbHRlXCIpLFxuXHRcdGNzczogXCJfX1NBUFBFUl9DU1NfUExBQ0VIT0xERVI6ZGFzaGJvYXJkLnN2ZWx0ZV9fXCJcblx0fSxcblx0e1xuXHRcdGpzOiAoKSA9PiBpbXBvcnQoXCIuLi8uLi8uLi9yb3V0ZXMvcHJvamVjdHMuc3ZlbHRlXCIpLFxuXHRcdGNzczogXCJfX1NBUFBFUl9DU1NfUExBQ0VIT0xERVI6cHJvamVjdHMuc3ZlbHRlX19cIlxuXHR9LFxuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9xdmZ0LnN2ZWx0ZVwiKSxcblx0XHRjc3M6IFwiX19TQVBQRVJfQ1NTX1BMQUNFSE9MREVSOnF2ZnQuc3ZlbHRlX19cIlxuXHR9LFxuXHR7XG5cdFx0anM6ICgpID0+IGltcG9ydChcIi4uLy4uLy4uL3JvdXRlcy9jdi5zdmVsdGVcIiksXG5cdFx0Y3NzOiBcIl9fU0FQUEVSX0NTU19QTEFDRUhPTERFUjpjdi5zdmVsdGVfX1wiXG5cdH1cbl07XG5cbmV4cG9ydCBjb25zdCByb3V0ZXMgPSBbXG5cdHtcblx0XHQvLyBpbmRleC5zdmVsdGVcblx0XHRwYXR0ZXJuOiAvXlxcLyQvLFxuXHRcdHBhcnRzOiBbXG5cdFx0XHR7IGk6IDAgfVxuXHRcdF1cblx0fSxcblxuXHR7XG5cdFx0Ly8gZGFzaGJvYXJkLnN2ZWx0ZVxuXHRcdHBhdHRlcm46IC9eXFwvZGFzaGJvYXJkXFwvPyQvLFxuXHRcdHBhcnRzOiBbXG5cdFx0XHR7IGk6IDEgfVxuXHRcdF1cblx0fSxcblxuXHR7XG5cdFx0Ly8gcHJvamVjdHMuc3ZlbHRlXG5cdFx0cGF0dGVybjogL15cXC9wcm9qZWN0c1xcLz8kLyxcblx0XHRwYXJ0czogW1xuXHRcdFx0eyBpOiAyIH1cblx0XHRdXG5cdH0sXG5cblx0e1xuXHRcdC8vIHF2ZnQuc3ZlbHRlXG5cdFx0cGF0dGVybjogL15cXC9xdmZ0XFwvPyQvLFxuXHRcdHBhcnRzOiBbXG5cdFx0XHR7IGk6IDMgfVxuXHRcdF1cblx0fSxcblxuXHR7XG5cdFx0Ly8gY3Yuc3ZlbHRlXG5cdFx0cGF0dGVybjogL15cXC9jdlxcLz8kLyxcblx0XHRwYXJ0czogW1xuXHRcdFx0eyBpOiA0IH1cblx0XHRdXG5cdH1cbl07XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuXHRpbXBvcnQoXCIvVXNlcnMvcGpzaW5nYWwvRGVza3RvcC93ZWJzaXRlL3BlcnNvbmFsc2l0ZS9ub2RlX21vZHVsZXMvc2FwcGVyL3NhcHBlci1kZXYtY2xpZW50LmpzXCIpLnRoZW4oY2xpZW50ID0+IHtcblx0XHRjbGllbnQuY29ubmVjdCgxMDAwMCk7XG5cdH0pO1xufSIsImltcG9ydCB7IGdldENvbnRleHQgfSBmcm9tICdzdmVsdGUnO1xuaW1wb3J0IHsgQ09OVEVYVF9LRVkgfSBmcm9tICcuL2ludGVybmFsL3NoYXJlZCc7XG5pbXBvcnQgeyB3cml0YWJsZSB9IGZyb20gJ3N2ZWx0ZS9zdG9yZSc7XG5pbXBvcnQgQXBwIGZyb20gJy4vaW50ZXJuYWwvQXBwLnN2ZWx0ZSc7XG5pbXBvcnQgeyBpZ25vcmUsIHJvdXRlcywgcm9vdF9wcmVsb2FkLCBjb21wb25lbnRzLCBFcnJvckNvbXBvbmVudCB9IGZyb20gJy4vaW50ZXJuYWwvbWFuaWZlc3QtY2xpZW50JztcblxuZnVuY3Rpb24gZ290byhocmVmLCBvcHRzID0geyByZXBsYWNlU3RhdGU6IGZhbHNlIH0pIHtcblx0Y29uc3QgdGFyZ2V0ID0gc2VsZWN0X3RhcmdldChuZXcgVVJMKGhyZWYsIGRvY3VtZW50LmJhc2VVUkkpKTtcblxuXHRpZiAodGFyZ2V0KSB7XG5cdFx0X2hpc3Rvcnlbb3B0cy5yZXBsYWNlU3RhdGUgPyAncmVwbGFjZVN0YXRlJyA6ICdwdXNoU3RhdGUnXSh7IGlkOiBjaWQgfSwgJycsIGhyZWYpO1xuXHRcdHJldHVybiBuYXZpZ2F0ZSh0YXJnZXQsIG51bGwpLnRoZW4oKCkgPT4ge30pO1xuXHR9XG5cblx0bG9jYXRpb24uaHJlZiA9IGhyZWY7XG5cdHJldHVybiBuZXcgUHJvbWlzZShmID0+IHt9KTsgLy8gbmV2ZXIgcmVzb2x2ZXNcbn1cblxuLyoqIENhbGxiYWNrIHRvIGluZm9ybSBvZiBhIHZhbHVlIHVwZGF0ZXMuICovXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cblxuXG5cbmZ1bmN0aW9uIHBhZ2Vfc3RvcmUodmFsdWUpIHtcblx0Y29uc3Qgc3RvcmUgPSB3cml0YWJsZSh2YWx1ZSk7XG5cdGxldCByZWFkeSA9IHRydWU7XG5cblx0ZnVuY3Rpb24gbm90aWZ5KCkge1xuXHRcdHJlYWR5ID0gdHJ1ZTtcblx0XHRzdG9yZS51cGRhdGUodmFsID0+IHZhbCk7XG5cdH1cblxuXHRmdW5jdGlvbiBzZXQobmV3X3ZhbHVlKSB7XG5cdFx0cmVhZHkgPSBmYWxzZTtcblx0XHRzdG9yZS5zZXQobmV3X3ZhbHVlKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHN1YnNjcmliZShydW4pIHtcblx0XHRsZXQgb2xkX3ZhbHVlO1xuXHRcdHJldHVybiBzdG9yZS5zdWJzY3JpYmUoKHZhbHVlKSA9PiB7XG5cdFx0XHRpZiAob2xkX3ZhbHVlID09PSB1bmRlZmluZWQgfHwgKHJlYWR5ICYmIHZhbHVlICE9PSBvbGRfdmFsdWUpKSB7XG5cdFx0XHRcdHJ1bihvbGRfdmFsdWUgPSB2YWx1ZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4geyBub3RpZnksIHNldCwgc3Vic2NyaWJlIH07XG59XG5cbmNvbnN0IGluaXRpYWxfZGF0YSA9IHR5cGVvZiBfX1NBUFBFUl9fICE9PSAndW5kZWZpbmVkJyAmJiBfX1NBUFBFUl9fO1xuXG5sZXQgcmVhZHkgPSBmYWxzZTtcbmxldCByb290X2NvbXBvbmVudDtcbmxldCBjdXJyZW50X3Rva2VuO1xubGV0IHJvb3RfcHJlbG9hZGVkO1xubGV0IGN1cnJlbnRfYnJhbmNoID0gW107XG5sZXQgY3VycmVudF9xdWVyeSA9ICd7fSc7XG5cbmNvbnN0IHN0b3JlcyA9IHtcblx0cGFnZTogcGFnZV9zdG9yZSh7fSksXG5cdHByZWxvYWRpbmc6IHdyaXRhYmxlKG51bGwpLFxuXHRzZXNzaW9uOiB3cml0YWJsZShpbml0aWFsX2RhdGEgJiYgaW5pdGlhbF9kYXRhLnNlc3Npb24pXG59O1xuXG5sZXQgJHNlc3Npb247XG5sZXQgc2Vzc2lvbl9kaXJ0eTtcblxuc3RvcmVzLnNlc3Npb24uc3Vic2NyaWJlKGFzeW5jIHZhbHVlID0+IHtcblx0JHNlc3Npb24gPSB2YWx1ZTtcblxuXHRpZiAoIXJlYWR5KSByZXR1cm47XG5cdHNlc3Npb25fZGlydHkgPSB0cnVlO1xuXG5cdGNvbnN0IHRhcmdldCA9IHNlbGVjdF90YXJnZXQobmV3IFVSTChsb2NhdGlvbi5ocmVmKSk7XG5cblx0Y29uc3QgdG9rZW4gPSBjdXJyZW50X3Rva2VuID0ge307XG5cdGNvbnN0IHsgcmVkaXJlY3QsIHByb3BzLCBicmFuY2ggfSA9IGF3YWl0IGh5ZHJhdGVfdGFyZ2V0KHRhcmdldCk7XG5cdGlmICh0b2tlbiAhPT0gY3VycmVudF90b2tlbikgcmV0dXJuOyAvLyBhIHNlY29uZGFyeSBuYXZpZ2F0aW9uIGhhcHBlbmVkIHdoaWxlIHdlIHdlcmUgbG9hZGluZ1xuXG5cdGF3YWl0IHJlbmRlcihyZWRpcmVjdCwgYnJhbmNoLCBwcm9wcywgdGFyZ2V0LnBhZ2UpO1xufSk7XG5cbmxldCBwcmVmZXRjaGluZ1xuXG5cbiA9IG51bGw7XG5mdW5jdGlvbiBzZXRfcHJlZmV0Y2hpbmcoaHJlZiwgcHJvbWlzZSkge1xuXHRwcmVmZXRjaGluZyA9IHsgaHJlZiwgcHJvbWlzZSB9O1xufVxuXG5sZXQgdGFyZ2V0O1xuZnVuY3Rpb24gc2V0X3RhcmdldChlbGVtZW50KSB7XG5cdHRhcmdldCA9IGVsZW1lbnQ7XG59XG5cbmxldCB1aWQgPSAxO1xuZnVuY3Rpb24gc2V0X3VpZChuKSB7XG5cdHVpZCA9IG47XG59XG5cbmxldCBjaWQ7XG5mdW5jdGlvbiBzZXRfY2lkKG4pIHtcblx0Y2lkID0gbjtcbn1cblxuY29uc3QgX2hpc3RvcnkgPSB0eXBlb2YgaGlzdG9yeSAhPT0gJ3VuZGVmaW5lZCcgPyBoaXN0b3J5IDoge1xuXHRwdXNoU3RhdGU6IChzdGF0ZSwgdGl0bGUsIGhyZWYpID0+IHt9LFxuXHRyZXBsYWNlU3RhdGU6IChzdGF0ZSwgdGl0bGUsIGhyZWYpID0+IHt9LFxuXHRzY3JvbGxSZXN0b3JhdGlvbjogJydcbn07XG5cbmNvbnN0IHNjcm9sbF9oaXN0b3J5ID0ge307XG5cbmZ1bmN0aW9uIGV4dHJhY3RfcXVlcnkoc2VhcmNoKSB7XG5cdGNvbnN0IHF1ZXJ5ID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0aWYgKHNlYXJjaC5sZW5ndGggPiAwKSB7XG5cdFx0c2VhcmNoLnNsaWNlKDEpLnNwbGl0KCcmJykuZm9yRWFjaChzZWFyY2hQYXJhbSA9PiB7XG5cdFx0XHRsZXQgWywga2V5LCB2YWx1ZSA9ICcnXSA9IC8oW149XSopKD86PSguKikpPy8uZXhlYyhkZWNvZGVVUklDb21wb25lbnQoc2VhcmNoUGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykpKTtcblx0XHRcdGlmICh0eXBlb2YgcXVlcnlba2V5XSA9PT0gJ3N0cmluZycpIHF1ZXJ5W2tleV0gPSBbcXVlcnlba2V5XV07XG5cdFx0XHRpZiAodHlwZW9mIHF1ZXJ5W2tleV0gPT09ICdvYmplY3QnKSAocXVlcnlba2V5XSApLnB1c2godmFsdWUpO1xuXHRcdFx0ZWxzZSBxdWVyeVtrZXldID0gdmFsdWU7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIHF1ZXJ5O1xufVxuXG5mdW5jdGlvbiBzZWxlY3RfdGFyZ2V0KHVybCkge1xuXHRpZiAodXJsLm9yaWdpbiAhPT0gbG9jYXRpb24ub3JpZ2luKSByZXR1cm4gbnVsbDtcblx0aWYgKCF1cmwucGF0aG5hbWUuc3RhcnRzV2l0aChpbml0aWFsX2RhdGEuYmFzZVVybCkpIHJldHVybiBudWxsO1xuXG5cdGxldCBwYXRoID0gdXJsLnBhdGhuYW1lLnNsaWNlKGluaXRpYWxfZGF0YS5iYXNlVXJsLmxlbmd0aCk7XG5cblx0aWYgKHBhdGggPT09ICcnKSB7XG5cdFx0cGF0aCA9ICcvJztcblx0fVxuXG5cdC8vIGF2b2lkIGFjY2lkZW50YWwgY2xhc2hlcyBiZXR3ZWVuIHNlcnZlciByb3V0ZXMgYW5kIHBhZ2Ugcm91dGVzXG5cdGlmIChpZ25vcmUuc29tZShwYXR0ZXJuID0+IHBhdHRlcm4udGVzdChwYXRoKSkpIHJldHVybjtcblxuXHRmb3IgKGxldCBpID0gMDsgaSA8IHJvdXRlcy5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdGNvbnN0IHJvdXRlID0gcm91dGVzW2ldO1xuXG5cdFx0Y29uc3QgbWF0Y2ggPSByb3V0ZS5wYXR0ZXJuLmV4ZWMocGF0aCk7XG5cblx0XHRpZiAobWF0Y2gpIHtcblx0XHRcdGNvbnN0IHF1ZXJ5ID0gZXh0cmFjdF9xdWVyeSh1cmwuc2VhcmNoKTtcblx0XHRcdGNvbnN0IHBhcnQgPSByb3V0ZS5wYXJ0c1tyb3V0ZS5wYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRcdGNvbnN0IHBhcmFtcyA9IHBhcnQucGFyYW1zID8gcGFydC5wYXJhbXMobWF0Y2gpIDoge307XG5cblx0XHRcdGNvbnN0IHBhZ2UgPSB7IGhvc3Q6IGxvY2F0aW9uLmhvc3QsIHBhdGgsIHF1ZXJ5LCBwYXJhbXMgfTtcblxuXHRcdFx0cmV0dXJuIHsgaHJlZjogdXJsLmhyZWYsIHJvdXRlLCBtYXRjaCwgcGFnZSB9O1xuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBoYW5kbGVfZXJyb3IodXJsKSB7XG5cdGNvbnN0IHsgaG9zdCwgcGF0aG5hbWUsIHNlYXJjaCB9ID0gbG9jYXRpb247XG5cdGNvbnN0IHsgc2Vzc2lvbiwgcHJlbG9hZGVkLCBzdGF0dXMsIGVycm9yIH0gPSBpbml0aWFsX2RhdGE7XG5cblx0aWYgKCFyb290X3ByZWxvYWRlZCkge1xuXHRcdHJvb3RfcHJlbG9hZGVkID0gcHJlbG9hZGVkICYmIHByZWxvYWRlZFswXTtcblx0fVxuXG5cdGNvbnN0IHByb3BzID0ge1xuXHRcdGVycm9yLFxuXHRcdHN0YXR1cyxcblx0XHRzZXNzaW9uLFxuXHRcdGxldmVsMDoge1xuXHRcdFx0cHJvcHM6IHJvb3RfcHJlbG9hZGVkXG5cdFx0fSxcblx0XHRsZXZlbDE6IHtcblx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdHN0YXR1cyxcblx0XHRcdFx0ZXJyb3Jcblx0XHRcdH0sXG5cdFx0XHRjb21wb25lbnQ6IEVycm9yQ29tcG9uZW50XG5cdFx0fSxcblx0XHRzZWdtZW50czogcHJlbG9hZGVkXG5cblx0fTtcblx0Y29uc3QgcXVlcnkgPSBleHRyYWN0X3F1ZXJ5KHNlYXJjaCk7XG5cdHJlbmRlcihudWxsLCBbXSwgcHJvcHMsIHsgaG9zdCwgcGF0aDogcGF0aG5hbWUsIHF1ZXJ5LCBwYXJhbXM6IHt9IH0pO1xufVxuXG5mdW5jdGlvbiBzY3JvbGxfc3RhdGUoKSB7XG5cdHJldHVybiB7XG5cdFx0eDogcGFnZVhPZmZzZXQsXG5cdFx0eTogcGFnZVlPZmZzZXRcblx0fTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbmF2aWdhdGUodGFyZ2V0LCBpZCwgbm9zY3JvbGwsIGhhc2gpIHtcblx0aWYgKGlkKSB7XG5cdFx0Ly8gcG9wc3RhdGUgb3IgaW5pdGlhbCBuYXZpZ2F0aW9uXG5cdFx0Y2lkID0gaWQ7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgY3VycmVudF9zY3JvbGwgPSBzY3JvbGxfc3RhdGUoKTtcblxuXHRcdC8vIGNsaWNrZWQgb24gYSBsaW5rLiBwcmVzZXJ2ZSBzY3JvbGwgc3RhdGVcblx0XHRzY3JvbGxfaGlzdG9yeVtjaWRdID0gY3VycmVudF9zY3JvbGw7XG5cblx0XHRpZCA9IGNpZCA9ICsrdWlkO1xuXHRcdHNjcm9sbF9oaXN0b3J5W2NpZF0gPSBub3Njcm9sbCA/IGN1cnJlbnRfc2Nyb2xsIDogeyB4OiAwLCB5OiAwIH07XG5cdH1cblxuXHRjaWQgPSBpZDtcblxuXHRpZiAocm9vdF9jb21wb25lbnQpIHN0b3Jlcy5wcmVsb2FkaW5nLnNldCh0cnVlKTtcblxuXHRjb25zdCBsb2FkZWQgPSBwcmVmZXRjaGluZyAmJiBwcmVmZXRjaGluZy5ocmVmID09PSB0YXJnZXQuaHJlZiA/XG5cdFx0cHJlZmV0Y2hpbmcucHJvbWlzZSA6XG5cdFx0aHlkcmF0ZV90YXJnZXQodGFyZ2V0KTtcblxuXHRwcmVmZXRjaGluZyA9IG51bGw7XG5cblx0Y29uc3QgdG9rZW4gPSBjdXJyZW50X3Rva2VuID0ge307XG5cdGNvbnN0IHsgcmVkaXJlY3QsIHByb3BzLCBicmFuY2ggfSA9IGF3YWl0IGxvYWRlZDtcblx0aWYgKHRva2VuICE9PSBjdXJyZW50X3Rva2VuKSByZXR1cm47IC8vIGEgc2Vjb25kYXJ5IG5hdmlnYXRpb24gaGFwcGVuZWQgd2hpbGUgd2Ugd2VyZSBsb2FkaW5nXG5cblx0YXdhaXQgcmVuZGVyKHJlZGlyZWN0LCBicmFuY2gsIHByb3BzLCB0YXJnZXQucGFnZSk7XG5cdGlmIChkb2N1bWVudC5hY3RpdmVFbGVtZW50KSBkb2N1bWVudC5hY3RpdmVFbGVtZW50LmJsdXIoKTtcblxuXHRpZiAoIW5vc2Nyb2xsKSB7XG5cdFx0bGV0IHNjcm9sbCA9IHNjcm9sbF9oaXN0b3J5W2lkXTtcblxuXHRcdGlmIChoYXNoKSB7XG5cdFx0XHQvLyBzY3JvbGwgaXMgYW4gZWxlbWVudCBpZCAoZnJvbSBhIGhhc2gpLCB3ZSBuZWVkIHRvIGNvbXB1dGUgeS5cblx0XHRcdGNvbnN0IGRlZXBfbGlua2VkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaGFzaC5zbGljZSgxKSk7XG5cblx0XHRcdGlmIChkZWVwX2xpbmtlZCkge1xuXHRcdFx0XHRzY3JvbGwgPSB7XG5cdFx0XHRcdFx0eDogMCxcblx0XHRcdFx0XHR5OiBkZWVwX2xpbmtlZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyBzY3JvbGxZXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c2Nyb2xsX2hpc3RvcnlbY2lkXSA9IHNjcm9sbDtcblx0XHRpZiAoc2Nyb2xsKSBzY3JvbGxUbyhzY3JvbGwueCwgc2Nyb2xsLnkpO1xuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHJlbmRlcihyZWRpcmVjdCwgYnJhbmNoLCBwcm9wcywgcGFnZSkge1xuXHRpZiAocmVkaXJlY3QpIHJldHVybiBnb3RvKHJlZGlyZWN0LmxvY2F0aW9uLCB7IHJlcGxhY2VTdGF0ZTogdHJ1ZSB9KTtcblxuXHRzdG9yZXMucGFnZS5zZXQocGFnZSk7XG5cdHN0b3Jlcy5wcmVsb2FkaW5nLnNldChmYWxzZSk7XG5cblx0aWYgKHJvb3RfY29tcG9uZW50KSB7XG5cdFx0cm9vdF9jb21wb25lbnQuJHNldChwcm9wcyk7XG5cdH0gZWxzZSB7XG5cdFx0cHJvcHMuc3RvcmVzID0ge1xuXHRcdFx0cGFnZTogeyBzdWJzY3JpYmU6IHN0b3Jlcy5wYWdlLnN1YnNjcmliZSB9LFxuXHRcdFx0cHJlbG9hZGluZzogeyBzdWJzY3JpYmU6IHN0b3Jlcy5wcmVsb2FkaW5nLnN1YnNjcmliZSB9LFxuXHRcdFx0c2Vzc2lvbjogc3RvcmVzLnNlc3Npb25cblx0XHR9O1xuXHRcdHByb3BzLmxldmVsMCA9IHtcblx0XHRcdHByb3BzOiBhd2FpdCByb290X3ByZWxvYWRlZFxuXHRcdH07XG5cdFx0cHJvcHMubm90aWZ5ID0gc3RvcmVzLnBhZ2Uubm90aWZ5O1xuXG5cdFx0Ly8gZmlyc3QgbG9hZCDigJQgcmVtb3ZlIFNTUidkIDxoZWFkPiBjb250ZW50c1xuXHRcdGNvbnN0IHN0YXJ0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NhcHBlci1oZWFkLXN0YXJ0Jyk7XG5cdFx0Y29uc3QgZW5kID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NhcHBlci1oZWFkLWVuZCcpO1xuXG5cdFx0aWYgKHN0YXJ0ICYmIGVuZCkge1xuXHRcdFx0d2hpbGUgKHN0YXJ0Lm5leHRTaWJsaW5nICE9PSBlbmQpIGRldGFjaChzdGFydC5uZXh0U2libGluZyk7XG5cdFx0XHRkZXRhY2goc3RhcnQpO1xuXHRcdFx0ZGV0YWNoKGVuZCk7XG5cdFx0fVxuXG5cdFx0cm9vdF9jb21wb25lbnQgPSBuZXcgQXBwKHtcblx0XHRcdHRhcmdldCxcblx0XHRcdHByb3BzLFxuXHRcdFx0aHlkcmF0ZTogdHJ1ZVxuXHRcdH0pO1xuXHR9XG5cblx0Y3VycmVudF9icmFuY2ggPSBicmFuY2g7XG5cdGN1cnJlbnRfcXVlcnkgPSBKU09OLnN0cmluZ2lmeShwYWdlLnF1ZXJ5KTtcblx0cmVhZHkgPSB0cnVlO1xuXHRzZXNzaW9uX2RpcnR5ID0gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIHBhcnRfY2hhbmdlZChpLCBzZWdtZW50LCBtYXRjaCwgc3RyaW5naWZpZWRfcXVlcnkpIHtcblx0Ly8gVE9ETyBvbmx5IGNoZWNrIHF1ZXJ5IHN0cmluZyBjaGFuZ2VzIGZvciBwcmVsb2FkIGZ1bmN0aW9uc1xuXHQvLyB0aGF0IGRvIGluIGZhY3QgZGVwZW5kIG9uIGl0ICh1c2luZyBzdGF0aWMgYW5hbHlzaXMgb3Jcblx0Ly8gcnVudGltZSBpbnN0cnVtZW50YXRpb24pXG5cdGlmIChzdHJpbmdpZmllZF9xdWVyeSAhPT0gY3VycmVudF9xdWVyeSkgcmV0dXJuIHRydWU7XG5cblx0Y29uc3QgcHJldmlvdXMgPSBjdXJyZW50X2JyYW5jaFtpXTtcblxuXHRpZiAoIXByZXZpb3VzKSByZXR1cm4gZmFsc2U7XG5cdGlmIChzZWdtZW50ICE9PSBwcmV2aW91cy5zZWdtZW50KSByZXR1cm4gdHJ1ZTtcblx0aWYgKHByZXZpb3VzLm1hdGNoKSB7XG5cdFx0aWYgKEpTT04uc3RyaW5naWZ5KHByZXZpb3VzLm1hdGNoLnNsaWNlKDEsIGkgKyAyKSkgIT09IEpTT04uc3RyaW5naWZ5KG1hdGNoLnNsaWNlKDEsIGkgKyAyKSkpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxufVxuXG5hc3luYyBmdW5jdGlvbiBoeWRyYXRlX3RhcmdldCh0YXJnZXQpXG5cblxuXG4ge1xuXHRjb25zdCB7IHJvdXRlLCBwYWdlIH0gPSB0YXJnZXQ7XG5cdGNvbnN0IHNlZ21lbnRzID0gcGFnZS5wYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pO1xuXG5cdGxldCByZWRpcmVjdCA9IG51bGw7XG5cblx0Y29uc3QgcHJvcHMgPSB7IGVycm9yOiBudWxsLCBzdGF0dXM6IDIwMCwgc2VnbWVudHM6IFtzZWdtZW50c1swXV0gfTtcblxuXHRjb25zdCBwcmVsb2FkX2NvbnRleHQgPSB7XG5cdFx0ZmV0Y2g6ICh1cmwsIG9wdHMpID0+IGZldGNoKHVybCwgb3B0cyksXG5cdFx0cmVkaXJlY3Q6IChzdGF0dXNDb2RlLCBsb2NhdGlvbikgPT4ge1xuXHRcdFx0aWYgKHJlZGlyZWN0ICYmIChyZWRpcmVjdC5zdGF0dXNDb2RlICE9PSBzdGF0dXNDb2RlIHx8IHJlZGlyZWN0LmxvY2F0aW9uICE9PSBsb2NhdGlvbikpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDb25mbGljdGluZyByZWRpcmVjdHNgKTtcblx0XHRcdH1cblx0XHRcdHJlZGlyZWN0ID0geyBzdGF0dXNDb2RlLCBsb2NhdGlvbiB9O1xuXHRcdH0sXG5cdFx0ZXJyb3I6IChzdGF0dXMsIGVycm9yKSA9PiB7XG5cdFx0XHRwcm9wcy5lcnJvciA9IHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycgPyBuZXcgRXJyb3IoZXJyb3IpIDogZXJyb3I7XG5cdFx0XHRwcm9wcy5zdGF0dXMgPSBzdGF0dXM7XG5cdFx0fVxuXHR9O1xuXG5cdGlmICghcm9vdF9wcmVsb2FkZWQpIHtcblx0XHRyb290X3ByZWxvYWRlZCA9IGluaXRpYWxfZGF0YS5wcmVsb2FkZWRbMF0gfHwgcm9vdF9wcmVsb2FkLmNhbGwocHJlbG9hZF9jb250ZXh0LCB7XG5cdFx0XHRob3N0OiBwYWdlLmhvc3QsXG5cdFx0XHRwYXRoOiBwYWdlLnBhdGgsXG5cdFx0XHRxdWVyeTogcGFnZS5xdWVyeSxcblx0XHRcdHBhcmFtczoge31cblx0XHR9LCAkc2Vzc2lvbik7XG5cdH1cblxuXHRsZXQgYnJhbmNoO1xuXHRsZXQgbCA9IDE7XG5cblx0dHJ5IHtcblx0XHRjb25zdCBzdHJpbmdpZmllZF9xdWVyeSA9IEpTT04uc3RyaW5naWZ5KHBhZ2UucXVlcnkpO1xuXHRcdGNvbnN0IG1hdGNoID0gcm91dGUucGF0dGVybi5leGVjKHBhZ2UucGF0aCk7XG5cblx0XHRsZXQgc2VnbWVudF9kaXJ0eSA9IGZhbHNlO1xuXG5cdFx0YnJhbmNoID0gYXdhaXQgUHJvbWlzZS5hbGwocm91dGUucGFydHMubWFwKGFzeW5jIChwYXJ0LCBpKSA9PiB7XG5cdFx0XHRjb25zdCBzZWdtZW50ID0gc2VnbWVudHNbaV07XG5cblx0XHRcdGlmIChwYXJ0X2NoYW5nZWQoaSwgc2VnbWVudCwgbWF0Y2gsIHN0cmluZ2lmaWVkX3F1ZXJ5KSkgc2VnbWVudF9kaXJ0eSA9IHRydWU7XG5cblx0XHRcdHByb3BzLnNlZ21lbnRzW2xdID0gc2VnbWVudHNbaSArIDFdOyAvLyBUT0RPIG1ha2UgdGhpcyBsZXNzIGNvbmZ1c2luZ1xuXHRcdFx0aWYgKCFwYXJ0KSByZXR1cm4geyBzZWdtZW50IH07XG5cblx0XHRcdGNvbnN0IGogPSBsKys7XG5cblx0XHRcdGlmICghc2Vzc2lvbl9kaXJ0eSAmJiAhc2VnbWVudF9kaXJ0eSAmJiBjdXJyZW50X2JyYW5jaFtpXSAmJiBjdXJyZW50X2JyYW5jaFtpXS5wYXJ0ID09PSBwYXJ0LmkpIHtcblx0XHRcdFx0cmV0dXJuIGN1cnJlbnRfYnJhbmNoW2ldO1xuXHRcdFx0fVxuXG5cdFx0XHRzZWdtZW50X2RpcnR5ID0gZmFsc2U7XG5cblx0XHRcdGNvbnN0IHsgZGVmYXVsdDogY29tcG9uZW50LCBwcmVsb2FkIH0gPSBhd2FpdCBsb2FkX2NvbXBvbmVudChjb21wb25lbnRzW3BhcnQuaV0pO1xuXG5cdFx0XHRsZXQgcHJlbG9hZGVkO1xuXHRcdFx0aWYgKHJlYWR5IHx8ICFpbml0aWFsX2RhdGEucHJlbG9hZGVkW2kgKyAxXSkge1xuXHRcdFx0XHRwcmVsb2FkZWQgPSBwcmVsb2FkXG5cdFx0XHRcdFx0PyBhd2FpdCBwcmVsb2FkLmNhbGwocHJlbG9hZF9jb250ZXh0LCB7XG5cdFx0XHRcdFx0XHRob3N0OiBwYWdlLmhvc3QsXG5cdFx0XHRcdFx0XHRwYXRoOiBwYWdlLnBhdGgsXG5cdFx0XHRcdFx0XHRxdWVyeTogcGFnZS5xdWVyeSxcblx0XHRcdFx0XHRcdHBhcmFtczogcGFydC5wYXJhbXMgPyBwYXJ0LnBhcmFtcyh0YXJnZXQubWF0Y2gpIDoge31cblx0XHRcdFx0XHR9LCAkc2Vzc2lvbilcblx0XHRcdFx0XHQ6IHt9O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cHJlbG9hZGVkID0gaW5pdGlhbF9kYXRhLnByZWxvYWRlZFtpICsgMV07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAocHJvcHNbYGxldmVsJHtqfWBdID0geyBjb21wb25lbnQsIHByb3BzOiBwcmVsb2FkZWQsIHNlZ21lbnQsIG1hdGNoLCBwYXJ0OiBwYXJ0LmkgfSk7XG5cdFx0fSkpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdHByb3BzLmVycm9yID0gZXJyb3I7XG5cdFx0cHJvcHMuc3RhdHVzID0gNTAwO1xuXHRcdGJyYW5jaCA9IFtdO1xuXHR9XG5cblx0cmV0dXJuIHsgcmVkaXJlY3QsIHByb3BzLCBicmFuY2ggfTtcbn1cblxuZnVuY3Rpb24gbG9hZF9jc3MoY2h1bmspIHtcblx0Y29uc3QgaHJlZiA9IGBjbGllbnQvJHtjaHVua31gO1xuXHRpZiAoZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgbGlua1tocmVmPVwiJHtocmVmfVwiXWApKSByZXR1cm47XG5cblx0cmV0dXJuIG5ldyBQcm9taXNlKChmdWxmaWwsIHJlamVjdCkgPT4ge1xuXHRcdGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG5cdFx0bGluay5yZWwgPSAnc3R5bGVzaGVldCc7XG5cdFx0bGluay5ocmVmID0gaHJlZjtcblxuXHRcdGxpbmsub25sb2FkID0gKCkgPT4gZnVsZmlsKCk7XG5cdFx0bGluay5vbmVycm9yID0gcmVqZWN0O1xuXG5cdFx0ZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGxvYWRfY29tcG9uZW50KGNvbXBvbmVudClcblxuXG4ge1xuXHQvLyBUT0RPIHRoaXMgaXMgdGVtcG9yYXJ5IOKAlCBvbmNlIHBsYWNlaG9sZGVycyBhcmVcblx0Ly8gYWx3YXlzIHJld3JpdHRlbiwgc2NyYXRjaCB0aGUgdGVybmFyeVxuXHRjb25zdCBwcm9taXNlcyA9ICh0eXBlb2YgY29tcG9uZW50LmNzcyA9PT0gJ3N0cmluZycgPyBbXSA6IGNvbXBvbmVudC5jc3MubWFwKGxvYWRfY3NzKSk7XG5cdHByb21pc2VzLnVuc2hpZnQoY29tcG9uZW50LmpzKCkpO1xuXHRyZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4odmFsdWVzID0+IHZhbHVlc1swXSk7XG59XG5cbmZ1bmN0aW9uIGRldGFjaChub2RlKSB7XG5cdG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gcHJlZmV0Y2goaHJlZikge1xuXHRjb25zdCB0YXJnZXQgPSBzZWxlY3RfdGFyZ2V0KG5ldyBVUkwoaHJlZiwgZG9jdW1lbnQuYmFzZVVSSSkpO1xuXG5cdGlmICh0YXJnZXQpIHtcblx0XHRpZiAoIXByZWZldGNoaW5nIHx8IGhyZWYgIT09IHByZWZldGNoaW5nLmhyZWYpIHtcblx0XHRcdHNldF9wcmVmZXRjaGluZyhocmVmLCBoeWRyYXRlX3RhcmdldCh0YXJnZXQpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcHJlZmV0Y2hpbmcucHJvbWlzZTtcblx0fVxufVxuXG5mdW5jdGlvbiBzdGFydChvcHRzXG5cbikge1xuXHRpZiAoJ3Njcm9sbFJlc3RvcmF0aW9uJyBpbiBfaGlzdG9yeSkge1xuXHRcdF9oaXN0b3J5LnNjcm9sbFJlc3RvcmF0aW9uID0gJ21hbnVhbCc7XG5cdH1cblx0XG5cdC8vIEFkb3B0ZWQgZnJvbSBOdXh0LmpzXG5cdC8vIFJlc2V0IHNjcm9sbFJlc3RvcmF0aW9uIHRvIGF1dG8gd2hlbiBsZWF2aW5nIHBhZ2UsIGFsbG93aW5nIHBhZ2UgcmVsb2FkXG5cdC8vIGFuZCBiYWNrLW5hdmlnYXRpb24gZnJvbSBvdGhlciBwYWdlcyB0byB1c2UgdGhlIGJyb3dzZXIgdG8gcmVzdG9yZSB0aGVcblx0Ly8gc2Nyb2xsaW5nIHBvc2l0aW9uLlxuXHRhZGRFdmVudExpc3RlbmVyKCdiZWZvcmV1bmxvYWQnLCAoKSA9PiB7XG5cdFx0X2hpc3Rvcnkuc2Nyb2xsUmVzdG9yYXRpb24gPSAnYXV0byc7XG5cdH0pO1xuXG5cdC8vIFNldHRpbmcgc2Nyb2xsUmVzdG9yYXRpb24gdG8gbWFudWFsIGFnYWluIHdoZW4gcmV0dXJuaW5nIHRvIHRoaXMgcGFnZS5cblx0YWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsICgpID0+IHtcblx0XHRfaGlzdG9yeS5zY3JvbGxSZXN0b3JhdGlvbiA9ICdtYW51YWwnO1xuXHR9KTtcblxuXHRzZXRfdGFyZ2V0KG9wdHMudGFyZ2V0KTtcblxuXHRhZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGhhbmRsZV9jbGljayk7XG5cdGFkZEV2ZW50TGlzdGVuZXIoJ3BvcHN0YXRlJywgaGFuZGxlX3BvcHN0YXRlKTtcblxuXHQvLyBwcmVmZXRjaFxuXHRhZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0JywgdHJpZ2dlcl9wcmVmZXRjaCk7XG5cdGFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIGhhbmRsZV9tb3VzZW1vdmUpO1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKCgpID0+IHtcblx0XHRjb25zdCB7IGhhc2gsIGhyZWYgfSA9IGxvY2F0aW9uO1xuXG5cdFx0X2hpc3RvcnkucmVwbGFjZVN0YXRlKHsgaWQ6IHVpZCB9LCAnJywgaHJlZik7XG5cblx0XHRjb25zdCB1cmwgPSBuZXcgVVJMKGxvY2F0aW9uLmhyZWYpO1xuXG5cdFx0aWYgKGluaXRpYWxfZGF0YS5lcnJvcikgcmV0dXJuIGhhbmRsZV9lcnJvcigpO1xuXG5cdFx0Y29uc3QgdGFyZ2V0ID0gc2VsZWN0X3RhcmdldCh1cmwpO1xuXHRcdGlmICh0YXJnZXQpIHJldHVybiBuYXZpZ2F0ZSh0YXJnZXQsIHVpZCwgdHJ1ZSwgaGFzaCk7XG5cdH0pO1xufVxuXG5sZXQgbW91c2Vtb3ZlX3RpbWVvdXQ7XG5cbmZ1bmN0aW9uIGhhbmRsZV9tb3VzZW1vdmUoZXZlbnQpIHtcblx0Y2xlYXJUaW1lb3V0KG1vdXNlbW92ZV90aW1lb3V0KTtcblx0bW91c2Vtb3ZlX3RpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHR0cmlnZ2VyX3ByZWZldGNoKGV2ZW50KTtcblx0fSwgMjApO1xufVxuXG5mdW5jdGlvbiB0cmlnZ2VyX3ByZWZldGNoKGV2ZW50KSB7XG5cdGNvbnN0IGEgPSBmaW5kX2FuY2hvcihldmVudC50YXJnZXQpO1xuXHRpZiAoIWEgfHwgYS5yZWwgIT09ICdwcmVmZXRjaCcpIHJldHVybjtcblxuXHRwcmVmZXRjaChhLmhyZWYpO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVfY2xpY2soZXZlbnQpIHtcblx0Ly8gQWRhcHRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzXG5cdC8vIE1JVCBsaWNlbnNlIGh0dHBzOi8vZ2l0aHViLmNvbS92aXNpb25tZWRpYS9wYWdlLmpzI2xpY2Vuc2Vcblx0aWYgKHdoaWNoKGV2ZW50KSAhPT0gMSkgcmV0dXJuO1xuXHRpZiAoZXZlbnQubWV0YUtleSB8fCBldmVudC5jdHJsS2V5IHx8IGV2ZW50LnNoaWZ0S2V5KSByZXR1cm47XG5cdGlmIChldmVudC5kZWZhdWx0UHJldmVudGVkKSByZXR1cm47XG5cblx0Y29uc3QgYSA9IGZpbmRfYW5jaG9yKGV2ZW50LnRhcmdldCk7XG5cdGlmICghYSkgcmV0dXJuO1xuXG5cdGlmICghYS5ocmVmKSByZXR1cm47XG5cblx0Ly8gY2hlY2sgaWYgbGluayBpcyBpbnNpZGUgYW4gc3ZnXG5cdC8vIGluIHRoaXMgY2FzZSwgYm90aCBocmVmIGFuZCB0YXJnZXQgYXJlIGFsd2F5cyBpbnNpZGUgYW4gb2JqZWN0XG5cdGNvbnN0IHN2ZyA9IHR5cGVvZiBhLmhyZWYgPT09ICdvYmplY3QnICYmIGEuaHJlZi5jb25zdHJ1Y3Rvci5uYW1lID09PSAnU1ZHQW5pbWF0ZWRTdHJpbmcnO1xuXHRjb25zdCBocmVmID0gU3RyaW5nKHN2ZyA/IChhKS5ocmVmLmJhc2VWYWwgOiBhLmhyZWYpO1xuXG5cdGlmIChocmVmID09PSBsb2NhdGlvbi5ocmVmKSB7XG5cdFx0aWYgKCFsb2NhdGlvbi5oYXNoKSBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHJldHVybjtcblx0fVxuXG5cdC8vIElnbm9yZSBpZiB0YWcgaGFzXG5cdC8vIDEuICdkb3dubG9hZCcgYXR0cmlidXRlXG5cdC8vIDIuIHJlbD0nZXh0ZXJuYWwnIGF0dHJpYnV0ZVxuXHRpZiAoYS5oYXNBdHRyaWJ1dGUoJ2Rvd25sb2FkJykgfHwgYS5nZXRBdHRyaWJ1dGUoJ3JlbCcpID09PSAnZXh0ZXJuYWwnKSByZXR1cm47XG5cblx0Ly8gSWdub3JlIGlmIDxhPiBoYXMgYSB0YXJnZXRcblx0aWYgKHN2ZyA/IChhKS50YXJnZXQuYmFzZVZhbCA6IGEudGFyZ2V0KSByZXR1cm47XG5cblx0Y29uc3QgdXJsID0gbmV3IFVSTChocmVmKTtcblxuXHQvLyBEb24ndCBoYW5kbGUgaGFzaCBjaGFuZ2VzXG5cdGlmICh1cmwucGF0aG5hbWUgPT09IGxvY2F0aW9uLnBhdGhuYW1lICYmIHVybC5zZWFyY2ggPT09IGxvY2F0aW9uLnNlYXJjaCkgcmV0dXJuO1xuXG5cdGNvbnN0IHRhcmdldCA9IHNlbGVjdF90YXJnZXQodXJsKTtcblx0aWYgKHRhcmdldCkge1xuXHRcdGNvbnN0IG5vc2Nyb2xsID0gYS5oYXNBdHRyaWJ1dGUoJ3NhcHBlci1ub3Njcm9sbCcpO1xuXHRcdG5hdmlnYXRlKHRhcmdldCwgbnVsbCwgbm9zY3JvbGwsIHVybC5oYXNoKTtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdF9oaXN0b3J5LnB1c2hTdGF0ZSh7IGlkOiBjaWQgfSwgJycsIHVybC5ocmVmKTtcblx0fVxufVxuXG5mdW5jdGlvbiB3aGljaChldmVudCkge1xuXHRyZXR1cm4gZXZlbnQud2hpY2ggPT09IG51bGwgPyBldmVudC5idXR0b24gOiBldmVudC53aGljaDtcbn1cblxuZnVuY3Rpb24gZmluZF9hbmNob3Iobm9kZSkge1xuXHR3aGlsZSAobm9kZSAmJiBub2RlLm5vZGVOYW1lLnRvVXBwZXJDYXNlKCkgIT09ICdBJykgbm9kZSA9IG5vZGUucGFyZW50Tm9kZTsgLy8gU1ZHIDxhPiBlbGVtZW50cyBoYXZlIGEgbG93ZXJjYXNlIG5hbWVcblx0cmV0dXJuIG5vZGU7XG59XG5cbmZ1bmN0aW9uIGhhbmRsZV9wb3BzdGF0ZShldmVudCkge1xuXHRzY3JvbGxfaGlzdG9yeVtjaWRdID0gc2Nyb2xsX3N0YXRlKCk7XG5cblx0aWYgKGV2ZW50LnN0YXRlKSB7XG5cdFx0Y29uc3QgdXJsID0gbmV3IFVSTChsb2NhdGlvbi5ocmVmKTtcblx0XHRjb25zdCB0YXJnZXQgPSBzZWxlY3RfdGFyZ2V0KHVybCk7XG5cdFx0aWYgKHRhcmdldCkge1xuXHRcdFx0bmF2aWdhdGUodGFyZ2V0LCBldmVudC5zdGF0ZS5pZCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHQvLyBoYXNoY2hhbmdlXG5cdFx0c2V0X3VpZCh1aWQgKyAxKTtcblx0XHRzZXRfY2lkKHVpZCk7XG5cdFx0X2hpc3RvcnkucmVwbGFjZVN0YXRlKHsgaWQ6IGNpZCB9LCAnJywgbG9jYXRpb24uaHJlZik7XG5cdH1cbn1cblxuZnVuY3Rpb24gcHJlZmV0Y2hSb3V0ZXMocGF0aG5hbWVzKSB7XG5cdHJldHVybiByb3V0ZXNcblx0XHQuZmlsdGVyKHBhdGhuYW1lc1xuXHRcdFx0PyByb3V0ZSA9PiBwYXRobmFtZXMuc29tZShwYXRobmFtZSA9PiByb3V0ZS5wYXR0ZXJuLnRlc3QocGF0aG5hbWUpKVxuXHRcdFx0OiAoKSA9PiB0cnVlXG5cdFx0KVxuXHRcdC5yZWR1Y2UoKHByb21pc2UsIHJvdXRlKSA9PiBwcm9taXNlLnRoZW4oKCkgPT4ge1xuXHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKHJvdXRlLnBhcnRzLm1hcChwYXJ0ID0+IHBhcnQgJiYgbG9hZF9jb21wb25lbnQoY29tcG9uZW50c1twYXJ0LmldKSkpO1xuXHRcdH0pLCBQcm9taXNlLnJlc29sdmUoKSk7XG59XG5cbmNvbnN0IHN0b3JlcyQxID0gKCkgPT4gZ2V0Q29udGV4dChDT05URVhUX0tFWSk7XG5cbmV4cG9ydCB7IGdvdG8sIHByZWZldGNoLCBwcmVmZXRjaFJvdXRlcywgc3RhcnQsIHN0b3JlcyQxIGFzIHN0b3JlcyB9O1xuIiwiaW1wb3J0ICogYXMgc2FwcGVyIGZyb20gJ0BzYXBwZXIvYXBwJztcblxuc2FwcGVyLnN0YXJ0KHtcblx0dGFyZ2V0OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2FwcGVyJylcbn0pOyJdLCJuYW1lcyI6WyJFcnJvckNvbXBvbmVudCIsImRldGFjaCIsInJvb3RfcHJlbG9hZCIsInNhcHBlci5zdGFydCJdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxJQUFJLEdBQUcsR0FBRztBQUNkLE1BQUMsUUFBUSxHQUFHLENBQUMsSUFBSSxFQUFFO0FBQ3hCLFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDMUI7QUFDQSxJQUFJLEtBQUssTUFBTSxDQUFDLElBQUksR0FBRztBQUN2QixRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsSUFBSSxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUM7QUFJRCxTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFO0FBQ3pELElBQUksT0FBTyxDQUFDLGFBQWEsR0FBRztBQUM1QixRQUFRLEdBQUcsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRTtBQUN6QyxLQUFLLENBQUM7QUFDTixDQUFDO0FBQ0QsU0FBUyxHQUFHLENBQUMsRUFBRSxFQUFFO0FBQ2pCLElBQUksT0FBTyxFQUFFLEVBQUUsQ0FBQztBQUNoQixDQUFDO0FBQ0QsU0FBUyxZQUFZLEdBQUc7QUFDeEIsSUFBSSxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0Is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
