var bignum=require("bignumber.js"),FHEMath=require("../math/FHEMath"),src=require("../src/src"),CRT=require("../math/CRT");const Format=function(n,r,u){var[m,i]=CRT.rootOfUnityForwardTable(r,u),g=CRT.ModMulPrecon(n,m,u,i);return CRT.NTTForward(g,m,i,u)},InverseFormat=function(n,r,u){for(var[m,i]=CRT.rootOfUnityInverseTable(r,u),g=CRT.NTTForward(n,m,i,u),e=0;e<src.cycleorder/2;e++)g[e]=g[e].times(FHEMath.ModInverse(bignum((src.cycleorder/2).toString()),u)).mod(u);return g=CRT.ModMulPrecon(g,m,u,i)},ModMulFast=function(n,r,u){return n=n.gte(r)?n.minus(r):n.plus(u).minus(r)},ModAddFast=function(n,r,u){var m=n.plus(r);return m.gte(u)?m.minus(u):m},ScaleRound=function(n){const r=[bignum("1152921503533286401"),bignum("1152921503533298689"),bignum("1152921503533304833"),bignum("1152921503533350913")],u=[[bignum("46198871993450474"),bignum("251621066091009731"),bignum("491316129202989902"),bignum("389401040112652290")],[bignum("224491953482968212"),bignum("194559693018574524"),bignum("1047090839854893213"),bignum("26066059072853116")],[bignum("838767198921877040"),bignum("100387398562650158"),bignum("105764133598492"),bignum("373961935738848355")],[bignum("43463479134990673"),bignum("606353345861064274"),bignum("767330273875128057"),bignum("363492468608997150")]];for(var m=new Array(4),i=0;i<4;i++)m[i]=new Array(src.cycleorder/2);bignum.config({DECIMAL_PLACES:40});for(var g=0;g<src.cycleorder/2;g++){for(var e=bignum("0"),o=0;o<src.modulus.length;o++){var t=n[o][g];e=e.plus(src.numerator[o].dividedBy(src.denominator[o]).times(t))}bignum.set({ROUNDING_MODE:4});for(var s=e.decimalPlaces(0),b=0;b<n.length-src.modulus.length;b++){var l=bignum("0");for(o=0;o<src.modulus.length;o++)t=n[o][g],l=l.plus(t.times(u[o][b]));t=n[src.modulus.length+b][g];var c=(l=l.plus(t.times(u[src.modulus.length][b]))).mod(r[b]);m[b][g]=ModAddFast(c,s,r[b])}}return m},CRTDecompose=function(n){const r=[bignum("1152921503533163521"),bignum("1152921503533206529"),bignum("1152921503533275137")],u=[bignum("3419825375260351"),bignum("1195715620957928"),bignum("3519766358935735")];for(var m=new Array(n.length*n.length),i=0;i<n.length;i++){for(var g=new Array(n.length),e=0;e<n.length;e++){var o=n[i];if(i!=e){var t=SwitchModulus(o,r[i],r[e]);g[e]=Format(t,u[e],r[e])}else g[e]=Format(o,u[e],r[e])}for(var s=0;s<n.length;s++)m[3*i+s]=g[s]}return m},SwitchModulus=function(n,r,u){for(var m=r.gt(u)?r.minus(u):u.minus(r),i=r.dividedToIntegerBy(bignum("2")),g=new Array(src.cycleorder/2),e=0;e<n.length;e++)r.lt(u)?n[e].gt(i)?g[e]=n[e].plus(m):g[e]=n[e]:n[e].gt(i)?g[e]=n[e].minus(m):g[e]=n[e];return g},SwitchCRT=function(n){const r=[bignum("9223372045443260415"),bignum("9223372045443162111"),bignum("9223372045443112959"),bignum("9223372045442744319")],u=[bignum("721534356229277441"),bignum("873869973008232954"),bignum("710438677828918024")],m=[bignum("11544549710419554348"),bignum("13981919581152175168"),bignum("11367018855847373714")],i=[bignum("1152921503533286401"),bignum("1152921503533298689"),bignum("1152921503533304833"),bignum("1152921503533350913")],g=[[bignum("899678208"),bignum("1384120320"),bignum("9814671360")],[bignum("2170552320"),bignum("3183476736"),bignum("12457082880")],[bignum("2919235584"),bignum("4196401152"),bignum("13891534848")],[bignum("10940841984"),bignum("14199816192"),bignum("27056406528")]],e=[bignum("1152810951075087361"),bignum("1152628114317308929"),bignum("1152508980514458625"),bignum("1150871277272285185")];for(var o=new Array(e.length),t=0;t<o.length;t++)o[t]=new Array(src.cycleorder/2);for(var s=0;s<src.cycleorder/2;s++){for(var b=new Array(r.length-1),l=bignum("0"),c=0;c<r.length-1;c++){var a=n[c][s],d=src.modulus[c];b[c]=CRT.ModMulPrecon([a],[u[c]],d,[m[c]])[0],l=l.plus(b[c].dividedBy(d))}bignum.set({ROUNDING_MODE:4});for(var h=l.decimalPlaces(0),f=0;f<r.length;f++){var v=bignum("0");for(c=0;c<r.length-1;c++)v=v.plus(b[c].times(g[f][c]));var y=v.mod(i[f]),w=h.times(e[f]).mod(i[f]);o[f][s]=ModMulFast(y,w,i[f])}}return o},SwitchCRTBack=function(n){const r=[bignum("1152921503533286401"),bignum("1152921503533298689"),bignum("1152921503533304833"),bignum("1152921503533350913")],u=[bignum("9223372045444243455"),bignum("9223372045443899391"),bignum("9223372045443350527")],m=[bignum("113310074463359253"),bignum("293531431347554751"),bignum("277286255915027369"),bignum("468793741807378821")],i=[bignum("1812961193101914721"),bignum("4696502905934046808"),bignum("4436580098771556707"),bignum("7500699875902033378")],g=[bignum("1152921503533163521"),bignum("1152921503533206529"),bignum("1152921503533275137")],e=[[bignum("3579348435075072"),bignum("3253953122795520"),bignum("3112476900065280"),bignum("2347113727918080")],[bignum("1308075239669760"),bignum("1133665207713792"),bignum("1062811132231680"),bignum("723616090030080")],[bignum("52997748948992"),bignum("25346749497344"),bignum("20102594428928"),bignum("7878043762688")]],o=[bignum("567242855889545859"),bignum("715650224914483110"),bignum("596966644161445888")];for(var t=new Array(o.length),s=0;s<t.length;s++)t[s]=new Array(src.cycleorder/2);for(var b=0;b<src.cycleorder/2;b++){for(var l=new Array(u.length+1),c=bignum("0"),a=0;a<u.length+1;a++){var d=n[a][b],h=r[a];l[a]=CRT.ModMulPrecon([d],[m[a]],h,[i[a]])[0],c=c.plus(l[a].dividedBy(h))}bignum.set({ROUNDING_MODE:4});for(var f=c.decimalPlaces(0),v=0;v<u.length;v++){var y=bignum("0");for(a=0;a<u.length+1;a++)y=y.plus(l[a].times(e[v][a]));var w=y.mod(g[v]),A=f.times(o[v]).mod(g[v]);t[v][b]=ModMulFast(w,A,g[v])}}return t},ExpandCRT=function(n){const r=[bignum("1152921503533286401"),bignum("1152921503533298689"),bignum("1152921503533304833"),bignum("1152921503533350913")],u=[bignum("2017870734301874"),bignum("3011438569692224"),bignum("5197663069168670"),bignum("2216193184298517")];for(var m=new Array(n.length),i=n,g=0;g<n.length;g++)m[g]=InverseFormat(n[g],src.rootOfUnityInverse[g],src.modulus[g]);var e=SwitchCRT(m);for(g=0;g<4;g++)m.push(e[g]),m[3+g]=Format(m[3+g],u[g],r[g]);for(g=0;g<3;g++)m[g]=i[g];return m};exports.EvalMulti=function(n,r,u){for(var m=new Array(2),i=new Array(2),g=0;g<m.length;g++)m[g]=n.slice(0+3*g,3+3*g),i[g]=r.slice(0+3*g,3+3*g);n=m,r=i;var e=new Array(src.modulus.length),o=new Array(src.modulus.length),t=new Array(src.modulus.length),s=new Array(src.modulus.length),b=new Array(src.modulus.length),l=new Array(src.modulus.length);for(g=0;g<src.modulus.length;g++)s[g]=u[g],b[g]=u[g+3],l[g]=u[g+6],e[g]=u[g+9],o[g]=u[g+12],t[g]=u[g+15];const c=[bignum("1152921503533163521"),bignum("1152921503533206529"),bignum("1152921503533275137"),bignum("1152921503533286401"),bignum("1152921503533298689"),bignum("1152921503533304833"),bignum("1152921503533350913")],a=[bignum("928327762595163639"),bignum("702989894231962405"),bignum("418395004842946957"),bignum("344649865316757428"),bignum("599096090807234556"),bignum("220941583607385831"),bignum("408260387856071892")],d=[bignum("3419825375260351"),bignum("1195715620957928"),bignum("3519766358935735")];for(g=0;g<n.length;g++)n[g]=ExpandCRT(n[g]),r[g]=ExpandCRT(r[g]);for(var h=new Array(n.length*r.length-1),f=new Array(n.length*r.length-1),v=0;v<n.length;v++)for(var y=0;y<r.length;y++)if(void 0===h[v+y]){for(var w=new Array(r[v].length),A=0;A<n[v].length;A++){for(var M=new Array(src.cycleorder/2),T=0;T<M.length;T++)M[T]=n[v][A][T].times(r[y][A][T]).mod(c[A]);w[A]=M}f[v+y]=w,h[v+y]=!0}else{for(w=new Array(r[v].length),A=0;A<n[v].length;A++){for(M=new Array(src.cycleorder/2),T=0;T<M.length;T++)M[T]=f[v+y][A][T].plus(n[v][A][T].times(r[y][A][T]).mod(c[A])),M[T].gte(c[A])&&(M[T]=M[T].minus(c[A]));w[A]=M}f[v+y]=w,h[v+y]=!0}for(T=0;T<f.length;T++)for(A=0;A<f[T].length;A++)f[T][A]=InverseFormat(f[T][A],a[A],c[A]);for(T=0;T<f.length;T++)f[T]=ScaleRound(f[T]);for(T=0;T<f.length;T++)f[T]=SwitchCRTBack(f[T]);var p=f[0],R=f[1],C=f[2],F=CRTDecompose(C);for(g=0;g<src.modulus.length;g++)p[g]=Format(p[g],d[g],c[g]),R[g]=Format(R[g],d[g],c[g]);for(g=0;g<src.modulus.length;g++)for(A=0;A<src.cycleorder/2;A++)R[g][A]=R[g][A].plus(F[g][A].times(e[g][A]).mod(c[g])),R[g][A].gt(c[g])&&(R[g][A]=R[g][A].minus(c[g])),p[g][A]=p[g][A].plus(F[g][A].times(s[g][A]).mod(c[g])),p[g][A].gt(c[g])&&(p[g][A]=p[g][A].minus(c[g]));for(g=0;g<src.modulus.length;g++)for(A=0;A<src.cycleorder/2;A++)R[g][A]=R[g][A].plus(F[g+3][A].times(o[g][A]).mod(c[g])),R[g][A].gt(c[g])&&(R[g][A]=R[g][A].minus(c[g])),p[g][A]=p[g][A].plus(F[g+3][A].times(b[g][A]).mod(c[g])),p[g][A].gt(c[g])&&(p[g][A]=p[g][A].minus(c[g]));for(g=0;g<src.modulus.length;g++)for(A=0;A<src.cycleorder/2;A++)R[g][A]=R[g][A].plus(F[g+6][A].times(t[g][A]).mod(c[g])),R[g][A].gt(c[g])&&(R[g][A]=R[g][A].minus(c[g])),p[g][A]=p[g][A].plus(F[g+6][A].times(l[g][A]).mod(c[g])),p[g][A].gt(c[g])&&(p[g][A]=p[g][A].minus(c[g]));return p.push(...R),p};