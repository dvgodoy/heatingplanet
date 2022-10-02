function linspace(start, stop, num, endpoint = true) {
    const div = endpoint ? (num - 1) : num;
    const step = (stop - start) / div;
    return Array.from({length: num}, (_, i) => start + step * i);
}

function zip(a, b) {
    return a.map(function(e, i) {
      return [e, b[i]];
    });
}

var wait_loaded = function(key, callback) {
  if (window[key]) {
    callback();
  } else {
    setTimeout(function() {
      wait_loaded(key, callback);
    }, 100);
  }
};

function flatten(arr, shape) {
    first_dim = shape[0];
    extra_dims = Array.from(shape.slice(1));
    var flatted_dims = 1;
    extra_dims.forEach(function(d){flatted_dims *= d});
    flattened = math.reshape(arr, [first_dim, flatted_dims]);
    return flattened;
}

function retrieve_vals(gy, gx, arrays, regular=true, max_size=141) {
    var idx = gy*72+gx;
    if (regular) {
        var val1 = zip(arrays[0], arrays[1]).filter(_ => _[0]==idx).map(_ => _[1]);
        var val2 = zip(arrays[0], arrays[2]).filter(_ => _[0]==idx).map(_ => _[1]);
        var vals = Array.from({length: max_size})
        for (i=0; i<val1.length; i++) {
            vals[val1[i]] = val2[i];
        }
        return vals;
    } else {
        var start = arrays[0][idx-1];
        var end = arrays[0][idx];
        var chunks = zip(arrays[1].slice(start, end), arrays[2].slice(start, end));
        var vals = [];
        var first = 0;
        for (i = 0; i < chunks.length; i++) {
            var last = chunks[i][0];
            var fill = chunks[i][1];
            vals = vals.concat(Array.from({length: last-first}).fill(fill));
            first = last;
        }
        return vals;
    }
}

function dat2array(dat) {
    var nan_value = dat[0];
    var nseries = dat[1];
    var offset = 1;
    var shapes = [];
    var series = Array.from({length: nseries}, (_, i) => {
        ndims = dat[offset+1];
        new_shape = Array.from(dat.slice(offset+2, ndims+offset+2));
        shapes.push(new_shape);
        start = dat.slice(ndims+offset+2, ndims+offset+3)[0];
        length = dat.slice(ndims+offset+3, ndims+offset+4)[0];
        values = Array.from(dat.slice(start, start+length));
        offset = start+length-1;
        return values;
    });
    return [nan_value, series, shapes];
}

function num_to_nan(arr, nan_value) {
    return arr.map(function(z){return (z==nan_value)?null:z})                
}

function surface_avg(z, surface_perc, nan_value){
    var valid = zip(z, surface_perc).filter(_ => _[0]!=nan_value);
    var area = math.sum(valid.map(_ => _[1]));
    var tot = math.sum(valid.map(_ => _[0]*_[1]));
    return tot/area;
}

const array_chunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));
