// These are the min and max values the gauge will accept
var fuel_range = {
    min: 1700,
    max: 17000
}

// Jon, these rotation values are to rotate the needle correctly on the gauge
// I have hand tested these values, probably you shouldn't change them.
var needle_range = {
    min: -71,
    max: 71,
    skew: 8.9,
}

$(document).ready(function(){
    function calculateSkew(range,degrees)
    {
        var percent = 1 - toPercent({min:0,max:range.max},Math.abs(degrees));
        var skew = percent * range.skew;
        
        console.log({percent,degrees,skew});

        return degrees + skew;
    }

    function toPercent(range,value)
    {
        return convertRange(range,{min:0,max:1}, value);
    }
    
    function getNeedleRange(needle_range,grams)
    {
        var range = needle_range;
        
        /*if(grams <= 4250){
            range.max = range.max_cutoff;
            range.skew = range.skew_cutoff;
        }else{
            range.max = range.max_original;
            range.skew = range.skew_original;
        }*/
        
        return range;
    }

    // We need to convert the amount of fuel, to a number of degrees to rotate the needle
    // So 1700 will require a rotation value of -71deg and 17000 will require a rotation value or 71deg
    // This is all to put the needle in the correct location on the gauge.
    function convertRange(input_range, output_range, value)
    {
        var ir = input_range.max - input_range.min;
        var or = output_range.max - output_range.min;

        return ((value - input_range.min) * or / ir) + output_range.min;
    }

    function setRemoteWeight()
    {
        $.getJSON('/show_weight',setWeight);
    }

    function setRandomWeight()
    {
        // we do this bit of math trickery to get a random number between min and max
        var random = Math.floor(Math.random() * Math.floor(fuel_range.max - fuel_range.min)) + fuel_range.min;

        setWeight({
            result: 6375
        });
    }

    function setWeight(data)
    {
        var grams = data.result;

        $("#result").text(grams);
        
        var output_range = getNeedleRange(needle_range,grams);
        
        var degrees = convertRange(fuel_range,output_range,grams);

        degrees = calculateSkew(output_range,degrees);   
        
        $("#needle").css({
            transform: "rotate("+degrees+"deg)"
        });

        console.log({
            result: data.result,
            degrees
        });

        if( data.result > 300 ) {
           $("#alert").show();
        } else {
           $("#alert").hide();
        }
    }

    setInterval(setRandomWeight,1000);
});
