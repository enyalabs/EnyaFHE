var random=require("random"),seedrandom=require("seedrandom"),bignum=require("bignumber.js");bignum.config({ROUNDING_MODE:1});var src=require("../src/src");class FHEMath{constructor(){for(var r=Math.ceil(3.2*Math.sqrt(-2*Math.log(1e-15))),e=1,n=1;n<=r;n++)e+=2*Math.exp(-n*n/(3.2*3.2*2));var t=1/e;this.m_a=t;var a=[];for(n=1;n<=r;n++)a.push(t*Math.exp(-n*n/(3.2*3.2*2)));for(n=1;n<a.length;n++)a[n]+=a[n-1];this.val_table=a}PRNG(){return Date.now()/Math.floor(100*Math.random()+1)}PreDiscreteBinary(r,e){var n=new Array(r);random.use(seedrandom(e));for(var t=random.uniformInt(0,2),a=0;a<r;a++)n[a]=t()-1;return n}PreDiscreteGaussian(r){var e=new Array(r);random.use(seedrandom(this.PRNG()));for(var n=random.uniform(0,1),t=0;t<r;t++){var a=n()-.5;if(Math.abs(a)<=this.m_a/2)var s=0;else s=a>0?this.lower_bound(this.val_table,a-this.m_a/2):-1*this.lower_bound(this.val_table,Math.abs(a)-this.m_a/2);e[t]=bignum(s.toString())}return e}DiscreteUniform(r){for(var e=new Array(src.cycleorder/2),n=0;n<src.cycleorder/2;n++){random.use(seedrandom(this.PRNG()));var t=random.uniform(0,1);e[n]=bignum(t()).times(r).integerValue()}return e}lower_bound(r,e){if(e<r[0])return 1;for(var n=1;n<r.length;n++)if(r[n]>=e)return n+1}DiscreteGaussian(r){for(var e=new Array(r.length),n=this.PreDiscreteGaussian(src.cycleorder/2),t=0;t<r.length;t++){for(var a=new Array(n.length),s=0;s<n.length;s++)n[s].lt(0)?a[s]=r[t].plus(n[s]):a[s]=n[s];e[t]=a}return e}DiscreteBinary(r,e){for(var n=new Array(r.length),t=this.PreDiscreteBinary(src.cycleorder/2,e),a=0;a<r.length;a++){for(var s=new Array(t.length),o=0;o<t.length;o++)t[o]<0?s[o]=r[a].plus(t[o]):s[o]=bignum(t[o]);n[a]=s}return n}ModInverse(r,e){var n=[];if(n.push(e),r.gt(e)?n.push(r.mod(e)):n.push(r),n[1].eq(bignum("1")))return bignum("1");var t=n[0],a=n[1],s=[];for(n.push(t.mod(a)),s.push(t.idiv(a));!n[n.length-1].eq(bignum("1"));)t=a,a=n[n.length-1],n.push(t.mod(a)),s.push(t.idiv(a));(n=[]).push(bignum("0")),n.push(bignum("1")),t=n[0],a=n[1];for(var o=s.length-1;o>=0;o--)n.push(s[o].times(a).plus(t)),t=a,a=n[n.length-1];if(s.length%2==1)var i=e.minus(n[n.length-1]);else i=n[n.length-1];return i}primeFactors(r){for(var e=[],n=2;r>2;)r%n==0?(e.push(n),r/=n):n++;return e}vectortoString(r){var e=new Array(r.length);if(r.length==src.cycleorder/2){for(var n=0;n<src.cycleorder/2;n++)e[n]=r[n].toString();return e}for(n=0;n<r.length;n++){for(var t=new Array(r[0].length),a=0;a<r[0].length;a++)t[a]=r[n][a].toString();e[n]=t}return e}vectortoBigNumber(r){var e=new Array(r.length);if(r.length==src.cycleorder/2){for(var n=0;n<src.cycleorder/2;n++)e[n]=bignum(r[n]);return e}for(n=0;n<r.length;n++){for(var t=new Array(r[0].length),a=0;a<r[0].length;a++)t[a]=bignum(r[n][a]);e[n]=t}return e}}module.exports=new FHEMath;