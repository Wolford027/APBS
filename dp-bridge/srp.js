"use strict";
const crypto = require("crypto");

// ---- sha1 module (verbatim logic from the uploaded bundle) ----
const sha1 = (function() {
    var n = function() {
        function t(n) {
            for (var i = "", t = 7; t >= 0; t--)
                i += e.charAt(n >> t * 4 & 15);
            return i
        }
        function o(n) {
            for (var r = (n.length + 8 >> 6) + 1, i = new Array(r * 16), t = 0; t < r * 16; t++)
                i[t] = 0;
            for (t = 0; t < n.length; t++)
                i[t >> 2] |= n.charCodeAt(t) << 24 - t % 4 * 8;
            return i[t >> 2] |= 128 << 24 - t % 4 * 8,
            i[r * 16 - 1] = n.length * 8,
            i
        }
        function n(n, t) {
            var i = (n & 65535) + (t & 65535)
              , r = (n >> 16) + (t >> 16) + (i >> 16);
            return r << 16 | i & 65535
        }
        function r(n, t) {
            return n << t | n >>> 32 - t
        }
        function h(n, t, i, r) {
            return n < 20 ? t & i | ~t & r : n < 40 ? t ^ i ^ r : n < 60 ? t & i | t & r | i & r : t ^ i ^ r
        }
        function c(n) {
            return n < 20 ? 1518500249 : n < 40 ? 1859775393 : n < 60 ? -1894007588 : -899497514
        }
        function l(n) {
            return i(o(n))
        }
        function i(n) {
            var i = f(n);
            return t(i[0]) + t(i[1]) + t(i[2]) + t(i[3]) + t(i[4])
        }
        function f(t) {
            for (var i, v, s = new Array(80), u = 1732584193, f = -271733879, e = -1732584194, o = 271733878, l = -1009589776, a = 0; a < t.length; a += 16) {
                var y = u
                  , p = f
                  , w = e
                  , b = o
                  , k = l;
                for (i = 0; i < 80; i++)
                    s[i] = i < 16 ? t[a + i] : r(s[i - 3] ^ s[i - 8] ^ s[i - 14] ^ s[i - 16], 1),
                    v = n(n(r(u, 5), h(i, f, e, o)), n(n(l, s[i]), c(i))),
                    l = o,
                    o = e,
                    e = r(f, 30),
                    f = u,
                    u = v;
                u = n(u, y);
                f = n(f, p);
                e = n(e, w);
                o = n(o, b);
                l = n(l, k)
            }
            return [u, f, e, o, l]
        }
        var e = "0123456789abcdef";
        return {
            calcSHA1: l
        }
    };
    return n()
})();

// ---- minimal sjcl shim: only randomWords + hex codec are used on the sha-1 path ----
const sjcl = {
    random: {
        randomWords: function(nWords) {
            const buf = crypto.randomBytes(nWords * 4);
            const out = [];
            for (let i = 0; i < nWords; i++) out.push(buf.readInt32BE(i * 4));
            return out;
        }
    },
    codec: {
        hex: {
            fromBits: function(words) {
                return words.map(w => ((w >>> 0).toString(16)).padStart(8, "0")).join("");
            }
        }
    }
};

