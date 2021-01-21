var bignum=require("bignumber.js"),FHEMath=require("../math/FHEMath"),src=require("../src/src"),CRT=require("../math/CRT");const Format=function(r,e,n){var[o,u]=CRT.rootOfUnityForwardTable(e,n),s=CRT.ModMulPrecon(r,o,n,u);return CRT.NTTForward(s,o,u,n)},InverseFormat=function(r,e,n){for(var[o,u]=CRT.rootOfUnityInverseTable(e,n),s=CRT.NTTForward(r,o,u,n),t=0;t<src.cycleorder/2;t++)s[t]=s[t].times(FHEMath.ModInverse(bignum((src.cycleorder/2).toString()),n)).mod(n);return s=CRT.ModMulPrecon(s,o,n,u)},CRTDecompose=function(r){const e=[bignum("1152921503533163521"),bignum("1152921503533206529"),bignum("1152921503533275137")],n=[bignum("3419825375260351"),bignum("1195715620957928"),bignum("3519766358935735")],o=[bignum("928327762595163639"),bignum("702989894231962405"),bignum("418395004842946957")];for(var u=new Array(r.length*r.length),s=new Array(r.length),t=0;t<r.length;t++)s[t]=InverseFormat(r[t],o[t],e[t]);for(t=0;t<r.length;t++){for(var l=new Array(r.length),m=0;m<r.length;m++){var c=s[t];if(t!=m){var i=SwitchModulus(c,e[t],e[m]);l[m]=Format(i,n[m],e[m])}else l[m]=Format(c,n[m],e[m])}for(var g=0;g<r.length;g++)u[3*t+g]=l[g]}return u},SwitchModulus=function(r,e,n){for(var o=e.gt(n)?e.minus(n):n.minus(e),u=e.dividedToIntegerBy(bignum("2")),s=new Array(src.cycleorder/2),t=0;t<r.length;t++)e.lt(n)?r[t].gt(u)?s[t]=r[t].plus(o):s[t]=r[t]:r[t].gt(u)?s[t]=r[t].minus(o):s[t]=r[t];return s};exports.EvalAtIndex=function(r,e,n){const o=[bignum("1152921503533163521"),bignum("1152921503533206529"),bignum("1152921503533275137")];for(var u=new Array(src.modulus.length),s=new Array(src.modulus.length),t=new Array(src.modulus.length),l=new Array(src.modulus.length),m=new Array(src.modulus.length),c=new Array(src.modulus.length),i=0;i<src.modulus.length;i++)l[i]=n[i],m[i]=n[i+3],c[i]=n[i+6],u[i]=n[i+9],s[i]=n[i+12],t[i]=n[i+15];var g=new Array(2),a=new Array(2);for(i=0;i<src.modulus.length-1;i++)g[i]=r.slice(0+3*i,3+3*i);var d=CRT.FindRotationIndex(e,src.cycleorder);for(i=0;i<src.modulus.length-1;i++){for(var h=new Array(src.modulus),f=0;f<src.modulus.length;f++){for(var y=new Array(512).fill(0),v=1;v<1024;v+=2){var b=v*d-(v*d>>10<<10);y[v>>1]=g[i][f][b>>1]}h[f]=y}a[i]=h}var w=a[0],T=a[1],A=(a[2],CRTDecompose(T));for(i=0;i<src.modulus.length;i++)for(f=0;f<src.cycleorder/2;f++)T[i][f]=A[i][f].times(u[i][f]).mod(o[i]),w[i][f]=w[i][f].plus(A[i][f].times(l[i][f]).mod(o[i])),w[i][f].gt(o[i])&&(w[i][f]=w[i][f].minus(o[i]));for(i=0;i<src.modulus.length;i++)for(f=0;f<src.cycleorder/2;f++)T[i][f]=T[i][f].plus(A[i+3][f].times(s[i][f]).mod(o[i])),T[i][f].gt(o[i])&&(T[i][f]=T[i][f].minus(o[i])),w[i][f]=w[i][f].plus(A[i+3][f].times(m[i][f]).mod(o[i])),w[i][f].gt(o[i])&&(w[i][f]=w[i][f].minus(o[i]));for(i=0;i<src.modulus.length;i++)for(f=0;f<src.cycleorder/2;f++)T[i][f]=T[i][f].plus(A[i+6][f].times(t[i][f]).mod(o[i])),T[i][f].gt(o[i])&&(T[i][f]=T[i][f].minus(o[i])),w[i][f]=w[i][f].plus(A[i+6][f].times(c[i][f]).mod(o[i])),w[i][f].gt(o[i])&&(w[i][f]=w[i][f].minus(o[i]));return w.push(...T),w};