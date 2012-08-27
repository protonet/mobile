protonet.text_extensions.render.codes = function(data) {
  var codes = $();
  
  $.each(data.code, function(i) {
    codes = codes.add(
      protonet.text_extensions.render.code({
        code:       data.code[i],
        codeTitle:  data.codeTitle[i],
        codeClass:  data.codeClass[i],
        codeLink:   data.codeLink[i]
      }, true)
    );
  });
  
  return codes;
};