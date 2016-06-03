# Shopify Option Matrix
Use instead of Shopify option_selection.js to split product variants into a matrix of options.  API is built based off of Shopify.OptionSelectors for consistency of use.  This is still very much a work in progress but does have base functionality implemented.

Inspired by the difficulty of placing wholesale orders on a Shopify store.

__Before__  
![Before](https://raw.githubusercontent.com/stefbowerman/shopify-option-matrix/master/example-before.jpg "Before")

__After__  
![After](https://raw.githubusercontent.com/stefbowerman/shopify-option-matrix/master/example-after.jpg "After")

### Usage

Include the script on the product page.  Be sure to include it *after* Shopify's own option_selection.js as it is a dependency.

``` javascript
var matrix = new Shopify.OptionMatrix('productSelect', {
                    product: {{ product | json }}
                  });
```

See index.html for a full example of usage.  Since you can only add one variant per one request with the Shopify API, you must create a queue of variants that you want to add, submit them one by one, and then wait until the queue is cleared to update the cart.

### TODO

- Add a more robust form submit callback