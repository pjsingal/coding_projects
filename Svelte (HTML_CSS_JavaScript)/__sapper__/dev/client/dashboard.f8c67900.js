import { S as SvelteComponentDev, i as init, d as dispatch_dev, s as safe_not_equal, v as validate_slots, E as onMount, a as space, p as create_component, e as element, q as query_selector_all, g as detach_dev, f as claim_space, r as claim_component, c as claim_element, b as children, k as src_url_equal, h as attr_dev, j as add_location, m as insert_hydration_dev, w as mount_component, n as append_hydration_dev, x as transition_in, y as transition_out, z as destroy_component, t as text, u as claim_text } from './client.8186e667.js';
import { P as PageHeader } from './PageHeader.18e7523c.js';

/* src/routes/dashboard.svelte generated by Svelte v3.45.0 */
const file = "src/routes/dashboard.svelte";

// (11:0) <PageHeader>
function create_default_slot(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("QVFT Dash (Beta)");
		},
		l: function claim(nodes) {
			t = claim_text(nodes, "QVFT Dash (Beta)");
		},
		m: function mount(target, anchor) {
			insert_hydration_dev(target, t, anchor);
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t);
		}
	};

	dispatch_dev("SvelteRegisterBlock", {
		block,
		id: create_default_slot.name,
		type: "slot",
		source: "(11:0) <PageHeader>",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let t0;
	let pageheader;
	let t1;
	let div;
	let iframe;
	let iframe_src_value;
	let current;

	pageheader = new PageHeader({
			props: {
				$$slots: { default: [create_default_slot] },
				$$scope: { ctx }
			},
			$$inline: true
		});

	const block = {
		c: function create() {
			t0 = space();
			create_component(pageheader.$$.fragment);
			t1 = space();
			div = element("div");
			iframe = element("iframe");
			this.h();
		},
		l: function claim(nodes) {
			const head_nodes = query_selector_all('[data-svelte=\"svelte-11xp49l\"]', document.head);
			head_nodes.forEach(detach_dev);
			t0 = claim_space(nodes);
			claim_component(pageheader.$$.fragment, nodes);
			t1 = claim_space(nodes);
			div = claim_element(nodes, "DIV", {});
			var div_nodes = children(div);
			iframe = claim_element(div_nodes, "IFRAME", { src: true, class: true, title: true });
			children(iframe).forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			document.title = "Patrick Singal";
			if (!src_url_equal(iframe.src, iframe_src_value = "https://directorqvft.pythonanywhere.com/")) attr_dev(iframe, "src", iframe_src_value);
			attr_dev(iframe, "class", "dashboard svelte-uj0d3r");
			attr_dev(iframe, "title", "QVFT Dash (Beta)");
			add_location(iframe, file, 13, 4, 512);
			add_location(div, file, 11, 0, 466);
		},
		m: function mount(target, anchor) {
			insert_hydration_dev(target, t0, anchor);
			mount_component(pageheader, target, anchor);
			insert_hydration_dev(target, t1, anchor);
			insert_hydration_dev(target, div, anchor);
			append_hydration_dev(div, iframe);
			current = true;
		},
		p: function update(ctx, [dirty]) {
			const pageheader_changes = {};

			if (dirty & /*$$scope*/ 1) {
				pageheader_changes.$$scope = { dirty, ctx };
			}

			pageheader.$set(pageheader_changes);
		},
		i: function intro(local) {
			if (current) return;
			transition_in(pageheader.$$.fragment, local);
			current = true;
		},
		o: function outro(local) {
			transition_out(pageheader.$$.fragment, local);
			current = false;
		},
		d: function destroy(detaching) {
			if (detaching) detach_dev(t0);
			destroy_component(pageheader, detaching);
			if (detaching) detach_dev(t1);
			if (detaching) detach_dev(div);
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
	validate_slots('Dashboard', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dashboard> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ onMount, PageHeader });
	return [];
}

class Dashboard extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Dashboard",
			options,
			id: create_fragment.name
		});
	}
}

export default Dashboard;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGFzaGJvYXJkLmY4YzY3OTAwLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvcm91dGVzL2Rhc2hib2FyZC5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiPHNjcmlwdD5cbiAgICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICAgIGltcG9ydCBQYWdlSGVhZGVyIGZyb20gXCIuLi9jb21wb25lbnRzL1BhZ2VIZWFkZXIuc3ZlbHRlXCI7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICAgIC5kYXNoYm9hcmQge1xuICAgICAgICBwb3NpdGlvbjogYWJzb2x1dGU7IFxuICAgICAgICBvdmVyZmxvdzogdmlzaWJsZTsgXG5cbiAgICAgICAgLyogcG9zaXRpb246IGFic29sdXRlOyBcbiAgICAgICAgb3ZlcmZsb3c6IGhpZGRlbjsgICovXG5cbiAgICAgICAgdG9wOiAxOS4ycmVtOyBcbiAgICAgICAgYm90dG9tOiAwcHg7IFxuICAgICAgICByaWdodDogMHB4OyBcbiAgICAgICAgd2lkdGg6IDEwMCU7IFxuICAgICAgICBib3JkZXI6IG5vbmU7IG1hcmdpbjogMDsgXG4gICAgICAgIHBhZGRpbmc6IDA7IG92ZXJmbG93OiBoaWRkZW47IFxuICAgICAgICB6LWluZGV4OiA5OTk5OTk7IFxuICAgICAgICBoZWlnaHQ6IDEwMCU7XG4gICAgfVxuICAgIEBtZWRpYSBvbmx5IHNjcmVlbiBhbmQgKG1heC13aWR0aDogNjAwcHgpIHtcbiAgICAgICAgLmRhc2hib2FyZCB7XG4gICAgICAgICAgICB0b3A6IDE5LjJyZW07IFxuICAgICAgICB9XG4gICAgfVxuPC9zdHlsZT5cblxuPHN2ZWx0ZTpoZWFkPlxuICA8dGl0bGU+UGF0cmljayBTaW5nYWw8L3RpdGxlPlxuPC9zdmVsdGU6aGVhZD5cbjxQYWdlSGVhZGVyPlFWRlQgRGFzaCAoQmV0YSk8L1BhZ2VIZWFkZXI+IFxuPGRpdj5cbiAgICA8IS0tIEVtYmVkZGVkIERhc2hib2FyZCBQYWdlLS0+XG4gICAgPGlmcmFtZSBzcmM9XCJodHRwczovL2RpcmVjdG9ycXZmdC5weXRob25hbnl3aGVyZS5jb20vXCIgY2xhc3M9XCJkYXNoYm9hcmRcIiB0aXRsZT1cIlFWRlQgRGFzaCAoQmV0YSlcIj48L2lmcmFtZT5cbjwvZGl2PlxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztZQVVZLGtCQUFnQjs7O3lCQUFoQixrQkFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQUM1QixvQkFHTTtHQURGLG9CQUEyRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OyJ9
