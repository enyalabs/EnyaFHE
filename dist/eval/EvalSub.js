var bignum=require("bignumber.js"),nextFrame=require("next-frame"),FHEMath=require("../math/FHEMath"),src=require("../src/src"),CRT=require("../math/CRT");exports.EvalSub=function(r,e){r=FHEMath.vectortoBigNumber(r),e=FHEMath.vectortoBigNumber(e);for(var u=new Array(r.length),a=0;a<r.length;a++){for(var n=new Array(r[0].length),i=0;i<r[0].length;i++){var h=r[a][i].minus(e[a][i]);h.lt(bignum("0"))?(t=a,t>2&&(t-=3),n[i]=h.plus(src.modulus[t])):n[i]=h}u[a]=n}return FHEMath.vectortoString(u)};