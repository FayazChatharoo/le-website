import {
    f as k,
    n as i,
    h as S,
    v as P,
    a6 as u,
    V as x,
    c as v,
    a as _,
    F as te,
    k as se,
    o as m,
    t as oe,
    a5 as F,
    $ as N,
    a0 as H,
    _ as w,
    aB as ae,
    S as K,
    y as U,
    aC as re,
    g as L,
    d as O,
    e as ne,
    B as W,
    u as y,
    b as $,
    aa as le,
    aR as ce,
    i as G,
    a4 as ie,
    H as pe,
    a8 as ue,
    Q as de,
} from "./Sw0_Bl6Z.js";
import { _ as _e, g as z } from "./BN2Ejm_s.js";
const me = { class: "content" },
    fe = k({
        __name: "ScrollContent",
        props: { items: { default: () => [] }, progress: {} },
        setup(h) {
            const r = h,
                n = i("el"),
                e = i("title"),
                p = S(() => r.progress);
            P(() => {
                c(), s(), u.gsap.set(n.value, { autoAlpha: 1 });
            });
            const c = () => {
                    x(() => {
                        e.value.forEach((t) => {
                            F.create(t, { type: "lines, chars", linesClass: "--line", charsClass: "--char", tag: "span" });
                        });
                    });
                },
                s = () => {
                    x(() => {
                        const t = e.value.map((o) => (o == null ? void 0 : o.querySelectorAll(".--char"))),
                            l = 0.1,
                            a = 2;
                        N.create({
                            trigger: n.value,
                            start: "top top",
                            end: "bottom bottom",
                            scrub: !0,
                            onUpdate: () => {
                                const o = p.value - 0.03,
                                    d = Math.floor(o * 3),
                                    C = o * 3 - d,
                                    b = t[d];
                                if (
                                    (t
                                        .filter((f, g) => g !== d)
                                        .forEach((f) => {
                                            f == null ||
                                                f.forEach((g) => {
                                                    const E = "var(--c-lime)";
                                                    (g.style.opacity = "0"), (g.style.color = E);
                                                });
                                        }),
                                    !b)
                                )
                                    return;
                                const D = 0.5,
                                    I = D + l,
                                    Q = Math.min(C / D, 1);
                                let T = (C - I) / (1 - I);
                                T *= a;
                                const X = Math.max(0, Math.min(1, T)),
                                    V = b.length || 1;
                                b.forEach((f, g) => {
                                    let q = 0,
                                        E = "var(--c-lime)";
                                    const M = g / V,
                                        R = (g + 1) / V,
                                        Y = (Q - M) / (R - M),
                                        B = Math.max(0, Math.min(1, Y)),
                                        j = (X - M) / (R - M),
                                        J = Math.max(0, Math.min(1, j)),
                                        Z = H.Ease.pow2.out(B),
                                        ee = H.Ease.pow2.in(J);
                                    (q = Z * (1 - ee)), (E = B < 1 ? "var(--c-lime)" : "#ffffff"), (f.style.opacity = q.toString()), (f.style.color = E);
                                });
                            },
                        });
                    });
                };
            return (t, l) => (
                m(),
                v(
                    "div",
                    { ref_key: "el", ref: n, class: "homepage-scroll-content" },
                    [
                        _("div", me, [
                            (m(!0),
                            v(
                                te,
                                null,
                                se(r.items, (a, o) => (m(), v("h2", { ref_for: !0, ref: "title", key: o, class: "title title-sequence" }, oe(a.label), 1))),
                                128
                            )),
                        ]),
                    ],
                    512
                )
            );
        },
    }),
    ge = w(fe, [["__scopeId", "data-v-1fc0e13d"]]),
    ve = k({
        __name: "ScrollIndicator",
        setup(h) {
            const { mouseDamp: r, hasMoved: n } = ae(),
                e = i("el"),
                p = i("text");
            let c = 0,
                s = !0,
                t = null;
            P(() => {
                (t = F.create(p.value, { type: "chars", charsClass: "--char", tag: "span" })),
                    u.gsap.ticker.add(l),
                    a(),
                    u.gsap
                        .timeline({ scrollTrigger: { start: "top top", end: "top+=500", scrub: !0, onEnter: () => (s = !0), onEnterBack: () => (s = !0), onLeave: () => (s = !1) } })
                        .to(t.chars, { opacity: 0, duration: 0.4, ease: "expo.out", stagger: 0.02 }),
                    (c = e.value ? e.value.offsetWidth / 5 : 0),
                    K(() => {
                        c = e.value ? e.value.offsetWidth / 5 : 0;
                    }),
                    U(
                        n,
                        (d) => {
                            d && u.gsap.to(e.value, { autoAlpha: 1, duration: 1.4, ease: "expo.out" });
                        },
                        { immediate: !0 }
                    );
            });
            const l = () => {
                    !s || !e.value || (e.value.style.transform = `translate(${r.x + c}px, ${r.y}px)`);
                },
                a = () => {
                    const o = u.gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
                    t && t.chars && (o.to(t.chars, { color: "gray", stagger: 0.02, duration: 0.8 }), o.to(t.chars, { color: "white", stagger: 0.02, duration: 0.8 }, 0.8));
                };
            return (o, d) => (m(), v("div", { ref_key: "el", ref: e, class: "scroll-indicator" }, [_("p", { ref_key: "text", ref: p }, "Scroll to explore", 512)], 512));
        },
    }),
    he = w(ve, [["__scopeId", "data-v-4cd0d40d"]]),
    ye = k({
        __name: "ScrollIndicatorMobile",
        setup(h) {
            const r = i("container"),
                n = i("el"),
                e = i("inner"),
                { lenisScroll: p } = re(),
                c = S(() => p.value <= 50);
            let s = null;
            P(() => {
                u.gsap.set(r.value, { autoAlpha: 1 }),
                    t(),
                    U(
                        c,
                        (l) => {
                            l
                                ? (u.gsap.killTweensOf(r.value), u.gsap.to(r.value, { opacity: 1 }), t())
                                : (u.gsap.killTweensOf(r.value),
                                  u.gsap.to(r.value, {
                                      opacity: 0,
                                      onComplete: () => {
                                          s == null || s.kill();
                                      },
                                  }));
                        },
                        { immediate: !0 }
                    );
            });
            const t = () => {
                x(() => {
                    (s = u.gsap.timeline({ repeat: -1, repeatDelay: 0.3, defaults: { ease: "expo.out", duration: 1.2 } })),
                        s.to(e.value, { y: () => (n.value && e.value ? n.value.offsetHeight - e.value.offsetHeight : 0) }),
                        s.to(e.value, { y: 0 });
                });
            };
            return (l, a) => (
                m(),
                v(
                    "div",
                    { ref_key: "container", ref: r, class: "scroll-indicator-mobile" },
                    [_("span", { ref_key: "el", ref: n, class: "indicator" }, [_("div", { ref_key: "inner", ref: e, class: "inner" }, null, 512)], 512), a[0] || (a[0] = _("p", null, "SCROLL TO EXPLORE", -1))],
                    512
                )
            );
        },
    }),
    be = w(ye, [["__scopeId", "data-v-c4720eaf"]]),
    Se = { class: "video-sequence-background" },
    xe = { ref: "wrapper", class: "sequence-background-wrapper" },
    ke = k({
        __name: "VideoSequenceScroll",
        props: { frames: {}, framesKey: { default: "default" } },
        setup(h, { expose: r }) {
            const n = h,
                e = i("contentEl"),
                p = i("el"),
                c = i("wrapper"),
                s = L(0),
                t = L(!1);
            return (
                K(() => {
                    window.matchMedia("(pointer: fine)").matches ? (t.value = !0) : (t.value = !1);
                }),
                x(() => {
                    N.create({
                        trigger: e.value,
                        onUpdate: (o) => {
                            s.value = o.progress;
                        },
                        start: "top top",
                        end: "bottom bottom",
                    }).update();
                }),
                r({ el: p, contentEl: e, wrapperEl: c, progress: s }),
                (a, o) => {
                    const d = he,
                        C = be,
                        b = _e,
                        A = ce;
                    return (
                        m(),
                        v(
                            "div",
                            { ref_key: "el", ref: p, class: "video-sequence-scroll" },
                            [
                                y(t) ? (m(), O(d, { key: 0 })) : ne("", !0),
                                W($(C, null, null, 512), [[le, !y(t)]]),
                                _("div", Se, [_("div", xe, [$(A, null, { default: G(() => [(m(), O(b, { key: n.framesKey, frames: n.frames, progress: y(s) }, null, 8, ["frames", "progress"]))]), _: 1 })], 512)]),
                                _("div", { ref_key: "contentEl", ref: e, class: "content" }, [ie(a.$slots, "default", {}, void 0, !0)], 512),
                            ],
                            512
                        )
                    );
                }
            );
        },
    }),
    we = w(ke, [["__scopeId", "data-v-420d01d6"]]),
    Ce = { ref: "el", class: "video-carousel" },
    Ee = { ref: "wrapper", class: "wrapper" },
    Me = k({
        __name: "VideoCarousel",
        props: { blok: {} },
        setup(h) {
            const r = i("wrapper"),
                n = i("sequenceScroll"),
                { $gsap: e } = pe(),
                p = S(() => {
                    var l;
                    return ((l = n.value) == null ? void 0 : l.progress) || 0;
                }),
                c = ue(),
                s = S(() => (c.value ? "lg" : "mb")),
                t = S(() => (c.value ? z("/static/frames/home/desktop/webp/hero_anim_desktop_60_{index}.webp", 410) : z("/static/frames/home/mobile/webp/hero_anim_mobile_60_{index}.webp", 409)));
            return (
                x(() => {
                    var a;
                    e.timeline({ scrollTrigger: { trigger: r.value, start: "bottom bottom", end: "bottom top", scrub: !0 } }).fromTo(
                        (a = n.value) == null ? void 0 : a.wrapperEl,
                        { yPercent: 0 },
                        { yPercent: 50, ease: "none", duration: 1 }
                    );
                }),
                (l, a) => {
                    const o = ge,
                        d = de("editable");
                    return W(
                        (m(),
                        v("section", Ce, [
                            _(
                                "div",
                                Ee,
                                [
                                    $(we, { ref: "sequenceScroll", class: "video-sequence", frames: y(t), "frames-key": y(s) }, { default: G(() => a[0] || (a[0] = [_("div", { class: "content-sizer" }, null, -1)])), _: 1 }, 8, [
                                        "frames",
                                        "frames-key",
                                    ]),
                                ],
                                512
                            ),
                            $(o, { progress: y(p), items: l.blok.items }, null, 8, ["progress", "items"]),
                        ])),
                        [[d, l.blok]]
                    );
                }
            );
        },
    }),
    Pe = w(Me, [["__scopeId", "data-v-b481d9c3"]]);
export { Pe as default };
