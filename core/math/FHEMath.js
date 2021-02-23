// Required packages
var random = require("random");
var seedrandom = require("seedrandom");
var bignum = require("bignumber.js");
bignum.config({ ROUNDING_MODE: 1 }); 

var src = require("../src/src");

 class FHEMath{
    constructor() {
        /* Discrete Gaussian Table */
        var std = 3.2; // hardcode
        var accuracy = 1e-15;
        var variance = std * std;
        var fin = Math.ceil(std * Math.sqrt(-2 * Math.log(accuracy)));

        var cumulate = 1.0;
        for (var i = 1; i <= fin; i++) {
            cumulate = cumulate + 2 * Math.exp((-i * i) / (variance * 2));
        }

        var m_a = 1 / cumulate;
        this.m_a = m_a;

        var val_table = [];

        for (i = 1; i <= fin; i++) {
            val_table.push(m_a * Math.exp(-((i * i) / (2 * variance))));
        }

        for (i = 1; i < val_table.length; i++) {
            val_table[i] += val_table[i - 1];
        }
        this.val_table = val_table;
    }
    /**
     * Generate a random seed
     */
    PRNG() {
        var curTime = Date.now();
        var rand = Math.floor(Math.random() * 100 + 1);
        return curTime / rand;
    }
    /**
     * 
     * Generate the random binary distribution
     * {-1, 0, 1}
     * 
     * @param {num} size 
     * @returns {[bignum(),...]}
     */
    PreDiscreteBinary(size, seed) {
        var res = new Array(size);
        random.use(seedrandom(seed));
        var binary = random.uniformInt(0, 2);
        for (var j = 0; j < size; j++) {
            res[j] = binary() - 1;
        }
        return res;
    }
    /**
     * 
     * Generate the random discrete gaussian
     * distribution
     * 
     * @param {size} size 
     * @returns {[bignum(),...]}
     */
    PreDiscreteGaussian(size) {
        var res = new Array(size);
        random.use(seedrandom(this.PRNG()));
        var uniform = random.uniform(0, 1);
        for (var i = 0; i < size; i++) {
            var seed = uniform() - 0.5;
            if (Math.abs(seed) <= this.m_a / 2) {
                var value = 0;
            } else {
                if (seed > 0) {
                    value = this.lower_bound(
                        this.val_table,
                        seed - this.m_a / 2
                    );
                } else {
                    value =
                        -1 *
                        this.lower_bound(
                            this.val_table,
                            Math.abs(seed) - this.m_a / 2
                        );
                }
            }
            res[i] = bignum(value.toString());
        }
        return res;
    }
    /**
     * 
     * Generate the random discrete uniform
     * distribution
     * 
     * @param {size} size 
     * @returns {[bignum(),...]}
     */
    DiscreteUniform(modulus) {
        var res = new Array(src.cycleorder / 2);
        for (var i = 0; i < src.cycleorder / 2; i++) {
            random.use(seedrandom(this.PRNG()));
            var uniform = random.uniform(0, 1);
            /* 
            Discrete uniform (0, modulus - 2^32) + 
            Discrete uniform (0, 2^32)
            */
            res[i] = bignum(uniform()).times(modulus).integerValue();
        }
        return res;
    }
    /**
     * 
     * Search the lower bound 
     * 
     * @param {Array} Array 
     * @param {num} search
     * @returns {num}
     */
    lower_bound(array, search) {
        if (search < array[0]) {
            return 1;
        }
        for (var i = 1; i < array.length; i++) {
            if (array[i] >= search) {
                return i + 1;
            }
        }
    }
    /**
     * 
     * Deal with negative values 
     * 
     * @param {[bignum(),bignum(),bignum()]} modulus 
     * @returns {[bignum(),...]}
     */
    DiscreteGaussian(modulus) {
        var res = new Array(modulus.length);
        var pre = this.PreDiscreteGaussian(src.cycleorder / 2);
        for (var i = 0; i < modulus.length; i++) {
            var temp = new Array(pre.length);
            for (var j = 0; j < pre.length; j++) {
                if (pre[j].lt(0)) {
                    temp[j] = modulus[i].plus(pre[j]);
                } else {
                    temp[j] = pre[j];
                }
            }
            res[i] = temp;
        }
        return res;
    }
    /**
     * 
     * Deal with negative values 
     * 
     * @param {[bignum(),bignum(),bignum()]} modulus 
     * @returns {[bignum(),...]}
     */
    DiscreteBinary(modulus, seed) {
        var res = new Array(modulus.length);
        var pre = this.PreDiscreteBinary(src.cycleorder / 2, seed);
        for (var i = 0; i < modulus.length; i++) {
            var temp = new Array(pre.length);
            for (var j = 0; j < pre.length; j++) {
                if (pre[j] < 0) {
                    temp[j] = modulus[i].plus(pre[j]);
                } else {
                    temp[j] = bignum(pre[j]);
                }
            }
            res[i] = temp;
        }
        return res;
    }
    /**
     * 
     * @param {bignum()} num 
     * @param {bignum()} mod
     * @returns {bignum()} 
     */
    ModInverse(num, mod) {
        var mods = [];
        mods.push(mod);
        if (num.gt(mod)) {
            mods.push(num.mod(mod));
        } else {
            mods.push(num);
        }

        if (mods[1].eq(bignum("1"))) {
            return bignum("1");
        }
        var first = mods[0];
        var second = mods[1]; 
        var quot = [];

        mods.push(first.mod(second));
        quot.push(first.idiv(second));
        while (!(mods[mods.length - 1].eq(bignum("1")))) {
            first = second;
            second = mods[mods.length - 1];
            mods.push(first.mod(second));
            quot.push(first.idiv(second));
        }
        
        mods = [];
        mods.push(bignum("0"));
        mods.push(bignum("1"));

        first = mods[0];
        second = mods[1];

        for (var i = quot.length - 1; i >= 0; i--) {
            mods.push(quot[i].times(second).plus(first));
            first = second;
            second = mods[mods.length - 1];
        }

        if (quot.length % 2 == 1){
            var res = (mod.minus(mods[mods.length - 1]));
        } else {
            res = mods[mods.length - 1];
        }
        return res;
    }
    /**
     * 
     * @param {Number} n 
     */
    primeFactors(n){
        var factors = [], 
            divisor = 2;
      
        while(n>2){
          if(n % divisor == 0){
             factors.push(divisor); 
             n= n/ divisor;
          }
          else{
            divisor++;
          }     
        }
        return factors;
      }
    /**
     * 
     * @param {Array} vector 
     */
    vectortoString(vector){
        var res = new Array(vector.length);
        if (vector.length == src.cycleorder / 2) {
            for (var i = 0; i < src.cycleorder / 2; i++) {
                res[i] = vector[i].toString();
            }
            return res;
        }
        for (i = 0; i < vector.length; i++) {
            var temp = new Array(vector[0].length);
            for (var j = 0; j < vector[0].length; j++) {
                temp[j] = vector[i][j].toString();
            }
            res[i] = temp;
        }
        return res;
    }
        /**
     * 
     * @param {Array} vector 
     */
    vectortoBigNumber(vector){
        var res = new Array(vector.length);
        if (vector.length == src.cycleorder / 2) {
            for (var i = 0; i < src.cycleorder / 2; i++) {
                res[i] = bignum(vector[i]);
            }
            return res;
        }
        for (i = 0; i < vector.length; i++) {
            var temp = new Array(vector[0].length);
            for (var j = 0; j < vector[0].length; j++) {
                temp[j] = bignum(vector[i][j]);
            }
            res[i] = temp;
        }
        return res;
    }
}

module.exports = new FHEMath();
