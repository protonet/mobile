# expects a comma separated string with key names (keys=inet addr,inet6 addr)
# optional parameter "interface" to get only values for a specific interface (interface=ath1)
BEGIN {
  RS = ""
  split(keys, keys_array, ",")
  # this is the json builder
  # when no interface is given return an array of interfaces
  if (!interface) {
    # [
    output = "["
  }
  
}

function get(key) {
  where_is_key = index(record, key)
  if (where_is_key == 0) {
    return
  }
  
  substr_from_key = substr(record, where_is_key + length(key ":"))
  where_is_first_white_space = index(substr_from_key, " ")
  if (where_is_first_white_space == 1) {
    substr_from_key = substr(substr_from_key, 2)
    where_is_first_white_space = index(substr_from_key, " ")
  }
  value = substr(substr_from_key, 0, where_is_first_white_space - 1)
  return value
}

function getInterface() {
  return substr(record, 0, index(record, " ") - 1)
}

{
  record = $0
  current_interface = getInterface()
  if (interface && interface != current_interface) {
    next
  }
  # [ {
  output = output "{"
  
  # { "foo":
  output = output "\"" current_interface "\":"
  
  # { "foo": {
  output = output "{"
  for(key in keys_array) {
    # { "foo": { "key": "value"
    output = output "\"" keys_array[key] "\":" "\"" get(keys_array[key]) "\","
  }
  
  if(length(keys_array) != 0) {
    # remove trailing comma
    output = substr(output, 0, length(output) -1)    
  }
  
  # { "foo": { "key": "value" } }
  output = output "} }"
  
  if (!interface) {
    # ,
    output = output ","
  }
  
}

END {
  if (!interface) {
    output = substr(output, 0, length(output) -1)
        
    # ]
    output = output "]"
  }
  print output
}