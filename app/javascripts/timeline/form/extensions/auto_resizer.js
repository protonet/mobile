/**
 * Auto resizing for the textarea
 * Automatically increases height of textarea when text overflows
 */
protonet.timeline.Form.extensions.AutoResizer = function(input, wrapper) {
  if (!protonet.user.Browser.SUPPORTS_EVENT("input")) {
    return;
  }
  
  var inputElement    = input[0],
      wrapperElement  = wrapper[0],
      originalHeight  = inputElement.offsetHeight,
      offset          = 10;
  
  function updateHeight() {
    inputElement.style.height = originalHeight.px();
    var scrollHeight = inputElement.scrollHeight;
    inputElement.style.height = "";
    
    if (scrollHeight <= originalHeight) {
      wrapperElement.style.height = originalHeight.px();
    } else {
      wrapperElement.style.height = (scrollHeight + offset).px();
    }
  };
  
  input
    .bind("input", updateHeight)
    .css("overflow", "hidden");
  
  protonet.bind("form.submitted", function() {
    // delay for performance reasons
    setTimeout(updateHeight, 100);
  });
};