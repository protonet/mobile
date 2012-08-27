/**
 * Generates a random number between min and max
 */
protonet.utils.getRandomNumberInRange = function(min, max) {
  return min + Math.round(Math.random() * (max - min));
};