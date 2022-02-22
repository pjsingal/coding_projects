import { S as SvelteComponentDev, i as init, d as dispatch_dev, s as safe_not_equal, v as validate_slots, a as space, p as create_component, e as element, t as text, q as query_selector_all, g as detach_dev, f as claim_space, r as claim_component, c as claim_element, b as children, u as claim_text, h as attr_dev, j as add_location, k as src_url_equal, m as insert_hydration_dev, w as mount_component, n as append_hydration_dev, x as transition_in, y as transition_out, z as destroy_component } from './client.17bff019.js';
import { P as PageHeader } from './PageHeader.e725a13a.js';

/* src/routes/qvft.svelte generated by Svelte v3.45.0 */
const file = "src/routes/qvft.svelte";

// (14:0) <PageHeader>
function create_default_slot(ctx) {
	let t;

	const block = {
		c: function create() {
			t = text("QVFT");
		},
		l: function claim(nodes) {
			t = claim_text(nodes, "QVFT");
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
		source: "(14:0) <PageHeader>",
		ctx
	});

	return block;
}

function create_fragment(ctx) {
	let t0;
	let pageheader;
	let t1;
	let div2;
	let p0;
	let a0;
	let t2;
	let t3;
	let p1;
	let a1;
	let t4;
	let t5;
	let p2;
	let a2;
	let t6;
	let t7;
	let div0;
	let object0;
	let embed0;
	let embed0_src_value;
	let t8;
	let div1;
	let object1;
	let embed1;
	let embed1_src_value;
	let t9;
	let div3;
	let a3;
	let t10;
	let t11;
	let div4;
	let a4;
	let t12;
	let t13;
	let div5;
	let a5;
	let t14;
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
			div2 = element("div");
			p0 = element("p");
			a0 = element("a");
			t2 = text("Queen's Vertical Farming Team Website");
			t3 = space();
			p1 = element("p");
			a1 = element("a");
			t4 = text("Download System Guide");
			t5 = space();
			p2 = element("p");
			a2 = element("a");
			t6 = text("Download Mechatronics Update");
			t7 = space();
			div0 = element("div");
			object0 = element("object");
			embed0 = element("embed");
			t8 = space();
			div1 = element("div");
			object1 = element("object");
			embed1 = element("embed");
			t9 = space();
			div3 = element("div");
			a3 = element("a");
			t10 = text("Queen's Vertical Farming Team Website");
			t11 = space();
			div4 = element("div");
			a4 = element("a");
			t12 = text("Download System Guide");
			t13 = space();
			div5 = element("div");
			a5 = element("a");
			t14 = text("Download Mechatronics Update");
			this.h();
		},
		l: function claim(nodes) {
			const head_nodes = query_selector_all('[data-svelte=\"svelte-11xp49l\"]', document.head);
			head_nodes.forEach(detach_dev);
			t0 = claim_space(nodes);
			claim_component(pageheader.$$.fragment, nodes);
			t1 = claim_space(nodes);
			div2 = claim_element(nodes, "DIV", { class: true });
			var div2_nodes = children(div2);
			p0 = claim_element(div2_nodes, "P", {});
			var p0_nodes = children(p0);
			a0 = claim_element(p0_nodes, "A", { href: true, target: true, rel: true });
			var a0_nodes = children(a0);
			t2 = claim_text(a0_nodes, "Queen's Vertical Farming Team Website");
			a0_nodes.forEach(detach_dev);
			p0_nodes.forEach(detach_dev);
			t3 = claim_space(div2_nodes);
			p1 = claim_element(div2_nodes, "P", {});
			var p1_nodes = children(p1);
			a1 = claim_element(p1_nodes, "A", { href: true, download: true });
			var a1_nodes = children(a1);
			t4 = claim_text(a1_nodes, "Download System Guide");
			a1_nodes.forEach(detach_dev);
			p1_nodes.forEach(detach_dev);
			t5 = claim_space(div2_nodes);
			p2 = claim_element(div2_nodes, "P", {});
			var p2_nodes = children(p2);
			a2 = claim_element(p2_nodes, "A", { href: true, download: true });
			var a2_nodes = children(a2);
			t6 = claim_text(a2_nodes, "Download Mechatronics Update");
			a2_nodes.forEach(detach_dev);
			p2_nodes.forEach(detach_dev);
			t7 = claim_space(div2_nodes);
			div0 = claim_element(div2_nodes, "DIV", { class: true });
			var div0_nodes = children(div0);

			object0 = claim_element(div0_nodes, "OBJECT", {
				width: true,
				height: true,
				title: true,
				data: true,
				type: true
			});

			var object0_nodes = children(object0);

			embed0 = claim_element(object0_nodes, "EMBED", {
				title: true,
				width: true,
				src: true,
				type: true
			});

			object0_nodes.forEach(detach_dev);
			div0_nodes.forEach(detach_dev);
			t8 = claim_space(div2_nodes);
			div1 = claim_element(div2_nodes, "DIV", { class: true });
			var div1_nodes = children(div1);

			object1 = claim_element(div1_nodes, "OBJECT", {
				width: true,
				height: true,
				title: true,
				data: true,
				type: true
			});

			var object1_nodes = children(object1);

			embed1 = claim_element(object1_nodes, "EMBED", {
				title: true,
				width: true,
				src: true,
				type: true
			});

			object1_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			div2_nodes.forEach(detach_dev);
			t9 = claim_space(nodes);
			div3 = claim_element(nodes, "DIV", { class: true });
			var div3_nodes = children(div3);
			a3 = claim_element(div3_nodes, "A", { class: true, href: true });
			var a3_nodes = children(a3);
			t10 = claim_text(a3_nodes, "Queen's Vertical Farming Team Website");
			a3_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			t11 = claim_space(nodes);
			div4 = claim_element(nodes, "DIV", { class: true });
			var div4_nodes = children(div4);
			a4 = claim_element(div4_nodes, "A", { class: true, href: true });
			var a4_nodes = children(a4);
			t12 = claim_text(a4_nodes, "Download System Guide");
			a4_nodes.forEach(detach_dev);
			div4_nodes.forEach(detach_dev);
			t13 = claim_space(nodes);
			div5 = claim_element(nodes, "DIV", { class: true });
			var div5_nodes = children(div5);
			a5 = claim_element(div5_nodes, "A", { class: true, href: true });
			var a5_nodes = children(a5);
			t14 = claim_text(a5_nodes, "Download Mechatronics Update");
			a5_nodes.forEach(detach_dev);
			div5_nodes.forEach(detach_dev);
			this.h();
		},
		h: function hydrate() {
			document.title = "Patrick Singal";
			attr_dev(a0, "href", "https://www.qvft.ca/");
			attr_dev(a0, "target", "_blank");
			attr_dev(a0, "rel", "noopener noreferrer");
			add_location(a0, file, 16, 4, 993);
			add_location(p0, file, 15, 2, 985);
			attr_dev(a1, "href", "QVFT-System-Guide.pdf");
			attr_dev(a1, "download", "");
			add_location(a1, file, 19, 4, 1125);
			add_location(p1, file, 18, 2, 1117);
			attr_dev(a2, "href", "QVFT-Mechatronics-Update.pdf");
			attr_dev(a2, "download", "");
			add_location(a2, file, 22, 4, 1209);
			add_location(p2, file, 21, 2, 1201);
			attr_dev(embed0, "title", "System Guide");
			attr_dev(embed0, "width", "100%");
			if (!src_url_equal(embed0.src, embed0_src_value = "QVFT-System-Guide.pdf")) attr_dev(embed0, "src", embed0_src_value);
			attr_dev(embed0, "type", "application/pdf");
			add_location(embed0, file, 31, 6, 1474);
			attr_dev(object0, "width", "100%");
			attr_dev(object0, "height", "100%");
			attr_dev(object0, "title", "System Guide");
			attr_dev(object0, "data", "QVFT-System-Guide.pdf");
			attr_dev(object0, "type", "application/pdf");
			add_location(object0, file, 25, 4, 1329);
			attr_dev(div0, "class", "pdfWrapper1 svelte-dg6hm2");
			add_location(div0, file, 24, 2, 1299);
			attr_dev(embed1, "title", "Mechatronics Update");
			attr_dev(embed1, "width", "100%");
			if (!src_url_equal(embed1.src, embed1_src_value = "QVFT-Mechatronics-Update.pdf")) attr_dev(embed1, "src", embed1_src_value);
			attr_dev(embed1, "type", "application/pdf");
			add_location(embed1, file, 45, 6, 1815);
			attr_dev(object1, "width", "100%");
			attr_dev(object1, "height", "100%");
			attr_dev(object1, "title", "Mechatronics Update");
			attr_dev(object1, "data", "QVFT-Mechatronics-Update.pdf");
			attr_dev(object1, "type", "application/pdf");
			add_location(object1, file, 39, 4, 1656);
			attr_dev(div1, "class", "pdfWrapper2 svelte-dg6hm2");
			add_location(div1, file, 38, 2, 1626);
			attr_dev(div2, "class", "contentWrapper desktop svelte-dg6hm2");
			add_location(div2, file, 14, 0, 946);
			attr_dev(a3, "class", "button svelte-dg6hm2");
			attr_dev(a3, "href", "https://www.qvft.ca/");
			add_location(a3, file, 54, 4, 2026);
			attr_dev(div3, "class", "contentWrapper mobile svelte-dg6hm2");
			add_location(div3, file, 53, 0, 1986);
			attr_dev(a4, "class", "button svelte-dg6hm2");
			attr_dev(a4, "href", "QVFT-System-Guide.pdf");
			add_location(a4, file, 57, 4, 2161);
			attr_dev(div4, "class", "contentWrapper mobile svelte-dg6hm2");
			add_location(div4, file, 56, 0, 2121);
			attr_dev(a5, "class", "button svelte-dg6hm2");
			attr_dev(a5, "href", "QVFT-Mechatronics-Update.pdf");
			add_location(a5, file, 60, 4, 2281);
			attr_dev(div5, "class", "contentWrapper mobile svelte-dg6hm2");
			add_location(div5, file, 59, 0, 2241);
		},
		m: function mount(target, anchor) {
			insert_hydration_dev(target, t0, anchor);
			mount_component(pageheader, target, anchor);
			insert_hydration_dev(target, t1, anchor);
			insert_hydration_dev(target, div2, anchor);
			append_hydration_dev(div2, p0);
			append_hydration_dev(p0, a0);
			append_hydration_dev(a0, t2);
			append_hydration_dev(div2, t3);
			append_hydration_dev(div2, p1);
			append_hydration_dev(p1, a1);
			append_hydration_dev(a1, t4);
			append_hydration_dev(div2, t5);
			append_hydration_dev(div2, p2);
			append_hydration_dev(p2, a2);
			append_hydration_dev(a2, t6);
			append_hydration_dev(div2, t7);
			append_hydration_dev(div2, div0);
			append_hydration_dev(div0, object0);
			append_hydration_dev(object0, embed0);
			append_hydration_dev(div2, t8);
			append_hydration_dev(div2, div1);
			append_hydration_dev(div1, object1);
			append_hydration_dev(object1, embed1);
			insert_hydration_dev(target, t9, anchor);
			insert_hydration_dev(target, div3, anchor);
			append_hydration_dev(div3, a3);
			append_hydration_dev(a3, t10);
			insert_hydration_dev(target, t11, anchor);
			insert_hydration_dev(target, div4, anchor);
			append_hydration_dev(div4, a4);
			append_hydration_dev(a4, t12);
			insert_hydration_dev(target, t13, anchor);
			insert_hydration_dev(target, div5, anchor);
			append_hydration_dev(div5, a5);
			append_hydration_dev(a5, t14);
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
			if (detaching) detach_dev(div2);
			if (detaching) detach_dev(t9);
			if (detaching) detach_dev(div3);
			if (detaching) detach_dev(t11);
			if (detaching) detach_dev(div4);
			if (detaching) detach_dev(t13);
			if (detaching) detach_dev(div5);
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
	validate_slots('Qvft', slots, []);
	const writable_props = [];

	Object.keys($$props).forEach(key => {
		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Qvft> was created with unknown prop '${key}'`);
	});

	$$self.$capture_state = () => ({ PageHeader });
	return [];
}

class Qvft extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, {});

		dispatch_dev("SvelteRegisterComponent", {
			component: this,
			tagName: "Qvft",
			options,
			id: create_fragment.name
		});
	}
}

export default Qvft;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicXZmdC5iMjc1MDNlZC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3JvdXRlcy9xdmZ0LnN2ZWx0ZSJdLCJzb3VyY2VzQ29udGVudCI6WyI8c2NyaXB0PlxuICAvLyBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBpbXBvcnQgUGFnZUhlYWRlciBmcm9tIFwiLi4vY29tcG9uZW50cy9QYWdlSGVhZGVyLnN2ZWx0ZVwiO1xuICAvLyBvbk1vdW50KGFzeW5jICgpID0+IHtcbiAgLy8gICBndGFnKFwiY29uZmlnXCIsIFwiVUEtOTM1NDkyMzUtNlwiLCB7IHBhZ2VfcGF0aDogXCIvY3ZcIiB9KTtcbiAgLy8gfSk7XG48L3NjcmlwdD5cblxuPHN0eWxlPlxuICBkaXYucGRmV3JhcHBlcjEge1xuICAgIG1hcmdpbi10b3A6IDJyZW07XG4gICAgbWFyZ2luLWxlZnQ6IGF1dG87XG4gICAgbWFyZ2luLXJpZ2h0OiBhdXRvO1xuICAgIHdpZHRoOiA1MDBweDtcbiAgICBoZWlnaHQ6IGNhbGMoNTAwcHgqMS40NCk7XG4gIH1cbiAgZGl2LnBkZldyYXBwZXIyIHtcbiAgICBtYXJnaW4tdG9wOiAycmVtO1xuICAgIG1hcmdpbi1sZWZ0OiBhdXRvO1xuICAgIG1hcmdpbi1yaWdodDogYXV0bztcbiAgICB3aWR0aDogOTAwcHg7XG4gICAgaGVpZ2h0OiBjYWxjKDkwMHB4LzEuNCk7XG4gIH1cbiAgYS5idXR0b24ge1xuICAgIGRpc3BsYXk6IGlubGluZS1mbGV4O1xuICAgIGFsaWduLWl0ZW1zOiBjZW50ZXI7XG4gICAganVzdGlmeS1jb250ZW50OiBjZW50ZXI7XG4gICAgbWluLWhlaWdodDogM3JlbTtcbiAgICBwYWRkaW5nOiAwLjVyZW0gMXJlbTtcbiAgICBmb250LXNpemU6IDEuMnJlbTtcbiAgICBsaW5lLWhlaWdodDogMS40cmVtO1xuICAgIGNvbG9yOiB3aGl0ZTtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgYmFja2dyb3VuZC1jb2xvcjogdmFyKC0tdGhlbWVDb2xvckRhcmspO1xuICAgIGJvcmRlci1yYWRpdXM6IDAuNXJlbTtcbiAgICBib3gtc2hhZG93OiAxcHggMXB4IDJweCAycHggI2RlZGVkZWRkO1xuICB9XG4gIC5jb250ZW50V3JhcHBlciB7XG4gICAgbWFyZ2luLXRvcDogMnJlbTtcbiAgfVxuICAubW9iaWxlIHtcbiAgICBkaXNwbGF5OiBub25lO1xuICAgIGp1c3RpZnktY29udGVudDogY2VudGVyO1xuICB9XG4gIEBtZWRpYSAobWF4LXdpZHRoOiA1NTBweCkge1xuICAgIC5tb2JpbGUge1xuICAgICAgZGlzcGxheTogZmxleCAhaW1wb3J0YW50O1xuICAgIH1cbiAgICAuZGVza3RvcCB7XG4gICAgICBkaXNwbGF5OiBub25lO1xuICAgIH1cbiAgfVxuPC9zdHlsZT5cblxuPHN2ZWx0ZTpoZWFkPlxuICA8dGl0bGU+UGF0cmljayBTaW5nYWw8L3RpdGxlPlxuPC9zdmVsdGU6aGVhZD5cbjxQYWdlSGVhZGVyPlFWRlQ8L1BhZ2VIZWFkZXI+XG48ZGl2IGNsYXNzPVwiY29udGVudFdyYXBwZXIgZGVza3RvcFwiPlxuICA8cD5cbiAgICA8YSBocmVmPVwiaHR0cHM6Ly93d3cucXZmdC5jYS9cIiB0YXJnZXQ9XCJfYmxhbmtcIiByZWw9XCJub29wZW5lciBub3JlZmVycmVyXCI+UXVlZW4ncyBWZXJ0aWNhbCBGYXJtaW5nIFRlYW0gV2Vic2l0ZTwvYT5cbiAgPC9wPlxuICA8cD5cbiAgICA8YSBocmVmPVwiUVZGVC1TeXN0ZW0tR3VpZGUucGRmXCIgZG93bmxvYWQ+RG93bmxvYWQgU3lzdGVtIEd1aWRlPC9hPlxuICA8L3A+XG4gIDxwPlxuICAgIDxhIGhyZWY9XCJRVkZULU1lY2hhdHJvbmljcy1VcGRhdGUucGRmXCIgZG93bmxvYWQ+RG93bmxvYWQgTWVjaGF0cm9uaWNzIFVwZGF0ZTwvYT5cbiAgPC9wPlxuICA8ZGl2IGNsYXNzPVwicGRmV3JhcHBlcjFcIj5cbiAgICA8b2JqZWN0XG4gICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgaGVpZ2h0PVwiMTAwJVwiXG4gICAgICB0aXRsZT1cIlN5c3RlbSBHdWlkZVwiXG4gICAgICBkYXRhPVwiUVZGVC1TeXN0ZW0tR3VpZGUucGRmXCJcbiAgICAgIHR5cGU9XCJhcHBsaWNhdGlvbi9wZGZcIj5cbiAgICAgIDxlbWJlZFxuICAgICAgICB0aXRsZT1cIlN5c3RlbSBHdWlkZVwiXG4gICAgICAgIHdpZHRoPVwiMTAwJVwiXG4gICAgICAgIHNyYz1cIlFWRlQtU3lzdGVtLUd1aWRlLnBkZlwiXG4gICAgICAgIHR5cGU9XCJhcHBsaWNhdGlvbi9wZGZcIiAvPlxuICAgIDwvb2JqZWN0PlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInBkZldyYXBwZXIyXCI+XG4gICAgPG9iamVjdFxuICAgICAgd2lkdGg9XCIxMDAlXCJcbiAgICAgIGhlaWdodD1cIjEwMCVcIlxuICAgICAgdGl0bGU9XCJNZWNoYXRyb25pY3MgVXBkYXRlXCJcbiAgICAgIGRhdGE9XCJRVkZULU1lY2hhdHJvbmljcy1VcGRhdGUucGRmXCJcbiAgICAgIHR5cGU9XCJhcHBsaWNhdGlvbi9wZGZcIj5cbiAgICAgIDxlbWJlZFxuICAgICAgICB0aXRsZT1cIk1lY2hhdHJvbmljcyBVcGRhdGVcIlxuICAgICAgICB3aWR0aD1cIjEwMCVcIlxuICAgICAgICBzcmM9XCJRVkZULU1lY2hhdHJvbmljcy1VcGRhdGUucGRmXCJcbiAgICAgICAgdHlwZT1cImFwcGxpY2F0aW9uL3BkZlwiIC8+XG4gICAgPC9vYmplY3Q+XG4gIDwvZGl2PlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwiY29udGVudFdyYXBwZXIgbW9iaWxlXCI+XG4gICAgPGEgY2xhc3M9XCJidXR0b25cIiBocmVmPVwiaHR0cHM6Ly93d3cucXZmdC5jYS9cIj5RdWVlbidzIFZlcnRpY2FsIEZhcm1pbmcgVGVhbSBXZWJzaXRlPC9hPlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwiY29udGVudFdyYXBwZXIgbW9iaWxlXCI+XG4gICAgPGEgY2xhc3M9XCJidXR0b25cIiBocmVmPVwiUVZGVC1TeXN0ZW0tR3VpZGUucGRmXCI+RG93bmxvYWQgU3lzdGVtIEd1aWRlPC9hPlxuPC9kaXY+XG48ZGl2IGNsYXNzPVwiY29udGVudFdyYXBwZXIgbW9iaWxlXCI+XG4gICAgPGEgY2xhc3M9XCJidXR0b25cIiBocmVmPVwiUVZGVC1NZWNoYXRyb25pY3MtVXBkYXRlLnBkZlwiPkRvd25sb2FkIE1lY2hhdHJvbmljcyBVcGRhdGU8L2E+XG48L2Rpdj5cblxuXG5cblxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztZQWFZLE1BQUk7Ozt5QkFBSixNQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzthQUc2RCx1Q0FBcUM7Ozs7YUFHckUsdUJBQXFCOzs7O2FBR2QsOEJBQTRCOzs7Ozs7Ozs7Ozs7Y0FnQzlCLHVDQUFxQzs7OztjQUdwQyx1QkFBcUI7Ozs7Y0FHZCw4QkFBNEI7Ozs7Ozs7Ozs7Ozs7Ozs2QkE1Q1QsdUNBQXFDOzs7Ozs7Ozs2QkFHckUsdUJBQXFCOzs7Ozs7Ozs2QkFHZCw4QkFBNEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OEJBZ0M5Qix1Q0FBcUM7Ozs7Ozs7OzhCQUdwQyx1QkFBcUI7Ozs7Ozs7OzhCQUdkLDhCQUE0Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E5Q3RGLG9CQXNDTTtHQXJDSixvQkFFSTtHQURGLG9CQUFrSDs7O0dBRXBILG9CQUVJO0dBREYsb0JBQWtFOzs7R0FFcEUsb0JBRUk7R0FERixvQkFBZ0Y7OztHQUVsRixvQkFhTTtHQVpKLG9CQVdTO0dBTFAsb0JBSTJCOztHQUcvQixvQkFhTTtHQVpKLG9CQVdTO0dBTFAsb0JBSTJCOztHQUlqQyxvQkFFTTtHQURGLG9CQUF1Rjs7O0dBRTNGLG9CQUVNO0dBREYsb0JBQXdFOzs7R0FFNUUsb0JBRU07R0FERixvQkFBc0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7In0=