// ---- BigInteger (verbatim from the uploaded bundle) ----
const BigInteger = (function() {
    function n(n, t, i) {
        n != null && ("number" == typeof n ? this.fromNumber(n, t, i) : t == null && "string" != typeof n ? this.fromString(n, 256) : this.fromString(n, t))
    }
    function t() {
        return new n(null)
    }
    function it(n, t, i, r, u, f) {
        while (--f >= 0) {
            var e = t * this[n++] + i[r] + u;
            u = Math.floor(e / 67108864);
            i[r++] = e & 67108863
        }
        return u
    }
    function rt(n, t, i, r, u, f) {
        for (var o = t & 32767, s = t >> 15; --f >= 0; ) {
            var e = this[n] & 32767
              , h = this[n++] >> 15
              , c = s * e + h * o;
            e = o * e + ((c & 32767) << 15) + i[r] + (u & 1073741823);
            u = (e >>> 30) + (c >>> 15) + s * h + (u >>> 30);
            i[r++] = e & 1073741823
        }
        return u
    }
    function ut(n, t, i, r, u, f) {
        for (var o = t & 16383, s = t >> 14; --f >= 0; ) {
            var e = this[n] & 16383
              , h = this[n++] >> 14
              , c = s * e + h * o;
            e = o * e + ((c & 16383) << 14) + i[r] + u;
            u = (e >> 28) + (c >> 14) + s * h;
            i[r++] = e & 268435455
        }
        return u
    }
    function b(n) {
        return w.charAt(n)
    }
    function k(n, t) {
        var i = c[n.charCodeAt(t)];
        return i == null ? -1 : i
    }
    function ft(n) {
        for (var t = this.t - 1; t >= 0; --t)
            n[t] = this[t];
        n.t = this.t;
        n.s = this.s
    }
    function et(n) {
        this.t = 1;
        this.s = n < 0 ? -1 : 0;
        n > 0 ? this[0] = n : n < -1 ? this[0] = n + DV : this.t = 0
    }
    function f(n) {
        var i = t();
        return i.fromInt(n),
        i
    }
    function ot(t, i) {
        var u, f;
        if (i == 16)
            u = 4;
        else if (i == 8)
            u = 3;
        else if (i == 256)
            u = 8;
        else if (i == 2)
            u = 1;
        else if (i == 32)
            u = 5;
        else if (i == 4)
            u = 2;
        else {
            this.fromRadix(t, i);
            return
        }
        this.t = 0;
        this.s = 0;
        for (var e = t.length, o = !1, r = 0; --e >= 0; ) {
            if (f = u == 8 ? t[e] & 255 : k(t, e),
            f < 0) {
                t.charAt(e) == "-" && (o = !0);
                continue
            }
            o = !1;
            r == 0 ? this[this.t++] = f : r + u > this.DB ? (this[this.t - 1] |= (f & (1 << this.DB - r) - 1) << r,
            this[this.t++] = f >> this.DB - r) : this[this.t - 1] |= f << r;
            r += u;
            r >= this.DB && (r -= this.DB)
        }
        u == 8 && (t[0] & 128) != 0 && (this.s = -1,
        r > 0 && (this[this.t - 1] |= (1 << this.DB - r) - 1 << r));
        this.clamp();
        o && n.ZERO.subTo(this, this)
    }
    function st() {
        for (var n = this.s & this.DM; this.t > 0 && this[this.t - 1] == n; )
            --this.t
    }
    function ht(n) {
        var t;
        if (this.s < 0)
            return "-" + this.negate().toString(n);
        if (n == 16)
            t = 4;
        else if (n == 8)
            t = 3;
        else if (n == 2)
            t = 1;
        else if (n == 32)
            t = 5;
        else if (n == 4)
            t = 2;
        else
            return this.toRadix(n);
        var o = (1 << t) - 1, u, f = !1, e = "", r = this.t, i = this.DB - r * this.DB % t;
        if (r-- > 0)
            for (i < this.DB && (u = this[r] >> i) > 0 && (f = !0,
            e = b(u)); r >= 0; )
                i < t ? u = (this[r] & (1 << i) - 1) << t - i | this[--r] >> (i += this.DB - t) : (u = this[r] >> (i -= t) & o,
                i <= 0 && (i += this.DB,
                --r)),
                u > 0 && (f = !0),
                f && (e += b(u));
        return f ? e : "0"
    }
    function ct() {
        var i = t();
        return n.ZERO.subTo(this, i),
        i
    }
    function lt() {
        return this.s < 0 ? this.negate() : this
    }
    function at(n) {
        var t = this.s - n.s, i;
        if (t != 0)
            return t;
        if (i = this.t,
        t = i - n.t,
        t != 0)
            return this.s < 0 ? -t : t;
        while (--i >= 0)
            if ((t = this[i] - n[i]) != 0)
                return t;
        return 0
    }
    function v(n) {
        var i = 1, t;
        return (t = n >>> 16) != 0 && (n = t,
        i += 16),
        (t = n >> 8) != 0 && (n = t,
        i += 8),
        (t = n >> 4) != 0 && (n = t,
        i += 4),
        (t = n >> 2) != 0 && (n = t,
        i += 2),
        (t = n >> 1) != 0 && (n = t,
        i += 1),
        i
    }
    function vt() {
        return this.t <= 0 ? 0 : this.DB * (this.t - 1) + v(this[this.t - 1] ^ this.s & this.DM)
    }
    function yt(n, t) {
        for (var i = this.t - 1; i >= 0; --i)
            t[i + n] = this[i];
        for (i = n - 1; i >= 0; --i)
            t[i] = 0;
        t.t = this.t + n;
        t.s = this.s
    }
    function pt(n, t) {
        for (var i = n; i < this.t; ++i)
            t[i - n] = this[i];
        t.t = Math.max(this.t - n, 0);
        t.s = this.s
    }
    function wt(n, t) {
        for (var u = n % this.DB, e = this.DB - u, o = (1 << e) - 1, r = Math.floor(n / this.DB), f = this.s << u & this.DM, i = this.t - 1; i >= 0; --i)
            t[i + r + 1] = this[i] >> e | f,
            f = (this[i] & o) << u;
        for (i = r - 1; i >= 0; --i)
            t[i] = 0;
        t[r] = f;
        t.t = this.t + r + 1;
        t.s = this.s;
        t.clamp()
    }
    function bt(n, t) {
        var i, r;
        if (t.s = this.s,
        i = Math.floor(n / this.DB),
        i >= this.t) {
            t.t = 0;
            return
        }
        var u = n % this.DB
          , f = this.DB - u
          , e = (1 << u) - 1;
        for (t[0] = this[i] >> u,
        r = i + 1; r < this.t; ++r)
            t[r - i - 1] |= (this[r] & e) << f,
            t[r - i] = this[r] >> u;
        u > 0 && (t[this.t - i - 1] |= (this.s & e) << f);
        t.t = this.t - i;
        t.clamp()
    }
    function kt(n, t) {
        for (var r = 0, i = 0, u = Math.min(n.t, this.t); r < u; )
            i += this[r] - n[r],
            t[r++] = i & this.DM,
            i >>= this.DB;
        if (n.t < this.t) {
            for (i -= n.s; r < this.t; )
                i += this[r],
                t[r++] = i & this.DM,
                i >>= this.DB;
            i += this.s
        } else {
            for (i += this.s; r < n.t; )
                i -= n[r],
                t[r++] = i & this.DM,
                i >>= this.DB;
            i -= n.s
        }
        t.s = i < 0 ? -1 : 0;
        i < -1 ? t[r++] = this.DV + i : i > 0 && (t[r++] = i);
        t.t = r;
        t.clamp()
    }
    function dt(t, i) {
        var u = this.abs()
          , f = t.abs()
          , r = u.t;
        for (i.t = r + f.t; --r >= 0; )
            i[r] = 0;
        for (r = 0; r < f.t; ++r)
            i[r + u.t] = u.am(0, f[r], i, r, 0, u.t);
        i.s = 0;
        i.clamp();
        this.s != t.s && n.ZERO.subTo(i, i)
    }
    function gt(n) {
        for (var i = this.abs(), t = n.t = 2 * i.t, r; --t >= 0; )
            n[t] = 0;
        for (t = 0; t < i.t - 1; ++t)
            r = i.am(t, i[t], n, 2 * t, 0, 1),
            (n[t + i.t] += i.am(t + 1, 2 * i[t], n, 2 * t + 1, r, i.t - t - 1)) >= i.DV && (n[t + i.t] -= i.DV,
            n[t + i.t + 1] = 1);
        n.t > 0 && (n[n.t - 1] += i.am(t, i[t], n, 2 * t, 0, 1));
        n.s = 0;
        n.clamp()
    }
    function ni(i, r, u) {
        var s = i.abs(), l, e, a, p;
        if (!(s.t <= 0)) {
            if (l = this.abs(),
            l.t < s.t) {
                r != null && r.fromInt(0);
                u != null && this.copyTo(u);
                return
            }
            u == null && (u = t());
            var f = t()
              , w = this.s
              , k = i.s
              , c = this.DB - v(s[s.t - 1]);
            if (c > 0 ? (s.lShiftTo(c, f),
            l.lShiftTo(c, u)) : (s.copyTo(f),
            l.copyTo(u)),
            e = f.t,
            a = f[e - 1],
            a != 0) {
                var b = a * (1 << this.F1) + (e > 1 ? f[e - 2] >> this.F2 : 0)
                  , d = this.FV / b
                  , g = (1 << this.F1) / b
                  , nt = 1 << this.F2
                  , h = u.t
                  , y = h - e
                  , o = r == null ? t() : r;
                for (f.dlShiftTo(y, o),
                u.compareTo(o) >= 0 && (u[u.t++] = 1,
                u.subTo(o, u)),
                n.ONE.dlShiftTo(e, o),
                o.subTo(f, f); f.t < e; )
                    f[f.t++] = 0;
                while (--y >= 0)
                    if (p = u[--h] == a ? this.DM : Math.floor(u[h] * d + (u[h - 1] + nt) * g),
                    (u[h] += f.am(0, p, u, y, 0, e)) < p)
                        for (f.dlShiftTo(y, o),
                        u.subTo(o, u); u[h] < --p; )
                            u.subTo(o, u);
                r != null && (u.drShiftTo(e, r),
                w != k && n.ZERO.subTo(r, r));
                u.t = e;
                u.clamp();
                c > 0 && u.rShiftTo(c, u);
                w < 0 && n.ZERO.subTo(u, u)
            }
        }
    }
    function ti(i) {
        var r = t();
        return this.abs().divRemTo(i, null, r),
        this.s < 0 && r.compareTo(n.ZERO) > 0 && i.subTo(r, r),
        r
    }
    function e(n) {
        this.m = n
    }
    function ii(n) {
        return n.s < 0 || n.compareTo(this.m) >= 0 ? n.mod(this.m) : n
    }
    function ri(n) {
        return n
    }
    function ui(n) {
        n.divRemTo(this.m, null, n)
    }
    function fi(n, t, i) {
        n.multiplyTo(t, i);
        this.reduce(i)
    }
    function ei(n, t) {
        n.squareTo(t);
        this.reduce(t)
    }
    function oi() {
        var t, n;
        return this.t < 1 ? 0 : (t = this[0],
        (t & 1) == 0) ? 0 : (n = t & 3,
        n = n * (2 - (t & 15) * n) & 15,
        n = n * (2 - (t & 255) * n) & 255,
        n = n * (2 - ((t & 65535) * n & 65535)) & 65535,
        n = n * (2 - t * n % this.DV) % this.DV,
        n > 0 ? this.DV - n : -n)
    }
    function o(n) {
        this.m = n;
        this.mp = n.invDigit();
        this.mpl = this.mp & 32767;
        this.mph = this.mp >> 15;
        this.um = (1 << n.DB - 15) - 1;
        this.mt2 = 2 * n.t
    }
    function si(i) {
        var r = t();
        return i.abs().dlShiftTo(this.m.t, r),
        r.divRemTo(this.m, null, r),
        i.s < 0 && r.compareTo(n.ZERO) > 0 && this.m.subTo(r, r),
        r
    }
    function hi(n) {
        var i = t();
        return n.copyTo(i),
        this.reduce(i),
        i
    }
    function ci(n) {
        for (var i, t, r; n.t <= this.mt2; )
            n[n.t++] = 0;
        for (i = 0; i < this.m.t; ++i)
            for (t = n[i] & 32767,
            r = t * this.mpl + ((t * this.mph + (n[i] >> 15) * this.mpl & this.um) << 15) & n.DM,
            t = i + this.m.t,
            n[t] += this.m.am(0, r, n, i, 0, this.m.t); n[t] >= n.DV; )
                n[t] -= n.DV,
                n[++t]++;
        n.clamp();
        n.drShiftTo(this.m.t, n);
        n.compareTo(this.m) >= 0 && n.subTo(this.m, n)
    }
    function li(n, t) {
        n.squareTo(t);
        this.reduce(t)
    }
    function ai(n, t, i) {
        n.multiplyTo(t, i);
        this.reduce(i)
    }
    function vi() {
        return (this.t > 0 ? this[0] & 1 : this.s) == 0
    }
    function yi(i, r) {
        var s;
        if (i > 4294967295 || i < 1)
            return n.ONE;
        var u = t()
          , f = t()
          , e = r.convert(this)
          , o = v(i) - 1;
        for (e.copyTo(u); --o >= 0; )
            r.sqrTo(u, f),
            (i & 1 << o) > 0 ? r.mulTo(f, e, u) : (s = u,
            u = f,
            f = s);
        return r.revert(u)
    }
    function pi(n, t) {
        var i;
        return i = n < 256 || t.isEven() ? new e(t) : new o(t),
        this.exp(n, i)
    }
    function wi() {
        var n = t();
        return this.copyTo(n),
        n
    }
    function bi() {
        if (this.s < 0) {
            if (this.t == 1)
                return this[0] - this.DV;
            if (this.t == 0)
                return -1
        } else {
            if (this.t == 1)
                return this[0];
            if (this.t == 0)
                return 0
        }
        return (this[1] & (1 << 32 - this.DB) - 1) << this.DB | this[0]
    }
    function ki() {
        return this.t == 0 ? this.s : this[0] << 24 >> 24
    }
    function di() {
        return this.t == 0 ? this.s : this[0] << 16 >> 16
    }
    function gi(n) {
        return Math.floor(Math.LN2 * this.DB / Math.log(n))
    }
    function nr() {
        return this.s < 0 ? -1 : this.t <= 0 || this.t == 1 && this[0] <= 0 ? 0 : 1
    }
    function tr(n) {
        if (n == null && (n = 10),
        this.signum() == 0 || n < 2 || n > 36)
            return "0";
        var s = this.chunkSize(n)
          , e = Math.pow(n, s)
          , o = f(e)
          , i = t()
          , r = t()
          , u = "";
        for (this.divRemTo(o, i, r); i.signum() > 0; )
            u = (e + r.intValue()).toString(n).substr(1) + u,
            i.divRemTo(o, i, r);
        return r.intValue().toString(n) + u
    }
    function ir(t, i) {
        var u, e;
        this.fromInt(0);
        i == null && (i = 10);
        var o = this.chunkSize(i)
          , h = Math.pow(i, o)
          , s = !1
          , f = 0
          , r = 0;
        for (u = 0; u < t.length; ++u) {
            if (e = k(t, u),
            e < 0) {
                t.charAt(u) == "-" && this.signum() == 0 && (s = !0);
                continue
            }
            r = i * r + e;
            ++f >= o && (this.dMultiply(h),
            this.dAddOffset(r, 0),
            f = 0,
            r = 0)
        }
        f > 0 && (this.dMultiply(Math.pow(i, f)),
        this.dAddOffset(r, 0));
        s && n.ZERO.subTo(this, this)
    }
    function rr(t, i, r) {
        if ("number" == typeof i)
            if (t < 2)
                this.fromInt(1);
            else
                for (this.fromNumber(t, r),
                this.testBit(t - 1) || this.bitwiseTo(n.ONE.shiftLeft(t - 1), y, this),
                this.isEven() && this.dAddOffset(1, 0); !this.isProbablePrime(i); )
                    this.dAddOffset(2, 0),
                    this.bitLength() > t && this.subTo(n.ONE.shiftLeft(t - 1), this);
        else {
            var u = []
              , f = t & 7;
            u.length = (t >> 3) + 1;
            i.nextBytes(u);
            f > 0 ? u[0] &= (1 << f) - 1 : u[0] = 0;
            this.fromString(u, 256)
        }
    }
    function ur() {
        var i = this.t, u = [], n, t, r;
        if (u[0] = this.s,
        n = this.DB - i * this.DB % 8,
        r = 0,
        i-- > 0)
            for (n < this.DB && (t = this[i] >> n) != (this.s & this.DM) >> n && (u[r++] = t | this.s << this.DB - n); i >= 0; )
                n < 8 ? t = (this[i] & (1 << n) - 1) << 8 - n | this[--i] >> (n += this.DB - 8) : (t = this[i] >> (n -= 8) & 255,
                n <= 0 && (n += this.DB,
                --i)),
                (t & 128) != 0 && (t |= -256),
                r == 0 && (this.s & 128) != (t & 128) && ++r,
                (r > 0 || t != this.s) && (u[r++] = t);
        return u
    }
    function fr(n) {
        return this.compareTo(n) == 0
    }
    function er(n) {
        return this.compareTo(n) < 0 ? this : n
    }
    function or(n) {
        return this.compareTo(n) > 0 ? this : n
    }
    function sr(n, t, i) {
        for (var u, f = Math.min(n.t, this.t), r = 0; r < f; ++r)
            i[r] = t(this[r], n[r]);
        if (n.t < this.t) {
            for (u = n.s & this.DM,
            r = f; r < this.t; ++r)
                i[r] = t(this[r], u);
            i.t = this.t
        } else {
            for (u = this.s & this.DM,
            r = f; r < n.t; ++r)
                i[r] = t(u, n[r]);
            i.t = n.t
        }
        i.s = t(this.s, n.s);
        i.clamp()
    }
    function hr(n, t) {
        return n & t
    }
    function cr(n) {
        var i = t();
        return this.bitwiseTo(n, hr, i),
        i
    }
    function y(n, t) {
        return n | t
    }
    function lr(n) {
        var i = t();
        return this.bitwiseTo(n, y, i),
        i
    }
    function d(n, t) {
        return n ^ t
    }
    function ar(n) {
        var i = t();
        return this.bitwiseTo(n, d, i),
        i
    }
    function g(n, t) {
        return n & ~t
    }
    function vr(n) {
        var i = t();
        return this.bitwiseTo(n, g, i),
        i
    }
    function yr() {
        for (var n = t(), i = 0; i < this.t; ++i)
            n[i] = this.DM & ~this[i];
        return n.t = this.t,
        n.s = ~this.s,
        n
    }
    function pr(n) {
        var i = t();
        return n < 0 ? this.rShiftTo(-n, i) : this.lShiftTo(n, i),
        i
    }
    function wr(n) {
        var i = t();
        return n < 0 ? this.lShiftTo(-n, i) : this.rShiftTo(n, i),
        i
    }
    function br(n) {
        if (n == 0)
            return -1;
        var t = 0;
        return (n & 65535) == 0 && (n >>= 16,
        t += 16),
        (n & 255) == 0 && (n >>= 8,
        t += 8),
        (n & 15) == 0 && (n >>= 4,
        t += 4),
        (n & 3) == 0 && (n >>= 2,
        t += 2),
        (n & 1) == 0 && ++t,
        t
    }
    function kr() {
        for (var n = 0; n < this.t; ++n)
            if (this[n] != 0)
                return n * this.DB + br(this[n]);
        return this.s < 0 ? this.t * this.DB : -1
    }
    function dr(n) {
        for (var t = 0; n != 0; )
            n &= n - 1,
            ++t;
        return t
    }
    function gr() {
        for (var t = 0, i = this.s & this.DM, n = 0; n < this.t; ++n)
            t += dr(this[n] ^ i);
        return t
    }
    function nu(n) {
        var t = Math.floor(n / this.DB);
        return t >= this.t ? this.s != 0 : (this[t] & 1 << n % this.DB) != 0
    }
    function tu(t, i) {
        var r = n.ONE.shiftLeft(t);
        return this.bitwiseTo(r, i, r),
        r
    }
    function iu(n) {
        return this.changeBit(n, y)
    }
    function ru(n) {
        return this.changeBit(n, g)
    }
    function uu(n) {
        return this.changeBit(n, d)
    }
    function fu(n, t) {
        for (var r = 0, i = 0, u = Math.min(n.t, this.t); r < u; )
            i += this[r] + n[r],
            t[r++] = i & this.DM,
            i >>= this.DB;
        if (n.t < this.t) {
            for (i += n.s; r < this.t; )
                i += this[r],
                t[r++] = i & this.DM,
                i >>= this.DB;
            i += this.s
        } else {
            for (i += this.s; r < n.t; )
                i += n[r],
                t[r++] = i & this.DM,
                i >>= this.DB;
            i += n.s
        }
        t.s = i < 0 ? -1 : 0;
        i > 0 ? t[r++] = i : i < -1 && (t[r++] = this.DV + i);
        t.t = r;
        t.clamp()
    }
    function eu(n) {
        var i = t();
        return this.addTo(n, i),
        i
    }
    function ou(n) {
        var i = t();
        return this.subTo(n, i),
        i
    }
    function su(n) {
        var i = t();
        return this.multiplyTo(n, i),
        i
    }
    function hu() {
        var n = t();
        return this.squareTo(n),
        n
    }
    function cu(n) {
        var i = t();
        return this.divRemTo(n, i, null),
        i
    }
    function lu(n) {
        var i = t();
        return this.divRemTo(n, null, i),
        i
    }
    function au(n) {
        var i = t()
          , r = t();
        return this.divRemTo(n, i, r),
        [i, r]
    }
    function vu(n) {
        this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp()
    }
    function yu(n, t) {
        if (n != 0) {
            while (this.t <= t)
                this[this.t++] = 0;
            for (this[t] += n; this[t] >= this.DV; )
                this[t] -= this.DV,
                ++t >= this.t && (this[this.t++] = 0),
                ++this[t]
        }
    }
    function l() {}
    function nt(n) {
        return n
    }
    function pu(n, t, i) {
        n.multiplyTo(t, i)
    }
    function wu(n, t) {
        n.squareTo(t)
    }
    function bu(n) {
        return this.exp(n, new l)
    }
    function ku(n, t, i) {
        var r = Math.min(this.t + n.t, t), u;
        for (i.s = 0,
        i.t = r; r > 0; )
            i[--r] = 0;
        for (u = i.t - this.t; r < u; ++r)
            i[r + this.t] = this.am(0, n[r], i, r, 0, this.t);
        for (u = Math.min(n.t, t); r < u; ++r)
            this.am(0, n[r], i, r, 0, t - r);
        i.clamp()
    }
    function du(n, t, i) {
        --t;
        var r = i.t = this.t + n.t - t;
        for (i.s = 0; --r >= 0; )
            i[r] = 0;
        for (r = Math.max(t - this.t, 0); r < n.t; ++r)
            i[this.t + r - t] = this.am(t - r, n[r], i, 0, 0, this.t + r - t);
        i.clamp();
        i.drShiftTo(1, i)
    }
    function h(i) {
        this.r2 = t();
        this.q3 = t();
        n.ONE.dlShiftTo(2 * i.t, this.r2);
        this.mu = this.r2.divide(i);
        this.m = i
    }
    function gu(n) {
        if (n.s < 0 || n.t > 2 * this.m.t)
            return n.mod(this.m);
        if (n.compareTo(this.m) < 0)
            return n;
        var i = t();
        return n.copyTo(i),
        this.reduce(i),
        i
    }
    function nf(n) {
        return n
    }
    function tf(n) {
        for (n.drShiftTo(this.m.t - 1, this.r2),
        n.t > this.m.t + 1 && (n.t = this.m.t + 1,
        n.clamp()),
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3),
        this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2); n.compareTo(this.r2) < 0; )
            n.dAddOffset(1, this.m.t + 1);
        for (n.subTo(this.r2, n); n.compareTo(this.m) >= 0; )
            n.subTo(this.m, n)
    }
    function rf(n, t) {
        n.squareTo(t);
        this.reduce(t)
    }
    function uf(n, t, i) {
        n.multiplyTo(t, i);
        this.reduce(i)
    }
    function ff(n, i) {
        var r = n.bitLength(), w, u = f(1), c, d;
        if (r <= 0)
            return u;
        w = r < 18 ? 1 : r < 48 ? 3 : r < 144 ? 4 : r < 768 ? 5 : 6;
        c = r < 8 ? new e(i) : i.isEven() ? new h(i) : new o(i);
        var y = []
          , s = 3
          , b = w - 1
          , g = (1 << w) - 1;
        if (y[1] = c.convert(this),
        w > 1)
            for (d = t(),
            c.sqrTo(y[1], d); s <= g; )
                y[s] = t(),
                c.mulTo(d, y[s - 2], y[s]),
                s += 2;
        var l = n.t - 1, p, nt = !0, a = t(), k;
        for (r = v(n[l]) - 1; l >= 0; ) {
            for (r >= b ? p = n[l] >> r - b & g : (p = (n[l] & (1 << r + 1) - 1) << b - r,
            l > 0 && (p |= n[l - 1] >> this.DB + r - b)),
            s = w; (p & 1) == 0; )
                p >>= 1,
                --s;
            if ((r -= s) < 0 && (r += this.DB,
            --l),
            nt)
                y[p].copyTo(u),
                nt = !1;
            else {
                while (s > 1)
                    c.sqrTo(u, a),
                    c.sqrTo(a, u),
                    s -= 2;
                s > 0 ? c.sqrTo(u, a) : (k = u,
                u = a,
                a = k);
                c.mulTo(a, y[p], u)
            }
            while (l >= 0 && (n[l] & 1 << r) == 0)
                c.sqrTo(u, a),
                k = u,
                u = a,
                a = k,
                --r < 0 && (r = this.DB - 1,
                --l)
        }
        return c.revert(u)
    }
    function ef(n) {
        var i = this.s < 0 ? this.negate() : this.clone(), t = n.s < 0 ? n.negate() : n.clone(), f, u, r;
        if (i.compareTo(t) < 0 && (f = i,
        i = t,
        t = f),
        u = i.getLowestSetBit(),
        r = t.getLowestSetBit(),
        r < 0)
            return i;
        for (u < r && (r = u),
        r > 0 && (i.rShiftTo(r, i),
        t.rShiftTo(r, t)); i.signum() > 0; )
            (u = i.getLowestSetBit()) > 0 && i.rShiftTo(u, i),
            (u = t.getLowestSetBit()) > 0 && t.rShiftTo(u, t),
            i.compareTo(t) >= 0 ? (i.subTo(t, i),
            i.rShiftTo(1, i)) : (t.subTo(i, t),
            t.rShiftTo(1, t));
        return r > 0 && t.lShiftTo(r, t),
        t
    }
    function of(n) {
        var r, t, i;
        if (n <= 0)
            return 0;
        if (r = this.DV % n,
        t = this.s < 0 ? n - 1 : 0,
        this.t > 0)
            if (r == 0)
                t = this[0] % n;
            else
                for (i = this.t - 1; i >= 0; --i)
                    t = (r * t + this[i]) % n;
        return t
    }
    function sf(t) {
        var h = t.isEven();
        if (this.isEven() && h || t.signum() == 0)
            return n.ZERO;
        for (var u = t.clone(), e = this.clone(), o = f(1), r = f(0), s = f(0), i = f(1); u.signum() != 0; ) {
            while (u.isEven())
                u.rShiftTo(1, u),
                h ? (o.isEven() && r.isEven() || (o.addTo(this, o),
                r.subTo(t, r)),
                o.rShiftTo(1, o)) : r.isEven() || r.subTo(t, r),
                r.rShiftTo(1, r);
            while (e.isEven())
                e.rShiftTo(1, e),
                h ? (s.isEven() && i.isEven() || (s.addTo(this, s),
                i.subTo(t, i)),
                s.rShiftTo(1, s)) : i.isEven() || i.subTo(t, i),
                i.rShiftTo(1, i);
            u.compareTo(e) >= 0 ? (u.subTo(e, u),
            h && o.subTo(s, o),
            r.subTo(i, r)) : (e.subTo(u, e),
            h && s.subTo(o, s),
            i.subTo(r, i))
        }
        if (e.compareTo(n.ONE) != 0)
            return n.ZERO;
        if (i.compareTo(t) >= 0)
            return i.subtract(t);
        if (i.signum() < 0)
            i.addTo(t, i);
        else
            return i;
        return i.signum() < 0 ? i.add(t) : i
    }
    function hf(n) {
        var t, r = this.abs(), u, f;
        if (r.t == 1 && r[0] <= i[i.length - 1]) {
            for (t = 0; t < i.length; ++t)
                if (r[0] == i[t])
                    return !0;
            return !1
        }
        if (r.isEven())
            return !1;
        for (t = 1; t < i.length; ) {
            for (u = i[t],
            f = t + 1; f < i.length && u < tt; )
                u *= i[f++];
            for (u = r.modInt(u); t < f; )
                if (u % i[t++] == 0)
                    return !1
        }
        return r.millerRabin(n)
    }
    function cf(r) {
        var f = this.subtract(n.ONE), e = f.getLowestSetBit(), h, o, s, u, c;
        if (e <= 0)
            return !1;
        for (h = f.shiftRight(e),
        r = r + 1 >> 1,
        r > i.length && (r = i.length),
        o = t(),
        s = 0; s < r; ++s)
            if (o.fromInt(i[Math.floor(Math.random() * i.length)]),
            u = o.modPow(h, this),
            u.compareTo(n.ONE) != 0 && u.compareTo(f) != 0) {
                for (c = 1; c++ < e && u.compareTo(f) != 0; )
                    if (u = u.modPowInt(2, this),
                    u.compareTo(n.ONE) == 0)
                        return !1;
                if (u.compareTo(f) != 0)
                    return !1
            }
        return !0
    }
    var u, p = (0xdeadbeefcafe & 16777215) == 15715070, a, w, c, s, r, i, tt;
    for (p && typeof navigator != "undefined" && navigator.appName == "Microsoft Internet Explorer" ? (n.prototype.am = rt,
    u = 30) : (n.prototype.am = ut,
    u = 28),
    n.prototype.DB = u,
    n.prototype.DM = (1 << u) - 1,
    n.prototype.DV = 1 << u,
    a = 52,
    n.prototype.FV = Math.pow(2, a),
    n.prototype.F1 = a - u,
    n.prototype.F2 = 2 * u - a,
    w = "0123456789abcdefghijklmnopqrstuvwxyz",
    c = [],
    s = "0".charCodeAt(0),
    r = 0; r <= 9; ++r)
        c[s++] = r;
    for (s = "a".charCodeAt(0),
    r = 10; r < 36; ++r)
        c[s++] = r;
    for (s = "A".charCodeAt(0),
    r = 10; r < 36; ++r)
        c[s++] = r;
    return e.prototype.convert = ii,
    e.prototype.revert = ri,
    e.prototype.reduce = ui,
    e.prototype.mulTo = fi,
    e.prototype.sqrTo = ei,
    o.prototype.convert = si,
    o.prototype.revert = hi,
    o.prototype.reduce = ci,
    o.prototype.mulTo = ai,
    o.prototype.sqrTo = li,
    n.prototype.copyTo = ft,
    n.prototype.fromInt = et,
    n.prototype.fromString = ot,
    n.prototype.clamp = st,
    n.prototype.dlShiftTo = yt,
    n.prototype.drShiftTo = pt,
    n.prototype.lShiftTo = wt,
    n.prototype.rShiftTo = bt,
    n.prototype.subTo = kt,
    n.prototype.multiplyTo = dt,
    n.prototype.squareTo = gt,
    n.prototype.divRemTo = ni,
    n.prototype.invDigit = oi,
    n.prototype.isEven = vi,
    n.prototype.exp = yi,
    n.prototype.toString = ht,
    n.prototype.negate = ct,
    n.prototype.abs = lt,
    n.prototype.compareTo = at,
    n.prototype.bitLength = vt,
    n.prototype.mod = ti,
    n.prototype.modPowInt = pi,
    n.ZERO = f(0),
    n.ONE = f(1),
    l.prototype.convert = nt,
    l.prototype.revert = nt,
    l.prototype.mulTo = pu,
    l.prototype.sqrTo = wu,
    h.prototype.convert = gu,
    h.prototype.revert = nf,
    h.prototype.reduce = tf,
    h.prototype.mulTo = uf,
    h.prototype.sqrTo = rf,
    i = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997],
    tt = 67108864 / i[i.length - 1],
    n.prototype.chunkSize = gi,
    n.prototype.toRadix = tr,
    n.prototype.fromRadix = ir,
    n.prototype.fromNumber = rr,
    n.prototype.bitwiseTo = sr,
    n.prototype.changeBit = tu,
    n.prototype.addTo = fu,
    n.prototype.dMultiply = vu,
    n.prototype.dAddOffset = yu,
    n.prototype.multiplyLowerTo = ku,
    n.prototype.multiplyUpperTo = du,
    n.prototype.modInt = of,
    n.prototype.millerRabin = cf,
    n.prototype.clone = wi,
    n.prototype.intValue = bi,
    n.prototype.byteValue = ki,
    n.prototype.shortValue = di,
    n.prototype.signum = nr,
    n.prototype.toByteArray = ur,
    n.prototype.equals = fr,
    n.prototype.min = er,
    n.prototype.max = or,
    n.prototype.and = cr,
    n.prototype.or = lr,
    n.prototype.xor = ar,
    n.prototype.andNot = vr,
    n.prototype.not = yr,
    n.prototype.shiftLeft = pr,
    n.prototype.shiftRight = wr,
    n.prototype.getLowestSetBit = kr,
    n.prototype.bitCount = gr,
    n.prototype.testBit = nu,
    n.prototype.setBit = iu,
    n.prototype.clearBit = ru,
    n.prototype.flipBit = uu,
    n.prototype.add = eu,
    n.prototype.subtract = ou,
    n.prototype.multiply = su,
    n.prototype.divide = cu,
    n.prototype.remainder = lu,
    n.prototype.divideAndRemainder = au,
    n.prototype.modPow = ff,
    n.prototype.modInverse = sf,
    n.prototype.pow = bu,
    n.prototype.gcd = ef,
    n.prototype.isProbablePrime = hf,
    n.prototype.square = hu,
    n
})();

