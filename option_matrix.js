 // Used for sorting an array of possible sizes.  Depnding on in-stock quantities, shopify won't always return the sizes in the order you enter them
 var sizeOrder =  [
                    'xxxs', 'xxx-small', 'xxx-small (Wholesale)', 'xxx-small (Distro)', 'extra extra extra small', 'extra-extra-extra-small', 
                    'xxs', 'xx-small', 'xx-small (Wholesale)', 'xx-small (Distro)', 'extra extra small', 'extra-extra-small',
                    'xs', 'x-small', 'x-small (Wholesale)', 'x-small (Distro)', 'extra small', 'extra-small',
                    's', 'small', 'small (Wholesale)', 'small (Distro)',
                    'm', 'medium', 'medium (Wholesale)', 'medium (Distro)',
                    'l', 'large', 'large (Wholesale)', 'large (Distro)',
                    'xl', 'x-large', 'x-large (Wholesale)', 'x-large (Distro)', 'extra large', 'extra-large',
                    'xxl', 'xx-large', 'xx-large (Wholesale)', 'xx-large (Distro)', 'extra extra large', 'extra-extra-large',
                    'xxxl', 'xxx-large', 'xxx-large (Wholesale)', 'xxx-large (Distro)', 'extra extra extra large', 'extra-extra-extra-large'
                  ];

if ((typeof Shopify) === 'undefined') { Shopify = {}; }

/** 
 *  Built in the style of Shopify.OptionSelectors for consistency
 */

/**
 * @constructor
 *
 * @param t (String) - ID of select tag to overwrite
 * @param e (Object) - Object of config stuff.  Must have property `product` which is a JSON object created using {{ product | json }}
 *
 * @return Instance of Shopify.OptionMatrix OR false if constructor fails
 */

Shopify.OptionMatrix = function(t, e){
  this.product = new Shopify.Product(e.product);

  this.tableID    = 'option-matrix-table';
  this.tableClass = 'option-matrix-table';
  this.inputClass = 'variant-qty';

  this.matrixComponents = {
    axes : {
      primary   : this.getAxisOptionPrimary(),
      secondary : this.getAxisOptionSecondary()
    },
    rows : []
  };
  
  if(!this.isValidForMatrixBuild()){
    return false;
  }

  this.buildMatrixComponents();
  this.replaceSelector(t);

  window.dispatchEvent( new Event('OptionMatrix.initComplete') );

  return this;

},

Shopify.OptionMatrix.prototype.isValidForMatrixBuild = function(){
  return (this.product.options.length == 2);
},

Shopify.OptionMatrix.prototype.getAxisOptionByIndex = function(i){
  var values = this.product.optionValues(i);
  
  // Sort the values if the option is 'size'
  // So we can output them on the page in the correct order
  if(this.product.options[i] && this.product.options[i].toLowerCase() == 'size'){
    values.sort(function(a, b){
      return sizeOrder.indexOf(a.toLowerCase()) - sizeOrder.indexOf(b.toLowerCase());
    });
  }

  return {
    index: i,
    title: this.product.options[i],
    values: values
  }
},

Shopify.OptionMatrix.prototype.getAxisOptionPrimary = function(){
  return this.getAxisOptionByIndex(0);
},

Shopify.OptionMatrix.prototype.getAxisOptionSecondary = function(){
  return this.getAxisOptionByIndex(1);
},

Shopify.OptionMatrix.prototype.buildMatrixComponents = function(){
  var optionPrimary   = this.getAxisOptionPrimary();
  var productVariants = this.product.variants;

  // Dont use the backwards loop with [].push, need to maintain the order of these values
  for (var i = 0; i < optionPrimary.values.length; i++) { // red, green, blue
    var o = optionPrimary.values[i];
    var rowVariants = [];

    for (var j = productVariants.length - 1; j >= 0; j--) {
      var variant = productVariants[j];
      if(variant['option' + (optionPrimary.index + 1)] == o){
        rowVariants.push( variant );
      }
    };

    this.matrixComponents.rows.push({
      label: o,
      variants: rowVariants
    });

  };

  return this.matrixComponents;
}

Shopify.OptionMatrix.prototype.replaceSelector = function(t) {
    var e = document.getElementById(t)
      , o = e.parentNode;

    o.insertBefore(this.buildMatrix(), e);
    e.style.display = "none";
}

Shopify.OptionMatrix.prototype.buildMatrix = function(){
  var c = this.matrixComponents;

  var axisPrimary   = c.axes.primary;
  var axisSecondary = c.axes.secondary;

  var table    = document.createElement('table');
  var thead    = document.createElement('thead');
  var theadRow = document.createElement('tr');
  var tbody    = document.createElement('tbody');

  table.id        = this.tableID;
  table.className = this.tableClass;


  // Create an empty element for the top left corner of the table
  theadRow.appendChild( document.createElement('th') );
  // Then make the header of the table
  for (var m = 0; m < axisSecondary.values.length; m++) {
    var th = document.createElement('th');
    th.setAttribute('data-option1', axisSecondary.values[m]); // data-option1 because it is the SECONDARY AXIS
    th.innerHTML = axisSecondary.values[m];
    theadRow.appendChild(th);
  }
  thead.appendChild(theadRow);

  // Loop through all the rows of the table and build the HTML with input fields
  for (var i = axisPrimary.values.length - 1; i >= 0; i--) {

    var r = c.rows[i];
    var tbodyRow = document.createElement('tr');
    var tbodyRowLabel = document.createElement('th');

    // First column of the body row will be a label of what's in that row;
    tbodyRowLabel.setAttribute('data-option0', axisPrimary.values[i]);
    tbodyRowLabel.innerHTML = axisPrimary.values[i];
    tbodyRow.appendChild( tbodyRowLabel )

    // Can't use the backwards for loop because we want to output these in order
    for (var j = 0; j < axisSecondary.values.length; j++) { // [small, med, large]
      var v = axisSecondary.values[j];

      var td = document.createElement("td");
          td.setAttribute('data-option0', axisPrimary.values[i]);
          td.setAttribute('data-option1', v);

      var input = document.createElement("input");
          input.setAttribute("type", "number");
          input.className = this.inputClass;

      // Loop through all the variants inside the row and check if it exists for the value `j`
      var exists = !1;
      for (var k = r.variants.length - 1; k >= 0; k--) {
        var variant = r.variants[k];
        // If this variant exists for the value `j`, set exists to 'true' and add the variant ID to the dom so we can reference it in the formsubmitcallback
        if(variant['option'+(axisSecondary.index + 1)] == v){
          exists = true;
          input.setAttribute('data-variant-id', variant.id);
        }
      };

      if(!exists){ // console.log('variant not available for ' + axisSecondary.title + ' with value ' + v)
        input.setAttribute('disabled', 'disabled');
        input.setAttribute('title', 'Product Unavailable');
      }

      td.appendChild(input);
      tbodyRow.appendChild(td);
    };
    tbody.appendChild( tbodyRow );
  };
  
  table.appendChild(thead)
  table.appendChild(tbody);
  
  return table;

}