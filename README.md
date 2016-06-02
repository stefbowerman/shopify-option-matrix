# Shopify Option Matrix
Use instead of Shopify option_selection.js to split product variants into a matrix of options.  API is built based off of Shopify.OptionSelectors for consistency of use.  This is still very much a work in progress but does have base functionality implemented.

Inspired by the difficulty of placing wholesale orders on a Shopify store.

__Before__  
![Before](https://raw.githubusercontent.com/stefbowerman/shopify-option-matrix/master/example-before.jpg "Before")

__After__  
![After](https://raw.githubusercontent.com/stefbowerman/shopify-option-matrix/master/example-after.jpg "After")

### Usage

``` liquid
// product.liquid
{{ 'option_matrix.js' | asset_url | script_tag }}
```

``` javascript
<script>
  // Make sure window.Shopify and window.Shopify.Product is defined
  var $form = $('form');
  var matrix = new Shopify.OptionMatrix('productSelect', {
                      product: {{ product | json }}
                    });

  // You can only add one variant per one request with the Shopify API
  // so we have to queue the variants and submit them one by one, and wait until the queue is cleared to update the cart
  $form.on('submit', function(e){
    e.preventDefault();
    onFormSubmit();
  });

  function handleRequestQueue(queue){
    if(queue.length){
      var obj = queue.shift();
      $.ajax({
        url: '/cart/add.js',
        type: 'POST',
        dataType: 'json',
        data: 'quantity=' + obj.quantity + '&id=' + obj.variantId
      })
      .always( function(){
        handleRequestQueue(queue);
      });
    }
    else {
      // Update the cart
      // or whatever you want
      // e.g. - document.location.href = '/cart';
    }
  };

  function onFormSubmit(){
    var requestQueue = [];
    var $qtyInputs = $form.find('input.variant-qty');

    // Create a queue of objects, one for each variant ID that has a quantity > 0
    for (var i = $qtyInputs.length - 1; i >= 0; i--) {
      var $input = $qtyInputs.eq(i);
      var qty = parseInt( $input.val() );
      if(!isNaN(qty) && qty != 0) {
        requestQueue.push({
          variantId : $input.data('variant-id'),
          quantity : qty
        });
      }
    };

    if( !requestQueue.length ){
      alert('Please select products before adding to cart');
      return false;
    }

    handleRequestQueue( requestQueue );
  };
</script>

```