const SRPClient = (function(n, t, r) {
    var u = function(n, t, i, u) {
        if (!n)
            throw "Username cannot be empty.";
        this.username = n;
        this.password = t;
        this.hashFn = u || "sha-1";
        var i = i || 1024
          , f = this.initVals[i];
        this.N = new r(f.N,16);
        this.g = new r(f.g,16);
        this.gBn = new r(f.g,16);
        this.k = this.k();
        this.one = new r("1",16);
        this.two = new r("2",16)
    };
    return u.prototype = {
        toHexString: function(n) {
            var t = n.toString(16);
            return t.length % 2 == 1 && (t = "0" + t),
            t
        },
        padLeft: function(n, t) {
            if (n.length > t)
                return n;
            var i = Array(t - n.length + 1);
            return i.join("0") + n
        },
        bytesToHex: function(n) {
            var t = this
              , i = n.map(function(n) {
                return t.padLeft(t.toHexString(n), 2)
            });
            return i.join("")
        },
        hexToBytes: function(n) {
            if (n.length % 2 == 1)
                throw new Error("hexToBytes can't have a string with an odd number of characters.");
            return n.indexOf("0x") === 0 && (n = n.slice(2)),
            n.match(/../g).map(function(n) {
                return parseInt(n, 16)
            })
        },
        stringToBytes: function(n) {
            for (var i = [], t = 0; t < n.length; ++t)
                i.push(n.charCodeAt(t));
            return i
        },
        bytesToString: function(n) {
            for (var i = "", t = 0; t < n.length; t++)
                i += String.fromCharCode(n[t]);
            return i
        },
        k: function() {
            var n = [this.toHexString(this.N), this.toHexString(this.g)];
            return this.paddedHash(n)
        },
        calculateX: function(t) {
            var u;
            if (!t)
                throw "Missing parameter.";
            if (!this.username || !this.password)
                throw "Username and password cannot be empty.";
            var f = this.stringToBytes(this.username)
              , e = this.hexToBytes(this.password)
              , o = f.concat([58]).concat(e)
              , s = n.calcSHA1(this.bytesToString(o))
              , h = this.hexToBytes(s)
              , c = this.hexToBytes(t)
              , l = c.concat(h)
              , a = n.calcSHA1(this.bytesToString(l))
              , i = new r(a,16);
            return i.compareTo(this.N) < 0 ? i : (u = new r(1,16),
            i.mod(this.N.subtract(u)))
        },
        calculateV: function(n) {
            if (!n)
                throw "Missing parameter.";
            var t = this.calculateX(n);
            return this.g.modPow(t, this.N)
        },
        calculateU: function(n, t) {
            if (!n || !t)
                throw "Missing parameter(s).";
            if (n.mod(this.N).toString() == "0" || t.mod(this.N).toString() == "0")
                throw "ABORT: illegal_parameter";
            var i = [this.toHexString(n), this.toHexString(t)];
            return this.paddedHash(i)
        },
        canCalculateA: function(n) {
            if (!n)
                throw "Missing parameter.";
            return Math.ceil(n.bitLength() / 8) >= 32
        },
        calculateA: function(n) {
            if (!n)
                throw "Missing parameter.";
            if (!this.canCalculateA(n))
                throw "Client key length is less than 256 bits.";
            var t = this.g.modPow(n, this.N);
            if (t.mod(this.N).toString() == "0")
                throw "ABORT: illegal_parameter";
            return t
        },
        calculateM1: function(n, t, i, u) {
            var f, e;
            if (!n || !t || !i || !u)
                throw "Missing parameter(s).";
            if (n.mod(this.N).toString() == "0" || t.mod(this.N).toString() == "0")
                throw "ABORT: illegal_parameter";
            var l = this.hexHash(this.toHexString(this.N))
              , a = this.hexHash(this.toHexString(this.g))
              , v = this.hash(this.username)
              , o = []
              , s = this.hexToBytes(l)
              , y = this.hexToBytes(a);
            for (f = 0; f < s.length; f++)
                o[f] = s[f] ^ y[f];
            var p = this.bytesToHex(o)
              , w = this.toHexString(n)
              , b = this.toHexString(t)
              , h = [p, v, u, w, b, i]
              , c = "";
            for (e = 0; e < h.length; e++)
                c += h[e];
            return new r(this.hexHash(c),16)
        },
        calculateM2: function(n, t, i) {
            var u;
            if (!n || !t || !i)
                throw "Missing parameter(s).";
            if (n.mod(this.N).toString() == "0" || t.mod(this.N).toString() == "0")
                throw "ABORT: illegal_parameter";
            var o = this.toHexString(n)
              , s = this.toHexString(t)
              , f = [o, s, i]
              , e = "";
            for (u = 0; u < f.length; u++)
                e += f[u];
            return new r(this.hexHash(e),16)
        },
        calculateS: function(n, t, i, r) {
            if (!n || !t || !i || !r)
                throw "Missing parameters.";
            if (n.mod(this.N).toString() == "0")
                throw "ABORT: illegal_parameter";
            var u = this.calculateX(t)
              , f = this.g.modPow(u, this.N)
              , e = n.add(this.N.multiply(this.k)).subtract(f.multiply(this.k)).mod(this.N);
            return e.modPow(u.multiply(i).add(r), this.N)
        },
        calculateK: function(n) {
            return this.hexHash(this.toHexString(n))
        },
        srpRandom: function() {
            var u = t.random.randomWords(8, 0), i = t.codec.hex.fromBits(u), n;
            if (i.length != 64)
                throw "Invalid random number size.";
            return n = new r(i,16),
            n.compareTo(this.N) >= 0 && (n = a.mod(this.N.subtract(this.one))),
            n.compareTo(this.two) < 0 && (n = two),
            n
        },
        randomHexSalt: function() {
            var n = t.random.randomWords(8, 0);
            return t.codec.hex.fromBits(n)
        },
        paddedHash: function(n) {
            for (var u, f = 2 * (this.toHexString(this.N).length * 4 + 7 >> 3), i = "", t = 0; t < n.length; t++)
                i += this.nZeros(f - n[t].length) + n[t];
            return u = new r(this.hexHash(i),16),
            u.mod(this.N)
        },
        hash: function(i) {
            switch (this.hashFn.toLowerCase()) {
            case "sha-256":
                var r = t.codec.hex.fromBits(t.hash.sha256.hash(i));
                return this.nZeros(64 - r.length) + r;
            case "sha-1":
            default:
                return n.calcSHA1(i)
            }
        },
        hexHash: function(n) {
            switch (this.hashFn.toLowerCase()) {
            case "sha-256":
                var i = t.codec.hex.fromBits(t.hash.sha256.hash(t.codec.hex.toBits(n)));
                return this.nZeros(64 - i.length) + i;
            case "sha-1":
            default:
                return this.hash(this.pack(n))
            }
        },
        pack: function(n) {
            var i, ascii;
            for (n.length % 2 != 0 && (n = "0" + n),
            i = 0,
            ascii = ""; i < n.length / 2; )
                ascii = ascii + String.fromCharCode(parseInt(n.substr(i * 2, 2), 16)),
                i++;
            return ascii
        },
        nZeros: function(n) {
            if (n < 1)
                return "";
            var t = this.nZeros(n >> 1);
            return (n & 1) == 0 ? t + t : t + t + "0"
        },
        initVals: {
            1024: {
                N: "EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE48E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B297BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9AFD5138FE8376435B9FC61D2FC0EB06E3",
                g: "2"
            }
        },
        calculateB: function(n, t) {
            if (!n || !t)
                throw "Missing parameters.";
            var i = this.g.modPow(n, this.N);
            return i.add(t.multiply(this.k)).mod(this.N)
        },
        calculateServerS: function(n, t, i, r) {
            if (!n || !t || !i || !r)
                throw "Missing parameters.";
            if (n.mod(this.N).toString() == "0" || r.mod(this.N).toString() == "0")
                throw "ABORT: illegal_parameter";
            return t.modPow(i, this.N).multiply(n).mod(this.N).modPow(r, this.N)
        }
    },
    u
})(sha1, sjcl, BigInteger);

module.exports = { SRPClient, sha1, sjcl, BigInteger };